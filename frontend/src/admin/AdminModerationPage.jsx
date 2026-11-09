import React from "react";
import "./css/AdminModerationPage.css"; // samma CSS-fil som AdminStartPage
import { Link, useNavigate } from "react-router-dom";

const AdminModerationPage = () => {
  const navigate = useNavigate();

  return (
    <main className="admin-main-content">
      {/* Huvudinnehåll */}
      <header className="admin-topbar">
        <h1>Moderering</h1>
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
  );
};

export default AdminModerationPage;
