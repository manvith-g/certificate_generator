import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlinePhotograph, HiArrowRight, HiOutlineCloudUpload, HiX } from 'react-icons/hi';
import useTemplateStore from '../store/useTemplateStore';
import useEditorStore from '../store/useEditorStore';

export default function TemplateUploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const setTemplate = useTemplateStore(state => state.setTemplate);

  const previewUrl = useMemo(() => {
    if (file && file.type.startsWith('image/')) return URL.createObjectURL(file);
    return null;
  }, [file]);

  const handleFile = (f) => {
    if (f) { setFile(f); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a template file');

    // Clear previous editor state when starting fresh with a new template
    useEditorStore.getState().clearEditor();

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setTemplate(file, url, img.width, img.height);
      navigate('/editor');
    };
    img.onerror = () => toast.error('Failed to load image');
    img.src = url;
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'var(--accent-muted)',
            border: '1px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <HiOutlinePhotograph style={{ fontSize: 24, color: 'var(--accent-primary)' }} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.875rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 8,
          }}>
            Upload Template
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
            Upload your certificate background image to begin
          </p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {!file ? (
              /* ── Dropzone: no file selected ── */
              <div
                className={`dropzone ${isDragging ? 'dragging' : ''}`}
                onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault(); setIsDragging(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFile(f);
                }}
                onClick={() => document.getElementById('template-file-input')?.click()}
              >
                <input
                  id="template-file-input"
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  className="hidden"
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 16,
                    background: 'var(--bg-elevated)',
                    border: '1px dashed var(--border-hover)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <HiOutlineCloudUpload style={{ fontSize: 28, color: 'var(--text-muted)' }} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Drop your certificate template here</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>PNG or JPG — up to 20 MB</p>
                  </div>
                </div>
              </div>
            ) : (
              /* ── File selected: compact preview ── */
              <div style={{
                borderRadius: 12, overflow: 'hidden',
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-secondary)',
                transition: 'all 0.3s ease',
              }}>
                {/* File info bar */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-primary)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'var(--accent-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <HiOutlinePhotograph style={{ color: 'var(--accent-primary)' }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: 'var(--bg-elevated)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-muted)', border: 'none', cursor: 'pointer',
                      transition: 'all 0.2s ease', flexShrink: 0,
                    }}
                    onMouseOver={e => { e.currentTarget.style.color = '#f43f5e'; e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; }}
                    onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                  >
                    <HiX style={{ fontSize: 14 }} />
                  </button>
                </div>
                {/* Image preview */}
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Template preview"
                    style={{ width: '100%', maxHeight: 280, objectFit: 'contain', padding: 16 }}
                  />
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={!file}
              className="btn-primary"
              style={{ width: '100%', padding: '14px 24px' }}
            >
              Continue to Editor <HiArrowRight />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
