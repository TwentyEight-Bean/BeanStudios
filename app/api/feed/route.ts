import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/lib/auth";

export async function GET() {
  try {
    const posts = await prisma.feedPost.findMany({
      include: {
        comments: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET_FEED_ERROR", error);
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
    const post = await prisma.feedPost.create({
      data: {
        ...body,
        userId: session.user.id,
        userName: session.user.name,
        userRole: (session.user as any).role || "User",
        userAvatar: (session.user as any).avatar || "",
        likes: 0,
        time: "Vừa mới xong",
      },
    });
    return NextResponse.json(post);
  } catch (error) {
    console.error("POST_FEED_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
