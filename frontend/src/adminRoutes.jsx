// adminRoutes.jsx
// Listan över alla sidor i admin-delen.
//
// Sidomenyn, adresserna och rubriken högst upp läser ALLA från den här listan.
// Vill ni lägga till en ny sida lägger ni bara till en rad här.
//
// Varje sektion har:
//   path     = adressen efter /admin, t.ex. 'anvandare' -> /admin/anvandare
//   label    = texten i menyn och rubriken
//   subtitle = den grå texten under rubriken
//   badge    = (valfri) vilken siffra som visas i menyn, från counts i context
//   group    = (valfri) 'System' lägger punkten under rubriken System i menyn
//   element  = vad som visas på sidan

import Dashboard from './pages/Dashboard';
import ComingSoon from './pages/ComingSoon';
import UsersPanel from './components/panels/UsersPanel';
import CompaniesPanel from './components/panels/CompaniesPanel';
import ModerationPanel from './components/panels/ModerationPanel';
import MessagesPanel from './components/panels/MessagesPanel';
import { ConsentsPanel, IntegrationsPanel, NeedsPanel, RolesPanel } from './components/panels/SmallPanels';

export const adminSections = [
  // ----- Huvudmenyn -----
  {
    path: '',
    label: 'Översikt',
    subtitle: 'Det som väntar på IUC Syd just nu',
    element: <Dashboard />,
  },
  {
    path: 'anvandare',
    label: 'Användare',
    subtitle: 'Godkänn nya konton och hantera befintliga',
    badge: 'pendingUsers',
    element: <UsersPanel mode="full" />,
  },
  {
    path: 'foretag',
    label: 'Företag',
    subtitle: 'Medlemsföretag och deras huvudkontakter',
    element: <CompaniesPanel mode="full" />,
  },
  {
    path: 'moderering',
    label: 'Moderering',
    subtitle: 'Anmälda och ogranskade inlägg i communityn',
    badge: 'postsToReview',
    element: <ModerationPanel mode="full" />,
  },
  {
    path: 'meddelanden',
    label: 'Privata meddelanden',
    subtitle: 'Frågor som medlemmar skickat direkt till IUC Syd',
    badge: 'unansweredMessages',
    element: <MessagesPanel mode="full" />,
  },
  {
    path: 'behov',
    label: 'Identifierade behov',
    subtitle: 'Behov som fångats upp hos medlemsföretagen',
    element: <NeedsPanel />,
  },

  // ----- Era egna menypunkter, byggs senare -----
  {
    path: 'iuc-omradet',
    label: 'IUC-området',
    subtitle: 'Byggs i en senare version',
    element: <ComingSoon title="IUC-området" />,
  },
  {
    path: 'evenemang',
    label: 'Evenemang',
    subtitle: 'Byggs i en senare version',
    element: <ComingSoon title="Evenemang" />,
  },
  {
    path: 'communityamnen',
    label: 'Communityämnen',
    subtitle: 'Byggs i en senare version',
    element: <ComingSoon title="Communityämnen" />,
  },

  // ----- System -----
  {
    path: 'roller',
    label: 'Roller och behörighet',
    subtitle: 'Vem får göra vad hos IUC Syd',
    group: 'System',
    element: <RolesPanel />,
  },
  {
    path: 'samtycken',
    label: 'Samtycken och GDPR',
    subtitle: 'Vilka medlemmar som syns för andra',
    group: 'System',
    element: <ConsentsPanel mode="full" />,
  },
  {
    path: 'integrationer',
    label: 'Integrationer',
    subtitle: 'Kopplingar till andra system',
    group: 'System',
    element: <IntegrationsPanel />,
  },
  {
    path: 'installningar',
    label: 'Inställningar',
    subtitle: 'Byggs i en senare version',
    group: 'System',
    element: <ComingSoon title="Inställningar" />,
  },
];