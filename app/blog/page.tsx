import Link from 'next/link';
import { getSortedPostsData, BlogMeta } from '../../lib/posts';
import { format } from 'date-fns';

export const metadata = {
  title: 'Blog | Shashank Dwivedi',
  description: 'Read articles and thoughts on software development and technology.',
};

// Helper function to get a color for a category badge
const getCategoryColor = (category: string): string => {
  // You can expand this with more categories and colors
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

export default async function BlogIndexPage() {
  const allPosts: BlogMeta[] = await getSortedPostsData();

  return (
    <div className="container mx-auto px-4 py-12 bg-white dark:bg-[#060C1D] min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center text-gray-900 dark:text-white">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-blue-600 dark:from-[#00A3FF] dark:to-[#00FFF0]">
            My Blog
          </span>
        </h1>

        {allPosts.length === 0 && (
          <p className="text-center text-gray-600 dark:text-gray-400">No posts yet. Check back soon!</p>
        )}

        <div className="space-y-8">
          {allPosts.map(({ slug, title, date, category, excerpt }) => (
            <article key={slug} className="p-6 bg-gray-50 dark:bg-[#0A1124] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-800">
              <header className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <time dateTime={date} className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(date), 'MMMM d, yyyy')}
                  </time>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(category)}`}>
                    {category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  <Link href={`/blog/${slug}`}>{title}</Link>
                </h2>
              </header>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {excerpt}
              </p>
              <Link href={`/blog/${slug}`} className="inline-block mt-4 text-sky-600 dark:text-sky-400 hover:underline">
                Read more &rarr;
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
} 