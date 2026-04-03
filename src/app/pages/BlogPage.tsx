"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { Clock, ArrowRight, X, Calendar, Bookmark, Share2, BookOpen, Sparkles, Plus, Image as ImageIcon, Type, AlignLeft, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { getBlogPosts, saveBlogPost, type BlogPost } from "../lib/localApi";
import { useAuth } from "../context/AuthContext";

const GRAD   = "linear-gradient(135deg, #6366F1, #A855F7)";
const GRAD_H = "linear-gradient(135deg, #4F46E5 0%, #7C3AED 45%, #EC4899 100%)";
const NEON   = "0 0 30px rgba(99,102,241,0.3)";
const CARD   = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };

const CATEGORIES = ["Tất Cả", "Nhiếp Ảnh", "Model", "Marketing", "Editing"];

export function BlogPage({ initialPosts = [] }: { initialPosts?: BlogPost[] }) {
  const { user, isLoggedIn } = useAuth();
  const [blogs, setBlogs]               = useState<BlogPost[]>(initialPosts);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [category, setCategory]         = useState("Tất Cả");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading]               = useState(initialPosts.length === 0);

  // Form state
  const [newPost, setNewPost] = useState({
    title: "",
    category: "Nhiếp Ảnh",
    excerpt: "",
    content: "",
    img: "https://images.unsplash.com/photo-1758613655976-e8c8f85849a2?w=800",
  });

  useEffect(() => {
    if (initialPosts.length > 0) return;
    const fetchData = async () => {
      try {
        const posts = await getBlogPosts();
        setBlogs(posts);
      } catch (err) {
        console.error("Failed to fetch blogs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [initialPosts]);

  const handleCreate = async () => {
    if (!newPost.title || !newPost.content) {
      toast.error("Vui lòng nhập tiêu đề và nội dung");
      return;
    }
    await saveBlogPost({
      ...newPost,
      author: user?.name || "Anonymous",
      authorId: user?.id || "anon",
      avatar: user?.avatar || "https://images.unsplash.com/photo-1616639943825-e0fbad20a3d3?w=80",
      status: user?.role === "Admin" ? "published" : "pending",
      tags: [newPost.category.toLowerCase()],
    });
    
    const updated = await getBlogPosts();
    setBlogs(updated);
    setShowCreateModal(false);
    toast.success(user?.role === "Admin" ? "Đã đăng bài viết! 🚀" : "Bài viết đã được gửi và đang chờ phê duyệt. ✨");
    setNewPost({ title: "", category: "Nhiếp Ảnh", excerpt: "", content: "", img: "https://images.unsplash.com/photo-1758613655976-e8c8f85849a2?w=800" });
  };

  const filtered = blogs.filter(b => (category === "Tất Cả" || b.category === category) && b.status === "published");
  const pendingCount = blogs.filter(b => b.status === "pending" && b.authorId === user?.id).length;

  return (
    <div style={{ background: "#07070F", minHeight: "100%", color: "white" }}>
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,0.5) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="px-6 pt-10 pb-8" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                  style={{ border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)" }}>
                  <BookOpen size={11} style={{ color: "#6366F1" }} />
                  <span style={{ fontSize: "10.5px", color: "#6366F1", fontWeight: 700, letterSpacing: "0.12em" }}>BLOG & INSIGHTS</span>
                </div>
                <h1 style={{ fontSize: "clamp(1.8rem,5vw,3rem)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 8, lineHeight: 1.1 }}>
                  Kiến Thức{" "}
                  <span style={{ background: GRAD_H, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    Sáng Tạo
                  </span>
                </h1>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px" }}>Tips, insights và xu hướng từ các creator hàng đầu Việt Nam</p>
              </motion.div>

              {isLoggedIn && (
                <div className="flex flex-col items-end gap-2">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl"
                    style={{ background: GRAD, color: "white", fontSize: "14px", fontWeight: 700, boxShadow: NEON }}>
                    <Plus size={18} /> Viết Bài Mới
                  </motion.button>
                  {pendingCount > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                      <Clock size={12} style={{ color: "#F59E0B" }} />
                      <span style={{ fontSize: "11px", color: "#F59E0B", fontWeight: 600 }}>{pendingCount} bài đang chờ duyệt</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Category filters */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="flex gap-2 mt-10 flex-wrap">
              {CATEGORIES.map((c, i) => (
                <motion.button key={c} onClick={() => setCategory(c)}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className="px-4 py-2 rounded-2xl transition-all"
                  style={{
                    background: category === c ? GRAD : "rgba(255,255,255,0.04)",
                    border: category === c ? "none" : "1px solid rgba(255,255,255,0.1)",
                    color: category === c ? "white" : "rgba(255,255,255,0.5)",
                    fontSize: "12.5px", fontWeight: category === c ? 700 : 500,
                    boxShadow: category === c ? NEON : "none",
                  }}>
                  {c}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Featured (first article) */}
        <div className="px-6 py-10">
          <div className="max-w-6xl mx-auto">
            {filtered.length > 0 ? (
              <>
                <Link href={`/blog/${filtered[0].slug}`}>
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                    className="relative h-[450px] rounded-[40px] overflow-hidden cursor-pointer group mb-12 shadow-2xl"
                    style={CARD}>
                    <motion.img whileHover={{ scale: 1.04 }} transition={{ duration: 0.6 }}
                      src={filtered[0].img} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,7,15,0.92) 0%, rgba(7,7,15,0.2) 60%, transparent 100%)" }} />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-px" style={{ background: GRAD }} />
                        <span style={{ fontSize: "10px", color: "#6366F1", fontWeight: 700, letterSpacing: "0.18em" }}>
                          {filtered[0].category.toUpperCase()} · FEATURED
                        </span>
                      </div>
                      <h2 style={{ fontSize: "clamp(1.3rem,3vw,2.2rem)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 10, lineHeight: 1.1 }}>
                        {filtered[0].title}
                      </h2>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <img src={filtered[0].avatar} alt="" className="w-7 h-7 rounded-lg object-cover" />
                          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{filtered[0].author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
                          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>{filtered[0].readTime}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.slice(1).map((blog, i) => (
                    <Link key={blog.id} href={`/blog/${blog.slug}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className="cursor-pointer group h-full">
                        <motion.div whileHover={{ y: -6, boxShadow: "0 24px 60px rgba(99,102,241,0.18), 0 0 0 1px rgba(99,102,241,0.2)" }}
                          transition={{ duration: 0.3 }}
                          className="rounded-2xl overflow-hidden h-full flex flex-col"
                          style={CARD}>
                          <div className="relative h-44 overflow-hidden">
                            <motion.img whileHover={{ scale: 1.07 }} transition={{ duration: 0.5 }}
                              src={blog.img} alt="" className="w-full h-full object-cover" />
                            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full"
                              style={{ background: "rgba(99,102,241,0.7)", backdropFilter: "blur(8px)", fontSize: "9px", color: "white", fontWeight: 700, letterSpacing: "0.1em" }}>
                              {blog.category.toUpperCase()}
                            </div>
                          </div>
                          <div className="p-4 flex-1 flex flex-col">
                            <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: 8, lineHeight: 1.4, flex: 1 }}>{blog.title}</h3>
                            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 12 }}>{blog.excerpt}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <img src={blog.avatar} alt="" className="w-6 h-6 rounded-lg object-cover" />
                                <span style={{ fontSize: "11px", color: "#6366F1", fontWeight: 600 }}>{blog.author}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={11} style={{ color: "rgba(255,255,255,0.25)" }} />
                                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>{blog.readTime}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20 rounded-3xl" style={CARD}>
                <BookOpen size={48} style={{ color: "rgba(255,255,255,0.1)", margin: "0 auto 16px" }} />
                <p style={{ color: "rgba(255,255,255,0.3)" }}>Chưa có bài viết nào trong danh mục này.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Article Dialog */}
      <AnimatePresence>
        {selectedBlog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(12px)" }}
            onClick={e => { if (e.target === e.currentTarget) setSelectedBlog(null); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col"
              style={{ background: "#0A0A14", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "90vh" }}>
              <div className="relative h-64 flex-shrink-0">
                <img src={selectedBlog.img} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0A0A14 0%, transparent 60%)" }} />
                <button onClick={() => setSelectedBlog(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}><X size={18} /></button>
              </div>
              <div className="overflow-y-auto flex-1 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2.5 py-1 rounded-full" style={{ background: "rgba(99,102,241,0.1)", color: "#6366F1", fontSize: "11px", fontWeight: 700 }}>{selectedBlog.category}</span>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{selectedBlog.date} · {selectedBlog.readTime}</span>
                </div>
                <h2 style={{ fontSize: "28px", fontWeight: 900, marginBottom: 20, lineHeight: 1.2 }}>{selectedBlog.title}</h2>
                <div className="flex items-center gap-3 mb-8 pb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <img src={selectedBlog.avatar} alt="" className="w-10 h-10 rounded-xl" />
                  <div>
                    <div style={{ fontWeight: 700 }}>{selectedBlog.author}</div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>Creative Creator</div>
                  </div>
                </div>
                <div className="prose prose-invert max-w-none">
                  {selectedBlog.content.split("\n\n").map((p, i) => (
                    <p key={i} style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, marginBottom: 16 }}>{p}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} 
              className="w-full max-w-xl rounded-3xl p-8" style={{ background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.1)", boxShadow: NEON }}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.1)" }}>
                    <Edit3 size={20} style={{ color: "#6366F1" }} />
                  </div>
                  <h2 style={{ fontSize: "20px", fontWeight: 800 }}>Tạo Bài Viết Mới</h2>
                </div>
                <button onClick={() => setShowCreateModal(false)}><X size={20} style={{ color: "rgba(255,255,255,0.3)" }} /></button>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>TIÊU ĐỀ</label>
                  <div className="relative">
                    <Type size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.2)" }} />
                    <input type="text" placeholder="Nhập tiêu đề thu hút..." value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", fontSize: "14px" }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>DANH MỤC</label>
                    <select value={newPost.category} onChange={e => setNewPost({...newPost, category: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl outline-none appearance-none"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", fontSize: "14px", color: "white" }}>
                      {CATEGORIES.slice(1).map(c => <option key={c} value={c} style={{ background: "#0F0F1A" }}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>ẢNH BÌA (URL)</label>
                    <div className="relative">
                      <ImageIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.2)" }} />
                      <input type="text" value={newPost.img} onChange={e => setNewPost({...newPost, img: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 rounded-xl outline-none"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", fontSize: "14px" }} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>MÔ TẢ NGẮN (EXCERPT)</label>
                  <textarea placeholder="Tóm tắt nội dung bài viết..." value={newPost.excerpt} onChange={e => setNewPost({...newPost, excerpt: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl outline-none min-h-[80px]"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", fontSize: "14px" }} />
                </div>

                <div className="space-y-2">
                  <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>NỘI DUNG</label>
                  <div className="relative">
                    <AlignLeft size={14} className="absolute left-4 top-4" style={{ color: "rgba(255,255,255,0.2)" }} />
                    <textarea placeholder="Viết nội dung bài viết ở đây..." value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 rounded-xl outline-none min-h-[160px]"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", fontSize: "14px" }} />
                  </div>
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleCreate}
                  className="w-full py-4 rounded-2xl mt-4" 
                  style={{ background: GRAD, color: "white", fontWeight: 700, fontSize: "15px", boxShadow: NEON }}>
                  Gửi Bài Viết
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
