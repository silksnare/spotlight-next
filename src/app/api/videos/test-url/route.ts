import { NextResponse } from 'next/server';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const REGION = process.env.AWS_REGION || 'us-east-1';
const BUCKET = 'spotlight-stage-processed-533267160660-us-east-1-an';
const KEY = 'videos/video-demo_processed.mp4';

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function GET() {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: KEY,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 900 });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Failed to create signed video URL', error);

    return NextResponse.json(
      { error: 'Failed to create signed video URL' },
      { status: 500 }
    );
  }
}