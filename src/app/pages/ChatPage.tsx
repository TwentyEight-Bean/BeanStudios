"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Search, Send, Loader2, Lock, RefreshCw, Phone, Video, MoreVertical, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getChatMessages, sendChatMessage, getCreators, getConversations, getOrCreateConversation, type Conversation } from "../lib/localApi";
import { useFeatures } from "../context/FeatureContext";
import { useSearchParams, useRouter } from "next/navigation";

const GRAD = "linear-gradient(135deg, #6366F1, #A855F7)";
const NEON = "0 0 30px rgba(99,102,241,0.35)";
const CARD = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };

export function ChatPage() {
  const { features } = useFeatures();
  const searchParams = useSearchParams();
  const chatWith = searchParams.get("chatWith");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages]     = useState<any[]>([]);
  const [text, setText]             = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending]       = useState(false);
  const [search, setSearch]         = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let convs = getConversations();
    if (chatWith) {
      const creators = getCreators();
      const found = creators.find(c => c.id === chatWith);
      if (found) {
        const newConv = getOrCreateConversation(chatWith, found.name, found.role, found.img);
        convs = getConversations(); // refresh
        setActiveConv(newConv.id);
      }
    } else if (convs.length > 0) {
      setActiveConv(convs[0].id);
    }
    setConversations(convs);
  }, [chatWith]);

  const activeContact = conversations.find(c => c.id === activeConv);
  const convMsgs      = messages || [];

  const fetchMessages = async () => {
    if (!activeConv) { setMessages([]); return; }
    setLoadingMsgs(true);
    try {
      const stored = getChatMessages(activeConv);
      setMessages(stored);
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
    const optimistic = { id: `opt_${Date.now()}`, text: text.trim(), me: true, time: new Date().toLocaleTimeString("vi", { hour: "2-digit", minute: "2-digit" }) };
    setMessages(p => [...p, optimistic]);
    setText("");
    try {
      sendChatMessage(activeConv!, text.trim(), true, "Tôi");
    } catch { toast.error("Không thể gửi tin nhắn"); }
    finally { setSending(false); }
  };

  const filteredConvs = conversations.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: "#07070F", height: "100%", color: "white", display: "flex", flexDirection: "column" }}>
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>

        {/* ── Sidebar ── */}
        <div className="hidden md:flex flex-col w-72 flex-shrink-0" style={{ borderRight: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
          {/* Header */}
          <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: GRAD, boxShadow: NEON }}>
                <Sparkles size={15} className="text-white" />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 800, letterSpacing: "-0.01em" }}>Tin Nhắn</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>Real-time · Supabase KV</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Search size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Tìm creator..."
                className="bg-transparent outline-none flex-1"
                style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.7)" }} />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            {filteredConvs.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border"
                style={{
                  background: activeConv === c.id ? "rgba(99,102,241,0.15)" : "transparent",
                  borderColor: activeConv === c.id ? "rgba(99,102,241,0.3)" : "transparent"
                }}
                onClick={() => setActiveConv(c.id)}>
                <div className="relative">
                  <img src={c.avatar} alt="" className="w-11 h-11 rounded-xl object-cover" />
                  {c.online && (
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full"
                      style={{ background: "#22C55E", border: "2px solid #07070F" }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "white" }} className="truncate">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: "11px", color: "#6366F1", fontWeight: 600 }}>{c.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Chat area ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
            <div className="flex items-center gap-3">
              {activeContact ? (
                <>
                  <div className="relative flex-shrink-0">
                    <img src={activeContact.avatar} alt="" className="w-10 h-10 rounded-xl object-cover"
                      style={{ border: "2px solid rgba(99,102,241,0.4)" }} />
                    {activeContact.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
                        style={{ background: "#22C55E", border: "2px solid #07070F" }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 800 }}>{activeContact.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span style={{ fontSize: "12px", color: activeContact.online ? "#22C55E" : "rgba(255,255,255,0.4)", fontWeight: 600 }}>
                        {activeContact.online ? "Đang hoạt động" : "Ngoại tuyến"}
                      </span>
                      <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                      <span style={{ fontSize: "12px", color: "#6366F1", fontWeight: 600 }}>{activeContact.role}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-white/50">Không có cuộc trò chuyện nào</div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                onClick={() => fetchMessages()}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-white/5 hover:bg-white/10"
                style={CARD}>
                <RefreshCw size={14} style={{ color: "rgba(255,255,255,0.4)" }} className={loadingMsgs ? "animate-spin" : ""} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                onClick={() => { if (!features.advancedChat) { toast.info("Phase 2 – Tính năng gọi điện sẽ ra mắt sớm!"); return; } }}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-white/5 hover:bg-white/10 relative"
                style={CARD}>
                <Phone size={14} style={{ color: features.advancedChat ? "#22C55E" : "rgba(255,255,255,0.25)" }} />
                {!features.advancedChat && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full flex items-center justify-center" style={{ background: "#F59E0B" }}><Lock size={5} className="text-white" /></div>}
              </motion.button>
              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                onClick={() => { if (!features.advancedChat) { toast.info("Phase 2 – Tính năng gọi video sẽ ra mắt sớm!"); return; } }}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-white/5 hover:bg-white/10 relative"
                style={CARD}>
                <Video size={14} style={{ color: features.advancedChat ? "#6366F1" : "rgba(255,255,255,0.25)" }} />
                {!features.advancedChat && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full flex items-center justify-center" style={{ background: "#F59E0B" }}><Lock size={5} className="text-white" /></div>}
              </motion.button>
              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10" style={CARD}>
                <MoreVertical size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
              </motion.button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ minHeight: 0 }}>
            {loadingMsgs ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 size={24} className="animate-spin mx-auto mb-3" style={{ color: "#6366F1" }} />
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>Đang tải tin nhắn...</p>
                </div>
              </div>
            ) : (
              <>
                <AnimatePresence initial={false}>
                  {convMsgs.map((msg, i) => (
                    <motion.div key={msg.id}
                      initial={{ opacity: 0, y: 12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: i < 5 ? 0 : 0, type: "spring", stiffness: 400, damping: 30 }}
                      className={`flex ${msg.me ? "justify-end" : "justify-start"} gap-2`}>
                      {!msg.me && activeContact && (
                        <img src={activeContact.avatar} alt="" className="w-7 h-7 rounded-lg object-cover flex-shrink-0 mt-1"
                          style={{ border: "1px solid rgba(255,255,255,0.1)" }} />
                      )}
                      <div className={`max-w-[70%] ${msg.me ? "items-end" : "items-start"} flex flex-col gap-1`}>
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
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Phase 2 file approval banner */}
          {features.fileApproval && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="mx-5 mb-2 p-3 rounded-2xl flex items-center gap-3"
              style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <Sparkles size={14} style={{ color: "#6366F1" }} />
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                <strong style={{ color: "#6366F1" }}>Phase 2 Unlocked:</strong> File approval & phê duyệt trực tuyến đã bật
              </span>
            </motion.div>
          )}

          {/* Input */}
          <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <input value={text} onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder={activeContact ? `Nhắn gửi ${activeContact.name}...` : `Gửi tin nhắn...`}
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.85)" }} />
            </div>
            <motion.button whileHover={{ scale: 1.08, boxShadow: "0 0 24px rgba(99,102,241,0.5)" }} whileTap={{ scale: 0.92 }}
              onClick={handleSend} disabled={!text.trim() || sending}
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{ background: text.trim() ? GRAD : "rgba(255,255,255,0.06)", opacity: !text.trim() ? 0.5 : 1 }}>
              {sending ? <Loader2 size={17} className="text-white animate-spin" /> : <Send size={17} className="text-white" />}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}