// Résume un rapport JSON de Jest : une ligne par test
const r = require(require("path").resolve(process.argv[2]));
for (const s of r.testResults) {
  console.log("##", require("path").basename(s.name), s.assertionResults.length ? "" : (s.message || "").replace(/\x1b\[[0-9;]*m/g, "").slice(0, 400));
  for (const t of s.assertionResults)
    console.log(t.status === "passed" ? "  OK " : "  KO ", t.fullName, t.status !== "passed" ? "| " + (t.failureMessages[0] || "").replace(/\x1b\[[0-9;]*m/g, "").split("\n").filter((l) => /Expected|Received|Unable|Error:/.test(l)).map((l) => l.trim()).join(" ").slice(0, 170) : "");
}
console.log(r.numPassedTests, "passed", r.numFailedTests, "failed", r.numTotalTests, "total");
