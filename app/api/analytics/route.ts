import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "Admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: { status: "completed" },
    });

    const now = new Date();
    const analytics = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const mBookings = bookings.filter((b: any) => {
        const bd = new Date(b.createdAt);
        return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
      });
      const rev = mBookings.reduce((s: number, b: any) => s + (Number(b.price) || 0), 0) / 1000000;
      
      return {
        month: `T${d.getMonth() + 1}`,
        jobs: mBookings.length,
        users: 15 + Math.floor(Math.random() * 20), // Mocking users flux for now
        revenue: Math.round(rev),
      };
    });

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("GET_ANALYTICS_ERROR", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
