import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import BlogPostDetail from "@/app/pages/BlogPostDetail";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return { title: "Blog Not Found | StudioBook" };
  return {
    title: `${post.title} | StudioBook Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: [post.img],
    },
  };
}

// SSR: Fetch single blog post on each request
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post) return notFound();

  // Transform Prisma data to match localApi BlogPost interface
  const initialPost = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    author: post.author,
    authorId: post.authorId,
    avatar: post.avatar,
    img: post.img,
    date: post.date,
    readTime: post.readTime,
    category: post.category,
    tags: post.tags,
    content: post.content,
    status: post.status as "pending" | "published",
    createdAt: post.createdAt.toISOString(),
  };

  return <BlogPostDetail post={initialPost} />;
}
