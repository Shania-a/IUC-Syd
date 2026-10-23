import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCompanyBySlug } from '../api/companies';
import CompanyCard from "../components/CompanyCard/CompanyCard";

export default function CompanyDetail() {
  const { slug } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompanyBySlug(slug)
      .then((data) => setCompany(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="container py-4">Laddar...</div>;
  if (!company) return <div className="container py-4">Företaget hittades inte.</div>;

  const data = company.attributes || company;
  const employees = data.employees?.data || data.employees || [];

  // GDPR-filter: Visa ENDAST medarbetare som har gdprConsent satt till true (K42)
  const approvedEmployees = employees.filter((emp) => {
    const e = emp.attributes || emp;
    return e.gdprConsent === true;
  });

  return (
    <div className="container py-4">
      <Link to="/foretag" className="btn btn-link px-0 mb-3">
        &larr; Tillbaka till företagskatalogen
      </Link>

     
      <CompanyCard company={company} />
      

      {/* Sektion för anslutna medarbetare (K40, K41, K42) */}
      <h3 className="mt-4 mb-3">Kontaktpersoner & Medarbetare</h3>
      {approvedEmployees.length === 0 ? (
        <p className="text-muted">Inga publika kontaktpersoner registrerade.</p>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 g-3">
          {approvedEmployees.map((emp) => {
            const e = emp.attributes || emp;
            return (
              <div className="col" key={emp.id}>
                <div className="card p-3 border-0 bg-white shadow-sm">
                  <h6 className="mb-1">{e.username}</h6>
                  <p className="small text-muted mb-1">{e.companyRole || 'Medlem'}</p>
                  {e.publicEmail && (
                    <a href={`mailto:${e.publicEmail}`} className="small text-decoration-none">
                      {e.publicEmail}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Platshållare för K43-K44: Community-engagemang */}
      <h3 className="mt-5 mb-3">Community-aktivitet</h3>
      <div className="alert alert-secondary">
        Här kommer diskussioner och inlägg från medlemmar kopplade till {data.name} att listas så fort forumet är aktivt.
      </div>
    </div>
  );
}