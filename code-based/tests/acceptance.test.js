// Acceptance tests T1-T8 for the code-based solution. Run: node --test tests/
const { test } = require("node:test");
const assert = require("node:assert/strict");
const Rules = require("../src/rules.js");
const CASES = require("../src/cases.js");

const snapshot = JSON.stringify(Rules.BOOKINGS);

for (const c of CASES.filter((x) => x.input)) {
  test(`${c.id}: ${c.name} -> ${c.expected}`, () => {
    const r = Rules.checkRoom({ now: Rules.DEFAULT_NOW, ...c.input });
    assert.equal(r.available, c.expect.available);
    assert.equal(r.reasonCode, c.expect.reasonCode);
    assert.equal(typeof r.message, "string");
    assert.ok(r.message.length > 0);
  });
}

test("T8: booking data unchanged after checks", () => {
  for (const c of CASES.filter((x) => x.input)) Rules.checkRoom({ now: Rules.DEFAULT_NOW, ...c.input });
  assert.equal(JSON.stringify(Rules.BOOKINGS), snapshot);
  assert.ok(Object.isFrozen(Rules.BOOKINGS) && Object.isFrozen(Rules.BOOKINGS[0]));
});

// Extra AC6 checks: invalid input gets understandable feedback, never an exception.
test("AC6: empty / malformed input gives a validation message", () => {
  for (const req of [
    { startTime: "", duration: 30, blocked: false },
    { startTime: "25:00", duration: 30, blocked: false },
    { startTime: "<script>", duration: 30, blocked: false },
    { startTime: "10:30", duration: "", blocked: false },
    { startTime: "10:30", duration: "abc", blocked: false },
    { startTime: "10:30", duration: 30.5, blocked: false },
    { startTime: "23:30", duration: 60, blocked: false },
  ]) {
    const r = Rules.checkRoom({ now: "08:30", ...req });
    assert.equal(r.available, false);
    assert.match(r.message, /^Validation error: /);
  }
});
