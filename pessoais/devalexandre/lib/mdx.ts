import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const contentDirectory = path.join(process.cwd(), 'content');

export interface PostFrontmatter {
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  cover?: string;
  draft?: boolean;
}

export interface Post {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
  htmlContent: string;
  readingTime: number;
}

export interface NotaFrontmatter {
  title: string;
  date: string;
}

export interface Nota {
  slug: string;
  frontmatter: NotaFrontmatter;
  content: string;
  htmlContent: string;
}

function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text?.trim()?.split(/\s+/)?.length ?? 0;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

async function processMarkdown(content: string): Promise<string> {
  try {
    const result = await remark().use(html).process(content);
    return result?.toString() ?? '';
  } catch {
    return '';
  }
}

export async function getAllPosts(): Promise<Post[]> {
  const blogDir = path.join(contentDirectory, 'blog');
  if (!fs.existsSync(blogDir)) return [];

  const files = fs.readdirSync(blogDir).filter((f: string) => f?.endsWith('.mdx'));

  const posts: Post[] = [];

  for (const file of files) {
    const filePath = path.join(blogDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const frontmatter = data as PostFrontmatter;

    if (frontmatter?.draft) continue;

    const htmlContent = await processMarkdown(content);

    posts.push({
      slug: file.replace('.mdx', ''),
      frontmatter,
      content,
      htmlContent,
      readingTime: calculateReadingTime(content),
    });
  }

  return posts.sort((a: Post, b: Post) =>
    new Date(b?.frontmatter?.date ?? '').getTime() - new Date(a?.frontmatter?.date ?? '').getTime()
  );
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const filePath = path.join(contentDirectory, 'blog', `${slug}.mdx`);
    if (!fs.existsSync(filePath)) return null;

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const htmlContent = await processMarkdown(content);

    return {
      slug,
      frontmatter: data as PostFrontmatter,
      content,
      htmlContent,
      readingTime: calculateReadingTime(content),
    };
  } catch {
    return null;
  }
}

export async function getAllNotas(): Promise<Nota[]> {
  const notasDir = path.join(contentDirectory, 'notas');
  if (!fs.existsSync(notasDir)) return [];

  const files = fs.readdirSync(notasDir).filter((f: string) => f?.endsWith('.mdx'));

  const notas: Nota[] = [];

  for (const file of files) {
    const filePath = path.join(notasDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const htmlContent = await processMarkdown(content);

    notas.push({
      slug: file.replace('.mdx', ''),
      frontmatter: data as NotaFrontmatter,
      content,
      htmlContent,
    });
  }

  return notas.sort((a: Nota, b: Nota) =>
    new Date(b?.frontmatter?.date ?? '').getTime() - new Date(a?.frontmatter?.date ?? '').getTime()
  );
}

export async function getNotaBySlug(slug: string): Promise<Nota | null> {
  try {
    const filePath = path.join(contentDirectory, 'notas', `${slug}.mdx`);
    if (!fs.existsSync(filePath)) return null;

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const htmlContent = await processMarkdown(content);

    return {
      slug,
      frontmatter: data as NotaFrontmatter,
      content,
      htmlContent,
    };
  } catch {
    return null;
  }
}

export function getAllTags(): { tag: string; count: number }[] {
  const blogDir = path.join(contentDirectory, 'blog');
  if (!fs.existsSync(blogDir)) return [];

  const files = fs.readdirSync(blogDir).filter((f: string) => f?.endsWith('.mdx'));
  const tagMap: Record<string, number> = {};

  for (const file of files) {
    const filePath = path.join(blogDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContent);
    const frontmatter = data as PostFrontmatter;

    if (frontmatter?.draft) continue;

    (frontmatter?.tags ?? []).forEach((tag: string) => {
      tagMap[tag] = (tagMap[tag] ?? 0) + 1;
    });
  }

  return Object.entries(tagMap ?? {}).map(([tag, count]: [string, number]) => ({ tag, count })).sort((a: any, b: any) => (b?.count ?? 0) - (a?.count ?? 0));
}

export async function getPageContent(page: string): Promise<{ frontmatter: Record<string, any>; htmlContent: string } | null> {
  try {
    const filePath = path.join(contentDirectory, `${page}.mdx`);
    if (!fs.existsSync(filePath)) return null;

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const htmlContent = await processMarkdown(content);

    return { frontmatter: data ?? {}, htmlContent };
  } catch {
    return null;
  }
}
