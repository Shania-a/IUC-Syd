
export default function Header() {
  return (
    <header className="page-header">
      <div className="page-heading">
        <p className="breadcrumb">IUC Syd / Administration</p>

        <h1>Översikt</h1>

        <p className="page-description">
          Överblick över medlemsportalen och dess administration.
        </p>
      </div>

      <div className="admin-profile">
        <div className="profile-avatar">A</div>

        <div className="profile-details">
          <strong>Administratör</strong>
          <span>Adminportal</span>
        </div>
      </div>
    </header>
  );
}
