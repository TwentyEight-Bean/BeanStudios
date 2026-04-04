"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Send, Upload, Lock, CheckCircle, RotateCcw, User, MessageCircle, File, Sparkles, Clock, MapPin, DollarSign, Star, CreditCard, Download, Check, Loader2 } from "lucide-react";
import { useFeatures } from "../context/FeatureContext";
import { getBookingById, getChatMessages, sendChatMessage, type Booking } from "../lib/localApi";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

const GRAD = "linear-gradient(135deg, #6366F1, #A855F7)";
const NEON = "0 0 30px rgba(99,102,241,0.3)";
const CARD = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };

const PARTICIPANTS = [
  { name: "Linh Phương", role: "Nhiếp Ảnh Gia", img: "https://images.unsplash.com/photo-1616639943825-e0fbad20a3d3?w=80",  status: "Đang làm",    color: "#6366F1" },
  { name: "Thu Hà",      role: "Model",          img: "https://images.unsplash.com/photo-1763906803356-c4c2c83dc012?w=80",  status: "Đã xác nhận", color: "#22C55E" },
  { name: "Duy Anh",     role: "Editor",         img: "https://images.unsplash.com/photo-1618902410393-6fe0a34bb79e?w=80", status: "Chờ",         color: "#F59E0B" },
];

const MESSAGES = [
  { id: 1, sender: "Linh Phương", text: "Mình đã chuẩn bị xong thiết bị, sẽ đến studio lúc 8h sáng nhé!", time: "09:15", avatar: "https://images.unsplash.com/photo-1616639943825-e0fbad20a3d3?w=60", me: false },
  { id: 2, sender: "Bạn", text: "Tốt lắm! Mình sẽ chuẩn bị set đèn trước. Concept hôm nay là minimal với tông màu trung tính nhé.", time: "09:18", avatar: "https://images.unsplash.com/photo-1634885078824-c4f6a3c312c2?w=60", me: true },
  { id: 3, sender: "Thu Hà", text: "Trang phục mình đã chuẩn bị 3 bộ, mình sẽ đến lúc 9h nhé! 🎉", time: "09:25", avatar: "https://images.unsplash.com/photo-1763906803356-c4c2c83dc012?w=60", me: false },
  { id: 4, sender: "Duy Anh", text: "Mình nhận file raw sau khi chụp xong là được, ETA chỉnh sửa khoảng 3-5 ngày.", time: "09:30", avatar: "https://images.unsplash.com/photo-1618902410393-6fe0a34bb79e?w=60", me: false },
];

const FILES = [
  { name: "BST_ThuDong_Brief.pdf", size: "2.4 MB", type: "PDF", color: "#EF4444" },
  { name: "MoodBoard_Final.zip",   size: "18 MB",  type: "ZIP", color: "#F59E0B" },
];

export function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { features } = useFeatures();
  
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput]       = useState("");
  const [fileTab, setFileTab]   = useState<"details" | "files" | "chat" | "milestones" | "payment" | "review">("details");

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    const fetchData = async () => {
      try {
        const b = await getBookingById(id as string);
        if (!isMounted) return;
        if (!b) {
          toast.error("Không tìm thấy công việc này");
          router.push("/cong-viec");
          return;
        }
        setBooking(b);
        const msgs = await getChatMessages(`job_${id}`);
        if (isMounted) {
          setMessages(msgs || []);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        if (isMounted) {
          toast.error("Lỗi khi tải dự án");
          router.push("/cong-viec");
        }
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [id, router]);

  const sendMsg = async () => {
    if (!input.trim() || !id) return;
    try {
      const newMsg = await sendChatMessage(`job_${id}`, input.trim());
      setMessages(prev => [...prev, newMsg]);
      setInput("");
    } catch (e) {
      toast.error("Không thể gửi tin nhắn");
    }
  };

  if (loading || !booking) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
        <p className="text-white/40 text-sm">Đang tải thông tin dự án...</p>
      </div>
    );
  }

  // Participants might be derived from booking creator + hiring info
  const PARTICIPANTS = [
    { name: booking.creatorName, role: booking.creatorRole, img: `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.creatorName)}&background=6366F1&color=fff`,  status: "Đang làm",    color: "#6366F1" },
    { name: user?.name || "Khách hàng", role: "Khách hàng", img: user?.avatar || "https://ui-avatars.com/api/?name=K&background=4F46E5&color=fff", status: "Chủ dự án", color: "#22C55E" },
  ];

  const jobInfo = {
    title: booking.serviceTitle,
    jobType: booking.creatorRole, 
    date: new Date(booking.date).toLocaleDateString("vi-VN"), 
    location: "Online / Tại chỗ",
    budget: booking.price, 
    status: booking.status === "pending" ? "Chờ duyệt" : booking.status === "confirmed" ? "Đã duyệt" : "Đang làm",
    statusColor: booking.status === "pending" ? "#F59E0B" : "#22C55E",
    description: booking.note || "Không có mô tả chi tiết.",
    progress: booking.status === "completed" ? 100 : 45,
  };

  return (
    <div style={{ background: "#07070F", minHeight: "100%", color: "white" }}>
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Back */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
            <Link href="/cong-viec">
              <motion.button whileHover={{ x: -3 }} className="flex items-center gap-2 transition-all"
                style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", fontWeight: 600 }}>
                <ArrowLeft size={16} /> Quay Lại Danh Sách
              </motion.button>
            </Link>
          </motion.div>

          {/* Job header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-3xl mb-6 relative overflow-hidden" style={CARD}>
            <div className="absolute inset-0 opacity-5" style={{ background: GRAD }} />
            <div className="relative flex flex-col sm:flex-row sm:items-start gap-5">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full"
                    style={{ background: `${jobInfo.statusColor}15`, border: `1px solid ${jobInfo.statusColor}25` }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: jobInfo.statusColor, boxShadow: `0 0 6px ${jobInfo.statusColor}` }} />
                    <span style={{ fontSize: "10px", color: jobInfo.statusColor, fontWeight: 700 }}>{jobInfo.status.toUpperCase()}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full" style={{ background: "rgba(99,102,241,0.1)", fontSize: "10px", color: "#6366F1", fontWeight: 600 }}>
                    {jobInfo.jobType}
                  </span>
                </div>
                <h1 style={{ fontSize: "clamp(1.1rem,3vw,1.5rem)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 12 }}>{jobInfo.title}</h1>
                <div className="flex flex-wrap gap-4 mb-4">
                  {[
                    { icon: Clock,   text: jobInfo.date,     color: "#A855F7" },
                    { icon: MapPin,  text: jobInfo.location,  color: "#6366F1" },
                    { icon: DollarSign, text: jobInfo.budget, color: "#22C55E" },
                  ].map(({ icon: Icon, text, color }) => (
                    <div key={text} className="flex items-center gap-1.5">
                      <Icon size={13} style={{ color }} />
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>{text}</span>
                    </div>
                  ))}
                </div>
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Tiến Độ</span>
                    <span style={{ fontSize: "12px", color: "#6366F1", fontWeight: 700 }}>{jobInfo.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <motion.div className="h-full rounded-full" style={{ background: GRAD }}
                      initial={{ width: 0 }} animate={{ width: `${jobInfo.progress}%` }} transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }} />
                  </div>
                </div>
              </div>

              {/* Participants */}
              <div className="sm:w-48 flex-shrink-0">
                <h3 style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>THÀNH VIÊN</h3>
                <div className="space-y-2">
                  {PARTICIPANTS.map(p => (
                    <div key={p.name} className="flex items-center gap-2.5">
                      <img src={p.img} alt="" className="w-8 h-8 rounded-xl object-cover flex-shrink-0"
                        style={{ border: "2px solid rgba(99,102,241,0.3)" }} />
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: "12px", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                        <div style={{ fontSize: "10px", color: p.color, fontWeight: 600 }}>{p.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: "details", label: "Chi Tiết", icon: User },
              { key: "milestones", label: "Cột Mốc", icon: Clock },
              { key: "files",   label: "Files",    icon: File },
              { key: "chat",    label: "Chat",      icon: MessageCircle },
              { key: "payment", label: "Thanh Toán", icon: DollarSign },
              { key: "review", label: "Đánh Giá", icon: CheckCircle },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setFileTab(key as any)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
                style={{
                  background: fileTab === key ? GRAD : "rgba(255,255,255,0.04)",
                  border: fileTab === key ? "none" : "1px solid rgba(255,255,255,0.08)",
                  color: fileTab === key ? "white" : "rgba(255,255,255,0.5)",
                  fontSize: "13px", fontWeight: fileTab === key ? 700 : 500,
                  boxShadow: fileTab === key ? NEON : "none",
                }}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={fileTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>

              {/* Details */}
              {fileTab === "details" && (
                <div className="space-y-5">
                  <div className="p-5 rounded-2xl" style={CARD}>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: 10 }}>Mô Tả Dự Án</h3>
                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.85 }}>{jobInfo.description}</p>
                  </div>
                  <div className="p-5 rounded-2xl" style={CARD}>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: 12 }}>Tiến Độ Từng Người</h3>
                    <div className="space-y-4">
                      {PARTICIPANTS.map(p => (
                        <div key={p.name} className="flex items-center gap-3">
                          <img src={p.img} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1.5">
                              <span style={{ fontSize: "13px", fontWeight: 700 }}>{p.name}</span>
                              <span className="px-2 py-0.5 rounded-lg" style={{ background: `${p.color}15`, fontSize: "10px", color: p.color, fontWeight: 700 }}>{p.status}</span>
                            </div>
                            <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                              <div className="h-full rounded-full transition-all duration-700"
                                style={{ width: p.status === "Đang làm" ? "60%" : p.status === "Đã xác nhận" ? "100%" : "20%", background: p.color }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Files */}
              {fileTab === "files" && (
                <div className="space-y-4">
                  {/* File Approval Phase 2 */}
                  <div className={`p-4 rounded-2xl relative overflow-hidden ${!features.fileApproval ? "opacity-60" : ""}`}
                    style={{ background: features.fileApproval ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${features.fileApproval ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.06)"}` }}>
                    {!features.fileApproval && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-2xl z-10"
                        style={{ background: "rgba(7,7,15,0.7)", backdropFilter: "blur(2px)" }}>
                        <div className="flex items-center gap-2">
                          <Lock size={14} style={{ color: "#6366F1" }} />
                          <span style={{ fontSize: "12px", color: "#6366F1", fontWeight: 700 }}>Phê Duyệt File – Phase 2 Locked</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Sparkles size={16} style={{ color: "#6366F1" }} />
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700 }}>Phê Duyệt File Trực Tuyến</div>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Duyệt, từ chối và ghi chú ngay trên nền tảng</div>
                      </div>
                    </div>
                  </div>

                  {/* Upload zone */}
                  <div className="p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 cursor-pointer transition-all"
                    style={{ borderColor: "rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.03)" }}>
                    <Upload size={28} style={{ color: "#6366F1", marginBottom: 10 }} />
                    <p style={{ fontSize: "14px", fontWeight: 700, marginBottom: 4 }}>Kéo thả hoặc <span style={{ color: "#6366F1" }}>chọn file</span></p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>PNG, JPG, MP4, PDF – Tối đa 500MB</p>
                  </div>

                  {/* Files list */}
                  <div className="space-y-2">
                    {FILES.map((f, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className="flex items-center gap-4 p-4 rounded-2xl transition-all" style={CARD}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${f.color}15`, border: `1px solid ${f.color}25` }}>
                          <File size={18} style={{ color: f.color }} />
                        </div>
                        <div className="flex-1">
                          <div style={{ fontSize: "13px", fontWeight: 600 }}>{f.name}</div>
                          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{f.size}</div>
                        </div>
                        <div className="flex gap-2">
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg"
                            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", fontSize: "11px", color: "#22C55E", fontWeight: 600 }}>
                            <CheckCircle size={11} /> Duyệt
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg"
                            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", fontSize: "11px", color: "#EF4444", fontWeight: 600 }}>
                            <RotateCcw size={11} /> Sửa
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat */}
              {fileTab === "chat" && (
                <div className="rounded-2xl overflow-hidden flex flex-col" style={{ ...CARD, height: 480 }}>
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    <AnimatePresence initial={false}>
                      {messages.map((msg) => (
                        <motion.div key={msg.id}
                          initial={{ opacity: 0, y: 12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          className={`flex ${msg.me ? "justify-end" : "justify-start"} gap-2`}>
                          {!msg.me && (
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-1"
                              style={{ background: GRAD, border: "1px solid rgba(255,255,255,0.1)" }}>
                              {msg.senderName.charAt(0)}
                            </div>
                          )}
                          <div className={`max-w-[70%] flex flex-col ${msg.me ? "items-end" : "items-start"} gap-1`}>
                            {!msg.me && <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>{msg.senderName}</span>}
                            <div className="px-4 py-2.5 rounded-2xl"
                              style={{
                                background: msg.me ? GRAD : "rgba(255,255,255,0.07)",
                                borderBottomRightRadius: msg.me ? 6 : 16,
                                borderBottomLeftRadius: msg.me ? 16 : 6,
                                boxShadow: msg.me ? NEON : "none",
                              }}>
                              <p style={{ fontSize: "13.5px", color: "white", lineHeight: 1.5 }}>{msg.text}</p>
                            </div>
                            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>{msg.time}</span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="flex items-center gap-3 p-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <input value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendMsg()}
                        placeholder="Nhắn gửi team..."
                        className="flex-1 bg-transparent outline-none"
                        style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.85)" }} />
                    </div>
                    <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                      onClick={sendMsg} disabled={!input.trim()}
                      className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: input.trim() ? GRAD : "rgba(255,255,255,0.06)", opacity: !input.trim() ? 0.5 : 1, boxShadow: input.trim() ? NEON : "none" }}>
                      <Send size={17} className="text-white" />
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Milestones */}
              {fileTab === "milestones" && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl" style={CARD}>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: 16 }}>Tiến Độ Dự Án</h3>
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-purple-500 before:to-transparent">
                      {[
                        { title: "Ký Hợp Đồng & Đặt Cọc", date: "20/11/2024", status: "completed", desc: "Đã thanh toán 50% giá trị hợp đồng" },
                        { title: "Chốt Concept & Brief", date: "22/11/2024", status: "completed", desc: "Khách hàng đã duyệt moodboard" },
                        { title: "Thực Hiện Buổi Chụp", date: "25/11/2024", status: "current", desc: "Studio B - 08:00 AM đến 05:00 PM" },
                        { title: "Gửi File Raw & Chọn Ảnh", date: "26/11/2024", status: "upcoming", desc: "Dự kiến 200 file raw" },
                        { title: "Bàn Giao File Final & Thanh Toán", date: "30/11/2024", status: "upcoming", desc: "Chỉnh sửa tối đa 2 lần" },
                      ].map((item, i) => (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#07070F] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${
                            item.status === 'completed' ? 'bg-[#22C55E] text-white' : 
                            item.status === 'current' ? 'bg-[#6366F1] text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 
                            'bg-gray-800 text-gray-500'
                          }`}>
                            {item.status === 'completed' ? <Check size={16} /> : <Clock size={16} />}
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-md">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`font-bold text-sm ${item.status === 'current' ? 'text-[#6366F1]' : 'text-white'}`}>{item.title}</h4>
                              <span className="text-xs text-white/40">{item.date}</span>
                            </div>
                            <p className="text-xs text-white/60">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment & Invoice */}
              {fileTab === "payment" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl" style={CARD}>
                      <div className="flex items-center justify-between mb-6">
                        <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Tổng Quan Tài Chính</h3>
                        <CreditCard size={18} style={{ color: "#6366F1" }} />
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/60">Tổng giá trị HĐ</span>
                          <span className="text-sm font-bold">8,500,000₫</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/60">Đã thanh toán (Cọc)</span>
                          <span className="text-sm font-bold text-[#22C55E]">4,250,000₫</span>
                        </div>
                        <div className="h-px bg-white/10 my-2"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/60">Còn lại cần thanh toán</span>
                          <span className="text-lg font-bold text-[#6366F1]">4,250,000₫</span>
                        </div>
                      </div>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full mt-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2" style={{ background: GRAD, boxShadow: NEON }}>
                        Thanh Toán Đợt Cuối
                      </motion.button>
                    </div>

                    <div className="p-5 rounded-2xl" style={CARD}>
                      <div className="flex items-center justify-between mb-6">
                        <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Hóa Đơn (Invoices)</h3>
                        <File size={18} style={{ color: "#A855F7" }} />
                      </div>
                      <div className="space-y-3">
                        {[
                          { id: "INV-2024-001", amount: "4,250,000₫", date: "20/11/2024", status: "Đã thanh toán" },
                          { id: "INV-2024-002", amount: "4,250,000₫", date: "30/11/2024", status: "Chưa thanh toán" },
                        ].map((inv, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                            <div>
                              <div className="text-sm font-bold text-white">{inv.id}</div>
                              <div className="text-xs text-white/50">{inv.date}</div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                              <div className="text-sm font-bold">{inv.amount}</div>
                              <div className={`text-[10px] px-2 py-0.5 rounded-full ${inv.status === 'Đã thanh toán' ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-[#F59E0B]/20 text-[#F59E0B]'}`}>{inv.status}</div>
                            </div>
                            <button className="ml-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                              <Download size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Review */}
              {fileTab === "review" && (
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="p-6 rounded-2xl text-center border border-white/10 bg-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1" style={{ background: GRAD }} />
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(99,102,241,0.4)] relative z-10">
                      <Star size={28} className="text-white" fill="white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Đánh Giá Trải Nghiệm</h3>
                    <p className="text-sm text-white/60 mb-6">Dự án đã hoàn thành! Hãy chia sẻ cảm nhận của bạn để giúp các Creator cải thiện dịch vụ tốt hơn.</p>
                    
                    <div className="flex justify-center gap-2 mb-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} className="text-white/20 hover:text-[#F59E0B] transition-colors">
                          <Star size={32} fill="currentColor" />
                        </button>
                      ))}
                    </div>

                    <textarea 
                      placeholder="Chia sẻ trải nghiệm làm việc của bạn (kỹ năng, thái độ, đúng giờ...)"
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-[#6366F1] transition-colors mb-4 h-32 resize-none"
                    ></textarea>

                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      {["Chuyên nghiệp", "Đúng giờ", "Sáng tạo", "Nhiệt tình", "Giao tiếp tốt"].map((tag, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 cursor-pointer hover:bg-white/10 transition-colors">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3 rounded-xl font-bold text-sm" style={{ background: GRAD, boxShadow: NEON }}>
                      Gửi Đánh Giá
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
