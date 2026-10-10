class HttpError extends Error {
  constructor(status, message, fields = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

function id(value, label = 'event') {
  if (!/^[1-9]\d*$/.test(String(value)) || Number(value) > 2147483647) {
    throw new HttpError(400, `Choose a valid ${label}.`);
  }
  return Number(value);
}

function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T12:00:00Z`)) &&
    new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value &&
    value >= '1000-01-01' && value <= '9999-12-31';
}

function text(body, name, max, fields, min = 1) {
  const value = typeof body[name] === 'string' ? body[name].trim() : '';
  if (value.length < min || value.length > max || /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value)) {
    fields[name] = `Enter ${min === 1 ? 'a value' : `at least ${min} characters`} (maximum ${max} characters).`;
  }
  return value;
}

function number(body, name, min, max, fields, whole = false) {
  const raw = body[name];
  const value = Number(raw);
  if ((typeof raw !== 'number' && typeof raw !== 'string') ||
      String(raw).trim() === '' || !Number.isFinite(value) || value < min || value > max ||
      (whole && !Number.isInteger(value))) {
    fields[name] = `Enter ${whole ? 'a whole number' : 'a number'} between ${min} and ${max}.`;
  }
  return value;
}

function amount(body, name, min, max, fields) {
  const value = number(body, name, min, max, fields);
  if (!/^\d+(\.\d{1,2})?$/.test(String(body[name]))) fields[name] = 'Use a non-negative amount with at most 2 decimal places.';
  return value;
}

function object(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Send the form as a JSON object.');
  }
  return body;
}

function registration(body) {
  object(body);
  const fields = {};
  const fullName = text(body, 'fullName', 120, fields, 2);
  const email = text(body, 'email', 150, fields).toLowerCase();
  const phone = text(body, 'phone', 30, fields, 6);
  const tickets = number(body, 'tickets', 1, 20, fields, true);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.email = 'Enter a valid email address.';
  if (!/^\+?[0-9 ()-]{6,30}$/.test(phone) || phone.replace(/\D/g, '').length < 6) {
    fields.phone = 'Enter a contact number with at least 6 digits.';
  }
  if (Object.keys(fields).length) throw new HttpError(400, 'Check the highlighted registration details.', fields);
  return { fullName, email, phone, tickets };
}

function event(body) {
  object(body);
  const fields = {};
  const data = {};
  for (const [name, max] of Object.entries({ name: 160, summary: 300, description: 5000,
    purpose: 300, locationName: 120, suburb: 80, meetingPoint: 250 })) {
    data[name] = text(body, name, max, fields);
  }
  data.categoryId = number(body, 'categoryId', 1, 2147483647, fields, true);
  data.organizationId = number(body, 'organizationId', 1, 2147483647, fields, true);
  data.date = body.date;
  if (!validDate(data.date)) fields.date = 'Choose a valid event date.';
  data.startTime = body.startTime;
  data.endTime = body.endTime;
  const time = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!time.test(data.startTime || '')) fields.startTime = 'Choose a valid start time.';
  if (!time.test(data.endTime || '') || data.endTime <= data.startTime) {
    fields.endTime = 'The end time must be after the start time on the same day.';
  }
  data.ticketPrice = amount(body, 'ticketPrice', 0, 999999.99, fields);
  data.fundingGoal = amount(body, 'fundingGoal', 0.01, 99999999.99, fields);
  data.donationRaised = amount(body, 'donationRaised', 0, 99999999.99, fields);
  data.latitude = number(body, 'latitude', -90, 90, fields);
  data.longitude = number(body, 'longitude', -180, 180, fields);
  data.status = body.status;
  if (!['active', 'past', 'suspended'].includes(data.status)) fields.status = 'Choose Active, Past or Suspended.';
  data.imagePath = text(body, 'imagePath', 150, fields);
  if (!/^assets\/images\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/i.test(data.imagePath)) {
    fields.imagePath = 'Choose one of the supplied event images.';
  }
  if (Object.keys(fields).length) throw new HttpError(400, 'Check the highlighted event details.', fields);
  return data;
}

function category(body) {
  object(body);
  const fields = {};
  const name = text(body, 'name', 80, fields, 2);
  const slug = text(body, 'slug', 80, fields);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fields.slug = 'Use lowercase words separated by hyphens.';
  if (Object.keys(fields).length) throw new HttpError(400, 'Check the category details.', fields);
  return { name, slug };
}

module.exports = { HttpError, id, validDate, registration, event, category };
