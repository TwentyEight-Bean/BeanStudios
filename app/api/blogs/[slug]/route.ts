import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("GET_BLOG_POST_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
