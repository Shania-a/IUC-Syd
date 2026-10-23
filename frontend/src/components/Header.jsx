// Header.jsx
// Toppfältet: rubrik, sökruta och "IUC Syd · administratör".

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sectionUrl } from '../adminPaths';
import { useAdmin } from '../context/AdminDataContext';
import { fullName } from '../utils/format';

// title, subtitle = rubriken och texten under, kommer från adminRoutes.jsx
// onMenuClick     = öppnar menyn på mobil
export default function Header({ title, subtitle, onMenuClick }) {
  const { data } = useAdmin();
  const navigate = useNavigate(); // används för att byta sida från koden
  const [search, setSearch] = useState('');

  // ---- Sökningen ----
  const query = search.trim().toLowerCase();
  let results = [];

  // Sök bara när minst två tecken är skrivna och datan är hämtad
  if (query.length >= 2 && data) {
    // Kollar om en text innehåller sökordet
    const matches = (text) => text && text.toLowerCase().includes(query);

    data.users.forEach((user) => {
      if (matches(fullName(user)) || matches(user.email)) {
        results.push({ id: user.id, label: fullName(user), type: 'Användare', page: 'anvandare' });
      }
    });

    data.companies.forEach((company) => {
      if (matches(company.name) || matches(company.contactName)) {
        results.push({ id: company.id, label: company.name, type: 'Företag', page: 'foretag' });
      }
    });

    data.posts.forEach((post) => {
      if (matches(post.text)) {
        results.push({ id: post.id, label: post.text, type: 'Inlägg', page: 'moderering' });
      }
    });

    data.messages.forEach((message) => {
      if (matches(message.subject) || matches(message.body)) {
        results.push({ id: message.id, label: message.subject, type: 'Meddelande', page: 'meddelanden' });
      }
    });

    results = results.slice(0, 8); // max åtta träffar
  }

  // Klick på en träff: töm sökrutan och gå till rätt sida
  function goTo(result) {
    setSearch('');
    navigate(sectionUrl(result.page));
  }

  return (
    <header className="topbar">
      {/* Menyknapp med tre streck, syns bara på mobil */}
      <button className="menu-btn" onClick={onMenuClick} aria-label="Öppna menyn">
        <span />
        <span />
        <span />
      </button>

      {/* Rubrik */}
      <div className="topbar-title">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      {/* Sökruta */}
      <div className="search">
        <input
          type="search"
          placeholder="Sök användare, företag eller inlägg"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => event.key === 'Escape' && setSearch('')}
        />

        {/* Träfflistan visas när minst två tecken är skrivna */}
        {query.length >= 2 && (
          <ul className="search-results">
            {results.length === 0 && <li className="muted small search-empty">Inga träffar</li>}
            {results.map((result) => (
              <li key={result.type + result.id}>
                <button onClick={() => goTo(result)}>
                  <span>{result.label}</span>
                  <span className="muted small">{result.type}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Vem som är inloggad (från mock-datan) */}
      <div className="admin-chip">
        <span className="brand-mark small">{data?.currentAdmin.initials}</span>
        <span>
          {data?.currentAdmin.name} · {data?.currentAdmin.role}
        </span>
      </div>
    </header>
  );
}