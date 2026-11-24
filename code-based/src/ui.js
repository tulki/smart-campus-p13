// UI display only: reads the form, calls Rules.checkRoom, shows the result.
// All text goes through textContent (no innerHTML), so user input can never become HTML.
(function () {
  const $ = (id) => document.getElementById(id);
  const form = $("form"), result = $("result"), list = $("bookings");

  $("now").value = Rules.DEFAULT_NOW;
  $("room-name").textContent = Rules.ROOM_NAME;

  function renderBookings() {
    list.replaceChildren();
    for (const b of Rules.BOOKINGS) {
      const li = document.createElement("li");
      li.textContent = `${b.start}-${b.end}  ${b.title}`;
      list.appendChild(li);
    }
  }

  function show(res) {
    result.className = "result " + (res.available ? "ok" : res.message.startsWith("Validation") ? "warn" : "bad");
    result.replaceChildren();
    const head = document.createElement("strong");
    head.textContent = res.available ? "Available" : res.message.startsWith("Validation") ? "Invalid input" : "Unavailable";
    const msg = document.createElement("div");
    msg.textContent = res.message;
    const code = document.createElement("small");
    code.textContent = `available=${res.available}  reasonCode=${res.reasonCode}`;
    result.append(head, msg, code);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    show(Rules.checkRoom({
      now: $("now").value,
      startTime: $("start").value,
      duration: $("duration").value,
      blocked: $("status").value === "blocked",
    }));
  });
  form.addEventListener("input", () => { result.className = "result"; result.replaceChildren(); });

  // Self-test panel: runs the shared cases T1-T8 against the same rules the form uses.
  $("run-tests").addEventListener("click", () => {
    const body = $("tests-body");
    body.replaceChildren();
    const before = JSON.stringify(Rules.BOOKINGS);
    let passed = 0;
    for (const c of CASES) {
      let observed, pass;
      if (c.input) {
        const r = Rules.checkRoom({ now: Rules.DEFAULT_NOW, ...c.input });
        observed = `${r.available ? "Available" : r.message.startsWith("Validation") ? "Validation error" : "Unavailable"} (${r.reasonCode})`;
        pass = r.available === c.expect.available && r.reasonCode === c.expect.reasonCode;
      } else {
        const same = JSON.stringify(Rules.BOOKINGS) === before && Rules.BOOKINGS.length === 3;
        observed = same ? "Bookings identical" : "Bookings changed";
        pass = same;
      }
      if (pass) passed++;
      const tr = document.createElement("tr");
      for (const t of [c.id, c.name, c.expected, observed, pass ? "PASS" : "FAIL"]) {
        const td = document.createElement("td");
        td.textContent = t;
        tr.appendChild(td);
      }
      tr.className = pass ? "pass" : "fail";
      body.appendChild(tr);
    }
    $("tests-summary").textContent = `${passed} / ${CASES.length} passed`;
  });

  renderBookings();
})();
