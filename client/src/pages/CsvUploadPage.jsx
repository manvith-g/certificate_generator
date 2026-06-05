import { useState, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import {
  HiOutlineDocumentDownload,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineHome,
  HiOutlinePencilAlt,
  HiOutlineTable,
  HiOutlineEye,
} from 'react-icons/hi';
import FileDropzone from '../components/common/FileDropzone';
import CsvPreviewTable from '../components/common/CsvPreviewTable';
import { ProgressBar } from '../components/common/Loader';
import useTemplateStore from '../store/useTemplateStore';
import useEditorStore from '../store/useEditorStore';
import axios from 'axios';

export default function CsvUploadPage() {
  const navigate = useNavigate();
  const [csvFile, setCsvFile] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [downloadBlob, setDownloadBlob] = useState(null);

  // CSV preview state
  const [csvData, setCsvData] = useState(null);       // array of row objects
  const [csvHeaders, setCsvHeaders] = useState([]);    // column header strings
  const [parseError, setParseError] = useState(null);
  const [showPreview, setShowPreview] = useState(true);

  const { templateFile, templateWidth, templateHeight } = useTemplateStore();
  const { fields } = useEditorStore();

  if (!generationSuccess && (!templateFile || !fields || fields.length === 0)) {
    return <Navigate to="/upload" replace />;
  }

  const expectedKeys = fields.map((f) => f.field_key);

  // Parse CSV when file is selected
  const handleFileSelect = useCallback((file) => {
    setCsvFile(file);
    setParseError(null);
    setCsvData(null);
    setCsvHeaders([]);

    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          const errorMsg = results.errors[0].message;
          setParseError(errorMsg);
          toast.error(`CSV parse error: ${errorMsg}`);
          return;
        }
        if (!results.data || results.data.length === 0) {
          setParseError('CSV file is empty or has no data rows.');
          toast.error('CSV file appears empty.');
          return;
        }
        const headers = results.meta.fields || Object.keys(results.data[0]);
        setCsvHeaders(headers);
        setCsvData(results.data);
        setShowPreview(true);
        toast.success(`Loaded ${results.data.length} rows`);
      },
      error: (err) => {
        setParseError(err.message);
        toast.error('Failed to parse CSV file');
      },
    });
  }, []);

  // Reconstruct a CSV Blob from the edited data
  const buildCsvBlob = useCallback(() => {
    if (!csvData || !csvHeaders.length) return null;
    const csvString = Papa.unparse(csvData, { columns: csvHeaders });
    return new Blob([csvString], { type: 'text/csv' });
  }, [csvData, csvHeaders]);

  const handleGenerate = async () => {
    if (!csvData || csvData.length === 0) {
      return toast.error('Please upload a CSV file with data first');
    }

    setGenerating(true);
    setProgress(20);

    try {
      const formData = new FormData();
      formData.append('template', templateFile);

      // Use edited CSV data (reconstructed as a file)
      const csvBlob = buildCsvBlob();
      formData.append('csv', csvBlob, csvFile?.name || 'data.csv');

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

      const blob = new Blob([response.data], { type: 'application/zip' });
      setDownloadBlob(blob);

      // Trigger initial download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'certificates.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 100);

      setProgress(100);
      toast.success('Certificates downloaded!');

      // Show success completion screen
      setGenerationSuccess(true);

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

  const handleDownloadAgain = () => {
    if (!downloadBlob) return;
    const url = window.URL.createObjectURL(downloadBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'certificates.zip');
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
    toast.success('Download started!');
  };

  const handleBackToHome = () => {
    useTemplateStore.getState().clearTemplate();
    useEditorStore.getState().clearEditor();
    navigate('/');
  };

  const handleEditAgain = () => {
    // Navigate back to editor — fields and template are still in the store
    navigate('/editor');
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
      <div style={{ width: '100%', maxWidth: csvData && showPreview ? 900 : 480 , transition: 'max-width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} className="animate-fade-in-up">

        {generationSuccess ? (
          /* ═══════════════════════════════════════════
              SUCCESS COMPLETION SCREEN
              ═══════════════════════════════════════════ */
          <div className="glass-card" style={{ padding: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

              {/* Success Icon */}
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.05))',
                border: '2px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
                marginBottom: 24,
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.12)',
                animation: 'fadeInUp 0.5s ease',
              }}>
                <HiOutlineCheckCircle style={{ fontSize: 40 }} />
              </div>

              {/* Title */}
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: 10,
                letterSpacing: '-0.02em',
              }}>
                Certificates Ready!
              </h1>

              {/* Subtitle */}
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.925rem',
                lineHeight: 1.6,
                maxWidth: 360,
                marginBottom: 24,
              }}>
                Your ZIP package has been created and the download has started automatically.
              </p>

              {/* Re-download link */}
              {downloadBlob && (
                <button
                  onClick={handleDownloadAgain}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 8,
                    marginBottom: 28,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = 'var(--accent-muted)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  <HiOutlineDocumentDownload style={{ fontSize: 16 }} />
                  Download ZIP again
                </button>
              )}

              {/* Divider */}
              <div style={{
                width: '100%',
                height: 1,
                background: 'var(--border-primary)',
                marginBottom: 24,
              }} />

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
                <button
                  id="edit-again-btn"
                  onClick={handleEditAgain}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontSize: '0.95rem',
                  }}
                >
                  <HiOutlinePencilAlt style={{ fontSize: 18 }} />
                  Edit Again
                </button>

                <button
                  id="back-to-home-btn"
                  onClick={handleBackToHome}
                  className="btn-secondary"
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontSize: '0.95rem',
                  }}
                >
                  <HiOutlineHome style={{ fontSize: 18 }} />
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ═══════════════════════════════════════════
              UPLOAD / PREVIEW / GENERATE VIEW
              ═══════════════════════════════════════════ */
          <>
            {/* Back button */}
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
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
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
                  Upload participant data, preview & edit, then generate all certificates
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* File Dropzone */}
                <FileDropzone
                  onFileSelect={handleFileSelect}
                  accept=".csv"
                  maxSize={5 * 1024 * 1024}
                  label="Drop your CSV file here"
                  sublabel="Column headers must match your field keys"
                />

                {/* Parse Error */}
                {parseError && (
                  <div style={{
                    padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(244, 63, 94, 0.08)',
                    border: '1px solid rgba(244, 63, 94, 0.2)',
                    color: '#f43f5e', fontSize: '0.8rem',
                  }}>
                    ⚠️ {parseError}
                  </div>
                )}

                {/* CSV Preview Section */}
                {csvData && csvData.length > 0 && (
                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: 12,
                    animation: 'fadeInUp 0.4s ease forwards',
                  }}>
                    {/* Preview Toggle Header */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: 'var(--accent-muted)',
                          border: '1px solid var(--accent-border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <HiOutlineTable style={{ fontSize: 16, color: 'var(--accent-primary)' }} />
                        </div>
                        <div>
                          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            Data Preview
                          </p>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {csvData.length} rows × {csvHeaders.length} columns
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-primary)',
                          color: 'var(--text-secondary)',
                          fontSize: '0.75rem', fontWeight: 500,
                          padding: '6px 12px', borderRadius: 8,
                          cursor: 'pointer', transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent-border)';
                          e.currentTarget.style.color = 'var(--accent-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-primary)';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                      >
                        <HiOutlineEye style={{ fontSize: 13 }} />
                        {showPreview ? 'Hide' : 'Show'}
                      </button>
                    </div>

                    {/* The table itself */}
                    {showPreview && (
                      <CsvPreviewTable
                        data={csvData}
                        headers={csvHeaders}
                        onDataChange={setCsvData}
                        expectedKeys={expectedKeys}
                      />
                    )}
                  </div>
                )}

                {/* Expected columns hint (shown only when no preview data yet) */}
                {!csvData && (
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
                )}

                {generating && (
                  <ProgressBar progress={progress} label="Generating certificates..." />
                )}

                <button
                  onClick={handleGenerate}
                  disabled={!csvData || csvData.length === 0 || generating}
                  className="btn-primary"
                  style={{
                    width: '100%', padding: '14px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <HiOutlineDocumentDownload style={{ fontSize: 18 }} />
                  {generating ? 'Processing...' : `Generate ${csvData ? csvData.length : 0} Certificate${csvData?.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
