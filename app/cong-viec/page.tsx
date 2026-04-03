import { JobDashboardPage } from "@/app/pages/JobDashboardPage";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";

// SSR: Fetch user-specific bookings on the server
export default async function Page() {
  const session = await auth();

  // If not logged in, we can either redirect or let the client handle it.
  // For better UX, we'll let the client show the "Please Login" state or redirect.
  // But for SSR data, we only fetch if logged in.
  
  let initialBookings = [];
  if (session?.user?.id) {
    initialBookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
  }

  // Serialize Prisma objects to plain JSON for client boundary
  const bookings = JSON.parse(JSON.stringify(initialBookings));

  return <JobDashboardPage initialBookings={bookings} />;
}
