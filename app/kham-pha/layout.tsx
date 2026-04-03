import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Khám Phá Talents — Nhiếp Ảnh Gia, Model, Editor",
  description: "Tìm kiếm và kết nối với 320+ creative talents hàng đầu Việt Nam. Lọc theo kỹ năng, khu vực, giá cả và đánh giá.",
  alternates: { canonical: "/kham-pha" },
};

export default function KhamPhaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
