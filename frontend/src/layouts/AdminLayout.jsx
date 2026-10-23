// AdminLayout.jsx
// Ramen runt alla admin-sidor: sidomeny till vänster, toppfält överst
// och den aktuella sidan i mitten.

import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { adminSections } from '../adminRoutes';
import { sectionUrl } from '../adminPaths';
import { useAdmin } from '../context/AdminDataContext';

export default function AdminLayout() {
  const { loading, error, toast } = useAdmin();
  const location = useLocation(); // vilken adress vi är på just nu

  // Om menyn är utfälld (bara på mobil)
  const [menuOpen, setMenuOpen] = useState(false);

  // Hitta vilken sektion vi är på, för att visa rätt rubrik.
  // replace tar bort ett eventuellt "/" i slutet av adressen.
  const currentPath = location.pathname.replace(/\/$/, '');
  const currentSection =
    adminSections.find((section) => sectionUrl(section.path) === currentPath) || adminSections[0];

  return (
    <div className="admin-shell">
      <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />

      {/* Mörk hinna bakom menyn på mobil. Klick på den stänger menyn. */}
      {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}

      <div className="admin-main">
        <Header
          title={currentSection.label}
          subtitle={currentSection.subtitle}
          onMenuClick={() => setMenuOpen(true)}
        />

        <main className="content">
          {error && <p className="alert">Kunde inte hämta data: {error}</p>}
          {loading && <p className="muted">Hämtar data…</p>}

          {/* Outlet = här visas den sida som hör till adressen */}
          {!loading && !error && <Outlet />}
        </main>
      </div>

      {/* Bekräftelserutan längst ner, t.ex. "Kontot är godkänt" */}
      {toast && (
        <div className="toast-region">
          <div className="toast">{toast}</div>
        </div>
      )}
    </div>
  );
}