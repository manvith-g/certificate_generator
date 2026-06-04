import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import TemplateUploadPage from './pages/TemplateUploadPage';
import EditorPage from './pages/EditorPage';
import CsvUploadPage from './pages/CsvUploadPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-950">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/upload" replace />} />
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
              background: '#18181b',
              color: '#d4d4d8',
              border: '1px solid #2c2c30',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#34d399', secondary: '#09090b' } },
            error: { iconTheme: { primary: '#f43f5e', secondary: '#09090b' } },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
