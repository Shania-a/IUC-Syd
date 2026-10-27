import React, { useState } from "react";
import iucSydImage from "../assets/IUC-Syd_petrol.png";
import { useNavigate } from "react-router-dom";

function Sign_up() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [company, setCompany] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function redirectToLogin() {
    navigate("/");
  }

  function showError(text) {
    setIsError(true);
    setMessage(text);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) return showError("Lösenorden matchar inte");
    if (!gdpr) return showError("Du måste godkänna behandlingen av personuppgifter");

    setLoading(true);
    try {
      const response = await fetch("http://localhost:1337/api/auth/local/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userName,
          email,
          password,
          company_id: company,
        }),
      });

      const data = await response.json();
      console.log("Svar från Strapi:", response.status, data);

      if (!response.ok) {
        return showError(data.error?.message || "Registreringen misslyckades");
      }

      setIsError(false);
      setMessage("Konto skapat! En administratör måste godkänna ditt konto innan du kan logga in.");
      setTimeout(redirectToLogin, 4000);
    } catch (error) {
      console.error("Fel vid registrering:", error);
      showError("Något gick fel. Kör Strapi, och se Console för detaljer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container wide m-auto mt-5">
      <img
        src={iucSydImage}
        alt="IUC Syd"
        style={{ display: "block", width: 160, maxWidth: "100%", height: "auto", margin: "0 auto 1rem" }}
      />
      <h1 className="title">Skapa konto</h1>
      <p className="subtitle">Fyll i dina uppgifter för att ansöka om medlemskap</p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input id="username" type="text" placeholder="Username" autoComplete="username"
              value={userName} onChange={(e) => setUserName(e.target.value)} required />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="Email" autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="Password" autoComplete="new-password"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="input-group">
            <label htmlFor="confirm_password">Confirm password</label>
            <input id="confirm_password" type="password" placeholder="Confirm password" autoComplete="new-password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>

          <div className="input-group full">
            <label htmlFor="company_id">Company</label>
            <input id="company_id" type="text" placeholder="Company" autoComplete="organization"
              value={company} onChange={(e) => setCompany(e.target.value)} required />
          </div>
        </div>

        <label className="gdpr">
          <input type="checkbox" checked={gdpr} onChange={(e) => setGdpr(e.target.checked)} />
          <span>
            Jag godkänner att IUC Syd behandlar mina personuppgifter (namn, e-post och företag)
            för att administrera mitt medlemskap, i enlighet med GDPR. Läs mer i vår{" "}
            <a href="/integritetspolicy" target="_blank" rel="noreferrer">integritetspolicy</a>.
          </span>
        </label>

        {message && <p className={isError ? "text-danger" : "text-success"}>{message}</p>}

        <button className="sign" type="submit" disabled={loading}>
          {loading ? "Skapar konto..." : "Sign up"}
        </button>
      </form>

      <p className="signup mt-3 mb-0">
        Already have an account? <a href="/">Log in</a>
      </p>
    </div>
  );
}

export default Sign_up;