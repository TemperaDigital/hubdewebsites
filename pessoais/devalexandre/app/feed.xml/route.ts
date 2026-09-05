export const dynamic = 'force-dynamic';

import { getAllPosts } from '@/lib/mdx';

export async function GET() {
  const posts = await getAllPosts();
  const baseUrl = process.env.NEXTAUTH_URL || 'https://eu-alexandre.fguerra.ia.br';

  const rssItems = (posts ?? []).map((post: any) => {
    const pubDate = new Date(post?.frontmatter?.date ?? '');
    return `
    <item>
      <title><![CDATA[${post?.frontmatter?.title ?? ''}]]></title>
      <link>${baseUrl}/blog/${post?.slug ?? ''}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post?.slug ?? ''}</guid>
      <description><![CDATA[${post?.frontmatter?.description ?? ''}]]></description>
      <pubDate>${pubDate?.toUTCString?.() ?? ''}</pubDate>
    </item>`;
  }).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Alexandre Guerra</title>
    <link>${baseUrl}</link>
    <description>Blog de Alexandre Guerra sobre tecnologia, desenvolvimento web e carreira em TI.</description>
    <language>pt-br</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
