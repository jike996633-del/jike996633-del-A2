# Video and individual contribution preparation

Current technical release (14 October 2026): both websites use **Angular 22.2.2 and TypeScript 6.0.3**, as required by the later teacher announcement. The original brief's optional AngularJS wording is superseded for this requirement. Current verification: **16 Angular tests and 14 API/data/deployment tests passed**; see [the actual release record](SCU-angular22-2026-10-14.md) and [the reproducible build](angular22-build-runbook.md). Historical dated verification files retain their original results.

The brief limits the video to 15 minutes and asks for the database, APIs, browser data flow and working website. Each student should focus on their actual contribution. Use this as a demonstration checklist, not a script claiming work you did not do.

## Suggested 13-minute sequence

| Time | Show | Explain in your own words |
| --- | --- | --- |
| 0:00–0:45 | Name, student ID, team and live URL | Your actual role |
| 0:45–3:00 | SQL keys and a registration row | Event relationship, unique event/email and historical ticket price |
| 3:00–5:00 | Detail/filter/booking routes and validation | Requests, parameterised SQL, status codes and transactions |
| 5:00–6:30 | TypeScript component, API service and Angular workspace | HttpClient, typed JSON contracts, `@for` rendering, `[(ngModel)]`, NgForm validity and the Angular 22 production build |
| 6:30–8:30 | Home, combined search, detail and booking | Event ID, invalid input, successful booking, newest records and duplicates |
| 8:30–11:00 | Staff list, editor and delete dialog | Statuses, required fields, persisted edits and protected deletion |
| 11:00–12:00 | Weather and coordinates | Matching the event date and unavailable forecasts |
| 12:00–13:00 | Genuine GitHub work and checks | Your contributions and a problem you actually diagnosed |

Use a disposable unregistered event for successful deletion and a registered event for blocking. Keep contacts fictional. Do not remove required sample data to simplify recording.

## Questions to rehearse

- What protects data when two requests use the same event/email?
- What happens when booking and deletion arrive together?
- Why can't the browser choose the stored amount or timestamp?
- How do staff and public detail responses differ?
- Why repeat browser validation on the server?
- How do an Angular 22 TypeScript component, HttpClient service and `@for` template render API records?
- Why might a future event lack a forecast?
- What did you personally implement or test, and which commits prove it?

## Contribution record

Fill in real dates and evidence. No student contribution has been recorded by this session.

| Date | Student | Completed task | Commit/file evidence | Review/test evidence |
| --- | --- | --- | --- | --- |
| To complete | To complete | To complete | To complete | To complete |

For meetings, record actual attendees, decisions and next actions. Do not backdate entries or attribute this AI-assisted session to either student.

## Recording checks

- Demonstrate the working deployment on your own account.
- Keep passwords, `.env` contents and credentials out of the recording.
- Check duration, audio and readable code size.
- Upload to SCU OneDrive and verify marker access.
- Use an accurate GenAI declaration.
- Complete your peer evaluation independently and send it privately to your tutor.
