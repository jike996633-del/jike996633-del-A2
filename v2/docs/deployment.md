# Deploy to each student's SCU cPanel

Use the deployment video under the unit's Session Recording section for the exact SCU interface. cPanel's Node features depend on the hosting provider. These notes describe this project's configuration; SCU deployment has not been performed or verified in this session.

Both students must deploy the same project on their own account and complete the checks below. Each student signs in personally; do not share cPanel credentials.

## Database

1. Create a new database and database user with the account's MySQL tools. Keep the full account-prefixed names shown by cPanel.
2. Add that user to the database with the privileges needed by the project.
3. In phpMyAdmin, select the new database and import `api/schema.sql` once. Confirm four tables and 12 registrations.

Use a fresh database. The SQL does not create/select a database, migrate existing tables or act as a backup procedure.

## Node application

Extract all three ZIP files with `api`, `clientside` and `adminside` as siblings. Preserve names and case. For example:

```text
/home/ACCOUNT/driftline-a3/
  api/server.js
  api/package.json
  api/schema.sql
  clientside/index.html
  adminside/index.html
```

In the Node application tool shown by the course video, choose an available Node version of at least 18.20.8, use the `api` folder as application root and `server.js` as startup file. The SCU account inspected on 13 October 2026 provides Node.js 18.20.8. Choose the public application URL and production environment. Install dependencies with the panel's action, or activate its Node environment and run `npm ci --omit=dev` in `api`.

Set these variables in the panel, or in an `api/.env` file outside the publicly served folders:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=ACCOUNT_databaseuser
DB_PASSWORD=the_database_password
DB_NAME=ACCOUNT_databasename
NODE_ENV=production
ALLOWED_ORIGINS=
```

Use SCU's actual database host and port if they differ. Use the Node service's assigned port; if it requires an explicit `PORT`, set that value there. Do not copy the local preview's port or temporary database configuration.

Restart the app after configuration. Express serves visitors at the application root, staff under `admin/` and APIs under `api/`. Keep the application URL's trailing slash when opening its home page, especially below a path such as `/driftline-a3/`.

## API addresses

For the combined Node deployment, leave `apiBase` empty in both `assets/js/config.js` files. Relative API and navigation addresses retain the application's URL prefix.

If the course setup serves HTML separately, set both config files to the actual API URL:

```javascript
window.DRIFTLINE_CONFIG = {
  apiBase: 'https://YOUR-APP-ADDRESS/api'
};
```

Use the real address/path. For different HTML and API origins, set `ALLOWED_ORIGINS` to the exact HTML origins, separated by commas. An origin is the scheme, host and optional port, without a path. Restart Node. Keep the public/staff folders at the documented relative locations or adjust their cross-site navigation to the actual layout.

If the provider forwards a URL prefix differently, check the course instructions and a real `/api/health` request before changing routes. SCU prefix behaviour has not been verified here.

## Acceptance on both accounts

Record each student's URL and outcome. Local checks do not establish these results.

| Check | Student 1 evidence | Student 2 evidence |
| --- | --- | --- |
| Home reads live API records | Pending | Pending |
| `/api/health` returns `status: ok` | Pending | Pending |
| Combined search returns the selected event | Pending | Pending |
| Detail shows newest-first registrations | Pending | Pending |
| New email receives booking confirmation | Pending | Pending |
| Same-event duplicate is rejected | Pending | Pending |
| Staff creates and edits a disposable event | Pending | Pending |
| Registered-event deletion is blocked | Pending | Pending |
| Unregistered event can be deleted | Pending | Pending |
| Staff sees Active, Past and Suspended | Pending | Pending |
| Weather shows forecast or unavailable state | Pending | Pending |
| Phone layout and menus work | Pending | Pending |

Use fictional contacts. Remove only your disposable test records; retain required sample data. The site records amounts and does not take payments.

## Troubleshooting

- Database startup error or `503`: check complete database/user names, password, host, privileges and imported schema.
- HTML loads without data: inspect the failed API URL, both config files and any CORS origin.
- Missing assets: check extraction paths and letter case; Linux paths are case sensitive.
- Weather alone fails: check external access and event coordinates/date. Booking should remain usable.
- Old JavaScript after upload: refresh with caching disabled before diagnosing the API.

Provider-dependent setup is described in [cPanel's Application Manager documentation](https://docs.cpanel.net/cpanel/software/application-manager/). The SCU video remains the source for account-specific controls.
