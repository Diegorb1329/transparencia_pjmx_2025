/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    // Habilitar características específicas de SWC
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'candidaturaspoderjudicial.ine.mx',
      },
    ],
  },
};

module.exports = nextConfig; 