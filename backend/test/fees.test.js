const test = require("node:test");
const assert = require("node:assert/strict");
const { applicationFeeCents, sellerNetCents } = require("../utils/fees");

test("ten percent fee on a $20 gig leaves the seller $18", () => {
  assert.equal(applicationFeeCents(2000, 10), 200);
  assert.equal(sellerNetCents(2000, 10), 1800);
});

test("fee rounds to the nearest cent", () => {
  assert.equal(applicationFeeCents(999, 10), 100);
  assert.equal(applicationFeeCents(1995, 10), 200);
});

test("a zero percent fee pays the seller in full", () => {
  assert.equal(applicationFeeCents(5000, 0), 0);
  assert.equal(sellerNetCents(5000, 0), 5000);
});
