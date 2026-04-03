"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "motion/react";
import {
  ArrowRight, X, Heart, Eye, Share2, Camera, Video,
  Edit3, Sparkles, Users, Star, Play, ChevronRight,
  Zap, Award, TrendingUp, Clock
} from "lucide-react";
import { toast } from "sonner";

// ── Tokens ────────────────────────────────────────────────────────────────────
const BG      = "#07070F";
const GRAD    = "linear-gradient(135deg, #6366F1, #A855F7)";
const GRAD_H  = "linear-gradient(135deg, #4F46E5 0%, #7C3AED 45%, #EC4899 100%)";
const NEON    = "0 0 60px rgba(99,102,241,0.45), 0 0 120px rgba(168,85,247,0.2)";

// ── Portfolio Data ────────────────────────────────────────────────────────────
const PORTFOLIO = [
  {
    id: 1, cat: "Thời Trang", span: 2, tall: true,
    title: "BST Thu Đông 2024 – Elegance & Darkness",
    subtitle: "Fashion Editorial · Studio B, HCM",
    img: "https://images.unsplash.com/photo-1771072426459-1ab467cd80f0?w=1200",
    crew: "Linh Phương · Thu Hà · Duy Anh",
    likes: 284, views: "1.2k", year: "2024",
    tags: ["Fashion", "Editorial", "Dark Concept"],
    description: "Bộ ảnh thời trang mùa Thu Đông 2024 với phong cách tối màu, ánh sáng chiaroscuro và concept Elegance & Darkness. Thực hiện trong 2 ngày tại Studio B.",
    color: "#A855F7",
  },
  {
    id: 2, cat: "Beauty", span: 1, tall: false,
    title: "Hana Beauty Campaign",
    subtitle: "Beauty Commercial · HCM",
    img: "https://images.unsplash.com/photo-1770622006339-5a7a91c36e05?w=700",
    crew: "Thu Hà · Duy Anh",
    likes: 512, views: "3.4k", year: "2024",
    tags: ["Beauty", "Commercial", "Close-up"],
    description: "Campaign quảng bá dòng mỹ phẩm Hana với aesthetic tối giản và tông màu warm earth.",
    color: "#EC4899",
  },
  {
    id: 3, cat: "Music Video", span: 1, tall: false,
    title: "Sóng Gió – MV Official",
    subtitle: "Music Video · 4K Cinematic",
    img: "https://images.unsplash.com/photo-1758390851225-63cbe6306f45?w=700",
    crew: "Minh Khoa · Duy Anh",
    likes: 389, views: "2.8k", year: "2024",
    tags: ["MV", "Cinematic", "4K"],
    description: "Music video chính thức cho ca khúc 'Sóng Gió' với kỹ thuật quay flycam và color grading điện ảnh.",
    color: "#6366F1",
  },
  {
    id: 4, cat: "TVC", span: 1, tall: false,
    title: "Nike Việt Nam – Run Free",
    subtitle: "TVC 30s · Multi-location",
    img: "https://images.unsplash.com/photo-1611558245524-aff4541a18d2?w=700",
    crew: "Tiến Đạt · Duy Anh · Ekip 5 người",
    likes: 621, views: "5.1k", year: "2024",
    tags: ["TVC", "Sport", "Brand"],
    description: "TVC 30 giây cho chiến dịch Nike Vietnam mùa hè 2024 với concept năng động và hiện đại.",
    color: "#22C55E",
  },
  {
    id: 5, cat: "Lifestyle", span: 2, tall: false,
    title: "Outdoor Lifestyle Series – Natural Light",
    subtitle: "Lifestyle · Đà Lạt",
    img: "https://images.unsplash.com/photo-1766193229578-ab4d9cd0c12b?w=1200",
    crew: "Quang Vinh · Bảo Trân",
    likes: 445, views: "2.1k", year: "2024",
    tags: ["Lifestyle", "Outdoor", "Natural Light"],
    description: "Series ảnh lifestyle ngoài trời tại Đà Lạt, tận dụng ánh sáng tự nhiên vàng ươm của buổi chiều.",
    color: "#F59E0B",
  },
  {
    id: 6, cat: "Wedding", span: 1, tall: true,
    title: "Bridal Collection – Eternal Grace",
    subtitle: "Wedding Photography · Hội An",
    img: "https://images.unsplash.com/photo-1770199780470-1e6e3d30f8f8?w=700",
    crew: "Quang Vinh · Ngọc Hân",
    likes: 738, views: "4.6k", year: "2024",
    tags: ["Wedding", "Bridal", "Luxury"],
    description: "Bộ ảnh cưới cao cấp với concept 'Eternal Grace' tại Hội An – nơi giao thoa giữa cổ điển và hiện đại.",
    color: "#D97706",
  },
  {
    id: 7, cat: "Portrait", span: 1, tall: false,
    title: "Portrait Series – Inner Light",
    subtitle: "Fine Art Portrait · Studio",
    img: "https://images.unsplash.com/photo-1616639943825-e0fbad20a3d3?w=700",
    crew: "Linh Phương",
    likes: 193, views: "980", year: "2024",
    tags: ["Portrait", "Fine Art", "Studio"],
    description: "Series chân dung nghệ thuật khám phá vẻ đẹp nội tâm qua ánh sáng tự nhiên và kỹ thuật chụp đặc biệt.",
    color: "#6366F1",
  },
  {
    id: 8, cat: "Thời Trang", span: 1, tall: false,
    title: "Model Portfolio – Bảo Trân",
    subtitle: "Fashion Model · Composite",
    img: "https://images.unsplash.com/photo-1753685728255-afaa48cc2c8b?w=700",
    crew: "Linh Phương · Ngọc Hân",
    likes: 317, views: "1.5k", year: "2024",
    tags: ["Model", "Fashion", "Portfolio"],
    description: "Portfolio tổng hợp của model Bảo Trân bao gồm các phong cách từ editorial đến lifestyle.",
    color: "#A855F7",
  },
  {
    id: 9, cat: "Event", span: 1, tall: false,
    title: "VinFast Launch Event 2024",
    subtitle: "Event Coverage · Hà Nội",
    img: "https://images.unsplash.com/photo-1765344550212-a3b963d63c32?w=700",
    crew: "Minh Khoa · Tiến Đạt · 3 photographers",
    likes: 556, views: "3.8k", year: "2024",
    tags: ["Event", "Corporate", "Launch"],
    description: "Phủ sóng toàn diện sự kiện ra mắt xe điện VinFast tại Hà Nội với ekip 5 người trong 1 ngày.",
    color: "#3B82F6",
  },
];

const CATS = ["Tất Cả", "Thời Trang", "Beauty", "Music Video", "TVC", "Lifestyle", "Wedding", "Portrait", "Event"];

const SERVICES_LIST = [
  { icon: Camera, label: "Nhiếp Ảnh", sub: "Fashion, Portrait, Beauty, Commercial", count: "142+", color: "#6366F1" },
  { icon: Video,  label: "Quay Phim & MV", sub: "MV, TVC, Documentary, Short Film", count: "89+", color: "#A855F7" },
  { icon: Edit3,  label: "Post-Production", sub: "Retouch, Color Grading, Editing", count: "210+", color: "#EC4899" },
  { icon: Users,  label: "Model & Talent", sub: "Fashion, Lifestyle, Sport, Beauty", count: "56+", color: "#22C55E" },
];

const STATS = [
  { val: "1,284+", label: "Dự Án Hoàn Thành", icon: Award },
  { val: "320+",   label: "Creative Talents",  icon: Users },
  { val: "4.9★",   label: "Rating Trung Bình", icon: Star },
  { val: "98%",    label: "Tỷ Lệ Thành Công", icon: TrendingUp },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function AnimatedStat({ val, label, icon: Icon, delay }: { val: string; label: string; icon: any; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay }}
      className="flex flex-col items-center gap-2 p-5 rounded-2xl"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: GRAD }}>
        <Icon size={18} className="text-white" />
      </div>
      <div style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, color: "white", letterSpacing: "-0.04em", lineHeight: 1 }}>{val}</div>
      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.06em", textAlign: "center" }}>{label.toUpperCase()}</div>
    </motion.div>
  );
}

function PortfolioCard({ item, i, onClick }: { item: typeof PORTFOLIO[0]; i: number; onClick: () => void }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(item.likes);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const isWide = item.span === 2;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: (i % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="relative group cursor-pointer overflow-hidden rounded-3xl"
      style={{
        gridColumn: isWide ? "span 2" : "span 1",
        aspectRatio: item.tall ? "3/4" : isWide ? "16/7" : "1",
        border: "1px solid rgba(255,255,255,0.07)",
      }}>
      {/* Image */}
      <motion.img
        src={item.img} alt={item.title}
        className="w-full h-full object-cover transition-transform duration-700"
        whileHover={{ scale: 1.07 }}
      />

      {/* Base gradient */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(7,7,15,0.92) 0%, rgba(7,7,15,0.2) 45%, transparent 100%)" }} />

      {/* Color tint on hover */}
      <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(ellipse at 30% 80%, ${item.color}30, transparent 65%)` }} />

      {/* Top accent line on hover */}
      <motion.div className="absolute top-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
        style={{ background: `linear-gradient(to right, ${item.color}, transparent)` }} />

      {/* Category badge */}
      <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full"
        style={{ background: `${item.color}CC`, backdropFilter: "blur(8px)", fontSize: "9px", color: "white", fontWeight: 800, letterSpacing: "0.1em" }}>
        {item.cat.toUpperCase()}
      </div>

      {/* Video play */}
      {item.cat === "Music Video" && (
        <div className="absolute top-4 right-14 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "rgba(7,7,15,0.65)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <Play size={12} style={{ fill: "white", color: "white", marginLeft: 1 }} />
        </div>
      )}

      {/* Like btn */}
      <motion.button
        onClick={e => { e.stopPropagation(); setLiked(!liked); setLikes(liked ? likes - 1 : likes + 1); }}
        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: "rgba(7,7,15,0.65)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}>
        <Heart size={13} style={{ color: liked ? "#EC4899" : "rgba(255,255,255,0.7)", fill: liked ? "#EC4899" : "none" }} />
      </motion.button>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <motion.div initial={{ y: 10, opacity: 0.7 }} whileHover={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
          <h3 style={{ fontSize: isWide ? "1.15rem" : "0.95rem", fontWeight: 800, color: "white", letterSpacing: "-0.02em", marginBottom: 4, lineHeight: 1.2 }}>
            {item.title}
          </h3>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>{item.subtitle}</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Heart size={11} style={{ color: "#EC4899", fill: "#EC4899" }} />
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{item.views}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ fontSize: "11px", color: item.color, fontWeight: 700 }}>
              Xem Chi Tiết <ChevronRight size={12} />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function ServicesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef      = useRef<HTMLDivElement>(null);
  const [cat, setCat]           = useState("Tất Cả");
  const [selected, setSelected] = useState<typeof PORTFOLIO[0] | null>(null);

  const { scrollY } = useScroll({ container: undefined });
  const heroY       = useTransform(scrollY, [0, 400], [0, -80]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.4]);

  const filtered = cat === "Tất Cả" ? PORTFOLIO : PORTFOLIO.filter(p => p.cat === cat);

  return (
    <div ref={containerRef} style={{ background: BG, minHeight: "100%", color: "white" }}>
      <style>{`
        @keyframes glow-pulse {
          0%,100% { opacity: 0.2; }
          50%      { opacity: 0.4; }
        }
        .gp { animation: glow-pulse 4s ease-in-out infinite; }
        @keyframes marquee-s {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        .mq { animation: marquee-s 24s linear infinite; }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[70vh] flex flex-col justify-center overflow-hidden px-6 lg:px-16 pt-16 pb-20">
        {/* Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="gp absolute -top-1/4 -right-1/4 w-[700px] h-[700px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 60%)" }} />
          <div className="gp absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 60%)", animationDelay: "2s" }} />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{ border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)" }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22C55E", boxShadow: "0 0 6px #22C55E" }} />
            <span style={{ fontSize: "10.5px", color: "#6366F1", fontWeight: 700, letterSpacing: "0.15em" }}>PORTFOLIO & DỊCH VỤ</span>
          </motion.div>

          <div className="space-y-1 mb-8">
            {[
              { text: "SÁNG TẠO", delay: 0,    style: { color: "white" } },
              { text: "KHÔNG",    delay: 0.07,  style: { color: "white" } },
              { text: "GIỚI HẠN", delay: 0.14,  style: { background: GRAD_H, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" } },
            ].map(({ text, delay, style }) => (
              <motion.div key={text}
                initial={{ opacity: 0, y: 60, skewY: 2 }} animate={{ opacity: 1, y: 0, skewY: 0 }}
                transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
                style={{ fontSize: "clamp(3.5rem,9vw,7.5rem)", fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.05em", ...style }}>
                {text}
              </motion.div>
            ))}
          </div>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ fontSize: "15px", color: "rgba(255,255,255,0.4)", lineHeight: 1.85, maxWidth: 500, marginBottom: 36 }}>
            Từ fashion editorial, music video đến TVC thương mại — đội ngũ creator hàng đầu Việt Nam sẵn sàng biến tầm nhìn của bạn thành thực tế.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            className="flex flex-wrap gap-4">
            <Link href="/dat-lich">
              <motion.button whileHover={{ scale: 1.04, boxShadow: "0 0 80px rgba(99,102,241,0.6)" }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-white"
                style={{ background: GRAD, fontSize: "14px", fontWeight: 800, boxShadow: NEON }}>
                <Sparkles size={15} /> Đặt Lịch Ngay <ArrowRight size={15} />
              </motion.button>
            </Link>
            <Link href="/kham-pha">
              <motion.button whileHover={{ borderColor: "rgba(255,255,255,0.4)" }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)", fontSize: "14px", fontWeight: 600 }}>
                <Users size={15} /> Xem Creators
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-16 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s, i) => <AnimatedStat key={s.label} {...s} delay={i * 0.1} />)}
        </div>
      </section>

      {/* ── SERVICES LIST ────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-16 pb-24"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.015)", paddingTop: "3rem" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
              style={{ border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)" }}>
              <Zap size={10} style={{ color: "#6366F1" }} />
              <span style={{ fontSize: "10px", color: "#6366F1", fontWeight: 700, letterSpacing: "0.18em" }}>DỊCH VỤ CỦA CHÚNG TÔI</span>
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 10 }}>
              Mọi Thứ Bạn Cần Trong{" "}
              <span style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Một Nền Tảng
              </span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICES_LIST.map(({ icon: Icon, label, sub, count, color }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, boxShadow: `0 20px 50px ${color}20, 0 0 0 1px ${color}20` }}
                className="p-5 rounded-2xl cursor-pointer transition-all"
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.07)` }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div style={{ fontSize: "15px", fontWeight: 800, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.35)", marginBottom: 10, lineHeight: 1.5 }}>{sub}</div>
                <div style={{ fontSize: "20px", fontWeight: 900, color, letterSpacing: "-0.03em" }}>{count}</div>
                <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)", fontWeight: 600, letterSpacing: "0.1em" }}>DỰ ÁN THỰC HIỆN</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO GRID ───────────────────────────────────────────────── */}
      <section className="px-6 lg:px-16 py-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px" style={{ background: GRAD }} />
                <span style={{ fontSize: "10px", color: "#6366F1", fontWeight: 700, letterSpacing: "0.22em" }}>PORTFOLIO ĐƯỢC CHỌN</span>
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95 }}>
                Những Tác Phẩm<br />
                <span style={{ background: GRAD_H, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Nổi Bật Nhất
                </span>
              </motion.h2>
            </div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", paddingBottom: 4 }}>
              {filtered.length} dự án
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-10" style={{ scrollbarWidth: "none" }}>
            {CATS.map((c, i) => (
              <motion.button key={c} onClick={() => setCat(c)}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="px-4 py-2 rounded-xl whitespace-nowrap flex-shrink-0 transition-all"
                style={{
                  background: cat === c ? GRAD : "rgba(255,255,255,0.04)",
                  border: cat === c ? "none" : "1px solid rgba(255,255,255,0.1)",
                  color: cat === c ? "white" : "rgba(255,255,255,0.5)",
                  fontSize: "12.5px", fontWeight: cat === c ? 700 : 500,
                  boxShadow: cat === c ? "0 0 30px rgba(99,102,241,0.3)" : "none",
                }}>
                {c}
              </motion.button>
            ))}
          </div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={cat}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid gap-4"
              style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              {filtered.map((item, i) => (
                <PortfolioCard key={item.id} item={item} i={i} onClick={() => setSelected(item)} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── CTA SECTION ─────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-16 py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-10 lg:p-16 text-center"
            style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", boxShadow: "0 0 80px rgba(99,102,241,0.08)" }}>
            <div className="absolute inset-0 opacity-5" style={{ background: GRAD }} />
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(99,102,241,0.3), transparent)", filter: "blur(40px)" }} />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(236,72,153,0.2), transparent)", filter: "blur(40px)" }} />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)" }}>
                <Clock size={11} style={{ color: "#6366F1" }} />
                <span style={{ fontSize: "11px", color: "#6366F1", fontWeight: 700 }}>Phản hồi trong 2 giờ</span>
              </div>
              <h2 style={{ fontSize: "clamp(1.8rem,5vw,3.5rem)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 14, lineHeight: 1.1 }}>
                Sẵn Sàng Tạo Nên{" "}
                <span style={{ background: GRAD_H, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Tác Phẩm Tiếp Theo?
                </span>
              </h2>
              <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.4)", lineHeight: 1.8, maxWidth: 500, margin: "0 auto 36px" }}>
                Đội ngũ creator hàng đầu, quy trình sản xuất chuyên nghiệp và giao hàng đúng hạn. Tất cả trong một nền tảng.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/dat-lich">
                  <motion.button whileHover={{ scale: 1.04, boxShadow: "0 0 80px rgba(99,102,241,0.6)" }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white"
                    style={{ background: GRAD, fontSize: "15px", fontWeight: 800, boxShadow: NEON }}>
                    <Sparkles size={16} /> Bắt Đầu Dự Án <ArrowRight size={16} />
                  </motion.button>
                </Link>
                <Link href="/kham-pha">
                  <motion.button whileHover={{ borderColor: "rgba(255,255,255,0.35)" }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2.5 px-8 py-4 rounded-2xl transition-all"
                    style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)", fontSize: "15px", fontWeight: 600 }}>
                    Xem Tất Cả Creators <ChevronRight size={16} />
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PROJECT DETAIL MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(20px)" }}
            onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col"
              style={{ background: "#0A0A14", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 40px 120px rgba(0,0,0,0.9)", maxHeight: "90vh" }}>

              {/* Image */}
              <div className="relative h-64 flex-shrink-0 overflow-hidden">
                <img src={selected.img} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0A0A14 0%, transparent 55%)" }} />
                {/* Close */}
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(7,7,15,0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <X size={15} className="text-white" />
                </motion.button>
                {/* Category badge */}
                <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full"
                  style={{ background: `${selected.color}CC`, fontSize: "9px", color: "white", fontWeight: 800, letterSpacing: "0.1em" }}>
                  {selected.cat.toUpperCase()}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.2 }}>{selected.title}</h2>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toast.success("Đã copy link!")}
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
                      <Share2 size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: "12px", color: selected.color, fontWeight: 700, marginBottom: 12 }}>{selected.subtitle}</div>

                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.8, marginBottom: 16 }}>
                  {selected.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {selected.tags.map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-xl"
                      style={{ background: `${selected.color}12`, border: `1px solid ${selected.color}20`, fontSize: "11px", color: selected.color, fontWeight: 600 }}>
                      {t}
                    </span>
                  ))}
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-5 p-4 rounded-2xl mb-5"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex-1">
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 3 }}>EKIP</div>
                    <div style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{selected.crew}</div>
                  </div>
                  <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.06)" }} />
                  <div className="flex gap-5">
                    <div className="text-center">
                      <div style={{ fontSize: "15px", fontWeight: 800, color: "#EC4899" }}>{selected.likes}</div>
                      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", fontWeight: 600 }}>LIKES</div>
                    </div>
                    <div className="text-center">
                      <div style={{ fontSize: "15px", fontWeight: 800, color: "#6366F1" }}>{selected.views}</div>
                      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", fontWeight: 600 }}>VIEWS</div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <Link href="/dat-lich" onClick={() => setSelected(null)}>
                  <motion.button whileHover={{ scale: 1.02, boxShadow: "0 8px 40px rgba(99,102,241,0.4)" }} whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-2xl text-white flex items-center justify-center gap-2"
                    style={{ background: GRAD, fontSize: "14px", fontWeight: 800, boxShadow: "0 0 30px rgba(99,102,241,0.25)" }}>
                    <Sparkles size={15} /> Đặt Lịch Dự Án Tương Tự <ArrowRight size={15} />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
