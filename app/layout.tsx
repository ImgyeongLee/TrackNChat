import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import './app.css';
import { cn } from '@/lib/utils';

const fontSans = FontSans({
    subsets: ['latin'],
    variable: '--font-sans',
});

export const metadata: Metadata = {
    title: 'TrackNChat',
    description: 'Tracking AI Agent',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="h-full w-full">
            <body className={cn('min-h-screen bg-[#0e1926] font-sans antialiased', fontSans.variable)}>{children}</body>
        </html>
    );
}
