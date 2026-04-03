"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Briefcase, Clock, CheckCircle2, AlertCircle, Users, Calendar,
  ChevronRight, ChevronLeft, TrendingUp, Sparkles, ArrowRight, Loader2,
  DollarSign, BarChart2, Filter, RefreshCw, Eye
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getUserBookings, getAllBookings, updateBookingStatus } from "../lib/localApi";
import { toast } from "sonner";

const GRAD   = "linear-gradient(135deg, #6366F1, #A855F7)";
const GRAD_H = "linear-gradient(135deg, #4F46E5 0%, #7C3AED 45%, #EC4899 100%)";
const NEON   = "0 0 30px rgba(99,102,241,0.3)";
const CARD   = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };

const VI_DAYS   = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const VI_MONTHS = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

const STATUS_CFG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  pending:   { color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  icon: AlertCircle,  label: "Chờ Xử Lý"  },
  confirmed: { color: "#6366F1", bg: "rgba(99,102,241,0.1)",  icon: Clock,        label: "Đã Xác Nhận" },
  completed: { color: "#22C55E", bg: "rgba(34,197,94,0.1)",   icon: CheckCircle2, label: "Hoàn Thành"  },
  cancelled: { color: "#EF4444", bg: "rgba(239,68,68,0.1)",   icon: AlertCircle,  label: "Đã Huỷ"      },
};

const TABS = ["Tất Cả", "Chờ Xử Lý", "Đã Xác Nhận", "Hoàn Thành"];

// ── Mini Calendar ──────────────────────────────────────────────────────────────
function MiniCalendar({ bookings, onDayClick, selectedDay }: {
  bookings: any[];
  onDayClick: (d: string) => void;
  selectedDay: string;
}) {
  const today = new Date();
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const toStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const todayStr = toStr(today);

  // Build a set of dates with bookings
  const bookedDates = new Set(bookings.map(b => b.date).filter(Boolean));

  return (
    <div className="p-4 rounded-2xl" style={CARD}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <motion.button onClick={() => setView(new Date(year, month - 1, 1))}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.05)" }}>
          <ChevronLeft size={13} style={{ color: "rgba(255,255,255,0.5)" }} />
        </motion.button>
        <span style={{ fontSize: "13px", fontWeight: 700 }}>{VI_MONTHS[month]} {year}</span>
        <motion.button onClick={() => setView(new Date(year, month + 1, 1))}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.05)" }}>
          <ChevronRight size={13} style={{ color: "rgba(255,255,255,0.5)" }} />
        </motion.button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {VI_DAYS.map(d => (
          <div key={d} className="text-center" style={{ fontSize: "9px", color: "rgba(255,255,255,0.22)", fontWeight: 700, padding: "2px 0" }}>{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={`e-${i}`} className="aspect-square" />;
          const ds = toStr(d);
          const isToday = ds === todayStr;
          const hasBooking = bookedDates.has(ds);
          const isSel = ds === selectedDay;
          return (
            <motion.button key={i} onClick={() => onDayClick(isSel ? "" : ds)}
              whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
              className="aspect-square flex flex-col items-center justify-center rounded-lg relative transition-all"
              style={{
                fontSize: "11px",
                fontWeight: isSel ? 800 : isToday ? 700 : 400,
                background: isSel ? GRAD : isToday ? "rgba(99,102,241,0.15)" : "transparent",
                color: isSel ? "white" : isToday ? "#6366F1" : "rgba(255,255,255,0.6)",
                boxShadow: isSel ? "0 2px 12px rgba(99,102,241,0.35)" : "none",
              }}>
              {d.getDate()}
              {hasBooking && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: isSel ? "rgba(255,255,255,0.8)" : "#6366F1" }} />
              )}
            </motion.button>
          );
        })}
      </div>

      {selectedDay && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={() => onDayClick("")}
          className="w-full mt-3 py-1.5 rounded-xl text-center transition-all"
          style={{ border: "1px solid rgba(255,255,255,0.08)", fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
          Xoá bộ lọc ngày
        </motion.button>
      )}
    </div>
  );
}

// ── Trend Sparkline ───────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const w = 60, h = 24;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
      <circle cx={(data.length - 1) / (data.length - 1) * w} cy={h - (data[data.length - 1] / max) * h}
        r={2.5} fill={color} />
    </svg>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function JobDashboardPage({ initialBookings = [] }: { initialBookings?: any[] }) {
  const { accessToken, isLoggedIn, user } = useAuth();
  const [bookings, setBookings]   = useState<any[]>(initialBookings);
  const [loading,  setLoading]    = useState(initialBookings.length === 0 && isLoggedIn);
  const [tab, setTab]             = useState("Tất Cả");
  const [selectedDay, setSelectedDay] = useState("");
  const [view, setView]           = useState<"list" | "analytics">("list");

  const fetchBookings = async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const data = await getUserBookings(user?.id || "user");
      setBookings(data);
    } catch (e) {
      setBookings([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { 
    if (initialBookings.length === 0 && isLoggedIn) fetchBookings(); 
  }, [accessToken, user?.id, isLoggedIn]);

  const filtered = bookings.filter(b => {
    const statusOk = tab === "Tất Cả" ? true
      : tab === "Chờ Xử Lý"   ? b.status === "pending"
      : tab === "Đã Xác Nhận" ? b.status === "confirmed"
      : b.status === "completed";
    const dayOk = !selectedDay || b.date === selectedDay;
    return statusOk && dayOk;
  });

  const stats = [
    { label: "Tổng Dự Án",  value: bookings.length,                                  color: "#6366F1", icon: Briefcase,   trend: [2,4,3,5,6,8,bookings.length], sub: "Tất cả thời gian" },
    { label: "Chờ Xử Lý",   value: bookings.filter(b => b.status === "pending").length,   color: "#F59E0B", icon: Clock,       trend: [1,2,1,3,2,4,bookings.filter(b=>b.status==="pending").length], sub: "Cần phản hồi" },
    { label: "Hoàn Thành",  value: bookings.filter(b => b.status === "completed").length,  color: "#22C55E", icon: CheckCircle2,trend: [0,1,1,2,3,3,bookings.filter(b=>b.status==="completed").length], sub: "Tỷ lệ thành công" },
    { label: "Đã Xác Nhận", value: bookings.filter(b => b.status === "confirmed").length,  color: "#A855F7", icon: Users,       trend: [0,1,0,1,2,2,bookings.filter(b=>b.status==="confirmed").length], sub: "Sắp thực hiện" },
  ];

  // Budget total
  const totalBudget = bookings.filter(b => b.status === "completed")
    .reduce((sum, b) => {
      const v = parseFloat((b.budget || "0").toString().replace(/\D/g, ""));
      return sum + (isNaN(v) ? 0 : v);
    }, 0);

  const handleQuickStatus = (id: string, status: string) => {
    try {
      updateBookingStatus(id, status as any);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      const labels: Record<string, string> = { confirmed: "✅ Đã xác nhận", completed: "🎉 Hoàn thành", cancelled: "❌ Đã huỷ" };
      toast.success(labels[status] || "Đã cập nhật");
    } catch { toast.error("Có lỗi xảy ra"); }
  };

  return (
    <div style={{ background: "#07070F", minHeight: "100%", color: "white" }}>
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -right-20 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-end justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
                style={{ border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)" }}>
                <Sparkles size={10} style={{ color: "#6366F1" }} />
                <span style={{ fontSize: "10.5px", color: "#6366F1", fontWeight: 700, letterSpacing: "0.12em" }}>DASHBOARD</span>
              </div>
              <h1 style={{ fontSize: "clamp(1.5rem,4vw,2.2rem)", fontWeight: 900, letterSpacing: "-0.03em" }}>
                Quản Lý{" "}
                <span style={{ background: GRAD_H, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Công Việc
                </span>
              </h1>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px", marginTop: 4 }}>
                {isLoggedIn ? `Xin chào, ${user?.name}!` : "Đăng nhập để xem booking của bạn"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button onClick={fetchBookings} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl"
                style={{ ...CARD, fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} style={{ color: "#6366F1" }} /> Làm mới
              </motion.button>
              <motion.button onClick={() => setView(view === "analytics" ? "list" : "analytics")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl"
                style={{ ...CARD, fontSize: "13px", fontWeight: 600 }}>
                <BarChart2 size={14} /> {view === "analytics" ? "Danh Sách" : "Thống Kê"}
              </motion.button>
              <Link href="/dat-lich">
                <motion.button whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(99,102,241,0.45)" }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white"
                  style={{ background: GRAD, fontSize: "13px", fontWeight: 700, boxShadow: NEON }}>
                  <Plus size={14} /> Tạo Dự Án
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(({ label, value, color, icon: Icon, trend, sub }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="p-5 rounded-2xl relative overflow-hidden" style={CARD}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  {!loading && <Sparkline data={trend} color={color} />}
                  {loading && <Loader2 size={12} style={{ color: "rgba(255,255,255,0.2)" }} className="animate-spin mt-1.5" />}
                </div>
                <div style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 900, color, letterSpacing: "-0.04em", lineHeight: 1 }}>
                  {loading ? "–" : value}
                </div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: 4, fontWeight: 600, letterSpacing: "0.06em" }}>
                  {label.toUpperCase()}
                </div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", marginTop: 2 }}>{sub}</div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full opacity-20"
                  style={{ background: `radial-gradient(circle, ${color}, transparent)`, filter: "blur(12px)" }} />
              </motion.div>
            ))}
          </div>

          {/* Revenue highlight */}
          {totalBudget > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl flex items-center gap-4 mb-6"
              style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(34,197,94,0.15)" }}>
                <DollarSign size={18} style={{ color: "#22C55E" }} />
              </div>
              <div className="flex-1">
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>Tổng Doanh Thu Đã Hoàn Thành</div>
                <div style={{ fontSize: "22px", fontWeight: 900, color: "#22C55E", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                  {totalBudget.toLocaleString("vi-VN")}₫
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <TrendingUp size={12} style={{ color: "#22C55E" }} />
                <span style={{ fontSize: "12px", color: "#22C55E", fontWeight: 700 }}>+24%</span>
              </div>
            </motion.div>
          )}

          {/* Main content: two-col on large screens */}
          {view === "list" ? (
          <div className="flex gap-6 flex-col lg:flex-row">
            {/* Left: booking list */}
            <div className="flex-1 min-w-0">
              {/* Tabs + View toggle */}
              <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                  {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                      className="px-4 py-2 rounded-xl flex-shrink-0 transition-all"
                      style={{
                        background: tab === t ? GRAD : "rgba(255,255,255,0.04)",
                        border: tab === t ? "none" : "1px solid rgba(255,255,255,0.08)",
                        color: tab === t ? "white" : "rgba(255,255,255,0.5)",
                        fontSize: "12.5px", fontWeight: tab === t ? 700 : 500,
                        boxShadow: tab === t ? NEON : "none",
                      }}>
                      {t}
                      {t !== "Tất Cả" && !loading && (
                        <span className="ml-1.5 text-xs opacity-60">
                          ({t === "Chờ Xử Lý" ? bookings.filter(b => b.status === "pending").length
                          : t === "Đã Xác Nhận" ? bookings.filter(b => b.status === "confirmed").length
                          : bookings.filter(b => b.status === "completed").length})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {selectedDay && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                    style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", fontSize: "11px", color: "#6366F1", fontWeight: 700 }}>
                    <Calendar size={11} />
                    {new Date(selectedDay + "T00:00:00").toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                  </div>
                )}
              </div>

              {/* Loading */}
              {loading && (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-24 rounded-2xl animate-pulse" style={CARD}>
                      <div className="h-full flex items-center px-5 gap-4">
                        <div className="w-10 h-10 rounded-xl" style={{ background: "rgba(99,102,241,0.1)" }} />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-1/3 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
                          <div className="h-3 w-1/2 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty */}
              {!loading && filtered.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20 rounded-3xl" style={CARD}>
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
                    style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
                    <Briefcase size={32} style={{ color: "#6366F1", opacity: 0.6 }} />
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: 8 }}>
                    {selectedDay ? "Không có dự án trong ngày này" : "Chưa có dự án nào"}
                  </h3>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px", marginBottom: 20 }}>
                    {isLoggedIn ? "Tạo dự án đầu tiên để bắt đầu hành trình sáng tạo!" : "Đăng nhập để xem dự án của bạn"}
                  </p>
                  <Link href="/dat-lich">
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white"
                      style={{ background: GRAD, fontSize: "14px", fontWeight: 700, boxShadow: NEON }}>
                      <Plus size={15} /> Tạo Dự Án Mới
                    </motion.button>
                  </Link>
                </motion.div>
              )}

              {/* List */}
              {!loading && filtered.length > 0 && (
                <div className="space-y-3">
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.22)", paddingLeft: 2, marginBottom: 4 }}>
                    {filtered.length} dự án {selectedDay ? `· ngày ${new Date(selectedDay + "T00:00:00").toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit" })}` : ""}
                  </p>
                  <AnimatePresence>
                    {filtered.map((b, i) => {
                      const cfg = STATUS_CFG[b.status] || STATUS_CFG.pending;
                      const StatusIcon = cfg.icon;
                      const createdAt = new Date(b.createdAt);
                      return (
                        <motion.div key={b.id}
                          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: i * 0.04 }}
                          className="p-4 rounded-2xl group transition-all"
                          style={CARD}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}>

                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ background: cfg.bg, border: `1px solid ${cfg.color}20` }}>
                              <StatusIcon size={17} style={{ color: cfg.color }} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span style={{ fontSize: "14px", fontWeight: 700 }}>{b.serviceTitle || "Không có tiêu đề"}</span>
                                <span className="px-2 py-0.5 rounded-md"
                                  style={{ background: cfg.bg, fontSize: "10px", color: cfg.color, fontWeight: 700, border: `1px solid ${cfg.color}25` }}>
                                  {cfg.label}
                                </span>
                                {b.packageName && (
                                  <span className="px-2 py-0.5 rounded-md"
                                    style={{ background: "rgba(168,85,247,0.1)", fontSize: "10px", color: "#A855F7", fontWeight: 600 }}>
                                    Gói {b.packageName}
                                  </span>
                                )}
                                {b.jobType && (
                                  <span className="px-2 py-0.5 rounded-md hidden sm:inline"
                                    style={{ background: "rgba(99,102,241,0.1)", fontSize: "10px", color: "#6366F1", fontWeight: 600 }}>
                                    {b.jobType}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 flex-wrap mb-2">
                                {b.location && <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>📍 {b.location}</span>}
                                {b.date && (
                                  <div className="flex items-center gap-1">
                                    <Calendar size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
                                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>{b.date}</span>
                                    {b.time && <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>lúc {b.time}</span>}
                                  </div>
                                )}
                                {b.price && (
                                  <span style={{ fontSize: "12px", color: "#22C55E", fontWeight: 700 }}>
                                    {parseInt(b.price.replace(/\D/g, "") || "0").toLocaleString("vi-VN")}₫
                                  </span>
                                )}
                                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.18)" }}>
                                  {createdAt.toLocaleDateString("vi-VN")}
                                </span>
                              </div>

                              {/* Quick actions for pending */}
                              {b.status === "pending" && (
                                <div className="flex gap-2 mt-1">
                                  <motion.button onClick={() => handleQuickStatus(b.id, "confirmed")}
                                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg"
                                    style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", fontSize: "11px", color: "#22C55E", fontWeight: 700 }}>
                                    <CheckCircle2 size={11} /> Xác Nhận
                                  </motion.button>
                                  <motion.button onClick={() => handleQuickStatus(b.id, "cancelled")}
                                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg"
                                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", fontSize: "11px", color: "#EF4444", fontWeight: 700 }}>
                                    Huỷ
                                  </motion.button>
                                </div>
                              )}

                              {b.status === "confirmed" && (
                                <motion.button onClick={() => handleQuickStatus(b.id, "completed")}
                                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                  className="flex items-center gap-1 mt-1 px-3 py-1.5 rounded-lg"
                                  style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", fontSize: "11px", color: "#6366F1", fontWeight: 700 }}>
                                  <CheckCircle2 size={11} /> Đánh Dấu Hoàn Thành
                                </motion.button>
                              )}
                            </div>

                            <Link href={`/cong-viec/${b.id}`}>
                              <motion.div whileHover={{ x: 3 }}
                                className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                                style={{ fontSize: "11px", color: "#6366F1", fontWeight: 700 }}>
                                <Eye size={13} /> Chi Tiết
                              </motion.div>
                            </Link>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Right: mini calendar + quick stats */}
            <div className="lg:w-72 flex-shrink-0 space-y-4">
              {/* Mini Calendar */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={13} style={{ color: "#6366F1" }} />
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>
                    LỊCH BOOKING
                  </span>
                </div>
                <MiniCalendar bookings={bookings} onDayClick={setSelectedDay} selectedDay={selectedDay} />
              </div>

              {/* Activity summary */}
              <div className="p-4 rounded-2xl" style={CARD}>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 size={13} style={{ color: "#6366F1" }} />
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>
                    TỶ LỆ TRẠNG THÁI
                  </span>
                </div>
                {Object.entries(STATUS_CFG).map(([key, cfg]) => {
                  const count = bookings.filter(b => b.status === key).length;
                  const pct = bookings.length ? Math.round((count / bookings.length) * 100) : 0;
                  return (
                    <div key={key} className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.45)" }}>{cfg.label}</span>
                        <span style={{ fontSize: "11.5px", color: cfg.color, fontWeight: 700 }}>{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                        <motion.div className="h-full rounded-full" style={{ background: cfg.color }}
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick links */}
              <div className="p-4 rounded-2xl space-y-2" style={CARD}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", marginBottom: 6 }}>
                  TRUY CẬP NHANH
                </div>
                {[
                  { to: "/dat-lich",  label: "Tạo Dự Án Mới",    icon: Plus,      color: "#6366F1" },
                  { to: "/kham-pha",  label: "Tìm Creator",       icon: Users,     color: "#A855F7" },
                  { to: "/dich-vu",   label: "Xem Portfolio",     icon: Eye,       color: "#EC4899" },
                  { to: "/tin-nhan",  label: "Nhắn Tin Creator",  icon: ArrowRight, color: "#F59E0B" },
                ].map(({ to, label, icon: Icon, color }) => (
                  <Link key={to} href={to}>
                    <motion.div whileHover={{ x: 3 }}
                      className="flex items-center gap-3 py-2.5 px-1 transition-all group"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}15`, border: `1px solid ${color}20` }}>
                        <Icon size={13} style={{ color }} />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.55)", flex: 1 }}>{label}</span>
                      <ChevronRight size={12} style={{ color: "rgba(255,255,255,0.2)" }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl" style={CARD}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Thống Kê Dự Án (6 Tháng)</h3>
                    <BarChart2 size={16} style={{ color: "#6366F1" }} />
                  </div>
                  <div className="flex items-end gap-3 h-40">
                    {[
                      { month: "T7", val: 3 },
                      { month: "T8", val: 5 },
                      { month: "T9", val: 4 },
                      { month: "T10", val: 7 },
                      { month: "T11", val: 9 },
                      { month: "T12", val: bookings.length || 1 },
                    ].map((d) => (
                      <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <motion.div initial={{ height: 0 }} animate={{ height: `${(d.val / Math.max(9, bookings.length)) * 100}%` }}
                          className="w-full max-w-[28px] rounded-t-lg" style={{ background: GRAD, opacity: 0.85 }} />
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{d.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl" style={CARD}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Tỷ Lệ Hoàn Thành</h3>
                    <CheckCircle2 size={16} style={{ color: "#22C55E" }} />
                  </div>
                  <div className="flex items-center justify-center h-40">
                    <div className="relative w-36 h-36">
                      <svg width="144" height="144" viewBox="0 0 144 144" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="72" cy="72" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="18" />
                        <motion.circle cx="72" cy="72" r="54" fill="none" stroke="#22C55E" strokeWidth="18" strokeLinecap="round"
                          initial={{ strokeDasharray: "0 400" }}
                          animate={{ strokeDasharray: `${(bookings.filter(b => b.status === "completed").length / Math.max(1, bookings.length)) * 339.29} 400` }}
                          transition={{ duration: 1 }} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span style={{ fontSize: "20px", fontWeight: 800, color: "white" }}>
                          {Math.round((bookings.filter(b => b.status === "completed").length / Math.max(1, bookings.length)) * 100)}%
                        </span>
                        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Thành công</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
