import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, 'locations.json');

function loadData() {
  if (!existsSync(DATA_FILE)) {
    return { locations: {}, businessLocation: null };
  }
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return { locations: {}, businessLocation: null };
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
