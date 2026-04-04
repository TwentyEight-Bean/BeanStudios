"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles, Search, Send, Loader2, Lock, RefreshCw,
  Phone, Video, MoreVertical, MessageCircle, Zap,
  Check, CheckCheck, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { getChatMessages, sendChatMessage, getCreators, getConversations, getOrCreateConversation } from "../lib/localApi";
import { useFeatures } from "../context/FeatureContext";
import { useAuth } from "../context/AuthContext";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const GRAD   = "linear-gradient(135deg, #6366F1 0%, #A855F7 100%)";
const GRAD2  = "linear-gradient(135deg, #EC4899 0%, #6366F1 100%)";
const NEON   = "0 0 40px rgba(99,102,241,0.4)";
const NEON_S = "0 0 20px rgba(99,102,241,0.25)";

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="w-2 h-2 rounded-full"
          style={{ background: "rgba(99,102,241,0.6)" }}
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyChat() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full p-10 select-none"
      style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.04) 0%, transparent 70%)" }}
    >
      {/* Animated icon */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative mb-8"
      >
        <div className="w-32 h-32 rounded-[2.5rem] flex items-center justify-center"
          style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", boxShadow: NEON }}>
          <MessageCircle size={52} style={{ color: "#6366F1", opacity: 0.9 }} />
        </div>
        {/* Orbiting dot */}
        <motion.div className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: GRAD, boxShadow: "0 4px 12px rgba(99,102,241,0.5)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles size={12} className="text-white" />
        </motion.div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ fontSize: "24px", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 10,
          background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
      >
        Bắt Đầu Trò Chuyện
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", maxWidth: 320, lineHeight: 1.7, textAlign: "center", marginBottom: 32 }}
      >
        Chọn một creator từ danh sách bên trái để mở cuộc hội thoại và bắt đầu cộng tác ngay!
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      >
        <Link href="/kham-pha">
          <motion.button whileHover={{ scale: 1.05, boxShadow: "0 12px 36px rgba(99,102,241,0.4)" }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl text-white font-bold"
            style={{ background: GRAD, fontSize: "14px", boxShadow: NEON_S }}>
            <Zap size={16} />
            Khám Phá Creator
            <ArrowRight size={15} />
          </motion.button>
        </Link>
      </motion.div>

      {/* Feature hints */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="flex gap-6 mt-10"
      >
        {[
          { icon: "⚡", label: "Real-time" },
          { icon: "🔒", label: "Bảo mật" },
          { icon: "✨", label: "Nâng cao" },
        ].map(f => (
          <div key={f.label} className="flex items-center gap-1.5"
            style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", fontWeight: 600 }}>
            <span>{f.icon}</span>{f.label}
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ── No-messages state ─────────────────────────────────────────────────────────
function NoMessages({ contact }: { contact: any }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 select-none">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative mb-6">
        <img src={contact?.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover"
          style={{ border: "3px solid rgba(99,102,241,0.35)", boxShadow: NEON_S }} />
        <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: "#22C55E", border: "3px solid #0D0D1A" }} />
      </motion.div>
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ fontWeight: 700, fontSize: "16px", marginBottom: 6 }}>
        Bắt đầu trò chuyện với {contact?.name}
      </motion.p>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
        {contact?.role}
      </motion.p>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
        Gửi tin nhắn đầu tiên để bắt đầu hợp tác 🚀
      </motion.p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function ChatPage() {
  const { features } = useFeatures();
  const { isLoggedIn } = useAuth();
  const searchParams = useSearchParams();
  const chatWith = searchParams.get("chatWith");

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv]       = useState<string | null>(null);
  const [messages, setMessages]           = useState<any[]>([]);
  const [text, setText]                   = useState("");
  const [loadingMsgs, setLoadingMsgs]     = useState(false);
  const [sending, setSending]             = useState(false);
  const [search, setSearch]               = useState("");
  const [isTyping, setIsTyping]           = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Load conversations
  useEffect(() => {
    (async () => {
      if (!isLoggedIn) return;
      try {
        let convs = await getConversations();
        if (chatWith) {
          const creators = await getCreators();
          const found = creators.find((c: any) => c.id === chatWith);
          if (found) {
            const newConv = await getOrCreateConversation(chatWith);
            convs = await getConversations();
            setActiveConv(newConv.id);
          }
        } else if (convs.length > 0) {
          setActiveConv(convs[0].id);
        }
        setConversations(Array.isArray(convs) ? convs : []);
      } catch (err) {
        console.warn("Failed to load chat", err);
        setConversations([]);
      }
    })();
  }, [chatWith, isLoggedIn]);

  const activeContact = conversations.find(c => c.id === activeConv);
  const convMsgs = messages || [];

  const fetchMessages = async () => {
    if (!isLoggedIn || !activeConv) { setMessages([]); return; }
    setLoadingMsgs(true);
    try {
      const stored = await getChatMessages(activeConv);
      setMessages(Array.isArray(stored) ? stored : []);
    } catch {
      setMessages([]);
    } finally { setLoadingMsgs(false); }
  };

  useEffect(() => { fetchMessages(); }, [activeConv]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [convMsgs]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    if (!features.advancedChat) { toast.error("Chat nâng cao bị khóa bởi Admin"); return; }
    setSending(true);
    const optimistic = {
      id: `opt_${Date.now()}`, text: text.trim(), me: true,
      time: new Date().toLocaleTimeString("vi", { hour: "2-digit", minute: "2-digit" })
    };
    setMessages(p => [...p, optimistic]);
    setText("");
    // Simulate typing response
    setTimeout(() => setIsTyping(true), 600);
    setTimeout(() => setIsTyping(false), 2500);
    try {
      await sendChatMessage(activeConv!, text.trim());
    } catch { toast.error("Không thể gửi tin nhắn"); }
    finally { setSending(false); }
  };

  const filteredConvs = conversations.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: "#0A0A14", color: "white", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {/* Background gradient blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.8) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div className="flex flex-1 overflow-hidden relative z-10" style={{ minHeight: 0 }}>

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <div className="hidden md:flex flex-col flex-shrink-0"
          style={{ width: 300, borderRight: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>

          {/* Sidebar header */}
          <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: GRAD, boxShadow: NEON_S }}>
                <MessageCircle size={17} className="text-white" />
              </div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 800, letterSpacing: "-0.02em" }}>Tin Nhắn</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", fontWeight: 600 }}>
                  {conversations.length} cuộc hội thoại
                </div>
              </div>
            </div>
            {/* Search */}
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <Search size={13} style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Tìm creator..."
                className="bg-transparent outline-none flex-1"
                style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }} />
            </div>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.06) transparent" }}>
            <AnimatePresence>
              {filteredConvs.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <MessageCircle size={32} style={{ color: "rgba(99,102,241,0.25)", marginBottom: 12 }} />
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", lineHeight: 1.6 }}>
                    Chưa có cuộc hội thoại nào. Hãy khám phá và nhắn tin với các creator!
                  </p>
                </motion.div>
              )}
              {filteredConvs.map((c, i) => {
                const isActive = activeConv === c.id;
                return (
                  <motion.div key={c.id}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setActiveConv(c.id)}
                    className="flex items-center gap-3 px-3 py-3 rounded-2xl cursor-pointer transition-all"
                    style={{
                      background: isActive ? "rgba(99,102,241,0.12)" : "transparent",
                      border: `1px solid ${isActive ? "rgba(99,102,241,0.25)" : "transparent"}`,
                      boxShadow: isActive ? "inset 0 0 20px rgba(99,102,241,0.04)" : "none",
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img src={c.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover"
                        style={{ border: isActive ? "2px solid rgba(99,102,241,0.5)" : "2px solid rgba(255,255,255,0.06)" }} />
                      {c.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full"
                          style={{ background: "#22C55E", border: "2.5px solid #0A0A14" }} />
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="truncate" style={{ fontSize: "13.5px", fontWeight: isActive ? 700 : 600, color: isActive ? "white" : "rgba(255,255,255,0.75)" }}>
                          {c.name}
                        </span>
                        {c.online && (
                          <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full"
                            style={{ fontSize: "9px", background: "rgba(34,197,94,0.12)", color: "#22C55E", fontWeight: 700 }}>
                            LIVE
                          </span>
                        )}
                      </div>
                      <div className="truncate" style={{ fontSize: "11.5px", color: isActive ? "rgba(99,102,241,0.9)" : "rgba(255,255,255,0.3)", fontWeight: 600 }}>
                        {c.role}
                      </div>
                    </div>
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div layoutId="active-indicator"
                        className="w-1.5 h-8 rounded-full flex-shrink-0"
                        style={{ background: GRAD }} />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Chat Area ───────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          <AnimatePresence mode="wait">
            {!activeContact ? (
              <motion.div key="empty" className="flex-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EmptyChat />
              </motion.div>
            ) : (
              <motion.div key={activeConv} className="flex flex-col flex-1" style={{ minHeight: 0 }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                {/* ── Chat Header ── */}
                <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.02)",
                    backdropFilter: "blur(12px)",
                  }}>
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <img src={activeContact.avatar} alt="" className="w-11 h-11 rounded-2xl object-cover"
                        style={{ border: "2px solid rgba(99,102,241,0.35)", boxShadow: NEON_S }} />
                      {activeContact.online && (
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full"
                          style={{ background: "#22C55E", border: "2.5px solid #0A0A14" }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 800, letterSpacing: "-0.01em" }}>
                        {activeContact.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${activeContact.online ? "bg-green-400" : "bg-white/20"}`}
                          style={activeContact.online ? { boxShadow: "0 0 6px #22C55E" } : {}} />
                        <span style={{ fontSize: "11.5px", color: activeContact.online ? "#22C55E" : "rgba(255,255,255,0.35)", fontWeight: 600 }}>
                          {activeContact.online ? "Đang hoạt động" : "Ngoại tuyến"}
                        </span>
                        <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
                        <span style={{ fontSize: "11.5px", color: "#8B5CF6", fontWeight: 600 }}>
                          {activeContact.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {[
                      { icon: RefreshCw, size: 13, action: fetchMessages, spin: loadingMsgs, label: "refresh" },
                      {
                        icon: Phone, size: 14,
                        action: () => !features.advancedChat && toast.info("Phase 2 – Tính năng gọi điện sẽ ra mắt sớm!"),
                        color: features.advancedChat ? "#22C55E" : undefined,
                        locked: !features.advancedChat, label: "phone"
                      },
                      {
                        icon: Video, size: 14,
                        action: () => !features.advancedChat && toast.info("Phase 2 – Tính năng gọi video sẽ ra mắt sớm!"),
                        color: features.advancedChat ? "#6366F1" : undefined,
                        locked: !features.advancedChat, label: "video"
                      },
                      { icon: MoreVertical, size: 14, action: () => {}, label: "more" },
                    ].map(btn => (
                      <motion.button key={btn.label} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                        onClick={btn.action}
                        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <btn.icon
                          size={btn.size}
                          style={{ color: btn.color || "rgba(255,255,255,0.4)" }}
                          className={("spin" in btn && btn.spin) ? "animate-spin" : ""}
                        />
                        {("locked" in btn && btn.locked) && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center"
                            style={{ background: "#F59E0B" }}>
                            <Lock size={5} className="text-white" />
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* ── Messages Area ── */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3"
                  style={{ minHeight: 0, scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.06) transparent" }}>

                  {loadingMsgs ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Loader2 size={26} style={{ color: "#6366F1" }} />
                      </motion.div>
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>Đang tải tin nhắn...</p>
                    </div>
                  ) : convMsgs.length === 0 ? (
                    <NoMessages contact={activeContact} />
                  ) : (
                    <AnimatePresence initial={false}>
                      {convMsgs.map((msg, i) => {
                        const isMe = msg.me;
                        const showAvatar = !isMe && (i === 0 || convMsgs[i - 1]?.me !== false);
                        return (
                          <motion.div key={msg.id}
                            initial={{ opacity: 0, y: 16, scale: 0.93 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 380, damping: 28 }}
                            className={`flex items-end gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}
                          >
                            {/* Other avatar */}
                            {!isMe && (
                              <div style={{ width: 32, flexShrink: 0 }}>
                                {showAvatar && (
                                  <img src={activeContact.avatar} alt=""
                                    className="w-8 h-8 rounded-xl object-cover"
                                    style={{ border: "1px solid rgba(255,255,255,0.08)" }} />
                                )}
                              </div>
                            )}

                            {/* Bubble */}
                            <div className={`flex flex-col gap-1 max-w-[68%] ${isMe ? "items-end" : "items-start"}`}>
                              <motion.div
                                whileHover={{ scale: 1.01 }}
                                className="px-4 py-3 rounded-2xl"
                                style={{
                                  background: isMe ? GRAD : "rgba(255,255,255,0.07)",
                                  borderBottomRightRadius: isMe ? 4 : 18,
                                  borderBottomLeftRadius: isMe ? 18 : 4,
                                  boxShadow: isMe ? "0 4px 20px rgba(99,102,241,0.3)" : "none",
                                  border: isMe ? "none" : "1px solid rgba(255,255,255,0.07)",
                                }}
                              >
                                <p style={{ fontSize: "14px", color: "white", lineHeight: 1.55 }}>{msg.text}</p>
                              </motion.div>
                              <div className="flex items-center gap-1.5 px-1">
                                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>{msg.time}</span>
                                {isMe && (
                                  <CheckCheck size={12} style={{ color: "rgba(99,102,241,0.6)" }} />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-end gap-2.5 justify-start">
                        <img src={activeContact.avatar} alt="" className="w-8 h-8 rounded-xl object-cover flex-shrink-0"
                          style={{ border: "1px solid rgba(255,255,255,0.08)" }} />
                        <div className="rounded-2xl rounded-bl-sm px-1 py-1"
                          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.07)" }}>
                          <TypingDots />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div ref={bottomRef} />
                </div>

                {/* Phase 2 banner */}
                {features.fileApproval && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="mx-5 mb-2 px-4 py-2.5 rounded-2xl flex items-center gap-3"
                    style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
                    <Sparkles size={13} style={{ color: "#6366F1", flexShrink: 0 }} />
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                      <strong style={{ color: "#6366F1" }}>Phase 2:</strong> File approval & phê duyệt trực tuyến đã bật
                    </span>
                  </motion.div>
                )}

                {/* ── Input ── */}
                <div className="flex items-center gap-3 px-4 py-4 flex-shrink-0"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.015)" }}>
                  {/* Text input */}
                  <motion.div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                    whileFocusWithin={{ borderColor: "rgba(99,102,241,0.4)", boxShadow: "0 0 0 3px rgba(99,102,241,0.06)" }}>
                    <input
                      ref={inputRef}
                      value={text}
                      onChange={e => setText(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                      placeholder={`Nhắn gửi ${activeContact.name}...`}
                      className="flex-1 bg-transparent outline-none"
                      style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)" }}
                    />
                  </motion.div>

                  {/* Send button */}
                  <motion.button
                    whileHover={{ scale: 1.07, boxShadow: "0 0 30px rgba(99,102,241,0.5)" }}
                    whileTap={{ scale: 0.93 }}
                    onClick={handleSend}
                    disabled={!text.trim() || sending}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: text.trim() ? GRAD : "rgba(255,255,255,0.05)",
                      boxShadow: text.trim() ? NEON_S : "none",
                      opacity: !text.trim() ? 0.5 : 1,
                    }}
                  >
                    {sending
                      ? <Loader2 size={18} className="text-white animate-spin" />
                      : <Send size={18} className="text-white" style={{ transform: "translateX(1px)" }} />
                    }
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}