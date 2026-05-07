import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'crypto'

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  requestChecksumCalculation: 'WHEN_REQUIRED',
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fileName, fileType } = body

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'Missing file data' }, { status: 400 })
    }

    const uniqueName = `${Date.now()}-${crypto.randomUUID()}-${fileName}`
    const key = `incoming/${uniqueName}`

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_VIDEO_INPUT_BUCKET!,
      Key: key,
      ContentType: fileType,
    })

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 })

    return NextResponse.json({
      uploadUrl,
      key,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Failed to create upload URL' },
      { status: 500 }
    )
  }
}