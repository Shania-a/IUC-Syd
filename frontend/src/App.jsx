// App.jsx
// Här bestämmer vi vilken sida som visas på vilken adress.

import { Route, Routes } from "react-router-dom";
import "./App.css";

// Sidor för medlemmarna
import Headers from "./Global_function/Headers";
import Footer from "./Global_function/Footer";
import Log_in from "./Sign_in/Log_in";
import Sign_up from "./register/Sign_up";
import Start_sida from "./stardSidan/Stard_sidan";

// Sidor för admin
import AdminStartPage from "./admin/AdminStartPage";
import AdminUserPage from "./admin/AdminUserPAge";
import AdminCompanyPage from "./admin/AdminCompanyPage";
import AdminMessagesPage from "./admin/AdminMessagesPage";
import AdminModerationPage from "./admin/AdminModerationPage";

function App() {
  return (
    <>
      {/* Header och footer ligger utanför Routes, så de syns på alla sidor */}
      <Headers />

      <Routes>
        <Route path="/" element={<Log_in />} />
        <Route path="/sign_up" element={<Sign_up />} />
        <Route path="/Start_sida" element={<Start_sida />} />

        {/* admin path */}
        <Route path="/admin" element={<AdminStartPage />} />
        <Route path="/AdminUserPage" element={<AdminUserPage />} />
        <Route path="/AdminCompanyPage" element={<AdminCompanyPage />} />
        <Route path="/AdminMessagesPage" element={<AdminMessagesPage />} />
        <Route path="/AdminModerationPage" element={<AdminModerationPage />} />

        {/* path="*" betyder "alla andra adresser" */}
        <Route path="*" element={<h1>404 – Sidan hittades inte</h1>} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
