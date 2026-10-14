# Driftline A3 assessment completion table

Project: Driftline coastal charity events. Accounts: kji10 and syang35. Application version: 3.0.1. The supplied A3 brief and peer evaluation template were checked on 14 October 2026. The later classroom requirement is implemented with Angular 22.2.2 and TypeScript 6.0.3 on both websites.

This completed table records implementation and submission readiness. Marks are assigned by the tutor; the weights below are the rubric weights, rather than awarded marks.

## Assessment rubric

| Criterion | Weight | Completed implementation and evidence | Submission status |
| --- | --- | --- | --- |
| Database | 5% | The complete SQL creates four related tables and 12 sample registrations. The registration table stores identity, contact details, UTC time, tickets, a price snapshot and an event foreign key. The event/email unique key prevents repeat bookings for the same event. | Complete SQL included in each account directory and in the API source archive. |
| REST APIs | 10% | Public events, combined search, event details and newest-first registration lists; booking creation; staff event/category create, update and delete; field validation and transaction protection. Events with registrations cannot be deleted. The recorded API verification passed 14 cases. | API source, lockfile, configuration example and test sources included. |
| Public website | 30% | Angular public pages load database records through typed HttpClient services. The selected-event registration form validates names, contact details and ticket quantities, submits a booking and shows its confirmation. Search, event records, weather states and mobile navigation are implemented. | Account deployments recorded for both kji10 and syang35; complete TypeScript source and compiled assets included. |
| Staff website | 30% | Angular staff pages list active, past and suspended events, create and edit events, display registrations and contact details, manage categories and show protected-deletion errors. The design uses a horizontal navigation bar and an event table. | Account staff deployments recorded; complete staff TypeScript source and compiled assets included. |
| Concepts, comments, GitHub and video | 10% | Source and architecture documentation explain the API flow, schema relations, UTC display, price snapshots and competing writes. Genuine local version history is present. | Team GitHub URL, marker access and the personal demonstration video link still need to be supplied. The video limit is 15 minutes. |
| Teamwork | 15% | The original peer evaluation template has six criteria and two member columns. Each member must describe their own contribution and team experience. | Actual names, allocation, ratings and feedback are required to finish each member's form. |

## Detailed requirement checks

| Requirement | Result | Source or delivery evidence |
| --- | --- | --- |
| At least 10 sample registrations | Complete: 12 rows in the packaged SQL | api/schema.sql and each accountA3-database.sql |
| One booking per person per event, multiple events allowed | Complete | Unique event/email key and normalised email input |
| Event details show newest registrations first | Complete | api/server.js and the public event component |
| Registration validation and confirmation | Complete | frontend/src/site/registration.ts and its template |
| Event CRUD and protected deletion | Complete | Staff components, event transactions and foreign key |
| All event statuses and navigation | Complete | Staff list, editor, category pages and public menus |
| Angular 22+ on both websites | Complete: Angular 22.2.2, TypeScript 6.0.3 | frontend/package.json, lockfile, standalone components, Router, HttpClient and FormsModule |
| External weather API | Complete | Open-Meteo requests using event coordinates and Sydney dates |
| Reproducible frontend build | Complete | Full frontend workspace in both website archives; recorded 16 Angular tests passed |
| Public deployment for each member | Deployment records checked | Public and staff URLs in each account's submission-links.txt |
| Three account-named source archives | Complete | kji10A3-* and syang35A3-* files |
| Complete SQL and project documentation | Complete | SQL, README and API/architecture documentation |
| Private GitHub and progress evidence | Link/access verification pending | Supply the team repository URL with A3 code and marker access |
| Personal demonstration video | Pending link | SCU OneDrive shareable link; maximum 15 minutes |
| Confidential peer evaluation | Member information pending | Each completed form is sent privately to the tutor |

The source packages contain 12 sample registrations. The separate deployment records contain 13 registrations for each hosted account; the extra hosted row does not change the supplied sample SQL.

For A3 peer evaluation, use email subject PROG2002_A3_[Team_ID]_[Member_name]. The original template's A2 subject is inconsistent with the A3 brief.
