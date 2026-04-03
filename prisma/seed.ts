import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_CREATORS = [
  { id: "c1", name: "Linh Phương", role: "Nhiếp Ảnh Gia", jobs: 142, rating: 4.9, img: "https://images.unsplash.com/photo-1616639943825-e0fbad20a3d3?w=400", tag: "Pro", tagColor: "#7C3AED", tagBg: "#F3EEFF", price: "2500000", specialty: ["Fashion", "Portrait", "Commercial"] },
  { id: "c2", name: "Minh Khoa", role: "Quay Phim", jobs: 89, rating: 4.8, img: "https://images.unsplash.com/photo-1568930290108-c255b908c86b?w=400", tag: "Rising", tagColor: "#2563EB", tagBg: "#EFF6FF", price: "3800000", specialty: ["MV", "TVC", "Documentary"] },
  { id: "c3", name: "Thu Hà", role: "Model", jobs: 210, rating: 5.0, img: "https://images.unsplash.com/photo-1763906803356-c4c2c83dc012?w=400", tag: "Elite", tagColor: "#D97706", tagBg: "#FFFBEB", price: "1800000", specialty: ["Fashion", "Lifestyle", "Beauty"] },
  { id: "c4", name: "Duy Anh", role: "Editor", jobs: 67, rating: 4.7, img: "https://images.unsplash.com/photo-1618902410393-6fe0a34bb79e?w=400", tag: "Pro", tagColor: "#7C3AED", tagBg: "#F3EEFF", price: "1200000", specialty: ["Photo Edit", "Video Edit", "Retouch"] },
  { id: "c5", name: "Bảo Trân", role: "Model", jobs: 95, rating: 4.8, img: "https://images.unsplash.com/photo-1753685728255-afaa48cc2c8b?w=400", tag: "Rising", tagColor: "#2563EB", tagBg: "#EFF6FF", price: "1500000", specialty: ["Lifestyle", "Sport", "Beauty"] },
  { id: "c6", name: "Quang Vinh", role: "Nhiếp Ảnh Gia", jobs: 178, rating: 4.9, img: "https://images.unsplash.com/photo-1758613655378-89bb3d122c57?w=400", tag: "Elite", tagColor: "#D97706", tagBg: "#FFFBEB", price: "3200000", specialty: ["Wedding", "Portrait", "Event"] },
  { id: "c7", name: "Ngọc Hân", role: "Stylist", jobs: 54, rating: 4.6, img: "https://images.unsplash.com/photo-1758613655976-e8c8f85849a2?w=400", tag: "Newbie", tagColor: "#6B7280", tagBg: "#F3F4F6", price: "800000", specialty: ["Fashion", "Beauty", "Commercial"] },
  { id: "c8", name: "Tiến Đạt", role: "Quay Phim", jobs: 123, rating: 4.8, img: "https://images.unsplash.com/photo-1634885078824-c4f6a3c312c2?w=400", tag: "Pro", tagColor: "#7C3AED", tagBg: "#F3EEFF", price: "4500000", specialty: ["Cinema", "TVC", "Short Film"] },
];

const DEFAULT_BLOGS = [
  { id: "b1", title: "10 Tips Chụp Ảnh Thời Trang", slug: "10-tips-chup-anh-thoi-trang", excerpt: "Chuẩn bị kỹ lưỡng là chìa khóa...", author: "Linh Phương", authorId: "c1", avatar: "https://images.unsplash.com/photo-1616639943825-e0fbad20a3d3?w=80", img: "https://images.unsplash.com/photo-1758613655976-e8c8f85849a2?w=800", date: "20/11/2024", readTime: "5 phút", category: "Nhiếp Ảnh", tags: ["photography"], status: "published", content: "Nội dung bài viết tips chụp ảnh..." },
  { id: "b2", title: "Xây Dựng Portfolio Model", slug: "xay-dung-portfolio-model", excerpt: "Hãy bắt đầu với những bộ ảnh chất lượng...", author: "Thu Hà", authorId: "c3", avatar: "https://images.unsplash.com/photo-1763906803356-c4c2c83dc012?w=80", img: "https://images.unsplash.com/photo-1634885078824-c4f6a3c312c2?w=800", date: "15/11/2024", readTime: "7 phút", category: "Model", tags: ["model"], status: "published", content: "Nội dung bài viết portfolio..." },
];

const DEFAULT_FEED_POSTS = [
  {
    id: 1,
    user: { name: "Linh Phương", role: "Nhiếp Ảnh Gia", avatar: "https://images.unsplash.com/photo-1616639943825-e0fbad20a3d3?w=80" },
    img: "https://images.unsplash.com/photo-1758613655378-89bb3d122c57?w=700",
    caption: "Buổi chụp ảnh tại studio mới cực kỳ ưng ý! 📸",
    likes: 124,
    time: "2 giờ trước",
    tags: ["#photography", "#studio"],
    isVideo: false,
    commentList: [
      { user: "Thu Hà", text: "Xịn quá chị ơi!", avatar: "https://images.unsplash.com/photo-1763906803356-c4c2c83dc012?w=120" }
    ]
  },
  {
    id: 2,
    user: { name: "Minh Khoa", role: "Quay Phim", avatar: "https://images.unsplash.com/photo-1568930290108-c255b908c86b?w=80" },
    img: "https://images.unsplash.com/photo-1617452483350-987d0a68c62b?w=700",
    caption: "Hậu kỳ cho dự án MV sắp tới. Stay tuned! 🎬",
    likes: 89,
    time: "5 giờ trước",
    tags: ["#filmmaking", "#behindthescenes"],
    isVideo: true,
    commentList: []
  }
];

async function main() {
  console.log("Seeding database...");

  // 1. Create default admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@studiobook.vn' },
    update: {},
    create: {
      email: 'admin@studiobook.vn',
      name: 'Admin',
      passwordHash,
      role: 'Admin',
      tag: 'Admin',
    },
  });
  console.log("Created admin user:", adminUser.id);

  // 2. Creators & Related Users
  for (const c of DEFAULT_CREATORS) {
    const creatorUserParams = {
        email: `${c.id}@studiobook.vn`,
        name: c.name,
        role: c.role,
        avatar: c.img,
        passwordHash, // default password
    };
    
    // Create corresponding user for creator
    const user = await prisma.user.upsert({
        where: { email: creatorUserParams.email },
        update: {},
        create: creatorUserParams
    });

    await prisma.creator.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        role: c.role,
        jobs: c.jobs,
        rating: c.rating,
        img: c.img,
        tag: c.tag,
        tagColor: c.tagColor,
        tagBg: c.tagBg,
        price: c.price,
        specialty: c.specialty,
      },
    });
  }
  console.log("Seeded creators");

  // 3. Blog Posts
  for (const b of DEFAULT_BLOGS) {
    await prisma.blogPost.upsert({
      where: { slug: b.slug },
      update: {},
      create: {
        id: b.id,
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        author: b.author,
        authorId: b.authorId,
        avatar: b.avatar,
        img: b.img,
        date: b.date,
        readTime: b.readTime,
        category: b.category,
        tags: b.tags,
        status: b.status,
        content: b.content,
      },
    });
  }
  console.log("Seeded blog posts");

  // 4. Dummy Bookings for Analytics
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    for (let j = 0; j < 15; j++) {
      const creator = DEFAULT_CREATORS[j % DEFAULT_CREATORS.length];
      const day = 1 + Math.floor(Math.random() * 28);
      const bookingId = `seed_${i}_${j}`;
      const createdAt = new Date(d.getFullYear(), d.getMonth(), day, 10);
      try {
          await prisma.booking.upsert({
            where: { id: bookingId },
            update: {},
            create: {
              id: bookingId,
              userId: adminUser.id,
              userName: "User Sample",
              userEmail: "demo@user.com",
              creatorId: creator.id,
              creatorName: creator.name,
              creatorRole: creator.role,
              creatorImg: creator.img,
              serviceTitle: "Project Alpha",
              price: creator.price,
              date: `${day}/${d.getMonth() + 1}/${d.getFullYear()}`,
              time: "10:00",
              duration: "4h",
              status: "completed",
              createdAt,
            },
          });
      } catch (e) {
          // ignore duplicate
      }
    }
  }
  console.log("Seeded default bookings for analytics");

  // 5. Feed Posts
  for (const p of DEFAULT_FEED_POSTS) {
      // Create user for feed post if not exists
      const email = `${p.user.name.toLowerCase().replace(/\s+/g,"")}@feed.vn`;
      const postUser = await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
              email,
              name: p.user.name,
              role: p.user.role,
              avatar: p.user.avatar,
              passwordHash,
          }
      });

      const feedPost = await prisma.feedPost.upsert({
          where: { id: p.id },
          update: {},
          create: {
              id: p.id,
              userId: postUser.id,
              userName: p.user.name,
              userRole: p.user.role,
              userAvatar: p.user.avatar,
              img: p.img,
              caption: p.caption,
              likes: p.likes,
              time: p.time,
              tags: p.tags,
              isVideo: p.isVideo,
          }
      });

      for (const comment of p.commentList) {
          const commentEmail = `${comment.user.toLowerCase().replace(/\s+/g,"")}@comment.vn`;
          const commentUser = await prisma.user.upsert({
              where: { email: commentEmail },
              update: {},
              create: {
                  email: commentEmail,
                  name: comment.user,
                  role: "User",
                  avatar: comment.avatar,
                  passwordHash,
              }
          });

          // Just create the comment without upsert logic for simplicity
          await prisma.feedComment.create({
              data: {
                  postId: feedPost.id,
                  userId: commentUser.id,
                  userName: comment.user,
                  userAvatar: comment.avatar,
                  text: comment.text
              }
          });
      }
  }
  console.log("Seeded feed posts");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
