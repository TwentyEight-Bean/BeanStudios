import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Bảng Tin Sáng Tạo — Cập Nhật Hoạt Động & Xu Hướng",
  description: "Theo dõi các dự án mới, cập nhật hoạt động từ mạng lưới creator, nhiếp ảnh gia và artist hàng đầu Việt Nam.",
  alternates: { canonical: "/bang-tin" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
