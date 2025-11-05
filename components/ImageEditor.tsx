"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { mmToPx } from '@/lib/imageUtils';

type SizePreset = {
  id: string;
  label: string;
  widthMm: number;
  heightMm: number;
};

const PRESETS: SizePreset[] = [
  { id: '35x45mm', label: '35 x 45 mm (EU/IN)', widthMm: 35, heightMm: 45 },
  { id: '2x2in', label: '2 x 2 inch (US)', widthMm: 50.8, heightMm: 50.8 },
  { id: '40x50mm', label: '40 x 50 mm', widthMm: 40, heightMm: 50 },
  { id: '30x40mm', label: '30 x 40 mm', widthMm: 30, heightMm: 40 }
];

export default function ImageEditor({
  onGenerate
}: {
  onGenerate: (dataUrl: string, widthPx: number, heightPx: number, dpi: number) => void;
}) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [presetId, setPresetId] = useState<string>('35x45mm');
  const [dpi, setDpi] = useState<number>(300);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const preset = useMemo(() => PRESETS.find(p => p.id === presetId) ?? PRESETS[0], [presetId]);
  const target = useMemo(() => {
    const widthPx = Math.round(mmToPx(preset.widthMm, dpi));
    const heightPx = Math.round(mmToPx(preset.heightMm, dpi));
    return { widthPx, heightPx };
  }, [preset, dpi]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setScale(1);
      setRotation(0);
      setOffsetX(0);
      setOffsetY(0);
    };
    img.src = url;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = target.widthPx;
    canvas.height = target.heightPx;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!image) return;

    // Draw transformed image centered then offset
    ctx.save();
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    ctx.translate(cx + offsetX, cy + offsetY);
    ctx.rotate((rotation * Math.PI) / 180);

    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;

    ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  }, [image, offsetX, offsetY, rotation, scale, target.heightPx, target.widthPx]);

  useEffect(() => {
    draw();
  }, [draw]);

  const downloadPng = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${preset.id}_${dpi}dpi.png`;
    a.click();
  }, [dpi, preset.id]);

  const useForA4 = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    onGenerate(url, canvas.width, canvas.height, dpi);
  }, [dpi, onGenerate]);

  const canExport = Boolean(image);

  return (
    <div>
      <div className="controls" style={{ marginBottom: 12 }}>
        <div>
          <label>Upload image</label>
          <input type="file" accept="image/*" onChange={onFileChange} />
        </div>
        <div>
          <label>Preset size</label>
          <select value={presetId} onChange={(e) => setPresetId(e.target.value)}>
            {PRESETS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label>DPI</label>
          <div className="inputRow">
            <input
              type="number"
              min={100}
              max={600}
              step={50}
              value={dpi}
              onChange={(e) => setDpi(Number(e.target.value) || 300)}
            />
          </div>
          <div className="small">Output: {target.widthPx} ? {target.heightPx} px</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="sectionTitle">Adjustments</div>
        <div className="rangeRow">
          <span className="small">Zoom</span>
          <input
            type="range"
            min={0.2}
            max={4}
            step={0.01}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
          />
          <input type="number" min={0.2} max={4} step={0.01} value={scale} onChange={(e) => setScale(Number(e.target.value))} />
        </div>
        <div className="rangeRow">
          <span className="small">Rotate</span>
          <input
            type="range"
            min={-45}
            max={45}
            step={0.1}
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
          />
          <input type="number" min={-180} max={180} step={0.1} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} />
        </div>
        <div className="rangeRow">
          <span className="small">Offset X</span>
          <input type="range" min={-600} max={600} step={1} value={offsetX} onChange={(e) => setOffsetX(Number(e.target.value))} />
          <input type="number" min={-5000} max={5000} step={1} value={offsetX} onChange={(e) => setOffsetX(Number(e.target.value))} />
        </div>
        <div className="rangeRow">
          <span className="small">Offset Y</span>
          <input type="range" min={-600} max={600} step={1} value={offsetY} onChange={(e) => setOffsetY(Number(e.target.value))} />
          <input type="number" min={-5000} max={5000} step={1} value={offsetY} onChange={(e) => setOffsetY(Number(e.target.value))} />
        </div>
      </div>

      <div>
        <div className="sectionTitle">Preview</div>
        <div className="canvasWrap">
          <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
        <div className="previewNote">This preview is the exact output size at {dpi} DPI.</div>
      </div>

      <div className="buttons" style={{ marginTop: 12 }}>
        <button className="button" onClick={downloadPng} disabled={!canExport}>Download Passport Photo (PNG)</button>
        <button className="button secondary" onClick={useForA4} disabled={!canExport}>Use in A4 Sheet</button>
      </div>
    </div>
  );
}
