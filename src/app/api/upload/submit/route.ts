import { NextRequest, NextResponse } from 'next/server'

import { createVideoTranscodeJob } from '@/lib/aws/mediaconvert'
import { getCurrentSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession()

    console.log('UPLOAD SUBMIT SESSION:', JSON.stringify(session, null, 2))

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { key } = body

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: 'Missing key' }, { status: 400 })
    }

    const bucket = process.env.AWS_VIDEO_INPUT_BUCKET
    if (!bucket) {
      return NextResponse.json(
        { error: 'AWS_VIDEO_INPUT_BUCKET is not configured' },
        { status: 500 }
      )
    }

    const inputS3Uri = `s3://${bucket}/${key}`

    const mediaResult = await createVideoTranscodeJob({ inputS3Uri })

    const jobId = mediaResult.jobId

    const fileName = key.split('/').pop() ?? key
    const lastDotIndex = fileName.lastIndexOf('.')
    const baseName =
      lastDotIndex >= 0 ? fileName.slice(0, lastDotIndex) : fileName
    const processedS3Key = `videos/${baseName}_processed.mp4`

    await prisma.videoSubmission.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        originalFileName: fileName,
        storedFileName: fileName,
        rawS3Key: key,
        uploadStatus: 'uploaded',
        processingStatus: 'submitted',
        mediaConvertJobId: jobId,
        processedS3Key,
        homeArea: session.user.homeArea ?? null,
        district: session.user.district ?? null,
      },
      create: {
        userId: session.user.id,
        originalFileName: fileName,
        storedFileName: fileName,
        rawS3Key: key,
        uploadStatus: 'uploaded',
        processingStatus: 'submitted',
        mediaConvertJobId: jobId,
        processedS3Key,
        homeArea: session.user.homeArea ?? null,
        district: session.user.district ?? null,
      },
    })

    return NextResponse.json({
      success: true,
      key,
      inputS3Uri,
      mediaConvert: mediaResult,
    })
  } catch (err) {
    console.error('Upload submit error:', err)
    return NextResponse.json(
      { error: 'Failed to submit video' },
      { status: 500 }
    )
  }
}