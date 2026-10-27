import React from "react";
import { Link } from "react-router-dom";
import mockData from "../data/mockData.json";

function AdminStart() {
  // Räkna hur många saker som väntar.
  // filter plockar ut de som uppfyller villkoret, length är hur många det blev.
  // Siffrorna kommer från låtsasdatan, så de ändras inte när du godkänner något.
  // När vi kopplar Strapi hämtar vi riktiga siffror här i stället.
  const pendingUsers = mockData.users.filter(
    (user) => user.status === "pending",
  ).length;

  const postsToReview = mockData.posts.filter(
    (post) => post.status === "reported" || post.status === "pending",
  ).length;

  const unansweredMessages = mockData.messages.filter(
    (message) => message.status !== "replied",
  ).length;

  const newNeeds = mockData.needs.filter(
    (need) => need.status === "new",
  ).length;

  return (
    <>
      <section className="panel">
        <div className="panel-head">
          <h2>Översikt</h2>
          <p className="panel-aside">Det som väntar på IUC Syd just nu</p>
        </div>
      </section>

      <div className="stats">
        <Link to="/admin/anvandare" className="stat">
          <span className="stat-label">Användare att godkänna</span>
          <span className="stat-value">{pendingUsers}</span>
        </Link>

        <Link to="/admin/moderering" className="stat">
          <span className="stat-label">Inlägg att granska</span>
          <span className="stat-value">{postsToReview}</span>
        </Link>

        <Link to="/admin/meddelanden" className="stat">
          <span className="stat-label">Obesvarade meddelanden</span>
          <span className="stat-value">{unansweredMessages}</span>
        </Link>

        <Link to="/admin/behov" className="stat">
          <span className="stat-label">Nya identifierade behov</span>
          <span className="stat-value">{newNeeds}</span>
        </Link>
      </div>
    </>
  );
}

export default AdminStart;
