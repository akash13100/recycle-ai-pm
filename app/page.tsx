'use client';

import { useMemo, useState } from 'react';

type Screen = 'queue' | 'detail' | 'learning' | 'policies' | 'audit';
type CaseItem = {
  id: string;
  name: string;
  initials: string;
  product: string;
  cadence: string;
  late: string;
  margin: number;
  avoidedDiscount: number;
  action: string;
  confidence: number;
  tone: string;
  status: 'review' | 'safe' | 'holdout';
};

const cases: CaseItem[] = [
  { id: 'priya', name: 'Priya Menon', initials: 'PM', product: 'House Blend · 500g', cadence: '32 days', late: '11 days late', margin: 286, avoidedDiscount: 0, action: 'Send reorder link', confidence: 86, tone: 'indigo', status: 'review' },
  { id: 'arjun', name: 'Arjun Rao', initials: 'AR', product: 'House Blend · 500g', cadence: '29 days', late: '7 days late', margin: 0, avoidedDiscount: 42, action: 'Do nothing', confidence: 91, tone: 'green', status: 'safe' },
  { id: 'meera', name: 'Meera Shah', initials: 'MS', product: 'Cold Brew Pack · 6', cadence: '45 days', late: '16 days late', margin: 92, avoidedDiscount: 0, action: 'Reminder only', confidence: 79, tone: 'amber', status: 'review' },
  { id: 'kabir', name: 'Kabir Singh', initials: 'KS', product: 'House Blend · 1kg', cadence: '38 days', late: '14 days late', margin: 247, avoidedDiscount: 0, action: 'Offer 5% incentive', confidence: 74, tone: 'violet', status: 'review' },
  { id: 'tara', name: 'Tara Iyer', initials: 'TI', product: 'House Blend · 500g', cadence: '31 days', late: '9 days late', margin: 0, avoidedDiscount: 0, action: 'Experiment holdout', confidence: 82, tone: 'slate', status: 'holdout' },
];

const formatRupees = (value: number) => `₹${value.toLocaleString('en-IN')}`;
const approvalCases = cases.filter(item => item.status === 'review');
const doNothingCases = cases.filter(item => item.status === 'safe');
const actionEligibleCases = cases.filter(item => item.status !== 'holdout');
const holdoutCases = cases.filter(item => item.status === 'holdout');
const expectedMarginThisRun = approvalCases.reduce((sum, item) => sum + item.margin, 0);
const avoidedDiscountSpend = cases.reduce((sum, item) => sum + item.avoidedDiscount, 0);
const annualisedDemoSample = expectedMarginThisRun * 11;

if (process.env.NODE_ENV !== 'production') {
  console.assert(actionEligibleCases.length === approvalCases.length + doNothingCases.length, 'Queue counts must reconcile');
  console.assert(cases.length === actionEligibleCases.length + holdoutCases.length, 'Sample counts must reconcile');
  console.assert(expectedMarginThisRun === approvalCases.reduce((sum, item) => sum + item.margin, 0), 'Headline margin must equal approval rows');
}

const actionOptions = [
  { label: 'Do nothing', detail: 'Likely to reorder naturally', uplift: '0.0 pp', cost: '₹0', margin: '₹0', tone: 'neutral' },
  { label: 'Reminder only', detail: 'WhatsApp reminder, no link', uplift: '+7.2 pp', cost: '₹1', margin: '₹92', tone: 'neutral' },
  { label: 'One-tap reorder link', detail: 'Same product, no discount', uplift: '+18.4 pp', cost: '₹3', margin: '₹286', tone: 'recommended' },
  { label: '5% incentive', detail: 'Discount bounded at ₹42', uplift: '+20.1 pp', cost: '₹45', margin: '₹247', tone: 'neutral' },
];

function Logo() {
  return <div className="brand"><span className="brand-mark">R</span><span>razorpay</span></div>;
}

function Sidebar({ screen, setScreen }: { screen: Screen; setScreen: (screen: Screen) => void }) {
  const active = screen === 'detail' ? 'queue' : screen;
  return (
    <aside className="sidebar">
      <Logo />
      <div className="agent-badge"><span className="pulse" /> ReCycle Agent <small>AI</small></div>
      <p className="nav-label">WORKSPACE</p>
      <nav>
        <button className={active === 'queue' ? 'active' : ''} onClick={() => setScreen('queue')}><span>⌁</span><i>Opportunity queue</i><b>{actionEligibleCases.length}</b></button>
        <button className={active === 'learning' ? 'active' : ''} onClick={() => setScreen('learning')}><span>↗</span><i>Learning lab</i></button>
        <button className={active === 'policies' ? 'active' : ''} onClick={() => setScreen('policies')}><span>⌘</span><i>Policies & safety</i></button>
        <button className={active === 'audit' ? 'active' : ''} onClick={() => setScreen('audit')}><span>≡</span><i>Audit log</i></button>
      </nav>
      <div className="rail-note"><span>SIMULATED PROTOTYPE</span><p>Model outputs use synthetic Sleepy Bean data. No production impact is claimed.</p></div>
      <div className="sidebar-foot"><span className="avatar">SB</span><div><strong>Sleepy Bean Coffee</strong><small>Growth workspace</small></div><span className="more">•••</span></div>
    </aside>
  );
}

function Topbar({ screen, paused, setPaused }: { screen: Screen; paused: boolean; setPaused: (value: boolean) => void }) {
  const label: Record<Screen, string> = { queue: 'Opportunity queue', detail: 'Customer decision', learning: 'Learning lab', policies: 'Policies & safety', audit: 'Audit log' };
  return <header className="topbar"><div><span className="crumb">Agent Studio</span><b>/</b><strong>ReCycle</strong><b>/</b><span>{label[screen]}</span></div><div className="top-actions"><span className="test-pill"><i /> Test mode</span><button className={paused ? 'ghost paused' : 'ghost'} onClick={() => setPaused(!paused)}>{paused ? 'Resume agent' : 'Pause agent'}</button><span className="user">AS</span></div></header>;
}

function Queue({ onSelect, openFirst, onLearning }: { onSelect: (item: CaseItem) => void; openFirst: () => void; onLearning: () => void }) {
  const [filter, setFilter] = useState<'review'|'all'|'holdout'>('review');
  const visibleCases = filter === 'all' ? actionEligibleCases : filter === 'holdout' ? holdoutCases : approvalCases;
  return <div className="content">
    <div className="eyebrow">TODAY&apos;S REPEAT-REVENUE OPPORTUNITY</div>
    <div className="title-row"><div><h1>Recover repeat revenue,<br/><em>without discounting everyone.</em></h1><p>ReCycle finds customers drifting past their own purchase rhythm, then chooses the action most likely to create an incremental reorder.</p></div><button className="primary" onClick={openFirst}>Review {approvalCases.length} decisions <span>→</span></button></div>
    <div className="metrics">
      <article><div className="metric-icon lavender">₹</div><span>Expected incremental margin · this run</span><strong>{formatRupees(expectedMarginThisRun)}</strong><small>Projected demo-sample annualised: {formatRupees(annualisedDemoSample)}</small></article>
      <article><div className="metric-icon blue">✓</div><span>Needs your approval</span><strong>{approvalCases.length}</strong><small>of {actionEligibleCases.length} action-eligible customers</small></article>
      <article><div className="metric-icon mint">◇</div><span>Discount avoided on sure-thing reorders</span><strong>{formatRupees(avoidedDiscountSpend)}</strong><small>{doNothingCases.length} “do nothing” decision</small></article>
      <article><div className="metric-icon peach">◐</div><span>Experiment holdout</span><strong className="good">{holdoutCases.length} / {cases.length}</strong><small>{Math.round((holdoutCases.length / cases.length) * 100)}% of this synthetic sample</small></article>
    </div>
    <section className="queue-card">
      <div className="section-head"><div><h2>Opportunity queue</h2><p>Ranked by expected incremental contribution margin</p></div><div className="filters"><button className={filter==='review'?'filter-active':''} onClick={()=>setFilter('review')}>Needs review · {approvalCases.length}</button><button className={filter==='all'?'filter-active':''} onClick={()=>setFilter('all')}>All eligible · {actionEligibleCases.length}</button><button className={filter==='holdout'?'filter-active':''} onClick={()=>setFilter('holdout')}>Holdout · {holdoutCases.length}</button></div></div>
      <div className="table-head"><span>Customer</span><span>Purchase rhythm</span><span>Recommendation</span><span>Confidence</span><span>Expected margin</span><span /></div>
      {visibleCases.map((item) => <button key={item.id} className="case-row" onClick={() => onSelect(item)}>
        <span className="customer"><i>{item.initials}</i><span><strong>{item.name}</strong><small>{item.product}</small></span></span>
        <span className="rhythm"><strong>{item.cadence}</strong><small>{item.late}</small></span>
        <span><mark className={item.tone}>{item.action}</mark></span>
        <span className="confidence"><span><i style={{width: `${item.confidence}%`}} /></span>{item.confidence}%</span>
        <span className="value"><strong>{item.status === 'holdout' ? '—' : formatRupees(item.margin)}</strong><small>{item.status === 'holdout' ? 'protected control' : item.status === 'safe' ? 'no action cost' : 'incremental'}</small></span>
        <b className="chev">›</b>
      </button>)}
    </section>
    <div className="truth-note"><span>i</span><div><strong>Expected is not realised</strong><p>These are model estimates. ReCycle reports realised lift only after comparing treated customers with the randomized holdout.</p></div><button onClick={onLearning}>How measurement works</button></div>
  </div>;
}

function Detail({ item, onBack, onLearning }: { item: CaseItem; onBack: () => void; onLearning: () => void }) {
  const recommendedIndex = item.id === 'arjun' ? 0 : item.id === 'meera' ? 1 : item.id === 'kabir' ? 3 : 2;
  const [selected, setSelected] = useState(recommendedIndex);
  const [approved, setApproved] = useState(false);
  const [excluded, setExcluded] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [snoozed, setSnoozed] = useState(false);
  const [messageAlt, setMessageAlt] = useState(false);
  const option = actionOptions[selected];
  const firstName = item.name.split(' ')[0];
  const customerData: Record<string, { caseId: string; days: number; range: string; amount: string; upi: string; active: string; baseline: string }> = {
    priya: { caseId: '1048', days: 43, range: '28–36', amount: '₹849', upi: 'priya@okhdfcbank', active: '82%', baseline: '34%' },
    arjun: { caseId: '1049', days: 36, range: '26–33', amount: '₹849', upi: 'arjun@okaxis', active: '91%', baseline: '61%' },
    meera: { caseId: '1050', days: 61, range: '40–50', amount: '₹699', upi: 'meera@okicici', active: '77%', baseline: '29%' },
    kabir: { caseId: '1051', days: 52, range: '34–42', amount: '₹1,599', upi: 'kabir@okaxis', active: '74%', baseline: '21%' },
  };
  const data = customerData[item.id] || customerData.priya;
  const productWords = item.product.replace(' · ', ' ');
  const paymentLink = `rzp.io/r/sleepybean-${item.id}`;
  const draftMessage = selected === 1
    ? `Hi ${firstName}, it may be time for your next ${productWords}. Reply if you’d like help reordering.`
    : selected === 2
      ? `Hi ${firstName}, running low on your ${productWords}? Your usual order is ready—no discount needed. Pay securely in one tap:`
      : `Hi ${firstName}, your usual ${productWords} is ready. Here’s 5% off your reorder:`;
  const alternateMessage = selected === 1
    ? `Hi ${firstName}, ready for another ${productWords}? Reply YES and we’ll help with your reorder.`
    : `Hi ${firstName}, it may be time for your next ${productWords}. Reorder securely here:`;
  if (item.status === 'holdout') return <HoldoutDetail item={item} onBack={onBack} onLearning={onLearning} />;
  return <div className="content detail-content">
    <button className="back" onClick={onBack}>← Back to queue</button>
    <div className="detail-title"><div className="big-avatar">{item.initials}</div><div><div className="eyebrow">CUSTOMER DECISION · RC-{data.caseId}</div><h1>{item.name}</h1><p>{item.product} · Customer since Aug 2025 · 6 captured orders</p></div><div className="decision-value"><span>Expected incremental margin</span><strong>{option.margin}</strong><small>{option.label}</small></div></div>
    <div className="detail-grid">
      <div className="detail-main">
        <section className="panel rhythm-panel">
          <div className="panel-head"><div><h2>Purchase rhythm</h2><p>Observed payments linked by verified contact</p></div><span className="model-tag">BTYD-assisted</span></div>
          <div className="timeline-chart"><div className="axis"><span>12 Jan</span><span>13 Feb</span><span>16 Mar</span><span>17 Apr</span><span>19 May</span><span>Today</span></div><div className="timeline"><span className="order-dot"/><i/><span className="order-dot"/><i/><span className="order-dot"/><i/><span className="order-dot"/><i/><span className="order-dot"/><i className="late-line"/><span className="today-dot">{data.days}d</span></div></div>
          <div className="explain-box"><span className="spark">✦</span><p><strong>Why this customer surfaced</strong>{firstName} usually repurchases every {data.range} days. It has been {data.days} days. ReCycle recommends <b>{actionOptions[recommendedIndex].label.toLowerCase()}</b> because it has the highest expected incremental margin within policy.</p></div>
          <div className="model-stats"><div><span>Active-customer probability</span><strong>{data.active}</strong></div><div><span>Baseline 7-day reorder</span><strong>{data.baseline}</strong></div><div><span>Identity confidence</span><strong>Verified</strong></div></div>
        </section>
        <section className="panel action-panel">
          <div className="panel-head"><div><h2>Choose an action</h2><p>Expected value after action cost and contribution margin</p></div><span className="calc-tag">Math in deterministic code</span></div>
          <div className="option-head"><span>Action</span><span>Incremental uplift</span><span>Cost</span><span>Net margin</span></div>
          {actionOptions.map((action, index) => <button key={action.label} className={`action-option ${selected === index ? 'selected' : ''}`} onClick={() => { setSelected(index); setApproved(false); }}>
            <span className="radio"><i /></span><span className="action-name"><strong>{action.label}</strong><small>{action.detail}</small></span><span>{action.uplift}</span><span>{action.cost}</span><span className="margin-num">{action.margin}</span>{index === recommendedIndex && <mark>Recommended</mark>}
          </button>)}
        </section>
        <section className="panel message-panel"><div className="panel-head"><div><h2>Customer message</h2><p>{selected === 0 ? 'No outreach for this decision' : 'AI-drafted; merchant editable before approval'}</p></div>{selected !== 0 && <button className="text-button" onClick={()=>setMessageAlt(!messageAlt)}>{messageAlt?'Use original':'Regenerate'}</button>}</div><div className="message-preview"><div className="wa">{selected === 0 ? '—' : '⌁'}</div><p>{selected === 0 ? <>No customer message will be sent. ReCycle will observe whether {firstName} reorders naturally.</> : <>{messageAlt ? alternateMessage : draftMessage} {selected >= 2 && <b>{paymentLink}</b>}<small>Reply STOP to opt out.</small></>}</p></div></section>
      </div>
      <aside className="decision-rail">
        <section className="panel guard-panel"><div className="panel-head"><div><h2>Policy gate</h2><p>All money and messaging checks run in code</p></div></div>
          {[['Consent signal present','WhatsApp opt-in · 12 Aug'],['Frequency cap','0 of 2 messages this month'],['Margin floor',selected === 0 ? 'Not applicable for no action' : `${option.margin} expected · ₹75 minimum`],['Discount bound',`${selected === 3 ? '5%' : '0%'} ≤ 5% maximum`],['Identity match','Verified phone + order history']].map(([a,b]) => <div className="guard" key={a}><span>✓</span><div><strong>{a}</strong><small>{b}</small></div></div>)}
          <div className="gate-result"><span>SAFE TO EXECUTE</span><strong>5 / 5 checks passed</strong></div>
        </section>
        <section className="panel decision-card"><span className="recommend-label">RECOMMENDED DECISION</span><h3>{option.label}</h3><p>{selected === 0 ? 'Natural reorder probability is high enough that contacting this customer would add cost without proven lift.' : 'Highest expected incremental contribution margin within merchant policy.'}</p><div className="decision-math"><span>Expected incremental margin</span><strong>{option.margin}</strong></div>
          {excluded ? <div className="approved-state stop-state"><span>⊘</span><div><strong>Customer excluded</strong><small>No future ReCycle messages</small></div></div> : snoozed ? <div className="approved-state"><span>◷</span><div><strong>Snoozed for 7 days</strong><small>Decision will be rescored on return</small></div></div> : approved ? <><div className="approved-state"><span>✓</span><div><strong>Action approved</strong><small>{selected >= 2 ? `Test link created · Audit #${data.caseId}` : `Decision recorded · Audit #${data.caseId}`}</small></div></div>{selected>=2&&<button className="checkout-button" onClick={()=>setCheckout(true)}>Open Razorpay test checkout ↗</button>}</> : <button className="primary full" onClick={() => setApproved(true)}>{selected === 0 ? 'Approve “Do nothing”' : selected === 1 ? 'Approve reminder' : 'Approve & create test link'} <span>→</span></button>}
          <div className="secondary-actions">{selected !== 0 && <button onClick={()=>setMessageAlt(true)}>Edit copy</button>}<button onClick={() => setSnoozed(true)}>Snooze 7d</button><button onClick={() => setExcluded(true)}>Exclude</button></div>
        </section>
        <div className="tiny-note"><span>◐</span><p><strong>Not in holdout</strong>This customer is eligible for treatment. Allocation was fixed before scoring.</p></div>
      </aside>
    </div>{checkout&&<div className="modal-backdrop" onClick={()=>setCheckout(false)}><div className="checkout-modal" onClick={event=>event.stopPropagation()}><div className="checkout-top"><Logo/><span>TEST MODE</span></div><button className="modal-close" onClick={()=>setCheckout(false)}>×</button><p>Payment request from</p><h2>Sleepy Bean Coffee</h2><div className="checkout-product"><div><strong>{item.product}</strong><small>One-time reorder</small></div><b>{data.amount}</b></div><div className="checkout-field"><span>UPI ID</span><strong>{data.upi}</strong></div><button className="pay-button" onClick={()=>setCheckout(false)}>Pay {data.amount} in test mode</button><small className="checkout-note">No money will move. This previews the Razorpay Payment Link execution step.</small></div></div>}
  </div>;
}

function HoldoutDetail({ item, onBack, onLearning }: { item: CaseItem; onBack: () => void; onLearning: () => void }) {
  return <div className="content detail-content"><button className="back" onClick={onBack}>← Back to queue</button><div className="detail-title"><div className="big-avatar">{item.initials}</div><div><div className="eyebrow">EXPERIMENT HOLDOUT · RC-1052</div><h1>{item.name}</h1><p>{item.product} · Eligible, but intentionally receives no action</p></div></div><section className="holdout-hero panel"><div className="holdout-lock">◐</div><div><span className="model-tag">CONTROL GROUP</span><h2>Protected from intervention</h2><p>Tara met the same eligibility rules as treated customers, but was randomly assigned to the 10% holdout before scoring. ReCycle will observe whether she reorders naturally.</p><button className="primary" onClick={onLearning}>View experiment design →</button></div></section><div className="holdout-grid"><section className="panel"><h3>What the agent will do</h3><ul className="clean-list"><li><span>✓</span> Observe payment outcomes</li><li><span>✓</span> Keep natural cadence uncontaminated</li><li><span>✓</span> Attribute zero intervention cost</li></ul></section><section className="panel"><h3>What the agent will not do</h3><ul className="clean-list muted-list"><li><span>×</span> Send a reminder</li><li><span>×</span> Create a payment link</li><li><span>×</span> Offer a discount</li></ul></section></div></div>;
}

function Learning() {
  const [showAll, setShowAll] = useState(false);
  const bars = [38, 54, 44, 68, 51, 73, 62, 82];
  const harnessTests = [['Likely natural reorder','Do nothing','PASS'],['Late, responsive, no discount needed','Reorder link','PASS'],['Opted-out customer','Blocked','PASS'],['Insufficient purchase history','Abstain','PASS'],['Discount breaches margin floor','Rejected','PASS'],['Identity collision','Human review','PASS'],['Frequency limit reached','Blocked','PASS'],['Negative uplift estimate','Do nothing','PASS']];
  return <div className="content"><div className="eyebrow">OUTCOME LEARNING</div><div className="title-row"><div><h1>Prove lift, <em>not activity.</em></h1><p>A pre-assigned holdout separates purchases ReCycle caused from purchases that would have happened anyway.</p></div><span className="window-pill">Observation window · 30 days</span></div>
    <div className="metrics learning-metrics"><article><span>Realised incremental margin</span><strong>₹42,680</strong><small className="up">↑ 12.4% vs business-as-usual</small></article><article><span>Treated reorder rate</span><strong>31.8%</strong><small>n = 1,204 eligible customers</small></article><article><span>Holdout reorder rate</span><strong>24.6%</strong><small>n = 136 protected controls</small></article><article><span>Health guardrail</span><strong className="good">0.7% opt-out</strong><small>Below 1.5% pause threshold</small></article></div>
    <div className="learning-grid"><section className="panel experiment-card"><div className="panel-head"><div><h2>Incremental margin over time</h2><p>Illustrative synthetic experiment · 95% interval shown at maturity</p></div><div className="legend"><span><i className="treat"/>Treated</span><span><i className="control"/>Holdout baseline</span></div></div><div className="bar-chart">{bars.map((height,index)=><div className="bar-pair" key={index}><span className="bar treated" style={{height:`${height}%`}}/><span className="bar control" style={{height:`${Math.max(22,height-14)}%`}}/><small>W{index+1}</small></div>)}</div><div className="chart-summary"><span>Observed lift</span><strong>+7.2 percentage points</strong><p>Illustrative result only. Production claims require a powered merchant experiment.</p></div></section>
      <section className="panel harness-card"><div className="panel-head"><div><h2>Decision harness</h2><p>Regression scenarios run before every policy update</p></div><span className="pass-pill">8 / 8 passed</span></div>{harnessTests.slice(0,showAll?8:5).map(([scenario,expected,status])=><div className="test-row" key={scenario}><span><strong>{scenario}</strong><small>Expected: {expected}</small></span><b>{status}</b></div>)}<button className="text-button harness-link" onClick={()=>setShowAll(!showAll)}>{showAll?'Show key scenarios ↑':'View all synthetic scenarios →'}</button></section>
    </div>
    <section className="panel strategy-table"><div className="panel-head"><div><h2>What the agent has learned</h2><p>Performance by action after cost</p></div></div><div className="strategy-head"><span>Strategy</span><span>Eligible customers</span><span>Measured uplift</span><span>Incremental margin</span><span>Agent decision</span></div>{[['One-tap link','684','+9.6 pp','₹31,420','Keep active'],['Reminder only','348','+4.1 pp','₹11,260','Keep active'],['Flat 10% discount','172','−0.8 pp','−₹3,840','Auto-paused']].map((r,i)=><div className="strategy-row" key={r[0]}>{r.map((c,j)=><span key={c} className={j===4 ? (i===2?'decision-pause':'decision-keep') : ''}>{c}</span>)}</div>)}</section>
  </div>;
}

function Policies() {
  const [kill, setKill] = useState(false);
  const [limits, setLimits] = useState(['5%','₹75','2 / month','10%','3']);
  const [toggles, setToggles] = useState([true,true,true,true]);
  const limitOptions = [['5%','7%','10%'],['₹75','₹100','₹150'],['2 / month','1 / month','3 / month'],['10%','15%','20%'],['3','4','5']];
  const limitNames = ['Maximum discount','Minimum contribution margin','Messages per customer','Experiment holdout','Minimum captured orders'];
  const toggleNames = ['Require valid consent','Suppress opted-out customers','Abstain below 70% confidence','Human approval for discounts'];
  const rotateLimit = (index:number) => setLimits(current => current.map((value,i)=>i===index?limitOptions[index][(limitOptions[index].indexOf(value)+1)%limitOptions[index].length]:value));
  return <div className="content narrow-content"><div className="eyebrow">MERCHANT CONTROL</div><div className="title-row"><div><h1>Bound the agent,<br/><em>before it acts.</em></h1><p>AI proposes. Deterministic policy decides what is eligible to execute.</p></div></div><div className="policy-grid"><section className="panel policy-card"><div className="panel-head"><div><h2>Action limits</h2><p>Applied to every recommendation</p></div><span className="saved">Auto-saved</span></div>{limitNames.map((name,index)=><div className="policy-row" key={name}><span>{name}</span><button onClick={()=>rotateLimit(index)}>{limits[index]} ⌄</button></div>)}</section><section className="panel policy-card"><div className="panel-head"><div><h2>Safety controls</h2><p>Hard stops cannot be overridden by AI</p></div></div>{toggleNames.map((name,index)=><div className="policy-row toggle-row" key={name}><span>{name}</span><button className={`toggle ${toggles[index]?'on':'off'}`} onClick={()=>setToggles(current=>current.map((value,i)=>i===index?!value:value))}><i/>{toggles[index]?'On':'Off'}</button></div>)}<div className="kill-row"><div><strong>Global kill switch</strong><small>Immediately stops every pending action</small></div><button className={kill?'kill active':'kill'} onClick={()=>setKill(!kill)}>{kill?'Agent stopped':'Stop agent'}</button></div></section></div><div className="panel architecture"><div><span className="arch-num">1</span><strong>Model proposes</strong><small>Cadence + uplift</small></div><b>→</b><div><span className="arch-num">2</span><strong>Code verifies</strong><small>Consent + economics</small></div><b>→</b><div><span className="arch-num">3</span><strong>Merchant approves</strong><small>Edit or stop</small></div><b>→</b><div><span className="arch-num">4</span><strong>Outcome learns</strong><small>Treatment vs holdout</small></div></div></div>;
}

function Audit() {
  const entries = [['10:42','Priya Menon','Reorder link approved','5/5 policy checks · Test link created','Approved'],['10:31','Tara Iyer','Assigned to holdout','Allocation fixed before scoring','Protected'],['10:18','Arjun Rao','Do nothing approved','High natural reorder probability','Approved'],['09:54','Kabir Singh','5% incentive edited','Reduced from 8% by margin gate','Edited'],['09:41','Unknown contact','Recommendation blocked','Identity confidence below threshold','Blocked']];
  const exportLog = () => { const csv = ['Time,Customer,Decision,Evidence,Status',...entries.map(row=>row.map(cell=>`"${cell}"`).join(','))].join('\n'); const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const link=document.createElement('a'); link.href=url; link.download='recycle-audit-log.csv'; link.click(); URL.revokeObjectURL(url); };
  return <div className="content"><div className="eyebrow">EXPLAINABLE BY DESIGN</div><div className="title-row"><div><h1>Every decision leaves<br/><em>a reviewable trail.</em></h1><p>Signals, policy checks, merchant changes and outcomes are recorded separately.</p></div><button className="ghost export" onClick={exportLog}>Export log</button></div><section className="panel audit-card"><div className="audit-head"><span>Time</span><span>Customer</span><span>Decision</span><span>Evidence</span><span>Status</span></div>{entries.map((r)=><div className="audit-row" key={r[0]}>{r.map((c,j)=><span key={c} className={j===4?`audit-status ${c.toLowerCase()}`:''}>{c}</span>)}</div>)}</section></div>;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('queue');
  const [selectedId, setSelectedId] = useState('priya');
  const [paused, setPaused] = useState(false);
  const selected = useMemo(() => cases.find(item => item.id === selectedId) || cases[0], [selectedId]);
  const openCase = (item: CaseItem) => { setSelectedId(item.id); setScreen('detail'); window.scrollTo({top:0,behavior:'smooth'}); };
  return <main className="app-shell"><Sidebar screen={screen} setScreen={setScreen}/><section className="workspace"><Topbar screen={screen} paused={paused} setPaused={setPaused}/>{paused && <div className="paused-banner"><span>Agent paused</span> No recommendations or messages will execute until resumed.</div>}{screen==='queue'&&<Queue onSelect={openCase} openFirst={()=>openCase(cases[0])} onLearning={()=>setScreen('learning')}/>} {screen==='detail'&&<Detail item={selected} onBack={()=>setScreen('queue')} onLearning={()=>setScreen('learning')}/>} {screen==='learning'&&<Learning/>} {screen==='policies'&&<Policies/>} {screen==='audit'&&<Audit/>}</section></main>;
}
