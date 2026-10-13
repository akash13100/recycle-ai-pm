const CONTRIBUTION_MARGIN_RATE_BPS = 3500;

const ACTION_DEFINITIONS = [
  { kind: 'doNothing', label: 'Do nothing', detail: 'Likely to reorder naturally', actionCostPaise: 0, discountPct: 0 },
  { kind: 'reminder', label: 'Reminder only', detail: 'WhatsApp reminder, no link', actionCostPaise: 100, discountPct: 0 },
  { kind: 'link', label: 'One-tap reorder link', detail: 'Same product, no discount', actionCostPaise: 300, discountPct: 0 },
  { kind: 'incentive', label: '5% incentive', detail: 'Discount bounded at 5%', actionCostPaise: 300, discountPct: 5 },
];

const QUEUE_LABELS = {
  doNothing: 'Do nothing',
  reminder: 'Reminder only',
  link: 'Send reorder link',
  incentive: 'Offer 5% incentive',
};

export const formatRupees = (value) => `₹${value.toLocaleString('en-IN')}`;
export const formatUplift = (upliftTenths) => `${upliftTenths > 0 ? '+' : ''}${(upliftTenths / 10).toFixed(1)} pp`;

const customerDetails = {
  priya: {
    caseId: '1048', days: 43, range: '28–36', amountRupees: 849, upi: 'priya@okhdfcbank', active: '82%', baseline: '34%',
    timelineLabels: ['7 Jan', '8 Feb', '12 Mar', '13 Apr', '15 May', 'Today'],
    upliftTenths: { doNothing: 0, reminder: 100, link: 300, incentive: 250 },
    expectedAction: 'link',
    reason: 'Priya responds well to a direct reorder link, while a discount adds cost without enough additional lift.',
  },
  arjun: {
    caseId: '1049', days: 36, range: '26–33', amountRupees: 849, upi: 'arjun@okaxis', active: '91%', baseline: '61%',
    timelineLabels: ['23 Jan', '21 Feb', '22 Mar', '20 Apr', '19 May', 'Today'],
    upliftTenths: { doNothing: 0, reminder: 0, link: 5, incentive: 40 },
    expectedAction: 'doNothing',
    reason: 'Arjun has a high natural reorder probability, and every intervention loses money after action cost.',
  },
  meera: {
    caseId: '1050', days: 61, range: '40–50', amountRupees: 699, upi: 'meera@okicici', active: '77%', baseline: '29%',
    timelineLabels: ['9 Oct', '23 Nov', '7 Jan', '21 Feb', '7 Apr', 'Today'],
    upliftTenths: { doNothing: 0, reminder: 350, link: 150, incentive: 200 },
    expectedAction: 'reminder',
    reason: 'Meera reliably responds to a simple WhatsApp reminder, but historically ignores payment links and does not need a discount.',
  },
  kabir: {
    caseId: '1051', days: 52, range: '34–42', amountRupees: 1599, upi: 'kabir@okaxis', active: '74%', baseline: '21%',
    timelineLabels: ['16 Dec', '23 Jan', '2 Mar', '9 Apr', '17 May', 'Today'],
    upliftTenths: { doNothing: 0, reminder: 100, link: 200, incentive: 370 },
    expectedAction: 'incentive',
    reason: 'Kabir is price-sensitive: reminders and plain links underperform, while a capped 5% incentive creates enough extra lift to cover its cost.',
  },
  tara: {
    caseId: '1052', days: 40, range: '27–35', amountRupees: 849, upi: 'tara@okaxis', active: '82%', baseline: '32%',
    timelineLabels: ['11 Jan', '11 Feb', '14 Mar', '14 Apr', '15 May', 'Today'],
    upliftTenths: { doNothing: 0, reminder: 80, link: 170, incentive: 190 },
    expectedAction: 'link',
    reason: 'Tara is eligible, but remains untouched because she was assigned to the experiment holdout before scoring.',
  },
};

const caseSeeds = [
  { id: 'priya', name: 'Priya Menon', initials: 'PM', product: 'House Blend · 500g', cadence: '32 days', late: '11 days late', avoidedDiscount: 0, confidence: 86, tone: 'indigo', status: 'review' },
  { id: 'arjun', name: 'Arjun Rao', initials: 'AR', product: 'House Blend · 500g', cadence: '29 days', late: '7 days late', avoidedDiscount: 42, confidence: 91, tone: 'green', status: 'safe' },
  { id: 'meera', name: 'Meera Shah', initials: 'MS', product: 'Cold Brew Pack · 6', cadence: '45 days', late: '16 days late', avoidedDiscount: 0, confidence: 79, tone: 'amber', status: 'review' },
  { id: 'kabir', name: 'Kabir Singh', initials: 'KS', product: 'House Blend · 1kg', cadence: '38 days', late: '14 days late', avoidedDiscount: 0, confidence: 74, tone: 'violet', status: 'review' },
  { id: 'tara', name: 'Tara Iyer', initials: 'TI', product: 'House Blend · 500g', cadence: '31 days', late: '9 days late', avoidedDiscount: 0, confidence: 82, tone: 'slate', status: 'holdout' },
];

function buildActionOptions(details) {
  const orderPaise = details.amountRupees * 100;
  const contributionMarginPaise = Math.round(orderPaise * CONTRIBUTION_MARGIN_RATE_BPS / 10000);

  return ACTION_DEFINITIONS.map((definition) => {
    const upliftTenths = details.upliftTenths[definition.kind];
    const incrementalMarginPaise = Math.round(contributionMarginPaise * upliftTenths / 1000);
    const discountCostPaise = Math.round(orderPaise * definition.discountPct / 100);
    const totalCostPaise = definition.actionCostPaise + discountCostPaise;
    const netMarginPaise = incrementalMarginPaise - totalCostPaise;

    return {
      ...definition,
      upliftTenths,
      contributionMarginPaise,
      discountCostPaise,
      totalCostRupees: Math.round(totalCostPaise / 100),
      netMarginPaise,
      netMarginRupees: Math.round(netMarginPaise / 100),
    };
  });
}

function highestMarginOption(options) {
  return options.reduce((best, option) => option.netMarginPaise > best.netMarginPaise ? option : best);
}

export const cases = caseSeeds.map((seed) => {
  const details = customerDetails[seed.id];
  const actionOptions = buildActionOptions(details);
  const recommended = highestMarginOption(actionOptions);

  if (recommended.kind !== details.expectedAction) {
    throw new Error(`${seed.name}: expected ${details.expectedAction}, calculated ${recommended.kind}`);
  }

  return {
    ...seed,
    details,
    actionOptions,
    recommendedAction: recommended.kind,
    action: seed.status === 'holdout' ? 'Experiment holdout' : QUEUE_LABELS[recommended.kind],
    margin: seed.status === 'holdout' ? 0 : recommended.netMarginRupees,
  };
});

export const approvalCases = cases.filter((item) => item.status === 'review');
export const doNothingCases = cases.filter((item) => item.status === 'safe');
export const actionEligibleCases = cases.filter((item) => item.status !== 'holdout');
export const holdoutCases = cases.filter((item) => item.status === 'holdout');
export const expectedMarginThisRun = approvalCases.reduce((sum, item) => sum + item.margin, 0);
export const avoidedDiscountSpend = cases.reduce((sum, item) => sum + item.avoidedDiscount, 0);
export const annualisedDemoSample = expectedMarginThisRun * 11;

export function verifyEconomics() {
  if (actionEligibleCases.length !== approvalCases.length + doNothingCases.length) throw new Error('Queue counts do not reconcile');
  if (cases.length !== actionEligibleCases.length + holdoutCases.length) throw new Error('Sample counts do not reconcile');

  for (const item of actionEligibleCases) {
    const recommended = highestMarginOption(item.actionOptions);
    if (recommended.kind !== item.recommendedAction) throw new Error(`${item.name}: recommendation is not the maximum`);
    if (recommended.netMarginRupees !== item.margin) throw new Error(`${item.name}: queue margin does not equal detail margin`);
  }

  const queueSum = approvalCases.reduce((sum, item) => sum + item.margin, 0);
  if (queueSum !== expectedMarginThisRun) throw new Error('Landing headline does not equal approval-row margins');

  return { customers: actionEligibleCases, queueSum };
}

verifyEconomics();
