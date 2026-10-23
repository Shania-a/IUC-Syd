// CompaniesPanel.jsx
// Lista över medlemsföretag. Admin kan lägga till nya och redigera befintliga.
//
// mode="dashboard" -> på översikten
// mode="full"      -> på sidan "Företag", visar även ort och e-post

import { useState } from 'react';
import { useAdmin } from '../../context/AdminDataContext';
import { EmptyState, Panel } from '../ui';

// Ett tomt formulär
const emptyForm = { name: '', contactName: '', contactEmail: '', city: '' };

export default function CompaniesPanel({ mode = 'dashboard' }) {
  const { data, actions } = useAdmin();

  // Vad som redigeras just nu:
  //   null      = inget formulär öppet
  //   'new'     = formulär för nytt företag
  //   'c1' osv. = redigerar det företaget
  const [editingId, setEditingId] = useState(null);

  // Värdena i formuläret
  const [form, setForm] = useState(emptyForm);

  // Felmeddelande, t.ex. om namnet saknas
  const [error, setError] = useState('');

  // Sant medan vi sparar, så att knappen inte kan klickas två gånger
  const [saving, setSaving] = useState(false);

  // Räkna ut "2 av 3 godkända" för ett företag
  function userSummary(companyId) {
    const users = data.users.filter((user) => user.companyId === companyId);
    const approved = users.filter((user) => user.status === 'approved');
    return approved.length + ' av ' + users.length + ' godkända';
  }

  // Öppna formuläret för ett nytt företag
  function startNew() {
    setEditingId('new');
    setForm(emptyForm);
    setError('');
  }

  // Öppna formuläret för att redigera ett befintligt företag
  function startEdit(company) {
    setEditingId(company.id);
    setForm({
      name: company.name || '',
      contactName: company.contactName || '',
      contactEmail: company.contactEmail || '',
      city: company.city || '',
    });
    setError('');
  }

  // Stäng formuläret utan att spara
  function cancel() {
    setEditingId(null);
    setError('');
  }

  // Uppdatera ett fält i formuläret när man skriver
  function updateField(fieldName, value) {
    setForm({ ...form, [fieldName]: value });
  }

  // Spara formuläret
  async function save(event) {
    event.preventDefault(); // stoppa webbläsaren från att ladda om sidan

    // Kontroll: företaget måste ha ett namn
    if (form.name.trim() === '') {
      setError('Ange företagets namn.');
      return;
    }

    // Ta bort mellanslag i början och slutet av alla fält
    const values = {
      name: form.name.trim(),
      contactName: form.contactName.trim(),
      contactEmail: form.contactEmail.trim(),
      city: form.city.trim(),
    };

    setSaving(true);
    if (editingId === 'new') {
      await actions.createCompany(values);
    } else {
      await actions.updateCompany(editingId, values);
    }
    setSaving(false);
    setEditingId(null); // stäng formuläret
  }

  // Formuläret. Samma formulär används för både nytt och redigera.
  const companyForm = (
    <form className="company-form" onSubmit={save}>
      <label>
        Företag
        <input value={form.name} onChange={(e) => updateField('name', e.target.value)} />
      </label>
      <label>
        Huvudkontakt
        <input value={form.contactName} onChange={(e) => updateField('contactName', e.target.value)} />
      </label>
      <label>
        E-post
        <input
          type="email"
          value={form.contactEmail}
          onChange={(e) => updateField('contactEmail', e.target.value)}
        />
      </label>
      <label>
        Ort
        <input value={form.city} onChange={(e) => updateField('city', e.target.value)} />
      </label>

      {error && <p className="form-error">{error}</p>}

      <div className="actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {editingId === 'new' ? 'Lägg till företag' : 'Spara ändringar'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={cancel}>
          Avbryt
        </button>
      </div>
    </form>
  );

  return (
    <Panel
      title="Företag och huvudkontakt"
      action={
        <button className="btn btn-primary" onClick={startNew}>
          Nytt företag
        </button>
      }
    >
      {/* Formuläret för nytt företag visas överst */}
      {editingId === 'new' && companyForm}

      {data.companies.length === 0 && (
        <EmptyState>Inga företag ännu. Lägg till det första med knappen ovan.</EmptyState>
      )}

      {data.companies.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Företag</th>
                <th>Huvudkontakt</th>
                <th>Användare</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.companies.map((company) => {
                // Om det här företaget redigeras visas formuläret i stället för raden
                if (editingId === company.id) {
                  return (
                    <tr key={company.id}>
                      <td colSpan={4}>{companyForm}</td>
                    </tr>
                  );
                }

                return (
                  <tr key={company.id}>
                    <td>
                      <strong>{company.name}</strong>
                      {mode === 'full' && <span className="muted">{company.city}</span>}
                    </td>
                    <td>
                      {company.contactName}
                      {mode === 'full' && <span className="muted">{company.contactEmail}</span>}
                    </td>
                    <td>{userSummary(company.id)}</td>
                    <td className="align-end">
                      <button className="btn btn-secondary" onClick={() => startEdit(company)}>
                        Redigera
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="muted small panel-foot">
        Företag och kontaktpersoner läggs in manuellt tills kopplingen till IUC VS är utredd.
      </p>
    </Panel>
  );
}