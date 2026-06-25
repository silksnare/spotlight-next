const { PrismaClient } = require('@prisma/client');
const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require('@aws-sdk/client-bedrock-runtime');

const prisma = new PrismaClient();

async function main() {
  const region = process.env.AWS_REGION || 'us-east-1';
  const modelId =
    process.env.AWS_BEDROCK_PEGASUS_MODEL_ID || 'twelvelabs.pegasus-1-2-v1:0';

  const aiScore = await prisma.aiJudgeScore.findFirst({
    where: {
      status: 'video_loaded',
    },
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      videoSubmission: true,
    },
  });

  if (!aiScore) {
    throw new Error('No AI judging record found with status video_loaded.');
  }

  const submission = aiScore.videoSubmission;

  if (!submission?.processedS3Key) {
    throw new Error('Video submission is missing processedS3Key.');
  }

  const bucket = process.env.AWS_VIDEO_OUTPUT_BUCKET;
  const bucketOwner = process.env.AWS_ACCOUNT_ID;

  if (!bucketOwner) {
    throw new Error("Missing AWS_ACCOUNT_ID");
  }

  if (!bucket) {
    throw new Error('Missing AWS_VIDEO_OUTPUT_BUCKET.');
  }

  const videoS3Uri = `s3://${bucket}/${submission.processedS3Key}`;

  const client = new BedrockRuntimeClient({ region });

  const body = {
    inputPrompt:
      'Create a detailed textual storyboard of this vehicle inspection video. Describe the sequence of scenes, what is shown visually, what the speaker explains, any measurements or recommendations mentioned, and any evidence shown on camera.',
    mediaSource: {
      s3Location: {
        uri: videoS3Uri,
        bucketOwner,
      },
    },
    temperature: 0.2,
    maxOutputTokens: 4096,
  };

  console.log('Invoking Pegasus with:', {
    modelId,
    videoS3Uri,
    aiJudgeScoreId: aiScore.id,
    submissionId: submission.id,
  });

  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(body),
  });

  const response = await client.send(command);
  const responseText = Buffer.from(response.body).toString('utf8');
  const parsed = JSON.parse(responseText);

  console.log('\n--- PEGASUS RAW RESPONSE ---\n');
  console.log(JSON.stringify(parsed, null, 2));

  console.log('\n--- PEGASUS MESSAGE ---\n');
  console.log(parsed.message || '(No message returned)');
}

main()
  .catch((error) => {
    console.error('Pegasus test failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });