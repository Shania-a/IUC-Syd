// AdminDataContext.jsx
//
// Den här filen håller ALL admin-data på ett enda ställe.
// Alla delar av admin-sidan (KPI-kort, sidomeny, listor) läser härifrån.
// När något ändras här uppdateras alla delar samtidigt.

import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../services/adminService';

// ---------------------------------------------------------------
// 1. Skapa en "låda" som kan dela data mellan komponenter
// ---------------------------------------------------------------
const AdminDataContext = createContext(null);

// ---------------------------------------------------------------
// 2. Providern lägger datan i lådan.
//    Allt som ligger inuti <AdminDataProvider> kan läsa datan.
// ---------------------------------------------------------------
export function AdminDataProvider({ children }) {
  // All data från mockData.json. Är null tills den har hämtats.
  const [data, setData] = useState(null);

  // Felmeddelande om hämtningen misslyckas
  const [error, setError] = useState(null);

  // Texten i den lilla bekräftelserutan längst ner. null = ingen ruta.
  const [toast, setToast] = useState(null);

  // Hämta datan EN gång när admin-sidan öppnas.
  // Den tomma listan [] betyder "kör bara första gången".
  useEffect(() => {
    api
      .fetchAdminData()
      .then((result) => setData(result))
      .catch((err) => setError(err.message));
  }, []);

  // -------------------------------------------------------------
  // Hjälpfunktioner
  // -------------------------------------------------------------

  // Visa en bekräftelse, t.ex. "Kontot är godkänt", i 3 sekunder
  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  // Byt ut en post i en lista mot en uppdaterad version.
  // Exempel: replaceItem('users', saraSomÄrGodkänd)
  function replaceItem(listName, updatedItem) {
    setData((oldData) => ({
      ...oldData, // behåll alla andra listor som de är
      [listName]: oldData[listName].map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      ),
    }));
  }

  // Lägg till en ny post sist i en lista.
  // Exempel: addItem('companies', nyttFöretag)
  function addItem(listName, newItem) {
    setData((oldData) => ({
      ...oldData,
      [listName]: [...oldData[listName], newItem],
    }));
  }

  // -------------------------------------------------------------
  // Handlingar admin kan göra.
  // Alla följer samma mönster:
  //   1. fråga servicen (adminService.js) om ändringen
  //   2. lägg in svaret i datan
  //   3. visa en bekräftelse
  // -------------------------------------------------------------

  // --- Användare ---
  async function approveUser(id) {
    const updatedUser = await api.approveUser(id);
    replaceItem('users', updatedUser);
    showToast('Kontot är godkänt');
  }

  async function blockUser(id) {
    const updatedUser = await api.blockUser(id);
    replaceItem('users', updatedUser);
    showToast('Kontot är blockerat');
  }

  async function unblockUser(id) {
    const updatedUser = await api.unblockUser(id);
    replaceItem('users', updatedUser);
    showToast('Kontot är aktiverat igen');
  }

  async function sendConsentReminder(id) {
    const updatedUser = await api.sendConsentReminder(id);
    replaceItem('users', updatedUser);
    showToast('Påminnelsen är skickad');
  }

  // --- Moderering ---
  // status kan vara: 'kept', 'approved', 'unpublished' eller 'removed'
  async function moderatePost(id, status) {
    const updatedPost = await api.moderatePost(id, status);
    replaceItem('posts', updatedPost);

    // Välj rätt bekräftelsetext beroende på vad som gjordes
    const messages = {
      kept: 'Inlägget ligger kvar',
      approved: 'Inlägget är godkänt',
      unpublished: 'Inlägget är avpublicerat',
      removed: 'Inlägget är borttaget',
    };
    showToast(messages[status]);
  }

  // --- Meddelanden ---
  async function markMessageRead(id) {
    const updatedMessage = await api.markMessageRead(id);
    replaceItem('messages', updatedMessage);
    // Ingen bekräftelse här, det sker automatiskt när man öppnar
  }

  async function replyToMessage(id, text) {
    const updatedMessage = await api.replyToMessage(id, text);
    replaceItem('messages', updatedMessage);
    showToast('Svaret är skickat');
  }

  // --- Identifierade behov ---
  async function markNeedHandled(id) {
    const updatedNeed = await api.markNeedHandled(id);
    replaceItem('needs', updatedNeed);
    showToast('Behovet är markerat som hanterat');
  }

  // --- Företag ---
  async function createCompany(values) {
    const newCompany = await api.createCompany(values);
    addItem('companies', newCompany);
    showToast('Företaget är tillagt');
  }

  async function updateCompany(id, values) {
    const updatedCompany = await api.updateCompany(id, values);
    replaceItem('companies', updatedCompany);
    showToast('Ändringarna är sparade');
  }

  // -------------------------------------------------------------
  // Räknare och uppslag.
  // Räknas fram från datan varje gång, så de stämmer alltid.
  // -------------------------------------------------------------
  let counts = null;
  const userById = {}; // { u1: Anna, u2: Peter, ... } för snabb uppslagning
  const companyById = {}; // { c1: Höglunds, c2: Nordisk, ... }

  if (data) {
    counts = {
      pendingUsers: data.users.filter((u) => u.status === 'pending').length,
      postsToReview: data.posts.filter((p) => p.status === 'reported' || p.status === 'pending').length,
      unansweredMessages: data.messages.filter((m) => m.status !== 'replied').length,
      newNeeds: data.needs.filter((n) => n.status === 'new').length,
    };

    for (const user of data.users) userById[user.id] = user;
    for (const company of data.companies) companyById[company.id] = company;
  }

  // -------------------------------------------------------------
  // Allt som komponenterna får tillgång till
  // -------------------------------------------------------------
  const value = {
    data,
    error,
    loading: data === null && error === null, // true medan vi väntar på datan
    toast,
    counts,
    userById,
    companyById,
    actions: {
      approveUser,
      blockUser,
      unblockUser,
      sendConsentReminder,
      moderatePost,
      markMessageRead,
      replyToMessage,
      markNeedHandled,
      createCompany,
      updateCompany,
    },
  };

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

// ---------------------------------------------------------------
// 3. useAdmin() är hur en komponent hämtar datan ur lådan.
//    Exempel i en komponent:  const { data, actions } = useAdmin();
// ---------------------------------------------------------------
// (Raden nedan stänger av en ESLint-varning som inte är relevant här)
// eslint-disable-next-line react-refresh/only-export-components
export function useAdmin() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdmin måste användas inuti <AdminDataProvider>');
  }
  return context;
}