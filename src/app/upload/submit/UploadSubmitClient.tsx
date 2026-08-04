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
  const [showOverwriteModal, setShowOverwriteModal] = useState(false)
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

        if (!response.ok) throw new Error('Failed to verify upload phase')

        const data: { isActive: boolean } = await response.json()

        if (!data.isActive) router.push('/dashboard')
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

        if (!response.ok) throw new Error('Failed to load upload status')

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

  const isLocked = isCheckingSubmission || isUploading

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

    setSelectedFile(file)
    setVideoUrl(URL.createObjectURL(file))
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
        setUploadProgress(Math.round((event.loaded / event.total) * 100))
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

  const canSubmit = !!selectedFile && !isUploading && !isCheckingSubmission

  const submitSelectedFile = async () => {
    if (!selectedFile) return

    try {
      const key = await uploadFileToS3(selectedFile)

      const response = await fetch('/api/upload/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      })

      if (!response.ok) throw new Error('Submit failed')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canSubmit || !selectedFile) return

    if (hasSubmitted) {
      setShowOverwriteModal(true)
      return
    }

    await submitSelectedFile()
  }

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false)
    router.push('/dashboard')
  }

  return (
    <>
      <main className="bg-[#f4f4f4]">
        <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
          {hasSubmitted && !showSuccessModal ? (
            <div className="mb-8 border border-[#d6d6d6] bg-white px-6 py-5 text-[#231f24]">
              <p className="font-bold">You have already uploaded a video.</p>
              <p className="mt-2 text-[15px] leading-6">
                You may submit a replacement during the upload period. Only your
                latest uploaded video will be judged.
                {existingSubmission?.originalFileName
                  ? ` Current file: ${existingSubmission.originalFileName}.`
                  : ''}
              </p>
            </div>
          ) : null}

          {isCheckingSubmission ? (
            <div className="mb-8 border border-[#d6d6d6] bg-white px-6 py-5 text-[#231f24]">
              Checking your submission status...
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="w-full">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <section className="border border-[#d6d6d6] bg-white">
                <div className="border-b border-[#d6d6d6] px-6 py-6 sm:px-8">
                  <p className="font-[family:var(--font-cadillac)] text-[12px] font-bold uppercase tracking-[0.45em] text-[#231f24]">
                    Submission Instructions
                  </p>

                  <h1 className="mt-3 font-[family:var(--font-cadillac)] text-[26px] font-bold uppercase tracking-[0.16em] text-[#231f24] sm:text-[34px]">
                    Upload Your Video
                  </h1>
                </div>

                <div className="space-y-8 px-6 py-8 sm:px-8">
                  <div className="border border-[#d6d6d6] bg-[#f4f4f4] p-5">
                    <p className="text-[15px] leading-7 text-[#111111]">
                      Eligible video submissions can only feature one individual
                      Sales Consultant. You may submit a video as many times as you
                      wish, but only your latest version will be judged.
                    </p>
                  </div>

                  <ol className="space-y-5">
                    {[
                      <>
                        Record your Conquest Challenge video and confirm the final video file is saved and available on your device.
                      </>,
                      <>
                        Select <strong>Choose File</strong> and then select your video. The file name will appear in the selection bar, and a Preview will appear in the video window. Preview the video to ensure it is the correct file and that it plays all the way through.
                      </>,
                      <>
                        Once you have previewed your video, select the <strong>Submit</strong> button. You will receive a confirmation message once your video has uploaded successfully. Upload times may vary, depending on the size of your video, the speed of your internet connection, etc.
                      </>,
                    ].map((step, index) => (
                      <li key={index} className="flex gap-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center self-center bg-[#231f24] font-[family:var(--font-cadillac)] text-[14px] font-bold text-white">
                          {index + 1}
                        </div>

                        <p className="pt-1 text-[15px] leading-7 text-[#111111]">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>

                  <div className="border border-[#231f24] bg-white px-5 py-4">
                    <p className="font-[family:var(--font-cadillac)] text-[12px] font-bold uppercase tracking-[0.28em] text-[#231f24]">
                      Important Notice
                    </p>

                    <p className="mt-3 text-[15px] leading-7 text-[#111111]">
                      Videos containing copyrighted materials (including music) will be disqualified.
                    </p>
                  </div>

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
                        className={`inline-flex h-[54px] items-center justify-center px-8 font-[family:var(--font-cadillac)] text-[13px] font-bold uppercase tracking-[0.2em] transition ${
                          isLocked
                            ? 'cursor-not-allowed bg-[#c9c9c9] text-white'
                            : 'bg-[#231f24] text-white hover:bg-black'
                        }`}
                      >
                        Choose File
                      </button>

                      <div className="flex min-h-[54px] flex-1 items-center border border-[#d6d6d6] bg-white px-5 text-[15px] text-[#111111]">
                        {selectedFile ? selectedFile.name : 'No file selected'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label className="font-[family:var(--font-cadillac)] text-[12px] font-bold uppercase tracking-[0.24em] text-[#231f24]">
                        Upload Status
                      </label>

                      <span className="text-[14px] font-bold text-[#231f24]">
                        {uploadProgress}%
                      </span>
                    </div>

                    <div className="h-2 bg-[#d6d6d6]">
                      <div
                        className="h-full bg-[#231f24] transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>

                    <div className="mt-4 text-[15px] text-[#111111]">
                      {!selectedFile && !hasSubmitted ? (
                        <span>No upload started.</span>
                      ) : null}

                      {!selectedFile && hasSubmitted ? (
                        <span className="font-bold">
                          Existing submission received. Choose a new file to replace it.
                        </span>
                      ) : null}

                      {selectedFile &&
                      !isUploading &&
                      !isUploaded &&
                      !errorMessage ? (
                        <span>
                          {hasSubmitted
                            ? 'Ready to replace your existing submission.'
                            : 'Ready to upload.'}
                        </span>
                      ) : null}

                      {isUploading ? (
                        <span className="font-bold">Uploading... {uploadProgress}%</span>
                      ) : null}

                      {!isUploading && isUploaded ? (
                        <span className="font-bold">Upload complete.</span>
                      ) : null}

                      {!isUploading && errorMessage ? (
                        <span className="font-bold text-red-700">{errorMessage}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </section>

              <section className="flex flex-col border border-[#d6d6d6] bg-white">
                <div className="border-b border-[#d6d6d6] px-6 py-6 sm:px-8">
                  <p className="font-[family:var(--font-cadillac)] text-[12px] font-bold uppercase tracking-[0.45em] text-[#231f24]">
                    Preview
                  </p>

                  <h2 className="mt-3 font-[family:var(--font-cadillac)] text-[26px] font-bold uppercase tracking-[0.16em] text-[#231f24] sm:text-[34px]">
                    Video Preview
                  </h2>
                </div>

                <div className="flex flex-1 flex-col px-6 py-8 sm:px-8">
                  <div className="aspect-video overflow-hidden border border-[#d6d6d6] bg-[#f4f4f4]">
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
                        <div className="mb-4 text-[48px] text-[#b4b4b4]">▶</div>

                        <div className="font-[family:var(--font-cadillac)] text-[18px] font-bold uppercase tracking-[0.12em] text-[#231f24]">
                          No Video Selected
                        </div>

                        <p className="mt-3 max-w-[280px] text-[14px] leading-6 text-[#555555]">
                          Choose a video file to preview your submission before uploading.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className={`inline-flex h-[54px] items-center justify-center px-9 font-[family:var(--font-cadillac)] text-[13px] font-bold uppercase tracking-[0.2em] transition ${
                        canSubmit
                          ? 'bg-[#231f24] text-white hover:bg-black'
                          : 'cursor-not-allowed bg-[#c9c9c9] text-white'
                      }`}
                    >
                      {isUploading
                        ? 'Uploading...'
                        : hasSubmitted
                          ? 'Replace Video'
                          : 'Submit Video'}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </form>
        </div>
      </main>

      {showOverwriteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md bg-white p-8">
            <h2 className="font-[family:var(--font-cadillac)] text-[24px] font-bold uppercase tracking-[0.16em] text-[#231f24]">
              Replace Submission?
            </h2>

            <p className="mt-5 text-[15px] leading-7 text-[#111111]">
              You already have a video submission on file. Continuing will
              overwrite your current submission, and only your latest upload will
              be evaluated.
            </p>

            {existingSubmission?.originalFileName ? (
              <p className="mt-5 bg-[#f4f4f4] px-4 py-3 text-[14px] text-[#111111]">
                Current file:{' '}
                <span className="font-bold">
                  {existingSubmission.originalFileName}
                </span>
              </p>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowOverwriteModal(false)}
                className="border border-[#231f24] px-6 py-3 font-[family:var(--font-cadillac)] text-[12px] font-bold uppercase tracking-[0.18em] text-[#231f24]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={async () => {
                  setShowOverwriteModal(false)
                  await submitSelectedFile()
                }}
                className="bg-[#231f24] px-6 py-3 font-[family:var(--font-cadillac)] text-[12px] font-bold uppercase tracking-[0.18em] text-white hover:bg-black"
              >
                Replace Video
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showSuccessModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md bg-white p-8">
            <h2 className="font-[family:var(--font-cadillac)] text-[24px] font-bold uppercase tracking-[0.16em] text-[#231f24]">
              Upload Successful
            </h2>

            <p className="mt-5 text-[15px] leading-7 text-[#111111]">
              Your video has been uploaded successfully. Thank you for participating.
            </p>

            {existingSubmission?.originalFileName ? (
              <p className="mt-5 bg-[#f4f4f4] px-4 py-3 text-[14px] text-[#111111]">
                Submitted file:{' '}
                <span className="font-bold">
                  {existingSubmission.originalFileName}
                </span>
              </p>
            ) : null}

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={handleSuccessConfirm}
                className="bg-[#231f24] px-6 py-3 font-[family:var(--font-cadillac)] text-[12px] font-bold uppercase tracking-[0.18em] text-white hover:bg-black"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}