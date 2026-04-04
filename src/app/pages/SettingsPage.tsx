"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Bell, Lock, Eye, Monitor, Globe, Shield,
  Check, X, Save, Camera, Trash2, AlertTriangle,
  ChevronRight, Zap, Star, LogOut, RefreshCw, Info
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import {
  getUserSettings, saveUserSettings, saveUserProfile,
  type UserSettings
} from "../lib/localApi";

const GRAD   = "linear-gradient(135deg, #6366F1, #A855F7)";
const NEON   = "0 0 30px rgba(99,102,241,0.3)";
const CARD   = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };
const INPUT  = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)", fontSize: "14px" };

const TABS = [
  { key: "account",  label: "Tài Khoản",     icon: User    },
  { key: "notif",    label: "Thông Báo",      icon: Bell    },
  { key: "privacy",  label: "Quyền Riêng Tư", icon: Eye     },
  { key: "display",  label: "Hiển Thị",       icon: Monitor },
  { key: "about",    label: "Về Ứng Dụng",    icon: Info    },
];

const ROLES = ["Nhiếp Ảnh Gia", "Quay Phim", "Model", "Editor", "Stylist", "Đạo Diễn", "Makeup Artist", "Khác"];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <motion.button onClick={() => onChange(!value)} whileTap={{ scale: 0.9 }}
      className="w-12 h-6 rounded-full relative transition-all flex-shrink-0"
      style={{ background: value ? GRAD : "rgba(255,255,255,0.1)" }}>
      <motion.div animate={{ x: value ? 24 : 2 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="absolute top-0.5 w-5 h-5 rounded-full"
        style={{ background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }} />
    </motion.button>
  );
}

export function SettingsPage() {
  const { user, logout, isLoggedIn, refreshUser } = useAuth();
  const [tab, setTab] = useState("account");

  // Account form
  const [name,      setName]      = useState(user?.name || "");
  const [role,      setRole]      = useState(user?.role || "Nhiếp Ảnh Gia");
  const [bio,       setBio]       = useState("Nhiếp ảnh gia với 5 năm kinh nghiệm trong lĩnh vực fashion & portrait.");
  const [location,  setLocation]  = useState("TP. Hồ Chí Minh");
  const [website,   setWebsite]   = useState("linhphuong.com");
  const [instagram, setInstagram] = useState("@linhphuong.photo");
  const [price,     setPrice]     = useState("2,500,000");

  // Settings
  const [settings, setSettings] = useState<UserSettings>({
    notifications: { booking: true, message: true, system: true, promo: false },
    privacy: { showOnline: true, showProfile: true, showStats: true },
    display: { compactMode: false, animationsEnabled: true },
    language: "vi"
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      getUserSettings()
        .then(data => { if (data) setSettings(data); })
        .catch(err => console.error("Failed to load settings:", err));
    }
  }, [isLoggedIn]);

  const updateSettings = (path: string[], value: any) => {
    setSettings(prev => {
      const next = { ...prev };
      let obj: any = next;
      for (let i = 0; i < path.length - 1; i++) {
        obj[path[i]] = { ...obj[path[i]] };
        obj = obj[path[i]];
      }
      obj[path[path.length - 1]] = value;
      return next;
    });
  };

  const handleSaveAccount = async () => {
    if (!user) { toast.error("Vui lòng đăng nhập"); return; }
    setSaving(true);
    try {
      await saveUserProfile({
        id: user.id, name, email: user.email, role,
        avatar: user.avatar, tag: user.tag, tagColor: user.tagColor,
      });
      refreshUser();
      await new Promise(r => setTimeout(r, 600));
      toast.success("✅ Đã cập nhật hồ sơ thành công!");
    } catch (err) {
      toast.error("❌ Lỗi khi lưu hồ sơ!");
      console.error(err);
    } finally { setSaving(false); }
  };

  const handleSaveSettings = async () => {
    try {
      await saveUserSettings(settings);
      toast.success("✅ Đã lưu cài đặt!");
    } catch (err) {
      toast.error("❌ Lỗi khi lưu cài đặt!");
      console.error(err);
    }
  };

  const handleClearData = () => {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("sb_local:")) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
    toast.success("Đã xóa dữ liệu cục bộ. Trang sẽ tải lại...");
    setTimeout(() => window.location.reload(), 1500);
  };

  return (
    <div style={{ background: "#07070F", minHeight: "100%", color: "white" }}>
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[600px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
              style={{ border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)" }}>
              <Shield size={10} style={{ color: "#6366F1" }} />
              <span style={{ fontSize: "10.5px", color: "#6366F1", fontWeight: 700, letterSpacing: "0.12em" }}>CÀI ĐẶT</span>
            </div>
            <h1 style={{ fontSize: "clamp(1.5rem,4vw,2.2rem)", fontWeight: 900, letterSpacing: "-0.03em" }}>
              Cài Đặt{" "}
              <span style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Tài Khoản
              </span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px", marginTop: 4 }}>
              Quản lý hồ sơ, thông báo và quyền riêng tư của bạn
            </p>
          </motion.div>

          <div className="flex gap-6 flex-col lg:flex-row">
            {/* Sidebar tabs */}
            <div className="lg:w-52 flex-shrink-0">
              <div className="p-2 rounded-2xl space-y-1 sticky top-4" style={CARD}>
                {TABS.map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => setTab(key)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                    style={{
                      background: tab === key ? "rgba(99,102,241,0.12)" : "transparent",
                      color: tab === key ? "#6366F1" : "rgba(255,255,255,0.5)",
                      borderLeft: tab === key ? "2px solid #6366F1" : "2px solid transparent",
                      fontSize: "13px", fontWeight: tab === key ? 700 : 500,
                    }}
                    onMouseEnter={e => { if (tab !== key) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={e => { if (tab !== key) e.currentTarget.style.background = "transparent"; }}>
                    <Icon size={15} />
                    <span className="hidden lg:inline">{label}</span>
                    <span className="lg:hidden">{label}</span>
                    {tab === key && <ChevronRight size={13} className="ml-auto" />}
                  </button>
                ))}

                {isLoggedIn && (
                  <>
                    <div className="mx-2 my-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                    <button onClick={() => { logout(); toast.success("Đã đăng xuất!"); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                      style={{ color: "#EF4444", fontSize: "13px", fontWeight: 600 }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <LogOut size={15} /> Đăng Xuất
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>

                  {/* ── ACCOUNT ── */}
                  {tab === "account" && (
                    <div className="space-y-5">
                      {/* Avatar */}
                      <div className="p-5 rounded-2xl" style={CARD}>
                        <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: 16 }}>Ảnh Đại Diện</h3>
                        <div className="flex items-center gap-5">
                          <div className="relative">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden"
                              style={{ border: "2px solid rgba(99,102,241,0.4)", boxShadow: "0 0 30px rgba(99,102,241,0.2)" }}>
                              <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=4F46E5&color=fff`}
                                alt="" className="w-full h-full object-cover" />
                            </div>
                            <button className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{ background: GRAD, boxShadow: NEON }}
                              onClick={() => toast.info("Tính năng upload ảnh sẽ ra mắt sớm!")}>
                              <Camera size={14} className="text-white" />
                            </button>
                          </div>
                          <div>
                            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
                              JPG, PNG – Tối đa 5MB
                            </p>
                            <button onClick={() => toast.info("Tính năng sẽ ra mắt sớm!")}
                              className="px-4 py-2 rounded-xl transition-all"
                              style={{ border: "1px solid rgba(99,102,241,0.3)", fontSize: "12px", color: "#6366F1", fontWeight: 600 }}>
                              Thay Đổi Ảnh
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Profile info */}
                      <div className="p-5 rounded-2xl space-y-4" style={CARD}>
                        <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Thông Tin Cá Nhân</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6, fontWeight: 600 }}>Họ Tên *</label>
                            <input value={name} onChange={e => setName(e.target.value)}
                              placeholder="Tên của bạn"
                              className="w-full px-4 py-3 rounded-xl outline-none transition-all" style={INPUT} />
                          </div>
                          <div>
                            <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6, fontWeight: 600 }}>Vai Trò</label>
                            <select value={role} onChange={e => setRole(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl outline-none appearance-none" style={INPUT}>
                              {ROLES.map(r => <option key={r} value={r} style={{ background: "#1A1A2E" }}>{r}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6, fontWeight: 600 }}>Email</label>
                            <input value={user?.email || ""} disabled
                              className="w-full px-4 py-3 rounded-xl outline-none"
                              style={{ ...INPUT, opacity: 0.5, cursor: "not-allowed" }} />
                          </div>
                          <div>
                            <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6, fontWeight: 600 }}>Địa Điểm</label>
                            <input value={location} onChange={e => setLocation(e.target.value)}
                              placeholder="Thành phố, tỉnh"
                              className="w-full px-4 py-3 rounded-xl outline-none" style={INPUT} />
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6, fontWeight: 600 }}>Giới Thiệu</label>
                          <textarea value={bio} onChange={e => setBio(e.target.value)}
                            rows={3} placeholder="Mô tả ngắn về bản thân..."
                            className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                            style={{ ...INPUT, lineHeight: "1.6" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6, fontWeight: 600 }}>Giá / Ngày (VNĐ)</label>
                          <input value={price} onChange={e => setPrice(e.target.value)}
                            placeholder="VD: 2,500,000"
                            className="w-full px-4 py-3 rounded-xl outline-none" style={INPUT} />
                        </div>
                      </div>

                      {/* Social */}
                      <div className="p-5 rounded-2xl space-y-4" style={CARD}>
                        <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Mạng Xã Hội</h3>
                        {[
                          { label: "Instagram", value: instagram, set: setInstagram, placeholder: "@username" },
                          { label: "Website", value: website, set: setWebsite, placeholder: "website.com" },
                        ].map(({ label, value, set, placeholder }) => (
                          <div key={label}>
                            <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6, fontWeight: 600 }}>{label}</label>
                            <input value={value} onChange={e => set(e.target.value)}
                              placeholder={placeholder}
                              className="w-full px-4 py-3 rounded-xl outline-none" style={INPUT} />
                          </div>
                        ))}
                      </div>

                      <motion.button onClick={handleSaveAccount} whileHover={{ scale: 1.02, boxShadow: "0 8px 40px rgba(99,102,241,0.4)" }} whileTap={{ scale: 0.98 }}
                        disabled={saving}
                        className="w-full py-3.5 rounded-2xl text-white flex items-center justify-center gap-2"
                        style={{ background: GRAD, fontSize: "14px", fontWeight: 700, boxShadow: NEON }}>
                        {saving ? <><RefreshCw size={15} className="animate-spin" /> Đang Lưu...</> : <><Save size={15} /> Lưu Thay Đổi</>}
                      </motion.button>
                    </div>
                  )}

                  {/* ── NOTIFICATIONS ── */}
                  {tab === "notif" && (
                    <div className="space-y-5">
                      <div className="p-4 rounded-2xl flex items-center gap-3"
                        style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                        <Bell size={16} style={{ color: "#6366F1" }} />
                        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
                          Kiểm soát loại thông báo bạn muốn nhận.
                        </p>
                      </div>
                      <div className="p-5 rounded-2xl space-y-5" style={CARD}>
                        {[
                          { key: "booking", label: "Đặt Lịch & Công Việc", desc: "Thông báo khi có booking mới, cập nhật trạng thái", icon: "📅", color: "#6366F1" },
                          { key: "message", label: "Tin Nhắn",             desc: "Thông báo khi có tin nhắn mới từ creators",         icon: "💬", color: "#F59E0B" },
                          { key: "system",  label: "Hệ Thống",             desc: "Cập nhật tính năng, bảo trì và thông báo quan trọng", icon: "⚙️", color: "#22C55E" },
                          { key: "promo",   label: "Khuyến Mãi",           desc: "Ưu đãi đặc biệt, sự kiện và tin tức StudioBook",    icon: "🎁", color: "#A855F7" },
                        ].map(({ key, label, desc, icon, color }) => (
                          <div key={key} className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                              style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
                              {icon}
                            </div>
                            <div className="flex-1">
                              <div style={{ fontSize: "13.5px", fontWeight: 600, marginBottom: 2, color: settings.notifications[key as keyof typeof settings.notifications] ? "white" : "rgba(255,255,255,0.5)" }}>{label}</div>
                              <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.3)" }}>{desc}</div>
                            </div>
                            <Toggle
                              value={settings.notifications[key as keyof typeof settings.notifications]}
                              onChange={v => updateSettings(["notifications", key], v)} />
                          </div>
                        ))}
                      </div>
                      <motion.button onClick={handleSaveSettings} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="w-full py-3.5 rounded-2xl text-white flex items-center justify-center gap-2"
                        style={{ background: GRAD, fontSize: "14px", fontWeight: 700, boxShadow: NEON }}>
                        <Save size={15} /> Lưu Cài Đặt
                      </motion.button>
                    </div>
                  )}

                  {/* ── PRIVACY ── */}
                  {tab === "privacy" && (
                    <div className="space-y-5">
                      <div className="p-5 rounded-2xl space-y-5" style={CARD}>
                        <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Trạng Thái & Hiển Thị</h3>
                        {[
                          { key: "showOnline",  label: "Hiển Thị Online",   desc: "Cho phép người khác thấy khi bạn đang online",        icon: "🟢" },
                          { key: "showProfile", label: "Hồ Sơ Công Khai",   desc: "Cho phép mọi người xem hồ sơ và portfolio của bạn",  icon: "👁️" },
                          { key: "showStats",   label: "Hiển Thị Thống Kê", desc: "Hiển thị số dự án và rating trên hồ sơ công khai",   icon: "📊" },
                        ].map(({ key, label, desc, icon }) => (
                          <div key={key} className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                              {icon}
                            </div>
                            <div className="flex-1">
                              <div style={{ fontSize: "13.5px", fontWeight: 600, marginBottom: 2, color: settings.privacy[key as keyof typeof settings.privacy] ? "white" : "rgba(255,255,255,0.5)" }}>{label}</div>
                              <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.3)" }}>{desc}</div>
                            </div>
                            <Toggle
                              value={settings.privacy[key as keyof typeof settings.privacy]}
                              onChange={v => updateSettings(["privacy", key], v)} />
                          </div>
                        ))}
                      </div>
                      <div className="p-4 rounded-2xl flex items-start gap-3"
                        style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }}>
                        <Lock size={14} style={{ color: "#F59E0B", flexShrink: 0, marginTop: 2 }} />
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                          Dữ liệu của bạn được bảo vệ và không được chia sẻ với bên thứ ba. Chúng tôi chỉ dùng thông tin để cải thiện trải nghiệm trên StudioBook Vietnam.
                        </p>
                      </div>
                      <motion.button onClick={handleSaveSettings} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="w-full py-3.5 rounded-2xl text-white flex items-center justify-center gap-2"
                        style={{ background: GRAD, fontSize: "14px", fontWeight: 700, boxShadow: NEON }}>
                        <Save size={15} /> Lưu Cài Đặt
                      </motion.button>
                    </div>
                  )}

                  {/* ── DISPLAY ── */}
                  {tab === "display" && (
                    <div className="space-y-5">
                      <div className="p-5 rounded-2xl space-y-5" style={CARD}>
                        <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Giao Diện & Hiệu Ứng</h3>
                        {[
                          { key: "compactMode",       label: "Chế Độ Gọn",       desc: "Giảm khoảng cách, hiển thị nhiều nội dung hơn",  icon: "🗜️" },
                          { key: "animationsEnabled",  label: "Bật Hiệu Ứng",     desc: "Hiệu ứng chuyển động và animation toàn bộ ứng dụng", icon: "✨" },
                        ].map(({ key, label, desc, icon }) => (
                          <div key={key} className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                              {icon}
                            </div>
                            <div className="flex-1">
                              <div style={{ fontSize: "13.5px", fontWeight: 600, marginBottom: 2, color: settings.display[key as keyof typeof settings.display] ? "white" : "rgba(255,255,255,0.5)" }}>{label}</div>
                              <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.3)" }}>{desc}</div>
                            </div>
                            <Toggle
                              value={settings.display[key as keyof typeof settings.display]}
                              onChange={v => updateSettings(["display", key], v)} />
                          </div>
                        ))}
                      </div>
                      <div className="p-5 rounded-2xl" style={CARD}>
                        <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: 12 }}>Ngôn Ngữ</h3>
                        <div className="flex gap-3">
                          {[{ val: "vi", label: "🇻🇳 Tiếng Việt" }, { val: "en", label: "🇺🇸 English" }].map(({ val, label }) => (
                            <button key={val} onClick={() => updateSettings(["language"], val)}
                              className="flex-1 py-3 rounded-xl transition-all"
                              style={{
                                background: settings.language === val ? GRAD : "rgba(255,255,255,0.04)",
                                border: settings.language === val ? "none" : "1px solid rgba(255,255,255,0.1)",
                                color: settings.language === val ? "white" : "rgba(255,255,255,0.5)",
                                fontSize: "13px", fontWeight: settings.language === val ? 700 : 500,
                                boxShadow: settings.language === val ? NEON : "none",
                              }}>
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <motion.button onClick={handleSaveSettings} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="w-full py-3.5 rounded-2xl text-white flex items-center justify-center gap-2"
                        style={{ background: GRAD, fontSize: "14px", fontWeight: 700, boxShadow: NEON }}>
                        <Save size={15} /> Lưu Cài Đặt
                      </motion.button>
                    </div>
                  )}

                  {/* ── ABOUT ── */}
                  {tab === "about" && (
                    <div className="space-y-5">
                      {/* App info */}
                      <div className="p-5 rounded-2xl" style={CARD}>
                        <div className="flex items-center gap-4 mb-5">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ background: GRAD, boxShadow: NEON }}>
                            <Zap size={24} className="text-white" />
                          </div>
                          <div>
                            <div style={{ fontSize: "18px", fontWeight: 900, letterSpacing: "0.04em" }}>
                              STUDIO<span style={{ color: "#6366F1" }}>BOOK</span>
                            </div>
                            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.18em", fontWeight: 700 }}>VIETNAM</div>
                          </div>
                        </div>
                        {[
                          { label: "Phiên Bản",      value: "1.0.0 – Phase 1" },
                          { label: "Build",          value: "2024.12 – Production" },
                          { label: "Tech Stack",     value: "React 18 + Vite 6 + Supabase" },
                          { label: "Storage",        value: "localStorage + Supabase Auth" },
                          { label: "UI Framework",   value: "Tailwind CSS v4 + Motion" },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center justify-between py-2.5"
                            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <span style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.35)" }}>{label}</span>
                            <span style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Phase roadmap */}
                      <div className="p-5 rounded-2xl" style={CARD}>
                        <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: 12 }}>Roadmap</h3>
                        {[
                          { phase: "Phase 1", label: "Core Platform", status: "live", desc: "Booking, Explore, Chat, Feed, Blog, Admin" },
                          { phase: "Phase 2", label: "Advanced Features", status: "coming", desc: "Payment, Rank System, File Approval, Negotiation" },
                          { phase: "Phase 3", label: "AI & Scale", status: "planned", desc: "AI Matching, Portfolio AI, Analytics Pro" },
                        ].map(({ phase, label, status, desc }) => (
                          <div key={phase} className="flex items-start gap-3 py-3"
                            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                              style={{ background: status === "live" ? "#22C55E" : status === "coming" ? "#F59E0B" : "rgba(255,255,255,0.2)", boxShadow: status === "live" ? "0 0 6px #22C55E" : "none" }} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span style={{ fontSize: "13px", fontWeight: 700 }}>{phase}</span>
                                <span style={{ fontSize: "10px", color: status === "live" ? "#22C55E" : status === "coming" ? "#F59E0B" : "rgba(255,255,255,0.3)", fontWeight: 700 }}>
                                  {status === "live" ? "● LIVE" : status === "coming" ? "SẮPRA" : "PLANNED"}
                                </span>
                              </div>
                              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{label} · {desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Danger zone */}
                      <div className="p-5 rounded-2xl" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}>
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle size={14} style={{ color: "#EF4444" }} />
                          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#EF4444" }}>Vùng Nguy Hiểm</h3>
                        </div>
                        <p style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.35)", marginBottom: 12, lineHeight: 1.6 }}>
                          Xóa toàn bộ dữ liệu cục bộ (creators, bookings, chat, notifications). Trang sẽ tải lại và khởi tạo lại dữ liệu mặc định.
                        </p>
                        <motion.button onClick={handleClearData} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl"
                          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", fontSize: "13px", color: "#EF4444", fontWeight: 700 }}>
                          <Trash2 size={14} /> Xóa Dữ Liệu Cục Bộ
                        </motion.button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
