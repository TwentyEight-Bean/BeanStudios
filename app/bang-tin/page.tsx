import { FeedPage } from "@/app/pages/FeedPage";
import { prisma } from "@/app/lib/prisma";

// SSR: Dynamically fetch feed posts on each request
export default async function Page() {
  const posts = await prisma.feedPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      comments: { 
        include: { user: true },
        orderBy: { createdAt: "asc" } 
      },
    },
  });

  // Transform Prisma data to FeedPost type expected by client component
  const feed = posts.map(p => ({
    id: p.id,
    user: {
      name: p.user.name,
      role: p.user.role,
      avatar: p.user.avatar,
    },
    img: p.img,
    caption: p.caption,
    likes: p.likes,
    comments: p.comments.length,
    time: "Vừa xong", // Ideally format this with date-fns/time-ago
    tags: p.tags,
    isVideo: p.isVideo,
    commentList: p.comments.map(c => ({
      user: c.user.name,
      text: c.text,
      avatar: c.user.avatar,
    })),
  }));

  return <FeedPage initialPosts={JSON.parse(JSON.stringify(feed))} />;
}
