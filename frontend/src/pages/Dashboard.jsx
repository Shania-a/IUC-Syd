
const overviewSections = [
  {
    title: "Användare",
    description: "Hantera medlemskonton och åtkomst.",
    icon: "♙",
  },
  {
    title: "Företag",
    description: "Hantera företagsprofiler och kontaktuppgifter.",
    icon: "▤",
  },
  {
    title: "Moderering",
    description: "Granska inlägg och innehåll i communityt.",
    icon: "✓",
  },
  {
    title: "Privata meddelanden",
    description: "Hantera meddelanden som skickas till IUC.",
    icon: "✉",
  },
];

export default function Dashboard() {
  return (
    <div className="dashboard">
      <section className="welcome-panel">
        <span className="eyebrow">ADMINISTRATION</span>

        <h2>Välkommen till IUC Syd</h2>

        <p>
          Här administrerar du medlemsportalen, företagen och
          kommunikationen mellan medlemmarna och IUC Syd.
        </p>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Snabböversikt</h2>
            <p>En översikt över portalens olika administrationsområden.</p>
          </div>
        </div>

        <div className="overview-grid">
          {overviewSections.map((section) => (
            <article className="overview-card" key={section.title}>
              <div className="overview-card-header">
                <div className="overview-icon" aria-hidden="true">
                  {section.icon}
                </div>

                <h3>{section.title}</h3>
              </div>

              <p className="overview-description">
                {section.description}
              </p>

              <div className="empty-state">
                <span>—</span>
                <p>Ingen data tillgänglig ännu</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
