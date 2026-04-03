"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Play, Plus, X, Send, Sparkles, TrendingUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { getFeedPosts, createFeedPost, toggleFeedLike, addFeedComment, type FeedPost } from "../lib/localApi";

const GRAD = "linear-gradient(135deg, #6366F1, #A855F7)";
const NEON = "0 0 30px rgba(99,102,241,0.3)";
const CARD = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };



const STORIES = [
  { id: 1, name: "Linh Phương", img: "https://images.unsplash.com/photo-1616639943825-e0fbad20a3d3?w=120", new: true },
  { id: 2, name: "Thu Hà",      img: "https://images.unsplash.com/photo-1763906803356-c4c2c83dc012?w=120", new: true },
  { id: 3, name: "Minh Khoa",   img: "https://images.unsplash.com/photo-1568930290108-c255b908c86b?w=120", new: false },
  { id: 4, name: "Duy Anh",     img: "https://images.unsplash.com/photo-1618902410393-6fe0a34bb79e?w=120", new: true },
  { id: 5, name: "Bảo Trân",    img: "https://images.unsplash.com/photo-1753685728255-afaa48cc2c8b?w=120", new: false },
];

const TRENDING = ["#FashionPhotography", "#MusicVideo", "#BST2024", "#BeautyBrand", "#StudioBook"];

export function FeedPage({ initialPosts = [] }: { initialPosts?: FeedPost[] }) {
  const { isLoggedIn, user } = useAuth();
  const [feed, setFeed]             = useState<FeedPost[]>(initialPosts);
  const [loading, setLoading]       = useState(initialPosts.length === 0);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set());
  const [openComments, setOpenComments] = useState<number | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [postModal, setPostModal]   = useState(false);
  const [newCaption, setNewCaption] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (initialPosts.length === 0) {
          const posts = await getFeedPosts();
          setFeed(posts);
        }
        
        const storedLikes = localStorage.getItem("sb_liked_posts");
        const storedSaved = localStorage.getItem("sb_saved_posts");
        if (storedLikes) setLikedPosts(new Set(JSON.parse(storedLikes)));
        if (storedSaved) setSavedPosts(new Set(JSON.parse(storedSaved)));
      } catch (err) {
        console.error("Failed to fetch feed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [initialPosts]);

  const handlePost = useCallback(async () => {
    if (!newCaption.trim()) { toast.error("Vui lòng nhập nội dung"); return; }
    const newPost: FeedPost = {
      id: Date.now(),
      user: { name: user?.name || "Bạn", role: user?.role || "Creator", avatar: user?.avatar || "https://images.unsplash.com/photo-1616639943825-e0fbad20a3d3?w=80" },
      img: "https://images.unsplash.com/photo-1758613655378-89bb3d122c57?w=700",
      caption: newCaption, likes: 0, comments: 0, time: "Vừa xong",
      tags: [], isVideo: false, commentList: [],
    };
    setFeed(prev => [newPost, ...prev]);
    await createFeedPost(newPost);
    setNewCaption(""); setPostModal(false);
    toast.success("🎉 Đã đăng bài thành công!");
  }, [newCaption, user]);

  const toggleSave = useCallback((id: number) => {
    setSavedPosts(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem("sb_saved_posts", JSON.stringify([...next])); } catch {}
      toast.success(next.has(id) ? "Đã lưu!" : "Đã bỏ lưu");
      return next;
    });
  }, []);

  const toggleLike = useCallback(async (id: number) => {
    let doLike = false;
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        doLike = false;
      } else {
        next.add(id);
        doLike = true;
      }
      try { localStorage.setItem("sb_liked_posts", JSON.stringify([...next])); } catch {}
      return next;
    });
    setFeed(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + (doLike ? 1 : -1) } : p));
    await toggleFeedLike(id, doLike);
  }, []);

  const handleComment = useCallback(async (postId: number) => {
    if (!commentInput.trim()) return;
    const newComment = { user: isLoggedIn ? (user?.name || "Bạn") : "Khách", text: commentInput, avatar: user?.avatar || "https://images.unsplash.com/photo-1616639943825-e0fbad20a3d3?w=60" };
    setFeed(prev => prev.map(p => p.id === postId ? {
      ...p,
      comments: p.comments + 1,
      commentList: [...p.commentList, newComment]
    } : p));
    await addFeedComment(postId, newComment);
    setCommentInput("");
    toast.success("Đã bình luận!");
  }, [commentInput, isLoggedIn, user]);

  return (
    <div style={{ background: "#07070F", minHeight: "100%", color: "white" }}>
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.6) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6">

        {/* Stories */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: "none" }}>
          {/* Add story */}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setPostModal(true)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(99,102,241,0.1)", border: "2px dashed rgba(99,102,241,0.35)" }}>
              <Plus size={20} style={{ color: "#6366F1" }} />
            </div>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Đăng Bài</span>
          </motion.button>

          {STORIES.map((s, i) => (
            <motion.button key={s.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className="w-14 h-14 rounded-2xl overflow-hidden p-0.5"
                style={{ background: s.new ? GRAD : "rgba(255,255,255,0.08)", boxShadow: s.new ? NEON : "none" }}>
                <img src={s.img} alt={s.name} className="w-full h-full object-cover rounded-xl" />
              </div>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 600, maxWidth: 56, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Trending */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-2xl mb-6 overflow-x-auto"
          style={{ ...CARD, scrollbarWidth: "none" }}>
          <TrendingUp size={14} style={{ color: "#6366F1", flexShrink: 0 }} />
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontWeight: 700, flexShrink: 0, letterSpacing: "0.08em" }}>TRENDING</span>
          <div className="flex gap-2">
            {TRENDING.map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: "rgba(99,102,241,0.1)", fontSize: "11px", color: "#6366F1", fontWeight: 600, border: "1px solid rgba(99,102,241,0.2)" }}>
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Posts */}
        <div className="space-y-6">
          <AnimatePresence>
            {feed.map((post, i) => (
              <motion.div key={post.id}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="rounded-3xl overflow-hidden"
                style={CARD}>
                {/* Post header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={post.user.avatar} alt={post.user.name} className="w-9 h-9 rounded-xl object-cover"
                        style={{ border: "2px solid rgba(99,102,241,0.3)" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700 }}>{post.user.name}</div>
                      <div style={{ fontSize: "11px", color: "#6366F1", fontWeight: 600 }}>{post.user.role} · {post.time}</div>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                    style={{ background: "rgba(255,255,255,0.04)" }}>
                    <MoreHorizontal size={16} style={{ color: "rgba(255,255,255,0.3)" }} />
                  </button>
                </div>

                {/* Image */}
                <div className="relative">
                  <img src={post.img} alt="" className="w-full object-cover" style={{ maxHeight: 400, objectFit: "cover" }} />
                  {post.isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div whileHover={{ scale: 1.1 }} className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer"
                        style={{ background: "rgba(7,7,15,0.7)", border: "2px solid rgba(255,255,255,0.3)", backdropFilter: "blur(8px)" }}>
                        <Play size={22} style={{ fill: "white", color: "white", marginLeft: 3 }} />
                      </motion.div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-4 pt-3 pb-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
                        onClick={() => toggleLike(post.id)}
                        className="flex items-center gap-1.5">
                        <Heart size={20} style={{ color: likedPosts.has(post.id) ? "#EC4899" : "rgba(255,255,255,0.4)", fill: likedPosts.has(post.id) ? "#EC4899" : "none", transition: "all 0.2s" }} />
                        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{post.likes}</span>
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setOpenComments(openComments === post.id ? null : post.id)}
                        className="flex items-center gap-1.5">
                        <MessageCircle size={20} style={{ color: openComments === post.id ? "#6366F1" : "rgba(255,255,255,0.4)" }} />
                        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{post.comments}</span>
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("Đã copy link!"); }}>
                        <Share2 size={20} style={{ color: "rgba(255,255,255,0.4)" }} />
                      </motion.button>
                    </div>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => toggleSave(post.id)}>
                      <Bookmark size={20} style={{ color: savedPosts.has(post.id) ? "#F59E0B" : "rgba(255,255,255,0.4)", fill: savedPosts.has(post.id) ? "#F59E0B" : "none" }} />
                    </motion.button>
                  </div>

                  <p style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.8)", lineHeight: 1.6, marginBottom: 6 }}>
                    <strong style={{ color: "white" }}>{post.user.name}</strong> {post.caption}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map(tag => (
                      <span key={tag} style={{ fontSize: "12px", color: "#6366F1", fontWeight: 600 }}>{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                <AnimatePresence>
                  {openComments === post.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="px-4 py-3 space-y-3">
                        {post.commentList.map((c, ci) => (
                          <motion.div key={ci} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ci * 0.05 }}
                            className="flex items-start gap-2">
                            <img src={c.avatar} alt={c.user} className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
                            <div className="flex-1 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
                              <span style={{ fontSize: "12px", fontWeight: 700, color: "white" }}>{c.user} </span>
                              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>{c.text}</span>
                            </div>
                          </motion.div>
                        ))}
                        <div className="flex items-center gap-2">
                          <input value={commentInput} onChange={e => setCommentInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleComment(post.id)}
                            placeholder="Thêm bình luận..."
                            className="flex-1 px-3 py-2 rounded-xl outline-none"
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "12.5px", color: "rgba(255,255,255,0.8)" }} />
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => handleComment(post.id)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ background: commentInput.trim() ? GRAD : "rgba(255,255,255,0.06)" }}>
                            <Send size={13} style={{ color: commentInput.trim() ? "white" : "rgba(255,255,255,0.3)" }} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Post Modal */}
      <AnimatePresence>
        {postModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
            onClick={e => { if (e.target === e.currentTarget) setPostModal(false); }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-3xl p-6"
              style={{ background: "#0E0E1C", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 30px 80px rgba(0,0,0,0.8)" }}>
              <div className="flex items-center justify-between mb-5">
                <h3 style={{ fontSize: "17px", fontWeight: 800 }}>Đăng Bài Mới</h3>
                <button onClick={() => setPostModal(false)} className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  <X size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
                </button>
              </div>
              <div className="mb-4 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-full aspect-video rounded-lg mb-2 flex items-center justify-center"
                  style={{ background: "rgba(99,102,241,0.08)", border: "2px dashed rgba(99,102,241,0.2)" }}>
                  <div className="text-center">
                    <Sparkles size={24} style={{ color: "#6366F1", margin: "0 auto 6px" }} />
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>Thêm ảnh / video</p>
                  </div>
                </div>
              </div>
              <textarea value={newCaption} onChange={e => setNewCaption(e.target.value)}
                placeholder="Viết caption cho bài đăng của bạn..."
                rows={4} className="w-full px-4 py-3 rounded-xl outline-none resize-none mb-4"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "13.5px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }} />
              <motion.button onClick={handlePost} whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(99,102,241,0.4)" }} whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl text-white"
                style={{ background: GRAD, fontSize: "14px", fontWeight: 700 }}>
                Đăng Bài
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
