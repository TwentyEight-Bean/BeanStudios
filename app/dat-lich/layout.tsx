import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Đặt Lịch Dự Án — Booking Ekip Sản Xuất",
  description: "Đặt lịch chụp ảnh, quay phim, sản xuất nội dung với ekip chuyên nghiệp hàng đầu Việt Nam. Quy trình đơn giản, nhanh chóng.",
  alternates: { canonical: "/dat-lich" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
