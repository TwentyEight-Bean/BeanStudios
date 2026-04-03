import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        conversationId: id,
      },
      orderBy: {
        sentAt: "asc",
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET_MESSAGES_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { text } = await req.json();
    if (!text) {
      return new NextResponse("Text is required", { status: 400 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        conversationId: id,
        text,
        me: true,
        senderId: (session.user as any).id,
        senderName: session.user.name || "User",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("POST_MESSAGE_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
