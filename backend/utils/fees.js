function applicationFeeCents(amountCents, feePercent) {
  return Math.round((amountCents * feePercent) / 100);
}

function sellerNetCents(amountCents, feePercent) {
  return amountCents - applicationFeeCents(amountCents, feePercent);
}

module.exports = { applicationFeeCents, sellerNetCents };
