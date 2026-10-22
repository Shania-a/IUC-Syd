import React, { useState, useEffect } from "react";
import iucSydImage from "../assets/IUC-Syd_petrol.png";

function Sign_up() {
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

      <form className="form">
        <label>Sing up</label>
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            id="username"
            placeholder="Username"
            autoComplete="username"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="username">email</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="email"
            autoComplete="email"
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
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Confirm password</label>
          <input
            type="password"
            name="Confirm_password"
            id="Confirm_password"
            placeholder="Confirm Password"
            autoComplete="current-password"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Company</label>
          <input
            type="text"
            name="Company"
            id="Company"
            placeholder="Company"
            autoComplete="Company"
            required
          />
        </div>

        <button className="sign" type="submit">
          Sign up
        </button>
      </form>
    </div>
  );
}

export default Sign_up;
