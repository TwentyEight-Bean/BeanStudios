import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const creators = await prisma.creator.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(creators);
  } catch (error) {
    console.error("GET_CREATORS_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const creator = await prisma.creator.create({
      data: body,
    });
    return NextResponse.json(creator);
  } catch (error) {
    console.error("POST_CREATOR_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
