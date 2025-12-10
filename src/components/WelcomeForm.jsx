import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, UtensilsCrossed, Users, Plus, Minus } from "lucide-react"; // เพิ่ม Users icon
import clsx from "clsx";
import { useMenuData } from "../context/MenuDataContext";
import { nav } from "framer-motion/client";

export const WelcomeForm = ({ onOrderCreated }) => {
  const navigate = useNavigate();
  // ⭐️ แก้ไข: customerHead เป็น number input (ใช้ค่าเริ่มต้นจาก localStorage หรือ 1)
  const paxFromStorage = localStorage.getItem("customerCount");
  const [customerHead, setCustomerHead] = useState(
    paxFromStorage ? Number(paxFromStorage) : 1
  );
  const [behavior, setBehavior] = useState("1"); // 1 = Dine In, 2 = Takeaway
  const { createOrder, orderLoading, error } = useMenuData();

  const branchCode = localStorage.getItem("branchCode") || "null";
  const table = localStorage.getItem("tableNo") || "";

  // ⭐️ Logic สำหรับการกำหนด cusType (ใช้ค่าคงที่แทน CusTypeMap)
  const getCustomerType = (headCount) => {
    if (headCount <= 1) return "Solo";
    if (headCount === 2) return "Duo";
    if (headCount >= 5) return "Family";
    return "Friends"; // 3, 4
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const orderData = {
      userId: "00000000-0000-0000-0000-000000000000",
      behaviorCode: behavior,
      tableName: table || "",
      // ⭐️ ใช้ customerHead ที่ผู้ใช้กรอก
      customerHead: customerHead,
      // ⭐️ ใช้ logic ใหม่ในการกำหนด CusType
      cusType: getCustomerType(customerHead),
      sT_Nation_Id: "00000000-0000-0000-0000-000000000000",
      s_Branch_Id: "00000000-0000-0000-0000-000000000000",
      branch_Code: "ABH",
    };
    console.log("Order Data:", orderData);
    const order = await createOrder(orderData);
    console.log("Order created:", order);

    if (order) {
      // 1. เรียก action ของ parent (AppContent) เพื่อ set token/order
      onOrderCreated(order);
      // 2. นำทางไปยังหน้า Menu ทันทีเมื่อ Order สร้างสำเร็จ
      // navigate("/menu", { replace: true });
      window.location.href = "/menu";
      navigate("/menu", { replace: true });
    }
  };

  const tabs = [
    { id: "1", label: "ทานในร้าน", icon: <UtensilsCrossed size={20} /> },
    // { id: "2", label: "สั่งกลับบ้าน", icon: <ShoppingBag size={20} /> },
  ];

  return (
    <div className="relative h-screen flex flex-col justify-center pb-40 bg-bg bg-grid-pattern">
      {/* Logo */}
      <div className="flex flex-col w-full justify-center items-center pt-10">
        <img src="/logo.png" alt="Logo" className="w-full h-18 object-contain" />
        <span className="text-sm font-bold text-text-heavy">アフターユー</span>
      </div>

      {/* MAIN FORM */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-md p-4 md:p-8"
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-6 rounded-2xl shadow-xl border border-stone-100"
        >

          {/* HEADER */}
          <div className="flex items-center justify-between mb-3">
            <label className="flex font-semibold text-lg text-gray-700 gap-3">
              <UtensilsCrossed /> Dine In
            </label>
            <span className="text-main text-md bg-main/10 px-4 py-0.5 text-center rounded-3xl font-extrabold">
              Table {table || "-"}
            </span>
          </div>
          <div className="border border-stone-200 rounded-xl overflow-hidden" />
          {/* จำนวนลูกค้า */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className=""
          >
            <label className="block font-semibold mb-3 text-gray-700 text-start">
              Number of diners (persons)
            </label>

            <div className="flex items-center gap-2 justify-between mx-2">
              {/* ลด */}
              <button
                type="button"
                onClick={() => setCustomerHead((prev) => Math.max(1, prev - 1))}
                disabled={customerHead <= 1}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-2xl font-bold text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              >
                <Minus size={18} />
              </button>

              <div className="relative w-40">
                <Users
                  size={20}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="number"
                  min="1"
                  value={customerHead}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    if (!isNaN(num) && num > 0) setCustomerHead(num);
                  }}
                  required
                  className="w-full py-2 pl-8 pr-2 text-center text-main rounded-3xl border-2 border-stone-200 focus:border-main outline-none text-xl font-semibold"
                />
              </div>

              <button
                type="button"
                onClick={() => setCustomerHead((prev) => prev + 1)}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-2xl font-bold text-gray-700 hover:bg-gray-300"
              >
                <Plus size={18} />
              </button>
            </div>
          </motion.div>

          {/* ERROR */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-center text-sm font-medium"
            >
              {error.message || "เกิดข้อผิดพลาดในการสร้างออเดอร์"}
            </motion.p>
          )}

          {/* SUBMIT */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={orderLoading}
            className="mt-10 w-full h-14 rounded-xl bg-main font-bold text-xl text-white shadow-lg flex items-center justify-center"
          >
            {orderLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Start Order"
            )}
          </motion.button>
        </form>
      </motion.div>

    </div >
  );
};