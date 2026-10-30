import React, { useEffect, useState } from "react";
import "./css/AdminCompanyPage.css";
import { Link } from "react-router-dom";

/*
  ===================== SÅ KOPPLAR VI DET TILL STRAPI =====================

  STEG 1 – I Strapi (Content-Type Builder)
  Skapa en collection type som heter "Company" (API ID blir "companies").
  Fält:
    - name         (Text)
    - city         (Text)
    - contactName  (Text)    = huvudkontaktens namn
    - contactEmail (Email)   = huvudkontaktens e-post
  Relation:
    - users (Company har många Users) så att vi kan räkna godkända användare.
      Användarna behöver ett fält, t.ex. "approved" (Boolean).

  STEG 2 – Rättigheter i Strapi
  Settings > Users & Permissions > Roles > (Authenticated eller Public)
  Kryssa i "find" (och "findOne") för Company. Annars får vi 403.
  När inloggningen är klar ska bara admin-rollen ha tillgång.

  STEG 3 – Hämta data i React (se useEffect nedan)
  Strapi körs oftast på http://localhost:1337.
  Anropet blir: GET /api/companies?populate=users
  "populate=users" gör att relationen följer med, annars får vi ingen användarlista.

  STEG 4 – Strapis svar
  Strapi v5: svaret är { data: [ { id, name, city, ... } ] }
  Strapi v4: fälten ligger i { data: [ { id, attributes: { name, ... } } ] }
  Koden nedan antar v5. Kör du v4, byt company.name till company.attributes.name osv.

  STEG 5 – Knappar
  "Nytt företag" -> POST /api/companies          med { data: { name, city, ... } }
  "Redigera"     -> PUT  /api/companies/:documentId (v5) eller /:id (v4)
  Gör gärna en egen sida eller modal för formuläret.

  STEG 6 – Sökrutan i topbar
  Kan filtreras på servern:
  /api/companies?filters[name][$containsi]=sökord&populate=users

  Tips: lägg URL:en i en .env-fil i frontend-mappen
  (VITE_API_URL=http://localhost:1337) och läs den med import.meta.env.VITE_API_URL.
  =========================================================================
*/

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:1337";

const AdminCompanyPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hämtar företagen från Strapi när sidan öppnas
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch(`${API_URL}/api/companies?populate=users`);
        if (!response.ok) throw new Error("Kunde inte hämta företag");
        const json = await response.json();
        setCompanies(json.data); // v5: json.data är en lista med platta objekt
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Räknar godkända användare, t.ex. "2 av 3 godkända".
  // Kräver relationen "users" på Company och fältet "approved" på User.
  const approvedText = (company) => {
    const users = company.users || [];
    const approved = users.filter((user) => user.approved).length;
    return `${approved} av ${users.length} godkända`;
  };

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
          <h1>Företag</h1>
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
          <div className="admin-card">
            <div className="card-header">
              <h3>Företag och huvudkontakt</h3>
              {/* TODO: öppna formulär/modal och skicka POST till Strapi (steg 5) */}
              <button className="btn-small">Nytt företag</button>
            </div>

            {loading && <p className="card-sub">Laddar företag...</p>}
            {error && <p className="card-sub">Något gick fel: {error}</p>}

            {!loading && !error && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>FÖRETAG</th>
                    <th>HUVUDKONTAKT</th>
                    <th>ANVÄNDARE</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {/* En rad per företag som kommer från Strapi */}
                  {companies.map((company) => (
                    <tr key={company.id}>
                      <td>
                        <strong>{company.name}</strong>
                        <br />
                        <span className="card-sub">{company.city}</span>
                      </td>
                      <td>
                        {company.contactName}
                        <br />
                        <span className="card-sub">{company.contactEmail}</span>
                      </td>
                      <td>{approvedText(company)}</td>
                      <td>
                        {/* TODO: öppna redigering och skicka PUT till Strapi (steg 5) */}
                        <button className="btn-text">Redigera</button>
                      </td>
                    </tr>
                  ))}

                  {companies.length === 0 && (
                    <tr>
                      <td colSpan="4">Inga företag hittades.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            <p className="card-sub" style={{ marginTop: "24px" }}>
              Företag och kontaktpersoner läggs in manuellt tills kopplingen
              till IUC VS är utredd.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminCompanyPage;
