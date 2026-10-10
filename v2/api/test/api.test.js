const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

// Refuse to run against an ordinary database: these tests create and remove their own rows.
const testDatabase = process.env.TEST_DB_NAME;
if (!testDatabase || !testDatabase.endsWith('_test')) throw new Error('Set TEST_DB_NAME to a dedicated database ending in _test. Import schema.sql there first.');
process.env.DB_NAME = testDatabase;
const app = require('../server');
const pool = require('../event_db');
let server;
let base;
const createdEvents = [];
const createdCategories = [];
const emailPrefix = `a3-${Date.now()}`;

before(async () => {
  await pool.query('SELECT 1');
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await pool.execute('DELETE FROM registrations WHERE email LIKE ?', [emailPrefix + '%']);
  for (const eventId of createdEvents) await pool.execute('DELETE FROM events WHERE event_id = ?', [eventId]);
  for (const categoryId of createdCategories) await pool.execute('DELETE FROM categories WHERE category_id = ?', [categoryId]);
  if (server) await new Promise(resolve => server.close(resolve));
  await pool.end();
});
async function request(path, method = 'GET', data) {
  const response = await fetch(base + '/api/' + path, {
    method, headers: { 'Content-Type': 'application/json' }, body: data === undefined ? undefined : JSON.stringify(data)
  });
  const body = response.status === 204 ? null : await response.json();
  return { status: response.status, body, headers: response.headers };
}
function booking(suffix, extra = {}) {
  return { fullName: 'API Test Visitor', email: emailPrefix + suffix + '@example.com', phone: '0400 000 999', tickets: 2, ...extra };
}
async function newEvent(extra = {}) {
  const { body: template } = await request('admin/events/2');
  const result = await request('admin/events', 'POST', { ...template, name: 'API test event ' + Date.now(), ...extra });
  assert.equal(result.status, 201, JSON.stringify(result.body));
  createdEvents.push(result.body.id);
  return result.body;
}

test('public results omit past and suspended records, while staff receive every status', async () => {
  const all = await request('events');
  const featured = await request('events/featured');
  const admin = await request('admin/events');
  assert.equal(all.status, 200);
  assert.ok(all.body.length >= 8);
  assert.equal(featured.body.length, 4);
  assert.ok(all.body.every(event => event.displayStatus === 'active' && ![9, 10].includes(event.id)));
  assert.ok(['active', 'past', 'suspended'].every(status => admin.body.some(event => event.displayStatus === status)));
});
test('date, location and category combine; literal wildcard characters do not widen the search', async () => {
  const { body: event } = await request('events/1');
  const result = await request('events?date=' + event.date + '&location=Bondi&category=1');
  assert.deepEqual(result.body.map(event => event.id), [1]);
  assert.deepEqual((await request('events?location=%25')).body, []);
  assert.deepEqual((await request('events?location=unknown-place')).body, []);
});
test('invalid date, repeated filters and invalid IDs return 400', async () => {
  for (const path of ['events?date=2026-02-30', 'events?category=abc', 'events?date=x&date=y', 'events/0', 'events/2147483648', 'events?location=' + 'x'.repeat(81)]) {
    assert.equal((await request(path)).status, 400, path);
  }
});
test('event detail returns newest registrations first and keeps public contact details private', async () => {
  const publicRecord = await request('events/1');
  const staff = await request('admin/events/1');
  assert.ok(publicRecord.body.registrations.length >= 3);
  const dates = publicRecord.body.registrations.map(record => record.registeredAt);
  assert.deepEqual(dates, [...dates].sort().reverse());
  assert.ok(publicRecord.body.registrations.every(record => !('email' in record) && !('phone' in record)));
  assert.ok(staff.body.registrations.every(record => record.email && record.phone));
  assert.equal((await request('events/9')).status, 404);
  assert.equal((await request('events/10')).status, 404);
});
test('booking uses stored price, server timestamp and exact cents, then changes the event list', async () => {
  const event = await newEvent({ ticketPrice: 8.50 });
  const data = booking('-price', { tickets: 3, ticketPrice: 0.01, totalAmount: 0, registeredAt: '1900-01-01' });
  const result = await request(`events/${event.id}/registrations`, 'POST', data);
  assert.equal(result.status, 201);
  assert.equal(result.body.totalAmount, 25.50);
  assert.equal(result.body.ticketPrice, 8.50);
  assert.ok(Date.now() - Date.parse(result.body.registeredAt) < 60000);
  const detail = (await request(`events/${event.id}`)).body;
  assert.equal(detail.registrationCount, 1);
  assert.equal(Number(detail.ticketsBooked), 3);
  assert.equal(Number(detail.fundingRaised), Number(event.donationRaised) + 25.50);
});
test('the unique event-email key allows only one concurrent booking and normalises email case', async () => {
  const event = await newEvent();
  const data = booking('-duplicate');
  const results = await Promise.all([
    request(`events/${event.id}/registrations`, 'POST', data),
    request(`events/${event.id}/registrations`, 'POST', { ...data, email: '  ' + data.email.toUpperCase() + '  ' })
  ]);
  assert.deepEqual(results.map(result => result.status).sort(), [201, 409]);
  assert.equal((await request(`admin/events/${event.id}`)).body.registrations.length, 1);
  assert.equal((await request('events/1/registrations', 'POST', data)).status, 201);
});
test('registration rejects invalid contact data, fractional or excessive tickets and unavailable events', async () => {
  for (const data of [booking('-invalid', { tickets: 0 }), booking('-invalid', { tickets: 1.5 }), booking('-invalid', { tickets: 21 }), booking('-invalid', { email: 'bad-address' }), booking('-invalid', { fullName: '  ' }), booking('-invalid', { phone: '------' }), booking('-invalid', { tickets: true })]) {
    const result = await request('events/1/registrations', 'POST', data);
    assert.equal(result.status, 400);
    assert.ok(Object.keys(result.body.fields).length);
  }
  for (const id of [9, 10, 2147483647]) assert.equal((await request(`events/${id}/registrations`, 'POST', booking('-unavailable'))).status, 404);
});
test('staff can create, update, suspend and delete an event without registrations', async () => {
  const event = await newEvent();
  const result = await request(`admin/events/${event.id}`, 'PUT', { ...event, name: 'Updated field session', status: 'suspended' });
  assert.equal(result.status, 200);
  assert.equal(result.body.name, 'Updated field session');
  assert.equal((await request(`events/${event.id}`)).status, 404);
  assert.equal((await request(`admin/events/${event.id}`, 'DELETE')).status, 204);
  assert.equal((await request(`admin/events/${event.id}`)).status, 404);
});
test('events with registrations cannot be deleted, and price edits keep historical amounts', async () => {
  const event = await newEvent({ ticketPrice: 8.50 });
  const record = await request(`events/${event.id}/registrations`, 'POST', booking('-protected'));
  assert.equal(record.status, 201);
  const deletion = await request(`admin/events/${event.id}`, 'DELETE');
  assert.equal(deletion.status, 409);
  assert.match(deletion.body.error, /registrations/);
  const update = await request(`admin/events/${event.id}`, 'PUT', { ...event, ticketPrice: 12.00 });
  assert.equal(update.status, 200);
  assert.equal(update.body.registrations[0].totalAmount, 17.00);
});
test('a booking racing with deletion either survives intact or is rejected without an orphan', async () => {
  const event = await newEvent();
  const [booked, deleted] = await Promise.all([
    request(`events/${event.id}/registrations`, 'POST', booking('-race')),
    request(`admin/events/${event.id}`, 'DELETE')
  ]);
  assert.ok((booked.status === 201 && deleted.status === 409) || (booked.status === 404 && deleted.status === 204));
  const [orphans] = await pool.query('SELECT COUNT(*) AS count FROM registrations r LEFT JOIN events e ON r.event_id = e.event_id WHERE e.event_id IS NULL');
  assert.equal(orphans[0].count, 0);
});
test('event validation rejects reversed times, invalid coordinates, missing fields and unknown foreign keys', async () => {
  const { body: template } = await request('admin/events/2');
  for (const changes of [{ name: '' }, { endTime: '07:00' }, { latitude: 91 }, { longitude: -181 }, { ticketPrice: -1 }, { fundingGoal: 0 }, { status: 'deleted' }, { imagePath: 'javascript:alert(1)' }, { date: '2026-02-30' }, { ticketPrice: 0.001 }]) {
    assert.equal((await request('admin/events', 'POST', { ...template, ...changes })).status, 400);
  }
  assert.equal((await request('admin/events', 'POST', { ...template, categoryId: 2147483647 })).status, 400);
});
test('category CRUD works and a referenced category cannot be deleted', async () => {
  const name = 'Test category ' + Date.now();
  const result = await request('admin/categories', 'POST', { name, slug: 'test-' + Date.now() });
  assert.equal(result.status, 201);
  createdCategories.push(result.body.id);
  const updated = await request(`admin/categories/${result.body.id}`, 'PUT', { ...result.body, name: name + ' edited' });
  assert.equal(updated.status, 200);
  assert.equal((await request('admin/categories', 'POST', updated.body)).status, 409);
  assert.equal((await request('admin/categories/1', 'DELETE')).status, 409);
  assert.equal((await request(`admin/categories/${result.body.id}`, 'DELETE')).status, 204);
});
test('unknown endpoints, malformed JSON and excessive bodies produce clear HTTP errors', async () => {
  assert.equal((await request('missing-route')).status, 404);
  const malformed = await fetch(base + '/api/admin/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
  const tooLarge = await request('admin/events', 'POST', { name: 'x'.repeat(40000) });
  assert.equal(tooLarge.status, 413);
});
