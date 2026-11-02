import React, { useEffect, useState } from "react";
import iucSydImage from "../assets/IUC-Syd_petrol.png";
import { useNavigate } from "react-router-dom";

function Sign_up() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companies, setCompanies] = useState([]);
  const [gdpr, setGdpr] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Hämta företag när sidan laddas
  useEffect(() => {
    fetch("http://localhost:1337/api/companies")
      .then((res) => res.json())
      .then((data) => setCompanies(data.data || []))
      .catch((err) => console.error("Kunde inte hämta företag", err));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setIsError(true);
      return setMessage("Lösenorden matchar inte");
    }
    if (!gdpr) {
      setIsError(true);
      return setMessage("Du måste godkänna GDPR");
    }
    if (!companyId) {
      setIsError(true);
      return setMessage("Du måste välja ett företag");
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:1337/api/auth/local/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: userName,
            email: email,
            password: password,
            company_id: companyId, // Sparar företagsnamnet som text
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        return setMessage(data.error?.message || "Registreringen misslyckades");
      }

      setIsError(false);
      setMessage("Konto skapat! En administratör måste godkänna dig.");
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      setIsError(true);
      setMessage("Ett fel uppstod.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container wide m-auto mt-5">
      <img
        src={iucSydImage}
        alt="IUC Syd"
        style={{ width: 160, display: "block", margin: "0 auto 1rem" }}
      />
      <h1 className="title">Skapa konto</h1>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="input-group">
            <label>Användarnamn</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>E-post</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Lösenord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Bekräfta lösenord</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Enkel rullgardinsmeny för företag */}
          <div className="input-group full">
            <label>Företag</label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="">-- Välj ditt företag --</option>
              {companies.map((comp) => (
                <option key={comp.id} value={comp.name}>
                  {comp.name} {comp.city ? `(${comp.city})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="gdpr mt-3">
          <input
            type="checkbox"
            checked={gdpr}
            onChange={(e) => setGdpr(e.target.checked)}
          />
          <span> Jag godkänner villkoren.</span>
        </label>

        {message && (
          <p style={{ color: isError ? "red" : "green", marginTop: "10px" }}>
            {message}
          </p>
        )}

        <button className="sign mt-3" type="submit" disabled={loading}>
          {loading ? "Skapar konto..." : "Registrera"}
        </button>
      </form>
    </div>
  );
}

export default Sign_up;
