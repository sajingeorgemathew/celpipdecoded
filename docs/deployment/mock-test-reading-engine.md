# Deployment: Mock Test reading engine (MOCKTEST-01)

This document covers deploying the Mock Test 1 Reading engine. It adds one
migration, six new tables, and seeded Mock Test 1 Reading content. It does not
add any new environment variables.

## 1. Apply the migration

Apply `supabase/migrations/011_mock_test_reading_engine.sql` to your Supabase
project (through the SQL editor or the Supabase CLI). The migration is
conflict-safe and keyed on stable slugs, so it can be replayed on a fresh test
database without creating duplicate content.

The migration:

1. Adds the `celpip-mock-tests` module (status active) to `public.modules`.
2. Creates the mock-test tables.
3. Enables row level security on every new table.
4. Seeds Mock Test 1 Reading: four sections, 38 questions, and 38 answer keys.

## 2. New tables

- `mock_tests`: one row per mock test, including `reading_time_seconds` and a
  nullable `reading_instruction_video_url`.
- `mock_test_sections`: the four Reading parts, with structured `content_json`
  and an optional `asset_url` (used for the Part 2 diagram).
- `mock_test_questions`: the 38 questions. This table never stores the correct
  answer.
- `mock_test_answer_keys`: the correct answer for each question. Row level
  security is enabled with no select policy, so browser clients can never read
  it. Grading reads it through the service role on the server.
- `mock_test_sessions`: one row per attempt, with server-authored `started_at`
  and `expires_at`, `status` (`in_progress`, `submitted`, `expired`), the raw
  score, and a `result_summary` written only at submission.
- `mock_test_answers`: saved answers, unique per `(session_id, question_id)`.
  The `is_correct` and `correct_option_key_snapshot` columns are written by the
  server during grading only.

## 3. Reading session behaviour

- Starting the Reading test creates a session with a fixed `expires_at`. The
  countdown is derived from that timestamp, so refresh and revisit never reset
  it.
- A user may hold only one active Reading session per test. An existing live
  session is resumed with the same saved answers.
- If the deadline passed while the student was away, the session is graded and
  closed automatically the next time it is opened.
- Submission is idempotent: a repeated submit returns the existing result and
  never creates a duplicate.

## 4. Verify the seeded row counts

The migration ends with verification queries. Expected results:

- `celpip-mock-tests` module: 1 row, status `active`.
- `mock_tests` with slug `mock-test-1`: 1.
- Mock Test 1 Reading sections: 4.
- Mock Test 1 Reading questions: 38.
- Mock Test 1 answer keys: 38.
- Questions per part: Part 1 = 11, Part 2 = 8, Part 3 = 9, Part 4 = 10.

You can rerun these checks any time:

```sql
select count(*) from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
join public.mock_tests mt on mt.id = sec.mock_test_id
where mt.slug = 'mock-test-1';
```

## 5. Environment variables

No new environment variables are required. The engine reuses:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

## 6. Cloudinary remote image dependency

The Part 2 diagram is served from `res.cloudinary.com`. `next.config.ts`
allows remote images from that host and the project path only. No credentials
are needed, but the host must be reachable at runtime. If the diagram fails to
load, the exam shows a fallback link to open it in a new tab.
