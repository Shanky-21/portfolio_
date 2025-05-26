import { getAllPostSlugs, getPostData, BlogPost } from '../../../lib/posts';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import Image from 'next/image';

// Import remark and rehype plugins if you need to pass them to MDXRemote
// import remarkGfm from 'remark-gfm';
// import rehypeHighlight from 'rehype-highlight';

interface PostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const paths = await getAllPostSlugs();
  return paths;
}

export async function generateMetadata({ params }: PostPageProps) {
  try {
    const post = await getPostData(params.slug);
    return {
      title: `${post.title} | Blog`,
      description: post.excerpt,
      openGraph: post.coverImage ? {
        images: [post.coverImage],
      } : undefined,
    };
  } catch (error) {
    // Post not found
    return {
      title: 'Post Not Found | Blog',
      description: 'This blog post could not be found.',
    };
  }
}

// Helper function to get a color for a category badge (can be moved to a shared utils file)
const getCategoryColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    'Next.js': 'bg-blue-500 text-blue-100',
    'TypeScript': 'bg-sky-500 text-sky-100',
    'React': 'bg-cyan-500 text-cyan-100',
    'JavaScript': 'bg-yellow-500 text-yellow-100',
    'Tailwind CSS': 'bg-teal-500 text-teal-100',
    'Web Development': 'bg-indigo-500 text-indigo-100',
    'Productivity': 'bg-green-500 text-green-100',
    'Tutorial': 'bg-purple-500 text-purple-100',
    'Opinion': 'bg-pink-500 text-pink-100',
    'default': 'bg-gray-500 text-gray-100',
  };
  return colors[category] || colors.default;
};

export default async function PostPage({ params }: PostPageProps) {
  let post: BlogPost;
  try {
    post = await getPostData(params.slug);
  } catch (error) {
    notFound(); // Triggers the 404 page
  }

  return (
    <div className="container mx-auto px-4 py-12 bg-white dark:bg-[#060C1D]">
      <article className="max-w-3xl mx-auto">
        <header className="mb-8">
          <Link href="/blog" className="text-sky-600 dark:text-sky-400 hover:underline mb-6 inline-block">
            &larr; Back to all posts
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-3 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <time dateTime={post.date}>{format(new Date(post.date), 'MMMM d, yyyy')}</time>
            <span>&bull;</span>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getCategoryColor(post.category)}`}>
              {post.category}
            </span>
          </div>
          {post.coverImage && (
            <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden shadow-lg mb-8">
              <Image
                src={post.coverImage}
                alt={`${post.title} cover image`}
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
          )}
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none 
                        prose-headings:font-bold prose-headings:text-gray-800 dark:prose-headings:text-gray-100
                        prose-a:text-sky-600 dark:prose-a:text-sky-400 hover:prose-a:underline
                        prose-blockquote:border-sky-500 dark:prose-blockquote:border-sky-400
                        prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:p-1 prose-code:rounded-md prose-code:font-mono prose-code:text-sm
                        prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                        prose-img:rounded-lg prose-img:shadow-md
                        ">
          <MDXRemote
            source={post.content}
            // You can pass components here if you want to override default HTML elements or use custom components in MDX
            // components={{ CustomComponent: () => <div>Hello from MDX!</div> }}
            // options={{
            //   mdxOptions: {
            //     remarkPlugins: [remarkGfm],
            //     rehypePlugins: [rehypeHighlight], // Ensure rehype-highlight is configured correctly in next.config.mjs
            //   }
            // }}
          />
        </div>
      </article>
    </div>
  );
} 