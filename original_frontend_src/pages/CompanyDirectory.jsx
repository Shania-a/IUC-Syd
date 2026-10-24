import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCompanies } from '../api/companies';

export default function CompanyDirectory() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [industry, setIndustry] = useState('');

  useEffect(() => {
    setLoading(true);
    getCompanies({ query, municipality, industry })
      .then((res) => {
        setCompanies(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [query, municipality, industry]);

  return (
    <div className="container py-4">
      <h1 className="mb-4">Företagskatalog</h1>

      {/* Filtersektion */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Sök på företagsnamn..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={municipality}
            onChange={(e) => setMunicipality(e.target.value)}
          >
            <option value="">Alla kommuner</option>
            <option value="Malmö">Malmö</option>
            <option value="Lund">Lund</option>
            <option value="Helsingborg">Helsingborg</option>
            <option value="Kristianstad">Kristianstad</option>
          </select>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            <option value="">Alla branscher</option>
            <option value="Tillverkande industri">Tillverkande industri</option>
            <option value="Automation & Robotik">Automation & Robotik</option>
            <option value="IT & Mjukvara">IT & Mjukvara</option>
          </select>
        </div>
      </div>

      {/* Kort-grid */}
      {loading ? (
        <p>Laddar företag...</p>
      ) : companies.length === 0 ? (
        <p>Inga medlemsföretag matchade sökningen.</p>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {companies.map((company) => {
            // I Strapi v5 ligger fälten direkt på objektet eller under attributes (beroende på serializer)
            const item = company.attributes || company;
            return (
              <div className="col" key={company.id}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <span className="badge bg-secondary mb-2">{item.industry}</span>
                    <h5 className="card-title">{item.name}</h5>
                    <p className="card-subtitle text-muted mb-2">{item.municipality}</p>
                    <p className="card-text text-truncate">{item.description}</p>
                    <Link to={`/foretag/${item.slug}`} className="btn btn-outline-primary btn-sm">
                      Visa profil
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}