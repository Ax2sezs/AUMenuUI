// src/components/QRCodePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion"
import QRCode from "react-qr-code";
import { AlertCircle, ChevronLeft, CreditCard, Printer } from "lucide-react";
import { useMenuData } from "../context/MenuDataContext";
import toast from "react-hot-toast";

export const QRCodePage = ({ currentOrder, setCurrentOrder, setIsCartOpen }) => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [finished, setFinished] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { fetchHistory, history } = useMenuData();

  useEffect(() => {
    fetchHistory();
  }, []);

  // Color Constants
  console.log("Pay Page : ", history)
  const details = history?.orderDetails || [];
  const [showIntro, setShowIntro] = useState(true);

  const handleCloseIntro = () => {
    setShowIntro(false);
  };
  // ป้องกัน back button
  useEffect(() => {
    const handlePopState = () => {
      // เมื่อยังไม่เสร็จสิ้นออเดอร์ ให้ป้องกันการย้อนกลับด้วยปุ่ม Back
      if (!finished) {
        window.history.pushState(null, document.title, window.location.pathname);
      }
    };
    window.addEventListener("popstate", handlePopState);

    // Initial push state เพื่อให้แน่ใจว่า history entry ถูกสร้างขึ้น
    window.history.pushState(null, document.title, window.location.pathname);

    return () => window.removeEventListener("popstate", handlePopState);
  }, [orderId, finished]);

  const handleFinishOrder = () => {
    sessionStorage.removeItem("finishedOrderId");
    sessionStorage.removeItem("token");
    setIsCartOpen(false)
    setCurrentOrder(null);
    setFinished(true);
    setShowConfirm(false);
    toast.success("ออเดอร์เสร็จสมบูรณ์!")
    navigate("/home", { replace: true });

  };

  const totalPrice = details.reduce((sum, item) => {
    const addonTotal = (item.orderAdds || []).reduce(
      (addonSum, addon) => Number(addonSum) + (Number(addon.ord_Qty) * Number(addon.ord_PriceNet)),
      0
    );
    const itemTotal = (Number(item.ord_Qty) * Number(item.ord_PriceNet)) + addonTotal;
    return sum + itemTotal;
  }, 0);

  return (
    <div
      className="flex flex-col min-h-[calc(var(--vh)*100)] max-w-md mx-auto relative bg-bg">
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs flex flex-col gap-4 text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-2xl font-bold text-main">วิธีการชำระเงิน</h3>
              <img src='/howtopay3.jpg' className="w-full rounded-lg shadow-sm" alt="How to Pay Guide" />
              <p className="text-gray-600 text-sm">
                โปรดนำ QR Code นี้ไปแสดงที่ **แคชเชียร์** เพื่อสแกนและชำระเงิน
              </p>
              <button
                onClick={handleCloseIntro}
                className="mt-2 text-white bg-main py-3 font-semibold rounded-xl hover:opacity-90 transition active:scale-[0.98]"
              >
                เข้าใจแล้ว
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Back Button */}
      <div className="sticky top-0 z-30 bg-[#fdfbf7]/90 backdrop-blur-md border-b border-stone-200 p-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/history")}
          className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 shadow-sm hover:scale-105 transition active:bg-stone-50"
        >
          <ChevronLeft size={22} />
        </button>
        <h2 className="text-2xl font-bold tracking-wide text-main">
          ยืนยันรายการสั่ง
        </h2>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-40">
        <div className="bg-white rounded-2xl shadow-xl w-full flex flex-col overflow-hidden border border-stone-100">
          {/* QR Code Section */}
          <div className="pt-6 pb-4 flex flex-col items-center bg-white">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">สแกนเพื่อชำระเงินที่เคาน์เตอร์</h2>
            <div className="bg-white p-4 rounded-xl border border-dashed border-stone-800">
              <QRCode value={orderId || "Order ID Not Found"} size={200} />
            </div>
            <span className="mt-3 block text-center text-md text-gray-500">Ref. {currentOrder.remark}</span>
          </div>

          {/* Receipt / Details Section */}
          <div className="p-4 bg-gray-50 border-t border-dashed border-stone-400">
            <h3 className="font-bold text-lg mb-3 text-main">รายละเอียดรายการสั่งซื้อ</h3>
            <div className="space-y-3">
              {details.map((item) => {
                const addonTotal = (item.orderAdds || []).reduce(
                  (sum, addon) => Number(sum) + (Number(addon.ord_Qty) * Number(addon.ord_PriceNet)),
                  0
                );
                const itemTotal = (Number(item.ord_Qty) * Number(item.ord_PriceNet)) + addonTotal;

                return (
                  <div key={item.s_Ord_D_Id} className="p-3 rounded-lg bg-white shadow-sm border border-stone-100">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex flex-col">
                        <span className="font-semibold text-base text-gray-800 flex-1 pr-4">{item.product_Name}</span>
                        <h1 className="text-gray-400 text-xs">{new Date(item.updatedOn).toLocaleString("th-TH")}</h1>
                      </div>
                      <span className="text-gray-600 font-medium whitespace-nowrap">
                        x{item.ord_Qty} {Number(item.ord_PriceNet).toFixed(2)} ฿
                      </span>
                    </div>

                    {(item.orderAdds || []).map((addon) => (
                      <div key={addon.s_Ord_Add_Id} className="flex justify-between ml-4 text-sm text-stone-500">
                        <span> + {addon.product_Name}</span>
                        <span>x{addon.ord_Qty} {Number(addon.ord_PriceNet).toFixed(2)} ฿</span>
                      </div>
                    ))}

                    <div className="mt-2 pt-2 border-t border-dashed border-stone-200 text-right text-lg font-bold text-main">
                      Total: {itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>


      {/* Footer / Summary and Action Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-stone-100 p-5 rounded-t-3xl shadow-[0_-5px_25px_rgba(0,0,0,0.05)] z-40">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-500 font-medium">ยอดรวมทั้งหมด</span>
          <span className="text-3xl font-bold leading-none text-main">
            {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-lg ml-1 font-medium text-gray-400">฿</span>
          </span>
        </div>
        {/* <button
          onClick={() => setShowConfirm(true)}
          className="w-full bg-main text-white h-12 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
        >
          <CreditCard size={20} />
          ยืนยันการจบออเดอร์
        </button> */}
      </div>


      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl text-gray-800 max-w-sm w-full p-6 flex flex-col items-center gap-4 relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()} // Stop propagation to prevent closing when clicking inside
            >
              <div className="bg-red-100 rounded-full p-4 flex items-center justify-center">
                <AlertCircle className="text-red-600 w-8 h-8" />
              </div>
              <h3 className="font-bold text-xl text-center text-gray-900">ยืนยันการจบออเดอร์</h3>
              <p className="text-center text-gray-700 text-sm">
                เมื่อกดปุ่ม <span className="font-semibold text-main">ยืนยัน</span> จะถือว่าออเดอร์นี้เสร็จสมบูรณ์ และจะนำคุณกลับไปหน้าเริ่มต้น
              </p>
              <div className="modal-action justify-center mt-2 flex gap-4 w-full">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="w-1/2 py-3 border border-stone-300 text-stone-600 bg-white rounded-xl font-semibold hover:bg-stone-50 transition"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleFinishOrder}
                  className="w-1/2 py-3 bg-main text-white rounded-xl font-semibold transition hover:opacity-90 active:scale-[0.98]"
                >
                  ยืนยัน
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
};