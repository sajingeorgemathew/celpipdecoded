# MOCKTEST-01 - Mock Test 1 Reading Engine

## Goal

Build the first complete CELPIP Decoded mock-test engine for Reading.

The ticket must add:

- A Mock Tests module
- A Mock Test 1 overview
- Reading instructions
- A timed Reading test
- Four Reading parts
- Automatic answer saving
- Refresh and resume support
- Test submission
- Answer review
- Raw score summary
- Reading completion screen

This is the foundation for the Writing mock-test ticket that will follow.

## Reference materials

Private local reference folder:

_reference/private/mock-test-01/

Expected source files:

- source/mock-test-01-content.docx
- source/official-test-ui-reference.docx
- rendered/mock-test-01-content.pdf, when available
- rendered/official-test-ui-reference.pdf, when available

These files are local reference materials only.

Do not:

- Move them into public
- Import them into application code
- Commit them
- deploy them
- expose their local paths to users

Read the content document for the test passages, questions, choices, answers, and Cloudinary asset URL.

Read the screenshot document for layout and behaviour references.

## Branding and intellectual-property boundary

Build a realistic exam practice interface, but do not create an exact reproduction of the official CELPIP website.

Do not use:

- The official CELPIP logo
- The official red maple-leaf mark
- Official blue button gradients
- Screenshots from the official website inside the application
- Copy claiming CELPIP Decoded is the official test provider
- Copy claiming the score is an official CELPIP score

Use:

- CELPIP Decoded branding
- Ink navy #12314F
- Emerald-teal #0E9F6E
- Warm off-white #F4F1EA
- Existing BrandMark and BrandLogo components
- A professional exam-style layout
- A clear independent-practice disclaimer

Required disclaimer:

"CELPIP Decoded is an independent practice platform. Practice results are not official CELPIP scores."

## Scope boundaries

Build Reading only.

Do not build:

- Listening
- Writing test screens
- Speaking test screens
- AI evaluation
- Payments
- Subscription limits
- Certificates
- Admin content management
- Official CELPIP level conversion
- Instructional-video production

The Mock Test 1 overview may show Writing as "Coming next".

## Existing application protection

Do not break or substantially redesign:

- Authentication
- Dashboard protection
- Speaking routes
- Writing-practice routes
- Speaking recording
- Speaking transcription
- Speaking feedback
- Writing AI evaluation
- Existing attempts
- Existing Supabase storage
- Existing RLS
- Existing environment-variable names
- Existing migrations

Do not rename old migrations.

## Test structure

Mock Test:

- Slug: mock-test-1
- Title: Mock Test 1
- Reading status: active
- Writing status: coming_soon
- Reading total questions: 38

Reading sections:

1. Reading Correspondence
   - 11 questions

2. Reading to Apply a Diagram
   - 8 questions

3. Reading for Information
   - 9 questions

4. Reading for Viewpoints
   - 10 questions

Total:

- 38 questions

## Source-content requirements

Extract the full Reading content from:

_reference/private/mock-test-01/source/mock-test-01-content.docx

Use the exact supplied:

- Passages
- Emails
- Articles
- Question prompts
- Options
- Answer keys
- Diagram URL

Do not invent or paraphrase test questions.

Reading Part 2 diagram:

https://res.cloudinary.com/ds1wvtjft/image/upload/v1783342858/Reading_Test_1_-_Part_2_czz4w3.png

Configure Next.js image handling for res.cloudinary.com only if it is not already configured.

Provide useful alt text for the diagram.

## Answer-key validation

The extracted data must produce these answer counts:

- Part 1: 11
- Part 2: 8
- Part 3: 9
- Part 4: 10
- Total: 38

Part 1 answer sequence:

1. recently moved to Vancouver.
2. it is something Kelly enjoys.
3. answer a question about his anniversary.
4. did not turn out as they had planned.
5. went running into the woods after Sparky.
6. found shelter before it got dark out.
7. best employee
8. have a great time
9. scary
10. it was challenging at first
11. lost in the woods

Part 2 answer sequence:

1. little experience
2. seems more demanding
3. teaches functional language
4. many people like it
5. it may be too much work
6. roommate
7. returning to school
8. to prepare for a trip abroad

Part 3 answer sequence:

1. C
2. D
3. B
4. E
5. A
6. E
7. E
8. A
9. D

Part 4 answer sequence:

1. strengthen economic ties.
2. increased opportunities for both parties.
3. a pointless proposition.
4. lead a different lifestyle than Canadians.
5. in favour of the proposal.
6. incorporate a group of sunny southern islands
7. Ewing remained largely silent on the matter
8. need an incentive from
9. tersely dismissive Conservative position
10. an unfeasible scheme

Validate the seeded answer keys against this list before completing the ticket.

## Reading timer

Use a data-driven Reading time limit.

For Mock Test 1, seed:

- 55 minutes
- 3300 seconds

This is a CELPIP Decoded practice configuration, not a claim about the current official test duration.

The time limit must live in the database or centralized mock-test configuration so it can be changed later without rewriting the test engine.

Timer requirements:

- Timer starts when the user starts the Reading test
- Timer uses a server-created expires_at value
- Refreshing the page must not reset the timer
- Leaving and returning must not reset the timer
- Timer is shown in the top-right area
- Show minutes and seconds
- Show a visible warning when fewer than 5 minutes remain
- Automatically submit when time reaches zero
- Prevent duplicate submission
- Never trust only a browser countdown for the final submitted time

## Instruction flow

Route flow:

1. User opens Mock Tests
2. User opens Mock Test 1
3. User selects Reading
4. User sees Reading instructions
5. User starts the Reading test
6. User completes Parts 1 to 4
7. User submits the Reading test
8. User sees answer review
9. User sees raw score summary
10. User sees end-of-Reading screen

The source mentions a Reading instructional video but no approved Reading video URL is supplied.

Add nullable support for an instruction-video URL, but:

- Do not invent a video
- Do not embed an official CELPIP video
- Skip the video screen when no approved URL exists
- Do not block the test because the URL is null

## Practice navigation rule

This is a practice test.

Allow:

- Next
- Back
- Moving between Reading parts
- Reviewing previous answers before submission
- Changing answers before submission

Do not expose the answer key before final submission.

After submission:

- Answers become read-only
- The session cannot be changed
- The result cannot be submitted again

## Required routes

Protected routes:

- /dashboard/mock-tests
  Mock-test library

- /dashboard/mock-tests/mock-test-1
  Mock Test 1 overview

- /dashboard/mock-tests/mock-test-1/reading
  Reading instructions and active test shell

- /dashboard/mock-tests/mock-test-1/reading/results/[sessionId]
  Submitted answer review and score

Use dynamic routes where appropriate instead of hard-coding only one test into every component.

Logged-out users must be redirected to /login through existing dashboard protection.

## Dashboard integration

Add an active module:

- Slug: celpip-mock-tests
- Title: CELPIP Mock Tests
- Status: active
- Route: /dashboard/mock-tests

Do not replace the existing standalone speaking or writing modules.

The Mock Test 1 overview should show:

Reading:

- Status: Available
- 4 parts
- 38 questions
- 55-minute practice configuration
- Start or Resume action
- View result action after completion

Writing:

- Status: Coming next
- Disabled action

Do not show Listening or Speaking in Mock Test 1 during this ticket.

## Exam interface

Use the official screenshots only as behavioural reference.

Desktop layout:

- Full-width exam shell inside the authenticated app
- Compact exam header
- Current test and section title on the left
- Timer on the right
- Two-column main area
- Passage or diagram on the left
- Questions on the right
- Independent vertical scrolling for long content
- Visible Next action
- Visible Back action
- Part progress
- Question answered count

Suggested desktop width:

- Left panel around 50 percent
- Right panel around 50 percent

Mobile layout:

- Stack the passage and question areas
- Keep timer visible
- Keep navigation easy to reach
- Do not create horizontal scrolling
- Do not shrink text to unreadable sizes

Do not place the standard dashboard header inside the timed exam viewport if it reduces usable test space. A focused exam layout may be used while keeping a clear exit path.

## Reading-section rendering

Use structured data, not unsafe HTML.

Do not use dangerouslySetInnerHTML for database content.

Support these content patterns:

### Part 1

Left:

- Full correspondence passage

Right:

- Questions 1 to 6
- Response message with cloze questions 7 to 11

### Part 2

Left:

- Cloudinary diagram

Right:

- Email with cloze questions 1 to 5
- General questions 6 to 8

### Part 3

Left:

- Paragraphs A to D
- Paragraph labels must remain visible

Right:

- Questions 1 to 9
- Options A, B, C, D, E

### Part 4

Left:

- Website article

Right:

- Questions 1 to 5
- Visitor comment with cloze questions 6 to 10

Create a safe structured cloze renderer.

Recommended segment model:

- text segment
- paragraph-break segment
- question-reference segment

A question-reference segment should render the appropriate select control for that question.

Do not store executable HTML in Supabase.

## Answer controls

Use accessible select controls or equivalent exam-style controls.

Requirements:

- Every question has a visible number
- Every control has an accessible label
- Default state is "Select an answer"
- Selected answer remains after navigation
- Selected answer remains after page refresh
- Keyboard navigation works
- Changing an answer updates the saved response
- Saving state is visible but subtle
- Save failures show a retryable error

Do not reveal whether an answer is correct while the test is active.

## Automatic saving

Save each answer shortly after selection.

Requirements:

- Use a small debounce or immediate save
- Avoid duplicate writes
- Update existing answer rows instead of creating duplicates
- Use a unique constraint on session_id and question_id
- Show "Saving", "Saved", or a clear save error
- Keep local state during a temporary network error
- Retry or allow the student to retry
- Never silently discard an answer

## Session behaviour

A user may have one active Reading session for the same mock test.

Starting behaviour:

- If no session exists, create one
- If an active non-expired session exists, resume it
- If the active session is expired, submit or expire it safely
- If a completed session exists, show View result and Start new attempt
- Starting a new attempt creates a new session

Session statuses should include appropriate values such as:

- in_progress
- submitted
- expired

Use a database check constraint or enum only if consistent with the existing schema conventions.

## Database migration

Inspect the existing files in:

supabase/migrations/

Choose the next available sequential migration prefix.

Create something equivalent to:

supabase/migrations/NNN_mock_test_reading_engine.sql

Do not rename, squash, or edit previous migrations unless a genuine migration defect prevents this ticket.

Create appropriate tables such as:

### mock_tests

Suggested fields:

- id
- slug
- title
- description
- status
- content_version
- reading_time_seconds
- reading_instruction_video_url nullable
- created_at
- updated_at

### mock_test_sections

Suggested fields:

- id
- mock_test_id
- module_type
- section_number
- slug
- title
- instructions
- content_json
- asset_url nullable
- sort_order
- created_at

### mock_test_questions

Suggested fields:

- id
- section_id
- question_number
- group_key
- prompt
- response_type
- options_json
- sort_order
- created_at

Do not put the correct answer in this client-readable table.

### mock_test_answer_keys

Suggested fields:

- question_id
- correct_option_key
- explanation nullable
- created_at

The browser must not be able to query this table before submission.

### mock_test_sessions

Suggested fields:

- id
- user_id
- mock_test_id
- module_type
- content_version
- status
- current_section_number
- time_limit_seconds
- started_at
- expires_at
- submitted_at nullable
- raw_score nullable
- total_questions nullable
- result_summary jsonb nullable
- created_at
- updated_at

### mock_test_answers

Suggested fields:

- id
- session_id
- question_id
- selected_option_key
- is_correct nullable
- correct_option_key_snapshot nullable
- answered_at
- created_at
- updated_at

Add:

- Unique session_id and question_id
- Useful foreign-key indexes
- User-session indexes
- Session-status indexes

The exact design may be adjusted after auditing the existing schema, but it must preserve the required security, resume, grading, and result behaviour.

## Security requirements

Enable RLS on every new table.

Authenticated users may read:

- Active mock-test metadata
- Active sections
- Active questions without answer keys

Users may read and modify only:

- Their own sessions
- Answers belonging to their own sessions

Users must not be able to:

- Read mock_test_answer_keys directly
- Submit another user's session
- Modify another user's answers
- Change raw_score
- Set is_correct
- Set correct_option_key_snapshot
- Change submitted_at
- Reopen a submitted session
- Use client input as the final score

Perform grading on the server.

The grading route must:

1. Authenticate the user
2. Verify session ownership
3. Verify the session is in progress
4. Load answer keys server side
5. Compare saved answers
6. Save correctness snapshots
7. Save raw score and total questions
8. Mark the session submitted
9. Be idempotent
10. Return the existing result when called again

The Supabase service-role client may be used only in a server-only route or server module after ownership has been verified.

Never import the admin client into a client component.

## API or server-action requirements

Create secure endpoints or server actions for:

- Start or resume session
- Save answer
- Move current section
- Submit test
- Load result

Suggested route structure:

- POST /api/mock-tests/[testSlug]/reading/session
- PUT /api/mock-tests/reading/sessions/[sessionId]/answers
- POST /api/mock-tests/reading/sessions/[sessionId]/submit

The exact structure may be adjusted to match the existing project conventions.

Use Zod validation for request payloads.

Return friendly errors without exposing:

- Service-role keys
- SQL
- Internal stack traces
- Answer keys before submission

## Result review

The answer-review state must show:

- Part
- Question number
- Correct answer
- Student answer
- Correct indicator
- Incorrect indicator
- Unanswered indicator

Use accessible text in addition to colour.

Do not rely only on red and green icons.

Allow filtering or grouping by Reading part.

## Score summary

Show:

- Questions: 38
- Correct answers
- Incorrect answers
- Unanswered answers
- Raw score out of 38
- Percentage
- Per-part correct count

Do not generate an approximate CELPIP level in this ticket.

Required note:

"This raw score is provided for CELPIP Decoded practice only. It is not an official CELPIP score."

## End screen

Show:

- "This is the end of the Reading test."
- View answer review
- View score summary
- Return to Mock Test 1
- Return to Mock Tests

Writing should remain marked Coming next.

## Required components

Create or organize components equivalent to:

src/components/mock-tests/MockTestCard.tsx
src/components/mock-tests/MockTestOverview.tsx
src/components/mock-tests/reading/ReadingInstructions.tsx
src/components/mock-tests/reading/ReadingExamShell.tsx
src/components/mock-tests/reading/ReadingExamHeader.tsx
src/components/mock-tests/reading/ReadingTimer.tsx
src/components/mock-tests/reading/ReadingPassagePanel.tsx
src/components/mock-tests/reading/ReadingQuestionPanel.tsx
src/components/mock-tests/reading/ReadingQuestionSelect.tsx
src/components/mock-tests/reading/ReadingClozePassage.tsx
src/components/mock-tests/reading/ReadingNavigation.tsx
src/components/mock-tests/reading/ReadingSaveStatus.tsx
src/components/mock-tests/reading/ReadingResultReview.tsx
src/components/mock-tests/reading/ReadingScoreSummary.tsx
src/components/mock-tests/reading/ReadingEndScreen.tsx

Names may be adjusted when the existing component structure suggests a better convention.

## Required feature files

Create or organize logic equivalent to:

src/features/mock-tests/types.ts
src/features/mock-tests/mock-test-utils.ts
src/features/mock-tests/reading/reading-types.ts
src/features/mock-tests/reading/reading-session.ts
src/features/mock-tests/reading/reading-timer.ts
src/features/mock-tests/reading/reading-scoring.ts
src/features/mock-tests/reading/reading-content.ts
src/features/mock-tests/reading/reading-validation.ts

Keep timer, scoring, answer normalization, and progress calculations in pure functions where possible.

## Loading, error, and not-found states

Add appropriate loading, error, and not-found states.

Handle:

- Missing test
- Inactive test
- Invalid session UUID
- Session belonging to another user
- Session already submitted
- Session expired
- Content failed to load
- Answer save failed
- Submission failed
- Cloudinary image failed to load

Every state must offer a clear next action.

## Accessibility

Requirements:

- Proper heading order
- Keyboard-accessible selects and buttons
- Visible focus states
- Timer status announced without announcing every second
- Do not create constant screen-reader interruptions
- Labels for answered and unanswered questions
- Sufficient colour contrast
- Touch-friendly controls
- No colour-only result meaning

## Metadata and copy

Use CELPIP Decoded branding in metadata.

Use sentence case.

Keep CELPIP uppercase.

Do not use long dashes or em dashes in UI copy, comments, ticket updates, or new documentation.

## Documentation

Update README with a brief Mock Test section.

Create or update deployment documentation explaining:

- New migration
- New tables
- Seeded Mock Test 1 content
- Reading session behaviour
- How to verify the seeded row counts
- No new environment variables
- Cloudinary remote image dependency

Do not put private reference documents in the README.

## Migration verification targets

After migration, expected seed counts:

- mock_tests: at least 1
- Mock Test 1 Reading sections: 4
- Mock Test 1 Reading questions: 38
- Mock Test 1 answer keys: 38
- modules row for celpip-mock-tests: 1

The migration must use conflict-safe seed logic based on stable slugs or other stable unique keys.

Do not create duplicate content when migrations are replayed in a fresh test database.

## Tests and validation

Run:

npm install
npm run lint
npm run build
git diff --check

If an existing test framework is already present, add focused tests for:

- Timer remaining calculation
- Expiry handling
- Raw-score calculation
- Unanswered-answer handling
- Answer normalization
- Per-section score summary
- Duplicate submission behaviour
- Session ownership checks where practical

Do not add a large test framework solely for this ticket unless clearly justified.

## Manual browser tests

Test while authenticated:

1. Dashboard displays CELPIP Mock Tests
2. Mock Tests page displays Mock Test 1
3. Mock Test 1 displays Reading available
4. Reading instructions render
5. Starting creates a session
6. Timer starts
7. Part 1 loads
8. Answer selection saves
9. Back and Next work
10. Refresh resumes the same answers
11. Refresh does not reset the timer
12. Part 2 diagram loads
13. Part 3 A to E options work
14. Part 4 cloze questions work
15. Unanswered questions remain clearly identified
16. Submission grades exactly 38 questions
17. Answer review displays correct and student answers
18. Score summary displays raw score
19. Submitted answers cannot be changed
20. Repeated submit does not create a duplicate result
21. Another user cannot access the session result
22. Mobile layout has no horizontal overflow
23. Speaking routes still work
24. Writing routes still work

## No new environment variables

This ticket should not require new environment variables.

Continue using the existing:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_APP_URL

Do not alter OpenAI environment variables.

## Done criteria

- Mock Tests module is active
- Mock Test 1 overview exists
- Reading instructions exist
- Four Reading parts are seeded
- All 38 questions are seeded
- All 38 answer keys are server protected
- Reading timer survives refresh
- Answers save and resume
- Back and Next work
- Submission is secure and idempotent
- Answer review works
- Raw score works
- End screen works
- No official logo is used
- No official screenshots are shipped
- No private reference files are committed
- No answer keys are exposed before submission
- No existing speaking or writing flows are broken
- npm run lint passes
- npm run build passes
- git diff --check passes
- No secrets are committed
