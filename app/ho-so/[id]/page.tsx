import { ProfilePage } from "@/app/pages/ProfilePage";
import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";

// SSR: Fetch creator profile directly from Prisma on each request
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch creator data
  const creator = await prisma.creator.findUnique({
    where: { id },
  });

  if (!creator) {
    // If not a creator, check if it's a regular user or return 404
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) return notFound();
    
    // For regular users, we might show a different profile or use default creator structure
    return <ProfilePage 
      initialCreator={null} 
      initialPortfolio={[]} 
      initialProjects={[]} 
    />;
  }

  // Fetch portfolio and projects
  const portfolio = creator.portfolioImgs;
  const projects = await prisma.project.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
  });

  // Transform Prisma data to match Creator and Project types
  const initialCreator = {
    id: creator.id,
    name: creator.name,
    role: creator.role,
    img: creator.img,
    tag: creator.tag,
    rating: creator.rating,
    jobs: creator.jobs,
    price: creator.price,
    specialty: creator.specialty,
  };

  const initialProjects = projects.map((p: any) => ({
    id: p.id,
    userId: p.userId,
    title: p.title,
    budget: p.budget,
    status: p.status,
    date: p.date,
    img: p.img,
    color: p.color || "#22C55E",
  }));

  return <ProfilePage 
    initialCreator={JSON.parse(JSON.stringify(initialCreator))}
    initialPortfolio={portfolio}
    initialProjects={JSON.parse(JSON.stringify(initialProjects))}
  />;
}
