/** @type {import('next').NextConfig} */
const nextConfig = () => {
    return {
        output: 'export',
        basePath: "/pokemon",
        images: {
            unoptimized: true,
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
