"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell, Check, Trash2, Filter, Briefcase, MessageCircle,
  Settings, Sparkles, ArrowRight, CheckCheck, X
} from "lucide-react";
import { toast } from "sonner";
import {
  getNotifications, markNotificationRead, markAllNotificationsRead,
  clearReadNotifications, type Notification
} from "../lib/localApi";
import { useAuth } from "../context/AuthContext";

const GRAD = "linear-gradient(135deg, #6366F1, #A855F7)";
const NEON = "0 0 30px rgba(99,102,241,0.3)";
const CARD = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };

const TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  booking: { label: "Đặt Lịch", icon: Briefcase, color: "#6366F1" },
  message: { label: "Tin Nhắn", icon: MessageCircle, color: "#F59E0B" },
  system:  { label: "Hệ Thống", icon: Settings, color: "#22C55E" },
  promo:   { label: "Khuyến Mãi", icon: Sparkles, color: "#A855F7" },
};

const FILTER_TABS = ["Tất Cả", "Chưa Đọc", "Đặt Lịch", "Tin Nhắn", "Hệ Thống", "Khuyến Mãi"];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "Vừa xong";
  if (m < 60) return `${m} phút trước`;
  if (h < 24) return `${h} giờ trước`;
  if (d < 7) return `${d} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
}

function groupByDate(notifications: Notification[]): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const weekAgo = today - 7 * 86400000;

  notifications.forEach(n => {
    const t = new Date(n.createdAt).getTime();
    let key: string;
    if (t >= today) key = "Hôm Nay";
    else if (t >= yesterday) key = "Hôm Qua";
    else if (t >= weekAgo) key = "Tuần Này";
    else key = "Cũ Hơn";
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });
  return groups;
}

export function NotificationsPage() {
  const { isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState("Tất Cả");

  const reload = async () => {
    if (!isLoggedIn) return;
    try {
      const data = await getNotifications();
      setNotifications(data || []);
    } catch {
      setNotifications([]);
    }
  };
  useEffect(() => { reload(); }, [isLoggedIn]);

  const filtered = notifications.filter(n => {
    if (filter === "Tất Cả") return true;
    if (filter === "Chưa Đọc") return !n.read;
    if (filter === "Đặt Lịch") return n.type === "booking";
    if (filter === "Tin Nhắn") return n.type === "message";
    if (filter === "Hệ Thống") return n.type === "system";
    if (filter === "Khuyến Mãi") return n.type === "promo";
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const grouped = groupByDate(filtered);
  const groupOrder = ["Hôm Nay", "Hôm Qua", "Tuần Này", "Cũ Hơn"];

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    reload();
  };

  const handleMarkAll = () => {
    markAllNotificationsRead();
    reload();
    toast.success("Đã đánh dấu tất cả đã đọc!");
  };

  const handleClearRead = () => {
    clearReadNotifications();
    reload();
    toast.info("Đã xóa thông báo đã đọc");
  };

  return (
    <div style={{ background: "#07070F", minHeight: "100%", color: "white" }}>
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 -left-40 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.4) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-3"
                style={{ border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)" }}>
                <Bell size={10} style={{ color: "#6366F1" }} />
                <span style={{ fontSize: "10.5px", color: "#6366F1", fontWeight: 700, letterSpacing: "0.12em" }}>THÔNG BÁO</span>
              </div>
              <h1 style={{ fontSize: "clamp(1.5rem,4vw,2rem)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                Thông Báo{" "}
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-white"
                    style={{ background: "linear-gradient(135deg,#EF4444,#DC2626)", fontSize: "0.75rem", fontWeight: 800, verticalAlign: "middle" }}>
                    {unreadCount}
                  </span>
                )}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <motion.button onClick={handleMarkAll} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all"
                  style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", fontSize: "12px", color: "#22C55E", fontWeight: 600 }}>
                  <CheckCheck size={13} /> Đọc Tất Cả
                </motion.button>
              )}
              <motion.button onClick={handleClearRead} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all"
                style={{ ...CARD, fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
                <Trash2 size={13} /> Dọn Dẹp
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
          className="flex gap-2 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: "none" }}>
          {FILTER_TABS.map((tab, i) => {
            const count = tab === "Chưa Đọc" ? unreadCount
              : tab === "Tất Cả" ? notifications.length
              : notifications.filter(n =>
                  tab === "Đặt Lịch" ? n.type === "booking"
                  : tab === "Tin Nhắn" ? n.type === "message"
                  : tab === "Hệ Thống" ? n.type === "system"
                  : n.type === "promo"
                ).length;
            return (
              <motion.button key={tab} onClick={() => setFilter(tab)}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="px-4 py-2 rounded-xl whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-1.5"
                style={{
                  background: filter === tab ? GRAD : "rgba(255,255,255,0.04)",
                  border: filter === tab ? "none" : "1px solid rgba(255,255,255,0.1)",
                  color: filter === tab ? "white" : "rgba(255,255,255,0.5)",
                  fontSize: "12.5px", fontWeight: filter === tab ? 700 : 500,
                  boxShadow: filter === tab ? NEON : "none",
                }}>
                {tab}
                {count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-white"
                    style={{ fontSize: "9px", fontWeight: 800, background: filter === tab ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)" }}>
                    {count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Notification Groups */}
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
              <Bell size={32} style={{ color: "#6366F1", opacity: 0.5 }} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: 8 }}>Không có thông báo</h3>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px" }}>
              {filter === "Chưa Đọc" ? "Bạn đã đọc tất cả thông báo!" : "Thử chọn bộ lọc khác"}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {groupOrder.map(group => {
              const items = grouped[group];
              if (!items?.length) return null;
              return (
                <div key={group}>
                  {/* Group label */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", fontWeight: 700, letterSpacing: "0.14em" }}>
                      {group.toUpperCase()}
                    </span>
                    <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    <AnimatePresence>
                      {items.map((n, i) => {
                        const cfg = TYPE_LABELS[n.type] || TYPE_LABELS.system;
                        const TypeIcon = cfg.icon;
                        return (
                          <motion.div key={n.id}
                            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 16, height: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="relative flex items-start gap-3.5 p-4 rounded-2xl transition-all group cursor-pointer"
                            style={{
                              background: !n.read ? "rgba(99,102,241,0.07)" : "rgba(255,255,255,0.03)",
                              border: !n.read ? "1px solid rgba(99,102,241,0.18)" : "1px solid rgba(255,255,255,0.06)",
                            }}
                            onClick={() => !n.read && handleMarkRead(n.id)}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                            onMouseLeave={e => (e.currentTarget.style.background = !n.read ? "rgba(99,102,241,0.07)" : "rgba(255,255,255,0.03)")}>

                            {/* Unread dot */}
                            {!n.read && (
                              <div className="absolute top-4 right-4 w-2 h-2 rounded-full flex-shrink-0"
                                style={{ background: n.color, boxShadow: `0 0 8px ${n.color}` }} />
                            )}

                            {/* Icon */}
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ background: `${n.color}15`, border: `1px solid ${n.color}25` }}>
                              <TypeIcon size={16} style={{ color: n.color }} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pr-4">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span style={{ fontSize: "13.5px", fontWeight: !n.read ? 700 : 600, color: !n.read ? "white" : "rgba(255,255,255,0.65)" }}>
                                  {n.title}
                                </span>
                                <span className="px-2 py-0.5 rounded-full flex-shrink-0"
                                  style={{ background: `${n.color}15`, fontSize: "9px", color: n.color, fontWeight: 700, border: `1px solid ${n.color}20` }}>
                                  {cfg.label}
                                </span>
                              </div>
                              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: 6 }}>
                                {n.body}
                              </p>
                              <div className="flex items-center gap-3">
                                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>{timeAgo(n.createdAt)}</span>
                                {n.link && (
                                  <Link href={n.link} onClick={e => e.stopPropagation()}>
                                    <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                      style={{ fontSize: "11px", color: "#6366F1", fontWeight: 700 }}>
                                      Xem <ArrowRight size={10} />
                                    </span>
                                  </Link>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!n.read && (
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                  onClick={e => { e.stopPropagation(); handleMarkRead(n.id); }}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                                  style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                                  <Check size={12} style={{ color: "#22C55E" }} />
                                </motion.button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
