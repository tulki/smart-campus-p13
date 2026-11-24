// Appsmith JS object "Rules" (copied from the Appsmith editor, app "Smart Campus Checker P13 (low-code)").
// This is the only script in the low-code app. Widgets: tblBookings, inpNow, inpStart, inpDuration,
// swBlocked, btnCheck (onClick = {{Rules.run()}}), txtResult (text bound to appsmith.store.result).
export default {
  // Fictional data only - the same three bookings as the code-based version.
  roomName: "Study Room A (fictional)",
  maxDuration: 120,
  bookings: [
    { id: "B1", start: "09:00", end: "10:00", title: "Algorithms lecture" },
    { id: "B2", start: "12:00", end: "13:00", title: "Study group" },
    { id: "B3", start: "14:00", end: "15:00", title: "Lab session" }
  ],
  toMin (t) {
    const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(t || "").trim());
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  },
  fmt (min) {
    return String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(min % 60).padStart(2, "0");
  },
  // Same contract: returns { available, reasonCode, message } and never changes this.bookings.
  check (nowText, startText, durationText, blocked) {
    const bad = (code, text) => ({ available: false, reasonCode: code, message: "Validation error: " + text });
    const now = this.toMin(nowText);
    if (now === null) return bad("INVALID_NOW", "Current time must be a valid time (HH:MM).");
    const start = this.toMin(startText);
    if (start === null) return bad("INVALID_START", "Start time is required and must be a valid time (HH:MM).");
    const raw = String(durationText ?? "").trim();
    if (raw === "") return bad("INVALID_DURATION", "Duration is required.");
    const d = Number(raw);
    if (!Number.isInteger(d)) return bad("INVALID_DURATION", "Duration must be a whole number of minutes.");
    if (d <= 0 || d > this.maxDuration) return bad("INVALID_DURATION", "Duration must be greater than 0 and at most 120 minutes.");
    if (start <= now) return bad("PAST_START", "Start time must be in the future (after " + this.fmt(now) + ").");
    if (start + d > 1440) return bad("ENDS_NEXT_DAY", "The booking must end by 24:00 on the same day.");
    const end = start + d;
    if (blocked === true) return { available: false, reasonCode: "ROOM_BLOCKED", message: "Unavailable: the room is blocked." };
    const hit = this.bookings.find(b => start < this.toMin(b.end) && this.toMin(b.start) < end);
    if (hit) return { available: false, reasonCode: "OVERLAP", message: "Unavailable: " + this.fmt(start) + "-" + this.fmt(end) + " overlaps the existing booking " + hit.start + "-" + hit.end + " (" + hit.title + ")." };
    return { available: true, reasonCode: "AVAILABLE", message: "Available: " + this.roomName + " is free from " + this.fmt(start) + " to " + this.fmt(end) + "." };
  },
  async run () {
    await storeValue("result", this.check(inpNow.text, inpStart.text, inpDuration.text, swBlocked.isSwitchedOn), false);
  }
}
