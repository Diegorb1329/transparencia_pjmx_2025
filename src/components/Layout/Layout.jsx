import React from 'react';
import Head from 'next/head';

const Layout = ({ children, title = 'PJMx 2025 - Encuentra tu candidato ideal' }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Sistema de matching de candidatos judiciales para PJMx 2025" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen flex flex-col bg-black">
        <header className="bg-black text-white">
          <div className="container mx-auto py-2 px-6">
            {/* Header content removed */}
          </div>
        </header>
        
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        
        <footer className="bg-black border-t border-gray-800">
          <div className="container mx-auto p-6 text-center text-gray-500">
            <p>© {new Date().getFullYear()} PJMx 2025 - Proyecto de transparencia judicial</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout; 