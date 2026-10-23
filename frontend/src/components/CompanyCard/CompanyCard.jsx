
import React from 'react';
import './CompanyCard.css';

const STRAPI_URL = 'http://localhost:1337';

export default function CompanyCard({ company }) {
  if (!company) return null;

  const data = company.attributes || company;

  const name = data.name || 'Okänt företag';

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();

  const logo = data.logo?.data?.attributes ||
               data.logo?.data ||
               data.logo;

  const logoUrl = logo?.url
    ? new URL(logo.url, STRAPI_URL).href
    : null;

  const location = [
    data.municipality,
    data.industry
  ].filter(Boolean).join(' · ');

  return (
    <article className="company-profile-card">
      <div className="company-profile-header">
        <div className="company-profile-avatar">
          {logoUrl ? (
            <img src={logoUrl} alt={`${name} logotyp`} />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <div className="company-profile-heading">
          <h2>{name}</h2>
          {location && <p>{location}</p>}
        </div>
      </div>

      {data.description && (
        <p className="company-profile-description">
          {data.description}
        </p>
      )}

      {(data.email || data.phone) && (
        <div className="company-profile-contact">
          {data.email && (
            <a href={`mailto:${data.email}`}>
              {data.email}
            </a>
          )}

          {data.phone && (
            <a href={`tel:${data.phone.replace(/[^\d+]/g, '')}`}>
              {data.phone}
            </a>
          )}
        </div>
      )}

      <div className="company-profile-notice">
        Företagsuppgifter läggs in och uppdateras av IUC Syd.
        Hör av er om något är fel.
      </div>
    </article>
  );
}
