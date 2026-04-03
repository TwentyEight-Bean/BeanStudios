import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/lib/auth";

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = (session.user as any).id;

    await prisma.notification.deleteMany({
      where: {
        userId,
        read: true,
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("NOTIFICATION_CLEAR_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
