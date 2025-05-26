import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
// Note: Depending on your rehype-highlight setup, you might need to import and pass it here.
// import rehypeHighlight from 'rehype-highlight';

const postsDirectory = path.join(process.cwd(), 'content');

export interface BlogMeta {
  slug: string;
  title: string;
  date: string; // ISO date string
  category: string;
  excerpt: string;
  coverImage?: string;
}

export interface BlogPost extends BlogMeta {
  content: any; // Serialized MDX content
}

export async function getSortedPostsData(): Promise<BlogMeta[]> {
  // Get file names under /content
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => /\\.mdx?$/.test(fileName)) // Ensure we only process .md or .mdx files
    .map((fileName) => {
      // Remove ".md" or ".mdx" from file name to get id
      const slug = fileName.replace(/\\.mdx?$/, '');

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      // Combine the data with the id
      return {
        slug,
        ...(matterResult.data as Omit<BlogMeta, 'slug'>),
      };
    });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    }
    return -1;
  });
}

export async function getAllPostSlugs() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((fileName) => /\\.mdx?$/.test(fileName))
    .map((fileName) => {
      return {
        params: {
          slug: fileName.replace(/\\.mdx?$/, ''),
        },
      };
    });
}

export async function getPostData(slug: string): Promise<BlogPost> {
  let fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(postsDirectory, `${slug}.mdx`);
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Serialize the MDX content
  const mdxSource = await serialize(matterResult.content, {
    mdxOptions: {
      // remarkPlugins: [], // Add remark plugins if needed
      // rehypePlugins: [rehypeHighlight], // Add rehype plugins if needed
    },
    scope: matterResult.data, // Pass frontmatter data to the MDX component
  });

  return {
    slug,
    content: mdxSource,
    ...(matterResult.data as Omit<BlogMeta, 'slug'>),
  };
} 