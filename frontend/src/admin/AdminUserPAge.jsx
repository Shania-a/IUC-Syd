import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./css/AdminUserPage.css";

const API_URL = "http://localhost:1337";

const AdminUserPage = () => {
  // users = listan med alla användare från Strapi. Börjar tom
  const [users, setUsers] = useState([]);
  // activeTab = vilken flik som är vald: "pending", "approved" eller "all"
  const [activeTab, setActiveTab] = useState("pending"); // pending | approved | all
  // search = texten i sökrutan
  const [search, setSearch] = useState("");
  // loading = true medan användarna hämtas
  const [loading, setLoading] = useState(true);
  // error = felmeddelande, eller null om allt är bra
  const [error, setError] = useState(null);
  // checking = true tills vi vet om den inloggade är admin
  const [checking, setChecking] = useState(true);
  // navigate = funktion för att skicka användaren till en annan sida
  const navigate = useNavigate();

  // useEffect körs en gång när sidan öppnas (och om navigate ändras)
  useEffect(() => {
    // Funktion som först kollar admin och sedan hämtar användarna
    const fetchUsers = async () => {
      // try/catch fångar fel så att sidan inte kraschar
      try {
        // Frågar Strapi "vem är jag?" och ber om rollen med (populate=role)
        const me = await fetch(`${API_URL}/api/users/me?populate=role`, {
          // credentials: "include" skickar med inloggningscookien
          credentials: "include",
        });

        // Om Strapi inte svarar OK (t.ex. 401/403) är man inte inloggad
        if (!me.ok) {
          // Skicka till inloggningssidan, utan att spara den här sidan i historiken
          navigate("/", { replace: true });
          // Avbryt funktionen, resten ska inte köras
          return;
        }

        // Gör om svaret från JSON till ett JavaScript-objekt
        const meData = await me.json();

        // Plockar ut rollnamnet i gemener, så "Admin" och "admin" blir samma
        const roleName =
          meData?.role?.name?.toLowerCase() || meData?.role?.toLowerCase();

        // Om rollen varken är "admin" eller "administratör" får man inte vara här
        if (roleName !== "admin" && roleName !== "administratör") {
          // Skriver en varning i konsolen med vilken roll användaren hade
          console.warn("Åtkomst nekad. Rollen är inte admin:", roleName);
          // Skicka till inloggningssidan
          navigate("/", { replace: true });
          // Avbryt funktionen
          return;
        }

        // Det är en admin, så sluta visa "Laddar..." och visa sidan
        setChecking(false);

        // Hämtar alla användare, nyast registrerade först (sort=createdAt:desc)
        const response = await fetch(
          `${API_URL}/api/users?sort=createdAt:desc`,
          // Skickar med cookien igen
          { credentials: "include" },
        );

        // 401 = inte inloggad, 403 = saknar rättighet i Strapi
        if (response.status === 401 || response.status === 403) {
          // Kastar ett fel som fångas av catch längre ner
          throw new Error(
            "Du har inte behörighet att se användare. Logga in som administratör.",
          );
        }
        // Alla andra fel (t.ex. 500) ger ett allmänt felmeddelande
        if (!response.ok) throw new Error("Kunde inte hämta användare");

        // Sparar användarlistan i state, då ritas tabellen om
        setUsers(await response.json());
      } catch (err) {
        // Sparar felmeddelandet så att det visas på sidan
        setError(err.message);
      } finally {
        // Körs alltid: sluta visa "Laddar användare..."
        setLoading(false);
      }
    };

    // Kör funktionen direkt när sidan öppnas
    fetchUsers();
    // Lista över saker som får effekten att köras om (här bara navigate)
  }, [navigate]);

  // Ändrar blocked på en användare i Strapi (true = blockerad, false = godkänd)
  const setBlocked = async (userId, blocked) => {
    try {
      // Skickar en PUT till Strapi med användarens id i adressen
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        // PUT = uppdatera befintlig post
        method: "PUT",
        // Skickar med inloggningscookien
        credentials: "include",
        // Talar om att vi skickar JSON
        headers: { "Content-Type": "application/json" },
        // Själva ändringen, t.ex. { "blocked": false }
        body: JSON.stringify({ blocked }),
      });
      // Om Strapi nekar eller något går fel, kasta ett fel
      if (!response.ok) throw new Error("Kunde inte uppdatera användaren");

      // Uppdaterar listan på skärmen utan att hämta allt igen
      setUsers((prev) =>
        // Går igenom alla användare: byter blocked på den som ändrades
        prev.map((user) => (user.id === userId ? { ...user, blocked } : user)),
      );
    } catch (err) {
      // Visar felet på sidan
      setError(err.message);
    }
  };

  // Alla användare som väntar på godkännande (blocked = true)
  const pendingUsers = users.filter((user) => user.blocked === true);
  // Alla godkända användare (blocked = false)
  const approvedUsers = users.filter((user) => user.blocked === false);

  // Väljer vilken lista som hör till den valda fliken
  const tabUsers =
    activeTab === "pending"
      ? pendingUsers // fliken "Väntar"
      : activeTab === "approved"
        ? approvedUsers // fliken "Godkända"
        : users; // fliken "Alla"

  // Filtrerar flik-listan med texten i sökrutan
  const visibleUsers = tabUsers.filter((user) =>
    // Slår ihop namn, e-post och företag till en text (|| "" skyddar mot tomma fält)
    `${user.username || ""} ${user.email || ""} ${user.company_id || ""}`
      // Gör allt till gemener så sökningen inte bryr sig om stora/små bokstäver
      .toLowerCase()
      // Behåll användaren om sökordet finns någonstans i texten
      .includes(search.toLowerCase()),
  );

  // Gör om ett datum från Strapi till t.ex. "21 okt."
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("sv-SE", {
      // Dag som tal
      day: "numeric",
      // Månad som kort text
      month: "short",
    });

  // Loggar ut användaren
  const handleLogout = async () => {
    try {
      // Ber Strapi radera inloggningscookien
      await fetch(`${API_URL}/api/auth/logout`, {
        // POST = skicka en åtgärd till servern
        method: "POST",
        credentials: "include", // Skickar med cookien så servern vet vem som loggas ut
      });
    } catch (err) {
      // Om anropet misslyckas skrivs felet i konsolen
      console.error("Kunde inte logga ut ordentligt:", err);
    } finally {
      // Skicka alltid användaren till inloggningssidan oavsett om serveranropet lyckades helt
      navigate("/", { replace: true });
    }
  };

  // Här börjar det som ritas på sidan (JSX)
  return (
    // Yttersta rutan som håller ihop sidomeny och innehåll
    <div className="admin-layout">
      {/* Den mörkgröna sidomenyn till vänster */}
      <aside className="admin-sidebar">
        {/* Logotyp och text överst i menyn */}
        <div className="sidebar-logo">
          <h2>IUC Syd</h2>
          <span>ADMINISTRATION</span>
        </div>
        {/* Navigeringen med alla menyval */}
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
            <li>
              <button className="sidebar-logout" onClick={handleLogout}>
                Logga ut
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Huvudytan till höger om menyn */}
      <main className="admin-main-content">
        {/* Toppfältet med rubrik, sök och användarinfo */}
        <header className="admin-topbar">
          {/* Sidans rubrik */}
          <h1>Användare</h1>
          {/* Sökrutan */}
          <div className="topbar-search">
            {/* value = texten kommer från state, onChange uppdaterar state vid varje tecken */}
            <input
              type="text"
              placeholder="Sök användare, företag eller inlägg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Text till höger som visar vem som är inloggad */}
          <div className="topbar-user">
            <span>IUC Syd – Administratör</span>
          </div>
        </header>

        {/* Området med innehållet, som kan scrolla */}
        <div className="admin-content-scroll">
          {/* Det vita kortet som håller tabellen */}
          <div className="admin-card">
            {/* Kortets rubrikrad */}
            <div className="card-header">
              <h3>Alla användare</h3>
              {/* Liten förklarande text till höger */}
              <span className="card-sub">
                Nya konton har ingen åtkomst förrän IUC Syd godkänner
              </span>
            </div>

            {/* Flikarna. style placerar knapparna bredvid varandra med mellanrum */}
            <div
              className="tabs"
              style={{ display: "flex", gap: "8px", marginBottom: "20px" }}
            >
              {/* Fliken Väntar. Är den vald får knappen klassen "active" */}
              <button
                className={
                  activeTab === "pending"
                    ? "btn-secondary active"
                    : "btn-outline"
                }
                // Vid klick byts vald flik till "pending"
                onClick={() => setActiveTab("pending")}
              >
                {/* Antalet väntande visas i en liten ruta */}
                Väntar <span className="badge">{pendingUsers.length}</span>
              </button>
              {/* Fliken Godkända, samma upplägg */}
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
              {/* Fliken Alla, samma upplägg */}
              <button
                className={
                  activeTab === "all" ? "btn-secondary active" : "btn-outline"
                }
                onClick={() => setActiveTab("all")}
              >
                Alla <span className="badge">{users.length}</span>
              </button>
            </div>

            {/* Visas medan användarna hämtas */}
            {loading && <p className="card-sub">Laddar användare...</p>}
            {/* Visas om något gick fel */}
            {error && <p className="card-sub">Något gick fel: {error}</p>}

            {/* Tabellen visas bara när det inte laddar och inget fel finns */}
            {!loading && !error && (
              <table className="admin-table">
                {/* Tabellens rubrikrad */}
                <thead>
                  <tr>
                    <th>NAMN OCH E-POST</th>
                    <th>FÖRETAG</th>
                    <th>REGISTRERAD</th>
                    <th>ÅTGÄRD</th>
                  </tr>
                </thead>
                {/* Tabellens innehåll */}
                <tbody>
                  {/* En rad per användare i den filtrerade listan. key hjälper React hålla koll */}
                  {visibleUsers.map((user) => (
                    <tr key={user.id}>
                      {/* Kolumn 1: namn och e-post */}
                      <td>
                        <strong>{user.username}</strong>
                        <br />
                        <span className="card-sub">{user.email}</span>
                      </td>
                      {/* Kolumn 2: företaget (textfältet company_id i Strapi) */}
                      <td>{user.company_id}</td>
                      {/* Kolumn 3: registreringsdatum i kort format */}
                      <td>{formatDate(user.createdAt)}</td>
                      {/* Kolumn 4: knappar */}
                      <td>
                        <div className="item-actions">
                          {/* Är användaren blockerad visas Godkänn, annars Blockera */}
                          {user.blocked ? (
                            <button
                              className="btn-success"
                              // Godkänn: sätter blocked till false
                              onClick={() => setBlocked(user.id, false)}
                            >
                              Godkänn
                            </button>
                          ) : (
                            <button
                              className="btn-outline"
                              // Blockera: sätter blocked till true
                              onClick={() => setBlocked(user.id, true)}
                            >
                              Blockera
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Om listan är tom visas en rad som berättar det. colSpan=4 sträcker över alla kolumner */}
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

// Gör att andra filer (App.jsx) kan importera komponenten
export default AdminUserPage;
