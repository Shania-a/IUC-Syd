import React, { useState } from "react";
import iucSydImage from "./assets/IUC-Syd_petrol.png";

function Log_in() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
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
      localStorage.setItem("user", JSON.stringify(data.user));
      // Navigera vidare här, t.ex. navigate("/dashboard")
    } catch (err) {
      setError("Kunde inte nå servern");
    } finally {
      setLoading(false);
    }
  }

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

      <form className="form" onSubmit={handleSubmit}>
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
