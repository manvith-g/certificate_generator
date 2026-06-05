import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import TemplateUploadPage from './pages/TemplateUploadPage';
import EditorPage from './pages/EditorPage';
import CsvUploadPage from './pages/CsvUploadPage';
import useThemeStore from './store/useThemeStore';

function App() {
  const theme = useThemeStore((s) => s.theme);

  return (
    <Router>
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', transition: 'background-color 0.35s ease' }}>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/upload" element={<TemplateUploadPage />} />
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/csv" element={<CsvUploadPage />} />
          </Routes>
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-text)',
              border: '1px solid var(--toast-border)',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '12px 16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            },
            success: { iconTheme: { primary: '#34d399', secondary: theme === 'dark' ? '#09090b' : '#fff' } },
            error: { iconTheme: { primary: '#f43f5e', secondary: theme === 'dark' ? '#09090b' : '#fff' } },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
