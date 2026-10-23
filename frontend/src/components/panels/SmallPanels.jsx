// SmallPanels.jsx
// Fyra mindre paneler i samma fil, eftersom de är korta:
//   ConsentsPanel     - Samtycken (GDPR)
//   NeedsPanel        - Identifierade behov
//   RolesPanel        - Roller och behörighet
//   IntegrationsPanel - Integrationer

import { useAdmin } from '../../context/AdminDataContext';
import { formatDate, fullName, timeAgo } from '../../utils/format';
import { ActionButton, EmptyState, Panel, Tag } from '../ui';

// ===============================================================
// Samtycken (GDPR)
// Visar vilka godkända medlemmar som gett samtycke till att synas.
// Admin kan skicka en påminnelse till dem som inte gjort det.
// ===============================================================
export function ConsentsPanel({ mode = 'dashboard' }) {
  const { data, companyById, actions } = useAdmin();

  // Bara godkända användare är relevanta här
  let users = data.users.filter((user) => user.status === 'approved');

  // På översikten: visa de som SAKNAR samtycke först, och max fyra rader
  if (mode === 'dashboard') {
    const missing = users.filter((user) => !user.consentGivenAt);
    const given = users.filter((user) => user.consentGivenAt);
    users = [...missing, ...given].slice(0, 4);
  }

  return (
    <Panel title="Samtycken (GDPR)" aside="Personuppgifter visas först efter samtycke">
      <ul className="stack divided">
        {users.map((user) => (
          <li key={user.id} className="row-item">
            <div>
              <strong>
                {fullName(user)}, {companyById[user.companyId]?.name}
              </strong>
              <p className="muted small">
                {user.consentGivenAt
                  ? 'Samtycke givet ' + formatDate(user.consentGivenAt)
                  : 'Samtycke saknas, visas inte för andra'}
              </p>
            </div>

            {/* Tre möjliga lägen till höger */}
            {user.consentGivenAt && <Tag color="ok">Visas för medlemmar</Tag>}

            {!user.consentGivenAt && user.consentReminderSentAt && (
              <span className="muted small">Påminnelse skickad {timeAgo(user.consentReminderSentAt)}</span>
            )}

            {!user.consentGivenAt && !user.consentReminderSentAt && (
              <ActionButton onClick={() => actions.sendConsentReminder(user.id)}>
                Skicka påminnelse
              </ActionButton>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

// ===============================================================
// Identifierade behov
// Behov som fångats upp ur meddelanden och communityn.
// (Senare ska AI:n hitta dessa automatiskt.)
// ===============================================================
export function NeedsPanel() {
  const { data, companyById, actions } = useAdmin();

  // Visa nya behov först, hanterade sist
  const newNeeds = data.needs.filter((need) => need.status === 'new');
  const handledNeeds = data.needs.filter((need) => need.status !== 'new');
  const needs = [...newNeeds, ...handledNeeds];

  return (
    <Panel title="Identifierade behov" aside="Behov som fångats upp ur meddelanden och community">
      {needs.length === 0 && <EmptyState>Inga behov identifierade ännu.</EmptyState>}

      <ul className="stack divided">
        {needs.map((need) => (
          <li key={need.id} className="row-item">
            <div>
              <strong>{need.title}</strong>
              <p className="muted small">
                {companyById[need.companyId]?.name} · från {need.source.toLowerCase()} ·{' '}
                {timeAgo(need.createdAt)}
              </p>
              <div className="tag-row">
                <Tag color="new">{need.category}</Tag>
              </div>
            </div>

            {need.status === 'new' ? (
              <ActionButton onClick={() => actions.markNeedHandled(need.id)}>
                Markera som hanterat
              </ActionButton>
            ) : (
              <Tag color="ok">Hanterat</Tag>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

// ===============================================================
// Roller och behörighet
// Bara information. Rollerna ställs in i Strapis adminpanel.
// ===============================================================
export function RolesPanel() {
  const { data } = useAdmin();

  return (
    <Panel title="Roller och behörighet" aside="Vem får göra vad hos IUC Syd">
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Roll</th>
              <th>Får</th>
            </tr>
          </thead>
          <tbody>
            {data.roles.map((role) => (
              <tr key={role.id}>
                <td>
                  <strong>{role.name}</strong>
                </td>
                <td>{role.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

// ===============================================================
// Integrationer
// Visar status för kopplingar till andra system.
// ===============================================================

// Text och färg för varje status
const integrationStatus = {
  investigating: { text: 'Utreds', color: 'warn' },
  to_configure: { text: 'Att konfigurera', color: 'new' },
  active: { text: 'Aktiv', color: 'ok' },
};

export function IntegrationsPanel() {
  const { data } = useAdmin();

  return (
    <Panel title="Integrationer">
      <ul className="stack divided">
        {data.integrations.map((item) => (
          <li key={item.id} className="row-item">
            <div>
              <strong>{item.name}</strong>
              <p className="muted small">{item.description}</p>
            </div>
            <Tag color={integrationStatus[item.status].color}>{integrationStatus[item.status].text}</Tag>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
