import React from "react";
import "./css/AdminModerationPage.css"; // samma CSS-fil som AdminStartPage
import { Link } from "react-router-dom";

const AdminModerationPage = () => {
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
      </main>
    </div>
  );
};

export default AdminModerationPage;
