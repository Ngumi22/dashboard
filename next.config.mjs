/** @type {import('next').NextConfig} */
import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig = {
    async headers() {
        return [
            {
                source: "/dashboard/:path*",
                headers: [
                    {
                        key: "X-Robots-Tag",
                        value: "noindex, nofollow",
                    },
                    {
                        key: "Cache-Control",
                        value: "no-store, must-revalidate",
                    },
                ],
            },
        ];
    },
    experimental: {
        optimizePackageImports: [
            '@radix-ui/themes',
            'lucide-react',
            '@tanstack/react-query',
            'lodash',
            'date-fns'
        ]
    },

    webpack: (config) => {
        config.optimization.splitChunks = {
            chunks: 'all',
            maxSize: 244 * 1024, // 244kB per chunk max
        };
        return config;
    }
};

export default withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
    openAnalyzer: false
})(nextConfig);