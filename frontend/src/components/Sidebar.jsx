// Sidebar.jsx
// Den gröna menyn till vänster.
// Menypunkterna hämtas från adminRoutes.jsx, så de stämmer alltid med sidorna.

import { NavLink } from 'react-router-dom';
import { adminSections } from '../adminRoutes';
import { sectionUrl } from '../adminPaths';
import { useAdmin } from '../context/AdminDataContext';
import { STRAPI_URL } from '../services/adminService';

// open       = om menyn är utfälld (bara på mobil)
// onNavigate = körs när man klickar på en länk, för att stänga menyn på mobil
export default function Sidebar({ open, onNavigate }) {
  const { counts } = useAdmin();

  // Dela upp menypunkterna: huvudmenyn och de under "System"
  const mainSections = adminSections.filter((section) => section.group !== 'System');
  const systemSections = adminSections.filter((section) => section.group === 'System');

  // Skapar en menypunkt
  function menuLink(section) {
    // Hämta siffran till badgen, t.ex. counts.pendingUsers
    const count = section.badge && counts ? counts[section.badge] : 0;

    return (
      <li key={section.path}>
        {/* NavLink får automatiskt klassen "active" när man står på sidan */}
        <NavLink to={sectionUrl(section.path)} end className="nav-link" onClick={onNavigate}>
          <span>{section.label}</span>
          {count > 0 && <span className="nav-count">{count}</span>}
        </NavLink>
      </li>
    );
  }

  return (
    <aside className={open ? 'sidebar is-open' : 'sidebar'}>
      {/* Logga */}
      <div className="brand">
        <span className="brand-mark">IS</span>
        <span>
          <strong>IUC Syd</strong>
          <small>Administration</small>
        </span>
      </div>

      {/* Menyn */}
      <nav>
        <ul className="nav-list">{mainSections.map(menuLink)}</ul>
        <p className="nav-group">System</p>
        <ul className="nav-list">{systemSections.map(menuLink)}</ul>
      </nav>

      {/* Länkar längst ner */}
      <div className="sidebar-foot">
        {/* Strapis egen adminpanel, där nyheter och event skrivs. Kräver att backend körs. */}
        <a className="foot-link" href={STRAPI_URL + '/admin'} target="_blank" rel="noreferrer">
          Öppna redaktörsvyn <span>↗</span>
        </a>
        {/* Ändra till rätt adress när medlemsportalen finns */}
        <a className="foot-link" href="/" target="_blank" rel="noreferrer">
          Öppna portalen <span>↗</span>
        </a>
      </div>
    </aside>
  );
}