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
        <div className="editor-sidebar" style={{ width: 280, minWidth: 280, display: 'flex', flexDirection: 'column' }}>

          {/* Sidebar Header */}
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600 }}>Fields & Properties</span>
              <span style={{
                color: 'var(--text-muted)', fontSize: 12,
                background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 6,
                transition: 'all 0.3s ease',
              }}>
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

              <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

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
          <div className="editor-toolbar" style={{
            flexShrink: 0,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 600 }}>Certificate Editor</span>
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
              className="btn-primary"
              style={{ padding: '10px 24px', borderRadius: 10, fontSize: 14 }}
            >
              Next: Upload CSV & Generate <HiArrowRight />
            </button>
          </div>

          {/* CANVAS AREA */}
          <div
            ref={containerRef}
            className="editor-canvas-area"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'auto',
              padding: 24,
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
            <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Display Name</label>
            <input
              type="text"
              value={customFieldName}
              onChange={(e) => setCustomFieldName(e.target.value)}
              placeholder="e.g., Workshop Title"
              className="input-dark"
            />
          </div>
          <div>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>CSV Column Key</label>
            <input
              type="text"
              value={customFieldKey}
              onChange={(e) => setCustomFieldKey(e.target.value)}
              placeholder="e.g., WorkshopTitle"
              className="input-dark"
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>Must match the column header in your CSV</p>
          </div>
          <button onClick={handleAddCustomField} className="btn-primary" style={{ width: '100%', padding: '12px 24px' }}>
            Add Field
          </button>
        </div>
      </Modal>
    </>
  );
}
