import { useEffect, useRef, useCallback } from 'react';
import { Canvas, IText, FabricImage } from 'fabric';
import useEditorStore from '../store/useEditorStore';

export default function useCanvas(containerRef) {
  const fabricCanvasRef = useRef(null);
  const scaleFactorRef = useRef(1);
  const templateDimsRef = useRef({ width: 0, height: 0 });
  
  const {
    addField, updateField, removeField, selectField, deselectField,
    setCanvasReady, fields,
  } = useEditorStore();

  // Initialize canvas
  const initCanvas = useCallback((canvasElement, templateUrl, templateWidth, templateHeight) => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
    }

    templateDimsRef.current = { width: templateWidth, height: templateHeight };
    
    // Calculate scale to fit container
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth - 40; // padding
    const containerHeight = window.innerHeight - 180;
    const scaleX = containerWidth / templateWidth;
    const scaleY = containerHeight / templateHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up
    scaleFactorRef.current = scale;

    const displayWidth = Math.round(templateWidth * scale);
    const displayHeight = Math.round(templateHeight * scale);

    const canvas = new Canvas(canvasElement, {
      width: displayWidth,
      height: displayHeight,
      backgroundColor: '#1a1a2e',
      selection: true,
    });

    fabricCanvasRef.current = canvas;

    // Load template as background
    FabricImage.fromURL(templateUrl).then((img) => {
      img.scaleX = displayWidth / img.width;
      img.scaleY = displayHeight / img.height;
      canvas.backgroundImage = img;
      canvas.renderAll();
      setCanvasReady(true);

      // Restore any existing fields from the store (e.g. when returning via "Edit Again")
      const existingFields = useEditorStore.getState().fields;
      if (existingFields && existingFields.length > 0) {
        const scale = scaleFactorRef.current;
        const dims = templateDimsRef.current;

        for (const field of existingFields) {
          const text = new IText(`{{${field.field_key}}}`, {
            left: field.x * dims.width * scale,
            top: field.y * dims.height * scale,
            originX: 'center',
            originY: 'center',
            fontFamily: field.font_family || 'Inter',
            fontSize: Math.round((field.font_size || 32) * scale),
            fill: field.font_color || '#000000',
            fontWeight: field.font_weight || 'normal',
            fontStyle: field.font_style || 'normal',
            textAlign: field.text_align || 'center',
            charSpacing: (field.letter_spacing || 0) * 10,
            angle: field.rotation || 0,
            editable: false,
            cornerColor: '#7c3aed',
            cornerStrokeColor: '#7c3aed',
            borderColor: '#7c3aed',
            cornerSize: 10,
            transparentCorners: false,
            borderScaleFactor: 2,
          });

          text.fieldId = field.id;
          text.fieldName = field.field_name;
          text.fieldKey = field.field_key;

          canvas.add(text);

          if (document.fonts) {
            document.fonts.load(`${field.font_style || 'normal'} ${field.font_weight || 'normal'} 1em "${field.font_family || 'Inter'}"`)
              .then(() => canvas.renderAll())
              .catch(() => {});
          }
        }
        canvas.renderAll();
      }
    }).catch((err) => {
      console.error('Failed to load template image:', err);
    });

    // Event listeners
    canvas.on('selection:created', (e) => {
      const obj = e.selected?.[0];
      if (obj?.fieldId) selectField(obj.fieldId);
    });

    canvas.on('selection:updated', (e) => {
      const obj = e.selected?.[0];
      if (obj?.fieldId) selectField(obj.fieldId);
    });

    canvas.on('selection:cleared', () => {
      deselectField();
    });

    canvas.on('object:modified', (e) => {
      const obj = e.target;
      if (obj?.fieldId) {
        const scale = scaleFactorRef.current;
        const dims = templateDimsRef.current;
        
        let newFontSize = obj.fontSize;
        let scaleX = obj.scaleX || 1;
        let scaleY = obj.scaleY || 1;

        // If the object was scaled, apply scale to fontSize and reset scale to 1
        if (scaleX !== 1 || scaleY !== 1) {
          newFontSize = Math.round(obj.fontSize * scaleX);
          obj.set({
            fontSize: newFontSize,
            scaleX: 1,
            scaleY: 1,
          });
          obj.setCoords();
          scaleX = 1;
          scaleY = 1;
          canvas.renderAll();
        }

        updateField(obj.fieldId, {
          x: obj.left / (dims.width * scale),
          y: obj.top / (dims.height * scale),
          rotation: obj.angle || 0,
          font_size: Math.round(newFontSize / scale),
          scale_x: scaleX,
          scale_y: scaleY,
        });
      }
    });

    return canvas;
  }, [containerRef, addField, updateField, selectField, deselectField, setCanvasReady]);

  // Add text field to canvas
  const addTextField = useCallback((fieldName, fieldKey) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const id = `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const scale = scaleFactorRef.current;
    
    const text = new IText(`{{${fieldKey}}}`, {
      left: canvas.width / 2,
      top: canvas.height / 2,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Inter',
      fontSize: Math.round(32 * scale),
      fill: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'center',
      editable: false,
      cornerColor: '#7c3aed',
      cornerStrokeColor: '#7c3aed',
      borderColor: '#7c3aed',
      cornerSize: 10,
      transparentCorners: false,
      borderScaleFactor: 2,
    });

    text.fieldId = id;
    text.fieldName = fieldName;
    text.fieldKey = fieldKey;

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();

    const dims = templateDimsRef.current;
    addField({
      id,
      field_name: fieldName,
      field_key: fieldKey,
      x: 0.5,
      y: 0.5,
      font_family: 'Inter',
      font_size: 32,
      font_color: '#000000',
      font_weight: 'normal',
      font_style: 'normal',
      text_align: 'center',
      letter_spacing: 0,
      rotation: 0,
      scale_x: 1,
      scale_y: 1,
    });

    selectField(id);
  }, [addField, selectField]);

  // Update field properties on canvas
  const updateCanvasField = useCallback((fieldId, props) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const scale = scaleFactorRef.current;

    const obj = canvas.getObjects().find((o) => o.fieldId === fieldId);
    if (!obj) return;

    if (props.font_family) {
      obj.set('fontFamily', props.font_family);
      // Dynamically load font in the browser so Fabric.js updates correctly
      if (document.fonts) {
        const weight = props.font_weight || obj.fontWeight || 'normal';
        const style = props.font_style || obj.fontStyle || 'normal';
        document.fonts.load(`${style} ${weight} 1em "${props.font_family}"`)
          .then(() => {
            canvas.renderAll();
          })
          .catch((err) => console.warn('Font load error:', err));
      }
    }
    if (props.font_size) obj.set('fontSize', Math.round(props.font_size * scale));
    if (props.font_color) obj.set('fill', props.font_color);
    if (props.font_weight) {
      obj.set('fontWeight', props.font_weight);
      if (document.fonts) {
        const fontFamily = props.font_family || obj.fontFamily || 'Inter';
        const style = props.font_style || obj.fontStyle || 'normal';
        document.fonts.load(`${style} ${props.font_weight} 1em "${fontFamily}"`)
          .then(() => canvas.renderAll())
          .catch(() => {});
      }
    }
    if (props.font_style) {
      obj.set('fontStyle', props.font_style);
      if (document.fonts) {
        const fontFamily = props.font_family || obj.fontFamily || 'Inter';
        const weight = props.font_weight || obj.fontWeight || 'normal';
        document.fonts.load(`${props.font_style} ${weight} 1em "${fontFamily}"`)
          .then(() => canvas.renderAll())
          .catch(() => {});
      }
    }
    if (props.text_align) obj.set('textAlign', props.text_align);
    if (props.letter_spacing != null) obj.set('charSpacing', props.letter_spacing * 10);

    canvas.renderAll();
    updateField(fieldId, props);
  }, [updateField]);

  // Remove field from canvas
  const removeCanvasField = useCallback((fieldId) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const obj = canvas.getObjects().find((o) => o.fieldId === fieldId);
    if (obj) {
      canvas.remove(obj);
      canvas.renderAll();
    }
    removeField(fieldId);
  }, [removeField]);

  // Load existing fields onto canvas
  const loadFields = useCallback((savedFields) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const scale = scaleFactorRef.current;
    const dims = templateDimsRef.current;

    // Remove existing field objects
    const fieldObjects = canvas.getObjects().filter((o) => o.fieldId);
    fieldObjects.forEach((o) => canvas.remove(o));

    for (const field of savedFields) {
      const text = new IText(`{{${field.field_key}}}`, {
        left: field.x * dims.width * scale,
        top: field.y * dims.height * scale,
        originX: 'center',
        originY: 'center',
        fontFamily: field.font_family || 'Inter',
        fontSize: Math.round((field.font_size || 32) * scale),
        fill: field.font_color || '#000000',
        fontWeight: field.font_weight || 'normal',
        fontStyle: field.font_style || 'normal',
        textAlign: field.text_align || 'center',
        charSpacing: (field.letter_spacing || 0) * 10,
        angle: field.rotation || 0,
        editable: false,
        cornerColor: '#7c3aed',
        cornerStrokeColor: '#7c3aed',
        borderColor: '#7c3aed',
        cornerSize: 10,
        transparentCorners: false,
        borderScaleFactor: 2,
      });

      text.fieldId = field.id;
      text.fieldName = field.field_name;
      text.fieldKey = field.field_key;

      canvas.add(text);

      // Load the webfont dynamically so Fabric.js displays the correct font
      if (document.fonts) {
        document.fonts.load(`${field.font_style || 'normal'} ${field.font_weight || 'normal'} 1em "${field.font_family || 'Inter'}"`)
          .then(() => canvas.renderAll())
          .catch(() => {});
      }
    }

    canvas.renderAll();
  }, []);

  // Export field data for saving (normalized coordinates)
  const exportFieldData = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return [];
    const scale = scaleFactorRef.current;
    const dims = templateDimsRef.current;

    return canvas.getObjects()
      .filter((o) => o.fieldId)
      .map((obj) => ({
        id: obj.fieldId,
        field_name: obj.fieldName,
        field_key: obj.fieldKey,
        x: obj.left / (dims.width * scale),
        y: obj.top / (dims.height * scale),
        font_family: obj.fontFamily,
        font_size: Math.round(obj.fontSize / scale),
        font_color: obj.fill,
        font_weight: obj.fontWeight,
        font_style: obj.fontStyle,
        text_align: obj.textAlign,
        letter_spacing: (obj.charSpacing || 0) / 10,
        rotation: obj.angle || 0,
        scale_x: obj.scaleX || 1,
        scale_y: obj.scaleY || 1,
      }));
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  return {
    fabricCanvas: fabricCanvasRef,
    initCanvas,
    addTextField,
    updateCanvasField,
    removeCanvasField,
    loadFields,
    exportFieldData,
    scaleFactor: scaleFactorRef,
  };
}
