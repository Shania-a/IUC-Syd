import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./css/AdminCompanyPage.css";

const API_URL = "http://localhost:1337";

//lägg till fliteringsystem

const AdminCompanyPage = () => {
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);

  // Modal & Formulär
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    contactName: "",
    contactEmail: "",
  });

  const navigate = useNavigate();

  // 1. Hämta företag och användare samtidigt
  const fetchData = async () => {
    try {
      const [compRes, userRes] = await Promise.all([
        fetch(`${API_URL}/api/companies`, { credentials: "include" }),
        fetch(`${API_URL}/api/users`, { credentials: "include" }),
      ]);

      const compData = await compRes.json();
      const userData = await userRes.json();

      setCompanies(compData.data || []);
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err) {
      console.error("Kunde inte hämta data", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Kolla om inloggad användare är admin
  useEffect(() => {
    fetch(`${API_URL}/api/users/me?populate=role`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          navigate("/", { replace: true });
          return;
        }
        return res.json();
      })
      .then((meData) => {
        if (!meData) return;

        // Hämta rollnamnet
        const roleName = meData?.role?.name?.toLowerCase();

        // Kolla om det är en admin
        if (roleName !== "admin") {
          navigate("/", { replace: true });
          return;
        }

        // Om det är en admin, släpp igenom och visa all data som är hänmtad
        setChecking(false);
        fetchData();
      })
      .catch(() => navigate("/", { replace: true }));
  }, [navigate]);

  // Utloggning
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

  // Spara företag (Skapa ny eller Uppdatera)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!editingCompany;
    const id = editingCompany?.documentId || editingCompany?.id;
    const url = isEdit
      ? `${API_URL}/api/companies/${id}`
      : `${API_URL}/api/companies`;

    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: formData }),
    });

    if (res.ok) {
      setIsModalOpen(false);
      fetchData();
    } else {
      alert("Kunde inte spara företaget");
    }
  };

  // Ta bort företag
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Är du säker på att du vill ta bort "${name}"?`))
      return;

    const res = await fetch(`${API_URL}/api/companies/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) fetchData();
  };

  // Räkna användare som matchar företagets namn via company_id
  const getCompanyCount = (companyName) => {
    const matchedUsers = users.filter((u) => u.company_id === companyName);
    const approved = matchedUsers.filter((u) => !u.blocked).length;
    return `${approved} av ${matchedUsers.length} godkända`;
  };

  // Sökfilter för företagslistan
  const visibleCompanies = companies.filter((comp) =>
    `${comp.name || ""} `.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="admin-layout">
      {/* Sidomeny med dina ursprungliga klasser */}
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
              <li>Företag/Organisation</li>
            </Link>

            <Link to="/AdminModerationPage">
              <li>Moderering</li>
            </Link>

            <Link to="/AdminMessagesPage">
              <li>Privata medelande</li>
            </Link>
            <li>
              <button className="sidebar-logout" onClick={handleLogout}>
                Logga ut
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Huvudinnehåll med dina ursprungliga klasser */}
      <main className="admin-main-content">
        <header className="admin-topbar">
          <h1>Företag/ORGANISATION</h1>
          <div className="topbar-search">
            <input
              type="text"
              placeholder="Sök företag, organisation stad eller kontaktperson..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="topbar-user">
            <span>IUC Syd – Administratör</span>
          </div>
        </header>

        <div className="admin-content-scroll">
          <div className="admin-card">
            <div className="card-header">
              <h3>Företag/ORGANISATION och huvudkontakt</h3>
              <button //knapp för att skapa nytt företag
                className="btn-small"
                onClick={() => {
                  setEditingCompany(null);
                  setFormData({
                    name: "",
                    city: "",
                    contactName: "",
                    contactEmail: "",
                  });
                  setIsModalOpen(true);
                }}
              >
                Nytt företag/ORGANISATION
              </button>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>FÖRETAG/ORGANISATION</th>
                  <th>HUVUDKONTAKT</th>
                  <th>ANVÄNDARE</th>
                  <th>ÅTGÄRD</th>
                </tr>
              </thead>
              <tbody>
                {visibleCompanies.map((comp) => {
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
                        <span className="card-sub">{comp.contactEmail}</span>
                      </td>
                      <td>{getCompanyCount(comp.name)}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="btn-text"
                            onClick={() => {
                              setEditingCompany(comp);
                              setFormData({
                                name: comp.name || "",
                                city: comp.city || "",
                                contactName: comp.contactName || "",
                                contactEmail: comp.contactEmail || "",
                              });
                              setIsModalOpen(true);
                            }}
                          >
                            Redigera
                          </button>
                          <button
                            className="btn-text"
                            style={{ color: "#d9534f" }}
                            onClick={() => handleDelete(compId, comp.name)}
                          >
                            Ta bort
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {visibleCompanies.length === 0 && (
                  <tr>
                    <td colSpan="4">Inga företag hittades.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal för att skapa eller redigera företag */}
        {isModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "#fff",
                padding: "24px",
                borderRadius: "8px",
                width: "400px",
                maxWidth: "90%",
              }}
            >
              <h3>
                {editingCompany ? "Redigera företag" : "Skapa nytt företag"}
              </h3>
              <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", marginBottom: "4px" }}>
                    Företagsnamn *
                  </label>
                  <input
                    type="text"
                    required
                    style={{
                      width: "100%",
                      padding: "8px",
                      boxSizing: "border-box",
                    }}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", marginBottom: "4px" }}>
                    Stad
                  </label>
                  <input
                    type="text"
                    style={{
                      width: "100%",
                      padding: "8px",
                      boxSizing: "border-box",
                    }}
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", marginBottom: "4px" }}>
                    Kontaktperson
                  </label>
                  <input
                    type="text"
                    style={{
                      width: "100%",
                      padding: "8px",
                      boxSizing: "border-box",
                    }}
                    value={formData.contactName}
                    onChange={(e) =>
                      setFormData({ ...formData, contactName: e.target.value })
                    }
                  />
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", marginBottom: "4px" }}>
                    E-post kontakt
                  </label>
                  <input
                    type="email"
                    style={{
                      width: "100%",
                      padding: "8px",
                      boxSizing: "border-box",
                    }}
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    justifyContent: "flex-end",
                    marginTop: "20px",
                  }}
                >
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setIsModalOpen(false)}
                    style={{ padding: "8px 16px", cursor: "pointer" }}
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    className="btn-success"
                    style={{ padding: "8px 16px", cursor: "pointer" }}
                  >
                    Spara
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCompanyPage;
