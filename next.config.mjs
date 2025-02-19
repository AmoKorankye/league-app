/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      // This allows production builds to complete even if there are linting errors.
      ignoreDuringBuilds: true,
    },
  };
  
  export default nextConfig;
  