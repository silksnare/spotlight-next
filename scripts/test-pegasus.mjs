import 'dotenv/config'
import { runAiJudge } from '../src/lib/ai/run-ai-judge.ts'

async function main() {
  const submissionId = process.argv[2]

  if (!submissionId) {
    throw new Error('Usage: node scripts/test-pegasus.mjs <submissionId>')
  }

  const result = await runAiJudge({ submissionId })

  console.log('\n--- AI JUDGE RESULT ---\n')
  console.dir(result, { depth: null })
}

main().catch((error) => {
  console.error('AI judge test failed:', error)
  process.exitCode = 1
})