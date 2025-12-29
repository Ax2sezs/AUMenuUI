// src/pages/HistoryPage.jsx
import {
    ChevronLeft,
    Check,
    Loader2,
    ChevronsRight, // เพิ่ม icon ลูกศรคู่
    CreditCard, // เพิ่ม icon บัตรเครดิต (ทางเลือก)
    Handbag
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react"; // เพิ่ม useRef
import { useMenuData } from "../context/MenuDataContext";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";
// ---------------------------------------------
// 2. Main Component (HistoryPage)
// ---------------------------------------------
export const HistoryPage = () => {

    const { fetchHistory, history, loading } = useMenuData();
    const navigate = useNavigate();
    const [imgStages, setImgStages] = useState({});

    const THEME_RED = "#6c0202";
    const THEME_BG = "#fdfbf7";

    const latestOrder = history
        ? Array.isArray(history) ? history[0] : history
        : null;

    const details = latestOrder?.orderDetails || [];

    useEffect(() => {
        fetchHistory();
    }, []);

    const getSrc = (item) => {
        const stage = imgStages[item.m_Product_Id] ?? 0;
        const filename = item.product_Image?.replace(".png", ".jpg") ?? "default.jpg";
        switch (stage) {
            case 0: return `/img/${filename}`;
            case 1: return `https://posau.mmm2007.net/Images/Products/${item.product_Image}`;
            default: return "/default.png";
        }
    };

    // Logic เดิมของคุณ: ไปหน้า QR
    const handleReNavigateToQR = () => {
        if (!latestOrder || !latestOrder.s_Ord_H_Id) {
            toast.error("ไม่พบ Order ID");
            return;
        }

        // หน่วงเวลาเล็กน้อยเพื่อให้ Animation สไลด์เสร็จสวยๆ ก่อนเปลี่ยนหน้า
        setTimeout(() => {
            navigate(`/qr/${latestOrder.s_Ord_H_Id}`);
        }, 600);
    };

    const totalAmount = details.reduce((sum, item) => {
        const addonTotal = (item.orderAdds || []).reduce(
            (s, a) => s + Number(a.ord_Qty || 0) * Number(a.ord_PriceNet || 0),
            0
        );
        return sum + item.ord_PriceNet * item.ord_Qty + addonTotal;
    }, 0);
    useEffect(() => {
        // ล็อก scroll ของหน้าหลัก
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = "hidden";

        return () => {
            // คืนค่าเดิมตอนปิด history
            document.body.style.overflow = originalStyle;
        };
    }, []);
    useEffect(() => {
        const scrollY = window.scrollY;

        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";

        window.scrollTo(0, 0);

        return () => {
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            window.scrollTo(0, scrollY);
        };
    }, []);

    return (

        <div className="fixed inset-0 z-[100] flex flex-col bg-bg bg-grid-pattern min-h-[calc(var(--vh)*100)] max-w-md mx-auto">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-[#fdfbf7]/90 backdrop-blur-md border-b border-stone-200 p-3 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 shadow-sm hover:scale-105 transition active:bg-stone-50"
                >
                    <ChevronLeft size={18} />
                </button>
                <h2 className="text-xl font-bold tracking-wide text-main">
                    My Order
                </h2>
            </div>

            {/* History Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-48 scrollbar-hide">
                <div className="flex flex-col items-center rounded-2xl">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                        Scan at the counter to pay
                    </h2>
                    <div className="bg-white p-4 rounded-xl border border-dashed border-stone-800">
                        <QRCode value={latestOrder?.s_Ord_H_Id || "Order ID Not Found"} size={150} />
                    </div>
                    <span className="mt-3 block text-center text-sm text-gray-700">Ref. {latestOrder?.remark}</span>
                </div>
                {(loading && details.length === 0) ? (
                    <div className="flex flex-col items-center justify-center h-64 text-stone-300">
                        <div className="mb-4 p-6 bg-white rounded-full shadow-sm border border-stone-100">
                            <Loader2 size={32} className="animate-spin text-main" />
                        </div>
                        <p className="font-medium text-stone-500">กำลังดึงข้อมูล...</p>
                    </div>
                ) : (
                    <>
                        {details.map((item) => {
                            const itemTotal = (item.ord_PriceNet * item.ord_Qty) + (item.orderAdds || []).reduce(
                                (sum, a) => sum + (Number(a.ord_Qty || 0) * Number(a.ord_PriceNet || 0)),
                                0
                            );

                            return (
                                <div
                                    key={`${item.m_Product_Id}-${item.s_Ord_D_Id}`}
                                    className="relative bg-white rounded-2xl p-4 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.08)] border border-stone-100 overflow-hidden"
                                >

                                    {item.isTakehome && (
                                        <div className="flex items-center justify-start mb-3 text-xs break-words px-3 py-1.5 text-main font-semibold rounded-xl">
                                            <Handbag size={20} className="mr-1" /> Takeaway
                                        </div>
                                    )}
                                    {/* <div className="absolute top-0 right-0 py-2 px-3 bg-main text-white text-xs font-bold rounded-tr-2xl rounded-bl-xl shadow-md flex items-center gap-1">
                                        <Check size={16} />
                                    </div> */}

                                    <div className="flex gap-4 items-start">
                                        <div className="relative shrink-0">
                                            <img
                                                src={getSrc(item)}
                                                alt={item.product_Name}
                                                className="h-20 w-20 object-cover rounded-xl shadow-sm bg-gray-50"
                                                onError={() =>
                                                    setImgStages((prev) => ({
                                                        ...prev,
                                                        [item.m_Product_Id]: (prev[item.m_Product_Id] || 0) + 1,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div className="flex-1 min-h-[5rem] flex flex-col justify-between">
                                            <div className="flex flex-col justify-between items-start">
                                                <h3 className="font-bold text-lg text-gray-800 leading-tight line-clamp-2 pr-10">
                                                    {item.product_Name}
                                                </h3>
                                                <h1 className="text-gray-400 text-xs">{new Date(item.updatedOn).toLocaleString("th-TH")}</h1>
                                            </div>
                                            <div className="flex items-end justify-between mt-2">
                                                <div className="text-stone-600 font-medium">
                                                    x <span className="text-lg font-bold text-main">{item.ord_Qty}</span>
                                                </div>
                                                <span className="font-bold text-lg text-main">
                                                    {itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {(item.orderAdds || []).length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-dashed border-gray-200 space-y-2">
                                            {(item.orderAdds || []).map((addon) => (
                                                <div key={addon.s_Ord_Add_Id} className="flex items-center justify-between text-sm pl-2 border-l-2 border-stone-200">
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-600 font-medium">
                                                            + {addon.product_Name}
                                                            <span className="text-xs text-stone-500 ml-1">x {addon.ord_Qty}</span>
                                                        </span>
                                                    </div>
                                                    <div className="text-stone-500 text-xs">
                                                        {(Number(addon.ord_PriceNet || 0) * Number(addon.ord_Qty || 0)).toFixed(2)} ฿
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {item.ord_Comment && (
                                        <div className="mt-3 text-xs italic px-3 py-1.5 rounded bg-[#fdf2f2] text-[#6c0202] border border-[#f8e4e4]">
                                            Note: {item.ord_Comment}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {details.length === 0 && !loading && (
                            <div className="flex flex-col items-center justify-center h-64 text-stone-300">
                                <div className="mb-4 p-6 bg-white rounded-full shadow-sm border border-stone-100">
                                    <Check size={32} className="text-main" />
                                </div>
                                <p className="font-medium">ยังไม่มีรายการสั่ง</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ⭐️ Footer Summary & Slide to Pay */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-stone-100 p-5 rounded-t-3xl shadow-[0_-5px_25px_rgba(0,0,0,0.05)] z-40">
                <div className="flex justify-between items-center px-1">
                    <span className="text-gray-500 font-medium">Total </span>
                    <span className="text-3xl font-bold leading-none text-main">
                        {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="text-lg ml-1 font-medium text-gray-400">฿</span>
                    </span>
                </div>

                {/* <div className="w-full">
                    <SwipeButton
                        onComplete={handleReNavigateToQR}
                        text="สไลด์เพื่อชำระเงิน"
                        themeColor={THEME_RED}
                        disabled={loading || details.length === 0}
                    />
                </div> */}
            </div>
        </div>
    );
};