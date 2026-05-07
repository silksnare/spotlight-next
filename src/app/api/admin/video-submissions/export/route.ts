import { NextResponse } from 'next/server';

import { getCurrentSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

type CsvValue = string | number | boolean | Date | null | undefined;

function formatDateForFilename(value: Date) {
  return value.toISOString().slice(0, 10);
}

function stringifyCsvValue(value: CsvValue): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

function escapeCsvCell(value: CsvValue): string {
  const serialized = stringifyCsvValue(value);
  return `"${serialized.replace(/"/g, '""')}"`;
}

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const submissions = await prisma.videoSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        originalFileName: true,
        storedFileName: true,
        uploadStatus: true,
        processingStatus: true,
        mediaConvertJobId: true,
        isQualified: true,
        qualifiedAt: true,
        qualifiedBy: true,
        homeArea: true,
        district: true,
        disqualificationReasons: true,
        disqualificationOther: true,
        disqualifiedAt: true,
        disqualifiedBy: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            employeeId: true,
            displayName: true,
            firstName: true,
            lastName: true,
            email: true,
            district: true,
            homeArea: true,
          },
        },
        judgeRound1Scores: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            judgeUserId: true,
            introductionGuestContext: true,
            explanationOfInspectionFindings: true,
            serviceRecommendationUrgency: true,
            communicationClarityProfessionalism: true,
            organizationVideoFlow: true,
            accuracyOfRecommendations: true,
            totalScore: true,
            createdAt: true,
            updatedAt: true,
            judgeUser: {
              select: {
                employeeId: true,
                email: true,
                firstName: true,
                lastName: true,
                displayName: true,
                homeArea: true,
                district: true,
              },
            },
          },
        },
        judgeRound2Scores: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            judgeUserId: true,
            introductionGuestContext: true,
            explanationOfInspectionFindings: true,
            serviceRecommendationUrgency: true,
            communicationClarityProfessionalism: true,
            organizationVideoFlow: true,
            accuracyOfRecommendations: true,
            totalScore: true,
            createdAt: true,
            updatedAt: true,
            judgeUser: {
              select: {
                employeeId: true,
                email: true,
                firstName: true,
                lastName: true,
                displayName: true,
                homeArea: true,
                district: true,
              },
            },
          },
        },
      },
    });

    const headers = [
      'submissionId',
      'userId',
      'employeeId',
      'userDisplayName',
      'userFirstName',
      'userLastName',
      'userEmail',
      'district',
      'homeArea',
      'userDistrict',
      'userHomeArea',
      'originalFileName',
      'storedFileName',
      'uploadStatus',
      'processingStatus',
      'mediaConvertJobId',
      'isQualified',
      'qualifiedAt',
      'qualifiedBy',
      'disqualificationReasons',
      'disqualificationOther',
      'disqualifiedAt',
      'disqualifiedBy',
      'judgeRound1ScoreCount',
      'judgeRound1Scores',
      'judgeRound2ScoreCount',
      'judgeRound2Scores',
      'createdAt',
      'updatedAt',
    ];

    const rows = submissions.map((submission) => {
      const round1Scores = submission.judgeRound1Scores.map((score) =>
        JSON.stringify({
          id: score.id,
          judgeUserId: score.judgeUserId,
          judgeEmployeeId: score.judgeUser.employeeId,
          judgeDisplayName: score.judgeUser.displayName,
          judgeFirstName: score.judgeUser.firstName,
          judgeLastName: score.judgeUser.lastName,
          judgeEmail: score.judgeUser.email,
          judgeHomeArea: score.judgeUser.homeArea,
          judgeDistrict: score.judgeUser.district,
          introductionGuestContext: score.introductionGuestContext.toString(),
          explanationOfInspectionFindings: score.explanationOfInspectionFindings.toString(),
          serviceRecommendationUrgency: score.serviceRecommendationUrgency.toString(),
          communicationClarityProfessionalism: score.communicationClarityProfessionalism.toString(),
          organizationVideoFlow: score.organizationVideoFlow.toString(),
          accuracyOfRecommendations: score.accuracyOfRecommendations.toString(),
          totalScore: score.totalScore.toString(),
          createdAt: score.createdAt.toISOString(),
          updatedAt: score.updatedAt.toISOString(),
        })
      );

      const round2Scores = submission.judgeRound2Scores.map((score) =>
        JSON.stringify({
          id: score.id,
          judgeUserId: score.judgeUserId,
          judgeEmployeeId: score.judgeUser.employeeId,
          judgeDisplayName: score.judgeUser.displayName,
          judgeFirstName: score.judgeUser.firstName,
          judgeLastName: score.judgeUser.lastName,
          judgeEmail: score.judgeUser.email,
          judgeHomeArea: score.judgeUser.homeArea,
          judgeDistrict: score.judgeUser.district,
          introductionGuestContext: score.introductionGuestContext.toString(),
          explanationOfInspectionFindings: score.explanationOfInspectionFindings.toString(),
          serviceRecommendationUrgency: score.serviceRecommendationUrgency.toString(),
          communicationClarityProfessionalism: score.communicationClarityProfessionalism.toString(),
          organizationVideoFlow: score.organizationVideoFlow.toString(),
          accuracyOfRecommendations: score.accuracyOfRecommendations.toString(),
          totalScore: score.totalScore.toString(),
          createdAt: score.createdAt.toISOString(),
          updatedAt: score.updatedAt.toISOString(),
        })
      );

      return [
        submission.id,
        submission.userId,
        submission.user.employeeId,
        submission.user.displayName,
        submission.user.firstName,
        submission.user.lastName,
        submission.user.email,
        submission.district,
        submission.homeArea,
        submission.user.district,
        submission.user.homeArea,
        submission.originalFileName,
        submission.storedFileName,
        submission.uploadStatus,
        submission.processingStatus,
        submission.mediaConvertJobId,
        submission.isQualified,
        submission.qualifiedAt,
        submission.qualifiedBy,
        submission.disqualificationReasons.join(' | '),
        submission.disqualificationOther,
        submission.disqualifiedAt,
        submission.disqualifiedBy,
        submission.judgeRound1Scores.length,
        round1Scores.join(' | '),
        submission.judgeRound2Scores.length,
        round2Scores.join(' | '),
        submission.createdAt,
        submission.updatedAt,
      ];
    });

    const csv = [
      headers.map((value) => escapeCsvCell(value)).join(','),
      ...rows.map((row) => row.map((value) => escapeCsvCell(value)).join(',')),
    ].join('\n');

    const filename = `video-submissions-${formatDateForFilename(new Date())}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('VIDEO_SUBMISSION_EXPORT_ERROR', error);
    return NextResponse.json({ error: 'Failed to export video submissions' }, { status: 500 });
  }
}