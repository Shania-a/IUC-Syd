// UsersPanel.jsx
// Visar användare och låter admin godkänna, blockera och avblockera dem.
//
// mode="dashboard" -> kort version på översikten (bara de som väntar)
// mode="full"      -> hela listan med flikar på sidan "Användare"

import { useState } from 'react';
import { useAdmin } from '../../context/AdminDataContext';
import { fullName, timeAgo } from '../../utils/format';
import { ActionButton, Avatar, EmptyState, Panel, Tabs, Tag } from '../ui';

export default function UsersPanel({ mode = 'dashboard' }) {
  // Hämta data och handlingar från context (steg 4)
  const { data, companyById, actions } = useAdmin();

  // Vilken flik som är vald (används bara i full-läget)
  const [filter, setFilter] = useState('pending');

  // Id:n på användare som godkänts i den här panelen.
  // De ligger kvar en stund med texten "Godkänd" så att admin ser att det gick.
  const [justApproved, setJustApproved] = useState([]);

  async function approve(id) {
    await actions.approveUser(id);
    setJustApproved([...justApproved, id]);
  }

  // Räkna hur många användare som har en viss status
  function countStatus(status) {
    return data.users.filter((user) => user.status === status).length;
  }

  // Välj vilka användare som ska visas
  let users;
  if (mode === 'dashboard') {
    users = data.users.filter(
      (user) => user.status === 'pending' || justApproved.includes(user.id)
    );
  } else if (filter === 'all') {
    users = data.users;
  } else {
    users = data.users.filter((user) => user.status === filter);
  }

  return (
    <Panel
      title={mode === 'dashboard' ? 'Användare att godkänna' : 'Alla användare'}
      aside="Nya konton har ingen åtkomst förrän IUC Syd godkänner"
    >
      {/* Flikar visas bara på sidan "Användare" */}
      {mode === 'full' && (
        <Tabs
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'pending', label: 'Väntar', count: countStatus('pending') },
            { value: 'approved', label: 'Godkända', count: countStatus('approved') },
            { value: 'blocked', label: 'Blockerade', count: countStatus('blocked') },
            { value: 'all', label: 'Alla', count: data.users.length },
          ]}
        />
      )}

      {/* Tom lista */}
      {users.length === 0 && <EmptyState>Inga användare att visa här.</EmptyState>}

      {/* Tabellen med användare */}
      {users.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Namn och roll</th>
                <th>Företag</th>
                <th>Registrerad</th>
                <th>Åtgärd</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  {/* Namn, titel och avatar */}
                  <td>
                    <div className="person">
                      <Avatar name={fullName(user)} />
                      <div>
                        <strong>{fullName(user)}</strong>
                        <span className="muted">{user.title}</span>
                      </div>
                    </div>
                  </td>

                  {/* Företagsnamn, slås upp via companyId */}
                  <td>{companyById[user.companyId]?.name}</td>

                  {/* När kontot skapades, t.ex. "igår" */}
                  <td className="muted">{timeAgo(user.createdAt)}</td>

                  {/* Knappar beroende på status */}
                  <td>
                    {user.status === 'pending' && (
                      <div className="actions">
                        <ActionButton color="primary" onClick={() => approve(user.id)}>
                          Godkänn
                        </ActionButton>
                        <ActionButton onClick={() => actions.blockUser(user.id)}>
                          Blockera
                        </ActionButton>
                      </div>
                    )}

                    {user.status === 'approved' && (
                      <div className="actions">
                        <Tag color="ok">Godkänd</Tag>
                        {/* På sidan "Användare" går det att blockera godkända konton */}
                        {mode === 'full' && (
                          <ActionButton onClick={() => actions.blockUser(user.id)}>
                            Blockera
                          </ActionButton>
                        )}
                      </div>
                    )}

                    {user.status === 'blocked' && (
                      <div className="actions">
                        <Tag color="danger">Blockerad</Tag>
                        <ActionButton onClick={() => actions.unblockUser(user.id)}>
                          Avblockera
                        </ActionButton>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}