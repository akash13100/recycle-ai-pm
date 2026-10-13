const defaults = Object.freeze({
  optedOut: false,
  consent: true,
  identityConfidence: 0.95,
  minIdentityConfidence: 0.8,
  orderCount: 6,
  minOrders: 3,
  messagesThisMonth: 0,
  maxMessagesPerMonth: 2,
  marginFloor: 150,
  maxDiscountPct: 5,
  candidates: [],
});

function decide(input) {
  const customer = { ...defaults, ...input };

  if (customer.optedOut || !customer.consent) return 'BLOCKED';
  if (customer.identityConfidence < customer.minIdentityConfidence) return 'HUMAN_REVIEW';
  if (customer.orderCount < customer.minOrders) return 'ABSTAIN';
  if (customer.messagesThisMonth >= customer.maxMessagesPerMonth) return 'BLOCKED';

  const eligible = customer.candidates.filter((candidate) => {
    if (candidate.type === 'DO_NOTHING') return true;
    return candidate.uplift > 0
      && candidate.discountPct <= customer.maxDiscountPct
      && candidate.expectedMargin >= customer.marginFloor;
  });

  if (eligible.length === 0) return 'DO_NOTHING';
  return eligible.sort((a, b) => b.expectedMargin - a.expectedMargin)[0].type;
}

const doNothing = { type: 'DO_NOTHING', uplift: 0, discountPct: 0, expectedMargin: 0 };

const scenarios = [
  {
    name: 'Likely natural reorder',
    input: { candidates: [doNothing, { type: 'REMINDER_ONLY', uplift: 0.01, discountPct: 0, expectedMargin: -4 }] },
    expected: 'DO_NOTHING',
  },
  {
    name: 'Late, responsive, no discount needed',
    input: { candidates: [doNothing, { type: 'ONE_TAP_LINK', uplift: 0.18, discountPct: 0, expectedMargin: 286 }] },
    expected: 'ONE_TAP_LINK',
  },
  {
    name: 'Opted-out customer',
    input: { optedOut: true, candidates: [doNothing] },
    expected: 'BLOCKED',
  },
  {
    name: 'Insufficient purchase history',
    input: { orderCount: 2, candidates: [doNothing] },
    expected: 'ABSTAIN',
  },
  {
    name: 'Discount breaches margin floor',
    input: { candidates: [doNothing, { type: 'BOUNDED_INCENTIVE', uplift: 0.2, discountPct: 5, expectedMargin: 110 }] },
    expected: 'DO_NOTHING',
  },
  {
    name: 'Identity collision',
    input: { identityConfidence: 0.54, candidates: [doNothing] },
    expected: 'HUMAN_REVIEW',
  },
  {
    name: 'Frequency limit reached',
    input: { messagesThisMonth: 2, candidates: [doNothing] },
    expected: 'BLOCKED',
  },
  {
    name: 'Negative uplift estimate',
    input: { candidates: [doNothing, { type: 'REMINDER_ONLY', uplift: -0.02, discountPct: 0, expectedMargin: 190 }] },
    expected: 'DO_NOTHING',
  },
];

let failed = 0;
for (const scenario of scenarios) {
  const actual = decide(scenario.input);
  const passed = actual === scenario.expected;
  if (!passed) failed += 1;
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${scenario.name} -> ${actual}`);
}

console.log(`\n${scenarios.length - failed}/${scenarios.length} scenarios passed`);
if (failed > 0) process.exitCode = 1;

export { decide };

