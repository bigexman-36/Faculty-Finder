import { readFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const match = html.match(/const\s+places\s*=\s*(\[[\s\S]*?\]);/);

if (!match) {
  console.error("Could not find the places array in index.html");
  process.exit(1);
}

let places;
try {
  // The array contains only static object literals maintained in this repository.
  places = new Function("return " + match[1])();
} catch (error) {
  console.error("Could not parse the places array:", error.message);
  process.exit(1);
}

if (!Array.isArray(places) || places.length === 0) {
  console.error("The places array is empty or invalid");
  process.exit(1);
}

const errors = [];
const warnings = [];
const names = new Map();
const coordinates = new Map();

for (const [index, place] of places.entries()) {
  const label = place?.name || `Place #${index + 1}`;

  if (typeof place?.name !== "string" || !place.name.trim()) {
    errors.push(`Entry ${index + 1} has no valid name`);
  } else {
    const key = place.name.trim().toLocaleLowerCase();
    if (names.has(key)) errors.push(`Duplicate place name: "${place.name}"`);
    names.set(key, true);
  }

  if (typeof place?.lat !== "number" || !Number.isFinite(place.lat) ||
      place.lat < -90 || place.lat > 90) {
    errors.push(`${label}: invalid latitude "${place?.lat}"`);
  }
  if (typeof place?.lng !== "number" || !Number.isFinite(place.lng) ||
      place.lng < -180 || place.lng > 180) {
    errors.push(`${label}: invalid longitude "${place?.lng}"`);
  }

  if (Number.isFinite(place?.lat) && Number.isFinite(place?.lng)) {
    const key = `${place.lat},${place.lng}`;
    if (!coordinates.has(key)) coordinates.set(key, []);
    coordinates.get(key).push(label);
  }
}

for (const [coords, labels] of coordinates) {
  if (labels.length > 1) {
    warnings.push(`Shared coordinates ${coords}: ${labels.join("; ")}`);
  }
}

console.log(`Validated ${places.length} place records (${places.filter(p => p.approx === true).length} marked approximate).`);
for (const warning of warnings) console.warn("WARNING:", warning);
if (errors.length) {
  for (const error of errors) console.error("ERROR:", error);
  process.exit(1);
}
console.log("Place data validation passed.");
