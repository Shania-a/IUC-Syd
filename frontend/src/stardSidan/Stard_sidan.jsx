import React, { useState, useEffect } from "react";
import { Navigate, redirect, Link } from "react-router-dom";

function Start_sida() {
  // vi behehöver ett api som visar vilken användare är inlogad så vi kan skriva "Välkomen tillbaka, (användarens namn)"
  // Ett div där den skickar dig till ett formum som du kan fylla i föf att publicera i community
  // en div för att visa nyheter och events som iuc lägger ut genom ungapped

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
        </div>
      </div>
    </>
  );
}
export default Start_sida;
