# CELPIP Decoded

You're not bad at English. You just don't know how CELPIP wants you to answer.

CELPIP Decoded is an independent CELPIP preparation and practice platform. It helps test-takers understand what each task is asking, structure stronger answers, and improve with clear, AI-supported feedback. Practice CELPIP speaking and writing with guided test-style tasks, timed sessions, transcripts, and feedback reports.

CELPIP Decoded is not affiliated with or endorsed by CELPIP and does not provide official CELPIP scores.

## Technology stack

- Next.js 16 (App Router) and React 19
- TypeScript
- Tailwind CSS 4
- Supabase (auth, Postgres, private storage, row level security)
- OpenAI (transcription, speaking scoring, writing evaluation)
- Zod for input validation

## Available modules

- CELPIP Speaking Practice: timed prompts, in-browser recording, private audio storage, transcription, and AI-supported feedback with practice-level estimates and badges.
- CELPIP Writing Practice: timed writing tasks with word targets and AI-supported evaluation.
- CELPIP Mock Tests: full-length, test-style practice. Mock Test 1 Reading is available with four parts and 38 questions.
- Listening and the Writing mock test: planned for later tickets.

## Mock tests

Mock Test 1 Reading is a timed, four-part practice test scored on the server:

- Route flow: `/dashboard/mock-tests` to the mock-test library, `/dashboard/mock-tests/mock-test-1` for the overview, `/dashboard/mock-tests/mock-test-1/reading` for instructions and the timed exam, and `/dashboard/mock-tests/mock-test-1/reading/results/[sessionId]` for the answer review and raw score.
- Four parts: Reading Correspondence (11 questions), Reading to Apply a Diagram (8), Reading for Information (9), and Reading for Viewpoints (10). Total 38 questions.
- The 55-minute practice timer is server-authored: the deadline lives in `expires_at`, so refreshing or leaving and returning never resets it. When time runs out the test is submitted and graded automatically.
- Answers save automatically as you go, and the test resumes with the same answers and the same clock.
- Correct answers are stored in a separate answer-key table that browser clients can never read. Grading runs on the server and is idempotent, so repeated submits return the same result.
- This is a practice score only. It is not an official CELPIP score, and no official CELPIP level is generated.

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment template and fill in your own values:
   ```bash
   cp .env.example .env.local
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000.

## Environment variables

Set these in `.env.local` (see `.env.example`). Never commit real values.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client and server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client and server | Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Supabase service role key |
| `NEXT_PUBLIC_APP_URL` | client and server | Base URL of the app |
| `OPENAI_API_KEY` | server only | OpenAI API key |
| `OPENAI_TRANSCRIPTION_MODEL` | server only | Model for audio transcription |
| `OPENAI_SCORING_MODEL` | server only | Model for speaking scoring |
| `OPENAI_WRITING_MODEL` | server only | Model for writing evaluation |

## Security rules

- `SUPABASE_SERVICE_ROLE_KEY` is server only and is read only in `src/lib/supabase/admin.ts`. Never import it into client components.
- `OPENAI_API_KEY` and the OpenAI model variables are server only.
- Never print or log real secret values.
- Never commit `.env.local`.
- The `attempt-audio` storage bucket is private. Audio is served through signed URLs only. Never enable public access.
- Row level security is enabled on every table with owner-scoped policies. Do not weaken these policies.

## Supabase setup

See `docs/deployment/supabase-celpip-decoded.md` for creating the project, applying the foundation migration, verifying the private storage bucket, and configuring environment variables.

## Testing commands

```bash
npm run lint
npm run build
npm run dev
```

## Deployment

The app is designed to deploy on Vercel. Configure the environment variables above in the Vercel project settings, then redeploy. See the Supabase setup document for the full checklist.

## Independent practice disclaimer

CELPIP Decoded provides practice tasks, practice-level estimates, and AI-supported feedback for preparation only. These are not official CELPIP scores. CELPIP Decoded is not affiliated with or endorsed by CELPIP.
