import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlinePhotograph, HiArrowRight, HiOutlineCloudUpload, HiX } from 'react-icons/hi';
import useTemplateStore from '../store/useTemplateStore';

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
    <div className="min-h-screen flex items-center justify-center px-4 pt-14 pb-10">
      <div className="w-full max-w-lg animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent-600/10 border border-accent-500/20 flex items-center justify-center mx-auto mb-5">
            <HiOutlinePhotograph className="text-2xl text-accent-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Upload Template
          </h1>
          <p className="text-dark-300 text-sm leading-relaxed">
            Upload your certificate background image to begin
          </p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
          
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
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-dark-700 border border-dashed border-dark-500 flex items-center justify-center">
                  <HiOutlineCloudUpload className="text-3xl text-dark-300" />
                </div>
                <div className="text-center">
                  <p className="text-dark-100 font-medium">Drop your certificate template here</p>
                  <p className="text-dark-400 text-sm mt-1">PNG or JPG — up to 20 MB</p>
                </div>
              </div>
            </div>
          ) : (
            /* ── File selected: compact preview ── */
            <div className="rounded-xl overflow-hidden border border-dark-600 bg-dark-900">
              {/* File info bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-dark-600">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-accent-600/10 flex items-center justify-center shrink-0">
                    <HiOutlinePhotograph className="text-accent-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{file.name}</p>
                    <p className="text-dark-400 text-xs">{formatSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="w-7 h-7 rounded-lg bg-dark-700 flex items-center justify-center text-dark-300 
                             hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                >
                  <HiX className="text-sm" />
                </button>
              </div>
              {/* Image preview */}
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Template preview"
                  className="w-full max-h-[280px] object-contain p-4"
                />
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={!file}
            className="btn-primary w-full py-3.5"
          >
            Continue to Editor <HiArrowRight />
          </button>
        </form>
      </div>
    </div>
  );
}
