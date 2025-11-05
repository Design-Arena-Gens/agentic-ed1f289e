import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Passport Photo Maker',
  description: 'Crop, rotate, align, and export passport photos. Arrange on A4 for print.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
