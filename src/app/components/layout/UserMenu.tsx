"use client";

import { memo } from "react";
import Link from "next/link";
import { User, Bell, Settings, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  unreadCount: number;
  profileTo: string;
  handleLogout: () => void;
  ACCENT: string;
}

export const UserMenu = memo(({
  isOpen,
  onClose,
  user,
  unreadCount,
  profileTo,
  handleLogout,
  ACCENT
}: UserMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute right-0 top-12 w-52 rounded-2xl overflow-hidden z-50"
          style={{ background: "#0E0E1C", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
          <div className="p-4 flex items-center gap-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(99,102,241,0.06)" }}>
            <div className="relative">
              <img src={user!.avatar} alt="" className="w-10 h-10 rounded-xl object-cover"
                style={{ border: "2px solid rgba(99,102,241,0.4)" }} />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                style={{ background: "#22C55E", border: "2px solid #0E0E1C" }} />
            </div>
            <div className="min-w-0">
              <div style={{ fontSize: "13px", fontWeight: 700, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user!.name}</div>
              <div style={{ fontSize: "11px", color: ACCENT, fontWeight: 600 }}>{user!.role}</div>
            </div>
          </div>
          <div className="p-2">
            {[
              { to: profileTo, icon: User, label: "Hồ Sơ" },
              { to: "/thong-bao", icon: Bell, label: "Thông Báo", badge: unreadCount },
              { to: "/cai-dat", icon: Settings, label: "Cài Đặt" },
            ].map(({ to, icon: Icon, label, badge }) => (
              <Link key={to} href={to} onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors"
                style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <Icon size={14} style={{ color: ACCENT }} /> {label}
                {badge && badge > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full text-white"
                    style={{ fontSize: "9px", fontWeight: 800, background: "#EF4444" }}>{badge}</span>
                )}
              </Link>
            ))}
            <button onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors"
              style={{ fontSize: "13px", color: "#EF4444" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <LogOut size={14} /> Đăng Xuất
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
