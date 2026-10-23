import React, { useState } from "react";
import iucSydImage from "../assets/IUC-Syd_petrol.png";
import { useNavigate } from "react-router-dom";
// har ändrat i signup env filen backend index och plugind.js men navigate funkar inte längre varför
function Sign_up() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  function redirectToLogin() {
    navigate("/");
  }
  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Lösenorden matchar inte");
      return;
    }

    const response = await fetch(
      "http://localhost:1337/api/auth/local/register",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userName,
          email: email,
          password: password,
          company_id: company,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error.message);
      return;
    }

    redirectToLogin();
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
        <label>Sign up</label>

        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            placeholder="Username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Email"
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="Confirm_password">Confirm password</label>
          <input
            type="password"
            id="Confirm_password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="Company_id">Company</label>
          <input
            type="text"
            id="Company_id"
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
        </div>
        {message && <p>{message}</p>}

        <button className="sign" type="submit">
          Sign up
        </button>
      </form>
    </div>
  );
}

export default Sign_up;
