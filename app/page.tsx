"use client";

import { useCallback, useState } from 'react';
import ImageEditor from '@/components/ImageEditor';
import A4Layout from '@/components/A4Layout';

export default function Page() {
  const [passportDataUrl, setPassportDataUrl] = useState<string | null>(null);
  const [passportSize, setPassportSize] = useState<{ widthPx: number; heightPx: number; dpi: number } | null>(null);

  const handleGenerated = useCallback((dataUrl: string, widthPx: number, heightPx: number, dpi: number) => {
    setPassportDataUrl(dataUrl);
    setPassportSize({ widthPx, heightPx, dpi });
    // Scroll into A4 section smoothly
    setTimeout(() => {
      const a4 = document.getElementById('a4-section');
      if (a4) a4.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, []);

  return (
    <div className="container">
      <div className="header">
        <div className="title">Passport Photo Maker</div>
      </div>

      <div className="grid">
        <div className="card">
          <div className="sectionTitle">1) Edit your photo</div>
          <p className="small">Upload, then adjust zoom, rotation, and alignment. Choose a preset size and DPI. Preview updates live.</p>
          <ImageEditor onGenerate={handleGenerated} />
        </div>
        <div className="card" id="a4-section">
          <div className="sectionTitle">2) Arrange on A4 and export</div>
          <p className="small">Automatically fills an A4 sheet with duplicates for printing. Export as high-resolution PNG.</p>
          <A4Layout
            sourceDataUrl={passportDataUrl}
            widthPx={passportSize?.widthPx ?? 0}
            heightPx={passportSize?.heightPx ?? 0}
            dpi={passportSize?.dpi ?? 300}
          />
        </div>
      </div>

      <p className="small" style={{ marginTop: 12 }}>
        Tip: Hold <span className="kbd">Shift</span> while dragging sliders for fine control.
      </p>
    </div>
  );
}
