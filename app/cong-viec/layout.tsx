import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Công Việc & Dự Án — Tìm Việc Sáng Tạo",
  description: "Tìm kiếm và quản lý công việc sáng tạo: chụp ảnh, quay phim, thiết kế. Cơ hội việc làm cho nhiếp ảnh gia, model, editor tại Việt Nam.",
  alternates: { canonical: "/cong-viec" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
