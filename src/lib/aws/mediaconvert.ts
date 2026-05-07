import { MediaConvertClient, CreateJobCommand } from '@aws-sdk/client-mediaconvert';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';

type CreateVideoJobParams = {
  inputS3Uri: string;
  outputBaseName?: string;
};

export async function createVideoTranscodeJob({
  inputS3Uri,
  outputBaseName = '_processed',
}: CreateVideoJobParams) {
  const region = process.env.AWS_REGION;
  const submitterRoleArn = process.env.AWS_MEDIACONVERT_SUBMITTER_ROLE_ARN;
  const jobRoleArn = process.env.AWS_MEDIACONVERT_ROLE_ARN;
  const outputBucket = process.env.AWS_VIDEO_OUTPUT_BUCKET;

  if (!region) throw new Error('Missing AWS_REGION');
  if (!submitterRoleArn) throw new Error('Missing AWS_MEDIACONVERT_SUBMITTER_ROLE_ARN');
  if (!jobRoleArn) throw new Error('Missing AWS_MEDIACONVERT_ROLE_ARN');
  if (!outputBucket) throw new Error('Missing AWS_VIDEO_OUTPUT_BUCKET');

  const sts = new STSClient({ region });

  const assumed = await sts.send(
    new AssumeRoleCommand({
      RoleArn: submitterRoleArn,
      RoleSessionName: 'spotlight-mediaconvert-submit',
    })
  );

  if (
    !assumed.Credentials?.AccessKeyId ||
    !assumed.Credentials?.SecretAccessKey ||
    !assumed.Credentials?.SessionToken
  ) {
    throw new Error('Failed to assume MediaConvert submitter role');
  }

  const mediaConvert = new MediaConvertClient({
    region,
    credentials: {
      accessKeyId: assumed.Credentials.AccessKeyId,
      secretAccessKey: assumed.Credentials.SecretAccessKey,
      sessionToken: assumed.Credentials.SessionToken,
    },
  });

  const destination = `s3://${outputBucket}/videos/`;

  const command = new CreateJobCommand({
    Role: jobRoleArn,
    Settings: {
      TimecodeConfig: {
        Source: 'ZEROBASED',
      },
      FollowSource: 1,
      Inputs: [
        {
          FileInput: inputS3Uri,
          TimecodeSource: 'ZEROBASED',
          AudioSelectors: {
            'Audio Selector 1': {
              DefaultSelection: 'DEFAULT',
            },
          },
          VideoSelector: {},
        },
      ],
      OutputGroups: [
        {
          Name: 'File Group',
          OutputGroupSettings: {
            Type: 'FILE_GROUP_SETTINGS',
            FileGroupSettings: {
              Destination: destination,
            },
          },
          Outputs: [
            {
              NameModifier: outputBaseName,
              ContainerSettings: {
                Container: 'MP4',
                Mp4Settings: {},
              },
              VideoDescription: {
                Width: 1920,
                Height: 1080,
                ScalingBehavior: 'DEFAULT',
                Sharpness: 50,
                AntiAlias: 'ENABLED',

                CodecSettings: {
                  Codec: 'H_264',
                  H264Settings: {
                    MaxBitrate: 5000000,
                    RateControlMode: 'QVBR',
                    SceneChangeDetect: 'TRANSITION_DETECTION',
                  },
                },
              },
              AudioDescriptions: [
                {
                  CodecSettings: {
                    Codec: 'AAC',
                    AacSettings: {
                      Bitrate: 96000,
                      CodingMode: 'CODING_MODE_2_0',
                      SampleRate: 48000,
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    AccelerationSettings: {
      Mode: 'DISABLED',
    },
    StatusUpdateInterval: 'SECONDS_60',
    Priority: 0,
  });

  const response = await mediaConvert.send(command);

  return {
    jobId: response.Job?.Id ?? null,
    jobArn: response.Job?.Arn ?? null,
    status: response.Job?.Status ?? null,
  };
}