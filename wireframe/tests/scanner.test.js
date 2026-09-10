import test from "node:test";
import assert from "node:assert/strict";
import cases from "../../data/moderation-test-cases.json" with { type: "json" };
import { scanContent, normalizeText } from "../src/mock/scanner.js";
test("supplied nested lexicon fixtures resolve longest high-risk match", () => {
  for (const c of cases.must_resolve_high) {
    const result = scanContent(c.text);
    assert.equal(result.risk, "high", c.text);
    assert.ok(result.evidence.includes(c.expect_term));
    assert.ok(!result.evidence.includes(c.not));
  }
});
test("supplied positive fixtures classify high; mixed language queues by current plan", () => {
  for (const c of cases.must_block) {
    const result = scanContent(c.text);
    assert.equal(result.risk, "high", c.text);
    assert.equal(
      result.status,
      /[a-z]/i.test(c.text) ? "pending" : "rejected",
      c.text,
    );
  }
});
test("legacy must_not_block expectations are evaluated under labelled alternative policy", () => {
  for (const c of cases.must_not_block) {
    assert.equal(scanContent(c.text, "mid-review").status, "pending", c.text);
  }
});
test("default policy keeps mid-risk block distinct from the older mid-review recommendation", () => {
  const text = "我们提供合规换汇服务";
  assert.equal(scanContent(text).status, "rejected");
  assert.equal(scanContent(text, "mid-review").status, "pending");
});
test("normalisation handles spacing punctuation width and supported traditional forms", () => {
  assert.equal(normalizeText("換 匯"), "换汇");
  for (const text of cases.normalisation_evasions.cases) {
    assert.equal(scanContent(text).risk, scanContent("换汇").risk, text);
    assert.equal(
      scanContent(text).status,
      /[a-z]/i.test(text.normalize("NFKC")) ? "pending" : "rejected",
      text,
    );
  }
});
