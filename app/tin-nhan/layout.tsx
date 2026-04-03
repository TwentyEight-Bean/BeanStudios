import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Tin Nhắn — Trò Chuyện & Quản Lý Dự Án",
  description: "Trò chuyện trực tiếp với creator, thiết lập yêu cầu và theo dõi tiến độ dự án trên BEAN.",
  alternates: { canonical: "/tin-nhan" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
