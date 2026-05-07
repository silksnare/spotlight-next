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
        <h1 className="page-title">Video Upload</h1>

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

        <p className="mb-12 text-[16px] leading-[1.8] text-[#161624]">
          Don’t forget to download the <strong> <a href="https://actdevpprd.biworldwide.com/lexus/26MPI_Release.pdf" target="_blank" className="underline">Lexus Release Agreement</a></strong>. Any person who appears in the video submission either visually or by voice, or has aided in the recording, developing, or creating the video submission, must read, agree to, and sign it.
        </p>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
            <section className="w-full">
              <ol className="mb-10 space-y-4 text-[16px] leading-[1.8] text-[#161624] list-decimal pl-10">
                <li>
                  Select (or record) your Lexus MPI video and confirm the final video file is saved and available on your device.
                </li>
                <li>
                  Select <strong>Choose File</strong> and then select your video.
                </li>
                <li>
                  Once you have previewed your video, select the <strong>Submit</strong> button. You will receive a confirmation message once your video has uploaded successfully. Be patient. Upload times will vary, depending on the size of your video, the speed of your internet connection, etc.

                </li>
              </ol>

              <p className="mb-12 text-[16px] leading-[1.8] text-[#161624]">
                NOTICE: Videos containing any copyrighted materials (including music) will be disqualified.
              </p>

              <div className="mb-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  disabled={isLocked}
                  className="hidden"
                />

                <div className="flex flex-col gap-3 md:flex-row">
                  <button
                    type="button"
                    onClick={handleChooseFile}
                    disabled={isLocked}
                    className={`min-h-[48px] px-8 py-3 text-[16px] font-semibold ${
                      isLocked
                        ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                        : 'bg-black text-white'
                    }`}
                  >
                    Choose File
                  </button>

                  <div className="flex min-h-[48px] flex-1 items-center rounded border border-slate-300 px-4 py-3 text-[16px] text-gray-600">
                    {selectedFile ? selectedFile.name : 'No file selected'}
                  </div>
                </div>
              </div>

              <div className="w-full">
                <label className="mb-3 block text-[16px] font-semibold text-[#161624]">
                  Upload Status
                </label>

                <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-brand-700 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>

                <div className="mt-3 text-[16px] leading-[1.8] text-[#161624]">
                  {!selectedFile && !hasSubmitted && <span>No upload started.</span>}
                  {selectedFile && !isUploading && !isUploaded && !errorMessage && !hasSubmitted && (
                    <span>Ready to upload.</span>
                  )}
                  {isUploading && <span>Uploading... {uploadProgress}%</span>}
                  {!isUploading && isUploaded && !hasSubmitted && <span>Upload complete.</span>}
                  {hasSubmitted && <span>Submission already received.</span>}
                  {!isUploading && errorMessage && (
                    <span className="text-red-600">{errorMessage}</span>
                  )}
                </div>
              </div>
            </section>

            <section className="w-full">
              <div className="w-full lg:ml-auto">
                <fieldset className="border border-slate-200 p-4">
                  <legend className="px-2 text-[16px] font-semibold text-[#161624]">
                    Video Preview
                  </legend>

                  <div className="aspect-video w-full overflow-hidden rounded bg-gray-100">
                    {videoUrl ? (
                      <video
                        src={videoUrl}
                        controls
                        className="h-full w-full bg-black object-contain"
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="flex h-full items-center justify-center text-[16px] text-gray-400">
                        {hasSubmitted ? 'Video uploads are locked for this user' : 'No video selected'}
                      </div>
                    )}
                  </div>
                </fieldset>

                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`px-10 py-4 text-[24px] font-extrabold uppercase tracking-[0.04em] text-white ${
                      canSubmit
                        ? 'bg-[linear-gradient(90deg,#171723_0%,#231b1b_100%)] hover:opacity-95'
                        : 'cursor-not-allowed bg-[#c9ced6]'
                    }`}
                  >
                    {isUploading ? 'Uploading...' : 'Submit'}
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