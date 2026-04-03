import { HomePage } from "@/app/pages/HomePage";
import { prisma } from "@/app/lib/prisma";

// SSG: Fetch data on the server and pass to client component
export default async function Page() {
  const creators = await prisma.creator.findMany({
    take: 6,
    orderBy: { jobs: "desc" }, // Sort by popular creators for home page
  });

  // Serialize Prisma objects to plain JSON for client boundary
  const initialCreators = JSON.parse(JSON.stringify(creators));

  return <HomePage initialCreators={initialCreators} />;
}
