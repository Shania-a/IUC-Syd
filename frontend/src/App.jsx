import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import "./App.css";

// Medlemsportalen
import Headers from "./Global_function/Headers";
import Footer from "./Global_function/Footer";
import Log_in from "./Sign_in/Log_in";
import Sign_up from "./register/Sign_up";
import Start_sida from "./stardSidan/Stard_sidan";

// Admin
import AdminLayout from "./layouts/AdminLayout";
import { AdminDataProvider } from "./context/AdminDataContext";
import { adminSections } from "./adminRoutes";
import { ADMIN_BASE } from "./adminPaths";

// Header och footer runt medlemssidorna
function PublicLayout() {
  return (
    <>
      <Headers />
      <Outlet />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Medlemssidor */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Log_in />} />
        <Route path="/sign_up" element={<Sign_up />} />
        <Route path="/Start_sida" element={<Start_sida />} />
        <Route path="*" element={<h1>404 – Sidan hittades inte</h1>} />
      </Route>

      {/* Admin */}
      <Route
        path={ADMIN_BASE}
        element={
          <AdminDataProvider>
            <AdminLayout />
          </AdminDataProvider>
        }
      >
        {adminSections.map((section) =>
          section.path === "" ? (
            <Route key="oversikt" index element={section.element} />
          ) : (
            <Route key={section.path} path={section.path} element={section.element} />
          )
        )}
        <Route path="*" element={<Navigate to={ADMIN_BASE} replace />} />
      </Route>
    </Routes>
  );
}