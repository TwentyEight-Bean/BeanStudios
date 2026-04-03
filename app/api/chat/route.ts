import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      include: {
        messages: {
          orderBy: { sentAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(conversations);
  } catch (error) {
    console.error("GET_CHAT_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
