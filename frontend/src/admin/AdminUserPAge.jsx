import React from "react";
import { Link } from "react-router-dom";
import "./AdminStartPage.css"; // samma CSS-fil som AdminStartPage

const AdminUserPage = () => {
  return (
    <div className="admin-layout">
      {/* Mörkgrön sidomeny (samma som AdminStartPage) */}
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
            <li>Företag</li>
            <li>Avtal</li>
            <li>Moderering</li>
            <li>Privata meddelanden</li>
          </ul>
        </nav>
      </aside>

      {/* Huvudinnehåll */}
      <main className="admin-main-content">
        {/* Samma topbar som AdminStartPage */}
        <header className="admin-topbar">
          <h1>Användare</h1>
          <div className="topbar-search">
            <input
              type="text"
              placeholder="Sök användare, företag eller inlägg"
            />
          </div>
          <div className="topbar-user">
            <span>IUC Syd – Administratör</span>
          </div>
        </header>

        {/* Innehållet för användarhantering */}
        <div className="admin-content-scroll">
          <div className="admin-card">
            <div className="card-header">
              <h3>Alla användare</h3>
              <span className="card-sub">
                Nya konton har ingen åtkomst förrän IUC Syd godkänner
              </span>
            </div>

            {/* Flikar för filtrering */}
            <div
              className="tabs"
              style={{ display: "flex", gap: "8px", marginBottom: "20px" }}
            >
              <button className="btn-secondary active">
                Väntar <span className="badge">3</span>
              </button>
              <button className="btn-outline">
                Godkända <span className="badge">7</span>
              </button>
              <button className="btn-outline">
                Blockerade <span className="badge">1</span>
              </button>
              <button className="btn-outline">
                Alla <span className="badge">11</span>
              </button>
            </div>

            {/* Tabell med användare */}
            <table className="admin-table">
              <thead>
                <tr>
                  <th>NAMN OCH ROLL</th>
                  <th>FÖRETAG</th>
                  <th>REGISTRERAD</th>
                  <th>ÅTGÄRD</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Sara Holm</strong>
                    <br />
                    <span className="card-sub">HR-ansvarig</span>
                  </td>
                  <td>Höglunds Verkstad AB</td>
                  <td>21 okt.</td>
                  <td>
                    <div className="item-actions">
                      <button className="btn-success">Godkänn</button>
                      <button className="btn-outline">Blockera</button>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong>Karin Dahl</strong>
                    <br />
                    <span className="card-sub">Inköpschef</span>
                  </td>
                  <td>Nordisk Plåtteknik AB</td>
                  <td>22 okt.</td>
                  <td>
                    <div className="item-actions">
                      <button className="btn-success">Godkänn</button>
                      <button className="btn-outline">Blockera</button>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong>Mikael Strand</strong>
                    <br />
                    <span className="card-sub">Säljare</span>
                  </td>
                  <td>Trelleborg Verktyg AB</td>
                  <td>23 okt.</td>
                  <td>
                    <div className="item-actions">
                      <button className="btn-success">Godkänn</button>
                      <button className="btn-outline">Blockera</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUserPage;
