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
          <div className="w-14 h-14 rounded-xl bg-accent-600/10 border border-accent-500/20 flex items-center justify-center">
            <HiOutlineDocument className="text-2xl text-accent-400" />
          </div>
          <div className="text-center">
            <p className="text-white text-sm font-medium">{selectedFile.name}</p>
            <p className="text-dark-300 text-xs mt-1">{formatSize(selectedFile.size)}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFile(null);
              onFileSelect?.(null);
            }}
            className="flex items-center gap-1.5 text-rose-400 text-xs hover:text-rose-300 transition-colors mt-1"
          >
            <HiX /> Remove & choose another
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-dark-700 border border-dashed border-dark-500 flex items-center justify-center">
            <HiOutlineCloudUpload className="text-3xl text-dark-300" />
          </div>
          <div className="text-center">
            <p className="text-dark-100 text-sm font-medium">{label || 'Drop your file here'}</p>
            <p className="text-dark-400 text-xs mt-1">{sublabel || 'or click to browse'}</p>
          </div>
          {(accept || maxSize) && (
            <div className="flex items-center gap-2 text-xs text-dark-400 mt-1">
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
