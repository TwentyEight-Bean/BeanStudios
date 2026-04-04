import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/lib/auth";

export async function GET(
  req: Request,
  { params }: any
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id,
      },
      include: {
        creator: true,
      }
    });

    if (!booking) {
      return new NextResponse("Booking not found", { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("GET_BOOKING_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
