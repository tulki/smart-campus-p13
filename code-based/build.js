// Inlines src/rules.js, src/cases.js and src/ui.js into one self-contained index.html.
const fs = require("fs");
const p = (f) => fs.readFileSync(__dirname + "/src/" + f, "utf8");
const html = p("page.html")
  .replace("/*RULES*/", () => p("rules.js"))
  .replace("/*CASES*/", () => p("cases.js"))
  .replace("/*UI*/", () => p("ui.js"));
fs.writeFileSync(__dirname + "/index.html", html);
console.log("built index.html", html.length, "bytes");
