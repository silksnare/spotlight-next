'use client'

import { useState, useRef } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function VideoUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file)

      // Create object URL for video preview
      const url = URL.createObjectURL(file)
      setVideoUrl(url)

      // Simulate upload progress
      simulateUpload()
    }
  }

  const simulateUpload = () => {
    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleChooseFile = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFile && uploadProgress === 100) {
      alert('Video submitted successfully!')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Page Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-8">
          <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Video Upload
          </span>
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Instructions */}
            <div>
              <p className="text-gray-700 leading-relaxed mb-6">
                Tnow or as rest que sapicimolut velis experciet, sumet awn wdel
                ium sawweni ditisquae repe ventasditisquae repe ve reast que sa
                wpi ciolut velis experc iet, su met and molut velis experciet, smet
                andel ium seni ditisquw wae repe veditisquae repe veciole sapici
              </p>

              <ol className="list-none space-y-4 mb-6 text-gray-700">
                <li className="flex">
                  <span className="font-bold mr-2">1.</span>
                  <span>
                    Record your sumet andel ium seni ditisquae rewepe
                    ven tas reast que sapi ciolut velis experc iet, su met
                    andm olut vvelis experc iet, su met andmolut vewelis
                    experciet, smet ande
                  </span>
                </li>
                <li className="flex">
                  <span className="font-bold mr-2">2.</span>
                  <span>
                    Select "Choose File" pe ventas reast que sapwei cio
                    lut velis experc iet, su met andmolut vvelis experc
                  </span>
                </li>
                <li className="flex">
                  <span className="font-bold mr-2">3.</span>
                  <span>
                    Click "Upload Video." Nowe seni ditisquae repewae
                    ven tas rest que sapiciole sapicipi ciolut velis experc
                    iet, su met andmolut vis eut velis.
                  </span>
                </li>
              </ol>

              <p className="text-gray-700 mb-8">
                <span className="font-bold">NOTICE:</span> ndmolut velis experciet, smet andel iasdaw weawdel ium
                seni ditis quawe awah eseni ditis quae rest que sapicim.
              </p>

              {/* File Input */}
              <div className="mb-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="video/*"
                  className="hidden"
                />
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleChooseFile}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold py-3 px-6 rounded uppercase tracking-wide transition-colors"
                  >
                    Choose File
                  </button>
                  <div className="flex-1 border border-gray-300 rounded py-3 px-4 bg-white min-h-[48px] flex items-center">
                    <span className="text-gray-600 truncate">
                      {selectedFile ? selectedFile.name : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
                  Upload Video:
                </label>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                {isUploading && (
                  <p className="text-sm text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
                )}
                {uploadProgress === 100 && !isUploading && (
                  <p className="text-sm text-green-600 mt-1">Upload complete!</p>
                )}
              </div>
            </div>

            {/* Right Column - Video Preview */}
            <div>
              <fieldset className="border border-gray-300 rounded-lg p-4">
                <legend className="text-sm font-bold text-gray-900 uppercase tracking-wide px-2">
                  Video Preview
                </legend>

                <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                  {videoUrl ? (
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full object-contain bg-black"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">No video selected</p>
                      </div>
                    </div>
                  )}
                </div>
              </fieldset>

              {/* Submit Button */}
              <div className="flex justify-end mt-8">
                <button
                  type="submit"
                  disabled={!selectedFile || uploadProgress < 100}
                  className={`px-12 py-4 rounded-lg text-white font-semibold uppercase tracking-wider text-lg transition-all ${
                    selectedFile && uploadProgress === 100
                      ? 'bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 shadow-lg hover:shadow-xl cursor-pointer'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}
