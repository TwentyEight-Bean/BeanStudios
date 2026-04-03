import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/lib/auth";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, avatar, tag, tagColor } = await req.json();
    const userId = (session.user as any).id;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        avatar,
        tag,
        tagColor,
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("SETTINGS_PROFILE_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
