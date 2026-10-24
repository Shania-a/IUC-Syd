import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import CompanyDirectory from './pages/CompanyDirectory';
import CompanyDetail from './pages/CompanyDetail';

function App() {
  return (
    <BrowserRouter>
      {/* Enkel navigation */}
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ddd', marginBottom: '2rem' }}>
        <Link to="/foretag" style={{ fontWeight: 'bold', textDecoration: 'none', color: '#333' }}>
          IUC Syd – Företagskatalog
        </Link>
      </nav>

      {/* Sidrutter */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem' }}>
        <Routes>
          <Route path="/" element={<CompanyDirectory />} />
          <Route path="/foretag" element={<CompanyDirectory />} />
          <Route path="/foretag/:slug" element={<CompanyDetail />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;