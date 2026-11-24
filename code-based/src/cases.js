// The common test inputs T1-T8, prepared before implementation and used for BOTH solutions.
// Reference current time for every case: 08:30. Bookings: 09:00-10:00, 12:00-13:00, 14:00-15:00.
const CASES = [
  { id: "T1", name: "Valid free interval", input: { startTime: "10:30", duration: 60, blocked: false }, expect: { available: true, reasonCode: "AVAILABLE" }, expected: "Available" },
  { id: "T2", name: "Overlap with an existing booking", input: { startTime: "09:30", duration: 60, blocked: false }, expect: { available: false, reasonCode: "OVERLAP" }, expected: "Unavailable (overlap 09:00-10:00)" },
  { id: "T3", name: "Blocked room", input: { startTime: "10:30", duration: 60, blocked: true }, expect: { available: false, reasonCode: "ROOM_BLOCKED" }, expected: "Unavailable (blocked)" },
  { id: "T4", name: "Duration = 0", input: { startTime: "10:30", duration: 0, blocked: false }, expect: { available: false, reasonCode: "INVALID_DURATION" }, expected: "Validation error" },
  { id: "T5", name: "Duration = 121 minutes", input: { startTime: "10:30", duration: 121, blocked: false }, expect: { available: false, reasonCode: "INVALID_DURATION" }, expected: "Validation error" },
  { id: "T6", name: "Past start time", input: { startTime: "08:00", duration: 30, blocked: false }, expect: { available: false, reasonCode: "PAST_START" }, expected: "Validation error" },
  { id: "T7", name: "Adjacent non-overlapping interval", input: { startTime: "10:00", duration: 120, blocked: false }, expect: { available: true, reasonCode: "AVAILABLE" }, expected: "Available (10:00-12:00 touches both bookings)" },
  { id: "T8", name: "Booking data unchanged after checks", input: null, expect: null, expected: "Bookings identical before and after T1-T7" },
];
if (typeof module !== "undefined") module.exports = CASES;
