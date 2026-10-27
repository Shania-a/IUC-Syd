import React, { useState } from "react";
import mockData from "../data/mockData.json";

function AdminUsers() {
  // Listan med användare. Vi startar med låtsasdatan.
  const [users, setUsers] = useState(mockData.users);
  // Vilken flik som är vald: "pending", "approved", "blocked" eller "all"
  const [filter, setFilter] = useState("pending");

  // Byt status på EN användare, t.ex. till "approved" eller "blocked".
  // map går igenom alla användare. Är det rätt användare (samma id)
  // gör vi en kopia med ny status. Alla andra lämnas som de är.
  // { ...user, status: newStatus } betyder "en kopia av user, men med ny status"
  function changeStatus(id, newStatus) {
    const newList = users.map((user) => {
      if (user.id === id) {
        return { ...user, status: newStatus };
      }
      return user;
    });
    setUsers(newList);
  }

  // Hitta företagets namn utifrån företagets id
  function getCompanyName(companyId) {
    const company = mockData.companies.find((c) => c.id === companyId);
    if (company) {
      return company.name;
    }
    return "";
  }

  // Vilka användare ska visas? Beror på vilken flik som är vald
  let visibleUsers = users;
  if (filter !== "all") {
    visibleUsers = users.filter((user) => user.status === filter);
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Användare</h2>
        <p className="panel-aside">Godkänn nya konton och hantera befintliga</p>
      </div>

      {/* Flikarna */}
      <div className="tabs">
        <button
          className={filter === "pending" ? "tab active" : "tab"}
          onClick={() => setFilter("pending")}
        >
          Väntar
        </button>
        <button
          className={filter === "approved" ? "tab active" : "tab"}
          onClick={() => setFilter("approved")}
        >
          Godkända
        </button>
        <button
          className={filter === "blocked" ? "tab active" : "tab"}
          onClick={() => setFilter("blocked")}
        >
          Blockerade
        </button>
        <button
          className={filter === "all" ? "tab active" : "tab"}
          onClick={() => setFilter("all")}
        >
          Alla
        </button>
      </div>

      {visibleUsers.length === 0 && (
        <p className="empty">Inga användare att visa här.</p>
      )}

      {visibleUsers.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Namn</th>
                <th>Företag</th>
                <th>Registrerad</th>
                <th>Åtgärd</th>
              </tr>
            </thead>
            <tbody>
              {/* En rad per användare. key måste vara unik för varje rad */}
              {visibleUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>
                      {user.firstName} {user.lastName}
                    </strong>
                    <span className="muted">{user.title}</span>
                  </td>
                  <td>{getCompanyName(user.companyId)}</td>
                  <td className="muted">
                    {new Date(user.createdAt).toLocaleDateString("sv-SE")}
                  </td>
                  <td>
                    {/* Knapparna beror på vilken status användaren har */}
                    {user.status === "pending" && (
                      <div className="actions">
                        <button
                          className="btn btn-primary"
                          onClick={() => changeStatus(user.id, "approved")}
                        >
                          Godkänn
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => changeStatus(user.id, "blocked")}
                        >
                          Blockera
                        </button>
                      </div>
                    )}

                    {user.status === "approved" && (
                      <div className="actions">
                        <span className="tag tag-ok">Godkänd</span>
                        <button
                          className="btn btn-secondary"
                          onClick={() => changeStatus(user.id, "blocked")}
                        >
                          Blockera
                        </button>
                      </div>
                    )}

                    {user.status === "blocked" && (
                      <div className="actions">
                        <span className="tag tag-danger">Blockerad</span>
                        <button
                          className="btn btn-secondary"
                          onClick={() => changeStatus(user.id, "approved")}
                        >
                          Avblockera
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminUsers;
