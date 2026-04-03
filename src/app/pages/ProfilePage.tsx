"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Star, Briefcase, Calendar, MapPin, Lock, Camera, Instagram, Globe, Edit3, Check, X, Plus, TrendingUp, Award, ArrowRight, Heart, MessageCircle, DollarSign, Type, AlignLeft } from "lucide-react";
import { useFeatures } from "../context/FeatureContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { getCreators, getPortfolio, savePortfolio, getProjects, saveProject, type Project, type Creator } from "../lib/localApi";

const GRAD   = "linear-gradient(135deg, #6366F1, #A855F7)";
const GRAD_H = "linear-gradient(135deg, #4F46E5 0%, #7C3AED 45%, #EC4899 100%)";
const NEON   = "0 0 40px rgba(99,102,241,0.35)";
const CARD   = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };

const TABS = ["Portfolio", "Dự Án", "Đánh Giá", "Giới Thiệu"];

export function ProfilePage({ 
  initialCreator = null, 
  initialPortfolio = [], 
  initialProjects = [] 
}: { 
  initialCreator?: Creator | null;
  initialPortfolio?: string[];
  initialProjects?: Project[];
}) {
  const { id } = useParams();
  const { features } = useFeatures();
  const { user, isLoggedIn } = useAuth();
  const [tab, setTab]               = useState("Portfolio");
  const [editMode, setEditMode]     = useState(false);
  const [likedImgs, setLikedImgs]   = useState<Set<string>>(new Set());
  const [portfolioImgs, setPortfolioImgs] = useState<string[]>(initialPortfolio);
  const [projects, setProjects]           = useState<Project[]>(initialProjects);
  const [targetCreator, setTargetCreator] = useState<Creator | null>(initialCreator);

  const isOwnProfile = isLoggedIn && (id === user?.id || !id);
  const profileId = (id as string) || user?.id || "anonymous";

  useEffect(() => {
    const loadData = async () => {
      // Skip fetching if we already have initial data for THIS profileId
      if (initialCreator && initialCreator.id === profileId) return;

      try {
        const creators = await getCreators();
        const found = creators.find(c => c.id === profileId);
        if (found) setTargetCreator(found);

        const imgs = await getPortfolio(profileId);
        setPortfolioImgs(imgs);

        const projs = await getProjects(profileId);
        setProjects(projs);
      } catch (err) {
        console.error("Failed to load profile data", err);
      }
    };
    loadData();
  }, [profileId, initialCreator]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        const newImg = event.target.result as string;
        const newImgs = [newImg, ...portfolioImgs];
        setPortfolioImgs(newImgs);
        await savePortfolio(profileId, newImgs);
        toast.success("Đã thêm ảnh vào portfolio!");
      }
    };
    reader.readAsDataURL(file);
  };

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    budget: "",
    img: "https://images.unsplash.com/photo-1758613655976-e8c8f85849a2?w=300",
  });

  const handleCreateProject = async () => {
    if (!newProject.title) return toast.error("Vui lòng nhập tên dự án");
    const p: Project = {
      id: `p${Date.now()}`,
      userId: profileId,
      title: newProject.title,
      budget: newProject.budget || "0₫",
      status: "Hoàn thành",
      date: new Date().toLocaleDateString("vi-VN"),
      img: newProject.img,
      color: "#22C55E"
    };
    await saveProject(profileId, p);
    const updated = await getProjects(profileId);
    setProjects(updated);
    setShowProjectModal(false);
    toast.success("Đã thêm dự án mới!");
  };

  const profileData = {
    name: targetCreator?.name || user?.name || "Người dùng",
    role: targetCreator?.role || user?.role || "Thành viên",
    tag: targetCreator?.tag || user?.tag || "Pro",
    avatar: targetCreator?.img || user?.avatar || "https://images.unsplash.com/photo-1616639943825-e0fbad20a3d3?w=300",
    cover: "https://images.unsplash.com/photo-1770062422860-92c107ef02cc?w=1200",
    jobs: targetCreator?.jobs || 0,
    rating: targetCreator?.rating || 5.0,
    price: targetCreator?.price ? `${parseInt(targetCreator.price).toLocaleString()}₫/ngày` : "Đang cập nhật",
    bio: "Sáng tạo nội dung và nghệ thuật thị giác chuyên nghiệp tại StudioBook.",
    specialties: targetCreator?.specialty || ["Sáng tạo", "Nghệ thuật"],
  };

  const tagGrads: Record<string, string> = {
    Pro: "linear-gradient(135deg,#8B5CF6,#6D28D9)",
    Elite: "linear-gradient(135deg,#F59E0B,#D97706)",
    Rising: "linear-gradient(135deg,#3B82F6,#1D4ED8)",
    Admin: "linear-gradient(135deg,#6366F1,#A855F7)",
  };

  return (
    <div style={{ background: "#07070F", minHeight: "100%", color: "white" }}>
      {/* Cover */}
      <div className="relative h-52 overflow-hidden">
        <img src={profileData.cover} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(7,7,15,0.9) 100%)" }} />
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 pb-6" style={{ marginTop: -60 }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 mb-6">
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-3xl overflow-hidden" style={{ border: "3px solid rgba(99,102,241,0.4)", boxShadow: "0 0 40px rgba(99,102,241,0.3)" }}>
                <img src={profileData.avatar} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 style={{ fontSize: "clamp(1.3rem,4vw,1.8rem)", fontWeight: 900 }}>{profileData.name}</h1>
                <div className="px-2.5 py-1 rounded-full text-white text-[10px] font-bold" style={{ background: tagGrads[profileData.tag] || tagGrads.Pro }}>{profileData.tag}</div>
              </div>
              <div style={{ color: "#6366F1", fontSize: "14px", fontWeight: 700 }}>{profileData.role}</div>
            </div>
            <div className="flex gap-2">
              {isOwnProfile ? (
                 <motion.button whileHover={{ scale: 1.05 }} onClick={() => setEditMode(!editMode)} className="px-4 py-2 rounded-xl text-xs font-bold border border-white/10">Trình Chỉnh Sửa</motion.button>
              ) : (
                <Link href={`/tin-nhan?chatWith=${profileId}`}>
                  <button className="px-4 py-2 rounded-xl text-xs font-bold border border-white/15">Nhắn Tin</button>
                </Link>
              )}
              {!isOwnProfile && <Link href="/dat-lich"><button className="px-5 py-2 rounded-xl text-xs font-bold" style={{ background: GRAD, boxShadow: NEON }}>Đặt Lịch</button></Link>}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: "Đánh Giá", value: profileData.rating + "★", color: "#F59E0B" },
              { label: "Dự Án", value: profileData.jobs + projects.length, color: "#6366F1" },
              { label: "Portfolio", value: portfolioImgs.length, color: "#A855F7" },
              { label: "Giá / Ngày", value: profileData.price, color: "#22C55E" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-3 text-center" style={CARD}>
                <div style={{ fontSize: "1.2rem", fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", marginTop: 2, fontWeight: 700 }}>{s.label.toUpperCase()}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-6">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ background: tab === t ? GRAD : "rgba(255,255,255,0.04)", color: tab === t ? "white" : "rgba(255,255,255,0.5)" }}>{t}</button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {tab === "Portfolio" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portfolioImgs.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {isOwnProfile && (
                    <label className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-dashed border-indigo-500/30 cursor-pointer hover:bg-white/5">
                      <Plus size={20} className="text-indigo-500" />
                      <span className="text-[10px] font-bold text-white/30">THÊM ẢNH</span>
                      <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                  )}
                </div>
              )}

              {tab === "Dự Án" && (
                <div className="space-y-3">
                   {isOwnProfile && (
                    <button onClick={() => setShowProjectModal(true)} className="w-full p-4 rounded-2xl border-2 border-dashed border-green-500/30 flex items-center justify-center gap-2 text-green-500/50 hover:bg-green-500/5 font-bold text-xs mb-4">
                      <Plus size={16} /> THÊM DỰ ÁN MỚI
                    </button>
                  )}
                  {projects.map((p, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/5">
                      <img src={p.img} alt="" className="w-14 h-14 rounded-xl object-cover" />
                      <div className="flex-1">
                        <div className="text-sm font-bold">{p.title}</div>
                        <div className="text-[10px] text-white/30 font-bold mt-1">{p.date.toUpperCase()}</div>
                      </div>
                      <div className="text-sm font-bold text-green-500">{p.budget}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {tab === "Giới Thiệu" && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                    <h3 className="text-sm font-bold mb-3">Về Tôi</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{profileData.bio}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                    <h3 className="text-sm font-bold mb-3">Chuyên Môn</h3>
                    <div className="flex flex-wrap gap-2">
                      {profileData.specialties.map(s => <span key={s} className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-bold text-indigo-500">{s}</span>)}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Project Modal */}
      <AnimatePresence>
        {showProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-[#0F0F1A] border border-white/10 rounded-3xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black">Dự Án Mới</h2>
                <button onClick={() => setShowProjectModal(false)}><X size={20}/></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/30">TÊN DỰ ÁN</label>
                  <input type="text" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none text-sm" placeholder="Nhập tên dự án..." />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/30">NGÂN SÁCH / GIÁ TRỊ</label>
                  <input type="text" value={newProject.budget} onChange={e => setNewProject({...newProject, budget: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none text-sm" placeholder="VD: 5,000,000₫" />
                </div>
                <button onClick={handleCreateProject} className="w-full py-4 bg-indigo-600 rounded-2xl font-bold mt-4 shadow-lg shadow-indigo-600/20">Lưu Dự Án</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
