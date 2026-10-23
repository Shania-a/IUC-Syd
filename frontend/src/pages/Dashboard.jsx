// Dashboard.jsx
// Översikten: fyra KPI-kort med ikoner överst och paneler i två kolumner under.

import { Link } from 'react-router-dom';
import { sectionUrl } from '../adminPaths';
import { useAdmin } from '../context/AdminDataContext';
import UsersPanel from '../components/panels/UsersPanel';
import ModerationPanel from '../components/panels/ModerationPanel';
import CompaniesPanel from '../components/panels/CompaniesPanel';
import MessagesPanel from '../components/panels/MessagesPanel';
import { ConsentsPanel, IntegrationsPanel, RolesPanel } from '../components/panels/SmallPanels';

export default function Dashboard() {
  // Siffrorna räknas fram i context (steg 4)
  const { counts } = useAdmin();

  // De fyra KPI-korten.
  // icon = samma ikoner som i er tidigare meny
  // to   = sidan man kommer till när man klickar
  const stats = [
    { label: 'Användare att godkänna', value: counts.pendingUsers, icon: '♙', to: 'anvandare' },
    { label: 'Inlägg att granska', value: counts.postsToReview, icon: '✓', to: 'moderering' },
    { label: 'Obesvarade privata meddelanden', value: counts.unansweredMessages, icon: '✉', to: 'meddelanden' },
    { label: 'Nya identifierade behov', value: counts.newNeeds, icon: '◇', to: 'behov' },
  ];

  return (
    <>
      {/* KPI-korten */}
      <div className="stats">
        {stats.map((stat) => (
          <Link key={stat.label} to={sectionUrl(stat.to)} className="stat">
            {/* Ikon och text på samma rad */}
            <span className="stat-top">
              <span className="stat-icon" aria-hidden="true">
                {stat.icon}
              </span>
              <span className="stat-label">{stat.label}</span>
            </span>

            {/* Den stora siffran */}
            <span className="stat-value">{stat.value}</span>
          </Link>
        ))}
      </div>

      {/* Panelerna i två kolumner, som i prototypen */}
      <div className="dashboard-grid">
        <div className="column">
          <UsersPanel />
          <ModerationPanel />
          <CompaniesPanel />
          <ConsentsPanel />
        </div>
        <div className="column">
          <MessagesPanel />
          <RolesPanel />
          <IntegrationsPanel />
        </div>
      </div>
    </>
  );
}