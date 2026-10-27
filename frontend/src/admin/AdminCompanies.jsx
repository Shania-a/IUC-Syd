import React, { useState } from "react";
import mockData from "../data/mockData.json";

function AdminCompanies() {
  const [companies, setCompanies] = useState(mockData.companies);

  // Id på företaget som ändras just nu. null betyder att vi lägger till ett nytt.
  const [editingId, setEditingId] = useState(null);

  // Rutorna i formuläret, en useState för varje (som i Sign_up)
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");

  // Töm formuläret
  function clearForm() {
    setEditingId(null);
    setName("");
    setContactName("");
    setContactEmail("");
    setCity("");
    setError("");
  }

  // Fyll formuläret med ett företag som ska ändras
  function startEdit(company) {
    setEditingId(company.id);
    setName(company.name);
    setContactName(company.contactName);
    setContactEmail(company.contactEmail);
    setCity(company.city);
    setError("");
  }

  // Körs när man trycker på knappen i formuläret
  function saveCompany(e) {
    e.preventDefault();

    if (name.trim() === "") {
      setError("Ange företagets namn.");
      return;
    }

    if (editingId === null) {
      // Nytt företag. Date.now() ger ett tal som aldrig upprepas, så id:t blir unikt.
      // "name," är samma sak som "name: name,"
      const newCompany = {
        id: "c" + Date.now(),
        name,
        contactName,
        contactEmail,
        city,
      };
      // [...companies, newCompany] = alla gamla företag + det nya sist
      setCompanies([...companies, newCompany]);
    } else {
      // Ändra ett befintligt företag.
      // Är det rätt företag byter vi ut det, alla andra lämnas som de är.
      const newList = companies.map((company) => {
        if (company.id === editingId) {
          return { id: editingId, name, contactName, contactEmail, city };
        }
        return company;
      });
      setCompanies(newList);
    }

    clearForm();
  }

  return (
    <>
      <section className="panel">
        <div className="panel-head">
          <h2>{editingId === null ? "Nytt företag" : "Ändra företag"}</h2>
          <p className="panel-aside">Medlemsföretag och deras huvudkontakter</p>
        </div>

        <form className="company-form" onSubmit={saveCompany}>
          <label>
            Företag
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Huvudkontakt
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </label>
          <label>
            E-post
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </label>
          <label>
            Ort
            <input value={city} onChange={(e) => setCity(e.target.value)} />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="actions">
            <button type="submit" className="btn btn-primary">
              {editingId === null ? "Lägg till företag" : "Spara ändringar"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearForm}
            >
              Avbryt
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Företag</th>
                <th>Huvudkontakt</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td>
                    <strong>{company.name}</strong>
                    <span className="muted">{company.city}</span>
                  </td>
                  <td>
                    {company.contactName}
                    <span className="muted">{company.contactEmail}</span>
                  </td>
                  <td className="align-end">
                    <button
                      className="btn btn-secondary"
                      onClick={() => startEdit(company)}
                    >
                      Ändra
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default AdminCompanies;
