import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!email || !password || !name) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const exist = await prisma.user.findUnique({
      where: { email },
    });

    if (exist) {
      return new NextResponse("User already exists", { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const formatName = encodeURIComponent(name);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || "User",
        avatar: `https://ui-avatars.com/api/?name=${formatName}&background=4F46E5&color=fff`,
        tag: "Newbie",
        tagColor: "#6b7280",
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("REGISTER_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
