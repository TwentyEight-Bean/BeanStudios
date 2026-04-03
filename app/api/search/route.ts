import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.toLowerCase() || "";

    if (!query) return NextResponse.json([]);

    const [creators, blogs] = await Promise.all([
      prisma.creator.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { role: { contains: query, mode: "insensitive" } },
          ],
        },
      }),
      prisma.blogPost.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
          ],
        },
      }),
    ]);

    const results = [
      ...creators.map((c: any) => ({ type: "creator", title: c.name, subtitle: c.role, link: `/ho-so/${c.id}` })),
      ...blogs.map((b: any) => ({ type: "blog", title: b.title, subtitle: b.category, link: "/blog" })),
    ];

    return NextResponse.json(results);
  } catch (error) {
    console.error("SEARCH_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
