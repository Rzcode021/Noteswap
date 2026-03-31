/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // reactCompiler: true, // Disabled for stability

  // Next.js 16 proxy configuration to replace deprecated middleware
  async rewrites() {
    return [
      // Add any proxy rules here if needed
      // For now, just pass through all requests
    ];
  },
};

export default nextConfig;
