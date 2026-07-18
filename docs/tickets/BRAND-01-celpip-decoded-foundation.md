\# BRAND-01 - CELPIP Decoded Repository Audit and Brand Foundation



\## Goal



Audit the existing copied CELPIP practice application and establish the CELPIP Decoded brand across the active application.



This is an existing working application. Do not rebuild it from scratch.



The ticket must preserve all existing functionality while replacing the previous Toronto Academy and Georgo branding in active source code.



\## Product name



CELPIP Decoded



\## Primary brand statement



You're not bad at English. You just don't know how CELPIP wants you to answer.



\## Brand concept



The logo combines:



\- Code-style brackets

\- A centred emerald dot

\- The CELPIP Decoded wordmark



The concept represents decoding the test format and understanding how CELPIP expects an answer to be structured.



The bracket mark must also work independently as:



\- Browser favicon

\- Mobile app icon

\- Social avatar

\- Compact header mark

\- Loading mark



\## Colour system



Use only these three primary colours:



\### Ink navy



Hex:



\#12314F



Use for:



\- Main headings

\- Navigation

\- Primary text

\- Dark sections

\- Trust and authority

\- Reversed logo backgrounds



\### Emerald-teal



Hex:



\#0E9F6E



Use for:



\- Primary actions

\- Progress

\- Success states

\- Correct states

\- Active states

\- Links and small accents

\- The centre dot in the brand mark



\### Warm off-white



Hex:



\#F4F1EA



Use for:



\- Page backgrounds

\- Cards

\- Calm sections

\- Negative space



White may be used where accessibility or reversed branding requires it.



Derived shades should be created using opacity or carefully calculated tints of these colours. Do not introduce purple, red, orange, or unrelated blue brand colours.



\## Typography



Use a clean humanist sans-serif throughout.



Preferred:



\- Inter

\- A suitable system sans-serif fallback



Weights:



\- 400 for regular body copy

\- 600 or 700 for navigation, buttons, headings, and the CELPIP wordmark



Rules:



\- Remove Fraunces and the existing editorial serif styling from active application pages.

\- Use sentence case for normal headings and labels.

\- Keep CELPIP uppercase because it is an acronym.

\- Keep Decoded in title case.

\- Avoid decorative or overly playful typography.



\## Logo requirements



Create reusable application logo components instead of relying on the screenshot as a production asset.



Suggested files:



\- src/components/brand/BrandMark.tsx

\- src/components/brand/BrandLogo.tsx

\- src/config/brand.ts

\- src/app/icon.svg



BrandMark requirements:



\- Rounded navy square

\- White bracket symbols

\- Emerald centre dot

\- Accessible SVG title or aria label

\- Compact and scalable

\- No raster image dependency



BrandLogo requirements:



\- Full horizontal lockup

\- Brand mark on the left

\- CELPIP in bold

\- Decoded in emerald-teal

\- Light-background variant

\- Dark-background reversed variant

\- Compact variant for mobile

\- Natural proportions

\- No stretched logo



\## Current application warning



This repository contains working functionality including:



\- Public landing page

\- Authentication

\- Protected dashboard

\- CELPIP speaking task library

\- Timed speaking practice

\- Browser audio recording

\- Private Supabase audio storage

\- OpenAI transcription

\- AI-supported speaking feedback

\- Speaking attempt history

\- Practice badges

\- CELPIP writing task library

\- Timed writing practice

\- Writing evaluation functionality or foundations

\- Supabase APIs and RLS-dependent flows



Do not remove, rewrite, or simplify these features during this ticket.



\## Audit requirement



Before changing code, inspect the repository and document:



1\. Current routes

2\. Active landing page components

3\. Authentication components

4\. Dashboard components

5\. Speaking components

6\. Writing components

7\. Current metadata and favicon files

8\. Current global colour variables

9\. Existing public assets

10\. Current Supabase and OpenAI environment variable usage

11\. Active references to Toronto Academy

12\. Active references to Georgo

13\. References to deleted photos

14\. Current package name

15\. Current README content



Use the actual implementation as the source of truth. Historical ticket documents may describe earlier states and must not be treated as current code.



\## Required active-source search



Search active files for:



\- Toronto Academy

\- Toronto Academy of Education

\- Georgo

\- Georgo Academy

\- Georgo Analytics and Automation

\- taelogo

\- georgo.png

\- img1

\- img2

\- img3

\- img4

\- onlineclass

\- academy

\- Fraunces



Search at minimum:



\- src

\- public

\- package.json

\- README.md

\- .env.example

\- docs/deployment



Do not mass-edit historical files under docs/tickets.



\## Centralized brand configuration



Create:



src/config/brand.ts



Centralize values such as:



\- productName

\- shortName

\- tagline

\- description

\- disclaimer

\- support or contact placeholder if already available

\- primary colours

\- common metadata titles



Avoid repeating long brand strings throughout unrelated components.



\## Metadata requirements



Update the root metadata.



Suggested title:



CELPIP Decoded - Understand the Test. Structure Better Answers.



Suggested description:



Practice CELPIP speaking and writing with guided test-style tasks, timed sessions, transcripts, and AI-supported feedback.



Set:



\- applicationName to CELPIP Decoded

\- title template for internal pages

\- favicon and application icon using the new bracket mark

\- appropriate theme colour

\- appropriate Open Graph metadata if the existing project supports it



Remove active metadata references to Toronto Academy and Georgo.



\## Root README



Replace the default Next.js README with a project-specific README.



The README should include:



\- Product overview

\- Technology stack

\- Available modules

\- Local setup

\- Environment variables

\- Security rules

\- Supabase setup note

\- Testing commands

\- Deployment note

\- Independent practice disclaimer



Do not include real environment values.



\## Package cleanup



Update package.json:



\- Change name from georgoacademy to celpipdecoded

\- Do not change dependency versions without a technical reason

\- Do not remove required Supabase, OpenAI, Zod, Next.js, React, or Tailwind dependencies



Update package-lock.json through npm if required.



\## Environment documentation



Keep the existing environment variable names:



\- NEXT\_PUBLIC\_SUPABASE\_URL

\- NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY

\- SUPABASE\_SERVICE\_ROLE\_KEY

\- NEXT\_PUBLIC\_APP\_URL

\- OPENAI\_API\_KEY

\- OPENAI\_TRANSCRIPTION\_MODEL

\- OPENAI\_SCORING\_MODEL

\- OPENAI\_WRITING\_MODEL



Update old Toronto Academy comments in .env.example to CELPIP Decoded.



Do not rename environment variables in this ticket.



Security rules:



\- SUPABASE\_SERVICE\_ROLE\_KEY is server only

\- OPENAI\_API\_KEY is server only

\- Model environment variables are server only

\- Never print real values

\- Never commit .env.local



\## Global theme requirements



Update src/app/globals.css and related theme configuration.



Use:



\- Ink navy: #12314F

\- Emerald-teal: #0E9F6E

\- Warm off-white: #F4F1EA



Preserve compatibility aliases where useful so existing components do not break.



Examples:



\- Existing ink token can map to #12314F

\- Existing brand token can map to #0E9F6E

\- Existing cream token can map to #F4F1EA



Remove old institution-specific or purple colour tokens from active use.



Ensure:



\- Accessible text contrast

\- Visible keyboard focus states

\- Clear disabled states

\- Clear error states

\- Clear success states

\- Mobile readability



\## Landing page requirements



Replace the previous institution-specific landing page with a first-pass CELPIP Decoded landing page.



Do not build the final marketing website yet.



The first-pass page should include:



\### Header



\- CELPIP Decoded logo

\- How it works

\- Speaking

\- Writing

\- Sign in

\- Get started



The mobile header must not overflow.



\### Hero



Small label:



CELPIP practice, decoded.



Primary headline:



You're not bad at English. You just don't know how CELPIP wants you to answer.



Supporting copy:



Learn the response structure CELPIP rewards, practise under realistic time limits, and get clear feedback on what to improve next.



Primary action:



Start practising



Link:



/signup



Secondary action:



Sign in



Link:



/login



Use a clean graphic composition based on brackets, the emerald dot, timers, answer structure, and feedback cards.



Do not depend on a photograph.



\### Core value section



Show three clear values:



1\. Understand the task



Know what each CELPIP task is asking before you begin.



2\. Structure your answer



Build responses with a clearer beginning, development, and conclusion.



3\. Improve with feedback



Review transcripts, practice estimates, strengths, and next steps.



\### Practice modules



Show:



\- CELPIP Speaking Practice

\- CELPIP Writing Practice

\- Reading coming later

\- Listening coming later



Use the existing product status and routing where possible.



Do not invent functionality that is not implemented.



\### How it works



Use a simple flow:



1\. Choose a task

2\. Complete a timed response

3\. Review feedback

4\. Practise again with a clearer strategy



\### Existing form



Keep the existing early-access or inquiry form submission working.



Visible labels may be rebranded, but:



\- Do not break its API route

\- Do not change its database mapping without a migration

\- Do not expose the service role key

\- Keep validation and error handling



\### Footer



Include:



CELPIP Decoded



Independent CELPIP preparation and practice platform.



CELPIP Decoded is not affiliated with or endorsed by CELPIP and does not provide official CELPIP scores.



Do not include Toronto Academy or Georgo branding.



\## Deleted image handling



The previous photos have been deleted.



Audit all active imports and references to:



\- img1.jpg

\- img2.jpg

\- img3.jpg

\- img4.jpg

\- onlineclass.jpg

\- taelogo.jpg

\- georgo.png

\- previous hero images



Remove or replace broken references.



Do not add random stock photographs.



This ticket should use:



\- Branded SVG graphics

\- CSS layout

\- Cards

\- Timers

\- Bracket motifs

\- Abstract practice interface previews



Photography can be introduced in a later ticket after approved images are supplied.



\## Application-wide branding



Update active user-facing branding in:



\- Landing page

\- Login

\- Signup

\- Authentication messages

\- Dashboard header

\- Dashboard welcome section

\- Loading states

\- Error states

\- Speaking module

\- Speaking practice

\- Speaking result pages

\- Attempt history

\- Writing module

\- Writing practice

\- Writing result pages

\- Footer

\- Browser metadata

\- Favicon



Do not change:



\- Route paths

\- API route paths

\- Database table names

\- Storage bucket names

\- Module slugs

\- Task types

\- Attempt statuses

\- RLS policies

\- Supabase helper behaviour

\- OpenAI request behaviour

\- Scoring JSON schemas

\- Existing task prompts



\## Historical documentation rule



Do not mass-replace old company names inside historical ticket documents under:



docs/tickets



Those files describe past development work.



The new BRAND-01 ticket should remain the current rebranding reference.



Update active documentation such as:



\- README.md

\- .env.example

\- docs/deployment documentation



Rename or replace the Toronto Academy deployment document with a CELPIP Decoded deployment document if appropriate.



\## No Supabase changes



This ticket requires:



\- No SQL migration

\- No new table

\- No table rename

\- No column rename

\- No storage bucket rename

\- No RLS change

\- No seed data change



The new client Supabase switch will be handled separately.



\## Testing requirements



Run:



npm install

npm run lint

npm run build



Run the development server:



npm run dev



Manually verify:



\- /

\- /login

\- /signup

\- /dashboard after login

\- /dashboard/speaking

\- Speaking task detail

\- Speaking practice

\- Existing speaking result page

\- /dashboard/writing

\- Writing task detail

\- Writing practice

\- Mobile header

\- Browser favicon

\- No missing image errors

\- No horizontal overflow

\- No broken internal navigation



Do not create real attempts against the previous company's Supabase project during testing unless explicitly approved.



\## Final active-source audit



Before completion, search again for the old brands in:



\- src

\- package.json

\- README.md

\- .env.example

\- docs/deployment



Active application files should have no unintended references to:



\- Toronto Academy

\- Toronto Academy of Education

\- Georgo

\- Georgo Academy

\- Georgo Analytics and Automation



Historical ticket files are exempt.



\## Important copy rule



Do not use long hyphens or em dashes in UI copy, comments, documentation, or prompts.



Use normal hyphens only.



\## Done criteria



\- Repository was inspected before editing

\- Audit summary is included in the completion response

\- Product name is CELPIP Decoded

\- Tagline appears correctly

\- Package name is celpipdecoded

\- Root README is project-specific

\- Brand configuration is centralized

\- Reusable logo components exist

\- Bracket favicon is installed

\- Ink navy is #12314F

\- Emerald-teal is #0E9F6E

\- Warm off-white is #F4F1EA

\- Fraunces is removed from active application design

\- Previous institution-specific landing sections are removed

\- Deleted photo references are removed

\- Landing page has a clean first-pass CELPIP Decoded design

\- Login and signup use CELPIP Decoded

\- Dashboard uses CELPIP Decoded

\- Speaking screens use CELPIP Decoded

\- Writing screens use CELPIP Decoded

\- Existing routes remain unchanged

\- Existing APIs remain unchanged

\- Existing Supabase schema remains unchanged

\- Existing OpenAI functionality remains unchanged

\- Existing form submission remains working

\- No secrets are committed

\- npm run lint passes

\- npm run build passes

\- Mobile layout works

\- No unintended active-source references to previous companies remain

