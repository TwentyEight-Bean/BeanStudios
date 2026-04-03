"use client";

import { memo } from "react";
import Link from "next/link";
import { Bell, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Notification } from "@/app/lib/localApi";

interface NotificationsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onNotifClick: (n: Notification) => void;
  ACCENT: string;
}

export const NotificationsMenu = memo(({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAllRead,
  onNotifClick,
  ACCENT
}: NotificationsMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden z-50"
          style={{ background: "#0E0E1C", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
          <div className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2">
              <Bell size={14} style={{ color: ACCENT }} />
              <span style={{ fontSize: "13px", fontWeight: 700, color: "white" }}>Thông Báo</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-white"
                  style={{ fontSize: "9px", fontWeight: 800, background: "#EF4444" }}>{unreadCount}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={onMarkAllRead} style={{ fontSize: "11px", color: ACCENT, fontWeight: 600 }}>Đọc hết</button>
              )}
              <button onClick={onClose} style={{ color: "rgba(255,255,255,0.3)" }}>
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map((n, i) => (
                <motion.div key={n.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="px-4 py-3 flex gap-3 items-start cursor-pointer transition-all"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: !n.read ? "rgba(99,102,241,0.05)" : "transparent" }}
                  onClick={() => onNotifClick(n)}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                  onMouseLeave={e => (e.currentTarget.style.background = !n.read ? "rgba(99,102,241,0.05)" : "transparent")}>
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.color, boxShadow: !n.read ? `0 0 6px ${n.color}` : "none", opacity: n.read ? 0.4 : 1 }} />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: "12px", color: !n.read ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)", lineHeight: 1.5, fontWeight: !n.read ? 600 : 400 }}>
                      <span style={{ fontWeight: !n.read ? 700 : 600 }}>{n.title}: </span>{n.body}
                    </p>
                    <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", marginTop: 3 }}>
                      {(() => {
                        const diff = Date.now() - new Date(n.createdAt).getTime();
                        const m = Math.floor(diff / 60000);
                        const h = Math.floor(diff / 3600000);
                        if (m < 1) return "Vừa xong";
                        if (m < 60) return `${m} phút trước`;
                        return `${h} giờ trước`;
                      })()}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-8 text-center">
                <Bell size={24} style={{ color: "rgba(255,255,255,0.1)", margin: "0 auto 8px" }} />
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>Không có thông báo mới</p>
              </div>
            )}
          </div>
          <div className="px-4 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <Link href="/thong-bao" onClick={onClose}
              className="w-full flex items-center justify-center gap-1"
              style={{ fontSize: "11.5px", color: ACCENT, fontWeight: 600 }}>
              Xem tất cả thông báo <ArrowRight size={11} />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
