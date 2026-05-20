'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type PresignResponse = {
  uploadUrl: string
  key: string
}

type UploadStatusResponse = {
  hasSubmitted: boolean
  submission?: {
    id: string
    createdAt: string
    originalFileName: string
  } | null
}

export default function UploadSubmitClient() {
  const router = useRouter()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)
  const [uploadKey, setUploadKey] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isCheckingSubmission, setIsCheckingSubmission] = useState(true)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [existingSubmission, setExistingSubmission] =
    useState<UploadStatusResponse['submission']>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const checkPhase = async () => {
      try {
        const response = await fetch('/api/phases/upload-active', {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Failed to verify upload phase')
        }

        const data: { isActive: boolean } = await response.json()

        if (!data.isActive) {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error(error)
        router.push('/dashboard')
      }
    }

    checkPhase()
  }, [router])

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl)
    }
  }, [videoUrl])

  useEffect(() => {
    const loadUploadStatus = async () => {
      try {
        setIsCheckingSubmission(true)

        const response = await fetch('/api/upload/status', {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Failed to load upload status')
        }

        const data: UploadStatusResponse = await response.json()

        setHasSubmitted(data.hasSubmitted)
        setExistingSubmission(data.submission ?? null)
      } catch (error) {
        console.error(error)
        setErrorMessage('Could not verify upload status. Please refresh and try again.')
      } finally {
        setIsCheckingSubmission(false)
      }
    }

    loadUploadStatus()
  }, [])

  const isLocked = hasSubmitted || isCheckingSubmission || isUploading

  const handleChooseFile = () => {
    if (isLocked) return
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return

    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      setErrorMessage('Please select a valid video file.')
      return
    }

    if (videoUrl) URL.revokeObjectURL(videoUrl)

    const objectUrl = URL.createObjectURL(file)

    setSelectedFile(file)
    setVideoUrl(objectUrl)
    setUploadProgress(0)
    setIsUploading(false)
    setIsUploaded(false)
    setUploadKey(null)
    setErrorMessage(null)
  }

  const uploadFileToS3 = async (file: File): Promise<string> => {
    setIsUploading(true)
    setErrorMessage(null)
    setUploadProgress(0)
    setIsUploaded(false)
    setUploadKey(null)

    const presignResponse = await fetch('/api/upload/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
      }),
    })

    if (!presignResponse.ok) {
      setIsUploading(false)
      throw new Error('Failed to get upload URL')
    }

    const { uploadUrl, key }: PresignResponse = await presignResponse.json()

    return await new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', uploadUrl)
      xhr.setRequestHeader('Content-Type', file.type)

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return
        const percent = Math.round((event.loaded / event.total) * 100)
        setUploadProgress(percent)
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadKey(key)
          setUploadProgress(100)
          setIsUploading(false)
          setIsUploaded(true)
          resolve(key)
        } else {
          setIsUploading(false)
          setIsUploaded(false)
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      }

      xhr.onerror = () => {
        setIsUploading(false)
        setIsUploaded(false)
        reject(new Error('Network error during upload'))
      }

      xhr.send(file)
    })
  }

  const canSubmit =
    !!selectedFile &&
    !isUploading &&
    !hasSubmitted &&
    !isCheckingSubmission

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canSubmit || !selectedFile) return

    try {
      const key = await uploadFileToS3(selectedFile)

      const response = await fetch('/api/upload/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      })

      if (!response.ok) {
        throw new Error('Submit failed')
      }

      setHasSubmitted(true)
      setExistingSubmission({
        id: 'new',
        createdAt: new Date().toISOString(),
        originalFileName: selectedFile.name,
      })
      setShowSuccessModal(true)
    } catch (error) {
      console.error(error)
      setErrorMessage('Submit failed. Please try again.')
      setIsUploading(false)
      setIsUploaded(false)
    }
  }

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false)
    router.push('/dashboard')
  }

  return (
    <>
      <div className="page-container">
        {/*<h1 className="page-title">Video Upload</h1>*/}

        {hasSubmitted && !showSuccessModal && (
          <div className="mb-8 rounded border border-amber-300 bg-amber-50 px-6 py-5 text-amber-900">
            <p className="font-semibold">You have already uploaded your video.</p>
            <p className="mt-2">
              Per program rules, only one submission is allowed for each user.
              {existingSubmission?.originalFileName
                ? ` Submitted file: ${existingSubmission.originalFileName}.`
                : ''}
            </p>
          </div>
        )}

        {isCheckingSubmission && (
          <div className="mb-8 rounded border border-gray-200 bg-gray-50 px-6 py-5">
            Checking your submission status...
          </div>
        )}

        {/*<p className="mb-12 text-[16px] leading-[1.8] text-[#161624]">
          Don’t forget to download the <strong> <a href="https://actdevpprd.biworldwide.com/lexus/26MPI_Release.pdf" target="_blank" className="underline">Lexus Release Agreement</a></strong>. Any person who appears in the video submission either visually or by voice, or has aided in the recording, developing, or creating the video submission, must read, agree to, and sign it.
        </p>*/}

        <form onSubmit={handleSubmit} className="w-full">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            {/* LEFT PANEL */}
            <section className="overflow-hidden rounded-[28px] border border-[#ece8f4] bg-white shadow-[0_18px_60px_rgba(17,19,34,0.06)]">
              <div className="border-b border-[#ece8f4] px-8 py-6">
                <div className="text-[12px] font-bold uppercase tracking-[0.28em] text-[#8f5cff]">
                  Submission Instructions
                </div>

                <h2 className="mt-2 text-[28px] font-extrabold tracking-[-0.03em] text-[#111322]">
                  Upload Your Video
                </h2>
              </div>

              <div className="space-y-8 px-8 py-8">
                <div className="rounded-2xl border border-[#ece8f4] bg-[#faf9ff] p-6">
                  <p className="text-[15px] leading-[1.8] text-[#4f5565]">
                    Don’t forget to download the{' '}
                    <a
                      href="https://actdevpprd.biworldwide.com/lexus/26MPI_Release.pdf"
                      target="_blank"
                      className="font-bold text-[#7f56ff] underline underline-offset-4"
                    >
                      Participant Release Agreement
                    </a>
                    . Any individual appearing in the submission, visually or by voice,
                    should review and sign the agreement prior to submission.
                  </p>
                </div>

                <ol className="space-y-5">
                  {[
                    'Record or select your finalized video file and ensure it is available on your device.',
                    'Select “Choose File” and pick your video submission.',
                    'Preview your video before selecting Submit. Upload times may vary depending on file size and internet speed.',
                  ].map((step, index) => (
                    <li key={index} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ff6a13_0%,#f7c948_100%)] text-[15px] font-extrabold text-white shadow-lg">
                        {index + 1}
                      </div>

                      <div className="pt-1 text-[16px] leading-[1.75] text-[#161624]">
                        {step}
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5">
                  <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.2em] text-amber-700">
                    Important Notice
                  </div>

                  <p className="text-[15px] leading-[1.75] text-amber-900">
                    Videos containing copyrighted materials, including music,
                    may be disqualified.
                  </p>
                </div>

                {/* FILE PICKER */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    disabled={isLocked}
                    className="hidden"
                  />

                  <div className="flex flex-col gap-4 md:flex-row">
                    <button
                      type="button"
                      onClick={handleChooseFile}
                      disabled={isLocked}
                      className={`inline-flex h-[58px] items-center justify-center rounded-2xl px-8 text-[14px] font-extrabold uppercase tracking-[0.12em] transition ${
                        isLocked
                          ? 'cursor-not-allowed bg-[#d7dbe4] text-[#7f8595]'
                          : 'bg-[linear-gradient(135deg,#111322_0%,#27293a_100%)] text-white shadow-[0_16px_36px_rgba(17,19,34,0.25)] hover:translate-y-[-1px]'
                      }`}
                    >
                      Choose File
                    </button>

                    <div className="flex min-h-[58px] flex-1 items-center rounded-2xl border border-[#d9dcea] bg-[#fafbff] px-5 text-[15px] text-[#5f6475]">
                      {selectedFile ? selectedFile.name : 'No file selected'}
                    </div>
                  </div>
                </div>

                {/* PROGRESS */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-[14px] font-bold uppercase tracking-[0.12em] text-[#161624]">
                      Upload Status
                    </label>

                    <span className="text-[14px] font-semibold text-[#7f56ff]">
                      {uploadProgress}%
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-[#e8eaf2]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#7f56ff_0%,#ff6a13_100%)] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>

                  <div className="mt-4 text-[15px] text-[#5f6475]">
                    {!selectedFile && !hasSubmitted && <span>No upload started.</span>}

                    {selectedFile &&
                      !isUploading &&
                      !isUploaded &&
                      !errorMessage &&
                      !hasSubmitted && <span>Ready to upload.</span>}

                    {isUploading && (
                      <span className="font-semibold text-[#7f56ff]">
                        Uploading... {uploadProgress}%
                      </span>
                    )}

                    {!isUploading && isUploaded && !hasSubmitted && (
                      <span className="font-semibold text-green-600">
                        Upload complete.
                      </span>
                    )}

                    {hasSubmitted && (
                      <span className="font-semibold text-[#111322]">
                        Submission already received.
                      </span>
                    )}

                    {!isUploading && errorMessage && (
                      <span className="font-semibold text-red-600">
                        {errorMessage}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* RIGHT PANEL */}
            <section className="flex flex-col overflow-hidden rounded-[28px] border border-[#ece8f4] bg-white shadow-[0_18px_60px_rgba(17,19,34,0.06)]">
              <div className="border-b border-[#ece8f4] px-8 py-6">
                <div className="text-[12px] font-bold uppercase tracking-[0.28em] text-[#ff6a13]">
                  Preview
                </div>

                <h2 className="mt-2 text-[28px] font-extrabold tracking-[-0.03em] text-[#111322]">
                  Video Preview
                </h2>
              </div>

              <div className="flex flex-1 flex-col px-8 py-8">
                <div className="aspect-video overflow-hidden rounded-[24px] border border-[#ece8f4] bg-[#f5f6fb] shadow-inner">
                  {videoUrl ? (
                    <video
                      src={videoUrl}
                      controls
                      className="h-full w-full bg-black object-contain"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="mb-4 text-[54px] opacity-20">▶</div>

                      <div className="text-[18px] font-bold text-[#7a8091]">
                        {hasSubmitted
                          ? 'Uploads Locked'
                          : 'No Video Selected'}
                      </div>

                      <div className="mt-2 max-w-[280px] text-[14px] leading-[1.7] text-[#9aa0af]">
                        Choose a video file to preview your submission before uploading.
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`inline-flex h-[64px] items-center justify-center rounded-2xl px-10 text-[15px] font-extrabold uppercase tracking-[0.16em] transition ${
                      canSubmit
                        ? 'bg-[linear-gradient(135deg,#ff6a13_0%,#f7c948_100%)] text-white shadow-[0_18px_40px_rgba(255,140,32,0.35)] hover:translate-y-[-1px]'
                        : 'cursor-not-allowed bg-[#c9ced6] text-white'
                    }`}
                  >
                    {isUploading ? 'Uploading...' : 'Submit Video'}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </form>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md bg-white p-8 shadow-2xl">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Upload Successful
              </h2>
            </div>

            <p className="text-[16px] leading-[1.8] text-[#161624]">
              Your video has been uploaded successfully. Thank you for participating. 
            </p>

            {existingSubmission?.originalFileName && (
              <p className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-[16px] text-gray-700">
                Submitted file:{' '}
                <span className="font-semibold">
                  {existingSubmission.originalFileName}
                </span>
              </p>
            )}

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={handleSuccessConfirm}
                className="bg-black px-6 py-3 font-semibold text-white hover:bg-black-600"
              >
                Return home
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}