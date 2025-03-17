/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['images.unsplash.com', "fastly.picsum.photos", "loremflickr.com"],
        formats: ['image/webp'],
    },
}

export default nextConfig
