import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SafeCampus AI - Campus Health & Safety Companion',
  description: 'AI-powered campus health & safety companion providing real-time multimodal safety guidance, emergency escalation, and smart hazard detection.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#f8faff] text-slate-900 flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
