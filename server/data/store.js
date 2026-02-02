import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, 'locations.json');

function loadData() {
  if (!existsSync(DATA_FILE)) {
    return { locations: {}, businessLocation: null, lateResponses: {} };
  }
  try {
    const data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
    if (!data.lateResponses) data.lateResponses = {};
    return data;
  } catch {
    return { locations: {}, businessLocation: null, lateResponses: {} };
  }
}

function saveData(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export function getClientLocation(meetingId) {
  const data = loadData();
  return data.locations[meetingId] || null;
}

export function setClientLocation(meetingId, location) {
  const data = loadData();
  data.locations[meetingId] = {
    ...location,
    updatedAt: new Date().toISOString()
  };
  saveData(data);
  return data.locations[meetingId];
}

export function setBusinessLocation(lat, lng) {
  const data = loadData();
  data.businessLocation = { lat, lng, updatedAt: new Date().toISOString() };
  saveData(data);
  return data.businessLocation;
}

export function getBusinessLocation() {
  const data = loadData();
  return data.businessLocation;
}

export function getLocationsForEvents(eventIds) {
  const data = loadData();
  const result = {};
  eventIds.forEach(id => {
    if (data.locations[id]) result[id] = data.locations[id];
  });
  return result;
}

export function setLateResponse(eventId, choice) {
  const data = loadData();
  data.lateResponses[eventId] = {
    choice,
    respondedAt: new Date().toISOString()
  };
  saveData(data);
  return data.lateResponses[eventId];
}

export function getLateResponse(eventId) {
  const data = loadData();
  return data.lateResponses[eventId] || null;
}
