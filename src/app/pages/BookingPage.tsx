"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar, MapPin, Briefcase, DollarSign, Upload, CheckCircle, Lock,
  ChevronDown, ChevronRight, ChevronLeft, Star, ArrowLeft, Sparkles,
  Loader2, Clock, Users, Zap, Crown, Shield
} from "lucide-react";
import { useFeatures } from "../context/FeatureContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { getCreators, createBooking } from "../lib/localApi";

// ── Tokens ────────────────────────────────────────────────────────────────────
const BG   = "#07070F";
const GRAD = "linear-gradient(135deg, #6366F1, #A855F7)";
const NEON = "0 0 40px rgba(99,102,241,0.35)";
const CARD = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };
const INPUT = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)", fontSize: "14px" };

// ── Data ──────────────────────────────────────────────────────────────────────
const PACKAGES = [
  {
    id: "basic", name: "Cơ Bản", price: 1500000, duration: "4 giờ",
    icon: Zap, color: "#6B7280", glowColor: "rgba(107,114,128,0.3)",
    tag: "Khởi Đầu", tagColor: "#6B7280",
    features: ["1 Creator chuyên nghiệp", "4 giờ shooting", "20 ảnh đã retouch", "Giao file trong 7 ngày", "1 lần chỉnh sửa"],
    recommended: false,
  },
  {
    id: "pro", name: "Chuyên Nghiệp", price: 3500000, duration: "8 giờ",
    icon: Shield, color: "#6366F1", glowColor: "rgba(99,102,241,0.35)",
    tag: "Phổ Biến Nhất", tagColor: "#6366F1",
    features: ["2–3 Creators", "8 giờ shooting (cả ngày)", "50 ảnh đã retouch cao cấp", "Giao file trong 3 ngày", "3 lần chỉnh sửa", "Color grading chuyên nghiệp"],
    recommended: true,
  },
  {
    id: "elite", name: "Elite", price: 8000000, duration: "Cả ngày + hậu kỳ",
    icon: Crown, color: "#D97706", glowColor: "rgba(217,119,6,0.3)",
    tag: "Cao Cấp Nhất", tagColor: "#D97706",
    features: ["Full Team (4–6 người)", "Shooting không giới hạn", "100+ ảnh + video highlight", "Giao file trong 2 ngày", "Chỉnh sửa không giới hạn", "Color grading điện ảnh", "BTS video 2–3 phút"],
    recommended: false,
  },
];

const LOCATIONS = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Hội An", "Phú Quốc", "Địa điểm khác"];
const JOB_TYPES = ["Chụp Ảnh Thời Trang", "Quay MV Ca Nhạc", "TVC Thương Mại", "Chụp Ảnh Sản Phẩm", "Chụp Ảnh Sự Kiện", "Khác"];

const TIME_SLOTS = {
  morning:   { label: "Buổi Sáng",  times: ["08:00", "09:00", "10:00", "11:00"] },
  afternoon: { label: "Buổi Chiều", times: ["13:00", "14:00", "15:00", "16:00"] },
  evening:   { label: "Buổi Tối",   times: ["17:00", "18:00", "19:00"] },
};

const VI_DAYS  = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const VI_MONTHS = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

const STEPS = [
  { num: 1, label: "Gói Dịch Vụ" },
  { num: 2, label: "Ngày & Giờ" },
  { num: 3, label: "Chọn Creator" },
  { num: 4, label: "Chi Tiết" },
  { num: 5, label: "Xác Nhận" },
];

// ── Calendar Component ────────────────────────────────────────────────────────
function CalendarPicker({ selected, onSelect }: { selected: string; onSelect: (d: string) => void }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const toStr = (d: Date) => d.toISOString().split("T")[0];
  const isDisabled = (d: Date) => d < today;
  const isSelected = (d: Date) => toStr(d) === selected;
  const isToday    = (d: Date) => toStr(d) === toStr(today);

  const prevMonth = () => setViewMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setViewMonth(new Date(year, month + 1, 1));

  return (
    <div className="rounded-2xl overflow-hidden" style={CARD}>
      {/* Month nav */}
      <div className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <motion.button onClick={prevMonth} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
          <ChevronLeft size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
        </motion.button>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>
          {VI_MONTHS[month]} {year}
        </span>
        <motion.button onClick={nextMonth} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
          <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
        </motion.button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-4 pt-3 pb-1">
        {VI_DAYS.map(d => (
          <div key={d} className="text-center" style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", fontWeight: 700, letterSpacing: "0.05em" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 px-4 pb-4 gap-y-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`e-${i}`} />;
          const disabled = isDisabled(d);
          const sel = isSelected(d);
          const tod = isToday(d);
          return (
            <motion.button key={i} onClick={() => !disabled && onSelect(toStr(d))}
              whileHover={!disabled ? { scale: 1.15 } : {}}
              whileTap={!disabled ? { scale: 0.9 } : {}}
              className="aspect-square flex items-center justify-center rounded-xl transition-all relative"
              style={{
                fontSize: "13px",
                fontWeight: sel ? 800 : tod ? 700 : 500,
                background: sel ? GRAD : tod && !sel ? "rgba(99,102,241,0.12)" : "transparent",
                color: sel ? "white" : disabled ? "rgba(255,255,255,0.15)" : tod ? "#6366F1" : "rgba(255,255,255,0.7)",
                cursor: disabled ? "not-allowed" : "pointer",
                boxShadow: sel ? NEON : "none",
              }}>
              {d.getDate()}
              {tod && !sel && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: "#6366F1" }} />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main ─���────────────────────────────────────────────────────────────────────
export function BookingPage() {
  const { features } = useFeatures();
  const { isLoggedIn, setShowAuthModal, setAuthTab, user } = useAuth();

  const [step, setStep]             = useState(1);
  const [submitted, setSubmitted]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [creators, setCreators]     = useState<any[]>([]);
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);

  // Form state
  const [selectedPackage, setSelectedPackage]   = useState("");
  const [selectedDate, setSelectedDate]         = useState("");
  const [selectedTime, setSelectedTime]         = useState("");
  const [form, setForm] = useState({
    title: "", location: "", jobType: "", budget: "",
    description: "", negotiationPrice: "",
  });

  useEffect(() => {
    setCreators(getCreators().slice(0, 6));
  }, []);

  const pkg = PACKAGES.find(p => p.id === selectedPackage);

  const toggleCreator = (id: string) => {
    const max = selectedPackage === "basic" ? 1 : selectedPackage === "pro" ? 3 : 6;
    setSelectedCreators(prev =>
      prev.includes(id) ? prev.filter(c => c !== id)
      : prev.length < max ? [...prev, id] : prev
    );
  };

  const canNext = (): boolean => {
    if (step === 1) return !!selectedPackage;
    if (step === 2) return !!selectedDate && !!selectedTime;
    if (step === 3) return selectedCreators.length > 0;
    if (step === 4) return !!(form.title && form.location && form.jobType && form.description);
    return true;
  };

  const handleNext = () => {
    if (!canNext()) {
      const msgs = ["Vui lòng chọn gói dịch vụ", "Vui lòng chọn ngày và giờ", "Vui lòng chọn ít nhất 1 creator", "Vui lòng điền đầy đủ thông tin"];
      toast.error(msgs[step - 1] || "Vui lòng hoàn thành bước này");
      return;
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) { setAuthTab("login"); setShowAuthModal(true); toast.info("Vui lòng đăng nhập để đặt lịch"); return; }
    setIsSubmitting(true);
    try {
      const selectedCreatorData = creators.filter(c => selectedCreators.includes(c.id));
      const firstCreator = selectedCreatorData[0];
      createBooking({
        userId: user?.id || "anonymous",
        userName: user?.name || "Khách",
        userEmail: user?.email || "",
        creatorId: firstCreator?.id || "",
        creatorName: firstCreator?.name || "",
        creatorRole: firstCreator?.role || "",
        creatorImg: firstCreator?.img || "",
        serviceTitle: form.title,
        price: pkg ? String(pkg.price) : form.budget,
        date: selectedDate,
        time: selectedTime,
        duration: pkg?.duration || "",
        note: form.description,
      });
      setSubmitted(true);
      toast.success("🎉 Đặt lịch thành công! Team sẽ liên hệ trong vòng 2 giờ.", { duration: 5000 });
    } catch { toast.error("Có lỗi xảy ra, vui lòng thử lại"); }
    finally { setIsSubmitting(false); }
  };

  const selectedCreatorData = creators.filter(c => selectedCreators.includes(c.id));

  // ── Success Screen ────────────────────────────────────────────────────────
  if (submitted) return (
    <div style={{ background: BG, minHeight: "100%", color: "white" }} className="flex items-center justify-center p-8">
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(34,197,94,0.6) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md relative z-10">
        <motion.div animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.6 }}
          className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", boxShadow: "0 0 60px rgba(34,197,94,0.3)" }}>
          <CheckCircle size={48} style={{ color: "#22C55E" }} />
        </motion.div>
        <h2 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: 8 }}>Đặt Lịch Thành Công!</h2>
        <p style={{ color: "#22C55E", fontWeight: 700, marginBottom: 16, fontSize: "14px" }}>
          Gói {pkg?.name} · {selectedDate} lúc {selectedTime}
        </p>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", lineHeight: 1.7, marginBottom: 24 }}>
          Yêu cầu đã gửi tới{" "}
          <strong style={{ color: "white" }}>{selectedCreatorData.map(c => c.name).join(", ")}</strong>.
          Team sẽ phản hồi trong vòng <strong style={{ color: "#22C55E" }}>2 giờ làm việc</strong>.
        </p>
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {selectedCreatorData.map(c => (
            <img key={c.id} src={c.img} alt={c.name} className="w-12 h-12 rounded-xl object-cover"
              style={{ border: "2px solid rgba(99,102,241,0.4)" }} />
          ))}
        </div>
        <motion.button onClick={() => { setSubmitted(false); setStep(1); setSelectedPackage(""); setSelectedDate(""); setSelectedTime(""); setSelectedCreators([]); setForm({ title:"",location:"",jobType:"",budget:"",description:"",negotiationPrice:"" }); }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          className="px-8 py-3 rounded-2xl text-white"
          style={{ background: GRAD, fontSize: "14px", fontWeight: 700 }}>
          Tạo Dự Án Mới
        </motion.button>
      </motion.div>
    </div>
  );

  // ── Main ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: BG, minHeight: "100%", color: "white" }}>
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div className="relative z-10 p-6 md:p-8">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
              style={{ border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)" }}>
              <Sparkles size={10} style={{ color: "#6366F1" }} />
              <span style={{ fontSize: "11px", color: "#6366F1", letterSpacing: "0.1em", fontWeight: 700 }}>ĐẶT LỊCH MỚI</span>
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 5 }}>Tạo Dự Án Mới</h1>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px" }}>
              Chọn gói phù hợp, đặt lịch và tìm creator tốt nhất cho dự án của bạn.
            </p>
          </motion.div>

          {/* Step Indicator */}
          <div className="flex items-center mb-8 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center flex-shrink-0"
                style={{ flex: i < STEPS.length - 1 ? "1" : "none" }}>
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ scale: step === s.num ? 1.1 : 1 }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
                    style={{
                      background: step >= s.num ? GRAD : "rgba(255,255,255,0.06)",
                      boxShadow: step === s.num ? NEON : "none",
                      border: step >= s.num ? "none" : "1px solid rgba(255,255,255,0.1)",
                    }}>
                    {step > s.num
                      ? <CheckCircle size={15} className="text-white" />
                      : <span style={{ fontSize: "12px", fontWeight: 700, color: step >= s.num ? "white" : "rgba(255,255,255,0.3)" }}>{s.num}</span>}
                  </motion.div>
                  <span style={{ fontSize: "10px", marginTop: 5, fontWeight: step === s.num ? 700 : 500, color: step >= s.num ? "#6366F1" : "rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1.5 mb-5 transition-all duration-500"
                    style={{ background: step > s.num ? GRAD : "rgba(255,255,255,0.07)", minWidth: 20 }} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ═══════════════════════════════════════════════════════════════
                STEP 1 — GÓI DỊCH VỤ
            ═══════════════════════════════════════════════════════════════ */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <div className="p-4 rounded-2xl flex items-center gap-3 mb-6"
                  style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                  <Sparkles size={14} style={{ color: "#6366F1" }} />
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>
                    <strong style={{ color: "#6366F1" }}>Chọn gói phù hợp</strong> với quy mô và ngân sách dự án của bạn
                  </p>
                </div>

                <div className="grid gap-4">
                  {PACKAGES.map((p, i) => {
                    const Icon = p.icon;
                    const isSelected = selectedPackage === p.id;
                    return (
                      <motion.div key={p.id}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        onClick={() => setSelectedPackage(p.id)}
                        whileHover={{ y: -3 }}
                        className="relative overflow-hidden rounded-2xl cursor-pointer transition-all"
                        style={{
                          background: isSelected ? `${p.color}0D` : "rgba(255,255,255,0.04)",
                          border: `${isSelected ? "2px" : "1px"} solid ${isSelected ? p.color : "rgba(255,255,255,0.08)"}`,
                          boxShadow: isSelected ? `0 8px 40px ${p.glowColor}` : "none",
                        }}>
                        {/* Recommended badge */}
                        {p.recommended && (
                          <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl rounded-tr-2xl"
                            style={{ background: GRAD, fontSize: "9px", color: "white", fontWeight: 800, letterSpacing: "0.08em" }}>
                            ✦ {p.tag}
                          </div>
                        )}

                        <div className="p-5">
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                              style={{ background: `${p.color}15`, border: `1px solid ${p.color}25`, boxShadow: isSelected ? `0 0 20px ${p.color}30` : "none" }}>
                              <Icon size={22} style={{ color: p.color }} />
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span style={{ fontSize: "17px", fontWeight: 900, color: isSelected ? "white" : "rgba(255,255,255,0.75)" }}>
                                    {p.name}
                                  </span>
                                  {!p.recommended && (
                                    <span className="px-2 py-0.5 rounded-full"
                                      style={{ background: `${p.color}15`, fontSize: "9px", color: p.color, fontWeight: 700, border: `1px solid ${p.color}25` }}>
                                      {p.tag}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-baseline gap-1">
                                  <span style={{ fontSize: "22px", fontWeight: 900, color: p.color, letterSpacing: "-0.03em", lineHeight: 1 }}>
                                    {p.price.toLocaleString("vi-VN")}₫
                                  </span>
                                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>/ dự án</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 mb-4">
                                <Clock size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
                                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>{p.duration}</span>
                              </div>
                              {/* Features */}
                              <div className="grid sm:grid-cols-2 gap-1.5">
                                {p.features.map(f => (
                                  <div key={f} className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                                      style={{ background: `${p.color}20`, border: `1px solid ${p.color}30` }}>
                                      <CheckCircle size={9} style={{ color: p.color }} />
                                    </div>
                                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{f}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Selected indicator */}
                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                              style={{ background: isSelected ? GRAD : "rgba(255,255,255,0.08)", border: `2px solid ${isSelected ? "transparent" : "rgba(255,255,255,0.12)"}`, boxShadow: isSelected ? NEON : "none" }}>
                              {isSelected && <CheckCircle size={13} className="text-white" />}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <motion.button onClick={handleNext}
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 40px rgba(99,102,241,0.45)" }} whileTap={{ scale: 0.98 }}
                  disabled={!selectedPackage}
                  className="w-full mt-6 py-4 rounded-2xl text-white flex items-center justify-center gap-2"
                  style={{ background: selectedPackage ? GRAD : "rgba(255,255,255,0.08)", fontSize: "15px", fontWeight: 700, opacity: selectedPackage ? 1 : 0.5 }}>
                  Tiếp Theo – Chọn Ngày <ChevronRight size={18} />
                </motion.button>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                STEP 2 — NGÀY & GIỜ
            ═══════════════════════════════════════════════════════════════ */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
                {/* Package summary */}
                {pkg && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl"
                    style={{ background: `${pkg.color}0D`, border: `1px solid ${pkg.color}25` }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${pkg.color}15` }}>
                      <pkg.icon size={16} style={{ color: pkg.color }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "white" }}>Gói {pkg.name}</div>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{pkg.price.toLocaleString("vi-VN")}₫ · {pkg.duration}</div>
                    </div>
                    <button onClick={() => { setStep(1); }} className="ml-auto"
                      style={{ fontSize: "11px", color: "#6366F1", fontWeight: 600 }}>Thay đổi</button>
                  </div>
                )}

                {/* Calendar */}
                <div>
                  <label style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 10, fontWeight: 600 }}>
                    <Calendar size={12} className="inline mr-1.5" style={{ color: "#6366F1" }} />
                    Chọn Ngày Thực Hiện
                  </label>
                  <CalendarPicker selected={selectedDate} onSelect={setSelectedDate} />
                  {selectedDate && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                      <CheckCircle size={13} style={{ color: "#22C55E" }} />
                      <span style={{ fontSize: "12.5px", color: "#22C55E", fontWeight: 600 }}>
                        {new Date(selectedDate + "T00:00:00").toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Time Slots */}
                <div>
                  <label style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 10, fontWeight: 600 }}>
                    <Clock size={12} className="inline mr-1.5" style={{ color: "#6366F1" }} />
                    Chọn Giờ Bắt Đầu
                  </label>
                  <div className="space-y-4">
                    {Object.entries(TIME_SLOTS).map(([key, { label, times }]) => (
                      <div key={key}>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>
                          {label.toUpperCase()}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {times.map(t => (
                            <motion.button key={t} onClick={() => setSelectedTime(t)}
                              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              className="py-2.5 rounded-xl transition-all"
                              style={{
                                background: selectedTime === t ? GRAD : "rgba(255,255,255,0.04)",
                                border: selectedTime === t ? "none" : "1px solid rgba(255,255,255,0.09)",
                                color: selectedTime === t ? "white" : "rgba(255,255,255,0.6)",
                                fontSize: "13px", fontWeight: selectedTime === t ? 700 : 500,
                                boxShadow: selectedTime === t ? NEON : "none",
                              }}>
                              {t}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl"
                    style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: "14px", fontWeight: 600 }}>
                    <ArrowLeft size={15} /> Quay Lại
                  </button>
                  <motion.button onClick={handleNext} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 rounded-xl text-white flex items-center justify-center gap-2"
                    style={{ background: GRAD, fontSize: "14px", fontWeight: 700, boxShadow: NEON }}>
                    Tiếp Theo – Chọn Creator <ChevronRight size={16} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                STEP 3 — CHỌN CREATOR
            ═══════════════════════════════════════════════════════════════ */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
                {/* Info banner */}
                <div className="p-4 rounded-2xl flex items-center gap-3"
                  style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                  <Sparkles size={14} style={{ color: "#6366F1" }} />
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>
                    <strong style={{ color: "#6366F1" }}>Gói {pkg?.name}:</strong>{" "}
                    {selectedPackage === "basic" ? "Chọn 1 creator" : selectedPackage === "pro" ? "Chọn tối đa 3 creators" : "Chọn tối đa 6 creators"}{" "}
                    · <span style={{ color: "#22C55E", fontWeight: 600 }}>Đã chọn {selectedCreators.length}</span>
                  </p>
                </div>

                {/* Creator Grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {creators.map((c, i) => {
                    const sel = selectedCreators.includes(c.id);
                    const maxReached = !sel && (
                      (selectedPackage === "basic" && selectedCreators.length >= 1) ||
                      (selectedPackage === "pro" && selectedCreators.length >= 3) ||
                      (selectedPackage === "elite" && selectedCreators.length >= 6)
                    );
                    return (
                      <motion.div key={c.id}
                        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        onClick={() => !maxReached && toggleCreator(c.id)}
                        className="rounded-2xl overflow-hidden transition-all"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: sel ? "2px solid #6366F1" : "1px solid rgba(255,255,255,0.08)",
                          boxShadow: sel ? "0 4px 24px rgba(99,102,241,0.25)" : "none",
                          cursor: maxReached ? "not-allowed" : "pointer",
                          opacity: maxReached ? 0.5 : 1,
                        }}>
                        <div className="relative h-36 overflow-hidden">
                          <motion.img whileHover={{ scale: 1.06 }} transition={{ duration: 0.4 }}
                            src={c.img} alt={c.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,7,15,0.85) 40%, transparent)" }} />
                          {/* Tag */}
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md"
                            style={{ background: "rgba(99,102,241,0.75)", fontSize: "9px", color: "white", fontWeight: 700 }}>{c.tag}</div>
                          {/* Selected badge */}
                          {sel && (
                            <div className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                              style={{ background: GRAD, boxShadow: NEON }}>
                              <CheckCircle size={14} className="text-white" />
                            </div>
                          )}
                          <div className="absolute bottom-2 left-3">
                            <div style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>{c.name}</div>
                            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{c.role}</div>
                          </div>
                        </div>
                        <div className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star size={12} style={{ color: "#F59E0B", fill: "#F59E0B" }} />
                            <span style={{ fontSize: "12px", fontWeight: 700 }}>{c.rating}</span>
                            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>· {c.jobs} dự án</span>
                          </div>
                          <span style={{ fontSize: "12px", color: "#22C55E", fontWeight: 700 }}>
                            {parseInt(c.price).toLocaleString("vi-VN")}₫
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {selectedCreators.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl flex items-center gap-2"
                    style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                    <CheckCircle size={13} style={{ color: "#22C55E" }} />
                    <span style={{ fontSize: "12px", color: "#22C55E", fontWeight: 600 }}>
                      Đã chọn: {selectedCreatorData.map(c => c.name).join(", ")}
                    </span>
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl"
                    style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: "14px", fontWeight: 600 }}>
                    <ArrowLeft size={15} /> Quay Lại
                  </button>
                  <motion.button onClick={handleNext} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 rounded-xl text-white flex items-center justify-center gap-2"
                    style={{ background: GRAD, fontSize: "14px", fontWeight: 700, boxShadow: NEON }}>
                    Tiếp Theo – Chi Tiết <ChevronRight size={16} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                STEP 4 — CHI TIẾT DỰ ÁN
            ═══════════════════════════════════════════════════════════════ */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
                <div className="p-5 rounded-2xl space-y-4" style={CARD}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Thông Tin Dự Án</h3>
                  <div>
                    <label style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6, fontWeight: 600 }}>Tiêu Đề Dự Án *</label>
                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder="VD: Chụp ảnh BST Thu Đông 2024"
                      className="w-full px-4 py-3 rounded-xl outline-none" style={INPUT} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6, fontWeight: 600 }}>
                        <MapPin size={11} className="inline mr-1" style={{ color: "#6366F1" }} />Địa Điểm *
                      </label>
                      <div className="relative">
                        <select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl outline-none appearance-none"
                          style={{ ...INPUT, color: form.location ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)" }}>
                          <option value="" style={{ background: "#1A1A2E" }}>Chọn địa điểm</option>
                          {LOCATIONS.map(l => <option key={l} value={l} style={{ background: "#1A1A2E" }}>{l}</option>)}
                        </select>
                        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.3)" }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6, fontWeight: 600 }}>
                        <Briefcase size={11} className="inline mr-1" style={{ color: "#6366F1" }} />Loại Công Việc *
                      </label>
                      <div className="relative">
                        <select value={form.jobType} onChange={e => setForm({ ...form, jobType: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl outline-none appearance-none"
                          style={{ ...INPUT, color: form.jobType ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)" }}>
                          <option value="" style={{ background: "#1A1A2E" }}>Chọn loại công việc</option>
                          {JOB_TYPES.map(t => <option key={t} value={t} style={{ background: "#1A1A2E" }}>{t}</option>)}
                        </select>
                        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.3)" }} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6, fontWeight: 600 }}>Mô Tả & Yêu Cầu *</label>
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                      rows={4} placeholder="Mô tả concept, phong cách, màu sắc chủ đạo, yêu cầu đặc biệt..."
                      className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                      style={{ ...INPUT, lineHeight: "1.65" }} />
                  </div>
                </div>

                {/* Upload reference */}
                <div className="p-5 rounded-2xl" style={CARD}>
                  <h3 style={{ fontSize: "13.5px", fontWeight: 700, marginBottom: 10 }}>Ảnh Tham Khảo (tuỳ chọn)</h3>
                  <div className="flex flex-col items-center justify-center py-7 rounded-xl border-2 border-dashed cursor-pointer"
                    style={{ borderColor: "rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.03)" }}
                    onClick={() => toast.info("Tính năng upload sẽ ra mắt sớm!")}>
                    <Upload size={22} style={{ color: "#6366F1", marginBottom: 7 }} />
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>Kéo thả hoặc <span style={{ color: "#6366F1", fontWeight: 700 }}>chọn file</span></p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: 3 }}>PNG, JPG, PDF – Tối đa 50MB</p>
                  </div>
                </div>

                {/* Phase 2 negotiation */}
                <div className={`p-5 rounded-2xl relative overflow-hidden ${!features.bookingNegotiation ? "opacity-55" : ""}`}
                  style={{ ...CARD, border: `1px solid ${features.bookingNegotiation ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.06)"}` }}>
                  {!features.bookingNegotiation && (
                    <div className="absolute inset-0 flex items-center justify-center z-10"
                      style={{ background: "rgba(7,7,15,0.7)", backdropFilter: "blur(2px)" }}>
                      <div className="text-center">
                        <Lock size={20} style={{ color: "#6366F1", margin: "0 auto 5px" }} />
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#6366F1" }}>Thương Lượng Giá – Phase 2</div>
                      </div>
                    </div>
                  )}
                  <h3 style={{ fontSize: "13.5px", fontWeight: 700, marginBottom: 10 }}>
                    <Lock size={13} className="inline mr-1.5" style={{ color: "rgba(255,255,255,0.3)" }} />
                    Đề Xuất Giá (Phase 2)
                  </h3>
                  <input value={form.negotiationPrice} onChange={e => setForm({ ...form, negotiationPrice: e.target.value })}
                    placeholder="Đề xuất giá thương lượng..." disabled={!features.bookingNegotiation}
                    className="w-full px-4 py-3 rounded-xl outline-none" style={INPUT} />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(3)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl"
                    style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: "14px", fontWeight: 600 }}>
                    <ArrowLeft size={15} /> Quay Lại
                  </button>
                  <motion.button onClick={handleNext} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 rounded-xl text-white flex items-center justify-center gap-2"
                    style={{ background: GRAD, fontSize: "14px", fontWeight: 700, boxShadow: NEON }}>
                    Tiếp Theo – Xác Nhận <ChevronRight size={16} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                STEP 5 — XÁC NHẬN
            ═══════════════════════════════════════════════════════════════ */}
            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
                {/* Summary card */}
                <div className="p-5 rounded-2xl space-y-3" style={{ ...CARD, border: "1px solid rgba(99,102,241,0.15)" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: 8 }}>Tóm Tắt Đặt Lịch</h3>
                  {[
                    { label: "Gói Dịch Vụ",    value: pkg ? `${pkg.name} – ${pkg.price.toLocaleString("vi-VN")}₫` : "" },
                    { label: "Ngày Thực Hiện", value: selectedDate ? new Date(selectedDate + "T00:00:00").toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }) : "" },
                    { label: "Giờ Bắt Đầu",   value: selectedTime },
                    { label: "Thời Lượng",     value: pkg?.duration || "" },
                    { label: "Tiêu Đề",        value: form.title },
                    { label: "Địa Điểm",       value: form.location },
                    { label: "Loại Công Việc", value: form.jobType },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between gap-4 py-1.5"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{label}</span>
                      <span style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.8)", fontWeight: 600, textAlign: "right" }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Creators */}
                <div className="p-5 rounded-2xl" style={CARD}>
                  <h3 style={{ fontSize: "13.5px", fontWeight: 700, marginBottom: 12 }}>
                    Creators Đã Chọn ({selectedCreatorData.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedCreatorData.map(c => (
                      <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ background: "rgba(99,102,241,0.08)" }}>
                        <img src={c.img} alt="" className="w-10 h-10 rounded-xl object-cover" />
                        <div className="flex-1">
                          <div style={{ fontSize: "13px", fontWeight: 700 }}>{c.name}</div>
                          <div style={{ fontSize: "11px", color: "#6366F1" }}>{c.role} · ★ {c.rating}</div>
                        </div>
                        <span style={{ fontSize: "12px", color: "#22C55E", fontWeight: 700 }}>
                          {parseInt(c.price).toLocaleString("vi-VN")}₫
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between p-4 rounded-2xl"
                  style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700 }}>Tổng Chi Phí Gói</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>Bao gồm tất cả dịch vụ trong gói</div>
                  </div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#22C55E", letterSpacing: "-0.03em" }}>
                    {pkg ? pkg.price.toLocaleString("vi-VN") : ""}₫
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(4)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl"
                    style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: "14px", fontWeight: 600 }}>
                    <ArrowLeft size={15} /> Quay Lại
                  </button>
                  <motion.button onClick={handleSubmit}
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 40px rgba(99,102,241,0.45)" }} whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3.5 rounded-xl text-white flex items-center justify-center gap-2"
                    style={{ background: GRAD, fontSize: "14px", fontWeight: 800, boxShadow: NEON }}>
                    <Briefcase size={15} />
                    {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Đang Gửi...</> : "Xác Nhận & Gửi Yêu Cầu"}
                  </motion.button>
                </div>
                <p style={{ textAlign: "center", fontSize: "11.5px", color: "rgba(255,255,255,0.18)" }}>
                  Team sẽ phản hồi trong vòng 2 giờ làm việc · Không thu phí trước khi xác nhận
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
