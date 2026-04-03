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

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { participantId } = await req.json();
    if (!participantId) {
      return new NextResponse("Participant ID is required", { status: 400 });
    }

    // Try to find existing conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        creatorId: participantId,
      }
    });

    if (!conversation) {
      const creator = await prisma.creator.findUnique({ where: { id: participantId } });
      conversation = await prisma.conversation.create({
        data: {
          name: creator?.name || "Chat",
          role: creator?.role || "Creator",
          avatar: creator?.img || "",
          creatorId: participantId,
        }
      });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("POST_CHAT_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
