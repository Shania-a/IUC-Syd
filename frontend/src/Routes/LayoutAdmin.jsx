import { Outlet, Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:1337";

function LayoutAdmin() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Kunde inte logga ut:", err);
    } finally {
      navigate("/", { replace: true });
    }
  };
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <h2>IUC Syd</h2>
          <span>ADMINISTRATION</span>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <Link to="/Admin">
              <li>Översikt</li>
            </Link>

            <Link to="/AdminUserPage">
              <li>Användare</li>
            </Link>

            <Link to="/AdminCompanyPage">
              <li>Företag/Organisation</li>
            </Link>

            <Link to="/AdminModerationPage">
              <li>Moderering</li>
            </Link>

            <Link to="/AdminMessagesPage">
              <li>Privata medelande</li>
            </Link>
            <li>
              <button className="sidebar-logout" onClick={handleLogout}>
                Logga ut
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      <Outlet /> {/* här visas adminsidan */}
    </div>
  );
}

export default LayoutAdmin;
