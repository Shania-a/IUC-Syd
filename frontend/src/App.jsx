// App.jsx
// Bestämmer vilken sida som visas för vilken adress.

import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import { AdminDataProvider } from './context/AdminDataContext';
import { adminSections } from './adminRoutes';
import { ADMIN_BASE } from './adminPaths';

function App() {
  return (
    <Routes>
      {/* Allt under /admin använder AdminLayout (sidomeny + toppfält) */}
      <Route
        path={ADMIN_BASE}
        element={
          // AdminDataProvider delar admin-datan med allt inuti (steg 4)
          <AdminDataProvider>
            <AdminLayout />
          </AdminDataProvider>
        }
      >
        {/* En route per sida i adminRoutes.jsx */}
        {adminSections.map((section) =>
          section.path === '' ? (
            // Översikten visas på själva /admin
            <Route key="oversikt" index element={section.element} />
          ) : (
            <Route key={section.path} path={section.path} element={section.element} />
          )
        )}
      </Route>

      {/* Alla andra adresser skickas till /admin tills medlemsportalen finns */}
      <Route path="*" element={<Navigate to={ADMIN_BASE} replace />} />
    </Routes>
  );
}

export default App;