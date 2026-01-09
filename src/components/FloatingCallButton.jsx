import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, BellRing, Headset, X } from "lucide-react";
import toast from "react-hot-toast";

export default function FloatingCallButton({ callStaff, setCallStaff }) {
  return (
    <>

      {/* Modal */}
      <AnimatePresence>
        {callStaff && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCallStaff(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              className="bg-white rounded-2xl shadow-xl w-11/12 max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 bg-main text-white">
                <span className="font-medium">Call Staff</span>
                <button onClick={() => setCallStaff(false)}>
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 text-center space-y-4">
                <p className="text-stone-600 text-sm">
                  ต้องการเรียกพนักงานใช่หรือไม่
                </p>

                <button
                  onClick={() => {
                    // TODO: ยิง API / SignalR / แจ้ง POS ตรงนี้
                    setCallStaff(false);
                    toast.success("Staff Coming Soon!");
                  }}
                  className="
                   flex gap-5 justify-center w-full py-3 rounded-xl
                    bg-main text-white font-medium
                    active:scale-95 transition font-bold
                  "
                >
                 <BellRing/> Call Staff
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
