"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield, Briefcase, DollarSign, Settings, RefreshCw,
  Users, FileText, Zap, PieChart, Layout, Layers,
  Globe, Check, Trash2, ArrowUpRight, ArrowDownRight,
  TrendingUp, Activity, Search, ChevronRight, Star, 
  BarChart2, Download, User, Lock
} from "lucide-react";
import { useFeatures, type Features } from "../context/FeatureContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import {
  getAllBookings, updateBookingStatus as kvUpdateStatus,
  getAnalytics, getAllUsers, type UserProfile,
  getBlogPosts, approveBlogPost, deleteBlogPost, type BlogPost,
  getPendingUsers,
} from "../lib/localApi";

// ── Design Tokens ─────────────────────────────────────────────────────────
const GRAD    = "linear-gradient(135deg, #6366F1, #A855F7)";
const GRAD_G  = "linear-gradient(135deg, #10B981, #3B82F6)";
const GRAD_P  = "linear-gradient(135deg, #EC4899, #8B5CF6)";
const GRAD_W  = "linear-gradient(135deg, #F59E0B, #EF4444)";

const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.07)",
};

const FEATURE_LIST: { key: keyof Features; label: string; desc: string; phase: number; icon: string }[] = [
  { key: "payment",            label: "Hệ Thống Thanh Toán",   desc: "Kết nối ví điện tử, ngân hàng & chuyển khoản trực tiếp", phase: 2, icon: "💳" },
  { key: "rankSystem",         label: "Xếp Hạng Creator",      desc: "Hệ thống badge Newbie/Rising/Pro/Elite tự động", phase: 2, icon: "⭐" },
  { key: "fileApproval",       label: "Duyệt File Dự Án",      desc: "Workflow phê duyệt file 1:1 giữa client và creator", phase: 2, icon: "📁" },
  { key: "advancedChat",       label: "Chat Threading",        desc: "Reply thread, @mention và reaction trong cuộc trò chuyện", phase: 2, icon: "💬" },
  { key: "bookingNegotiation", label: "Thương Lượng Giá",      desc: "Counter-offer và điều chỉnh giá khi gửi booking", phase: 2, icon: "🤝" },
  { key: "publicMarketplace",  label: "Marketplace Công Khai", desc: "Đăng ký và đặt lịch không cần mời trực tiếp", phase: 2, icon: "🌐" },
];

const NAV_SECTIONS = [
  { id: "overview",  label: "Tổng Quan",      icon: Layout },
  { id: "analytics", label: "Analytics",      icon: BarChart2 },
  { id: "features",  label: "Tính Năng",      icon: Zap },
  { id: "users",     label: "Người Dùng",     icon: Users },
  { id: "bookings",  label: "Công Việc",      icon: Briefcase },
  { id: "blogs",     label: "Phê Duyệt Blog", icon: FileText },
  { id: "finance",   label: "Tài Chính",      icon: DollarSign },
];

// ── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, trend, Icon, gradient, delay }: { label: string; value: string | number; trend?: number; Icon: any; gradient: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="relative rounded-[2rem] p-7 overflow-hidden group cursor-pointer"
      style={GLASS}
    >
      {/* Background glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]"
        style={{ background: gradient.replace("linear-gradient(135deg,", "linear-gradient(135deg,").replace(")", ", transparent)"), opacity: 0.05 }} />
      <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full blur-[60px] opacity-20 group-hover:opacity-50 transition-opacity duration-700"
        style={{ background: gradient }} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: gradient }}>
            <Icon size={22} className="text-white" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black ${trend >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>
              {trend >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="text-4xl font-black tracking-tighter mb-1.5">{value}</div>
        <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.18em]">{label}</div>
      </div>
    </motion.div>
  );
}

function BarChart({ data, colorA, colorB }: { data: any[]; colorA: string; colorB: string }) {
  const maxVal = Math.max(...data.flatMap(d => [d.jobs || 0, d.users || 0]), 1);
  const H = 180;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: H + 32 }}>
      {data.map((d, i) => (
        <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 4 }}>
            {/* Jobs bar */}
            <div style={{ flex: 1, height: H, display: "flex", alignItems: "flex-end" }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: Math.max(4, ((d.jobs || 0) / maxVal) * H) }}
                transition={{ delay: 0.05 + i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="w-full rounded-t-lg relative group/bar"
                style={{ background: colorA, minHeight: 4 }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[9px] font-black px-2 py-1 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {d.jobs} jobs
                </div>
              </motion.div>
            </div>
            {/* Users bar */}
            <div style={{ flex: 1, height: H, display: "flex", alignItems: "flex-end" }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: Math.max(4, ((d.users || 0) / maxVal) * H) }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="w-full rounded-t-lg relative group/bar"
                style={{ background: colorB, minHeight: 4 }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[9px] font-black px-2 py-1 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {d.users} users
                </div>
              </motion.div>
            </div>
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 10, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>{d.month}</div>
        </div>
      ))}
    </div>
  );
}

function RevenueChart({ data }: { data: any[] }) {
  const maxVal = Math.max(...data.map(d => d.revenue || 0), 1);
  const H = 180;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: H + 32 }}>
      {data.map((d, i) => (
        <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ flex: 1, height: H, display: "flex", alignItems: "flex-end" }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: Math.max(4, ((d.revenue || 0) / maxVal) * H) }}
              transition={{ delay: 0.05 + i * 0.08, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="w-full rounded-t-xl relative group/bar"
              style={{ background: GRAD_P, boxShadow: "0 0 20px rgba(168,85,247,0.25)", minHeight: 4 }}>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[9px] font-black px-2 py-1 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {d.revenue}M₫
              </div>
            </motion.div>
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 10, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>{d.month}</div>
        </div>
      ))}
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <motion.button onClick={onToggle} whileTap={{ scale: 0.9 }}
      className="relative w-14 h-7 rounded-full transition-all flex-shrink-0 shadow-inner"
      style={{ background: on ? GRAD : "rgba(255,255,255,0.08)" }}>
      <motion.div
        animate={{ x: on ? 29 : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md" />
    </motion.button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function AdminPage() {
  const { features, toggleFeature } = useFeatures();
  const { user: admin, isAuthInitialized } = useAuth();
  const [section, setSection]   = useState("overview");
  const [loading, setLoading]   = useState(false);

  const [allUsers, setAllUsers]           = useState<UserProfile[]>([]);
  const [bookings, setBookings]           = useState<any[]>([]);
  const [blogs, setBlogs]                 = useState<BlogPost[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);

  const fetchData = () => {
    setLoading(true);
    try {
      setBookings(getAllBookings());
      setAnalyticsData(getAnalytics());
      setAllUsers(getAllUsers());
      setBlogs(getBlogPosts());
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [isAuthInitialized]);

  const { totalRev, pendingCount, blogsCount } = useMemo(() => ({
    totalRev: bookings.filter(b => b.status === "completed").reduce((s, b) => s + (Number(b.price) || 0), 0),
    pendingCount: bookings.filter(b => b.status === "pending").length,
    blogsCount: blogs.filter(b => b.status === "pending").length,
  }), [bookings, blogs]);

  const stats = useMemo(() => [
    { label: "Tổng Bookings", value: bookings.length, trend: 12, Icon: Briefcase, gradient: GRAD },
    { label: "Revenue (M₫)", value: `${(totalRev / 1_000_000).toFixed(1)}M`, trend: 8, Icon: DollarSign, gradient: GRAD_G },
    { label: "Creators", value: allUsers.length, trend: 15, Icon: Users, gradient: GRAD_P },
    { label: "Pending Posts", value: blogsCount, trend: blogsCount > 0 ? -5 : 0, Icon: FileText, gradient: GRAD_W },
  ], [bookings, totalRev, allUsers, blogsCount]);

  const handleUpdateStatus = (id: string, status: string) => {
    kvUpdateStatus(id, status as any);
    fetchData();
    toast.success("✅ Cập nhật trạng thái thành công!");
  };

  const handleApproveBlog = (id: string) => {
    approveBlogPost(id);
    fetchData();
    toast.success("🚀 Bài viết đã được xuất bản!");
  };

  const handleDeleteBlog = (id: string) => {
    deleteBlogPost(id);
    fetchData();
    toast.error("Đã xóa bài viết khỏi hệ thống");
  };

  return (
    <div style={{ background: "#070710", minHeight: "100%", color: "white" }}>
      {/* Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-100px] right-[10%] w-[700px] h-[700px] rounded-full opacity-[0.12] blur-[120px]"
          style={{ background: "radial-gradient(circle, #6366F1 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-[-100px] w-[500px] h-[500px] rounded-full opacity-[0.08] blur-[100px]"
          style={{ background: "radial-gradient(circle, #A855F7 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 p-8 pt-10">
        <div className="max-w-7xl mx-auto">

          {/* ── HEADER ── */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
                style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)" }}>
                <Shield size={12} className="text-indigo-400" />
                <span className="text-[11px] font-black text-indigo-400 tracking-[0.2em] uppercase">Control Center</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-black tracking-tighter leading-none mb-3">
                STUDIO<span className="text-indigo-500">BOOK</span>
                <span className="text-white/15 mx-2">/</span>
                <span>ADMIN</span>
              </h1>
              <p className="text-white/35 text-sm font-medium max-w-lg leading-relaxed">
                Hệ thống quản trị tập trung cho StudioBook Vietnam. Toàn quyền kiểm soát nền tảng.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="flex items-center gap-4 p-5 rounded-[2rem]" style={GLASS}>
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-indigo-500/30 flex items-center justify-center"
                  style={{ background: GRAD }}>
                  {admin?.avatar
                    ? <img src={admin.avatar} alt="" className="w-full h-full object-cover" />
                    : <Shield size={22} className="text-white" />
                  }
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-[3px] border-[#070710]" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black">{admin?.name || "System Admin"}</div>
                <div className="text-[10px] font-black text-indigo-400 tracking-[0.15em] uppercase mt-0.5">Master Key Access</div>
              </div>
              <motion.button onClick={fetchData} whileHover={{ rotate: 180 }} transition={{ duration: 0.4 }}
                className="ml-4 w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors">
                <RefreshCw size={16} className={`text-white/40 ${loading ? "animate-spin" : ""}`} />
              </motion.button>
            </motion.div>
          </div>

          {/* ── NAVIGATION ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex gap-2 mb-12 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none" }}>
            <div className="flex gap-2 p-2 rounded-[2rem] flex-shrink-0 w-full" style={GLASS}>
              {NAV_SECTIONS.map(s => {
                const active = section === s.id;
                const alertDot = (s.id === "blogs" && blogsCount > 0) || (s.id === "bookings" && pendingCount > 0);
                return (
                  <button key={s.id} onClick={() => setSection(s.id)}
                    className="relative flex items-center gap-2.5 px-5 py-3.5 rounded-[1.5rem] transition-all whitespace-nowrap"
                    style={{
                      background: active ? GRAD : "transparent",
                      color: active ? "white" : "rgba(255,255,255,0.35)",
                      boxShadow: active ? "0 8px 30px rgba(99,102,241,0.3)" : "none",
                      fontWeight: active ? 800 : 500,
                      fontSize: "12px",
                    }}>
                    <s.icon size={15} />
                    {s.label}
                    {alertDot && !active && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#EF4444]" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* ── SECTION CONTENT ── */}
          <AnimatePresence mode="wait">
            <motion.div key={section}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>

              {/* OVERVIEW */}
              {section === "overview" && (
                <div className="space-y-8">
                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {stats.map((st, i) => <StatCard key={st.label} {...st} delay={i * 0.08} />)}
                  </div>

                  {/* Charts + Quick Actions */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 p-8 rounded-[2.5rem]" style={GLASS}>
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-xl font-black mb-1">Growth Engine</h3>
                          <p className="text-white/30 text-xs">Booking & User 6 tháng gần nhất</p>
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full shadow-[0_0_8px_#6366F1]" style={{ background: "#6366F1" }} />
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-wider">Booking</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full shadow-[0_0_8px_#A855F7]" style={{ background: "#A855F7" }} />
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-wider">Users</span>
                          </div>
                        </div>
                      </div>
                      <BarChart data={analyticsData} colorA="#6366F1" colorB="#A855F7" />
                    </div>

                    <div className="p-8 rounded-[2.5rem] flex flex-col" style={GLASS}>
                      <h3 className="text-xl font-black mb-6">Quick Actions</h3>
                      <div className="space-y-2 flex-1">
                        {[
                          { label: "Mời Creator VIP", icon: User, color: "#6366F1" },
                          { label: "Xuất Báo Cáo Tài Chính", icon: Download, color: "#10B981" },
                          { label: "Dọn Dẹp Cache", icon: RefreshCw, color: "#8B5CF6" },
                          { label: "Cấu Hình Hệ Thống", icon: Settings, color: "#F59E0B" },
                          { label: "Xem Audit Logs", icon: Activity, color: "#EC4899" },
                        ].map(a => (
                          <motion.button key={a.label} whileHover={{ x: 8, background: "rgba(255,255,255,0.05)" }}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: `${a.color}18`, color: a.color }}>
                              <a.icon size={16} />
                            </div>
                            <span className="text-sm font-semibold text-white/70 group-hover:text-white/90 transition-colors flex-1">{a.label}</span>
                            <ChevronRight size={14} className="text-white/20 group-hover:text-white/40 transition-colors" />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* System Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                      { label: "Platform Health", value: "99.8%", color: "#22C55E", status: "OPERATIONAL" },
                      { label: "API Response", value: "32ms", color: "#6366F1", status: "OPTIMAL" },
                      { label: "Data Integrity", value: "100%", color: "#A855F7", status: "VERIFIED" },
                    ].map(s => (
                      <div key={s.label} className="p-6 rounded-[2rem] flex items-center justify-between" style={GLASS}>
                        <div>
                          <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">{s.label}</div>
                          <div className="text-2xl font-black">{s.value}</div>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest"
                          style={{ background: `${s.color}15`, color: s.color }}>
                          {s.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ANALYTICS */}
              {section === "analytics" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-8 rounded-[2.5rem]" style={GLASS}>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.15)" }}>
                          <TrendingUp size={18} className="text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black">Revenue Spectrum</h3>
                          <p className="text-white/30 text-xs">Doanh thu gộp theo tháng (Triệu ₫)</p>
                        </div>
                      </div>
                      <RevenueChart data={analyticsData} />
                    </div>

                    <div className="p-8 rounded-[2.5rem]" style={GLASS}>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)" }}>
                          <Activity size={18} className="text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black">User Growth Flux</h3>
                          <p className="text-white/30 text-xs">Số booking & người dùng mới mỗi tháng</p>
                        </div>
                      </div>
                      <BarChart data={analyticsData} colorA="#6366F1" colorB="#10B981" />
                    </div>
                  </div>

                  {/* Analytics summary */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { label: "Avg Revenue/Mo", value: `${analyticsData.length > 0 ? (analyticsData.reduce((s,d) => s + d.revenue, 0) / analyticsData.length).toFixed(1) : 0}M₫`, color: GRAD_P },
                      { label: "Total Bookings", value: bookings.length, color: GRAD },
                      { label: "Completion Rate", value: `${bookings.length > 0 ? Math.round(bookings.filter(b => b.status === "completed").length / bookings.length * 100) : 0}%`, color: GRAD_G },
                      { label: "Platform GMV", value: `${(totalRev / 1_000_000).toFixed(0)}M₫`, color: GRAD_W },
                    ].map((m, i) => (
                      <motion.div key={m.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                        className="p-6 rounded-[2rem]" style={GLASS}>
                        <div className="text-[10px] font-black text-white/25 uppercase tracking-widest mb-3">{m.label}</div>
                        <div className="text-3xl font-black" style={{ background: m.color, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                          {m.value}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* FEATURES */}
              {section === "features" && (
                <div>
                  <div className="mb-8">
                    <h2 className="text-2xl font-black mb-2">Phase 2 Feature Flags</h2>
                    <p className="text-white/30 text-sm">Bật / tắt tính năng theo từng giai đoạn phát triển nền tảng.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {FEATURE_LIST.map((f, i) => (
                      <motion.div key={f.key}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        whileHover={{ y: -4 }}
                        className="p-7 rounded-[2rem] group transition-all" style={GLASS}>
                        <div className="flex items-start justify-between mb-5">
                          <div className="text-4xl">{f.icon}</div>
                          <Toggle on={features[f.key]} onToggle={() => { toggleFeature(f.key); toast.success(`${f.label} ${features[f.key] ? "tắt" : "bật"}`); }} />
                        </div>
                        <h3 className="text-base font-black mb-2">{f.label}</h3>
                        <p className="text-white/30 text-xs leading-relaxed mb-5">{f.desc}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Phase {f.phase}</span>
                          <span className="text-[10px] font-black px-3 py-1 rounded-full"
                            style={{ background: features[f.key] ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.05)", color: features[f.key] ? "#22C55E" : "rgba(255,255,255,0.2)" }}>
                            {features[f.key] ? "● ACTIVE" : "LOCKED"}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* USERS */}
              {section === "users" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black">Platform Creators <span className="text-white/20 ml-2 font-light text-lg">{allUsers.length}</span></h2>
                      <p className="text-white/30 text-sm mt-1">Toàn bộ người dùng đã đăng ký trên hệ thống</p>
                    </div>
                    <div className="relative max-w-xs">
                      <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                      <input type="text" placeholder="Tìm kiếm..." 
                        className="w-full pl-11 pr-4 py-3 rounded-2xl outline-none text-sm"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }} />
                    </div>
                  </div>

                  {allUsers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {allUsers.map((u, i) => (
                        <motion.div key={u.id}
                          initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                          whileHover={{ y: -6 }}
                          className="p-6 rounded-[2rem] text-center group relative overflow-hidden" style={GLASS}>
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]"
                            style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, transparent 100%)" }} />
                          <div className="relative z-10">
                            <div className="relative inline-block mb-4">
                              <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=4F46E5&color=fff`}
                                className="w-18 h-18 w-[72px] h-[72px] rounded-2xl object-cover border-2 border-transparent group-hover:border-indigo-500/40 transition-colors" />
                              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-xl flex items-center justify-center border-2 border-[#070710]"
                                style={{ background: GRAD }}>
                                <Check size={10} className="text-white" />
                              </div>
                            </div>
                            <h4 className="text-sm font-black mb-1 truncate">{u.name || "Unknown"}</h4>
                            <p className="text-[11px] text-white/30 mb-4 truncate">{u.email || "no email"}</p>
                            <div className="inline-flex px-3 py-1.5 rounded-full text-[10px] font-black tracking-wide"
                              style={{ background: "rgba(99,102,241,0.12)", color: "#818CF8" }}>
                              {u.role || "Creator"}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center rounded-[2rem]" style={GLASS}>
                      <Users size={48} className="mx-auto mb-4 text-white/10" />
                      <p className="text-white/30 font-bold">Chưa có người dùng nào đăng ký.</p>
                      <p className="text-white/15 text-sm mt-1">Người dùng sẽ xuất hiện ở đây sau khi đăng nhập.</p>
                    </div>
                  )}
                </div>
              )}

              {/* BOOKINGS */}
              {section === "bookings" && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-2xl font-black">Live Projects <span className="text-white/20 ml-2 font-light text-lg">{bookings.length}</span></h2>
                      <p className="text-white/30 text-sm mt-1">{pendingCount} booking đang chờ xác nhận</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {[{label: "Tất Cả", val: ""}, {label: "Pending", val: "pending"}, {label: "Confirmed", val: "confirmed"}, {label: "Done", val: "completed"}].map(f => (
                        <button key={f.val} className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:bg-white/10"
                          style={{ color: "rgba(255,255,255,0.4)" }}>{f.label}</button>
                      ))}
                    </div>
                  </div>

                  {bookings.length > 0 ? (
                    <div className="space-y-3">
                      {bookings.map((b, i) => {
                        const statusMeta: Record<string, { color: string; bg: string; label: string }> = {
                          pending:   { color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  label: "Chờ xử lý" },
                          confirmed: { color: "#6366F1", bg: "rgba(99,102,241,0.1)",  label: "Xác nhận" },
                          completed: { color: "#22C55E", bg: "rgba(34,197,94,0.1)",   label: "Hoàn thành" },
                          cancelled: { color: "#EF4444", bg: "rgba(239,68,68,0.1)",   label: "Đã huỷ" },
                        };
                        const meta = statusMeta[b.status] || statusMeta.pending;
                        return (
                          <motion.div key={b.id}
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                            className="p-5 rounded-[1.75rem] flex flex-col sm:flex-row sm:items-center gap-5 group hover:bg-white/3 transition-all"
                            style={{ ...GLASS }}>
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                              style={{ background: "rgba(99,102,241,0.1)" }}>
                              <Briefcase size={18} className="text-indigo-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-black mb-0.5 truncate">{b.serviceTitle}</div>
                              <div className="text-[11px] text-white/35 font-medium">
                                <span className="text-white/50">{b.userName}</span>
                                <span className="text-white/20 mx-2">→</span>
                                <span className="text-white/50">{b.creatorName}</span>
                                <span className="text-white/20 mx-2">·</span>
                                {b.date}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right hidden sm:block">
                                <div className="text-sm font-black text-emerald-400">{(Number(b.price) || 0).toLocaleString()}₫</div>
                              </div>
                              <div className="px-3 py-1.5 rounded-xl text-[10px] font-black"
                                style={{ background: meta.bg, color: meta.color }}>
                                {meta.label}
                              </div>
                              <select value={b.status}
                                onChange={e => handleUpdateStatus(b.id, e.target.value)}
                                className="rounded-xl px-3 py-2 text-[11px] font-bold outline-none cursor-pointer transition-all"
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                                <option value="pending">⏳ Chờ xử lý</option>
                                <option value="confirmed">✅ Xác nhận</option>
                                <option value="completed">🎉 Hoàn thành</option>
                                <option value="cancelled">❌ Từ chối</option>
                              </select>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-20 text-center rounded-[2rem]" style={GLASS}>
                      <Briefcase size={48} className="mx-auto mb-4 text-white/10" />
                      <p className="text-white/30 font-bold">Chưa có booking nào trong hệ thống.</p>
                    </div>
                  )}
                </div>
              )}

              {/* BLOG APPROVAL */}
              {section === "blogs" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black mb-1">Phê Duyệt Blog Posts</h2>
                    <p className="text-white/30 text-sm">
                      {blogsCount > 0
                        ? <span className="text-amber-400 font-bold">{blogsCount} bài viết đang chờ phê duyệt của Admin.</span>
                        : "Tất cả bài viết đã được xét duyệt."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {blogs.map((b, i) => (
                      <motion.div key={b.id}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className="rounded-[2rem] overflow-hidden group" style={GLASS}>
                        <div className="relative h-52 overflow-hidden">
                          <img src={b.img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,7,16,0.9) 0%, rgba(7,7,16,0.2) 60%, transparent 100%)" }} />
                          <div className="absolute top-4 right-4">
                            <span className="px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest backdrop-blur-sm"
                              style={{
                                background: b.status === "published" ? "rgba(34,197,94,0.8)" : "rgba(245,158,11,0.8)",
                                color: "white",
                              }}>
                              {b.status === "published" ? "PUBLISHED" : "PENDING"}
                            </span>
                          </div>
                          <div className="absolute bottom-4 left-5 right-5">
                            <div className="text-[10px] font-black text-indigo-400 mb-1 tracking-widest uppercase">{b.category}</div>
                            <h4 className="text-base font-black leading-snug line-clamp-2">{b.title}</h4>
                          </div>
                        </div>
                        <div className="p-5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={b.avatar} alt="" className="w-10 h-10 rounded-xl object-cover" />
                            <div>
                              <div className="text-[12px] font-black">{b.author}</div>
                              <div className="text-[10px] text-white/30">{b.date} · {b.readTime}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {b.status === "pending" && (
                              <motion.button onClick={() => handleApproveBlog(b.id)}
                                whileHover={{ scale: 1.05, boxShadow: "0 8px 24px rgba(99,102,241,0.4)" }}
                                whileTap={{ scale: 0.95 }}
                                className="px-5 py-2.5 rounded-xl text-[11px] font-black tracking-wide text-white"
                                style={{ background: GRAD }}>
                                DUYỆT ĐĂNG
                              </motion.button>
                            )}
                            <motion.button onClick={() => handleDeleteBlog(b.id)}
                              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-rose-500 group/del"
                              style={{ background: "rgba(239,68,68,0.1)" }}>
                              <Trash2 size={15} className="text-rose-400 group-hover/del:text-white transition-colors" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {blogs.length === 0 && (
                    <div className="py-20 text-center rounded-[2rem]" style={GLASS}>
                      <FileText size={48} className="mx-auto mb-4 text-white/10" />
                      <p className="text-white/30 font-bold">Chưa có bài viết nào trong hệ thống.</p>
                    </div>
                  )}
                </div>
              )}

              {/* FINANCE */}
              {section === "finance" && (
                <div className="space-y-8">
                  {/* Hero Revenue Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    className="relative p-16 rounded-[3rem] text-center overflow-hidden"
                    style={{ background: GRAD, boxShadow: "0 40px 100px rgba(99,102,241,0.35)" }}>
                    {/* Animated pulse rings */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {[1, 2, 3].map(r => (
                        <motion.div key={r} className="absolute rounded-full border border-white/10"
                          animate={{ scale: [1, 1.5 + r * 0.3], opacity: [0.3, 0] }}
                          transition={{ duration: 3, repeat: Infinity, delay: r * 0.8, ease: "easeOut" }}
                          style={{ width: 200, height: 200 }} />
                      ))}
                    </div>
                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 mb-6">
                        <Globe size={14} className="text-white" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Global Ecosystem Revenue</span>
                      </div>
                      <div className="text-6xl lg:text-7xl font-black tracking-tighter mb-4">
                        {totalRev.toLocaleString("vi-VN")}₫
                      </div>
                      <div className="text-white/60 text-sm font-bold uppercase tracking-widest">
                        Tổng Giao Dịch · StudioBook Vietnam
                      </div>
                    </div>
                  </motion.div>

                  {/* Finance Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                      { label: "Phí Dịch Vụ (15%)", value: totalRev * 0.15, color: "#6366F1", Icon: DollarSign },
                      { label: "Chờ Thanh Toán", value: bookings.filter(b => b.status === "confirmed").reduce((s, b) => s + (Number(b.price) || 0), 0), color: "#F59E0B", Icon: Activity },
                      { label: "Dự Phòng Thuế (5%)", value: totalRev * 0.05, color: "#EF4444", Icon: Lock },
                    ].map((m, i) => (
                      <motion.div key={m.label}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -4 }}
                        className="p-8 rounded-[2rem]" style={GLASS}>
                        <div className="flex items-center justify-between mb-5">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${m.color}15`, color: m.color }}>
                            <m.Icon size={18} />
                          </div>
                        </div>
                        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">{m.label}</div>
                        <div className="text-2xl font-black" style={{ color: m.color }}>
                          {m.value.toLocaleString("vi-VN")}₫
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Monthly Revenue Trend */}
                  <div className="p-8 rounded-[2.5rem]" style={GLASS}>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.15)" }}>
                        <BarChart2 size={18} className="text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black">Monthly Revenue Trend</h3>
                        <p className="text-white/30 text-xs">Biểu đồ doanh thu 6 tháng gần nhất (Triệu ₫)</p>
                      </div>
                    </div>
                    <RevenueChart data={analyticsData} />
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-white/[0.04] text-center">
            <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest">
              StudioBook Vietnam · Master Control · v2.0.0 · Encrypted Connection
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}