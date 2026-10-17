import React, { useState, useEffect } from "react";
import iucSydImage from "../assets/IUC-Syd_petrol.png";

function Log_in() {
  const [token, setToken] = useState(localStorage.getItem("jwt"));
  const [user, setUser] = useState(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Körs när sidan laddas och när token ändras.
  // Frågar Strapi om token är äkta.
  useEffect(() => {
    if (!token) return; //om token är tom skipar vi denna funktionen

    async function checkToken() {
      try {
        const res = await fetch("http://localhost:1337/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        }); // detta ger oss current user

        if (res.ok) {
          setUser(await res.json()); // om strapi säger att token är äkta då sparar vi current user
        } else {
          // token är falsk eller utgången, logga ut
          localStorage.removeItem("jwt");
          setToken(null);
        }
      } catch (err) {
        // Strapi kunde inte nås, logga ut
        localStorage.removeItem("jwt");
        setToken(null);
      }
    }

    checkToken();
  }, [token]);

  async function signIn(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:1337/api/auth/local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error.message);
        return;
      }

      localStorage.setItem("jwt", data.jwt);
      setToken(data.jwt); // gör att useEffect kontrollerar token
    } catch (err) {
      setError("Kunde inte nå servern");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("jwt");
    setToken(null);
    setUser(null);
  }

  // Token finns men servern har inte svarat än
  if (token && !user) {
    return (
      <div className="form-container m-auto mt-5">
        <p>Laddar...</p>
      </div>
    );
  }

  // Inloggad
  if (token && user) {
    return (
      <div className="form-container m-auto mt-5">
        <h1>Inloggad som {user.username}</h1>
        <button className="sign" onClick={handleLogout}>
          Logga ut
        </button>
      </div>
    );
  }

  // Utloggad: visa formuläret
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
