import { useCallback, useState } from 'react';
import { HiOutlineCloudUpload, HiOutlineDocument, HiX } from 'react-icons/hi';

export default function FileDropzone({ onFileSelect, accept, maxSize, label, sublabel, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items?.length > 0) setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect?.(file);
    }
  }, [onFileSelect]);

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect?.(file);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const inputId = `dropzone-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div
      className={`dropzone ${isDragging ? 'dragging' : ''} ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => !disabled && document.getElementById(inputId)?.click()}
    >
      <input
        id={inputId}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {selectedFile ? (
        <div className="flex flex-col items-center gap-3 animate-fade-in-up">
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            background: 'var(--accent-muted)',
            border: '1px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HiOutlineDocument style={{ fontSize: 24, color: 'var(--accent-primary)' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>{selectedFile.name}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>{formatSize(selectedFile.size)}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFile(null);
              onFileSelect?.(null);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              color: '#f43f5e', fontSize: '0.75rem',
              background: 'none', border: 'none', cursor: 'pointer',
              transition: 'opacity 0.2s ease', marginTop: 4,
            }}
            onMouseOver={e => e.currentTarget.style.opacity = '0.8'}
            onMouseOut={e => e.currentTarget.style.opacity = '1'}
          >
            <HiX /> Remove & choose another
          </button>
        </div>
      ) : (
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
            <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>{label || 'Drop your file here'}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>{sublabel || 'or click to browse'}</p>
          </div>
          {(accept || maxSize) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {accept && <span>Formats: {accept.replace(/\./g, '').toUpperCase()}</span>}
              {maxSize && <span>•</span>}
              {maxSize && <span>Max: {formatSize(maxSize)}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
