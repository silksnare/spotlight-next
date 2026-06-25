const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function joinUrl(base, key) {
  return `${base.replace(/\/$/, '')}/${key.replace(/^\//, '')}`;
}

async function main() {
  const aiScore = await prisma.aiJudgeScore.findFirst({
    where: { status: 'pending' },
    orderBy: { createdAt: 'desc' },
    include: {
      videoSubmission: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!aiScore) {
    console.log('No pending AI judging records found.');
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_VIDEO_BASE_URL;

  if (!baseUrl) {
    throw new Error('Missing NEXT_PUBLIC_VIDEO_BASE_URL');
  }

  const submission = aiScore.videoSubmission;

  if (!submission?.processedS3Key) {
    throw new Error(`Submission ${submission?.id} does not have a processedS3Key`);
  }

  const videoUrl = joinUrl(baseUrl, submission.processedS3Key);

  console.log({
    aiJudgeScoreId: aiScore.id,
    submissionId: submission.id,
    user: submission.user?.email,
    processedS3Key: submission.processedS3Key,
    videoUrl,
  });

  await prisma.aiJudgeScore.update({
    where: { id: aiScore.id },
    data: {
      status: 'video_loaded',
      rawResponse: {
        step: 'video_url_built',
        videoUrl,
      },
    },
  });

  console.log('AI judging test record updated to video_loaded.');
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });