import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { prisma } from '@/lib/prisma';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

type RegionStat = {
  region: string;
  total: number;
  qualified: number;
  disqualified: number;
  pending: number;
  qualificationRate: number;
  shareOfTotal: number;
};

type DailyUploadStat = {
  date: string;
  uploads: number;
  qualified: number;
  disqualified: number;
  pending: number;
};

export type AdminVideoItem = {
  id: string;
  createdAt: string;
  originalFileName: string;
  uploadStatus: string;
  processingStatus: string;
  processedS3Key: string | null;
  rawS3Key: string;
  isQualified: boolean | null;
  homeArea: number | null;
  videoUrl: string | null;
  disqualificationReasons: string[];
  disqualificationOther: string | null;
  disqualifiedAt: string | null;
  disqualifiedBy: string | null;
  user: {
    displayName: string;
    firstName: string;
    lastName: string;
    email: string;
    homeArea: number | null;
  };
};

export type AdminDashboardData = {
  lastUpdated: string;
  activePhase: {
    key: string;
    label: string;
    startsAt: string | null;
    endsAt: string | null;
  } | null;
  overview: {
    totalSubmissions: number;
    totalQualified: number;
    totalDisqualified: number;
    pendingQualification: number;
    distinctRegions: number;
    uploadsToday: number;
    uploadsLast7Days: number;
    qualificationRate: number;
    processingCompleted: number;
  };
  regionStats: RegionStat[];
  dailyUploadStats: DailyUploadStat[];
  videos: AdminVideoItem[];
};

function toDateKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function areaLabel(value: number | null | undefined): string {
  if (typeof value === 'number') return `Area ${value}`;
  return 'Unknown';
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setUTCHours(0, 0, 0, 0);

  const startOfWindow = new Date(startOfToday);
  startOfWindow.setUTCDate(startOfWindow.getUTCDate() - 29);

  const startOfLast7Days = new Date(startOfToday);
  startOfLast7Days.setUTCDate(startOfLast7Days.getUTCDate() - 6);

  const [activePhase, submissions, videos] = await Promise.all([
    prisma.phase.findFirst({
      where: { isActive: true },
      select: { key: true, label: true, startsAt: true, endsAt: true },
      orderBy: { startsAt: 'desc' },
    }),
    prisma.videoSubmission.findMany({
      where: { createdAt: { gte: startOfWindow } },
      select: { createdAt: true, isQualified: true, homeArea: true, processingStatus: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.videoSubmission.findMany({
      select: {
        id: true,
        createdAt: true,
        originalFileName: true,
        uploadStatus: true,
        processingStatus: true,
        processedS3Key: true,
        rawS3Key: true,
        isQualified: true,
        homeArea: true,
        disqualificationReasons: true,
        disqualificationOther: true,
        disqualifiedAt: true,
        disqualifiedBy: true,
        user: {
          select: {
            displayName: true,
            firstName: true,
            lastName: true,
            email: true,
            homeArea: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalSubmissions = videos.length;
  const totalQualified = videos.filter((video) => video.isQualified === true).length;
  const totalDisqualified = videos.filter((video) => video.isQualified === false).length;
  const pendingQualification = videos.filter((video) => video.isQualified === null).length;

  const regionBucket = new Map<string, Omit<RegionStat, 'qualificationRate' | 'shareOfTotal'>>();
  const regionSet = new Set<string>();

  for (const video of videos) {
    const region = areaLabel(video.homeArea ?? video.user.homeArea);
    regionSet.add(region);

    const current =
      regionBucket.get(region) ??
      {
        region,
        total: 0,
        qualified: 0,
        disqualified: 0,
        pending: 0,
      };

    current.total += 1;
    if (video.isQualified === true) current.qualified += 1;
    else if (video.isQualified === false) current.disqualified += 1;
    else current.pending += 1;

    regionBucket.set(region, current);
  }

  const regionStats = [...regionBucket.values()]
    .map((region) => ({
      ...region,
      qualificationRate: region.total > 0 ? (region.qualified / region.total) * 100 : 0,
      shareOfTotal: totalSubmissions > 0 ? (region.total / totalSubmissions) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total || a.region.localeCompare(b.region));

  const dailyMap = new Map<string, DailyUploadStat>();
  for (let i = 0; i < 30; i += 1) {
    const date = new Date(startOfWindow);
    date.setUTCDate(startOfWindow.getUTCDate() + i);
    const key = toDateKey(date);
    dailyMap.set(key, {
      date: key,
      uploads: 0,
      qualified: 0,
      disqualified: 0,
      pending: 0,
    });
  }

  for (const item of submissions) {
    const key = toDateKey(item.createdAt);
    const day = dailyMap.get(key);
    if (!day) continue;

    day.uploads += 1;
    if (item.isQualified === true) day.qualified += 1;
    else if (item.isQualified === false) day.disqualified += 1;
    else day.pending += 1;
  }

  const dailyUploadStats = [...dailyMap.values()];

  const uploadsToday = videos.filter((video) => new Date(video.createdAt) >= startOfToday).length;
  const uploadsLast7Days = videos.filter((video) => new Date(video.createdAt) >= startOfLast7Days).length;

  const signedVideos: AdminVideoItem[] = await Promise.all(
    videos.map(async (video) => {
      let videoUrl: string | null = null;

      if (video.processedS3Key) {
        try {
          const command = new GetObjectCommand({
            Bucket: process.env.AWS_VIDEO_OUTPUT_BUCKET,
            Key: video.processedS3Key,
          });

          videoUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
        } catch (error) {
          console.error('Error signing admin video URL:', {
            videoId: video.id,
            processedS3Key: video.processedS3Key,
            error,
          });
        }
      }

      return {
        ...video,
        createdAt: video.createdAt.toISOString(),
        disqualifiedAt: video.disqualifiedAt?.toISOString() ?? null,
        videoUrl,
      };
    })
  );

  return {
    lastUpdated: now.toISOString(),
    activePhase: activePhase
      ? {
          key: activePhase.key,
          label: activePhase.label,
          startsAt: activePhase.startsAt?.toISOString() ?? null,
          endsAt: activePhase.endsAt?.toISOString() ?? null,
        }
      : null,
    overview: {
      totalSubmissions,
      totalQualified,
      totalDisqualified,
      pendingQualification,
      distinctRegions: regionSet.size,
      uploadsToday,
      uploadsLast7Days,
      qualificationRate: totalSubmissions > 0 ? (totalQualified / totalSubmissions) * 100 : 0,
      processingCompleted: videos.filter((video) => video.processingStatus.toLowerCase() === 'completed').length,
    },
    regionStats,
    dailyUploadStats,
    videos: signedVideos,
  };
}