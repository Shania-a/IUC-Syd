import { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Headers from "./Global_function/Headers";
import Log_in from "./Sign_in/Log_in";
import Footer from "./Global_function/Footer";
import Sign_up from "./register/Sign_up";
import Start_sida from "./stardSidan/Stard_sidan";
function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <Headers />

      <Routes>
        <Route path="/" element={<Log_in />} />
        <Route path="/sign_up" element={<Sign_up />} />
        <Route path="/Start_sida" element={<Start_sida />} />
        <Route path="*" element={<h1>404 – Sidan hittades inte</h1>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
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
