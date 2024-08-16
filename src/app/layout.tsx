import type { Metadata } from 'next';
import './globals.css';
import { DM_Mono} from "next/font/google";

// Importer la police DM_Mono
const dmMono = DM_Mono({
  weight: ['300', '400', '500'], // Spécifiez le poids de la police
  subsets: ['latin'], // Spécifiez les sous-ensembles nécessaires
});
export const metadata: Metadata = {
  title: "Pkm gameplay",
  description: "Pkm gameplay project",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" className={dmMono.className}>
      <body className='bg-zinc-50'>
      {children}
      </body>
      </html>
  );
}

