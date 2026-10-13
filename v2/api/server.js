const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./event_db');
const validate = require('./validation');
const { HttpError } = validate;

const app = express();
const deploymentPath = (process.env.APP_BASE_PATH || '').replace(/\/+$/, '');
if (deploymentPath) {
  // Some Passenger installations retain the public URL prefix in the forwarded request.
  app.use((req, res, next) => {
    if (req.url === deploymentPath) return res.redirect(308, deploymentPath + '/');
    if (req.url.startsWith(deploymentPath + '/') || req.url.startsWith(deploymentPath + '?')) {
      req.url = req.url.slice(deploymentPath.length);
      if (req.url.startsWith('?')) req.url = '/' + req.url;
    }
    next();
  });
}
app.disable('x-powered-by');
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({ origin(origin, callback) {
  callback(null, !origin || allowedOrigins.includes(origin));
} }));
app.use(express.json({ limit: '32kb' }));
app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

const asyncRoute = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
// Only this date produced by the server is interpolated. Request values use SQL placeholders.
const sydneyToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Sydney' }).format(new Date());
const publicCondition = () => `e.status = 'active' AND e.event_date >= '${sydneyToday()}'`;
const eventFields = () => `e.event_id AS id, e.name, e.summary, e.description, e.purpose,
  e.location_name AS locationName, e.suburb, DATE_FORMAT(e.event_date, '%Y-%m-%d') AS date,
  TIME_FORMAT(e.start_time, '%H:%i') AS startTime, TIME_FORMAT(e.end_time, '%H:%i') AS endTime,
  e.meeting_point AS meetingPoint, e.ticket_price AS ticketPrice, e.funding_goal AS fundingGoal,
  e.funding_raised AS donationRaised,
  e.funding_raised + COALESCE((SELECT SUM(r.total_amount) FROM registrations r WHERE r.event_id = e.event_id), 0) AS fundingRaised,
  (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.event_id) AS registrationCount,
  COALESCE((SELECT SUM(r.tickets) FROM registrations r WHERE r.event_id = e.event_id), 0) AS ticketsBooked,
  e.image_path AS imagePath, e.latitude, e.longitude, e.status,
  CASE WHEN e.status = 'suspended' THEN 'suspended'
    WHEN e.status = 'past' OR e.event_date < '${sydneyToday()}' THEN 'past' ELSE 'active' END AS displayStatus,
  c.category_id AS categoryId, c.name AS category,
  o.organization_id AS organizationId, o.name AS organization, o.summary AS organizationSummary`;
const eventJoin = `FROM events e JOIN categories c ON c.category_id = e.category_id
  JOIN organizations o ON o.organization_id = e.organization_id`;
const registrationFields = `registration_id AS id, full_name AS fullName, email, phone, tickets,
  ticket_price AS ticketPrice, total_amount AS totalAmount,
  DATE_FORMAT(registered_at, '%Y-%m-%dT%H:%i:%s.000Z') AS registeredAt`;

async function detail(eventId, admin = false) {
  const [rows] = await pool.execute(`SELECT ${eventFields()} ${eventJoin}
    WHERE e.event_id = ? ${admin ? '' : `AND ${publicCondition()}`}`, [eventId]);
  if (!rows.length) throw new HttpError(404, 'This event is unavailable. Choose another event.');
  // Visitors see purchase records; the staff view also includes contact details.
  const publicFields = `registration_id AS id, full_name AS fullName, tickets, total_amount AS totalAmount,
    DATE_FORMAT(registered_at, '%Y-%m-%dT%H:%i:%s.000Z') AS registeredAt`;
  const [registrations] = await pool.execute(`SELECT ${admin ? registrationFields : publicFields}
    FROM registrations WHERE event_id = ? ORDER BY registered_at DESC, registration_id DESC`, [eventId]);
  return { ...rows[0], registrations };
}

async function transaction(work) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

app.get('/api/health', asyncRoute(async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok', version: require('./package.json').version });
}));
app.get('/api/categories', asyncRoute(async (_req, res) => {
  const [rows] = await pool.query('SELECT category_id AS id, name, slug FROM categories ORDER BY category_id');
  res.json(rows);
}));
app.get('/api/organizations', asyncRoute(async (_req, res) => {
  const [rows] = await pool.query('SELECT organization_id AS id, name, summary FROM organizations ORDER BY organization_id');
  res.json(rows);
}));
app.get('/api/events/featured', asyncRoute(async (_req, res) => {
  const [rows] = await pool.query(`SELECT ${eventFields()} ${eventJoin}
    WHERE ${publicCondition()} ORDER BY e.event_date, e.start_time, e.event_id LIMIT 4`);
  res.json(rows);
}));
app.get('/api/events', asyncRoute(async (req, res) => {
  const { date = '', location = '', category = '' } = req.query;
  if ([date, location, category].some(value => typeof value !== 'string')) throw new HttpError(400, 'Use one value for each filter.');
  if (date && !validate.validDate(date)) throw new HttpError(400, 'Enter a valid date in YYYY-MM-DD format.');
  if (location.length > 80) throw new HttpError(400, 'Location is too long (maximum 80 characters).');
  const conditions = [publicCondition()];
  const values = [];
  if (date) { conditions.push('e.event_date = ?'); values.push(date); }
  if (location.trim()) {
    conditions.push('(e.suburb LIKE ? OR e.location_name LIKE ?)');
    const term = `%${location.trim().replace(/[\\%_]/g, '\\$&')}%`;
    values.push(term, term);
  }
  if (category) { conditions.push('e.category_id = ?'); values.push(validate.id(category, 'category')); }
  const [rows] = await pool.execute(`SELECT ${eventFields()} ${eventJoin}
    WHERE ${conditions.join(' AND ')} ORDER BY e.event_date, e.start_time, e.event_id`, values);
  res.json(rows);
}));
app.get('/api/events/:id', asyncRoute(async (req, res) => res.json(await detail(validate.id(req.params.id)))));

app.post('/api/events/:id/registrations', asyncRoute(async (req, res) => {
  const eventId = validate.id(req.params.id);
  const data = validate.registration(req.body);
  const result = await transaction(async connection => {
    // Bookings and deletion lock the same event, so they cannot race past the guard.
    const [events] = await connection.execute(`SELECT event_id, ticket_price FROM events
      WHERE event_id = ? AND status = 'active' AND event_date >= ? FOR UPDATE`, [eventId, sydneyToday()]);
    if (!events.length) throw new HttpError(404, 'This event is no longer accepting registrations.');
    const ticketPrice = Number(events[0].ticket_price);
    const totalAmount = Number((ticketPrice * data.tickets).toFixed(2));
    const [insert] = await connection.execute(`INSERT INTO registrations
      (event_id, full_name, email, phone, tickets, ticket_price, total_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?)`, [eventId, data.fullName, data.email, data.phone, data.tickets, ticketPrice, totalAmount]);
    const [records] = await connection.execute(`SELECT ${registrationFields} FROM registrations WHERE registration_id = ?`, [insert.insertId]);
    return { ...records[0], eventId };
  });
  res.status(201).location(`/api/events/${eventId}`).json(result);
}));

app.get('/api/admin/events', asyncRoute(async (_req, res) => {
  const [rows] = await pool.query(`SELECT ${eventFields()} ${eventJoin} ORDER BY e.event_date DESC, e.start_time, e.event_id DESC`);
  res.json(rows);
}));
app.get('/api/admin/events/:id', asyncRoute(async (req, res) => res.json(await detail(validate.id(req.params.id), true))));
const eventColumns = ['name', 'summary', 'description', 'purpose', 'location_name', 'suburb', 'event_date',
  'start_time', 'end_time', 'meeting_point', 'ticket_price', 'funding_goal', 'funding_raised',
  'image_path', 'latitude', 'longitude', 'status', 'category_id', 'organization_id'];
function eventValues(data) {
  return [data.name, data.summary, data.description, data.purpose, data.locationName, data.suburb, data.date,
    data.startTime, data.endTime, data.meetingPoint, data.ticketPrice, data.fundingGoal, data.donationRaised,
    data.imagePath, data.latitude, data.longitude, data.status, data.categoryId, data.organizationId];
}
app.post('/api/admin/events', asyncRoute(async (req, res) => {
  const data = validate.event(req.body);
  const [result] = await pool.execute(`INSERT INTO events (${eventColumns.join(', ')})
    VALUES (${eventColumns.map(() => '?').join(', ')})`, eventValues(data));
  res.status(201).location(`/api/admin/events/${result.insertId}`).json(await detail(result.insertId, true));
}));
app.put('/api/admin/events/:id', asyncRoute(async (req, res) => {
  const eventId = validate.id(req.params.id);
  const data = validate.event(req.body);
  await transaction(async connection => {
    const [rows] = await connection.execute('SELECT event_id FROM events WHERE event_id = ? FOR UPDATE', [eventId]);
    if (!rows.length) throw new HttpError(404, 'Event not found. Refresh the event list.');
    await connection.execute(`UPDATE events SET ${eventColumns.map(column => `${column} = ?`).join(', ')}
      WHERE event_id = ?`, [...eventValues(data), eventId]);
  });
  res.json(await detail(eventId, true));
}));
app.delete('/api/admin/events/:id', asyncRoute(async (req, res) => {
  const eventId = validate.id(req.params.id);
  await transaction(async connection => {
    const [rows] = await connection.execute('SELECT event_id FROM events WHERE event_id = ? FOR UPDATE', [eventId]);
    if (!rows.length) throw new HttpError(404, 'Event not found. Refresh the event list.');
    const [registrations] = await connection.execute('SELECT registration_id FROM registrations WHERE event_id = ? LIMIT 1', [eventId]);
    if (registrations.length) throw new HttpError(409, 'This event has registrations and cannot be deleted. Suspend it to close bookings.');
    await connection.execute('DELETE FROM events WHERE event_id = ?', [eventId]);
  });
  res.status(204).end();
}));

app.post('/api/admin/categories', asyncRoute(async (req, res) => {
  const { name, slug } = validate.category(req.body);
  const [result] = await pool.execute('INSERT INTO categories (name, slug) VALUES (?, ?)', [name, slug]);
  res.status(201).json({ id: result.insertId, name, slug });
}));
app.put('/api/admin/categories/:id', asyncRoute(async (req, res) => {
  const categoryId = validate.id(req.params.id, 'category');
  const { name, slug } = validate.category(req.body);
  const [result] = await pool.execute('UPDATE categories SET name = ?, slug = ? WHERE category_id = ?', [name, slug, categoryId]);
  if (!result.affectedRows) throw new HttpError(404, 'Category not found.');
  res.json({ id: categoryId, name, slug });
}));
app.delete('/api/admin/categories/:id', asyncRoute(async (req, res) => {
  const categoryId = validate.id(req.params.id, 'category');
  const [result] = await pool.execute('DELETE FROM categories WHERE category_id = ?', [categoryId]);
  if (!result.affectedRows) throw new HttpError(404, 'Category not found.');
  res.status(204).end();
}));

app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));
app.use('/admin', express.static(path.join(__dirname, '..', 'adminside')));
app.use(express.static(path.join(__dirname, '..', 'clientside')));
app.use((_req, res) => res.status(404).send('Page not found. Open the event list or staff website.'));
app.use((error, req, res, _next) => {
  if (error instanceof HttpError) return res.status(error.status).json({ error: error.message, fields: error.fields });
  if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Send valid JSON form data.' });
  if (error.type === 'entity.too.large') return res.status(413).json({ error: 'The form is too large. Shorten the event description.' });
  if (error.code === 'ER_DUP_ENTRY') {
    const message = req.path.endsWith('/registrations')
      ? 'This email is already registered for this event. Each person can register once per event.'
      : 'A category with that name or slug already exists.';
    return res.status(409).json({ error: message });
  }
  if (error.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ error: 'This category is used by an event and cannot be deleted.' });
  if (error.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ error: 'Choose an existing category and organiser. Refresh the form and try again.' });
  console.error('Event service error:', error.code || error.message);
  res.status(503).json({ error: 'The event service is unavailable. Please try again shortly.' });
});

function start() {
  const port = Number(process.env.PORT || 3027);
  return pool.query('SELECT 1').then(() => {
    const server = app.listen(port, '0.0.0.0', () => console.log(`Driftline v2: http://localhost:${port}`));
    const stop = () => server.close(() => pool.end().then(() => process.exit(0)));
    process.once('SIGTERM', stop);
    process.once('SIGINT', stop);
    return server;
  }).catch(error => {
    console.error('Could not connect to MySQL:', error.code || error.message);
    process.exitCode = 1;
    pool.end();
  });
}
if (require.main === module) start();
module.exports = app;
module.exports.start = start;
