# Business Case

## One-line thesis

ReCycle turns margin a merchant has already earned—but is leaking—into recovered revenue that flows back through Razorpay, by acting only when an action is expected to cause a reorder and staying silent everywhere else.

## 1. The merchant problem

Replenishable D2C brands have already paid to acquire the customer. Their next economic job is to earn repeat demand without buying that same customer again or giving away unnecessary discounts.

The current retention playbook wastes money in two directions:

- **Mistimed outreach:** a flat 30-day reminder can annoy a 20-day buyer and arrive too late for a 60-day buyer.
- **Discount leakage:** a blanket coupon pays naturally loyal customers to do what they were already likely to do.

This is why the target is not opens, clicks, attributed GMV or even raw response rate. The target is **incremental contribution margin**: profit generated because the merchant acted, compared with what would have happened without that action.

Industry commentary increasingly emphasizes retention, contribution margin and disciplined growth for Indian D2C brands rather than growth at any cost. ReCycle does not depend on one disputed TAM figure; it depends on the more durable operating truth that repeat economics matter.

## 2. Why existing retention tooling leaves a gap

RFM segmentation, replenishment reminders and win-back flows already exist. ReCycle is not claiming that cadence prediction is new.

| Existing approach | What it optimizes | Remaining gap |
|---|---|---|
| Fixed-day campaign | Delivery on a calendar | Ignores individual rhythm |
| RFM / churn score | Who looks inactive | Does not estimate whether action changes behavior |
| Response propensity | Who is likely to click/buy | Rewards buyers who may purchase naturally |
| Blanket coupon | Gross conversion | Can destroy contribution margin |
| Subscription recovery | Failed recurring debit | Does not cover non-subscription repeat drift |
| **ReCycle** | **Incremental contribution margin** | Chooses action—or silence—and proves lift with holdout |

The defensible wedge is therefore not “predict when.” It is **decide whether acting is economically worthwhile, choose the least-cost effective action, and prove the result.**

## 3. Why Razorpay should build it

### Ledger-native signal

Captured payments provide recency, frequency, amount and repeat behavior without requiring a merchant to install a separate retention data warehouse. Product/SKU context can be added through merchant connectors; when it is missing, the system must fall back honestly rather than invent it.

### Agent Studio-native distribution and controls

Razorpay describes Agent Studio as a marketplace of specialized agents inside the merchant dashboard, with review-first behavior, validation of permissions and amounts, and auditability. ReCycle fits that operating model: the model proposes, deterministic policy validates, and the merchant remains in control.

### An adjacent hole in the current journey

Razorpay publicly positions agents for cart recovery, subscription recovery, COD confirmation and dispute response. These address pre-purchase abandonment, failed recurring payments and post-payment risk. ReCycle addresses a different event: a successful, non-subscription customer who silently drifts before the next expected purchase.

### Aligned platform economics

Every truly incremental reorder increases merchant contribution margin and creates an additional payment that can flow through Razorpay. Agent revenue, payment volume and merchant stickiness therefore reinforce the same outcome.

A future cold-start prior could use privacy-preserving, aggregated patterns across consenting merchants and categories. It must never expose or silently join raw consumer histories across merchants; identity scope, consent, purpose limitation and governance are hard product constraints.

## 4. Merchant economics — illustrative model

These are transparent scenario assumptions, not measured results or market benchmarks.

| Assumption | Value |
|---|---:|
| Repeat-customer base | 50,000 |
| Average order value | ₹700 |
| Contribution margin | 35% = ₹245/order |
| Customers entering eligibility monthly | 10% = 5,000 |
| Share with positive expected action value | 60% = 3,000 |
| Net incremental reorder lift vs holdout | 8 percentage points |
| Incremental orders monthly | 3,000 × 8% = 240 |
| Incremental contribution margin monthly | 240 × ₹245 = ₹58,800 |
| Annualized incremental contribution margin | ≈ ₹7.1 lakh |

Sensitivity matters more than the point estimate:

| Net lift | Monthly incremental orders | Monthly incremental margin |
|---:|---:|---:|
| 3 pp | 90 | ₹22,050 |
| 5 pp | 150 | ₹36,750 |
| 8 pp | 240 | ₹58,800 |
| 12 pp | 360 | ₹88,200 |

The merchant should renew only if the randomized experiment shows positive realized margin after discounts, message costs, refunds and payment costs. The holdout is therefore both the truth mechanism and the commercial proof.

## 5. Razorpay-level upside — illustrative model

Again, these are scenario inputs, not a forecast:

```text
10,000 adopting merchants
× 500 incremental reorders per merchant per year
× ₹700 average order value
= ₹3.5 billion = ₹350 crore incremental annual GMV
```

Potential value pools:

1. Incremental payment volume from recovered orders.
2. High-margin software revenue through Agent Studio pricing.
3. Better aggregated priors and action learning as adoption grows, subject to privacy controls.
4. Payment-stack stickiness because value is demonstrated in merchant margin, not merely time saved.

No MDR revenue or adoption forecast is claimed here; those require Razorpay's internal pricing, eligible-merchant counts and experiment data.

## 6. Product wedge and rollout

Start narrow:

1. Single-category replenishable merchants.
2. Sufficient repeat volume to power a holdout.
3. Captured-payment identity match plus explicit messaging consent.
4. Review-first recommendations; no autonomous incentives.
5. One-tap reorder link, reminder and `DO_NOTHING` before more complex actions.

Only after causal lift and safety are demonstrated should the system add multi-SKU inference, inventory context, automated low-risk actions or cross-merchant priors.

## 7. Honest counter-case

### “Isn't this just a retention feature?”

As standalone software, probably. As an Agent Studio capability, that is a strength: the data, distribution, execution and measurement can live in the payment platform. The product must lead with causal action selection—not generic cadence prediction—to remain differentiated.

### “Thin-data merchants cannot support uplift modeling.”

Correct. The product should initially target merchants with meaningful repeat bases, pool only privacy-safe category priors, surface uncertainty and abstain frequently. A holdout must not be presented as statistically decisive before it is powered.

### “Razorpay may not know the actual SKU or off-platform purchases.”

Correct. The system should use product/order connectors where available, fall back to generic copy and last-order value, and never claim a complete consumption view. Off-platform purchases create measurement dilution that must be documented.

### “WhatsApp outreach can become spam.”

Correct. Consent, approved templates, frequency caps, opt-out suppression, repeated-nonresponse backoff, merchant review and a kill switch are launch requirements—not later polish.

### “Uplift is difficult to estimate.”

Correct. That is why ReCycle starts with randomized holdout, conservative exploration and deterministic economics. If it cannot prove positive incremental margin, it should pause itself.

## 8. Go / no-go evidence

Proceed beyond pilot only if a powered experiment shows:

- Positive incremental contribution margin with a confidence interval acceptable to the merchant.
- Opt-out and complaint rates below pre-agreed thresholds.
- Stable identity-match and policy-block behavior.
- A meaningful share of value generated without discounts.
- Results that persist after refunds, channel costs and delayed purchases are included.

Stop or redesign if measured lift is indistinguishable from zero, margin is negative after incentives, or trust guardrails degrade.

## Sources used for strategic context

- [Razorpay Agent Studio product page](https://razorpay.com/agent-studio/)
- [Razorpay: Agent Studio principles, guardrails and merchant control](https://razorpay.com/blog/?p=26508)
- [Razorpay: Agent Studio launch and agent lineup](https://razorpay.com/blog/?p=26292)
- [Razorpay Agentic Dashboard](https://razorpay.com/blog/razorpay-agentic-dashboard-your-dashboard-just-conversational-with-ray/)
- [IMA India: Scaling D2C in India](https://www.imaindia.com/themes/customer/scaling-d2c-in-india)

Market context is directional; merchant and platform calculations above are explicitly illustrative. Production claims require Razorpay transaction data and randomized evaluation.

