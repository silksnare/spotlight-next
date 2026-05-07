// src/app/api/media/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createVideoTranscodeJob } from '@/lib/aws/mediaconvert';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const inputS3Uri = body?.inputS3Uri;

		if (!inputS3Uri || typeof inputS3Uri !== 'string') {
			return NextResponse.json(
				{ error: 'inputS3Uri is required' },
				{ status: 400 }
			);
		}

		const result = await createVideoTranscodeJob({ inputS3Uri });

		return NextResponse.json({
			success: true,
			...result,
		});
	} catch (error) {
		console.error('MediaConvert submit error:', error);

		return NextResponse.json(
			{
				success: false,
				error: 'Failed to submit MediaConvert job',
			},
			{ status: 500 }
		);
	}
}