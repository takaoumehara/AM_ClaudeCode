import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { OrganizationProvider } from '@/contexts/OrganizationContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AboutMe Cards - Rich Profile Platform',
  description: 'Transform how you connect with others through contextual profiles that go beyond traditional resumes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <OrganizationProvider>
            <div className="min-h-screen bg-gray-50">
              {children}
            </div>
          </OrganizationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}