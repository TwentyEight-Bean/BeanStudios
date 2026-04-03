"use client";

import { useRef, useEffect, memo } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SearchResult } from "@/app/lib/localApi";

const RESULT_TYPE_LABELS: Record<string, string> = {
  creator: "Creator",
  booking: "Công Việc",
  blog:    "Blog",
};

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  onSelect: (r: SearchResult) => void;
  ACCENT: string;
}

export const SearchOverlay = memo(({
  isOpen,
  onClose,
  query,
  setQuery,
  results,
  onSelect,
  ACCENT
}: SearchOverlayProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] px-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(16px)" }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full max-w-xl rounded-3xl overflow-hidden"
            style={{ background: "#0E0E1C", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 30px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(99,102,241,0.15)" }}>
            <div className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <Search size={18} style={{ color: ACCENT, flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Tìm kiếm creator, công việc, blog..."
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: "15px", color: "white" }}
                autoComplete="off"
              />
              <div className="flex items-center gap-2">
                {query && (
                  <button onClick={() => { setQuery(""); }}
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.08)" }}>
                    <X size={12} style={{ color: "rgba(255,255,255,0.5)" }} />
                  </button>
                )}
                <kbd style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", fontFamily: "monospace" }}>ESC</kbd>
              </div>
            </div>
            {query.length >= 2 ? (
              results.length > 0 ? (
                <div className="py-2 max-h-80 overflow-y-auto custom-scrollbar">
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", fontWeight: 700, letterSpacing: "0.12em", padding: "4px 20px 8px" }}>
                    {results.length} KẾT QUẢ
                  </p>
                  {results.map((r, i) => (
                    <motion.button key={r.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      onClick={() => onSelect(r)}
                      className="w-full flex items-center gap-3.5 px-5 py-3 text-left transition-all"
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,102,241,0.08)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      {r.img ? (
                        <img src={r.img} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" style={{ border: `2px solid ${r.color}30` }} />
                      ) : (
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${r.color}15`, border: `1px solid ${r.color}25` }}>
                          <Search size={14} style={{ color: r.color }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: "13.5px", fontWeight: 600, color: "white", marginBottom: 2 }}>{r.title}</div>
                        <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.4)" }}>{r.subtitle}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg flex-shrink-0"
                        style={{ background: `${r.color}15`, fontSize: "10px", color: r.color, fontWeight: 700 }}>
                        {RESULT_TYPE_LABELS[r.type] || r.type}
                      </span>
                      <ArrowRight size={14} style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Search size={28} style={{ color: "rgba(255,255,255,0.15)", margin: "0 auto 10px" }} />
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)" }}>Không tìm thấy kết quả cho &quot;<strong style={{ color: "white" }}>{query}</strong>&quot;</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", marginTop: 4 }}>Thử từ khóa khác hoặc tìm theo tên creator</p>
                </div>
              )
            ) : (
              <div className="py-6 px-5">
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", fontWeight: 700, letterSpacing: "0.12em", marginBottom: 10 }}>GỢI Ý</p>
                <div className="flex flex-wrap gap-2">
                  {["Nhiếp Ảnh Gia", "Model", "Editor", "Fashion", "TVC", "Quang Vinh", "Thu Hà"].map(q => (
                    <button key={q} onClick={() => setQuery(q)}
                      className="px-3.5 py-1.5 rounded-xl transition-all"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,102,241,0.1)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
