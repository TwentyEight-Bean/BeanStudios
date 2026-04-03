import { ExplorePage } from "@/app/pages/ExplorePage";
import { prisma } from "@/app/lib/prisma";

// SSR: Dynamically fetch creators for the discovery page
export default async function Page() {
  const creators = await prisma.creator.findMany({
    orderBy: { rating: "desc" },
  });

  // Serialize Prisma objects to plain JSON for client boundary
  const initialCreators = JSON.parse(JSON.stringify(creators));

  return <ExplorePage initialCreators={initialCreators} />;
}
