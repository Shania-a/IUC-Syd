import React, { useState, useEffect } from "react";
import { Link, useNavigate, redirect, Navigate } from "react-router-dom";

const API_URL = "http://localhost:1337";

function Start_sida() {
  const navigate = useNavigate(); // används för att navigera till andra sidor
  // vi behehöver ett api som visar vilken användare är inlogad så vi kan skriva "Välkomen tillbaka, (användarens namn)"
  // Ett div där den skickar dig till ett formum som du kan fylla i föf att publicera i community
  // en div för att visa nyheter och events som iuc lägger ut genom ungapped
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
      {/* IStället för Anna ska vi byta ut den för den användaren som är inlogad*/}
      <h2>Välkomen tillbaka, Anna</h2>
      <div className="card">
        <div className="card-body">
          <h4 className="card-title">Beskriv en utmaning eller ett behov</h4>
          <p className="card-text">Dela i communityt</p>

          <Link to="/" className="btn btn-primary">
            {/* måste byta namn och måste skapa en sida för att den ska skicka oss dit*/}
            Gör ett inlägg
          </Link>
          <button className="sidebar-logout" onClick={handleLogout}>
            Logga ut
          </button>
        </div>
      </div>
    </>
  );
}
export default Start_sida;
