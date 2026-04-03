import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { LayoutShell } from "./LayoutShell";

export const metadata: Metadata = {
  metadataBase: new URL("https://bean.vn"),
  title: {
    default: "BEAN — Nền Tảng Kết Nối Sáng Tạo #1 Việt Nam | Nhiếp Ảnh, Model, Editor",
    template: "%s | BEAN",
  },
  description:
    "BEAN kết nối doanh nghiệp với nhiếp ảnh gia, model, editor và ekip sản xuất hàng đầu Việt Nam. Đặt lịch dễ dàng, thanh toán an toàn, chất lượng đảm bảo.",
  keywords: [
    "thuê nhiếp ảnh gia",
    "thuê model Việt Nam",
    "studio sản xuất nội dung",
    "đặt lịch chụp ảnh",
    "ekip quay phim",
    "nền tảng sáng tạo Việt Nam",
    "photographer booking",
    "creative talent Vietnam",
  ],
  authors: [{ name: "BEAN Platform" }],
  creator: "BEAN",
  publisher: "BEAN",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://bean.vn",
    siteName: "BEAN",
    title: "BEAN — Nền Tảng Kết Nối Sáng Tạo #1 Việt Nam",
    description:
      "Kết nối doanh nghiệp với nhiếp ảnh gia, model, editor hàng đầu Việt Nam. Đặt lịch dự án, quản lý ekip, nhận thành phẩm chất lượng cao.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BEAN - Nền tảng sáng tạo Việt Nam",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BEAN — Nền Tảng Kết Nối Sáng Tạo #1 Việt Nam",
    description:
      "Kết nối doanh nghiệp với nhiếp ảnh gia, model, editor hàng đầu Việt Nam.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://bean.vn",
    languages: {
      "vi-VN": "https://bean.vn",
    },
  },
  verification: {
    // google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body>
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
