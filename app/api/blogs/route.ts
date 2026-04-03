import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/lib/auth";

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET_BLOGS_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    
    const post = await prisma.blogPost.create({
      data: {
        ...body,
        slug,
        author: session.user.name,
        authorId: session.user.id,
        avatar: (session.user as any).avatar || "",
        status: "pending",
      },
    });
    return NextResponse.json(post);
  } catch (error) {
    console.error("POST_BLOG_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
