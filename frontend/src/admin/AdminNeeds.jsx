import React, { useState } from "react";
import mockData from "../data/mockData.json";

function AdminNeeds() {
  const [needs, setNeeds] = useState(mockData.needs);

  // Markera ETT behov som hanterat (samma mönster som för användare)
  function markHandled(id) {
    const newList = needs.map((need) => {
      if (need.id === id) {
        return { ...need, status: "handled" };
      }
      return need;
    });
    setNeeds(newList);
  }

  // Hitta företagets namn utifrån företagets id
  function getCompanyName(companyId) {
    const company = mockData.companies.find((c) => c.id === companyId);
    if (company) {
      return company.name;
    }
    return "";
  }

  // Nya behov först, hanterade sist
  const newNeeds = needs.filter((need) => need.status === "new");
  const handledNeeds = needs.filter((need) => need.status !== "new");
  const sortedNeeds = [...newNeeds, ...handledNeeds];

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Identifierade behov</h2>
        <p className="panel-aside">
          Behov som fångats upp hos medlemsföretagen
        </p>
      </div>

      {sortedNeeds.length === 0 && (
        <p className="empty">Inga behov identifierade ännu.</p>
      )}

      <ul className="stack divided">
        {sortedNeeds.map((need) => (
          <li key={need.id} className="row-item">
            <div>
              <strong>{need.title}</strong>
              <p className="muted small">
                {getCompanyName(need.companyId)} · från{" "}
                {need.source.toLowerCase()}
              </p>
              <div className="tag-row">
                <span className="tag tag-new">{need.category}</span>
              </div>
            </div>

            {need.status === "new" ? (
              <button
                className="btn btn-secondary"
                onClick={() => markHandled(need.id)}
              >
                Markera som hanterat
              </button>
            ) : (
              <span className="tag tag-ok">Hanterat</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default AdminNeeds;
