export default function MarketingLandingPage() {
  return (
    <main className="landing-page">
      <nav className="landing-nav" aria-label="Main navigation">
        <a className="brand-lockup" href="/" aria-label="Gigproof home">
          <span className="brand-mark" aria-hidden="true">g</span>
          <span className="brand-name">gigproof<span>.</span></span>
        </a>
        <a className="landing-nav-link" href="/dashboard">Open dashboard</a>
      </nav>

      <section className="landing-hero">
        <p className="landing-eyebrow">FOR INDIA'S INDEPENDENT EARNERS</p>
        <h1>Your gig income, ready to show.</h1>
        <p className="landing-lede">Turn delivery payouts and freelance earnings into a clear income summary, a Reliability Score, and a shareable proof-of-income PDF.</p>
        <a className="button-primary landing-cta" href="/dashboard">Create my income report <span aria-hidden="true">→</span></a>
        <p className="landing-note">Your report shows the income records and verification status behind its figures.</p>
      </section>

      <section className="landing-story" aria-labelledby="landing-problem-title">
        <div>
          <p className="landing-eyebrow">THE PAPERWORK GAP</p>
          <h2 id="landing-problem-title">Your work is real. The paperwork often doesn’t show it.</h2>
        </div>
        <p>Indian landlords, PG owners, and local banks often ask for a standard salary slip. If you earn through food delivery, rides, or freelance projects, your income may arrive from several platforms and vary from month to month. That can make steady work harder to explain on a form built for salaried jobs.</p>
      </section>

      <section className="landing-process" aria-labelledby="landing-process-title">
        <div className="landing-process-heading">
          <p className="landing-eyebrow">A CLEARER WAY TO EXPLAIN IT</p>
          <h2 id="landing-process-title">From scattered payouts to one useful picture.</h2>
        </div>
        <ol className="landing-steps">
          <li><span>01</span><h3>Bring your income together</h3><p>Add payout records manually today. Platform connections are marked as coming soon.</p></li>
          <li><span>02</span><h3>See the year in context</h3><p>Gigproof organizes income by month so changing weeks are easier to understand.</p></li>
          <li><span>03</span><h3>Make a proof-of-income PDF</h3><p>Download a concise report with your monthly history, income summary, and verification status.</p></li>
        </ol>
      </section>

      <section className="landing-final-cta" aria-label="Create an income report">
        <h2>Make your income easier to explain.</h2>
        <a className="button-primary landing-cta" href="/dashboard">Create my income report <span aria-hidden="true">→</span></a>
      </section>
      <footer className="landing-footer">Gigproof organizes income records; it does not guarantee a rental, loan, or credit approval.</footer>
    </main>
  );
}
