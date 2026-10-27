import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

function AdminLayout() {
  // Är menyn öppen? Behövs bara på mobil, där menyn är gömd
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="admin-shell">
      {/* Menyn till vänster */}
      <aside className={menuOpen ? "sidebar is-open" : "sidebar"}>
        <div className="brand">
          <span className="brand-mark">IS</span>
          <span>
            <strong>IUC Syd</strong>
            <small>Administration</small>
          </span>
        </div>

        {/* När man klickar på en länk i menyn stängs menyn (för mobil) */}
        <nav onClick={() => setMenuOpen(false)}>
          <ul className="nav-list">
            <li>
              <NavLink to="/admin" end className="nav-link">
                Översikt
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/anvandare" className="nav-link">
                Användare
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/foretag" className="nav-link">
                Företag
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/moderering" className="nav-link">
                Moderering
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/meddelanden" className="nav-link">
                Privata meddelanden
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/behov" className="nav-link">
                Identifierade behov
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Länkar längst ner */}
        <div className="sidebar-foot">
          {/* Strapis egen adminpanel. Kräver att backend körs. */}
          <a
            className="foot-link"
            href="http://localhost:1337/admin"
            target="_blank"
            rel="noreferrer"
          >
            Öppna redaktörsvyn <span>↗</span>
          </a>
          <a className="foot-link" href="/" target="_blank" rel="noreferrer">
            Öppna portalen <span>↗</span>
          </a>
        </div>
      </aside>

      {/* Mörk hinna bakom menyn på mobil. Klick på den stänger menyn. */}
      {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}

      <div className="admin-main">
        {/* Toppfältet */}
        <header className="topbar">
          {/* Menyknapp, syns bara på mobil */}
          <button
            className="menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Öppna menyn"
          >
            <span />
            <span />
            <span />
          </button>

          <div className="topbar-title">
            <h1>IUC Syd administration</h1>
          </div>

          <div className="admin-chip">
            <span className="brand-mark small">IS</span>
            <span>IUC Syd · administratör</span>
          </div>
        </header>

        <main className="content">
          {/* Outlet = här visas sidan som hör till adressen,
              t.ex. AdminUsers när adressen är /admin/anvandare */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
