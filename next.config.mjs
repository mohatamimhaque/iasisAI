/** @type {import('next').NextConfig} */
const nextConfig = {
allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '*.local',
    '10.*.*.*',
    '172.*.*.*',
    '192.168.*.*',
  ],
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },
}

export default nextConfig