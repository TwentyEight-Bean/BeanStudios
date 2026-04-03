import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });
    
    // Default settings if none exist
    if (!settings) {
      return NextResponse.json({
        notifications: { booking: true, message: true, system: true, promo: false },
        privacy: { showOnline: true, showProfile: true, showStats: true },
        display: { compactMode: false, animationsEnabled: true },
        language: "vi"
      });
    }

    return NextResponse.json(settings.settings);
  } catch (error) {
    console.error("GET_SETTINGS_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const settings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: { settings: body },
      create: { userId: session.user.id, settings: body },
    });
    
    return NextResponse.json(settings.settings);
  } catch (error) {
    console.error("PATCH_SETTINGS_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
