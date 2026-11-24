// Smart Campus Room Availability Checker - booking rules (no DOM code here).
// Shared contract: inputs = start time, duration, blocked flag, fictional bookings
// (+ the reference "current time"); output = { available, reasonCode, message }.

const ROOM_NAME = "Study Room A (fictional)";
const MAX_DURATION = 120; // AC2
const MINUTES_PER_DAY = 1440;
const DEFAULT_NOW = "08:30"; // fixed reference clock, so the tests are repeatable

// Fictional bookings, no real personal data. Frozen so a check can never change them (AC5).
const BOOKINGS = Object.freeze([
  Object.freeze({ id: "B1", start: "09:00", end: "10:00", title: "Algorithms lecture" }),
  Object.freeze({ id: "B2", start: "12:00", end: "13:00", title: "Study group" }),
  Object.freeze({ id: "B3", start: "14:00", end: "15:00", title: "Lab session" }),
]);

// ---------- 1. Validation (AC1, AC2, AC6) ----------
function parseTime(value) {
  if (typeof value !== "string") return null;
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

function fmt(min) {
  return String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(min % 60).padStart(2, "0");
}

function invalid(reasonCode, text) {
  return { ok: false, result: { available: false, reasonCode, message: "Validation error: " + text } };
}

function validateRequest(req) {
  const now = parseTime(req.now ?? DEFAULT_NOW);
  if (now === null) return invalid("INVALID_NOW", "Current time must be a valid time (HH:MM).");
  const start = parseTime(req.startTime);
  if (start === null) return invalid("INVALID_START", "Start time is required and must be a valid time (HH:MM).");
  const raw = typeof req.duration === "string" ? req.duration.trim() : req.duration;
  if (raw === "" || raw === null || raw === undefined) return invalid("INVALID_DURATION", "Duration is required.");
  const duration = Number(raw);
  if (!Number.isInteger(duration)) return invalid("INVALID_DURATION", "Duration must be a whole number of minutes.");
  if (duration <= 0 || duration > MAX_DURATION)
    return invalid("INVALID_DURATION", `Duration must be greater than 0 and at most ${MAX_DURATION} minutes.`);
  if (start <= now) return invalid("PAST_START", `Start time must be in the future (after ${fmt(now)}).`);
  if (start + duration > MINUTES_PER_DAY) return invalid("ENDS_NEXT_DAY", "The booking must end by 24:00 on the same day.");
  if (typeof req.blocked !== "boolean") return invalid("INVALID_STATUS", "Room status must be Open or Blocked.");
  return { ok: true, value: { start, end: start + duration, blocked: req.blocked } };
}

// ---------- 2. Availability calculation (AC3, AC4, AC5) ----------
function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd; // touching endpoints are not an overlap
}

function calculateAvailability({ start, end, blocked }, bookings) {
  if (blocked) return { available: false, reasonCode: "ROOM_BLOCKED", message: "Unavailable: the room is blocked." };
  const hit = bookings.find((b) => overlaps(start, end, parseTime(b.start), parseTime(b.end)));
  if (hit)
    return {
      available: false,
      reasonCode: "OVERLAP",
      message: `Unavailable: ${fmt(start)}-${fmt(end)} overlaps the existing booking ${hit.start}-${hit.end} (${hit.title}).`,
    };
  return { available: true, reasonCode: "AVAILABLE", message: `Available: ${ROOM_NAME} is free from ${fmt(start)} to ${fmt(end)}.` };
}

// Public entry point: validation first, then the deterministic decision. Read-only on bookings.
function checkRoom(req, bookings = BOOKINGS) {
  const v = validateRequest(req);
  return v.ok ? calculateAvailability(v.value, bookings) : v.result;
}

const Rules = { ROOM_NAME, MAX_DURATION, DEFAULT_NOW, BOOKINGS, parseTime, fmt, validateRequest, calculateAvailability, checkRoom };
if (typeof module !== "undefined") module.exports = Rules;
