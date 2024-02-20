/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    reactStrictMode: true,
    images: {
        domains: ['images.pokemontcg.io'],
    },
};

export default nextConfig;
