import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dịch Vụ Sản Xuất Nội Dung — Fashion, Beauty, TVC",
  description: "Dịch vụ sản xuất nội dung chuyên nghiệp: Fashion Editorial, Beauty Commercial, Music Video, TVC. Ekip hàng đầu Việt Nam.",
  alternates: { canonical: "/dich-vu" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
