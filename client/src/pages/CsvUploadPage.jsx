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
    <div className="min-h-screen flex items-center justify-center px-4 pt-14 pb-10">
      <div className="w-full max-w-lg animate-fade-in-up">
        {/* Back */}
        <button
          onClick={() => navigate('/editor')}
          className="flex items-center gap-1.5 text-sm text-dark-300 hover:text-white mb-6 transition-colors"
        >
          <HiOutlineArrowLeft /> Back to Editor
        </button>

        <div className="glass-card p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Upload CSV & Generate
            </h1>
            <p className="text-dark-300 text-sm">
              Upload participant data to generate all certificates at once
            </p>
          </div>

          <div className="space-y-6">
            <FileDropzone
              onFileSelect={setCsvFile}
              accept=".csv"
              maxSize={5 * 1024 * 1024}
              label="Drop your CSV file here"
              sublabel="Column headers must match your field keys"
            />

            {/* Expected columns hint */}
            <div className="bg-dark-900 rounded-xl p-4 border border-dark-600">
              <p className="text-xs text-dark-300 font-medium uppercase tracking-wider mb-2">Expected CSV Columns</p>
              <div className="flex flex-wrap gap-2">
                {fields.map((f, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-accent-600/10 text-accent-300 border border-accent-500/20 font-mono">
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
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
            >
              <HiOutlineDocumentDownload className="text-lg" />
              {generating ? 'Processing...' : 'Generate & Download ZIP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
