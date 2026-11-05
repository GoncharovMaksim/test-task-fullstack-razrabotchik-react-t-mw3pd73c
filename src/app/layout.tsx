import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CRMProvider } from '@/context/CRMContext';

export const metadata: Metadata = {
  title: 'СтройCRM: Объекты и задачи | 2B Studio',
  description: 'Мини-CRM для строительной компании с ролевой моделью RLS, объектами и жизненным циклом задач',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased selection:bg-zinc-800 selection:text-white">
        <AuthProvider>
          <CRMProvider>{children}</CRMProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
