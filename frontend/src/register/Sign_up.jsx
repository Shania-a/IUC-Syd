import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import iucSydImage from "../assets/IUC-Syd_petrol.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:1337";
// Ändra om ditt plural-ID inte är "companies" (t.ex. "foeretagskorts")
const COMPANIES_ENDPOINT = "companies";

function Sign_up() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyId, setCompanyId] = useState("");

  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Hämta företag till dropdownen
  useEffect(() => {
    fetch(`${API_URL}/api/${COMPANIES_ENDPOINT}?fields[0]=name`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json) => setCompanies(json.data || []))
      .catch(() => setError("Kunde inte hämta företag"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte");
      return;
    }

    setLoading(true);
    try {
      // Steg 1: skapa användaren
      const res = await fetch(`${API_URL}/api/auth/local/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userName, email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Registreringen misslyckades");
      }

      // Om e-postbekräftelse är på får man ingen jwt tillbaka
      if (!json.jwt) {
        setError("Konto skapat. Bekräfta din e-post och logga in.");
        return;
      }

      // Steg 2: sätt extra fält och företag
      const upd = await fetch(`${API_URL}/api/users/${json.user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${json.jwt}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          job_title: jobTitle,
          company: Number(companyId),
        }),
      });
      if (!upd.ok) {
        throw new Error("Kontot skapades men profilen kunde inte sparas");
      }

      localStorage.setItem("jwt", json.jwt);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        <label>Sign up</label>

        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            autoComplete="username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="full_name">Full name</label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            placeholder="Full name"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="job_title">Job title</label>
          <input
            type="text"
            id="job_title"
            name="job_title"
            placeholder="Job title"
            autoComplete="organization-title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="confirm_password">Confirm password</label>
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            placeholder="Confirm Password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="company">Company</label>
          <select
            id="company"
            name="company"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            required
          >
            <option value="">Välj företag</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {error && <p style={{ color: "crimson" }}>{error}</p>}

        <button className="sign" type="submit" disabled={loading}>
          {loading ? "Skapar konto..." : "Sign up"}
        </button>
      </form>
    </div>
  );
}

export default Sign_up;
