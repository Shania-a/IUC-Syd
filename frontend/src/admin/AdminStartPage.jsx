import React, { useState, useEffect } from "react";
import "./css/AdminStartPage.css";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:1337";

const AdminStartPage = () => {
  const [checking, setChecking] = useState(true);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [companyCount, setCompanyCount] = useState(0);

  // Logga ut-funktion
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Kunde inte logga ut:", err);
    } finally {
      navigate("/", { replace: true });
    }
  };

  // Hämta användare från Strapi
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Kunde inte hämta användare");
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  //Hämtar alla företag Från strapi
  const fetchCompany = async () => {
    try {
      const response = await fetch(`${API_URL}/api/companies`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Kunde inte hämta företag");
      const data = await response.json();
      setCompanies(data.data || []);
      setCompanyCount(data.meta?.pagination?.total ?? 0);
    } catch (err) {
      console.error(err);
    }
  };
  // Kolla om inloggad användare är Admin när sidan laddas
  useEffect(() => {
    fetch(`${API_URL}/api/users/me?populate=role`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          navigate("/", { replace: true });
          return null;
        }
        return res.json();
      })
      .then((meData) => {
        if (!meData) return;

        const roleName =
          meData?.role?.name?.toLowerCase() || meData?.role?.toLowerCase();

        if (roleName !== "admin" && roleName !== "administratör") {
          navigate("/", { replace: true });
          return;
        }

        setChecking(false);
        fetchUsers();
        fetchCompany();
      })
      .catch(() => navigate("/", { replace: true }));
  }, [navigate]);

  // Funktion för att godkänna eller blockera en användare
  const setBlocked = async (userId, blocked) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked }),
      });
      if (!response.ok) throw new Error("Kunde inte uppdatera användaren");

      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, blocked } : user)),
      );
    } catch (err) {
      alert("Fel: " + err.message);
    }
  };

  // Filtrera fram användare som väntar på godkännande (blocked = true)
  const pendingUsers = users.filter((user) => user.blocked === true);

  if (checking) {
    return <p style={{ padding: "2rem" }}>Laddar...</p>;
  }

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
              <li className="active">Översikt</li>
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
              <li>Privata meddelande</li>
            </Link>
            <li>
              <button className="sidebar-logout" onClick={handleLogout}>
                Logga ut
              </button>
            </li>
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
            <Link to="/AdminUserPage">
              <div className="stat-card">
                <span className="stat-label">Användare att godkänna</span>
                <span className="stat-number">{pendingUsers.length}</span>
              </div>
            </Link>
            <Link to="/AdminCompanyPage">
              <div className="stat-card">
                <span className="stat-label">Antal företag</span>
                <span className="stat-number">{companyCount}</span>
              </div>
            </Link>
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
              {/* Användare att godkänna (kopplad till Strapi!) */}
              <div className="admin-card">
                <div className="card-header">
                  <h3>Användare att godkänna</h3>
                  <span className="card-sub">
                    Visar vem som vill bli medlem i IUC Syds gemenskap
                  </span>
                </div>
                <ul className="item-list">
                  {pendingUsers.length > 0 ? (
                    pendingUsers.map((user) => (
                      <li key={user.id} className="list-item">
                        <div className="item-info">
                          <p>Namn: </p>
                          <strong>{user.username}</strong>
                        </div>
                        <div>
                          <p>Företag: </p>
                          <span>{user.company_id || "Inget företag"}</span>
                        </div>
                        <div className="item-meta">
                          <p>Email:</p>
                          <span>{user.email}</span>
                        </div>
                        <div className="item-actions">
                          <button
                            className="btn-success"
                            onClick={() => setBlocked(user.id, false)}
                          >
                            Godkänn
                          </button>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p style={{ padding: "10px", color: "#666" }}>
                      Inga användare väntar på godkännande.
                    </p>
                  )}
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
                  <div className="mod-actions">
                    <button className="btn-primary">Godkänn</button>
                    <button className="btn-danger">Ta bort</button>
                  </div>
                </div>
              </div>

              {/* Företag och huvudkontakt */}
              {/********fixa så att man skrollar i rutan och att rutan inte blir större*********/}
              <div className="admin-card">
                <div className="card-header">
                  <h3>Företag och huvudkontakt</h3>
                  <Link to="/AdminCompanyPage" className="btn-small">
                    Hantera företag
                  </Link>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>FÖRETAG/ORGANISATION</th>
                      <th>HUVUDKONTAKT</th>

                      <th>ÅTGÄRD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((comp) => {
                      const compId = comp.documentId || comp.id;
                      return (
                        <tr key={compId}>
                          <td>
                            <strong>{comp.name}</strong>
                            <br />
                            <span className="card-sub">{comp.city}</span>
                          </td>
                          <td>
                            {comp.contactName}
                            <br />
                            <span className="card-sub">
                              {comp.contactEmail}
                            </span>
                          </td>

                          <td>
                            <Link to="/AdminCompanyPage" className="btn-text">
                              Hantera
                            </Link>
                          </td>
                        </tr>
                      );
                    })}

                    {companies.length === 0 && (
                      <tr>
                        <td colSpan="4">Inga företag hittades.</td>
                      </tr>
                    )}
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
                      <strong>Anmälan till event</strong>
                      <p>Mikael Berg - Skåne Plast AB / Event</p>
                    </div>
                    <button className="btn-secondary">Öppna</button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminStartPage;
