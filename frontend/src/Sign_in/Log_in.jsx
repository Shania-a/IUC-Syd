import React, { useState, useEffect } from "react";
import iucSydImage from "../assets/IUC-Syd_petrol.png";

function Log_in() {
  // NYTT: ingen "token"-state längre. Token ligger i en cookie som frontend inte kan läsa
  const [user, setUser] = useState(null);
  // NYTT: ersätter "token && !user". Är true tills servern har svarat på "vem är jag?"
  const [checking, setChecking] = useState(true);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // NYTT: ersätter checkToken. Ligger utanför useEffect så att både sidladdningen
  // och signIn kan anropa den
  // Frågar Strapi "vem är jag?". Webbläsaren skickar cookien automatiskt
  async function checkUser() {
    try {
      const res = await fetch("http://localhost:1337/api/users/me", {
        // NYTT: gör att webbläsaren skickar med cookien (ersätter Authorization-headern)
        credentials: "include",
      });

      if (res.ok) {
        setUser(await res.json());
      } else {
        setUser(null); // ingen giltig cookie = utloggad
      }
    } catch (err) {
      setUser(null); // servern kunde inte nås
    } finally {
      // NYTT: oavsett resultat är kollen klar, så "Laddar..." ska bort
      setChecking(false);
    }
  }

  // ÄNDRAT: körs bara en gång när sidan laddas ([] i stället för [token])
  useEffect(() => {
    checkUser();
  }, []);

  async function signIn(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:1337/api/auth/local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // NYTT: gör att webbläsaren tar emot och sparar cookien som Strapi skickar
        credentials: "include",
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error.message);
        return;
      }

      // ÄNDRAT: ingen localStorage.setItem eller setToken längre.
      // Cookien är redan sparad av servern, så vi hämtar bara användaren
      await checkUser();
    } catch (err) {
      setError("Kunde inte nå servern");
    } finally {
      setLoading(false);
    }
  }

  // ÄNDRAT: nu async, eftersom servern måste radera cookien
  async function handleLogout() {
    // Frontend kan inte själv ta bort cookien (den är httpOnly), så vi ber servern göra det
    await fetch("http://localhost:1337/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  }

  // ÄNDRAT: villkoret är nu "checking" i stället för "token && !user"
  if (checking) {
    return (
      <div className="form-container m-auto mt-5">
        <p>Laddar...</p>
      </div>
    );
  }

  // ÄNDRAT: villkoret är nu bara "user" i stället för "token && user"
  if (user) {
    return (
      <div className="form-container m-auto mt-5">
        <h1>Inloggad som {user.username}</h1>
        <button className="sign" onClick={handleLogout}>
          Logga ut
        </button>
      </div>
    );
  }

  // Utloggad: visa formuläret (oförändrat)
  return (
    <div className="form-container m-auto mt-5">
      <img
        src={iucSydImage}
        alt="IUC Syd"
        style={{
          display: "block",
          width: 160,
          maxWidth: "100%",
          height: "auto",
          margin: "0 auto 1rem",
        }}
      />

      <form className="form" onSubmit={signIn}>
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            id="username"
            placeholder="Username"
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="forgot">
            <a href="#">Forgot Password ?</a>
          </div>
        </div>

        {error && <p className="text-danger">{error}</p>}

        <button className="sign" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="signup mt-3 mb-0">
        Don't have an account? Contact <strong>IUC syd!</strong>
      </p>
    </div>
  );
}

export default Log_in;
