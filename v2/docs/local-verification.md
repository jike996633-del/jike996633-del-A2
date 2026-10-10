# Local verification — 10 October 2026

These checks were performed on `v2` in Windows. They establish local behaviour, not SCU hosting or student authorship.

## Environment

Node.js 24.13.0, MySQL 8.4.8 and AngularJS 1.8.3. The API ran on port 3027. A separate MySQL process listened only on `127.0.0.1:33127`; the existing MySQL84 service was not started or reconfigured. API tests used a separate database ending in `_test`.

The SQL imported with 10 events and 12 fictional registrations. Temporary browser events, bookings and categories were removed after verification. The preview was returned to the seed dataset.

## Integration tests

All 13 tests in `api/test/api.test.js` passed against actual MySQL. They cover:

1. Public upcoming records and every staff status.
2. Combined filters, empty results and literal SQL wildcard characters.
3. Invalid dates, repeated query values and invalid IDs.
4. Newest-first registrations and omitted public contact details.
5. Server price, ticket totals and registration time within one minute of the test clock.
6. Concurrent duplicates, normalised emails and another event with the same address.
7. Invalid contacts/tickets and unavailable events.
8. Event creation, editing, suspension and deletion without registrations.
9. Registered-event protection and historical ticket prices.
10. Competing booking/deletion requests with no orphan records.
11. Required fields, coordinates, amounts, times and foreign keys.
12. Category CRUD, duplicates and referenced-category protection.
13. Unknown routes, malformed JSON and oversized forms.

The runner refuses to execute unless `TEST_DB_NAME` ends in `_test`. Import fresh seeds before rerunning: public eligibility changes as event dates pass.

## Browser checks

The in-app browser exercised the actual HTML, AngularJS, API and MySQL flow:

| Action | Observed result |
| --- | --- |
| Home and detail | API data and original coastal images loaded |
| Date + Bondi + Beach clean-up | Only matching North Bondi event remained |
| Clear all filters | All upcoming events returned |
| Bondi weather | Live forecast showed showers and 16–21°C for 13 October; this is the recorded observation only |
| Empty booking form | Page alert and field feedback, without a blocking browser dialog |
| Disposable event creation/editing | Saved event, price and time appeared publicly |
| End time before start | Client rejected the change |
| 3 tickets at $1.25 | Confirmation showed $3.75, reference and correct Sydney time; detail showed the new row |
| Same-event duplicate email | Clear rejection message |
| Delete registered event | Dialog displayed the API's deletion protection message |
| Remove only test booking, then delete test event | Deletion succeeded; list returned to 10 seeds |
| Staff Past filter and text search | Correct past record and Bondi matches |
| Disposable category CRUD | Changes persisted; deletion removed the category |
| Mobile navigation | Public/staff menus opened with correct expanded state |

All seven HTML pages were checked at 390×844. The document did not overflow horizontally; displayed images were intact. Wide tables scroll within their containers. Final navigation checks showed no AngularJS/runtime console errors.

Browser checks exposed a timezone mismatch: the driver's date-format option did not change MySQL's session clock. Connections now set the session to UTC, and the timestamp test checks drift in both directions. The $15 lunch example's contradictory “free” description was also corrected.

The final editor review corrected a scope issue: its form now belongs to `editor.form`, so validation, dirty-state display and the leave check use the same form controller inside `ng-if`. An empty event name was rejected, restoring the original name saved successfully, and the form returned to pristine state before navigation back to the list.

## Evidence and limits

All three archives were checked against their SHA-256 manifest and extracted together. The extracted API installed its own dependencies with `npm ci --omit=dev`. An independent local server mounted that copy under `/a3/`: the public home, staff navigation, ten-event list and three-record registration panel loaded correctly, with no runtime console errors. This verifies the package and relative paths; it does not establish SCU's hosting configuration.

`previews/event-desktop.jpg`, `event-mobile.jpg` and `admin-desktop.jpg` show the local UI. `previews/booking-confirmation.jpg` records the disposable booking before cleanup. Screenshots are not included in the deployment ZIPs.

Original tracked A2 files were compared with a pre-edit SHA-256 snapshot and remain unchanged. The existing untracked A2 Word report was left untouched.

No cPanel deployment, public upload, GitHub push, real payment, email sending, video recording or peer evaluation occurred. Deployment and final submission entries remain pending.
