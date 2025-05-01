import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ComicHub',
    short_name: 'ComicHub',
    description: 'Your marketplace for custom comics',
    start_url: '/',
    display: 'standalone',
    background_color: '#ecf0f1', // Light Gray
    theme_color: '#3498db', // Vibrant Blue
    icons: [
      {
        src: '/icon-192x192.png', // Ensure you have these icons in /public
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png', // Ensure you have these icons in /public
        sizes: '512x512',
        type: 'image/png',
      },
       {
        src: "/icon-maskable-192x192.png", // Maskable icon
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
       {
        src: "/icon-maskable-512x512.png", // Maskable icon
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ],
  }
}
