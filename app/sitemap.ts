import { MetadataRoute } from 'next';
import { prisma } from '@/app/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bean.studio';

  // Static routes
  const routes = [
    '',
    '/blog',
    '/kham-pha',
    '/dich-vu',
    '/cong-viec',
    '/bang-tin',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic Blog Posts
  const blogs = await prisma.blogPost.findMany({
    where: { status: 'published' },
    select: { slug: true, updatedAt: true },
  });

  const blogRoutes = blogs.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Dynamic Creator Profiles
  const creators = await prisma.creator.findMany({
    select: { id: true, updatedAt: true },
  });

  const creatorRoutes = creators.map((creator) => ({
    url: `${baseUrl}/ho-so/${creator.id}`,
    lastModified: creator.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [...routes, ...blogRoutes, ...creatorRoutes];
}
