"use client";
import { motion } from "motion/react";
import { Clock, Calendar, ArrowLeft, Share2, Bookmark } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { BlogPost } from "../lib/localApi";

const GRAD   = "linear-gradient(135deg, #6366F1, #A855F7)";
const CARD   = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };

export default function BlogPostDetail({ post }: { post: BlogPost }) {
  const share = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Đã copy link bài viết!");
  };

  return (
    <div style={{ background: "#07070F", minHeight: "100vh", color: "white" }}>
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img src={post.img} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 20%, rgba(7,7,15,0.8) 70%, #07070F 100%)" }} />
        
        <div className="absolute top-8 left-8 z-10">
          <Link href="/blog">
            <motion.button whileHover={{ x: -4 }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-xs font-bold">
              <ArrowLeft size={16} /> QUAY LẠI
            </motion.button>
          </Link>
        </div>

        <div className="absolute bottom-12 left-0 right-0 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[11px] font-bold text-indigo-400 uppercase tracking-widest">
                  {post.category}
                </span>
                <span className="text-[11px] text-white/40 font-bold tracking-widest uppercase">
                  {post.date} · {post.readTime}
                </span>
              </div>
              <h1 style={{ fontSize: "clamp(2rem, 6vw, 4rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.04em", marginBottom: 24 }}>
                {post.title}
              </h1>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={post.avatar} alt={post.author} className="w-12 h-12 rounded-2xl object-cover border-2 border-white/10" />
                  <div>
                    <div className="font-bold text-sm">{post.author}</div>
                    <div className="text-xs text-white/40">Creative Director</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <motion.button onClick={share} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Share2 size={18} />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Bookmark size={18} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="prose prose-invert prose-indigo max-w-none">
            <p className="text-xl text-white/60 leading-relaxed italic mb-12 border-l-4 border-indigo-500 pl-6">
              {post.excerpt}
            </p>
            <div className="text-lg text-white/80 leading-loose space-y-8" 
                 dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} />
          </motion.div>

          <div className="mt-20 pt-12 border-t border-white/5">
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-medium text-white/40">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
