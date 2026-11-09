// App.jsx
// Här bestämmer vi vilken sida som visas på vilken adress.

import { Route, Routes } from "react-router-dom";
import "./App.css";
import LayoutWithNav from "./Routes/LayoutWithNav";
import LayoutAdmin from "./Routes/LayoutAdmin";

// Sidor för medlemmarna
import Headers from "./Global_function/Headers";
import Footer from "./Global_function/Footer";
import Log_in from "./Sign_in/Log_in";
import Sign_up from "./register/Sign_up";
import Start_sida from "./stardSidan/Stard_sidan";
import MittForetag from "./stardSidan/MittForetag";
import UserMessagesPage from "./stardSidan/UserMessagesPage";

// Sidor för admin
import AdminStartPage from "./admin/AdminStartPage";
import AdminUserPage from "./admin/AdminUserPage";
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

        <Route element={<LayoutWithNav />}>
          {/* user path */}
          <Route path="/Start_sida" element={<Start_sida />} />
          <Route path="/mitt_foretag" element={<MittForetag />} />
          <Route path="/user_messages" element={<UserMessagesPage />} />
        </Route>
        <Route element={<LayoutAdmin />}>
          {/* admin path */}
          <Route path="/admin" element={<AdminStartPage />} />
          <Route path="/AdminUserPage" element={<AdminUserPage />} />
          <Route path="/AdminCompanyPage" element={<AdminCompanyPage />} />
          <Route path="/AdminMessagesPage" element={<AdminMessagesPage />} />
          <Route
            path="/AdminModerationPage"
            element={<AdminModerationPage />}
          />
        </Route>

        {/* path="*" betyder "alla andra adresser" */}
        <Route path="*" element={<h1>404 – Sidan hittades inte</h1>} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
