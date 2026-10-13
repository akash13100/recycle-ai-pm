# AI Build Log — ReCycle

## 1. AI tools and models used

- **Claude:** adversarial product evaluation, comparison of ReCycle with alternative ideas, and critique of data access, causal measurement, platform fit and feasibility.
- **Gemini:** early market framing, D2C problem research and a second opinion on the value of repeat-purchase recovery.
- **Codex:** research synthesis, product-spec iteration, Next.js implementation, synthetic demo data, deterministic safety harness, documentation and deployment support.

I used the models as collaborators, not as autonomous product owners. Their outputs were inputs to my decisions and were reviewed before I accepted or shipped them.

## 2. Workflow and agent setup

The build followed a repeated critique-and-correction loop:

1. An AI assistant researched Razorpay Agent Studio and stress-tested the opportunity against competing product ideas.
2. I reviewed the comparison and chose the repeat-revenue problem, then specified the required signals, actions, merchant controls, learning loop and safety boundaries.
3. A coding assistant generated and iterated the Next.js prototype, synthetic customer cases, test checkout, deterministic policy harness and initial documentation.
4. I reviewed each round in the live product, identified incorrect names, inactive controls and inconsistent metrics, and sent targeted corrections.
5. The assistant rebuilt, tested and redeployed the corrected version; I checked the final public flow and figures.

## 3. One AI output I rejected and corrected

The most important correction was the dashboard economics.

An early AI-generated version displayed **₹8,420 expected incremental margin** across a small synthetic sample. Under the illustrative merchant assumption of ₹700 average order value and 35% contribution margin, the contribution-margin ceiling is only ₹245 per order. The KPI tiles also failed to reconcile with the customers shown in the queue. A reviewer could disprove the headline in seconds, which would undermine the entire causal-measurement argument.

During my review loop, I rejected that output and directed the following corrections:

- Make the headline equal the sum of the action rows: **₹286 + ₹92 + ₹247 = ₹625**.
- Correct Meera's and Kabir's queue values so they match their detail-screen calculations.
- Treat **discount avoided** as a separate metric rather than mixing it with incremental margin.
- Show the annualized value only as a clearly labeled **projected demo-sample run-rate**.
- Make the queue counts reconcile by construction: action-eligible customers equal approvals plus do-nothing decisions; total sample equals eligible customers plus holdout.

This correction mattered more than visual polish. ReCycle asks merchants to trust an AI-assisted financial decision, so its own arithmetic must be inspectable and internally consistent.

## 4. What AI did versus what I decided

### AI did

- Generated the interface structure, styling and interaction states.
- Drafted synthetic customer cases and personalized message examples.
- Wrote the deterministic policy-harness scenarios.
- Produced first drafts of the product documentation and business case.
- Researched Razorpay Agent Studio's current agents and adjacent product surface.
- Implemented corrections, ran checks and prepared the deployable Next.js project.

### I decided

- The problem statement and why repeat contribution margin is worth solving.
- To build ReCycle rather than the alternative pre-dispute concept.
- To make **do nothing** a first-class recommendation instead of maximizing outreach.
- To keep a randomized holdout as a visible product feature and the basis for causal measurement.
- To keep rupee calculations and execution policies in deterministic code rather than trusting a language model.
- The guardrail categories: consent, identity confidence, minimum order history, frequency cap, maximum discount, margin floor and holdout allocation.
- The final numeric corrections and the separation of expected, projected and realized outcomes.

I also verified that the production build compiled, the policy scenarios passed and the live dashboard totals matched the customer rows before submission.

## 5. Known limitations, risks and verification

### Known limitations and risks

- The prototype uses synthetic data for one illustrative merchant.
- Cadence probabilities, action uplift and financial outputs demonstrate the intended decision experience; they are not production results.
- It does not send live WhatsApp messages or create real customer Payment Links.
- Cross-merchant priors would require strict consent, purpose limitation, aggregation and privacy controls.
- Thin-data merchants would require conservative priors, wide uncertainty bounds or abstention.
- Production performance claims require a powered randomized experiment and measurement after discounts, channel costs and refunds.

### Verification completed

- The Next.js production build compiles and deploys successfully on Vercel.
- The deterministic policy harness passes all eight synthetic safety scenarios.
- The public queue filters and counts match the displayed customer records.
- The headline expected margin equals the sum of approval rows: **₹625**.
- The holdout and do-nothing cases remain visibly separated from merchant-approved actions.
