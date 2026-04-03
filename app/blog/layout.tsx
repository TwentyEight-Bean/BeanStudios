import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Blog Sáng Tạo — Kiến Thức, Xu Hướng Photography & Filmmaking",
  description: "Bài viết chia sẻ về nhiếp ảnh, quay phim, quá trình sản xuất và xu hướng sáng tạo tại Việt Nam.",
  alternates: { canonical: "/blog" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
