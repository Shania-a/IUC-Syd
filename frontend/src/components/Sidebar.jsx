
const navigation = [
  { label: "Översikt", icon: "▦" },
  { label: "Användare", icon: "♙" },
  { label: "Företag", icon: "▤" },
  { label: "Moderering", icon: "✓" },
  { label: "Privata meddelanden", icon: "✉" },
  { label: "Identifierade behov", icon: "◇" },
  { label: "IUC-området", icon: "▣" },
  { label: "Evenemang", icon: "▦" },
  { label: "Communityämnen", icon: "☷" },
  { label: "Integrationer", icon: "⛓" },
  { label: "Samtycke & GDPR", icon: "♧" },
  { label: "Inställningar", icon: "⚙" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">I</div>

        <div className="brand-text">
          <strong>IUC Syd</strong>
          <span>Administration</span>
        </div>
      </div>

      <p className="sidebar-label">MENY</p>

      <nav className="sidebar-nav" aria-label="Huvudmeny">
        {navigation.map((item, index) => (
          <button
            key={item.label}
            type="button"
            className={`nav-item ${index === 0 ? "active" : ""}`}
          >
            <span className="nav-icon" aria-hidden="true">
              {item.icon}
            </span>

            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="status-dot" />
        <span>IUC Syd Admin</span>
      </div>
    </aside>
  );
}
