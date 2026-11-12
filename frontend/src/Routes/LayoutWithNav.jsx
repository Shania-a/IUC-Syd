import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import "./LayoutWithNav.css";

const API_URL = "http://localhost:1337";

function LayoutWithNav() {
  const navigate = useNavigate(); // används för att navigera till andra sidor

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
  return (
    <>
      <nav className="user-nav">
        <div className="user-nav-inner">
          {/* NavLink lägger automatiskt klassen "active" på sidan du står på */}
          <NavLink to="/Start_sida">Start</NavLink>
          <NavLink to="/community">Community</NavLink>
          <NavLink to="/mitt_foretag">Mitt företag</NavLink>
          <NavLink to="/user_messages">Meddelanden</NavLink>
          <button onClick={handleLogout} className="logout-btn-userPage">
            Logga ut
          </button>
        </div>
      </nav>

      {/* Här visas sidan (Start, Mitt företag, Meddelanden) */}
      <div className="user-layout-content">
        <Outlet />
      </div>
    </>
  );
}

export default LayoutWithNav;
