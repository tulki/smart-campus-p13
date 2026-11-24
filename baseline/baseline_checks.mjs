// Baseline checks for the frozen Practice #11/12 Smart Campus checker.
// The engine below is copied unchanged from the published version 1795281215-089d
// (https://claude.ai/artifact/HNWMwQNuZejGht4x3YTHey). Rules are NOT modified.
import { test } from "node:test";
import assert from "node:assert/strict";

const SAMPLE_ROOMS = [
  { id: "r1", name: "Engineering 101", blocked: false },
  { id: "r2", name: "Business 220", blocked: false },
  { id: "r3", name: "Biology Lab", blocked: true },
];
const SAMPLE_BOOKINGS = [
  { id: "b1", roomId: "r1", start: 540, end: 600, bookedBy: "Prof. Tanaka" },
  { id: "b2", roomId: "r1", start: 720, end: 780, bookedBy: "Prof. Tanaka" },
  { id: "b3", roomId: "r2", start: 600, end: 660, bookedBy: "Dr. Patel" },
];
const NOW = 510; // 08:30, the baseline default
const MINUTES_PER_DAY = 1440, MAX_DURATION = 120;
const overlaps = (a, b) => a.start < b.end && b.start < a.end;
function checkAvailability({ start, end }, room, bookings, now) {
  if (start < 0 || end < 0) return { available: false, reasonCode: "INVALID_TIME" };
  if (start >= end) return { available: false, reasonCode: "INVALID_TIME" };
  if (end > MINUTES_PER_DAY) return { available: false, reasonCode: "INVALID_TIME" };
  if (start <= now) return { available: false, reasonCode: "PAST_TIME" };
  if (!room) return { available: false, reasonCode: "NO_ROOM" };
  if (room.blocked) return { available: false, reasonCode: "ROOM_BLOCKED" };
  if (end - start > MAX_DURATION) return { available: false, reasonCode: "TOO_LONG" };
  if (bookings.some((b) => b.roomId === room.id && overlaps({ start, end }, b)))
    return { available: false, reasonCode: "OVERLAP" };
  return { available: true, reasonCode: "AVAILABLE" };
}
const r = (id) => SAMPLE_ROOMS.find((x) => x.id === id);

test("baseline: free interval is available", () =>
  assert.equal(checkAvailability({ start: 630, end: 690 }, r("r1"), SAMPLE_BOOKINGS, NOW).reasonCode, "AVAILABLE"));
test("baseline: overlap is unavailable", () =>
  assert.equal(checkAvailability({ start: 570, end: 630 }, r("r1"), SAMPLE_BOOKINGS, NOW).reasonCode, "OVERLAP"));
test("baseline: blocked room is unavailable", () =>
  assert.equal(checkAvailability({ start: 630, end: 690 }, r("r3"), SAMPLE_BOOKINGS, NOW).reasonCode, "ROOM_BLOCKED"));
test("baseline: more than 120 minutes is rejected", () =>
  assert.equal(checkAvailability({ start: 600, end: 721 }, r("r2"), SAMPLE_BOOKINGS, NOW).reasonCode, "TOO_LONG"));
test("baseline: start not after current time is rejected", () =>
  assert.equal(checkAvailability({ start: 480, end: 540 }, r("r2"), SAMPLE_BOOKINGS, NOW).reasonCode, "PAST_TIME"));
test("baseline: touching endpoints are allowed", () =>
  assert.equal(checkAvailability({ start: 600, end: 720 }, r("r1"), SAMPLE_BOOKINGS, NOW).reasonCode, "AVAILABLE"));
test("baseline: start >= end is rejected", () =>
  assert.equal(checkAvailability({ start: 700, end: 700 }, r("r2"), SAMPLE_BOOKINGS, NOW).reasonCode, "INVALID_TIME"));
test("baseline: bookings are not changed", () => {
  const before = JSON.stringify(SAMPLE_BOOKINGS);
  checkAvailability({ start: 570, end: 630 }, r("r1"), SAMPLE_BOOKINGS, NOW);
  assert.equal(JSON.stringify(SAMPLE_BOOKINGS), before);
});
