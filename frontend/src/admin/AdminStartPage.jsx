import React from "react";
import "./css/AdminStartPage.css"; // samma CSS-fil som AdminStartPage
import { Link } from "react-router-dom";

const AdminStartPage = () => {
  return (
    <div className="admin-layout">
      {/* Mörkgrön sidomeny */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <h2>IUC Syd</h2>
          <span>ADMINISTRATION</span>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <Link to="/Admin">
              <li>Översikt</li>
            </Link>

            <Link to="/AdminUserPage">
              <li>Användare</li>
            </Link>

            <Link to="/AdminCompanyPage">
              <li>Företag</li>
            </Link>

            <Link to="/AdminModerationPage">
              <li>Moderering</li>
            </Link>

            <Link to="/AdminMessagesPage">
              <li>Privata medelande</li>
            </Link>
          </ul>
        </nav>
      </aside>

      {/* Huvudinnehåll */}
      <main className="admin-main-content">
        <header className="admin-topbar">
          <h1>Översikt</h1>
          <div className="topbar-search">
            <input
              type="text"
              placeholder="Sök i användare, företag, inlägg..."
            />
          </div>
          <div className="topbar-user">
            <span>IUC Syd – Administratör</span>
          </div>
        </header>

        <div className="admin-content-scroll">
          {/* Siffror / Översikts-kort */}
          <section className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Användare att godkänna</span>
              <span className="stat-number">2</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Väntande företag</span>
              <span className="stat-number">2</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Obesvarade privata meddelanden</span>
              <span className="stat-number">3</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Nya identifierade behov</span>
              <span className="stat-number">4</span>
            </div>
          </section>

          {/* Sektioner med listor */}
          <div className="dashboard-grid">
            {/* Vänster kolumn */}
            <div className="dashboard-column">
              {/* Användare att godkänna */}
              <div className="admin-card">
                <div className="card-header">
                  <h3>Användare att godkänna</h3>
                  <span className="card-sub">
                    Visar vem som vill bli medlem i IUC Syds gemenskap
                  </span>
                </div>
                <ul className="item-list">
                  <li className="list-item">
                    <div className="item-info">
                      <strong>Sara Holm</strong>
                      <span>Högskolan Väst</span>
                    </div>
                    <div className="item-meta">
                      <span>2 dagar sedan</span>
                    </div>
                    <div className="item-actions">
                      <button className="btn-success">Godkänn</button>
                      <button className="btn-outline">Neka</button>
                    </div>
                  </li>
                  <li className="list-item">
                    <div className="item-info">
                      <strong>Karin Dahl</strong>
                      <span>Nordisk Mekanik AB</span>
                    </div>
                    <div className="item-meta">
                      <span>3 dagar sedan</span>
                    </div>
                    <div className="item-actions">
                      <button className="btn-success">Godkänn</button>
                      <button className="btn-outline">Neka</button>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Moderering av community */}
              <div className="admin-card">
                <div className="card-header">
                  <h3>Moderering av community</h3>
                  <span className="card-sub">
                    Inlägg som väntar på granskning
                  </span>
                </div>
                <div className="moderation-item">
                  <span className="badge warning">Anmält inlägg</span>
                  <p>
                    <strong>WORLD 3D DESIGN:</strong> "Tack till Danne Wissen -
                    Tredimensionell Formgivning AB..."
                  </p>
                  <p className="mod-quote">
                    Vi bytte leverantör och är väldigt nöjda. Kontakta oss så
                    berättar vi vilken..."
                  </p>
                  <div className="item-actions">
                    <button className="btn-primary">Godkänn</button>
                    <button className="btn-outline">Återställa</button>
                    <button className="btn-danger">Ta bort</button>
                  </div>
                </div>
              </div>

              {/* Företag och huvudkontakt */}
              <div className="admin-card">
                <div className="card-header">
                  <h3>Företag och huvudkontakt</h3>
                  <button className="btn-small">Nytt företag</button>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Företag</th>
                      <th>Huvudkontakt</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Högskolan Verkstad AB</td>
                      <td>Anna Lindqvist</td>
                      <td>
                        <span className="status-dot green"></span> 2 st godkända
                      </td>
                      <td>
                        <button className="btn-text">Redigera</button>
                      </td>
                    </tr>
                    <tr>
                      <td>Nordisk Mekanik AB</td>
                      <td>Erik Sandberg</td>
                      <td>
                        <span className="status-dot green"></span> 3 st godkända
                      </td>
                      <td>
                        <button className="btn-text">Redigera</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Höger kolumn */}
            <div className="dashboard-column">
              {/* Privata meddelanden */}
              <div className="admin-card">
                <div className="card-header">
                  <h3>Privata meddelanden</h3>
                  <span className="link-text">Visa alla (3 st)</span>
                </div>
                <ul className="item-list compact">
                  <li className="list-item">
                    <div>
                      <strong>Vd och huvudkontakt</strong>
                      <p>Jonas Håkansson - Syntec Componenter AB / Inlägg</p>
                    </div>
                    <button className="btn-secondary">Öppna</button>
                  </li>
                  <li className="list-item">
                    <div>
                      <strong>Fråga om bild för kompetensutveckling</strong>
                      <p>Erik Sandberg - Nordisk Mekanik AB / Inlägg</p>
                    </div>
                    <button className="btn-secondary">Öppna</button>
                  </li>
                </ul>
              </div>

              {/* Roller och behörighet */}
              <div className="admin-card">
                <div className="card-header">
                  <h3>Roller och behörighet</h3>
                  <span className="card-sub">Vem får göra vad hos IUC Syd</span>
                </div>
                <table className="admin-table roles-table">
                  <thead>
                    <tr>
                      <th>Roll</th>
                      <th>Beskrivning</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Admin</strong>
                      </td>
                      <td>Full tillgång till alla användare och roller.</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Redaktör</strong>
                      </td>
                      <td>
                        Skapa, redigera och publicera nyheter, event och
                        landningssidor.
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Moderator</strong>
                      </td>
                      <td>
                        Granska, publicera och ta bort community-inlägg och
                        kommentarer.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminStartPage;
