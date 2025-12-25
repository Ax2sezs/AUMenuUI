import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Minus, ChevronRight } from "lucide-react"; // ใช้ Icon ที่เส้นบางลง
import { useMenuData } from "../context/MenuDataContext";

export const WelcomeForm = ({ onOrderCreated }) => {
  const navigate = useNavigate();

  // --- Logic เดิมทั้งหมด ---
  const paxFromStorage = localStorage.getItem("customerCount");
  const [customerHead, setCustomerHead] = useState(
    paxFromStorage ? Number(paxFromStorage) : 1
  );
  const [payment,setPayment] = useState("")
  const [behavior] = useState("1");
  const { createOrder, orderLoading, error } = useMenuData();
  const table = localStorage.getItem("tableNo") || "";
  const branchCode = localStorage.getItem("branchCode")

  const getCustomerType = (headCount) => {
    if (headCount <= 1) return "Solo";
    if (headCount === 2) return "Duo";
    if (headCount >= 5) return "Family";
    return "Friends";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const orderData = {
      userId: "00000000-0000-0000-0000-000000000000",
      behaviorCode: behavior,
      tableName: table || "",
      customerHead: customerHead,
      cusType: getCustomerType(customerHead),
      sT_Nation_Id: "00000000-0000-0000-0000-000000000000",
      s_Branch_Id: "00000000-0000-0000-0000-000000000000",
      branch_Code: branchCode,
      Payment_Method : payment
    };

    const order = await createOrder(orderData);
    if (order) {
      onOrderCreated(order);
      window.location.href = "/menu";
      navigate("/menu", { replace: true });
    }
  };

  return (
    // Background: สีครีมโทนอุ่น (Warm Off-White) เหมือนกระดาษสา
    <div className="relative h-screen flex flex-col items-center justify-center bg-bg bg-grid-pattern text-[#2C2C2C] px-6 overflow-hidden">

      {/* Background Decor: วงกลมสไตล์ Zen เรียบๆ */}
      {/* <div className="absolute top-[-10%] right-[-20%] w-[50vh] h-[50vh] bg-main/30 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-20%] w-[60vh] h-[60vh] bg-[#F2F0EB] rounded-full blur-3xl opacity-60 pointer-events-none" /> */}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} // Custom cubic-bezier for smooth feeling
        className="w-full max-w-sm z-10 flex flex-col items-center"
      >

        {/* 1. Brand Section */}
        <div className="mb-12 text-center">
          {/* Logo แบบ Minimal (ปรับ Opacity ให้ดูไม่ตะโกน) */}
          <img src="/logo.png" alt="Logo" className="h-16 w-auto mx-auto mb-4 object-contain opacity-90 mix-blend-multiply" />
            <h1 className="text-sm font-light tracking-wide text-[#2C2C2C] mb-2">
              アフターユー
            </h1>
          <div className="w-12 h-[1px] bg-[#D4D4D4] mx-auto mb-4" />
          <h1 className="text-3xl font-light tracking-wide text-[#2C2C2C]">
            Welcome
          </h1>
          <p className="text-xs font-normal tracking-[0.2em] text-[#8C8C8C] mt-2 uppercase">
            After You Dessert Cafe
          </p>
        </div>

        {/* 2. Form Section */}
        <form onSubmit={handleSubmit} className="w-full">

          {/* Table Indicator (เส้นบางๆ สะอาดๆ) */}
          <div className="flex flex-col items-center mb-10">
            <span className="text-[10px] tracking-widest text-[#999] uppercase mb-1">Current Table</span>
            <div className="text-xl font-medium border-b border-[#D4D4D4] px-4 pb-1 min-w-[60px] text-center">
              {table || "-"}
            </div>
          </div>

          {/* Customer Counter (หัวใจหลักของดีไซน์) */}
          <div className="mb-2">
            <label className="block text-center text-sm text-[#666] mb-6 font-medium">
              How many guests?
            </label>

            <div className="flex items-center justify-center gap-8">
              {/* ปุ่มลบ: Minimal Circle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => setCustomerHead((prev) => Math.max(1, prev - 1))}
                disabled={customerHead <= 1}
                className="w-12 h-12 rounded-full border border-main flex items-center justify-center text-[#2C2C2C] hover:border-text-heavy transition-all duration-300 disabled:opacity-20 disabled:border-transparent"
              >
                <Minus size={16} />
              </motion.button>

              {/* ตัวเลข: ใหญ่ ชัด ไม่มีกรอบ */}
              <div className="relative w-24 text-center">
                <input
                  type="number"
                  min="1"
                  value={customerHead}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    if (!isNaN(num) && num > 0) setCustomerHead(num);
                  }}
                  className="w-full text-center text-4xl font-light bg-transparent outline-none text-main p-0 m-0 appearance-none" // ใช้ font-serif หรือ font ที่ดูหรูหราได้
                />
              </div>

              {/* ปุ่มบวก: Minimal Circle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => setCustomerHead((prev) => prev + 1)}
                className="w-12 h-12 rounded-full border border-main flex items-center justify-center text-[#2C2C2C] hover:border-text-heavy transition-all duration-300"
              >
                <Plus size={16} />
              </motion.button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-xs text-center mb-6"
            >
              {error.message}
            </motion.p>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={orderLoading}
            className="w-full h-14 mt-8 bg-main text-white rounded-full text-sm font-medium tracking-widest uppercase flex items-center justify-center gap-3"
          >
            {orderLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Start Order <ChevronRight size={16} />
              </>
            )}
          </motion.button>

        </form>
      </motion.div>

      {/* Footer Decoration */}
      <div className="absolute bottom-6 text-[10px] text-[#C0C0C0] tracking-[0.3em] font-light">
        THERE'S ALWAYS ROOM FOR DESSERT
      </div>

    </div>
  );
};