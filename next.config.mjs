import nextMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'
// If you're using rehype-highlight, you might need to import it like this:
// import rehypeHighlight from 'rehype-highlight'
// Or ensure it's compatible with your Next.js version and MDX setup.
// For now, we'll assume it's correctly picked up by the MDX options.

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Configure `pageExtensions` to include MDX files
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // Add any other existing Next.js configurations here
  // For example:
  // reactStrictMode: true,
  // images: {
  //   domains: ['example.com'], // if you use external images for blog posts
  // },
};

const withMDX = nextMDX({
  // Remove the extension option if Turbopack doesn't support it,
  // or ensure it only processes .mdx if that restriction applies.
  // By default, @next/mdx processes .mdx. If you remove `extension`,
  // it should only look for .mdx files.
  // extension: /\\.mdx?$/, // Commenting this out to see if it helps with Turbopack
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
  // If you use `MDXProvider`, uncomment the following line
  // providerImportSource: "@mdx-js/react",
})

// Merge MDX config with Next.js config
export default withMDX(nextConfig); 