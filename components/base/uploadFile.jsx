'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"
import { XIcon } from "lucide-react"

export function UploadFile({className, onFileChange}) {
  const [file, setFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (event) => {
    const selectedFile = event?.target?.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  useEffect(() => {
    onFileChange(file)
  }, [file, onFileChange])

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={
        cn(
          "flex items-start",
          className
        )
    }>
      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
    <Paperclip className="w-5 h-5 mr-2 cursor-pointer" onClick={handleButtonClick}/>
      {file && (
        <div className="flex text-sm text-gray-500 dark:text-gray-400">
          <span>{file?.name}</span>
            <button
                className="text-blue-500 dark:text-blue-400"
                onClick={() => setFile(null)}
            >
                <XIcon />
            </button>
        </div>
      )}
    </div>
  )
}

