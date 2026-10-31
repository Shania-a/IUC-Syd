import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./css/AdminUserPage.css";

const API_URL = "http://localhost:1337";

const AdminUserPage = () => {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("pending"); // pending | approved | all
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const me = await fetch(`${API_URL}/api/users/me?populate=role`, {
          credentials: "include",
        });

        if (!me.ok) {
          navigate("/", { replace: true });
          return;
        }

        const meData = await me.json();
        console.log("Inloggad användare data:", meData);

        const roleName =
          meData?.role?.name?.toLowerCase() || meData?.role?.toLowerCase();

        if (roleName !== "admin" && roleName !== "administratör") {
          console.warn("Åtkomst nekad. Rollen är inte admin:", roleName);
          navigate("/", { replace: true });
          return;
        }

        setChecking(false);

        const response = await fetch(
          `${API_URL}/api/users?sort=createdAt:desc`,
          { credentials: "include" },
        );

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Du har inte behörighet att se användare. Logga in som administratör.",
          );
        }
        if (!response.ok) throw new Error("Kunde inte hämta användare");

        setUsers(await response.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

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
      setError(err.message);
    }
  };

  const pendingUsers = users.filter((user) => user.blocked === true);
  const approvedUsers = users.filter((user) => user.blocked === false);

  const tabUsers =
    activeTab === "pending"
      ? pendingUsers
      : activeTab === "approved"
        ? approvedUsers
        : users;

  const visibleUsers = tabUsers.filter((user) =>
    `${user.username || ""} ${user.email || ""} ${user.company_id || ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("sv-SE", {
      day: "numeric",
      month: "short",
    });

  if (checking) {
    return <p style={{ padding: "2rem" }}>Laddar...</p>;
  }

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include", // Skickar med cookien så servern vet vem som loggas ut
      });
    } catch (err) {
      console.error("Kunde inte logga ut ordentligt:", err);
    } finally {
      // Skicka alltid användaren till inloggningssidan oavsett om serveranropet lyckades helt
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <h2>IUC Syd</h2>
          <span>ADMINISTRATION</span>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/admin">Översikt</Link>
            </li>
            <li className="active">
              <Link to="/AdminUserPage">Användare</Link>
            </li>
            <li>
              <Link to="/AdminCompanyPage">Företag</Link>
            </li>
            <li>
              <Link to="/AdminModerationPage">Moderering</Link>
            </li>
            <li>
              <Link to="/AdminMessagesPage">Privata meddelanden</Link>
            </li>
            <li>
              <button className="sidebar-logout" onClick={handleLogout}>
                Logga ut
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="admin-main-content">
        <header className="admin-topbar">
          <h1>Användare</h1>
          <div className="topbar-search">
            <input
              type="text"
              placeholder="Sök användare, företag eller inlägg"
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
              <h3>Alla användare</h3>
              <span className="card-sub">
                Nya konton har ingen åtkomst förrän IUC Syd godkänner
              </span>
            </div>

            <div
              className="tabs"
              style={{ display: "flex", gap: "8px", marginBottom: "20px" }}
            >
              <button
                className={
                  activeTab === "pending"
                    ? "btn-secondary active"
                    : "btn-outline"
                }
                onClick={() => setActiveTab("pending")}
              >
                Väntar <span className="badge">{pendingUsers.length}</span>
              </button>
              <button
                className={
                  activeTab === "approved"
                    ? "btn-secondary active"
                    : "btn-outline"
                }
                onClick={() => setActiveTab("approved")}
              >
                Godkända <span className="badge">{approvedUsers.length}</span>
              </button>
              <button
                className={
                  activeTab === "all" ? "btn-secondary active" : "btn-outline"
                }
                onClick={() => setActiveTab("all")}
              >
                Alla <span className="badge">{users.length}</span>
              </button>
            </div>

            {loading && <p className="card-sub">Laddar användare...</p>}
            {error && <p className="card-sub">Något gick fel: {error}</p>}

            {!loading && !error && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>NAMN OCH E-POST</th>
                    <th>FÖRETAG</th>
                    <th>REGISTRERAD</th>
                    <th>ÅTGÄRD</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.username}</strong>
                        <br />
                        <span className="card-sub">{user.email}</span>
                      </td>
                      <td>{user.company_id}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <div className="item-actions">
                          {user.blocked ? (
                            <button
                              className="btn-success"
                              onClick={() => setBlocked(user.id, false)}
                            >
                              Godkänn
                            </button>
                          ) : (
                            <button
                              className="btn-outline"
                              onClick={() => setBlocked(user.id, true)}
                            >
                              Blockera
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {visibleUsers.length === 0 && (
                    <tr>
                      <td colSpan="4">Inga användare i den här listan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUserPage;
