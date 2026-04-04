"use client";

import { useState, useRef, useEffect, useCallback, memo, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, Search, Briefcase, MessageCircle, Bell, User, Settings,
  ChevronLeft, ChevronRight, Rss, BookOpen, Shield, Calendar,
  Menu, X, LogOut, Zap, LogIn, UserPlus, Sparkles, ArrowRight, Camera
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/app/context/AuthContext";
import { AuthModal } from "@/app/components/auth/AuthModal";
import { OnboardingWizard } from "@/app/components/onboarding/OnboardingWizard";
import { toast } from "sonner";
import {
  getNotifications, markAllNotificationsRead, markNotificationRead,
  getUnreadNotificationCount, globalSearch, type SearchResult, type Notification
} from "@/app/lib/localApi";
import { SearchOverlay } from "@/app/components/layout/SearchOverlay";
import { NotificationsMenu } from "@/app/components/layout/NotificationsMenu";
import { UserMenu } from "@/app/components/layout/UserMenu";

// ── Design tokens ────────────────────────────────────────────────────────────
const BG_SIDEBAR   = "#0A0A14";
const BG_TOPBAR    = "rgba(7,7,15,0.92)";
const BORDER       = "rgba(255,255,255,0.07)";
const ACCENT       = "#6366F1";
const GRAD         = "linear-gradient(135deg, #6366F1, #A855F7)";
const NEON_SM      = "0 0 20px rgba(99,102,241,0.35)";

const RESULT_TYPE_LABELS: Record<string, string> = {
  creator: "Creator",
  booking: "Công Việc",
  blog:    "Blog",
};

const bottomNavItems = [
  { to: "/",          icon: Home,     label: "Chủ",       color: "#6366F1" },
  { to: "/kham-pha",  icon: Search,   label: "Khám Phá",  color: "#A855F7" },
  { to: "/dich-vu",   icon: Camera,   label: "Dịch Vụ",   color: "#EC4899" },
  { to: "/dat-lich",  icon: Calendar, label: "Đặt Lịch",  color: "#22C55E" },
  { to: "/thong-bao", icon: Bell,     label: "Thông Báo", color: "#F59E0B" },
];

// ── Sidebar Content ──────────────────────────────────────────────────────────
const SidebarContent = memo(({
  collapsed,
  mobile = false,
  navItems,
  pathname,
  unreadCount,
  isLoggedIn,
  user,
  handleLogout,
  openLogin,
  openRegister,
}: any) => (
  <>
    {/* Logo */}
    <div className="flex items-center h-16 px-3.5 flex-shrink-0"
      style={{ borderBottom: `1px solid ${BORDER}` }}>
      <Link href="/" className="flex items-center gap-3">
        <motion.div whileHover={{ scale: 1.08, rotate: 5 }} whileTap={{ scale: 0.95 }}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative"
          style={{ background: GRAD, boxShadow: NEON_SM }}>
          <Zap size={17} className="text-white" />
          <div className="absolute inset-0 rounded-xl"
            style={{ background: GRAD, opacity: 0.4, filter: "blur(8px)", transform: "scale(1.4)" }} />
        </motion.div>
        <AnimatePresence>
          {(!collapsed || mobile) && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
              <div style={{ fontSize: "13px", fontWeight: 900, color: "white", letterSpacing: "0.06em", lineHeight: 1 }}>
                STUDIO<span style={{ color: ACCENT }}>BOOK</span>
              </div>
              <div style={{ fontSize: "8.5px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.18em", fontWeight: 700, marginTop: 2 }}>
                VIETNAM
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>
    </div>

    {/* Nav */}
    <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto custom-scrollbar">
      {navItems.map(({ to, icon: Icon, label, color }: any) => {
        const active = to === "/" 
          ? pathname === "/" 
          : pathname === to || pathname.startsWith(to + "/");
        const isNotif = to === "/thong-bao";
        return (
          <Link key={to} href={to}
            className="flex items-center px-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden"
            style={{
              height: "40px",
              background: active ? `${color}18` : "transparent",
              color: active ? color : "rgba(255,255,255,0.4)",
              paddingLeft: collapsed && !mobile ? "14px" : "10px",
            }}>
            {active && (
              <motion.div layoutId="nav-active-bar"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }} />
            )}
            <div className="relative flex-shrink-0 w-6 flex items-center justify-center mr-3 transition-all duration-300"
              style={{ marginRight: collapsed && !mobile ? "0" : "12px" }}>
              <Icon size={18} style={{ color: active ? color : "rgba(255,255,255,0.3)" }}
                className="group-hover:scale-110 transition-transform flex-shrink-0" />
              {isNotif && unreadCount > 0 && (
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white"
                  style={{ background: "linear-gradient(135deg,#EF4444,#DC2626)", fontSize: "8px", fontWeight: 800 }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </div>
              )}
            </div>
            {(!collapsed || mobile) && (
              <motion.span
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                style={{ fontSize: "12.5px", fontWeight: active ? 700 : 500, color: active ? color : "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}
                className="group-hover:text-white/70 transition-colors">
                {label}
              </motion.span>
            )}
          </Link>
        );
      })}
    </nav>

    {/* Divider */}
    <div className="mx-3" style={{ height: 1, background: BORDER }} />

    {/* Bottom User */}
    <div className="p-2 pb-3">
      {isLoggedIn ? (
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl"
          style={{ background: "rgba(99,102,241,0.08)" }}>
          <div className="relative flex-shrink-0">
            <img src={user!.avatar} alt="avatar"
              className="w-8 h-8 rounded-lg object-cover"
              style={{ border: "2px solid rgba(99,102,241,0.4)" }} />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: "#22C55E", borderColor: BG_SIDEBAR }} />
          </div>
          <AnimatePresence>
            {(!collapsed || mobile) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                <div style={{ fontSize: "12px", fontWeight: 700, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user!.name}
                </div>
                <div style={{ fontSize: "10px", color: ACCENT, fontWeight: 600 }}>{user!.role}</div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {(!collapsed || mobile) && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={handleLogout}
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/10"
                title="Đăng xuất">
                <LogOut size={13} style={{ color: "rgba(255,255,255,0.25)" }} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <AnimatePresence mode="popLayout" initial={false}>
          {(!collapsed || mobile) ? (
            <motion.div key="expanded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-1.5 w-full flex flex-col overflow-hidden">
              <button onClick={openLogin}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl transition-all"
                style={{ border: "1px solid rgba(99,102,241,0.3)", fontSize: "11.5px", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)")}>
                <LogIn size={13} /> Đăng Nhập
              </button>
              <button onClick={openRegister}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-white transition-all"
                style={{ background: GRAD, fontSize: "11.5px", fontWeight: 700, boxShadow: NEON_SM }}>
                <UserPlus size={13} /> Đăng Ký
              </button>
            </motion.div>
          ) : (
            <motion.button key="collapsed" onClick={openLogin} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
              className="w-full flex items-center justify-center py-2 rounded-xl transition-colors"
              style={{ border: "1px solid rgba(99,102,241,0.3)" }}>
              <LogIn size={15} style={{ color: ACCENT }} />
            </motion.button>
          )}
        </AnimatePresence>
      )}
    </div>
  </>
));

// ── Main Layout Shell ────────────────────────────────────────────────────────
export function LayoutShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed]       = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]   = useState(0);

  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, logout, setShowAuthModal, setAuthTab } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchOverlayRef = useRef<HTMLDivElement>(null);

  const profileTo = isLoggedIn ? `/ho-so/${user?.id}` : "/ho-so/c1";

  const dynamicNavItems = useMemo(() => [
    { to: "/",          icon: Home,          label: "Trang Chủ",  color: "#6366F1" },
    { to: "/kham-pha",  icon: Search,        label: "Khám Phá",   color: "#A855F7" },
    { to: "/dich-vu",   icon: Camera,        label: "Dịch Vụ",    color: "#EC4899" },
    { to: "/cong-viec", icon: Briefcase,     label: "Công Việc",  color: "#3B82F6" },
    { to: "/dat-lich",  icon: Calendar,      label: "Đặt Lịch",   color: "#22C55E" },
    { to: "/tin-nhan",  icon: MessageCircle, label: "Tin Nhắn",   color: "#F59E0B" },
    { to: "/bang-tin",  icon: Rss,           label: "Bảng Tin",   color: "#EC4899" },
    { to: "/blog",      icon: BookOpen,      label: "Blog",       color: "#06B6D4" },
    { to: profileTo,    icon: User,          label: "Hồ Sơ",      color: "#A855F7" },
    { to: "/thong-bao", icon: Bell,          label: "Thông Báo",  color: "#F59E0B" },
    { to: "/cai-dat",   icon: Settings,      label: "Cài Đặt",    color: "#6B7280" },
    { to: "/quan-tri",  icon: Shield,        label: "Quản Trị",   color: "#EF4444" },
  ], [profileTo]);

  const reloadNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const n = await getNotifications();
      const count = await getUnreadNotificationCount();
      setNotifications(n);
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to reload notifications", err);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    reloadNotifications();
    const interval = setInterval(reloadNotifications, 30000);
    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith("notif:")) reloadNotifications();
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("notif_update", reloadNotifications);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("notif_update", reloadNotifications);
    };
  }, [reloadNotifications]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    let active = true;
    const updateSearch = async () => {
      if (searchQuery.length >= 2) {
        const results = await globalSearch(searchQuery);
        if (active) setSearchResults(results);
      } else {
        if (active) setSearchResults([]);
      }
    };
    updateSearch();
    return () => { active = false; };
  }, [searchQuery]);

  const handleLogout = useCallback(() => { logout(); setUserMenuOpen(false); toast.success("Đã đăng xuất thành công"); }, [logout]);
  const openLogin    = useCallback(() => { setAuthTab("login");    setShowAuthModal(true); }, [setAuthTab, setShowAuthModal]);
  const openRegister = useCallback(() => { setAuthTab("register"); setShowAuthModal(true); }, [setAuthTab, setShowAuthModal]);

  const handleMarkAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    window.dispatchEvent(new Event("notif_update"));
    toast.success("Đã đánh dấu tất cả đã đọc!");
  }, []);

  const handleNotifClick = useCallback(async (n: Notification) => {
    await markNotificationRead(n.id);
    window.dispatchEvent(new Event("notif_update"));
    setNotifOpen(false);
    if (n.link) router.push(n.link);
  }, [router]);

  const handleSearchSelect = useCallback((result: SearchResult) => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    router.push(result.link);
  }, [router]);

  const sidebarProps = {
    collapsed,
    navItems: dynamicNavItems,
    pathname,
    unreadCount,
    isLoggedIn,
    user,
    handleLogout,
    openLogin,
    openRegister,
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#07070F" }}>

      {/* ═══ Desktop Sidebar ═══ */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        className="hidden lg:flex flex-col relative z-30 flex-shrink-0"
        style={{
          backgroundColor: BG_SIDEBAR,
          borderRightWidth: 1,
          borderRightStyle: "solid",
          borderRightColor: BORDER,
          boxShadow: "4px 0 40px rgba(0,0,0,0.4)",
        }}>
        <SidebarContent {...sidebarProps} />

        {/* Toggle Button — Original strip style, anchoring left so width expansion goes right */}
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          whileHover={{ width: 24, backgroundColor: "rgba(99, 102, 241, 0.12)" }}
          initial={{ width: 16 }}
          animate={{ width: 16 }}
          className="absolute top-1/2 -translate-y-1/2 h-20 rounded-r-2xl flex items-center justify-center z-50 group cursor-pointer overflow-hidden transition-colors"
          style={{
            left: "100%", // Anchor to the exact right edge of the sidebar
            backgroundColor: BG_SIDEBAR,
            borderTopWidth: 1, borderTopStyle: "solid", borderTopColor: BORDER,
            borderRightWidth: 1, borderRightStyle: "solid", borderRightColor: BORDER,
            borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: BORDER,
            borderLeftWidth: 0,
            boxShadow: "4px 0 20px rgba(0,0,0,0.5)",
          }}>
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180, x: collapsed ? 0 : -2 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="flex items-center justify-center transition-opacity">
            <ChevronRight size={14} className="scale-75 group-hover:scale-100 transition-transform"
              style={{ color: collapsed ? ACCENT : "rgba(255,255,255,0.4)" }} />
          </motion.div>
          <div className="absolute left-0 top-1/4 bottom-1/4 w-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: ACCENT, boxShadow: `0 0 10px ${ACCENT}` }} />
        </motion.button>
      </motion.aside>

      {/* ═══ Mobile Sidebar ═══ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
              onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-64 z-50 lg:hidden flex flex-col shadow-2xl"
              style={{ backgroundColor: BG_SIDEBAR }}>
              <SidebarContent {...sidebarProps} mobile={true} />
              <button onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.05)" }}>
                <X size={18} />
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ═══ Main Area ═══ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-4 lg:px-5 flex-shrink-0 relative z-20"
          style={{
            background: BG_TOPBAR,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderBottom: `1px solid ${BORDER}`,
            boxShadow: "0 1px 30px rgba(0,0,0,0.4)",
          }}>
          <button className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
            onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-sm">
            <motion.div
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}
              whileHover={{ borderColor: "rgba(99,102,241,0.4)", background: "rgba(99,102,241,0.06)" }}>
              <Search size={14} style={{ color: ACCENT }} />
              <span style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.35)", flex: 1 }}>Tìm kiếm creator, dự án...</span>
              <kbd style={{ fontSize: "9px", color: "rgba(255,255,255,0.15)", fontFamily: "monospace", background: "rgba(255,255,255,0.05)", padding: "1px 4px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.08)" }}>⌘K</kbd>
            </motion.div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Phase badge */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full"
              style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <Sparkles size={10} style={{ color: ACCENT }} />
              <span style={{ fontSize: "10px", color: ACCENT, fontWeight: 700, letterSpacing: "0.04em" }}>Phase 1</span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) reloadNotifications(); }}
                className="w-9 h-9 rounded-xl flex items-center justify-center relative transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
                <Bell size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
                {unreadCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white"
                    style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)", fontSize: "8px", fontWeight: 800 }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </motion.span>
                )}
              </motion.button>
              <NotificationsMenu
                isOpen={notifOpen}
                onClose={() => setNotifOpen(false)}
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAllRead={handleMarkAllRead}
                onNotifClick={handleNotifClick}
                ACCENT={ACCENT}
              />
            </div>

            {/* User Menu */}
            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)} className="relative">
                  <img src={user!.avatar} alt="avatar"
                    className="w-9 h-9 rounded-xl object-cover"
                    style={{ border: "2px solid rgba(99,102,241,0.4)", boxShadow: "0 2px 12px rgba(99,102,241,0.3)" }} />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                    style={{ background: "#22C55E", border: "2px solid #07070F" }} />
                </motion.button>
                <UserMenu
                  isOpen={userMenuOpen}
                  onClose={() => setUserMenuOpen(false)}
                  user={user}
                  unreadCount={unreadCount}
                  profileTo={profileTo}
                  handleLogout={handleLogout}
                  ACCENT={ACCENT}
                />
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button onClick={openLogin}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all"
                  style={{ border: "1px solid rgba(99,102,241,0.3)", fontSize: "12px", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)")}>
                  <LogIn size={13} /> Đăng Nhập
                </button>
                <motion.button onClick={openRegister} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white"
                  style={{ background: GRAD, fontSize: "12px", fontWeight: 700, boxShadow: NEON_SM }}>
                  <UserPlus size={13} />
                  <span className="hidden sm:inline">Đăng Ký</span>
                </motion.button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        {/* Chat page gets full-height treatment (no scroll on main) */}
        {pathname === "/tin-nhan" ? (
          <main className="flex-1 flex flex-col overflow-hidden relative" style={{ background: "#0A0A14" }}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15, ease: "linear" }}
              className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
              {children}
            </motion.div>
          </main>
        ) : (
          <main className="flex-1 overflow-y-auto relative pb-24 lg:pb-0" style={{ background: "#07070F" }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, ease: "linear" }}
                className="min-h-full">
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        )}

        {/* ═══ Mobile Bottom Navigation ═══ */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-1 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
          style={{
            background: "rgba(10,10,20,0.97)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 -4px 30px rgba(0,0,0,0.5)",
          }}>
          {bottomNavItems.map(({ to, icon: Icon, label, color }) => {
            const active = pathname === to || (to !== "/" && pathname.startsWith(to));
            const isNotif = to === "/thong-bao";
            return (
              <Link key={to} href={to}
                className="flex flex-col items-center gap-0.5 min-w-[56px] py-1 px-2 rounded-xl transition-all"
                style={{ background: active ? `${color}15` : "transparent" }}>
                <div className="relative">
                  <Icon size={21} style={{ color: active ? color : "rgba(255,255,255,0.35)", transition: "all 0.2s" }} />
                  {isNotif && unreadCount > 0 && (
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white"
                      style={{ background: "#EF4444", fontSize: "7px", fontWeight: 800 }}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: "9px", color: active ? color : "rgba(255,255,255,0.3)", fontWeight: active ? 700 : 500, transition: "all 0.2s" }}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ═══ Global Search Overlay ═══ */}
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }}
        query={searchQuery}
        setQuery={setSearchQuery}
        results={searchResults}
        onSelect={handleSearchSelect}
        ACCENT={ACCENT}
      />

      {/* Auth Modal */}
      <AuthModal />
      <OnboardingWizard />
    </div>
  );
}
