# A3 requirements and evidence

Current technical release (14 October 2026): both websites use **Angular 22.2.2 and TypeScript 6.0.3**, as required by the later teacher announcement. The original brief's optional AngularJS wording is superseded for this requirement. Current verification: **16 Angular tests and 14 API/data/deployment tests passed**; see [the actual release record](SCU-angular22-2026-10-14.md) and [the reproducible build](angular22-build-runbook.md). Historical dated verification files retain their original results.

Source: `requirements/PROG2002  A3 Assessment Brief.pdf`, 14 pages, due 12 October 2026 at 11:59 pm AEST/AEDT. A3 extends the A2 charity event case study. `英文-27` contains that A2 site; this copy retains Driftline's identity and core data fields.

This table maps the rubric to implementation and available evidence. It does not assign a mark. Deployment, understanding and teamwork need evidence from the students themselves.

| Rubric area | Weight | Implementation and local evidence | Remaining assessment evidence |
| --- | --- | --- | --- |
| Database | 5% | `api/schema.sql`: 4 related tables, 12 registrations, unique event/email, foreign key, indexes and stored ticket totals; actual MySQL import and tests | Final SQL and explanation of the team's own design |
| APIs | 10% | Retrieval, registration, event/category CRUD, validation, error responses and transactions; 14 API/data/deployment tests passed | Explain routes in the video and demonstrate on cPanel |
| Client website | 30% | API-based home/search/detail, booking form, alerts, confirmation and newest-first records; desktop/phone checks; Angular 22 standalone components, TypeScript and live Open-Meteo request | Working deployment on each student's cPanel |
| Admin website | 30% | Every status, validated create/edit, contact records, deletion protection and menus; category management; Angular 22 components and API-backed staff forms | Working deployment on each student's cPanel |
| Concepts, comments, GitHub, video | 10% | Comments explain prices, UTC and competing writes; architecture notes and genuine commits from this session | Real team progress in private accessible GitHub, individual understanding and video of at most 15 minutes |
| Teamwork | 15% | No student contribution claims or peer scores were invented | Actual meetings, allocation, contributions and confidential peer evaluation |

## Detailed checks

| Requirement | Where to inspect | Verification |
| --- | --- | --- |
| One registration per user/event, different events allowed | Unique event/email key; registration validation | Concurrent/case-normalised duplicate test and different-event test |
| At least 10 registration examples | SQL registration insert | 12 seed rows |
| One SQL file contains schema and data | `api/schema.sql` | Fresh database import |
| Event detail returns all registrations | Public/staff detail routes | Descending timestamp order; ID breaks ties |
| Registered event cannot be deleted | Transaction and restrictive foreign key | API test, competing-write test and staff dialog |
| Booking page shows selected event and validates first | `frontend/src/site/registration.ts` and its HTML template | Empty submission alert, valid booking and duplicate feedback |
| Confirmation and navigation | Confirmation block | Stored reference, 3 tickets × $1.25 = $3.75 and correct Sydney time on an isolated test event |
| Staff sees Active, Past and Suspended | Staff list and status controls | 10 seeds: 8 active, 1 past, 1 suspended |
| Staff creates/edits event details | Staff editor | Required fields, reversed-time rejection and successful persistence |
| Staff editor shows registrations | Registration panel | Contacts, ticket count, stored amount and newest-first time |
| Category manipulation | Category page/API | Create/update/delete and referenced-category protection |
| Menu on every page | Public and staff headers | Desktop links and mobile expanded state |
| Angular 22+ and TypeScript on both sites | Locked Angular 22.2.2 and TypeScript 6.0.3; two standalone applications, typed services, Router and FormsModule | Strict production builds, genuine Angular component tests and live browser checks |
| Open-Meteo improvement | Typed weather service and venue coordinates | Live Bondi forecast; forecast-window/failure messages implemented |

## Submission details

The deliverable sentence says “2 zip files” but lists three filenames. This project prepares all three: `usernameA3-clientside.zip`, `usernameA3-adminside.zip` and `usernameA3-api.zip`. Account-named source archives are also prepared in `delivery/angular22-source/` for both authorized accounts.

Both supplied peer-evaluation documents have the same form text and an A2 title. The A3 brief says each member must send the assessment's form privately to their tutor before the deadline, with subject `PROG2002_A3_[Team_ID]_[Member_name]`. The originals are preserved without scores. Check the course's A3 form or ask the tutor about the title mismatch.

The brief requires project documentation without prescribing its format. These notes describe the reference implementation. They are not a student-authored report or proof of individual understanding. Follow the course's final documentation and AI-use requirements.

## Final submission checklist

- [x] Both authorized SCU accounts run the same verified source version; the current deployment record lists the actual source commit and rollback backup.
- [ ] Package names contain the correct username when uploaded.
- [ ] SQL reflects the agreed final schema and data.
- [ ] Private GitHub is accessible to the marker and shows genuine team progress.
- [ ] Video is at most 15 minutes and explains actual individual work.
- [ ] OneDrive permissions let the marker view it.
- [ ] Each student sent their own confidential evaluation to their tutor.
- [ ] Names, student IDs, team ID, links and required documentation are complete.
- [ ] GenAI declaration describes actual use and complies with the brief and assessor's guidance.
- [ ] Blackboard's current submission fields have been checked.
