"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, User, ChevronDown, Eye, EyeOff, Zap, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

const PRIMARY = "#4F46E5";
const GRAD = "linear-gradient(135deg, #4F46E5, #7C3AED)";
const GRAD_VIVID = "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%)";

const ROLES = ["Nhiếp Ảnh Gia", "Quay Phim", "Model", "Editor", "Stylist", "Khách Hàng"];

const inputStyle = {
  background: "rgba(79,70,229,0.04)",
  border: "1px solid rgba(79,70,229,0.15)",
  color: "#374151",
  fontSize: "13px",
  borderRadius: "12px",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, login, register, authTab, setAuthTab } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass]   = useState("");
  const [regName, setRegName]       = useState("");
  const [regEmail, setRegEmail]     = useState("");
  const [regPass, setRegPass]       = useState("");
  const [regRole, setRegRole]       = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPass) return;
    setLoading(true);
    const ok = await login(loginEmail, loginPass);
    setLoading(false);
    if (ok) { toast.success("Đăng nhập thành công! Chào mừng trở lại 🎉"); }
    else     { toast.error("Email hoặc mật khẩu không đúng. Kiểm tra lại hoặc đăng ký tài khoản mới."); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPass || !regRole) { toast.error("Vui lòng điền đầy đủ thông tin"); return; }
    if (regPass.length < 6) { toast.error("Mật khẩu phải có ít nhất 6 ký tự"); return; }
    if (regPass !== regConfirm) { toast.error("Mật khẩu xác nhận không khớp"); return; }
    setLoading(true);
    const ok = await register(regName, regEmail, regPass, regRole);
    setLoading(false);
    if (ok) { toast.success(`Chào mừng ${regName} đến với StudioBook Vietnam! ✨`); }
    else    { toast.error("Đăng ký thất bại. Email có thể đã được sử dụng."); }
  };

  const demoLogins = [
    { label: "👩‍📷 Linh Phương (Nhiếp Ảnh Gia)", email: "demo@studiobook.vn",  pass: "demo123456",  color: "#7C3AED" },
    { label: "🛡️ Admin StudioBook",              email: "admin@studiobook.vn", pass: "admin123456", color: "#4F46E5" },
    { label: "✨ Thu Hà (Model Elite)",           email: "model@studiobook.vn", pass: "model123456", color: "#D97706" },
  ];

  if (!showAuthModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: "rgba(15,10,40,0.6)", backdropFilter: "blur(16px)" }}
        onClick={() => setShowAuthModal(false)}>

        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 30 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          className="w-full max-w-md relative overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.98)",
            borderRadius: 28,
            border: "1px solid rgba(79,70,229,0.1)",
            boxShadow: "0 32px 100px rgba(79,70,229,0.25), 0 0 0 1px rgba(79,70,229,0.06)",
          }}
          onClick={e => e.stopPropagation()}>

          {/* Gradient top bar */}
          <div style={{ height: 5, background: GRAD_VIVID }} />

          {/* Background blob */}
          <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none opacity-[0.04]"
            style={{ background: "radial-gradient(ellipse, #7C3AED, transparent)", borderRadius: "50%", transform: "translate(30%, -30%)" }} />

          {/* Header */}
          <div className="flex items-center justify-between px-7 pt-6 pb-5"
            style={{ borderBottom: "1px solid rgba(79,70,229,0.07)" }}>
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 8 }}
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: GRAD, boxShadow: "0 4px 16px rgba(79,70,229,0.4)" }}>
                <Zap size={18} className="text-white" />
              </motion.div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 900, color: "#1E1B4B", letterSpacing: "0.04em" }}>
                  STUDIO<span style={{ color: PRIMARY }}>BOOK</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles size={9} style={{ color: "#D97706" }} />
                  <div style={{ fontSize: "9px", color: "#9CA3AF", letterSpacing: "0.12em", fontWeight: 700 }}>VIETNAM</div>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
              onClick={() => setShowAuthModal(false)}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-gray-100"
              style={{ color: "#9CA3AF" }}>
              <X size={16} />
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mx-6 mt-6 p-1 rounded-2xl"
            style={{ background: "rgba(79,70,229,0.05)", border: "1px solid rgba(79,70,229,0.08)" }}>
            {(["login", "register"] as const).map(tab => (
              <button key={tab} onClick={() => setAuthTab(tab)}
                className="flex-1 py-2.5 rounded-xl transition-all relative"
                style={{ fontSize: "13px", fontWeight: 700, color: authTab === tab ? "white" : "#9CA3AF" }}>
                {authTab === tab && (
                  <motion.div layoutId="authTabBg2"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: GRAD, boxShadow: "0 4px 16px rgba(79,70,229,0.3)" }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }} />
                )}
                <span className="relative z-10">{tab === "login" ? "Đăng Nhập" : "Đăng Ký"}</span>
              </button>
            ))}
          </div>

          <div className="px-7 py-6">
            <AnimatePresence mode="wait">
              {/* ── Login Form ── */}
              {authTab === "login" ? (
                <motion.form key="login"
                  initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleLogin} className="space-y-4">

                  <div>
                    <label style={{ fontSize: "11.5px", color: "#6B7280", display: "block", marginBottom: 7, fontWeight: 700, letterSpacing: "0.04em" }}>
                      EMAIL
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(79,70,229,0.08)" }}>
                        <Mail size={13} style={{ color: PRIMARY }} />
                      </div>
                      <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                        placeholder="email@example.com" required
                        className="w-full pl-12 pr-4 py-3.5"
                        style={inputStyle} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "11.5px", color: "#6B7280", display: "block", marginBottom: 7, fontWeight: 700, letterSpacing: "0.04em" }}>
                      MẬT KHẨU
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(79,70,229,0.08)" }}>
                        <Lock size={13} style={{ color: PRIMARY }} />
                      </div>
                      <input type={showPass ? "text" : "password"} value={loginPass} onChange={e => setLoginPass(e.target.value)}
                        placeholder="••••••••" required
                        className="w-full pl-12 pr-12 py-3.5"
                        style={inputStyle} />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-indigo-50 transition-colors">
                        {showPass ? <EyeOff size={13} style={{ color: "#9CA3AF" }} /> : <Eye size={13} style={{ color: "#9CA3AF" }} />}
                      </button>
                    </div>
                  </div>

                  <motion.button type="submit" disabled={loading}
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 32px rgba(79,70,229,0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-2xl text-white flex items-center justify-center gap-2.5"
                    style={{ background: GRAD, fontSize: "14px", fontWeight: 800, opacity: loading ? 0.85 : 1, boxShadow: "0 6px 20px rgba(79,70,229,0.3)" }}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={15} />}
                    {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
                  </motion.button>

                  {/* Demo accounts */}
                  <div className="pt-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-px" style={{ background: "rgba(79,70,229,0.08)" }} />
                      <span style={{ fontSize: "10.5px", color: "#D1D5DB", fontWeight: 600 }}>DEMO ACCOUNTS</span>
                      <div className="flex-1 h-px" style={{ background: "rgba(79,70,229,0.08)" }} />
                    </div>
                    <div className="space-y-1.5">
                      {demoLogins.map(d => (
                        <motion.button key={d.email} type="button"
                          whileHover={{ scale: 1.01, x: 2 }} whileTap={{ scale: 0.98 }}
                          onClick={() => { setLoginEmail(d.email); setLoginPass(d.pass); }}
                          className="w-full py-2.5 px-3.5 rounded-xl text-left flex items-center gap-3 transition-all"
                          style={{ background: "rgba(79,70,229,0.04)", border: "1px solid rgba(79,70,229,0.1)" }}>
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                          <div className="flex-1 min-w-0">
                            <div style={{ fontSize: "11.5px", color: "#374151", fontWeight: 700 }}>{d.label}</div>
                            <div style={{ fontSize: "10px", color: "#9CA3AF" }}>{d.email}</div>
                          </div>
                          <div style={{ fontSize: "9px", color: d.color, fontWeight: 700, background: `${d.color}12`, padding: "2px 6px", borderRadius: 6 }}>
                            CLICK
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.form>

              ) : (
                /* ── Register Form ── */
                <motion.form key="register"
                  initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleRegister} className="space-y-3.5">

                  {/* Name */}
                  <div>
                    <label style={{ fontSize: "11.5px", color: "#6B7280", display: "block", marginBottom: 7, fontWeight: 700, letterSpacing: "0.04em" }}>HỌ VÀ TÊN</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(79,70,229,0.08)" }}>
                        <User size={13} style={{ color: PRIMARY }} />
                      </div>
                      <input value={regName} onChange={e => setRegName(e.target.value)}
                        placeholder="Nguyễn Văn A" required
                        className="w-full pl-12 pr-4 py-3"
                        style={inputStyle} />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ fontSize: "11.5px", color: "#6B7280", display: "block", marginBottom: 7, fontWeight: 700, letterSpacing: "0.04em" }}>EMAIL</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(79,70,229,0.08)" }}>
                        <Mail size={13} style={{ color: PRIMARY }} />
                      </div>
                      <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                        placeholder="email@example.com" required
                        className="w-full pl-12 pr-4 py-3"
                        style={inputStyle} />
                    </div>
                  </div>

                  {/* Password row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={{ fontSize: "11.5px", color: "#6B7280", display: "block", marginBottom: 7, fontWeight: 700, letterSpacing: "0.04em" }}>MẬT KHẨU</label>
                      <input type="password" value={regPass} onChange={e => setRegPass(e.target.value)}
                        placeholder="••••••••" required
                        className="w-full px-4 py-3"
                        style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: "11.5px", color: "#6B7280", display: "block", marginBottom: 7, fontWeight: 700, letterSpacing: "0.04em" }}>XÁC NHẬN</label>
                      <input type="password" value={regConfirm} onChange={e => setRegConfirm(e.target.value)}
                        placeholder="••••••••" required
                        className="w-full px-4 py-3"
                        style={inputStyle} />
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label style={{ fontSize: "11.5px", color: "#6B7280", display: "block", marginBottom: 7, fontWeight: 700, letterSpacing: "0.04em" }}>VAI TRÒ</label>
                    <div className="relative">
                      <select value={regRole} onChange={e => setRegRole(e.target.value)} required
                        className="w-full px-4 py-3 appearance-none"
                        style={{ ...inputStyle, color: regRole ? "#374151" : "#9CA3AF" }}>
                        <option value="">Chọn vai trò của bạn</option>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#9CA3AF" }} />
                    </div>
                  </div>

                  <motion.button type="submit" disabled={loading}
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 32px rgba(79,70,229,0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-2xl text-white flex items-center justify-center gap-2.5 mt-2"
                    style={{ background: GRAD_VIVID, fontSize: "14px", fontWeight: 800, opacity: loading ? 0.85 : 1, boxShadow: "0 6px 20px rgba(79,70,229,0.3)" }}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={15} />}
                    {loading ? "Đang tạo tài khoản..." : "Tạo Tài Khoản"}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}