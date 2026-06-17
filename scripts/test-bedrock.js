const {
  BedrockRuntimeClient,
  ConverseCommand,
} = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({
  region: "us-east-1",
});

async function main() {
  const response = await client.send(
    new ConverseCommand({
      modelId: "us.anthropic.claude-haiku-4-5-20251001-v1:0",
      messages: [
        {
          role: "user",
          content: [
            {
              text: "Reply with exactly: Bedrock is working",
            },
          ],
        },
      ],
    })
  );

  console.log(
    response.output.message.content[0].text
  );
}

main().catch(console.error);