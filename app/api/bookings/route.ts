import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("GET_BOOKINGS_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const booking = await prisma.booking.create({
      data: {
        ...body,
        userId: session.user.id,
        userEmail: session.user.email,
        userName: session.user.name,
        status: "pending",
      },
    });
    return NextResponse.json(booking);
  } catch (error) {
    console.error("POST_BOOKING_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
