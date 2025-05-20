import "./globals.css";

export const metadata = {
  title: "Transparencia PJMx 2025",
  description: "Sistema de matching de candidatos judiciales",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
} 