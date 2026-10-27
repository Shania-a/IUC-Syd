// App.jsx
// Här bestämmer vi vilken sida som visas på vilken adress.

import { Outlet, Route, Routes } from "react-router-dom";
import "./App.css";

// Sidor för medlemmarna
import Headers from "./Global_function/Headers";
import Footer from "./Global_function/Footer";
import Log_in from "./Sign_in/Log_in";
import Sign_up from "./register/Sign_up";
import Start_sida from "./stardSidan/Stard_sidan";

// Sidor för admin
import AdminLayout from "./admin/AdminLayout";
import AdminStart from "./admin/AdminStart";
import AdminUsers from "./admin/AdminUsers";
import AdminCompanies from "./admin/AdminCompanies";
import AdminPosts from "./admin/AdminPosts";
import AdminMessages from "./admin/AdminMessages";
import AdminNeeds from "./admin/AdminNeeds";

// Header och footer runt alla vanliga sidor.
// Outlet = här visas sidan som hör till adressen.
function PublicLayout() {
  return (
    <div className="public-layout">
      <Headers />
      <Outlet />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Vanliga sidor, med header och footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Log_in />} />
        <Route path="/sign_up" element={<Sign_up />} />
        <Route path="/Start_sida" element={<Start_sida />} />
        {/* path="*" betyder "alla andra adresser" */}
        <Route path="*" element={<h1>404 – Sidan hittades inte</h1>} />
      </Route>

      {/* Admin, med egen meny. Sidorna ligger inuti AdminLayout. */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminStart />} />
        <Route path="anvandare" element={<AdminUsers />} />
        <Route path="foretag" element={<AdminCompanies />} />
        <Route path="moderering" element={<AdminPosts />} />
        <Route path="meddelanden" element={<AdminMessages />} />
        <Route path="behov" element={<AdminNeeds />} />
      </Route>
    </Routes>
  );
}

export default App;
