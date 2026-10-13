# Model, Measurement and Safety Specification

## 1. Decision contract

For every eligible customer, ReCycle must return exactly one of these outcomes:

1. `DO_NOTHING`
2. `REMINDER_ONLY`
3. `ONE_TAP_LINK`
4. `BOUNDED_INCENTIVE`
5. `HOLDOUT`
6. `ABSTAIN`, `BLOCKED` or `HUMAN_REVIEW`

Every result carries the input signal version, candidate economics, policy checks, model confidence, merchant changes and eventual outcome. This makes the recommendation reproducible and auditable.

## 2. Input signals

The smallest viable production signal comes from captured-payment history joined with a verified customer key such as a normalized phone number or email address.

| Signal | Use |
|---|---|
| Recency | Days since last captured purchase |
| Frequency | Number of captured repeat purchases |
| Customer age | Time between first and observation date |
| Interpurchase intervals | Human-readable cadence and variability |
| Amount / contribution margin | Economic scoring and margin floor |
| Product or SKU, when present | Same-product reorder context |
| Consent and opt-out state | Messaging eligibility |
| Prior interventions | Frequency cap and contamination control |
| Outcomes | Uplift learning and audit trail |

When line items are unavailable, the product falls back to the last captured order amount and generic reorder copy. It should not pretend to know the SKU.

## 3. Cadence and active-customer model

The proposed production engine is a Buy-Till-You-Die model such as BG/NBD:

- Customer purchase rate `λ` varies across customers and is modeled with a Gamma distribution.
- Dropout probability varies across customers and is modeled with a Beta distribution.
- Observed frequency `x`, recency `tₓ` and customer age `T` produce posterior estimates of `P(alive)` and expected purchases over horizon `h`.

The model is preferred to a fixed “30 days since purchase” rule because it can distinguish a naturally slow buyer from a customer whose behavior has actually deviated.

For merchant explanation only:

```text
μ = mean(interpurchase intervals)
σ = standard deviation(interpurchase intervals)
d = days since last purchase
lateness_z = (d - μ) / max(σ, ε)
```

At least three captured orders are required for a coarse fallback. Four same-product orders provide three intervals and support a variance-aware explanation. Otherwise, the system uses a hierarchical category prior or abstains.

## 4. Action-uplift model

Propensity is not sufficient: a customer likely to purchase naturally may have high response probability but near-zero incremental value.

For action `a`, features `x` and outcome `Y`:

```text
τₐ(x) = E[Y | do(a), x] - E[Y | do(no_action), x]
```

Candidate models may be an uplift tree, causal forest or doubly robust learner trained on randomized exploration data. Before sufficient randomized data exists, the product should use conservative priors, wide uncertainty intervals and more human review—not manufacture precision.

## 5. Deterministic economics

Let:

- `p₀(x)` be baseline purchase probability.
- `pₐ(x)` be purchase probability after action `a`.
- `CM₀` be contribution margin before an incentive, net of COGS, fulfillment and payment fees.
- `Cmsg(a)` be channel/action cost.
- `D(a)` be discount cost when a purchase occurs.

Then:

```text
EIM(a, x) = (pₐ(x) - p₀(x)) × CM₀
            - Cmsg(a)
            - pₐ(x) × D(a)
```

The chosen action is:

```text
a*(x) = argmax EIM(a, x)
        over policy-eligible actions
```

`DO_NOTHING` has zero action cost and zero incremental margin by definition. The model may only rank candidates; currency calculations and constraint checks run in deterministic code.

## 6. Randomized holdout and causal measurement

Holdout assignment occurs after eligibility but before action scoring. This prevents the model from choosing “easy” control customers.

Primary metric:

```text
ITT incremental margin =
  mean(realized net margin | assigned treatment)
  - mean(realized net margin | assigned holdout)
```

Report confidence intervals and sample size. Do not promote “messages sent,” attributed GMV or raw reorder rate as causal lift.

Secondary diagnostics:

- Reorder-rate lift.
- Incremental margin per 1,000 eligible customers.
- Share of customers correctly assigned `DO_NOTHING`.
- Opt-out, complaint, refund and block rates.
- Discount spend per incremental order.

Orders occurring after a nudge carry an intervention tag. Natural-cadence estimation excludes or explicitly models these observations so the system does not learn its own induced timing as organic behavior.

## 7. Permission and policy gate

These checks run after model scoring and before merchant approval:

1. Verified identity and no unresolved collision.
2. Sufficient captured-order history.
3. Valid messaging consent and no opt-out/exclusion.
4. Confidence above the merchant threshold.
5. Customer contact frequency below the cap.
6. Discount at or below the configured maximum.
7. Expected contribution margin above the floor.
8. Customer is not in the pre-assigned holdout.
9. Human approval present when required.
10. Global kill switch is off.

The intended production workflow must also use approved WhatsApp templates and complete a legal review for the DPDP Act and applicable consumer-protection rules. This prototype does not claim compliance certification.

## 8. Failure behavior

| Failure | Safe response |
|---|---|
| Identity collision | Stop and route to human review |
| Missing consent / opted out | Block message and future outreach |
| Insufficient history | Fall back conservatively or abstain |
| Low confidence / wide interval | Abstain; show reason |
| Negative expected uplift | Recommend `DO_NOTHING` |
| Margin or discount breach | Reject that candidate and rescore |
| Frequency cap reached | Delay until the cap resets |
| Repeated non-response | Increase backoff; then exclude |
| Provider outage | Queue safely; never double-send |
| Model or policy regression | Auto-pause affected strategy |
| Holdout contamination | Exclude from analysis and flag audit |

## 9. Harness design

`npm run harness` executes eight deterministic regression scenarios:

| Scenario | Expected result |
|---|---|
| Likely natural reorder | `DO_NOTHING` |
| Late, responsive, no discount needed | `ONE_TAP_LINK` |
| Opted-out customer | `BLOCKED` |
| Insufficient purchase history | `ABSTAIN` |
| Discount breaches margin floor | Reject discount; `DO_NOTHING` |
| Identity collision | `HUMAN_REVIEW` |
| Frequency limit reached | `BLOCKED` |
| Negative uplift estimate | `DO_NOTHING` |

In a production system, this suite would expand into versioned golden cases, randomized offline evaluation, calibration checks, subgroup safety slices and online experiment monitoring. A failed hard-policy test should block deployment.

## 10. Prototype boundary

The current interface demonstrates the complete product loop with synthetic, hard-coded cases. It does not fit BG/NBD, estimate causal uplift, send WhatsApp messages or create a live Razorpay Payment Link. Those boundaries are explicit so judges can evaluate the product judgment without mistaking a mock for production evidence.

