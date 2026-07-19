-- MOCKTEST-01: Mock Test 1 Reading engine
-- CELPIP Decoded practice platform.
-- Safe to run more than once. Conflict-safe seeds keyed on stable slugs.
--
-- This migration:
-- 1. Adds the celpip-mock-tests module (active)
-- 2. Creates the mock-test tables (tests, sections, questions, answer keys,
--    sessions, answers)
-- 3. Enables row level security on every new table
-- 4. Keeps answer keys unreadable by browser clients
-- 5. Seeds Mock Test 1 Reading: 4 sections, 38 questions, 38 answer keys

-- =========================================================
-- 1. Mock tests module
-- =========================================================

insert into public.modules (slug, title, description, status, sort_order)
values (
  'celpip-mock-tests',
  'CELPIP Mock Tests',
  'Full-length CELPIP Decoded practice tests, starting with Reading.',
  'active',
  6
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  status = excluded.status;

-- =========================================================
-- 2. Tables
-- =========================================================

create table if not exists public.mock_tests (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  status text not null default 'coming_soon',
  content_version integer not null default 1,
  reading_time_seconds integer not null default 3300,
  reading_instruction_video_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.mock_test_sections (
  id uuid primary key default gen_random_uuid(),
  mock_test_id uuid not null references public.mock_tests (id) on delete cascade,
  module_type text not null,
  section_number integer not null,
  slug text unique not null,
  title text not null,
  instructions text,
  content_json jsonb not null default '{}'::jsonb,
  asset_url text,
  sort_order integer not null default 0,
  created_at timestamptz default now(),
  unique (mock_test_id, module_type, section_number)
);

create table if not exists public.mock_test_questions (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.mock_test_sections (id) on delete cascade,
  question_number integer not null,
  group_key text not null default 'standalone',
  prompt text not null default '',
  response_type text not null default 'dropdown',
  options_json jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz default now(),
  unique (section_id, question_number)
);

-- Correct answers live here only. No browser client policy is created, so
-- the anon and authenticated roles can never read this table. Grading reads
-- it through the service role on the server.
create table if not exists public.mock_test_answer_keys (
  question_id uuid primary key references public.mock_test_questions (id) on delete cascade,
  correct_option_key text not null,
  explanation text,
  created_at timestamptz default now()
);

create table if not exists public.mock_test_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mock_test_id uuid not null references public.mock_tests (id) on delete cascade,
  module_type text not null default 'reading',
  content_version integer not null default 1,
  status text not null default 'in_progress',
  current_section_number integer not null default 1,
  time_limit_seconds integer not null,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  submitted_at timestamptz,
  raw_score integer,
  total_questions integer,
  result_summary jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint mock_test_sessions_status_check
    check (status in ('in_progress', 'submitted', 'expired'))
);

create table if not exists public.mock_test_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.mock_test_sessions (id) on delete cascade,
  question_id uuid not null references public.mock_test_questions (id) on delete cascade,
  selected_option_key text,
  is_correct boolean,
  correct_option_key_snapshot text,
  answered_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (session_id, question_id)
);

-- =========================================================
-- 3. Indexes
-- =========================================================

create index if not exists mock_test_sections_test_idx on public.mock_test_sections (mock_test_id);
create index if not exists mock_test_questions_section_idx on public.mock_test_questions (section_id);
create index if not exists mock_test_sessions_user_idx on public.mock_test_sessions (user_id);
create index if not exists mock_test_sessions_user_test_idx on public.mock_test_sessions (user_id, mock_test_id, module_type);
create index if not exists mock_test_sessions_status_idx on public.mock_test_sessions (status);
create index if not exists mock_test_answers_session_idx on public.mock_test_answers (session_id);
create index if not exists mock_test_answers_question_idx on public.mock_test_answers (question_id);

-- =========================================================
-- 4. Row level security
-- =========================================================

alter table public.mock_tests enable row level security;
alter table public.mock_test_sections enable row level security;
alter table public.mock_test_questions enable row level security;
alter table public.mock_test_answer_keys enable row level security;
alter table public.mock_test_sessions enable row level security;
alter table public.mock_test_answers enable row level security;

-- mock_tests: authenticated users can read active tests.
drop policy if exists "mock_tests_select_active" on public.mock_tests;
create policy "mock_tests_select_active"
  on public.mock_tests for select
  to authenticated
  using (status = 'active');

-- mock_test_sections: readable when the parent test is active.
drop policy if exists "mock_test_sections_select_active" on public.mock_test_sections;
create policy "mock_test_sections_select_active"
  on public.mock_test_sections for select
  to authenticated
  using (
    exists (
      select 1 from public.mock_tests mt
      where mt.id = mock_test_sections.mock_test_id
        and mt.status = 'active'
    )
  );

-- mock_test_questions: readable when the parent test is active.
-- Answer keys are NOT in this table, so nothing sensitive is exposed.
drop policy if exists "mock_test_questions_select_active" on public.mock_test_questions;
create policy "mock_test_questions_select_active"
  on public.mock_test_questions for select
  to authenticated
  using (
    exists (
      select 1
      from public.mock_test_sections s
      join public.mock_tests mt on mt.id = s.mock_test_id
      where s.id = mock_test_questions.section_id
        and mt.status = 'active'
    )
  );

-- mock_test_answer_keys: no anon or authenticated policy is defined on
-- purpose. With RLS enabled and no select policy, browser clients can never
-- read this table. Grading uses the service role, which bypasses RLS.

-- mock_test_sessions: users manage only their own sessions.
drop policy if exists "mock_test_sessions_select_own" on public.mock_test_sessions;
create policy "mock_test_sessions_select_own"
  on public.mock_test_sessions for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "mock_test_sessions_insert_own" on public.mock_test_sessions;
create policy "mock_test_sessions_insert_own"
  on public.mock_test_sessions for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users may update their own in-progress sessions only. Sensitive columns
-- (status, scores, snapshots, submitted_at) are set by the service role on
-- the server during grading, which bypasses RLS. This policy keeps a client
-- from reopening a submitted session, but it cannot by itself stop a client
-- from writing score columns, so the server never trusts client writes for
-- those and grading always runs through the service role.
drop policy if exists "mock_test_sessions_update_own_active" on public.mock_test_sessions;
create policy "mock_test_sessions_update_own_active"
  on public.mock_test_sessions for update
  to authenticated
  using (auth.uid() = user_id and status = 'in_progress')
  with check (auth.uid() = user_id);

-- mock_test_answers: users manage answers that belong to their own sessions.
drop policy if exists "mock_test_answers_select_own" on public.mock_test_answers;
create policy "mock_test_answers_select_own"
  on public.mock_test_answers for select
  to authenticated
  using (
    exists (
      select 1 from public.mock_test_sessions ses
      where ses.id = mock_test_answers.session_id
        and ses.user_id = auth.uid()
    )
  );

drop policy if exists "mock_test_answers_insert_own" on public.mock_test_answers;
create policy "mock_test_answers_insert_own"
  on public.mock_test_answers for insert
  to authenticated
  with check (
    exists (
      select 1 from public.mock_test_sessions ses
      where ses.id = mock_test_answers.session_id
        and ses.user_id = auth.uid()
        and ses.status = 'in_progress'
    )
  );

drop policy if exists "mock_test_answers_update_own" on public.mock_test_answers;
create policy "mock_test_answers_update_own"
  on public.mock_test_answers for update
  to authenticated
  using (
    exists (
      select 1 from public.mock_test_sessions ses
      where ses.id = mock_test_answers.session_id
        and ses.user_id = auth.uid()
        and ses.status = 'in_progress'
    )
  )
  with check (
    exists (
      select 1 from public.mock_test_sessions ses
      where ses.id = mock_test_answers.session_id
        and ses.user_id = auth.uid()
        and ses.status = 'in_progress'
    )
  );

-- =========================================================
-- 4b. Column privileges
-- =========================================================
-- RLS policies gate which rows a client may touch, but not which columns. To
-- keep browser clients from writing score or status columns, the authenticated
-- role is granted update on safe columns only. The service role bypasses this
-- and remains the only writer of scores, snapshots, and submission state.

revoke update on public.mock_test_sessions from authenticated;
grant update (current_section_number, updated_at)
  on public.mock_test_sessions to authenticated;

revoke update on public.mock_test_answers from authenticated;
grant update (selected_option_key, answered_at, updated_at)
  on public.mock_test_answers to authenticated;

-- =========================================================
-- 5. Seed Mock Test 1
-- =========================================================

insert into public.mock_tests (
  slug, title, description, status, content_version,
  reading_time_seconds, reading_instruction_video_url
)
values (
  'mock-test-1',
  'Mock Test 1',
  'A full-length CELPIP Decoded Reading practice test with four parts.',
  'active',
  1,
  3300,
  null
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  status = excluded.status,
  content_version = excluded.content_version,
  reading_time_seconds = excluded.reading_time_seconds,
  updated_at = now();

-- Sections
insert into public.mock_test_sections (
  mock_test_id, module_type, section_number, slug, title, instructions, content_json, asset_url, sort_order
)
select
  mt.id, 'reading', 1, 'mt1-reading-part-1', 'Reading Correspondence', 'Read the correspondence on the left, then answer the questions on the right.',
  '{"layout": "correspondence", "passage": {"kind": "message", "instruction": "Read the following message.", "blocks": [{"type": "paragraph", "text": "Dear Scott,"}, {"type": "paragraph", "text": "Has everyone adjusted to their new city yet? I know moving to Vancouver might have been difficult on your family, but you made the right choice. You would have been crazy to pass up such an amazing opportunity. That being said, the office sure isn''t the same without you!"}, {"type": "paragraph", "text": "Anyways, you''d been asking if I had plans for the “big anniversary,” so I had to write and tell what happened. Since Kelly loves the outdoors, I had the brilliant idea of hiking in Algonquin Park. I say “brilliant” because, as you know, I''m not a nature guy—a fact which might explain why my romantic gesture went so wrong."}, {"type": "paragraph", "text": "We decided to bring Sparky, figuring he''d love running around off-leash. Big mistake! We''d been hiking for about 2 hours when Sparky, having spotted something interesting, suddenly tore off into the bush. Worried he''d get lost, we went chasing after him. Apparently, however, we should''ve been more worried about ourselves getting lost. By the time we''d caught up with him, the trail was nowhere in sight and we had no idea where we were. While Sparky sat wagging his tail, thinking this was the best game ever, Kelly and I panicked. Since we hadn''t told anyone where we were going, it made no sense to stay put and wait for help. So we decided to keep walking, hoping we''d picked the right direction. Five hours later, with no sight of the trail and a darkening sky, we had our doubts. Amazingly, just as we started to think all was lost, we stumbled across an abandoned ranger cabin. There wasn''t much inside, but it had the essentials: a map, a compass, a few cans of beans, and a bed. Having eaten the last of our food hours ago, we quickly dug into the beans. Then, exhausted, we collapsed into bed. The next morning we used the map and compass to lead us out of the woods. It turns out we''d only been a few kilometres from our car!"}, {"type": "paragraph", "text": "Needless to say, I have no intention of venturing back into the woods any time soon. Make sure to be careful if you do any hiking out there. It''s easier to get lost than you think!"}, {"type": "paragraph", "text": "Cheers,"}, {"type": "paragraph", "text": "Jim"}]}, "rightBlocks": [{"kind": "standalone", "intro": "Using the drop-down menu, choose the best option according to the information given in the message.", "questionNumbers": [1, 2, 3, 4, 5, 6]}, {"kind": "cloze", "intro": "Here is a response to the message. Complete the response by filling in the blanks. Select the best choice for each blank from the drop-down menu.", "heading": "Dear Jim,", "segments": [{"type": "text", "text": "It''s great to hear from you! I''ve been wondering what my "}, {"type": "question", "number": 7}, {"type": "text", "text": " has been up to without me around. However, I am sorry to hear that you did not "}, {"type": "question", "number": 8}, {"type": "text", "text": " on your anniversary. I can only imagine how "}, {"type": "question", "number": 9}, {"type": "text", "text": " that must have been!"}, {"type": "break"}, {"type": "text", "text": "As to things here, you are right, "}, {"type": "question", "number": 10}, {"type": "text", "text": ". However, it seems like my family is really starting to like it here. The kids have already made a list of trails and mountains they want to explore. Although, after hearing your story I think we might all take an outdoor education course first. I sure don''t want to end up "}, {"type": "question", "number": 11}, {"type": "text", "text": " like you!"}], "signature": ["Take care,", "Scott"], "questionNumbers": [7, 8, 9, 10, 11]}]}'::jsonb,
  null, 1
from public.mock_tests mt
where mt.slug = 'mock-test-1'
on conflict (slug) do update set
  title = excluded.title,
  instructions = excluded.instructions,
  content_json = excluded.content_json,
  asset_url = excluded.asset_url,
  sort_order = excluded.sort_order;

insert into public.mock_test_sections (
  mock_test_id, module_type, section_number, slug, title, instructions, content_json, asset_url, sort_order
)
select
  mt.id, 'reading', 2, 'mt1-reading-part-2', 'Reading to Apply a Diagram', 'Read the diagram on the left, then complete the email and answer the questions on the right.',
  '{"layout": "diagram", "passage": {"kind": "diagram", "instruction": "Study the diagram on the left.", "imageAlt": "Comparison chart of language courses offered by a language school, listing each course with the required learner level, class frequency, workload, and popularity.", "blocks": []}, "rightBlocks": [{"kind": "cloze", "intro": "Read the following email message about the diagram on the left. Complete the email by filling in the blanks. Select the best choice for each blank from the drop-down menu.", "headerLines": ["Subject: Language Courses", "To: Charlie Veui cveui@tmscollg.com", "From: Gerry Nalen Grnal@tmscollg.com"], "heading": "Hi Charlie,", "segments": [{"type": "text", "text": "Remember how we always wanted to learn another language? Well, today I picked up a brochure for the language school down the street from our place. Let''s take a course and travel at the end of the semester! The courses offered are all for learners with "}, {"type": "question", "number": 1}, {"type": "text", "text": ". The French course "}, {"type": "question", "number": 2}, {"type": "text", "text": " than the others, but they promise that our language will get better fast. Or perhaps you''d prefer German? You''ve always wanted to see Germany, and this course "}, {"type": "question", "number": 3}, {"type": "text", "text": ". According to the brochure, "}, {"type": "question", "number": 4}, {"type": "text", "text": ". Or we could think about future job opportunities and take American Sign Language. If we took it in the evening, it wouldn''t affect our summer jobs. But when the fall semester starts, "}, {"type": "question", "number": 5}, {"type": "text", "text": ". On second thought, I''d rather take something useful for traveling. Oh, I just noticed that the brochure doesn''t mention the price of the courses. I''ll call them."}], "signature": ["Talk soon,", "Gerry"], "questionNumbers": [1, 2, 3, 4, 5]}, {"kind": "standalone", "intro": "Using the drop-down menu, choose the best option.", "questionNumbers": [6, 7, 8]}]}'::jsonb,
  'https://res.cloudinary.com/ds1wvtjft/image/upload/v1783342858/Reading_Test_1_-_Part_2_czz4w3.png', 2
from public.mock_tests mt
where mt.slug = 'mock-test-1'
on conflict (slug) do update set
  title = excluded.title,
  instructions = excluded.instructions,
  content_json = excluded.content_json,
  asset_url = excluded.asset_url,
  sort_order = excluded.sort_order;

insert into public.mock_test_sections (
  mock_test_id, module_type, section_number, slug, title, instructions, content_json, asset_url, sort_order
)
select
  mt.id, 'reading', 3, 'mt1-reading-part-3', 'Reading for Information', 'Read paragraphs A to D on the left, then match each statement on the right.',
  '{"layout": "information", "passage": {"kind": "paragraphs", "instruction": "Read the following paragraphs.", "blocks": [{"type": "labeled", "label": "A", "text": "On May 8, 1987, Canada introduced the one-dollar coin now known as the “loonie.” It is eleven-sided and gold-coloured (it''s actually bronze-plated nickel). The coin features a design by Ontario wildlife artist Robert Ralph Carmichael—a loon on one side and Queen Elizabeth II on the other. Canada is, after all, still a member of the British Commonwealth. The loon is a water bird common across Canada, known for its ability to swim great distances under water and for its beautiful, haunting call."}, {"type": "labeled", "label": "B", "text": "The loonie wasn''t Canada''s first one-dollar coin. A silver dollar was introduced in 1935, featuring an image of two voyageurs paddling a canoe on one side and, to display Canada''s British connections, an image of Britain''s King George on the other. But the silver dollar—which was made of nickel by 1967—wasn''t used much because of its size and weight (about 23 grams). What was in common use was a green-and-white paper bill. However, the paper bills wore out within a year, which is why the loonie was introduced. It was expected to last twenty years, saving taxpayers $175–250 million."}, {"type": "labeled", "label": "C", "text": "In fact, the Royal Canadian Mint intended to use the same voyageur design for the new coin, but the master dies were lost somewhere between Ottawa and the Winnipeg production facility. The dies were entrusted to a courier service instead of to a high-security service. Worse, apparently no one asked the courier representative who showed up to take possession of the dies for identification. Worse still, designs for both sides of the coin went in the same package instead of in separate packages. For these reasons, the Mint suspected foul play and, fearing counterfeits, decided to go with a new design, that by Carmichael. An investigation by the Royal Canadian Mounted Police concluded, however, that the dies were simply lost in transit."}, {"type": "labeled", "label": "D", "text": "In 1996, the orange-brown two-dollar paper bill was also replaced with a coin. Called a “toonie,” the silver coin has a gold center (actually nickel and bronze) featuring another Canadian animal, a polar bear on an ice floe. Already light, at 7.3 grams, a lighter version was introduced in 2012 by replacing the nickel with steel. A lighter version of the loonie was also introduced. Unfortunately, the lighter coins didn''t work in coin-operated machines, such as vending machines, parking meters, and washers and dryers in laundromats. As a result, many business owners have had to pay thousands of dollars to replace and upgrade their equipment."}, {"type": "labeled", "label": "E", "text": "Not given in any of the above paragraphs."}]}, "rightBlocks": [{"kind": "standalone", "intro": "Decide which paragraph, A to D, has the information given in each statement below. Select E if the information is not given in any of the paragraphs.", "questionNumbers": [1, 2, 3, 4, 5, 6, 7, 8, 9]}]}'::jsonb,
  null, 3
from public.mock_tests mt
where mt.slug = 'mock-test-1'
on conflict (slug) do update set
  title = excluded.title,
  instructions = excluded.instructions,
  content_json = excluded.content_json,
  asset_url = excluded.asset_url,
  sort_order = excluded.sort_order;

insert into public.mock_test_sections (
  mock_test_id, module_type, section_number, slug, title, instructions, content_json, asset_url, sort_order
)
select
  mt.id, 'reading', 4, 'mt1-reading-part-4', 'Reading for Viewpoints', 'Read the article on the left, then answer the questions and complete the comment on the right.',
  '{"layout": "viewpoints", "passage": {"kind": "article", "instruction": "Read the following article from a website.", "blocks": [{"type": "paragraph", "text": "A recent visit to Canada by Turks and Caicos Premier, Rufus Ewing, resparked interest in Canada''s annexation of the country. Turks and Caicos, a Caribbean archipelago of 40 islands, has been a point of interest in Canada''s history. This most recent debate marks the third time in the last century that Ottawa politicians have pushed to make the territory Canada''s eleventh province. With over 300 kilometres of beaches, the tropical paradise would certainly be a welcome asset."}, {"type": "paragraph", "text": "Ewing hailed Canada as a role model of fiscal responsibility from which his country could learn, accolades that resounded in Ottawa on the foreign leader''s recent diplomatic junket to spur bilateral trade and tourism. When asked about the possibility of Turks and Caicos becoming a Canadian province, the Premier skirted the issue. He said he would not dismiss the idea completely, but he also offered us a glimmer of hope with the tantalizing observation that “there is no marriage without some kind of relationship first.”"}, {"type": "paragraph", "text": "Liberal politician Peter Goldring is spearheading the latest campaign for the annexation and feels that much of the legwork has already been done. According to Goldring, “Canada has the greatest proportion of foreign investment in Turks and Caicos, and the second highest number of tourists to the country. Annexation would permit further growth in these areas.” Goldring also argues that the island could serve as a gateway to Latin America. “The location would be ideal for military support from Ottawa and particularly for disaster relief,” he adds."}, {"type": "paragraph", "text": "Disappointingly, Conservative politician Janice Bloom calls the whole idea a pipe dream. “Canada is not in the business of annexing tropical islands,” she claims. “Annexation would be extremely complicated since it would involve changes to the islands'' tax and health care systems.” Bloom contends that the government has more pressing matters."}, {"type": "paragraph", "text": "Yet, according to a recent poll, the majority of the islands'' residents support the proposal. Cab driver Ron Douglas says he''d love the opportunity to work in Alberta''s oil industry. However, he admits the primary concern of many locals is that Canada''s rules are too strict. “They go against the laid-back attitude of us islanders.”"}]}, "rightBlocks": [{"kind": "standalone", "intro": "Using the drop-down menu, choose the best option according to the information given on the website.", "questionNumbers": [1, 2, 3, 4, 5]}, {"kind": "cloze", "intro": "The following is a comment by a visitor to the website page. Complete the comment by choosing the best option to fill in each blank.", "heading": null, "segments": [{"type": "text", "text": "I have to admit, reading that Canada could potentially "}, {"type": "question", "number": 6}, {"type": "text", "text": " made my day. To be honest, however, I am not at all surprised that "}, {"type": "question", "number": 7}, {"type": "text", "text": ". Turks and Caicos officials have approached the Canadian government before regarding the issue, and were rejected each time. As Ewing insinuates, they likely "}, {"type": "question", "number": 8}, {"type": "text", "text": " Canada now. I am, however, shocked by the "}, {"type": "question", "number": 9}, {"type": "text", "text": ". You''d think if there was any financial gain to be had, they would be the first on board. However, I do agree with Bloom''s sentiment that at present, it is perhaps "}, {"type": "question", "number": 10}, {"type": "text", "text": "."}], "signature": [], "questionNumbers": [6, 7, 8, 9, 10]}]}'::jsonb,
  null, 4
from public.mock_tests mt
where mt.slug = 'mock-test-1'
on conflict (slug) do update set
  title = excluded.title,
  instructions = excluded.instructions,
  content_json = excluded.content_json,
  asset_url = excluded.asset_url,
  sort_order = excluded.sort_order;

-- Questions
insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 1, 'standalone', 'Scott and his family', 'dropdown', '[{"key": "A", "label": "have lived in Vancouver for many years."}, {"key": "B", "label": "will soon be moving to Vancouver."}, {"key": "C", "label": "no longer live in Vancouver"}, {"key": "D", "label": "recently moved to Vancouver."}]'::jsonb, 1
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-1'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 2, 'standalone', 'Jim and Kelly went hiking because', 'dropdown', '[{"key": "A", "label": "they both love the outdoors."}, {"key": "B", "label": "it is something Kelly enjoys."}, {"key": "C", "label": "Sparky likes to run off-leash."}, {"key": "D", "label": "Jim loves spending time in nature."}]'::jsonb, 2
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-1'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 3, 'standalone', 'Jim wrote Scott to', 'dropdown', '[{"key": "A", "label": "ask about his new job in Vancouver."}, {"key": "B", "label": "warn him about hiking around Vancouver."}, {"key": "C", "label": "answer a question about his anniversary."}, {"key": "D", "label": "tell how Sparky saved a bad hiking trip."}]'::jsonb, 3
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-1'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 4, 'standalone', 'Jim and Kelly''s recent anniversary', 'dropdown', '[{"key": "A", "label": "included staying at a cabin they had reserved."}, {"key": "B", "label": "did not turn out as they had planned."}, {"key": "C", "label": "was one of their favourite anniversaries ever."}, {"key": "D", "label": "involved a lot of driving in the car."}]'::jsonb, 4
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-1'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 5, 'standalone', 'The trouble began when Jim and Kelly', 'dropdown', '[{"key": "A", "label": "realized they had forgotten their map."}, {"key": "B", "label": "ran out of all their food and water"}, {"key": "C", "label": "went running into the woods after Sparky."}, {"key": "D", "label": "decided to bring Sparky to the park."}]'::jsonb, 5
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-1'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 6, 'standalone', 'It was lucky that Jim and Kelly', 'dropdown', '[{"key": "A", "label": "had brought a compass with them."}, {"key": "B", "label": "found shelter before it got dark out."}, {"key": "C", "label": "had a good sleep the night before."}, {"key": "D", "label": "parked their car close to the trailhead."}]'::jsonb, 6
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-1'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 7, 'cloze', '', 'dropdown', '[{"key": "A", "label": "best employee"}, {"key": "B", "label": "next-door neighbour"}, {"key": "C", "label": "favorite brother"}, {"key": "D", "label": "old roommate"}]'::jsonb, 7
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-1'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 8, 'cloze', '', 'dropdown', '[{"key": "A", "label": "find your car"}, {"key": "B", "label": "find Sparky"}, {"key": "C", "label": "eat dinner"}, {"key": "D", "label": "have a great time"}]'::jsonb, 8
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-1'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 9, 'cloze', '', 'dropdown', '[{"key": "A", "label": "annoying"}, {"key": "B", "label": "scary"}, {"key": "C", "label": "relieving"}, {"key": "D", "label": "reassuring"}]'::jsonb, 9
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-1'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 10, 'cloze', '', 'dropdown', '[{"key": "A", "label": "it was challenging at first"}, {"key": "B", "label": "this may have been a mistake"}, {"key": "C", "label": "the transition went smoothly"}, {"key": "D", "label": "the job is harder than expected"}]'::jsonb, 10
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-1'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 11, 'cloze', '', 'dropdown', '[{"key": "A", "label": "chasing Sparky"}, {"key": "B", "label": "eating canned vegetables"}, {"key": "C", "label": "locked up in a cabin"}, {"key": "D", "label": "lost in the woods"}]'::jsonb, 11
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-1'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 1, 'cloze', '', 'dropdown', '[{"key": "A", "label": "little experience"}, {"key": "B", "label": "intermediate abilities"}, {"key": "C", "label": "strong speaking skills"}, {"key": "D", "label": "cultural knowledge"}]'::jsonb, 1
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-2'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 2, 'cloze', '', 'dropdown', '[{"key": "A", "label": "seems more demanding"}, {"key": "B", "label": "has larger class sizes"}, {"key": "C", "label": "focuses on more skills"}, {"key": "D", "label": "requires less time"}]'::jsonb, 2
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-2'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 3, 'cloze', '', 'dropdown', '[{"key": "A", "label": "is the most intensive option"}, {"key": "B", "label": "includes cultural activities"}, {"key": "C", "label": "has the most frequent classes"}, {"key": "D", "label": "teaches functional language"}]'::jsonb, 3
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-2'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 4, 'cloze', '', 'dropdown', '[{"key": "A", "label": "it has the smallest classes"}, {"key": "B", "label": "many people like it"}, {"key": "C", "label": "it requires a lot of study"}, {"key": "D", "label": "enrollment is quite low"}]'::jsonb, 4
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-2'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 5, 'cloze', '', 'dropdown', '[{"key": "A", "label": "there are only morning classes"}, {"key": "B", "label": "it may be too much work"}, {"key": "C", "label": "the course will be finished"}, {"key": "D", "label": "there is a final assessment"}]'::jsonb, 5
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-2'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 6, 'standalone', 'What is Gerry''s relationship to Charlie?', 'dropdown', '[{"key": "A", "label": "roommate"}, {"key": "B", "label": "employee"}, {"key": "C", "label": "teacher"}, {"key": "D", "label": "counselor"}]'::jsonb, 6
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-2'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 7, 'standalone', 'What are Gerry and Charlie doing in September?', 'dropdown', '[{"key": "A", "label": "getting part-time jobs"}, {"key": "B", "label": "returning to school"}, {"key": "C", "label": "traveling to visit a friend"}, {"key": "D", "label": "taking a trip to Europe"}]'::jsonb, 7
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-2'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 8, 'standalone', 'Why does Gerry want to learn a language?', 'dropdown', '[{"key": "A", "label": "to get a university credit"}, {"key": "B", "label": "to get a job promotion"}, {"key": "C", "label": "to prepare for a trip abroad"}, {"key": "D", "label": "to talk to his German friends"}]'::jsonb, 8
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-2'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 1, 'standalone', 'Government officials were afraid that someone would make unauthorized coins.', 'paragraph_match', '[{"key": "A", "label": "A"}, {"key": "B", "label": "B"}, {"key": "C", "label": "C"}, {"key": "D", "label": "D"}, {"key": "E", "label": "E"}]'::jsonb, 1
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-3'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 2, 'standalone', 'By the end of the 20th century, coins replaced two paper bills in Canada.', 'paragraph_match', '[{"key": "A", "label": "A"}, {"key": "B", "label": "B"}, {"key": "C", "label": "C"}, {"key": "D", "label": "D"}, {"key": "E", "label": "E"}]'::jsonb, 2
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-3'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 3, 'standalone', 'Replacing paper bills every year was expensive.', 'paragraph_match', '[{"key": "A", "label": "A"}, {"key": "B", "label": "B"}, {"key": "C", "label": "C"}, {"key": "D", "label": "D"}, {"key": "E", "label": "E"}]'::jsonb, 3
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-3'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 4, 'standalone', 'People preferred to carry the lighter silver dollar.', 'paragraph_match', '[{"key": "A", "label": "A"}, {"key": "B", "label": "B"}, {"key": "C", "label": "C"}, {"key": "D", "label": "D"}, {"key": "E", "label": "E"}]'::jsonb, 4
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-3'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 5, 'standalone', 'The animal depicted on a loonie is found throughout Canada.', 'paragraph_match', '[{"key": "A", "label": "A"}, {"key": "B", "label": "B"}, {"key": "C", "label": "C"}, {"key": "D", "label": "D"}, {"key": "E", "label": "E"}]'::jsonb, 5
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-3'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 6, 'standalone', 'The individual who picked up the dies had forgotten to bring identification.', 'paragraph_match', '[{"key": "A", "label": "A"}, {"key": "B", "label": "B"}, {"key": "C", "label": "C"}, {"key": "D", "label": "D"}, {"key": "E", "label": "E"}]'::jsonb, 6
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-3'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 7, 'standalone', 'Shopkeepers were unhappy to have paper bills replaced with coins.', 'paragraph_match', '[{"key": "A", "label": "A"}, {"key": "B", "label": "B"}, {"key": "C", "label": "C"}, {"key": "D", "label": "D"}, {"key": "E", "label": "E"}]'::jsonb, 7
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-3'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 8, 'standalone', 'Canada''s connection to Britain is depicted on one side of the loonie.', 'paragraph_match', '[{"key": "A", "label": "A"}, {"key": "B", "label": "B"}, {"key": "C", "label": "C"}, {"key": "D", "label": "D"}, {"key": "E", "label": "E"}]'::jsonb, 8
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-3'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 9, 'standalone', 'A change in raw materials reduced the weight of the coins.', 'paragraph_match', '[{"key": "A", "label": "A"}, {"key": "B", "label": "B"}, {"key": "C", "label": "C"}, {"key": "D", "label": "D"}, {"key": "E", "label": "E"}]'::jsonb, 9
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-3'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 1, 'standalone', 'Ewing visited Ottawa to', 'dropdown', '[{"key": "A", "label": "strengthen economic ties."}, {"key": "B", "label": "discuss joining Canada."}, {"key": "C", "label": "study financial policies."}, {"key": "D", "label": "boost investment in Canada."}]'::jsonb, 1
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-4'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 2, 'standalone', 'Arguments presented in favour of annexation suggest', 'dropdown', '[{"key": "A", "label": "improved regulations for both countries."}, {"key": "B", "label": "increased opportunities for both parties."}, {"key": "C", "label": "increased tourism in both countries."}, {"key": "D", "label": "improved health care for both parties."}]'::jsonb, 2
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-4'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 3, 'standalone', 'Janice Bloom believes that annexing Turks and Caicos is', 'dropdown', '[{"key": "A", "label": "a shared Canadian dream."}, {"key": "B", "label": "a pointless proposition."}, {"key": "C", "label": "a worthy cause to pursue."}, {"key": "D", "label": "a pressing government issue."}]'::jsonb, 3
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-4'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 4, 'standalone', 'Inhabitants of Turks and Caicos', 'dropdown', '[{"key": "A", "label": "lead a different lifestyle than Canadians."}, {"key": "B", "label": "want to speed up the process of joining Canada."}, {"key": "C", "label": "have high rates of unemployment."}, {"key": "D", "label": "value their independence from foreign powers."}]'::jsonb, 4
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-4'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 5, 'standalone', 'The author of the article is', 'dropdown', '[{"key": "A", "label": "in favour of the proposal."}, {"key": "B", "label": "skeptical about the prospect."}, {"key": "C", "label": "opposed to the annexation."}, {"key": "D", "label": "surprised by the reactions."}]'::jsonb, 5
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-4'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 6, 'cloze', '', 'dropdown', '[{"key": "A", "label": "enter into business with a Caribbean paradise"}, {"key": "B", "label": "forge new diplomatic ties with Turks and Caicos"}, {"key": "C", "label": "incorporate a group of sunny southern islands"}, {"key": "D", "label": "promote low-cost travel throughout the Caribbean"}]'::jsonb, 6
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-4'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 7, 'cloze', '', 'dropdown', '[{"key": "A", "label": "Ewing remained largely silent on the matter"}, {"key": "B", "label": "Goldring felt he has done all that he can"}, {"key": "C", "label": "Bloom thought Ewing has better things to do"}, {"key": "D", "label": "Douglas feared a Canadian job might be too hard"}]'::jsonb, 7
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-4'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 8, 'cloze', '', 'dropdown', '[{"key": "A", "label": "feel resentment toward"}, {"key": "B", "label": "desire compensation from"}, {"key": "C", "label": "need an incentive from"}, {"key": "D", "label": "want to avoid relations with"}]'::jsonb, 8
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-4'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 9, 'cloze', '', 'dropdown', '[{"key": "A", "label": "arrogantly overconfident Liberal position"}, {"key": "B", "label": "evidently guileful Turks and Caicos Premier"}, {"key": "C", "label": "highly reluctant Turks and Caicos resident"}, {"key": "D", "label": "tersely dismissive Conservative position"}]'::jsonb, 9
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-4'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

insert into public.mock_test_questions (
  section_id, question_number, group_key, prompt, response_type, options_json, sort_order
)
select
  sec.id, 10, 'cloze', '', 'dropdown', '[{"key": "A", "label": "too late to implement"}, {"key": "B", "label": "an urgent political matter"}, {"key": "C", "label": "an unfeasible scheme"}, {"key": "D", "label": "too burdensome for businesses."}]'::jsonb, 10
from public.mock_test_sections sec
where sec.slug = 'mt1-reading-part-4'
on conflict (section_id, question_number) do update set
  group_key = excluded.group_key,
  prompt = excluded.prompt,
  response_type = excluded.response_type,
  options_json = excluded.options_json,
  sort_order = excluded.sort_order;

-- Answer keys (server protected)
insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'D'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-1' and qn.question_number = 1
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'B'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-1' and qn.question_number = 2
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'C'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-1' and qn.question_number = 3
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'B'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-1' and qn.question_number = 4
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'C'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-1' and qn.question_number = 5
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'B'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-1' and qn.question_number = 6
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'A'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-1' and qn.question_number = 7
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'D'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-1' and qn.question_number = 8
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'B'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-1' and qn.question_number = 9
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'A'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-1' and qn.question_number = 10
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'D'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-1' and qn.question_number = 11
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'A'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-2' and qn.question_number = 1
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'A'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-2' and qn.question_number = 2
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'D'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-2' and qn.question_number = 3
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'B'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-2' and qn.question_number = 4
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'B'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-2' and qn.question_number = 5
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'A'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-2' and qn.question_number = 6
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'B'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-2' and qn.question_number = 7
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'C'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-2' and qn.question_number = 8
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'C'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-3' and qn.question_number = 1
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'D'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-3' and qn.question_number = 2
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'B'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-3' and qn.question_number = 3
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'E'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-3' and qn.question_number = 4
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'A'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-3' and qn.question_number = 5
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'E'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-3' and qn.question_number = 6
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'E'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-3' and qn.question_number = 7
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'A'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-3' and qn.question_number = 8
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'D'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-3' and qn.question_number = 9
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'A'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-4' and qn.question_number = 1
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'B'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-4' and qn.question_number = 2
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'B'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-4' and qn.question_number = 3
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'A'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-4' and qn.question_number = 4
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'A'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-4' and qn.question_number = 5
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'C'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-4' and qn.question_number = 6
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'A'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-4' and qn.question_number = 7
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'C'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-4' and qn.question_number = 8
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'D'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-4' and qn.question_number = 9
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

insert into public.mock_test_answer_keys (question_id, correct_option_key)
select qn.id, 'C'
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
where sec.slug = 'mt1-reading-part-4' and qn.question_number = 10
on conflict (question_id) do update set
  correct_option_key = excluded.correct_option_key;

-- =========================================================
-- 6. Verification
-- =========================================================

select slug, status from public.modules where slug = 'celpip-mock-tests';

select count(*) as mock_tests_count from public.mock_tests where slug = 'mock-test-1';

select count(*) as reading_sections_count
from public.mock_test_sections sec
join public.mock_tests mt on mt.id = sec.mock_test_id
where mt.slug = 'mock-test-1' and sec.module_type = 'reading';

select count(*) as reading_questions_count
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
join public.mock_tests mt on mt.id = sec.mock_test_id
where mt.slug = 'mock-test-1';

select count(*) as answer_keys_count
from public.mock_test_answer_keys ak
join public.mock_test_questions qn on qn.id = ak.question_id
join public.mock_test_sections sec on sec.id = qn.section_id
join public.mock_tests mt on mt.id = sec.mock_test_id
where mt.slug = 'mock-test-1';

select sec.section_number, count(*) as questions
from public.mock_test_questions qn
join public.mock_test_sections sec on sec.id = qn.section_id
join public.mock_tests mt on mt.id = sec.mock_test_id
where mt.slug = 'mock-test-1'
group by sec.section_number
order by sec.section_number;
