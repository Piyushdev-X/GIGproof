import Icon from './Icon.jsx';

const factors = [
  { label: 'Income consistency', value: 'Strong', width: '84%' },
  { label: 'Active income months', value: '12 of 12', width: '100%' },
  { label: 'Income sources', value: '3 platforms', width: '76%' },
];

export default function ReliabilityPanel() {
  return (
    <section className="reliability-panel" aria-labelledby="reliability-title">
      <div className="reliability-topline"><div><h2 id="reliability-title">Reliability score</h2><p>Based on your income history</p></div><span className="score-status"><i />Strong</span></div>
      <div className="score-reading"><span className="score-number">100</span><span className="score-out-of">/ 100</span></div>
      <p className="score-explanation">Your income has been steady across multiple sources this year.</p>
      <div className="score-factors">
        {factors.map((factor) => <div className="factor-row" key={factor.label}><div className="factor-label"><span>{factor.label}</span><strong>{factor.value}</strong></div><div className="factor-track" aria-hidden="true"><span style={{ width: factor.width }} /></div></div>)}
      </div>
      <a className="text-link" href="#income-history">View income history <Icon name="arrow" size={15} /></a>
      <p className="sample-caption">Illustrative score · not an assessment of your income</p>
    </section>
  );
}
