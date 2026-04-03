"use client";
import { useRef, useState, useEffect, memo } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import {
  ArrowRight, Users, Briefcase, TrendingUp,
  Zap, ChevronRight, Sparkles, Play, ArrowUpRight,
  Camera, Video, Edit3,
} from "lucide-react";
import { getCreators, type Creator } from "../lib/localApi";

// ── Design tokens ────────────────────────────────────────────────────────────
const BG       = "#07070F";
const ACCENT   = "#6366F1";
const ACCENT2  = "#A855F7";
const ACCENT3  = "#EC4899";
const GRAD     = "linear-gradient(135deg, #6366F1, #A855F7)";
const GRAD_HOT = "linear-gradient(135deg, #4F46E5 0%, #7C3AED 45%, #EC4899 100%)";
const NEON     = "0 0 60px rgba(99,102,241,0.45), 0 0 120px rgba(168,85,247,0.2)";

const TAG_GRADS: Record<string, string> = {
  Pro:    "linear-gradient(135deg,#8B5CF6,#6D28D9)",
  Elite:  "linear-gradient(135deg,#F59E0B,#D97706)",
  Rising: "linear-gradient(135deg,#3B82F6,#1D4ED8)",
  Newbie: "linear-gradient(135deg,#9CA3AF,#6B7280)",
};

// ── Data ─────────────────────────────────────────────────────────────────────
const COLLECTIONS = [
  {
    id: "01", title: "BST THU ĐÔNG 2024", subtitle: "Elegance & Darkness",
    category: "FASHION EDITORIAL", crew: "Linh Phương · Thu Hà · Minh Khoa",
    img: "https://images.unsplash.com/photo-1770062422860-92c107ef02cc?w=1400",
    stats: "284 likes · 1.2k views", color: ACCENT2,
  },
  {
    id: "02", title: "HANA BEAUTY CAMPAIGN", subtitle: "Pure Radiance",
    category: "BEAUTY COMMERCIAL", crew: "Thu Hà · Duy Anh",
    img: "https://images.unsplash.com/photo-1692318587239-75e0f05035ff?w=1400",
    stats: "512 likes · 3.4k views", color: ACCENT3,
  },
  {
    id: "03", title: "SÓNG GIÓ – MV", subtitle: "Cinematic Journey",
    category: "MUSIC VIDEO", crew: "Minh Khoa · Duy Anh",
    img: "https://images.unsplash.com/photo-1617452483350-987d0a68c62b?w=1400",
    stats: "390 likes · 2.8k views", color: ACCENT,
  },
];

const SERVICES = [
  "FASHION", "PHOTOGRAPHY", "FILMMAKING", "EDITORIAL",
  "BEAUTY", "COMMERCIAL", "MUSIC VIDEO", "PORTRAIT", "TVC",
];

const STATS = [
  { value: "1,284+", label: "Dự Án Hoàn Thành" },
  { value: "320+",   label: "Creative Talents"  },
  { value: "4.9★",   label: "Rating Trung Bình" },
  { value: "98%",    label: "Tỷ Lệ Thành Công"  },
];

const PROCESS = [
  { num: "01", title: "Đăng Dự Án",      desc: "Mô tả nhu cầu, ngân sách, thời gian. AI tự động gợi ý creator phù hợp nhất.", Icon: Camera  },
  { num: "02", title: "Chọn Talent",     desc: "Duyệt portfolio, đọc đánh giá và chat trực tiếp trước khi xác nhận booking.", Icon: Users   },
  { num: "03", title: "Sản Xuất",        desc: "Theo dõi tiến độ realtime, phê duyệt file và trao đổi trực tiếp với ekip.",   Icon: Video   },
  { num: "04", title: "Nhận Thành Phẩm", desc: "Review, yêu cầu chỉnh sửa và tải file chất lượng cao về máy trong 1 click.", Icon: Edit3   },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function RevealText({ children, delay = 0, className = "", style = {} }: {
  children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className} style={style}>
      {children}
    </motion.div>
  );
}

// ── Memoised Creator Card (perf optimisation only – no UI change) ─────────
const CreatorCard = memo(function CreatorCard({ c, i, hoveredCard, setHoveredCard }: {
  c: any; i: number; hoveredCard: string | null; setHoveredCard: (id: string | null) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.09, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
      <Link href={`/ho-so/${c.id}`} className="block group">
        <motion.div
          onHoverStart={() => setHoveredCard(c.id)}
          onHoverEnd={() => setHoveredCard(null)}
          whileHover={{ y: -10 }}
          transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative overflow-hidden rounded-2xl"
          style={{
            height: i % 2 === 0 ? 360 : 320,
            border: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.02)",
            boxShadow: hoveredCard === c.id ? `0 30px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.4)` : "0 4px 20px rgba(0,0,0,0.3)",
            transition: "box-shadow 0.4s ease",
          }}>

          {/* Image */}
          {c.img ? (
            <motion.img
              src={c.img} alt={c.name}
              className="absolute inset-0 w-full h-full object-cover"
              animate={{ scale: hoveredCard === c.id ? 1.1 : 1 }}
              transition={{ duration: 0.7 }} />
          ) : (
            <div className="absolute inset-0 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
          )}

          {/* Gradient veil */}
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(7,7,15,0.92) 0%, rgba(7,7,15,0.15) 55%, transparent 100%)" }} />

          {/* Hover: color tint */}
          <motion.div className="absolute inset-0"
            animate={{ opacity: hoveredCard === c.id ? 0.12 : 0 }}
            transition={{ duration: 0.4 }}
            style={{ background: `radial-gradient(circle at 50% 80%, ${ACCENT2}, transparent 60%)` }} />

          {/* Tag */}
          {c.tag && (
            <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full"
              style={{ background: TAG_GRADS[c.tag] || TAG_GRADS.Pro, fontSize: "8px", color: "white", fontWeight: 800, letterSpacing: "0.1em" }}>
              {c.tag}
            </div>
          )}

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div style={{ fontSize: "18px", fontWeight: 900, color: "white", letterSpacing: "-0.03em", lineHeight: 1.1 }}>{c.name}</div>
            <div className="flex items-center justify-between mt-2">
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>{c.role}</span>
              {c.rating > 0 && <span style={{ fontSize: "12px", color: "#F59E0B", fontWeight: 700 }}>★ {c.rating}</span>}
            </div>

            {/* Appear on hover */}
            <motion.div
              animate={{ opacity: hoveredCard === c.id ? 1 : 0, y: hoveredCard === c.id ? 0 : 10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between mt-3 pt-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{c.jobs} dự án</span>
              <span className="flex items-center gap-1" style={{ fontSize: "11px", color: ACCENT, fontWeight: 700 }}>
                Xem hồ sơ <ArrowRight size={11} />
              </span>
            </motion.div>
          </div>

          {/* Neon border on hover */}
          <motion.div
            animate={{ opacity: hoveredCard === c.id ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ boxShadow: "inset 0 0 0 1px rgba(99,102,241,0.55)" }} />
        </motion.div>
      </Link>
    </motion.div>
  );
});

// ── Main Component ────────────────────────────────────────────────────────────
export function HomePage({ initialCreators = [] }: { initialCreators?: Creator[] }) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const heroRef       = useRef<HTMLDivElement>(null);
  const [creators, setCreators]             = useState<Creator[]>(initialCreators);
  const [hoveredCol,  setHoveredCol]        = useState<string | null>(null);
  const [hoveredCard, setHoveredCard]       = useState<string | null>(null);
  const [loading, setLoading]               = useState(initialCreators.length === 0);

  useEffect(() => {
    if (initialCreators.length > 0) return;
    const fetchData = async () => {
      try {
        const data = await getCreators();
        if (data.length > 0) setCreators(data.slice(0, 6));
      } catch (err) {
        console.error("Failed to fetch creators", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [initialCreators]);

  const { scrollY } = useScroll();
  const heroY       = useTransform(scrollY, [0, 600], [0, -120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale   = useTransform(scrollY, [0, 500], [1, 0.94]);
  const img1Y       = useTransform(scrollY, [0, 600], [0, -60]);
  const img2Y       = useTransform(scrollY, [0, 600], [0, -30]);

  return (
    <div ref={containerRef} style={{ background: BG, minHeight: "100%", color: "white" }}>

      {/* ── keyframe styles ── */}
      <style>{`
        @keyframes marquee-slide {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        .marquee-track { animation: marquee-slide 28s linear infinite; }
        @keyframes float-a {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-14px); }
        }
        @keyframes float-b {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-10px); }
        }
        .float-a { animation: float-a 4s ease-in-out infinite; }
        .float-b { animation: float-b 5s ease-in-out infinite 0.8s; }
        @keyframes glow-pulse {
          0%,100% { opacity: 0.18; }
          50%      { opacity: 0.32; }
        }
        .glow-pulse { animation: glow-pulse 4s ease-in-out infinite; }
        @keyframes scroll-line {
          0%   { transform: translateY(-100%); opacity: 0; }
          30%  { opacity: 1; }
          70%  { opacity: 1; }
          100% { transform: translateY(200%); opacity: 0; }
        }
        .scroll-line { animation: scroll-line 2s ease-in-out infinite; }
        @keyframes grain {
          0%,100% { transform: translate(0,0); }
          10%  { transform: translate(-2%,-3%); }
          30%  { transform: translate(3%,-1%); }
          50%  { transform: translate(-1%,2%); }
          70%  { transform: translate(2%,3%); }
          90%  { transform: translate(-3%,1%); }
        }
        .grain-anim { animation: grain 8s steps(1) infinite; }
      `}</style>

      {/* ── Grain overlay (global, fixed) ── */}
      <div className="fixed inset-0 pointer-events-none z-[2] grain-anim" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        opacity: 0.032,
        mixBlendMode: "screen",
      }} />

      {/* ════════════════════════════════════════════════════════════
          HERO — Full viewport, cinematic split layout
      ════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col overflow-hidden">

        {/* Deep radial glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="glow-pulse absolute -top-1/4 -right-1/4 w-[900px] h-[900px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.55) 0%, transparent 60%)" }} />
          <div className="glow-pulse absolute -bottom-1/4 -left-1/4 w-[700px] h-[700px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(236,72,153,0.35) 0%, transparent 60%)", animationDelay: "2s" }} />
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)", backgroundSize: "52px 52px" }} />
          {/* Horizontal lines */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(transparent calc(100% - 1px), rgba(255,255,255,0.8) calc(100% - 1px))", backgroundSize: "100% 52px" }} />
        </div>

        {/* Hero content */}
        <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 flex flex-1 flex-col">

          {/* Top bar */}
          <div className="flex items-center justify-between px-8 lg:px-16 pt-10 pb-0">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full"
              style={{ border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.07)", backdropFilter: "blur(10px)" }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22C55E", boxShadow: "0 0 6px #22C55E" }} />
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", fontWeight: 700, letterSpacing: "0.14em" }}>
                NỀN TẢNG SẢN XUẤT NỘI DUNG #1 VIỆT NAM
              </span>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="hidden lg:flex items-center gap-6">
              {["Khám Phá", "Đặt Lịch", "Creators"].map((item) => (
                <Link key={item} href={item === "Đặt Lịch" ? "/dat-lich" : "/kham-pha"}>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.04em", cursor: "pointer" }}
                    className="hover:opacity-100 transition-opacity">{item}</span>
                </Link>
              ))}
            </motion.div>
          </div>

          {/* Main two-column */}
          <div className="flex-1 flex items-center px-8 lg:px-16 py-16">
            <div className="w-full grid lg:grid-cols-[1fr,420px] gap-16 xl:gap-24 items-center">

              {/* ── Left: Text ── */}
              <div>
                {/* Giant headline stacked */}
                <div className="space-y-1 mb-10">
                  {[
                    { text: "TẠO NÊN",  delay: 0,    style: { color: "white" }                                                                             },
                    { text: "NHỮNG GÌ", delay: 0.08, style: { color: "white" }                                                                             },
                    { text: "CHƯA AI",  delay: 0.16, style: { background: GRAD_HOT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" } },
                    { text: "DÁM LÀM.", delay: 0.24, style: { color: "transparent", WebkitTextStroke: "2px rgba(255,255,255,0.18)" }                        },
                  ].map(({ text, delay, style }) => (
                    <motion.div key={text}
                      initial={{ opacity: 0, y: 80, skewY: 3 }}
                      animate={{ opacity: 1, y: 0, skewY: 0 }}
                      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        fontSize: "clamp(4rem, 10vw, 9.5rem)",
                        fontWeight: 900,
                        lineHeight: 0.88,
                        letterSpacing: "-0.05em",
                        ...style,
                      }}>
                      {text}
                    </motion.div>
                  ))}
                </div>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
                  style={{ fontSize: "15px", color: "rgba(255,255,255,0.38)", lineHeight: 1.85, maxWidth: 440, marginBottom: 44 }}>
                  Kết nối doanh nghiệp với{" "}
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>nhiếp ảnh gia, model, editor</span>{" "}
                  và ekip sản xuất hàng đầu Việt Nam. Mọi thứ trong một nền tảng chuyên nghiệp.
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.8 }}
                  className="flex flex-wrap gap-4 mb-16">
                  <Link href="/dat-lich">
                    <motion.button
                      whileHover={{ scale: 1.04, boxShadow: "0 0 80px rgba(99,102,241,0.7), 0 0 160px rgba(168,85,247,0.3)" }}
                      whileTap={{ scale: 0.97 }}
                      className="relative flex items-center gap-3 px-8 py-4 rounded-2xl text-white overflow-hidden group"
                      style={{ background: GRAD, fontSize: "14px", fontWeight: 800, boxShadow: NEON, letterSpacing: "-0.01em" }}>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.18), transparent)" }} />
                      <Briefcase size={16} />
                      Bắt Đầu Dự Án
                      <ArrowRight size={16} />
                    </motion.button>
                  </Link>
                  <Link href="/kham-pha">
                    <motion.button
                      whileHover={{ borderColor: "rgba(255,255,255,0.4)", color: "rgba(255,255,255,1)" }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-3 px-8 py-4 rounded-2xl transition-all duration-300 group"
                      style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)", fontSize: "14px", fontWeight: 600 }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ border: "1px solid rgba(255,255,255,0.2)" }}>
                        <Play size={10} style={{ fill: "currentColor", marginLeft: 1 }} />
                      </div>
                      Xem Showreel
                    </motion.button>
                  </Link>
                </motion.div>

                {/* Stats row */}
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
                  className="grid grid-cols-4 gap-0"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 28 }}>
                  {STATS.map((s, i) => (
                    <motion.div key={s.label}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 + i * 0.06 }}
                      style={{ borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none", paddingRight: i < 3 ? "1.5rem" : 0, paddingLeft: i > 0 ? "1.5rem" : 0 }}>
                      <div style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.7rem)", fontWeight: 900, color: "white", letterSpacing: "-0.03em", lineHeight: 1 }}>
                        {s.value}
                      </div>
                      <div style={{ fontSize: "9.5px", color: "rgba(255,255,255,0.28)", marginTop: 5, letterSpacing: "0.08em", fontWeight: 600, textTransform: "uppercase" }}>
                        {s.label}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* ── Right: Stacked Images ── */}
              <motion.div
                initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="hidden lg:flex flex-col gap-4">

                {/* Main tall image */}
                <motion.div style={{ y: img1Y, height: 320, border: "1px solid rgba(255,255,255,0.07)" }}
                  className="relative overflow-hidden rounded-3xl group">
                  <img src="https://images.unsplash.com/photo-1767049603596-79204ada5273?w=900" alt=""
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,7,15,0.75) 0%, transparent 55%)" }} />
                  {/* Live badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                    style={{ background: "rgba(239,68,68,0.85)", backdropFilter: "blur(8px)" }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white" style={{ boxShadow: "0 0 4px white" }} />
                    <span style={{ fontSize: "8px", color: "white", fontWeight: 800, letterSpacing: "0.12em" }}>LIVE PRODUCTION</span>
                  </div>
                  <div className="absolute bottom-5 left-5">
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", fontWeight: 600, letterSpacing: "0.12em", marginBottom: 3 }}>FASHION EDITORIAL</div>
                    <div style={{ fontSize: "15px", color: "white", fontWeight: 800, letterSpacing: "-0.02em" }}>BST Thu Đông 2024</div>
                  </div>
                  {/* Hover neon border */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ boxShadow: "inset 0 0 0 1px rgba(99,102,241,0.6)", borderRadius: 24 }} />
                </motion.div>

                {/* Two smaller images */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { src: "https://images.unsplash.com/photo-1596029658179-ddca27260f25?w=500", label: "PORTRAIT" },
                    { src: "https://images.unsplash.com/photo-1764593605393-e7c44d74b677?w=500", label: "STUDIO" },
                  ].map(({ src, label }, idx) => (
                    <motion.div key={label} style={{ y: img2Y, height: 170, border: "1px solid rgba(255,255,255,0.07)" }}
                      className="relative overflow-hidden rounded-2xl group">
                      <img src={src} alt={label}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0" style={{ background: "rgba(7,7,15,0.35)" }} />
                      <div className="absolute bottom-3 left-3">
                        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: "0.12em" }}>{label}</div>
                      </div>
                      {/* Tag */}
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-full"
                        style={{ background: idx === 0 ? "rgba(168,85,247,0.8)" : "rgba(99,102,241,0.8)", backdropFilter: "blur(6px)", fontSize: "8px", color: "white", fontWeight: 700, letterSpacing: "0.1em" }}>
                        {idx === 0 ? "ELITE" : "PRO"}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Floating stat card */}
                <motion.div
                  className="float-b relative px-5 py-4 rounded-2xl flex items-center gap-4"
                  style={{
                    background: "rgba(15,15,28,0.9)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    boxShadow: "0 8px 40px rgba(99,102,241,0.15)",
                  }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: GRAD }}>
                    <TrendingUp size={18} className="text-white" />
                  </div>
                  <div>
                    <div style={{ fontSize: "20px", fontWeight: 900, color: "white", letterSpacing: "-0.03em", lineHeight: 1 }}>1,284+</div>
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginTop: 3, letterSpacing: "0.06em" }}>DỰ ÁN HOÀN THÀNH</div>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                    style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)" }}>
                    <TrendingUp size={10} style={{ color: "#22C55E" }} />
                    <span style={{ fontSize: "11px", color: "#22C55E", fontWeight: 700 }}>+24%</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
            <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.22em", fontWeight: 700 }}>SCROLL</span>
            <div className="w-px h-14 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
              <div className="scroll-line w-full h-1/2 rounded-full" style={{ background: GRAD }} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SERVICES MARQUEE
      ════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden py-5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.015)" }}>
        <div className="flex gap-0 whitespace-nowrap marquee-track">
          {[...SERVICES, ...SERVICES, ...SERVICES].map((s, i) => (
            <span key={i} className="inline-flex items-center gap-8 px-8">
              <span style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em" }}>{s}</span>
              <span style={{ color: "rgba(99,102,241,0.5)", fontSize: "6px" }}>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          FEATURED COLLECTIONS — Art-gallery editorial layout
      ════════════════════════════════════════════════════════════ */}
      <section className="px-6 lg:px-16 py-36">
        <div className="max-w-7xl mx-auto">

          {/* Section header */}
          <div className="flex items-end justify-between mb-24">
            <div>
              <RevealText>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-px" style={{ background: GRAD }} />
                  <span style={{ fontSize: "10px", color: ACCENT, fontWeight: 700, letterSpacing: "0.22em" }}>FEATURED COLLECTIONS</span>
                </div>
              </RevealText>
              <RevealText delay={0.1}>
                <h2 style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)", fontWeight: 900, color: "white", lineHeight: 0.92, letterSpacing: "-0.04em" }}>
                  Những Tác Phẩm<br />
                  <span style={{ background: GRAD_HOT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    Nổi Bật.
                  </span>
                </h2>
              </RevealText>
            </div>
            <Link href="/kham-pha">
              <motion.div whileHover={{ x: 5 }}
                className="hidden lg:flex items-center gap-2"
                style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em", cursor: "pointer" }}>
                XEM TẤT CẢ <ArrowRight size={13} />
              </motion.div>
            </Link>
          </div>

          {/* Collection cards */}
          <div className="space-y-5">
            {COLLECTIONS.map((col, i) => (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 70 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 1, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                onHoverStart={() => setHoveredCol(col.id)}
                onHoverEnd={() => setHoveredCol(null)}
                className="relative overflow-hidden rounded-3xl cursor-pointer"
                style={{
                  height: "clamp(260px, 32vw, 420px)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: hoveredCol === col.id ? `0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px ${col.color}30` : "0 8px 40px rgba(0,0,0,0.3)",
                  transition: "box-shadow 0.5s ease",
                }}>

                {/* Image with parallax zoom */}
                <motion.div className="absolute inset-0"
                  animate={{ scale: hoveredCol === col.id ? 1.08 : 1 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
                  <img src={col.img} alt={col.title} className="w-full h-full object-cover" />
                </motion.div>

                {/* Base dark overlay */}
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(105deg, rgba(7,7,15,0.88) 0%, rgba(7,7,15,0.3) 50%, rgba(7,7,15,0.7) 100%)" }} />

                {/* Color bleed on hover */}
                <motion.div className="absolute inset-0"
                  animate={{ opacity: hoveredCol === col.id ? 0.18 : 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ background: `radial-gradient(ellipse at 25% 50%, ${col.color}, transparent 65%)` }} />

                {/* Top accent line */}
                <motion.div className="absolute top-0 left-0 right-0 h-px"
                  animate={{ scaleX: hoveredCol === col.id ? 1 : 0, opacity: hoveredCol === col.id ? 1 : 0 }}
                  style={{ background: `linear-gradient(to right, transparent, ${col.color}, transparent)`, transformOrigin: "left" }}
                  transition={{ duration: 0.6 }} />

                {/* Main content */}
                <div className="absolute inset-0 flex items-center p-10 lg:p-16">
                  <div className="flex-1">
                    {/* Ghost number */}
                    <motion.div
                      animate={{ x: hoveredCol === col.id ? 0 : -20, opacity: hoveredCol === col.id ? 0.6 : 0.2 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        fontSize: "clamp(4rem, 11vw, 9rem)", fontWeight: 900, lineHeight: 1,
                        color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.15)",
                        letterSpacing: "-0.06em", marginBottom: "-0.1em",
                      }}>
                      {col.id}
                    </motion.div>

                    {/* Category badge */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-5 h-px" style={{ background: col.color }} />
                      <span style={{ fontSize: "9px", color: col.color, fontWeight: 700, letterSpacing: "0.22em" }}>{col.category}</span>
                    </div>

                    {/* Title */}
                    <h3 style={{
                      fontSize: "clamp(1.5rem, 4vw, 3rem)", fontWeight: 900,
                      color: "white", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 8,
                    }}>
                      {col.title}
                    </h3>
                    <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.38)", fontStyle: "italic" }}>{col.subtitle}</div>
                  </div>

                  {/* Right meta — reveal on hover */}
                  <motion.div
                    animate={{ opacity: hoveredCol === col.id ? 1 : 0, x: hoveredCol === col.id ? 0 : 30 }}
                    transition={{ duration: 0.45 }}
                    className="hidden lg:flex flex-col items-end gap-5">
                    <div className="text-right">
                      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em", marginBottom: 5 }}>EKIP SẢN XUẤT</div>
                      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{col.crew}</div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em", marginBottom: 5 }}>ENGAGEMENT</div>
                      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{col.stats}</div>
                    </div>
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", fontSize: "12px", color: "white", fontWeight: 700 }}>
                      Xem Chi Tiết <ArrowUpRight size={14} />
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FEATURED CREATORS — Film-noir portrait style
      ════════════════════════════════════════════════════════════ */}
      <section className="px-6 lg:px-16 py-28"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.012)" }}>
        <div className="max-w-7xl mx-auto">

          <div className="flex items-end justify-between mb-20">
            <div>
              <RevealText>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-px" style={{ background: `linear-gradient(to right, ${ACCENT2}, ${ACCENT3})` }} />
                  <span style={{ fontSize: "10px", color: ACCENT2, fontWeight: 700, letterSpacing: "0.22em" }}>TALENT ROSTER</span>
                </div>
              </RevealText>
              <RevealText delay={0.1}>
                <h2 style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", fontWeight: 900, color: "white", letterSpacing: "-0.04em", lineHeight: 0.95 }}>
                  Gặp Gỡ Các<br />
                  <span style={{ background: `linear-gradient(135deg, ${ACCENT2}, ${ACCENT3})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    Nghệ Sĩ.
                  </span>
                </h2>
              </RevealText>
            </div>
            <Link href="/kham-pha">
              <motion.div whileHover={{ x: 5 }}
                className="hidden lg:flex items-center gap-2"
                style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em" }}>
                XEM TẤT CẢ <ArrowRight size={13} />
              </motion.div>
            </Link>
          </div>

          {/* Creator grid — asymmetric heights */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(creators.length > 0
              ? creators
              : Array.from({ length: 4 }, (_, i) => ({ id: `sk${i}`, name: "", role: "", jobs: 0, rating: 0, img: "", tag: "Pro", skeleton: true }))
            ).map((c: any, i) => (
              <CreatorCard key={c.id} c={c} i={i} hoveredCard={hoveredCard} setHoveredCard={setHoveredCard} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          STUDIO MANIFESTO — Full-bleed bold typography
      ════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 lg:px-16 py-48 overflow-hidden"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)", background: "rgba(99,102,241,0.02)" }}>

        {/* Giant ghost watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <div style={{
            fontSize: "clamp(8rem, 26vw, 22rem)", fontWeight: 900,
            color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.025)",
            letterSpacing: "-0.06em", whiteSpace: "nowrap",
          }}>
            STUDIO
          </div>
        </div>

        {/* Orbs */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none opacity-20"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 60%)" }} />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="flex items-center justify-center gap-4 mb-16">
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(99,102,241,0.4))" }} />
            <span style={{ fontSize: "9px", color: ACCENT, fontWeight: 700, letterSpacing: "0.26em", whiteSpace: "nowrap" }}>TRIẾT LÝ CỦA CHÚNG TÔI</span>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(99,102,241,0.4))" }} />
          </motion.div>

          {/* Manifesto lines */}
          <div className="text-center space-y-2">
            {[
              { text: "Chúng tôi không chỉ",         size: "clamp(1.6rem,4.5vw,3.5rem)", solid: true,  grad: false },
              { text: "sản xuất nội dung.",            size: "clamp(2rem,6vw,5rem)",       solid: false, grad: false, outline: true },
              { text: "Chúng tôi tạo ra",              size: "clamp(1.6rem,4.5vw,3.5rem)", solid: true,  grad: false },
              { text: "những khoảnh khắc bất tử.",    size: "clamp(2rem,5.5vw,4.5rem)",   solid: false, grad: true  },
            ].map(({ text, size, solid, grad, outline }, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.13, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: size,
                  fontWeight: 900,
                  lineHeight: 1.05,
                  letterSpacing: "-0.03em",
                  color: grad ? "transparent" : solid ? "white" : "transparent",
                  WebkitTextStroke: outline ? "1px rgba(255,255,255,0.25)" : "none",
                  background: grad ? GRAD_HOT : "none",
                  WebkitBackgroundClip: grad ? "text" : "initial",
                  backgroundClip: grad ? "text" : "initial",
                }}>
                {text}
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 }}
            className="text-center mt-14"
            style={{ fontSize: "15px", color: "rgba(255,255,255,0.3)", lineHeight: 1.9, maxWidth: 500, margin: "56px auto 0" }}>
            Từ một bức ảnh thời trang đến một MV triệu views — mỗi dự án là một tác phẩm nghệ thuật được đầu tư kỹ lưỡng với đội ngũ tài năng nhất Việt Nam.
          </motion.p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          PROCESS — Minimal dark timeline
      ════════════════════════════════════════════════════════════ */}
      <section className="px-6 lg:px-16 py-32"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-24">
            <RevealText>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-px" style={{ background: `linear-gradient(to right, ${ACCENT3}, ${ACCENT2})` }} />
                <span style={{ fontSize: "10px", color: ACCENT3, fontWeight: 700, letterSpacing: "0.22em" }}>QUY TRÌNH LÀM VIỆC</span>
              </div>
            </RevealText>
            <RevealText delay={0.1}>
              <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)", fontWeight: 900, color: "white", letterSpacing: "-0.04em", lineHeight: 0.95, maxWidth: 600 }}>
                4 Bước.<br />
                <span style={{ color: "rgba(255,255,255,0.25)" }}>Từ Ý Tưởng Đến Thành Phẩm.</span>
              </h2>
            </RevealText>
          </div>

          {/* Steps */}
          <div className="grid lg:grid-cols-4 gap-0">
            {PROCESS.map(({ num, title, desc, Icon }, i) => (
              <motion.div key={num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="relative group"
                style={{
                  padding: "40px",
                  paddingLeft: i === 0 ? 0 : "40px",
                  borderRight: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                }}>

                {/* Ghost step number */}
                <div style={{
                  fontSize: "clamp(3.5rem,7vw,5.5rem)", fontWeight: 900, lineHeight: 1,
                  color: "transparent", WebkitTextStroke: "1px rgba(99,102,241,0.2)",
                  letterSpacing: "-0.05em", marginBottom: "0.4rem",
                }}>
                  {num}
                </div>

                {/* Icon */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-6"
                  style={{ border: "1px solid rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.07)" }}>
                  <Icon size={18} style={{ color: ACCENT }} />
                </div>

                <h3 style={{ fontSize: "17px", fontWeight: 800, color: "white", marginBottom: 12, letterSpacing: "-0.02em" }}>
                  {title}
                </h3>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", lineHeight: 1.75 }}>{desc}</p>

                {/* Arrow connector */}
                {i < 3 && (
                  <div className="absolute -right-3 top-14 z-10 hidden lg:block">
                    <ChevronRight size={16} style={{ color: "rgba(99,102,241,0.35)" }} />
                  </div>
                )}

                {/* Bottom hover line */}
                <motion.div
                  className="absolute bottom-0 left-0 h-px"
                  style={{ background: GRAD, transformOrigin: "left" }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CTA — Cinematic full-bleed closer
      ════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 lg:px-16 py-48 overflow-hidden"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>

        {/* Cinematic background image */}
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1764593605944-754460a44314?w=1800" alt=""
            className="w-full h-full object-cover" style={{ opacity: 0.18 }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #07070F 0%, rgba(7,7,15,0.6) 50%, #07070F 100%)" }} />
        </div>

        {/* Glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none opacity-30"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 60%)" }} />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <RevealText>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-10"
              style={{ border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)", backdropFilter: "blur(12px)" }}>
              <Sparkles size={12} style={{ color: ACCENT }} />
              <span style={{ fontSize: "10px", color: ACCENT, fontWeight: 700, letterSpacing: "0.18em" }}>SẴN SÀNG KHỞI ĐẦU?</span>
            </div>
          </RevealText>

          <RevealText delay={0.1}>
            <h2 style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)", fontWeight: 900, lineHeight: 0.92, letterSpacing: "-0.04em", marginBottom: 24 }}>
              Tạo Nên Tác Phẩm<br />
              <span style={{ background: GRAD_HOT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Của Riêng Bạn.
              </span>
            </h2>
          </RevealText>

          <RevealText delay={0.2}>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.35)", lineHeight: 1.85, maxWidth: 480, margin: "0 auto 48px" }}>
              Hàng trăm creator đang chờ hợp tác. Đặt lịch ngay hôm nay và nhận tư vấn miễn phí trong 24h.
            </p>
          </RevealText>

          <RevealText delay={0.3}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/dat-lich">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 80px rgba(99,102,241,0.6)" }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-3 px-10 py-5 rounded-2xl text-white"
                  style={{ background: GRAD, fontSize: "15px", fontWeight: 800, boxShadow: NEON }}>
                  <Briefcase size={18} />
                  Bắt Đầu Ngay
                  <ArrowRight size={18} />
                </motion.button>
              </Link>
              <Link href="/kham-pha">
                <motion.button
                  whileHover={{ borderColor: "rgba(255,255,255,0.3)" }}
                  className="flex items-center gap-2 px-8 py-5 rounded-2xl"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: "14px", fontWeight: 600 }}>
                  Khám Phá Creators
                </motion.button>
              </Link>
            </div>
          </RevealText>
        </div>
      </section>

    </div>
  );
}