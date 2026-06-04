import { useEffect, useRef, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi';
import useTemplateStore from '../store/useTemplateStore';
import useEditorStore from '../store/useEditorStore';
import useCanvas from '../hooks/useCanvas';
import CanvasEditor from '../components/editor/CanvasEditor';
import FieldPalette from '../components/editor/FieldPalette';
import TextProperties from '../components/editor/TextProperties';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

export default function EditorPage() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  const { templateUrl, templateWidth, templateHeight } = useTemplateStore();
  const { isDirty, clearEditor } = useEditorStore();
  const canvasHook = useCanvas(containerRef);
  
  const [customFieldModal, setCustomFieldModal] = useState(false);
  const [customFieldName, setCustomFieldName] = useState('');
  const [customFieldKey, setCustomFieldKey] = useState('');

  if (!templateUrl) {
    return <Navigate to="/upload" replace />;
  }

  useEffect(() => {
    clearEditor();
  }, []);

  const handleAddField = (name, key) => {
    canvasHook.addTextField(name, key);
  };

  const handleAddCustomField = () => {
    if (!customFieldName.trim() || !customFieldKey.trim()) {
      toast.error('Both name and key are required');
      return;
    }
    canvasHook.addTextField(customFieldName.trim(), customFieldKey.trim());
    setCustomFieldModal(false);
    setCustomFieldName('');
    setCustomFieldKey('');
  };

  const handleNext = () => {
    const fieldData = canvasHook.exportFieldData();
    if (fieldData.length === 0) {
      toast.error('Add at least one field to the template');
      return;
    }
    useEditorStore.getState().setFields(fieldData);
    useEditorStore.getState().setDirty(false);
    navigate('/csv');
  };

  return (
    <>
      {/* 
        Full-screen editor layout.
        We use a fixed position layout below the navbar (top: 56px = h-14).
        This ensures nothing gets clipped or hidden.
      */}
      <div style={{ position: 'fixed', top: 56, left: 0, right: 0, bottom: 0, display: 'flex' }}>
        
        {/* ═══ LEFT SIDEBAR ═══ */}
        <div style={{ width: 280, minWidth: 280, display: 'flex', flexDirection: 'column', background: '#0f0f12', borderRight: '1px solid #222225' }}>
          
          {/* Sidebar Header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #222225', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Fields & Properties</span>
              <span style={{ color: '#71717a', fontSize: 12, background: '#222225', padding: '2px 8px', borderRadius: 6 }}>
                {templateWidth}×{templateHeight}
              </span>
            </div>
          </div>

          {/* Sidebar Scrollable Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <FieldPalette
                onAddField={handleAddField}
                onAddCustomField={() => setCustomFieldModal(true)}
              />

              <div style={{ borderTop: '1px solid #222225' }} />

              <TextProperties
                onUpdate={canvasHook.updateCanvasField}
                onRemove={canvasHook.removeCanvasField}
              />
            </div>
          </div>
        </div>

        {/* ═══ MAIN CONTENT AREA ═══ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          
          {/* TOP TOOLBAR — always visible */}
          <div style={{
            flexShrink: 0,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            background: '#0f0f12',
            borderBottom: '1px solid #222225',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>Certificate Editor</span>
              {isDirty && (
                <span style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 6,
                  background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24',
                  border: '1px solid rgba(251, 191, 36, 0.2)'
                }}>
                  Unsaved changes
                </span>
              )}
            </div>

            {/* GENERATE BUTTON — big and prominent */}
            <button
              onClick={handleNext}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', borderRadius: 10,
                background: '#4f46e5', color: '#fff',
                fontSize: 14, fontWeight: 600,
                border: 'none', cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#6366f1'}
              onMouseOut={(e) => e.currentTarget.style.background = '#4f46e5'}
            >
              Next: Upload CSV & Generate <HiArrowRight />
            </button>
          </div>

          {/* CANVAS AREA */}
          <div 
            ref={containerRef}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'auto',
              padding: 24,
              background: '#09090b',
            }}
          >
            <CanvasEditor
              templateUrl={templateUrl}
              templateWidth={templateWidth}
              templateHeight={templateHeight}
              canvasHook={canvasHook}
            />
          </div>
        </div>
      </div>

      {/* ═══ CUSTOM FIELD MODAL ═══ */}
      <Modal
        isOpen={customFieldModal}
        onClose={() => setCustomFieldModal(false)}
        title="Add Custom Field"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-dark-200 block mb-1.5">Display Name</label>
            <input
              type="text"
              value={customFieldName}
              onChange={(e) => setCustomFieldName(e.target.value)}
              placeholder="e.g., Workshop Title"
              className="input-dark"
            />
          </div>
          <div>
            <label className="text-sm text-dark-200 block mb-1.5">CSV Column Key</label>
            <input
              type="text"
              value={customFieldKey}
              onChange={(e) => setCustomFieldKey(e.target.value)}
              placeholder="e.g., WorkshopTitle"
              className="input-dark"
            />
            <p className="text-xs text-dark-400 mt-1.5">Must match the column header in your CSV</p>
          </div>
          <button onClick={handleAddCustomField} className="btn-primary w-full py-3">
            Add Field
          </button>
        </div>
      </Modal>
    </>
  );
}
