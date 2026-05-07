import { NextResponse } from 'next/server';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { prisma } from '@/lib/prisma';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

const processedBucket =
  process.env.AWS_VIDEO_OUTPUT_BUCKET ||
  process.env.AWS_PROCESSED_BUCKET_NAME;

export async function GET() {
  try {
    if (!processedBucket) {
      return NextResponse.json(
        { success: false, error: 'Processed bucket is not configured' },
        { status: 500 }
      );
    }

    const videos = await prisma.videoSubmission.findMany({
      where: {
        isQualified: null,
        processedS3Key: {
          not: null,
        },
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const videosWithUrls = await Promise.all(
      videos.map(async (video) => {
        let videoUrl: string | null = null;

        if (video.processedS3Key) {
          videoUrl = await getSignedUrl(
            s3,
            new GetObjectCommand({
              Bucket: processedBucket,
              Key: video.processedS3Key,
            }),
            { expiresIn: 900 }
          );
        }

        return {
          id: video.id,
          userId: video.userId,
          email: video.user?.email ?? null,
          originalFileName: video.originalFileName,
          storedFileName: video.storedFileName,
          processedS3Key: video.processedS3Key,
          uploadStatus: video.uploadStatus,
          processingStatus: video.processingStatus,
          mediaConvertJobId: video.mediaConvertJobId,
          isQualified: video.isQualified,
          qualifiedAt: video.qualifiedAt,
          qualifiedBy: video.qualifiedBy,
          createdAt: video.createdAt,
          updatedAt: video.updatedAt,
          videoUrl,
        };
      })
    );

    return NextResponse.json({ success: true, videos: videosWithUrls });
  } catch (error) {
    console.error('QUALIFY_FETCH_ERROR', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}