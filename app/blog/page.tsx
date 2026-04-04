import { BlogPage } from "@/app/pages/BlogPage";
import { prisma } from "@/app/lib/prisma";

// SSG: Fetch data on the server and pass to client component
export default async function Page() {
  const blogs = await prisma.blogPost.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
  });

  // Serialize Prisma objects to plain JSON for client boundary
  const initialPosts = JSON.parse(JSON.stringify(blogs));

  return <BlogPage initialPosts={initialPosts} />;
}
