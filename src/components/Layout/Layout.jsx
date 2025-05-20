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
      
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-blue-800 text-white shadow-md">
          <div className="container mx-auto py-4 px-6">
            <h1 className="text-2xl font-bold">Transparencia PJMx 2025</h1>
          </div>
        </header>
        
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        
        <footer className="bg-gray-100 border-t">
          <div className="container mx-auto p-6 text-center text-gray-600">
            <p>© {new Date().getFullYear()} PJMx 2025 - Proyecto de transparencia judicial</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout; 