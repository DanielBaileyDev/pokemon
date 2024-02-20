/** @type {import('next').NextConfig} */
const nextConfig = () => {
    return {
        output: 'export',
        reactStrictMode: true,
        images: {
            remotePatterns: [
                {
                    protocol: 'https',
                    hostname: 'images.pokemontcg.io',
                    pathname: '**',
                },
            ],
        },
    };
}

export default nextConfig;
