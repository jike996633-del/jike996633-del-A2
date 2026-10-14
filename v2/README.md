# Driftline — PROG2002 A3 reference project

Current release: **3.0.1**, with **Angular 22.2.2 + TypeScript 6.0.3** on both websites. See [the build and verification runbook](docs/angular22-build-runbook.md) for current source, commands and assessment evidence.

Driftline lists community events along Sydney's coast. This version extends A2 with bookings, a staff website and MySQL-backed editing. It uses Node.js, Express, MySQL and Angular 22.2.2 and TypeScript 6.0.3 on both websites. Event pages show an Open-Meteo forecast when the event falls within the forecast window.

This is a working reference implementation with recorded local checks. Read [AI-use.md](docs/AI-use.md) before using it for assessed work: the supplied brief does not permit copying generated code or a generated report into a submission.

## SCU deployment

Version 2.0.1 is deployed on both SCU accounts:

- `kji10`: [public website](https://24832245.it.scu.edu.au/driftline-a3/), [staff website](https://24832245.it.scu.edu.au/driftline-a3/admin/), [deployment record](docs/scu-deployment-2026-10-13.md).
- `syang35`: [public website](https://24833002.it.scu.edu.au/driftline-a3/), [staff website](https://24833002.it.scu.edu.au/driftline-a3/admin/), [deployment record](docs/scu-syang35-2026-10-13.md).

Both accounts passed live health, search, booking, duplicate-booking and existing-event save checks. The deployment records distinguish these results from local tests. The `syang35` deployment uses the optional `--runtime-only` package profile, which includes the application files without project notes, helper scripts or tests.

## Run locally

Use Node.js 18.20.8 or later and MySQL 5.7.44 or later. Keep `api`, `clientside` and `adminside` next to one another. The SCU account currently provides Node.js 18.20.8 and MySQL 5.7.44; use that Node version for its managed application. The API validates ticket counts and amounts on both database versions; MySQL 8.0.16 or later also enforces their CHECK constraints.

1. Create a new MySQL database, for example `charityevents_a3`.
2. Select that database and import `api/schema.sql`. It contains all four tables and sample data, without `CREATE DATABASE`, `USE` or destructive `DROP` statements.
3. Copy `api/.env.example` to `api/.env`. Set your database host, port, name, user and password.
4. In `api`, run `npm ci`, then `npm start`.
5. Open <http://localhost:3027/> for visitors or <http://localhost:3027/admin/> for staff.

On Windows, `scripts/preview.ps1` checks the configuration and starts the app. MySQL must already be running. Open pages through HTTP; opening HTML files directly does not load the API or Angular templates.

The dataset has 10 events, 12 registrations, 4 categories and 2 organisers. Eight events are active and upcoming, one is suspended and one is past. Sample dates are relative to the SQL import date. Names and contact details are fictional.

## Use the site

Visitors can combine date, location and category filters, open an event, choose 1–20 tickets and confirm a booking. One email can book each event once. Confirmation includes the reference, ticket count, amount and registration time. Ticket amounts are recorded; the site does not collect online payments.

Staff can view every event status, create and edit events, inspect registrations and manage categories. An event with registrations cannot be deleted. A category used by an event cannot be deleted. The brief excludes authentication from the required scope; this demonstration has no staff sign-in.

## Verify the API

Create a separate database whose name ends in `_test`, import the same SQL there and run from `api`:

```powershell
$env:TEST_DB_NAME = 'charityevents_a3_test'
npm test
Remove-Item Env:\TEST_DB_NAME
```

The runner refuses an ordinary database name. Tests use the credentials in `.env`, create their own test rows and remove those rows afterwards. See [local-verification.md](docs/local-verification.md) for the checks performed on this copy.

## Package and deploy

Run with Python 3.10 or later:

```powershell
python scripts/package_delivery.py --username username
```

The script creates three ZIP files in `delivery`, plus the SQL file and a SHA-256 manifest. `username` is an intentional placeholder, as requested. Replace it with the required SCU username when preparing the final upload. Credentials, dependencies, temporary databases and local screenshots are excluded.

Extract all three ZIP files into one directory so the API can serve both websites. Read [deployment.md](docs/deployment.md) for cPanel preparation and the checks each student must perform on their own account.

## Project notes

- [Architecture and API reference](docs/architecture.md)
- [Assessment requirements and evidence](docs/rubric-checklist.md)
- [Local verification record](docs/local-verification.md)
- [Video and individual contribution checklist](docs/video-checklist.md)
- [AI-use record](docs/AI-use.md)
- [Chinese handoff](HANDOFF.md)

The original A2 files remain outside `v2`. Photographs and the coastal identity are reused from A2. Angular production bundles retain their third-party MIT licences; framework source is <https://github.com/angular/angular>. Weather documentation is at <https://open-meteo.com/en/docs>.
