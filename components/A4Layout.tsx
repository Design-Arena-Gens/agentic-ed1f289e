"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { A4_HEIGHT_MM, A4_WIDTH_MM, mmToPx } from '@/lib/imageUtils';

export default function A4Layout({
  sourceDataUrl,
  widthPx,
  heightPx,
  dpi
}: {
  sourceDataUrl: string | null;
  widthPx: number;
  heightPx: number;
  dpi: number;
}) {
  const [marginMm, setMarginMm] = useState<number>(5);
  const [spacingMm, setSpacingMm] = useState<number>(2);

  const a4Px = useMemo(() => ({
    width: Math.round(mmToPx(A4_WIDTH_MM, dpi)),
    height: Math.round(mmToPx(A4_HEIGHT_MM, dpi))
  }), [dpi]);

  const marginPx = useMemo(() => Math.round(mmToPx(marginMm, dpi)), [marginMm, dpi]);
  const spacingPx = useMemo(() => Math.round(mmToPx(spacingMm, dpi)), [spacingMm, dpi]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [count, setCount] = useState<{ cols: number; rows: number; total: number }>({ cols: 0, rows: 0, total: 0 });

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = a4Px.width;
    canvas.height = a4Px.height;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!sourceDataUrl || widthPx <= 0 || heightPx <= 0) {
      setCount({ cols: 0, rows: 0, total: 0 });
      return;
    }

    const img = await loadImage(sourceDataUrl);

    const usableWidth = canvas.width - marginPx * 2;
    const usableHeight = canvas.height - marginPx * 2;

    const cols = Math.max(0, Math.floor((usableWidth + spacingPx) / (widthPx + spacingPx)));
    const rows = Math.max(0, Math.floor((usableHeight + spacingPx) / (heightPx + spacingPx)));

    let y = marginPx;
    for (let r = 0; r < rows; r++) {
      let x = marginPx;
      for (let c = 0; c < cols; c++) {
        ctx.drawImage(img, x, y, widthPx, heightPx);
        x += widthPx + spacingPx;
      }
      y += heightPx + spacingPx;
    }

    setCount({ cols, rows, total: cols * rows });
  }, [a4Px.height, a4Px.width, heightPx, marginPx, sourceDataUrl, spacingPx, widthPx]);

  useEffect(() => { draw(); }, [draw]);

  const downloadA4 = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `A4_${dpi}dpi.png`;
    a.click();
  }, [dpi]);

  const disabled = !sourceDataUrl || widthPx <= 0 || heightPx <= 0;

  return (
    <div>
      <div className="controls" style={{ marginBottom: 12 }}>
        <div>
          <label>Margin (mm)</label>
          <input type="number" min={0} max={30} step={1} value={marginMm} onChange={(e) => setMarginMm(Number(e.target.value) || 0)} />
        </div>
        <div>
          <label>Spacing (mm)</label>
          <input type="number" min={0} max={20} step={1} value={spacingMm} onChange={(e) => setSpacingMm(Number(e.target.value) || 0)} />
        </div>
        <div>
          <label>Sheet size</label>
          <div className="inputRow"><input value={`A4 (${a4Px.width} ? ${a4Px.height} px @ ${dpi} DPI)`} readOnly /></div>
        </div>
        <div>
          <label>Copies</label>
          <div className="inputRow"><input value={`${count.cols} ? ${count.rows} = ${count.total}`} readOnly /></div>
        </div>
      </div>

      <div className="canvasWrap">
        <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', background: 'white' }} />
      </div>

      <div className="buttons" style={{ marginTop: 12 }}>
        <button className="button" onClick={downloadA4} disabled={disabled}>Download A4 PNG</button>
      </div>
    </div>
  );
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
