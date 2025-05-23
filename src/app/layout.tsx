import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Changed from Geist_Sans
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from 'react';

const inter = Inter({ // Changed from Geist_Sans
  variable: '--font-inter', // Updated variable name
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Emotion Insights',
  description: 'Chat with an AI to explore your emotions and gain insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}> {/* Use the new font variable */}
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
        <Suspense fallback={null}>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
