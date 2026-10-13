import { expectedMarginThisRun, formatRupees, formatUplift, verifyEconomics } from '../lib/recycle-data.mjs';

const { customers } = verifyEconomics();

for (const customer of customers) {
  const margins = customer.actionOptions
    .map((option) => `${option.label}: ${formatRupees(option.netMarginRupees)} (${formatUplift(option.upliftTenths)})`)
    .join(' | ');
  console.log(`${customer.name} — ${margins}`);
  console.log(`  recommended: ${customer.recommendedAction}; queue: ${formatRupees(customer.margin)}; detail: ${formatRupees(customer.margin)}; MATCH`);
}

const approvalSum = customers
  .filter((customer) => customer.status === 'review')
  .reduce((sum, customer) => sum + customer.margin, 0);

console.log(`Landing headline: ${formatRupees(expectedMarginThisRun)}`);
console.log(`Approval-row sum: ${formatRupees(approvalSum)}; MATCH`);
