"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Search, Star, Briefcase, SlidersHorizontal, RefreshCw, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import { getCreators } from "../lib/localApi";
import type { Creator } from "../lib/localApi";

// ── Design tokens ─────────────────────────────────────────────────────────
const BG     = "#07070F";
const ACCENT = "#6366F1";
const GRAD   = "linear-gradient(135deg, #6366F1, #A855F7)";
const NEON   = "0 0 40px rgba(99,102,241,0.3)";
const CARD   = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };

const TAG_GRADS: Record<string, string> = {
  Pro:    "linear-gradient(135deg,#8B5CF6,#6D28D9)",
  Elite:  "linear-gradient(135deg,#F59E0B,#D97706)",
  Rising: "linear-gradient(135deg,#3B82F6,#1D4ED8)",
  Newbie: "linear-gradient(135deg,#6B7280,#4B5563)",
};

const ROLES = ["Tất Cả", "Nhiếp Ảnh Gia", "Quay Phim", "Model", "Editor", "Stylist"];

function CreatorSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden animate-pulse" style={{ ...CARD, boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
      <div className="h-56" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))" }} />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="h-3 w-1/2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }} />
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-lg" style={{ background: "rgba(99,102,241,0.1)" }} />
          <div className="h-5 w-16 rounded-lg" style={{ background: "rgba(168,85,247,0.1)" }} />
        </div>
        <div className="flex justify-between items-center pt-1">
          <div className="h-4 w-20 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }} />
          <div className="h-8 w-24 rounded-xl" style={{ background: "rgba(99,102,241,0.1)" }} />
        </div>
      </div>
    </div>
  );
}

export function ExplorePage({ initialCreators = [] }: { initialCreators?: Creator[] }) {
  const [search, setSearch]   = useState("");
  const [role,   setRole]     = useState("Tất Cả");
  const [sort,   setSort]     = useState("rating");
  const [creators, setCreators] = useState<Creator[]>(initialCreators);
  const [loading,  setLoading]  = useState(initialCreators.length === 0);
  const [error,    setError]    = useState<string | null>(null);

  const fetchCreators = async () => {
    setLoading(true); setError(null);
    try {
      const data = await getCreators();
      setCreators(data);
    } catch (err) {
      setError("Không thể tải danh sách creator");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { 
    if (initialCreators.length === 0) fetchCreators(); 
  }, [initialCreators]);

  const filtered = creators
    .filter(c => {
      const q = search.toLowerCase();
      return (c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q))
        && (role === "Tất Cả" || c.role === role);
    })
    .sort((a, b) => sort === "rating" ? b.rating - a.rating : b.jobs - a.jobs);

  return (
    <div style={{ background: BG, minHeight: "100%", color: "white" }}>
      {/* ── Glow bg ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      {/* ── Header ── */}
      <div className="relative z-10 px-6 pt-10 pb-8"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-3"
                style={{ border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)" }}>
                <Sparkles size={10} style={{ color: ACCENT }} />
                <span style={{ fontSize: "10.5px", color: ACCENT, fontWeight: 700, letterSpacing: "0.12em" }}>KHÁM PHÁ</span>
              </div>
              <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 6 }}>
                Tìm Kiếm{" "}
                <span style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Creators
                </span>
              </h1>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px" }}>
                Nghệ sĩ tài năng nhất Việt Nam
                {!loading && creators.length > 0 && (
                  <span style={{ color: ACCENT, fontWeight: 700 }}> · {creators.length} creators</span>
                )}
              </p>
            </div>
            <motion.button onClick={fetchCreators} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all"
              style={{ ...CARD, fontSize: "12px", color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} style={{ color: ACCENT }} /> Làm Mới
            </motion.button>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex gap-3">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Search size={16} style={{ color: ACCENT, flexShrink: 0 }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Tên creator, vai trò, chuyên môn..."
                className="bg-transparent outline-none flex-1"
                style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.8)" }} />
              {search && <button onClick={() => setSearch("")} style={{ color: "rgba(255,255,255,0.3)" }}>✕</button>}
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <SlidersHorizontal size={15} style={{ color: ACCENT }} />
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="outline-none cursor-pointer bg-transparent"
                style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
                <option value="rating" style={{ background: "#1A1A2E" }}>⭐ Đánh Giá Cao</option>
                <option value="jobs"   style={{ background: "#1A1A2E" }}>💼 Nhiều Dự Án</option>
              </select>
            </div>
          </motion.div>

          {/* Role filters */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="flex flex-wrap gap-2 mt-4">
            {ROLES.map((r, i) => (
              <motion.button key={r} onClick={() => setRole(r)}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="px-4 py-2 rounded-2xl transition-all"
                style={{
                  background: role === r ? GRAD : "rgba(255,255,255,0.04)",
                  border: role === r ? "none" : "1px solid rgba(255,255,255,0.1)",
                  color: role === r ? "white" : "rgba(255,255,255,0.5)",
                  fontSize: "12.5px", fontWeight: role === r ? 700 : 500,
                  boxShadow: role === r ? NEON : "none",
                }}>
                {r}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="relative z-10 px-6 py-8">
        <div className="max-w-6xl mx-auto">

          <AnimatePresence>
            {error && !loading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-4 p-5 rounded-2xl mb-6"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertCircle size={20} style={{ color: "#EF4444", flexShrink: 0 }} />
                <div className="flex-1">
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#EF4444" }}>Không thể tải dữ liệu</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{error}</p>
                </div>
                <motion.button onClick={fetchCreators} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-xl text-white"
                  style={{ background: "#EF4444", fontSize: "12px", fontWeight: 700 }}>
                  Thử Lại
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => <CreatorSkeleton key={i} />)}
            </div>
          ) : (
            <>
              {filtered.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5 flex items-center gap-2">
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
                    Hiển thị <strong style={{ color: "white" }}>{filtered.length}</strong> creators
                    {role !== "Tất Cả" && <span> trong <strong style={{ color: ACCENT }}>{role}</strong></span>}
                  </span>
                </motion.div>
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <AnimatePresence>
                  {filtered.map((c, i) => (
                    <motion.div key={c.id}
                      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05, duration: 0.45 }}>
                      <Link href={`/ho-so/${c.id}`} className="block group">
                        <motion.div
                          whileHover={{ y: -8, boxShadow: "0 24px 60px rgba(99,102,241,0.2), 0 0 0 1px rgba(99,102,241,0.3)" }}
                          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                          className="rounded-3xl overflow-hidden"
                          style={{ ...CARD, boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
                          {/* Image */}
                          <div className="relative h-56 overflow-hidden">
                            <motion.img whileHover={{ scale: 1.08 }} transition={{ duration: 0.5 }}
                              src={c.img} alt={c.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0"
                              style={{ background: "linear-gradient(to top, rgba(7,7,15,0.85) 0%, rgba(7,7,15,0.1) 55%, transparent 100%)" }} />
                            {/* Tag */}
                            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-white"
                              style={{ background: TAG_GRADS[c.tag] || TAG_GRADS.Newbie, fontSize: "9px", fontWeight: 800, letterSpacing: "0.06em", boxShadow: "0 3px 10px rgba(0,0,0,0.35)" }}>
                              {c.tag}
                            </div>
                            {/* Name overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <div style={{ fontSize: "16px", fontWeight: 800, color: "white", marginBottom: 3 }}>{c.name}</div>
                              <div className="flex items-center justify-between">
                                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{c.role}</span>
                                <div className="flex items-center gap-1">
                                  <Star size={11} style={{ fill: "#F59E0B", color: "#F59E0B" }} />
                                  <span style={{ fontSize: "12px", color: "white", fontWeight: 700 }}>{c.rating}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Body */}
                          <div className="p-4">
                            <div className="flex flex-wrap gap-1 mb-3">
                              {(c.specialty || []).slice(0, 3).map(s => (
                                <span key={s} className="px-2 py-0.5 rounded-lg"
                                  style={{ background: "rgba(99,102,241,0.12)", fontSize: "10px", color: ACCENT, fontWeight: 600 }}>
                                  {s}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <div style={{ fontSize: "13px", color: "#22C55E", fontWeight: 800 }}>
                                  {parseInt(c.price).toLocaleString("vi-VN")}₫
                                </div>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Briefcase size={10} style={{ color: "rgba(255,255,255,0.2)" }} />
                                  <span style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.3)" }}>{c.jobs} dự án</span>
                                </div>
                              </div>
                              <motion.div whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white"
                                style={{ background: GRAD, fontSize: "11px", fontWeight: 700, boxShadow: "0 3px 12px rgba(99,102,241,0.35)" }}>
                                ��ặt Lịch <ArrowRight size={11} />
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filtered.length === 0 && !error && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
                    style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
                    <Search size={32} style={{ color: ACCENT, opacity: 0.6 }} />
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "white", marginBottom: 8 }}>Không tìm thấy creator</h3>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px", marginBottom: 20 }}>Thử thay đổi từ khóa hoặc bộ lọc</p>
                  <motion.button onClick={() => { setSearch(""); setRole("Tất Cả"); }}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className="px-6 py-3 rounded-2xl text-white"
                    style={{ background: GRAD, fontSize: "13px", fontWeight: 700, boxShadow: NEON }}>
                    Xóa Bộ Lọc
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}