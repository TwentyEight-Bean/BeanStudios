"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../context/AuthContext";
import { ArrowRight, Check, Sparkles, User, Briefcase, Star, Camera } from "lucide-react";

export function OnboardingWizard() {
  const { isLoggedIn, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (isLoggedIn) {
      const hasCompleted = localStorage.getItem(`onboarding_${user?.id}`);
      if (!hasCompleted) {
        // slight delay before showing
        const timer = setTimeout(() => setIsOpen(true), 1500);
        return () => clearTimeout(timer);
      }
    } else {
      setIsOpen(false);
      setStep(1);
    }
  }, [isLoggedIn, user?.id]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleComplete();
  };

  const handleComplete = () => {
    if (user?.id) localStorage.setItem(`onboarding_${user.id}`, "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: "#0A0A14", border: "1px solid rgba(255,255,255,0.1)" }}>
        
        {/* Progress bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
          <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: "33%" }} animate={{ width: `${(step / 3) * 100}%` }} transition={{ duration: 0.5 }} />
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
                <div className="w-16 h-16 mx-auto bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 border border-indigo-500/30">
                  <User className="text-indigo-400" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Chào mừng bạn đến với StudioBook!</h2>
                <p className="text-white/60 mb-8 leading-relaxed">Hành trình sáng tạo của bạn bắt đầu từ đây. Nền tảng kết nối các chuyên gia nhiếp ảnh, người mẫu và nhà sản xuất nội dung hàng đầu.</p>
                <div className="space-y-3 text-left">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <Check className="text-green-500" size={20} />
                    <span className="text-sm text-white/80">Hoàn thiện Profile chuyên nghiệp</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <Check className="text-green-500" size={20} />
                    <span className="text-sm text-white/80">Cập nhật Portfolio và dịch vụ</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
                <div className="w-16 h-16 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center mb-6 border border-purple-500/30">
                  <Briefcase className="text-purple-400" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Tìm kiếm & Đặt lịch dễ dàng</h2>
                <p className="text-white/60 mb-8 leading-relaxed">Tìm kiếm các Creator phù hợp với phong cách của bạn và lên lịch làm việc chỉ với vài thao tác đơn giản.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <Camera className="text-purple-400 mx-auto mb-2" size={24} />
                    <div className="text-sm font-bold text-white">Khám Phá</div>
                    <div className="text-xs text-white/50 mt-1">Hàng ngàn Creator</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <Star className="text-yellow-400 mx-auto mb-2" size={24} />
                    <div className="text-sm font-bold text-white">Đánh Giá</div>
                    <div className="text-xs text-white/50 mt-1">Từ cộng đồng</div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30">
                  <Sparkles className="text-green-400" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Tất cả đã sẵn sàng!</h2>
                <p className="text-white/60 mb-8 leading-relaxed">Cùng bắt đầu hành trình tạo ra những tác phẩm tuyệt vời nhất với StudioBook.</p>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6 text-left">
                  <p className="text-sm text-white/80 mb-2">Mẹo nhỏ: Bạn luôn có thể cập nhật thông tin cá nhân và portfolio trong phần <strong className="text-indigo-400">Cài đặt</strong>.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-white transition-colors">
                Quay lại
              </button>
            )}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNext} 
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]"
              style={{ background: "linear-gradient(135deg, #6366F1, #A855F7)" }}>
              {step === 3 ? "Bắt đầu ngay" : "Tiếp tục"} <ArrowRight size={16} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}