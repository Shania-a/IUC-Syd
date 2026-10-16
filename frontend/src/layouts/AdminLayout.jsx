
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Dashboard from "../pages/Dashboard";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <Sidebar />

      <main className="main-content">
        <Header />
        <Dashboard />
      </main>
    </div>
  );
}
