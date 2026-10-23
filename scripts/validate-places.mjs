#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const match = html.match(/const places = \[([\s\S]*?)\n  \];/);
if (!match) {
  console.error('Could not find the places array in index.html.');
  process.exit(1);
}

let places;
try {
  // The array is static, trusted source data maintained in this repository.
  places = Function('return [' + match[1] + ']')();
} catch (error) {
  console.error('Could not parse the places array:', error.message);
  process.exit(1);
}

const errors = [];
const warnings = [];
const names = new Set();
const byCoordinates = new Map();

for (const place of places) {
  if (!place.name || typeof place.name !== 'string') errors.push('Place has no valid name.');
  if (names.has(place.name)) errors.push('Duplicate place name: ' + place.name);
  names.add(place.name);

  if (!Number.isFinite(place.lat) || place.lat < -90 || place.lat > 90) {
    errors.push('Invalid latitude for ' + place.name + ': ' + place.lat);
  }
  if (!Number.isFinite(place.lng) || place.lng < -180 || place.lng > 180) {
    errors.push('Invalid longitude for ' + place.name + ': ' + place.lng);
  }

  const key = place.lat + ',' + place.lng;
  if (!byCoordinates.has(key)) byCoordinates.set(key, []);
  byCoordinates.get(key).push(place.name);
}

for (const [coordinates, placeNames] of byCoordinates) {
  if (placeNames.length > 1) {
    warnings.push('Shared coordinates ' + coordinates + ': ' + placeNames.join('; '));
  }
}

const approximate = places.filter(place => place.approx === true);
console.log('Places checked:', places.length);
console.log('Marked approximate:', approximate.length);
console.log('Shared-coordinate groups:', warnings.length);
for (const warning of warnings) console.warn('WARNING:', warning);
for (const error of errors) console.error('ERROR:', error);

if (errors.length) process.exit(1);
console.log('Validation passed. Coordinate collisions are warnings and need human verification.');
