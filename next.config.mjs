/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  experimental: {
    optimizePackageImports: ['@tremor/react', 'lucide-react'],
  },
  reactStrictMode: true,
  swcMinify: true,
}

export default nextConfig
