import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineDocumentDownload, HiOutlineArrowLeft } from 'react-icons/hi';
import FileDropzone from '../components/common/FileDropzone';
import { ProgressBar } from '../components/common/Loader';
import useTemplateStore from '../store/useTemplateStore';
import useEditorStore from '../store/useEditorStore';
import axios from 'axios';

export default function CsvUploadPage() {
  const navigate = useNavigate();
  const [csvFile, setCsvFile] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const { templateFile, templateWidth, templateHeight } = useTemplateStore();
  const { fields } = useEditorStore();

  if (!templateFile || !fields || fields.length === 0) {
    return <Navigate to="/upload" replace />;
  }

  const handleGenerate = async () => {
    if (!csvFile) return toast.error('Please upload a CSV file first');

    setGenerating(true);
    setProgress(20);

    try {
      const formData = new FormData();
      formData.append('template', templateFile);
      formData.append('csv', csvFile);
      formData.append('fields', JSON.stringify(fields));
      formData.append('templateWidth', templateWidth);
      formData.append('templateHeight', templateHeight);
      formData.append('format', 'png');

      setProgress(40);

      const response = await axios.post('http://localhost:5000/api/generate', formData, {
        responseType: 'blob',
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(40 + (percentCompleted * 0.4));
        }
      });

      setProgress(90);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'certificates.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setProgress(100);
      toast.success('Certificates downloaded!');

      setTimeout(() => {
        useTemplateStore.getState().clearTemplate();
        useEditorStore.getState().clearEditor();
        navigate('/');
      }, 2000);

    } catch (err) {
      console.error(err);
      toast.error('Failed to generate certificates');
    } finally {
      setTimeout(() => {
        setGenerating(false);
        setProgress(0);
      }, 500);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '56px 16px 40px',
      background: 'var(--bg-primary)',
      transition: 'background-color 0.35s ease',
    }}>
      <div className="w-full max-w-lg animate-fade-in-up">
        {/* Back */}
        <button
          onClick={() => navigate('/editor')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: '0.875rem', color: 'var(--text-muted)',
            background: 'none', border: 'none', cursor: 'pointer',
            marginBottom: 24, transition: 'color 0.2s ease',
          }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <HiOutlineArrowLeft /> Back to Editor
        </button>

        <div className="glass-card" style={{ padding: 24 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 8,
            }}>
              Upload CSV & Generate
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Upload participant data to generate all certificates at once
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <FileDropzone
              onFileSelect={setCsvFile}
              accept=".csv"
              maxSize={5 * 1024 * 1024}
              label="Drop your CSV file here"
              sublabel="Column headers must match your field keys"
            />

            {/* Expected columns hint */}
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 12,
              padding: 16,
              border: '1px solid var(--border-primary)',
              transition: 'all 0.3s ease',
            }}>
              <p style={{
                fontSize: '0.75rem', color: 'var(--text-muted)',
                fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1,
                marginBottom: 8,
              }}>
                Expected CSV Columns
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {fields.map((f, i) => (
                  <span key={i} style={{
                    fontSize: '0.75rem', padding: '4px 10px', borderRadius: 8,
                    background: 'var(--accent-muted)',
                    color: 'var(--accent-text)',
                    border: '1px solid var(--accent-border)',
                    fontFamily: 'monospace',
                  }}>
                    {f.field_key}
                  </span>
                ))}
              </div>
            </div>

            {generating && (
              <ProgressBar progress={progress} label="Generating certificates..." />
            )}

            <button
              onClick={handleGenerate}
              disabled={!csvFile || generating}
              className="btn-primary"
              style={{
                width: '100%', padding: '14px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <HiOutlineDocumentDownload style={{ fontSize: 18 }} />
              {generating ? 'Processing...' : 'Generate & Download ZIP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
