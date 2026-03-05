/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "three-globe"];
    }
    return config;
  },
};

export default nextConfig;
