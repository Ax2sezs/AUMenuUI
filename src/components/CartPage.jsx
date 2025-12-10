// src/pages/CartPage.jsx
import {
    Trash2,
    Plus,
    Minus,
    ChevronLeft,
    Pen,
    Check,
    Loader2,
    Handbag
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMenuData } from "../context/MenuDataContext";
import { motion } from "framer-motion";
import { X, QrCode, Banknote, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

export const CartPage = ({ currentOrder, setCurrentOrder }) => {
    const {
        fetchCurrentOrder,
        updateProductQty,
        updateAddonQty,
        removeProductFromCart,
        removeAddonFromCart,
        checkoutOrder,
        loading,
    } = useMenuData();

    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imgStages, setImgStages] = useState({});
    const [qtyLoadingMap, setQtyLoadingMap] = useState({});
    const [localOrder, setLocalOrder] = useState(currentOrder);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [memberNumber, setMemberNumber] = useState("");
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(""); // "thaiQR" | "cash" | "visa"
    const [alert, setAlert] = useState(false);

    useEffect(() => {
        setLocalOrder(currentOrder);
    }, [currentOrder]);

    const details = localOrder?.orderDetails || [];

    useEffect(() => {
        window.scrollTo(0, 0);
        const setVh = () => {
            document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        };
        setVh();
        window.addEventListener('resize', setVh);
        return () => window.removeEventListener('resize', setVh);
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

    const handleOpenAddonPage = (item) => {
        if (!item?.s_Ord_D_Id) return;
        navigate(`/menu/${item.m_Product_Id}`, {
            state: {
                addonMode: true,
                orderDetailId: item.s_Ord_D_Id,
                productObj: {
                    m_Product_Id: item.m_Product_Id,
                    product_Name: item.product_Name,
                    comment: item.ord_Comment,
                    isTakeHome: item.isTakehome,
                    productQty: item.ord_Qty,
                    product_Image: item.product_Image,
                    bProduct_PriceNet: item.ord_PriceNet,
                },
                existingAddons: (item.orderAdds || []).map((a) => ({
                    addon: a,
                    qty: Number(a.ord_Qty) || 1,
                })),
            },
        });
    };

    const handleQtyChange = async (itemId, type, isAddon = false) => {
        const delta = type === "increment" ? 1 : -1;

        // อัปเดต UI ทันที (local)
        setLocalOrder((prev) => {
            const updated = { ...prev };
            updated.orderDetails = updated.orderDetails.map((item) => {
                if (!isAddon && item.s_Ord_D_Id === itemId) {
                    return { ...item, ord_Qty: Math.max(1, item.ord_Qty + delta) };
                }
                if (isAddon && item.orderAdds?.some((a) => a.s_Ord_Add_Id === itemId)) {
                    return {
                        ...item,
                        orderAdds: item.orderAdds.map((a) =>
                            a.s_Ord_Add_Id === itemId
                                ? { ...a, ord_Qty: Math.max(1, a.ord_Qty + delta) }
                                : a
                        ),
                    };
                }
                return item;
            });
            return updated;
        });

        // ยิง API และเช็คผล
        let success = false;

        if (isAddon) {
            success = await updateAddonQty(itemId, delta);
        } else {
            success = await updateProductQty(itemId, delta);
        }

        // ถ้า API สำเร็จค่อย sync order ใหม่
        if (success) {
            const updatedOrder = await fetchCurrentOrder();
            setCurrentOrder(updatedOrder);
        }
    };


    const handleRemove = async (itemId, isAddon = false) => {
        if (loading || isSubmitting) return;
        const success = isAddon
            ? await removeAddonFromCart(itemId)
            : await removeProductFromCart(itemId);

        if (success) {
            const updatedOrder = await fetchCurrentOrder();
            setCurrentOrder(updatedOrder);
        }
    };
    const handleCheckoutClick = () => {
        setShowMemberModal(true);
    };
    const handleConfirmMember = async (skip = false) => {
        setShowMemberModal(false);
        setSelectedPayment(""); // reset
        setShowPaymentModal(true); // เปิด modal เลือก payment
    };
    const handleConfirmPayment = async () => {
        if (!selectedPayment) return;

        setShowPaymentModal(false);
        setIsSubmitting(true);
        const payloadMember = memberNumber.trim() || null;

        try {
            if (selectedPayment === "thaiQR") {
                navigate(`/kbankqr/${currentOrder.s_Ord_H_Id}`, { replace: true });
                setIsSubmitting(false);
            } else {
                const success = await checkoutOrder(selectedPayment, payloadMember);
                if (!success) {
                    toast.error("Checkout ล้มเหลว!");
                    setIsSubmitting(false);
                    return;
                }
                navigate(`/qr/${currentOrder.s_Ord_H_Id}`, { replace: true });
                // onClearOrder();
            }
        } catch (err) {
            console.error(err);
            toast.error("เกิดข้อผิดพลาดขณะ Checkout");
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="flex flex-col min-h-[calc(var(--vh)*100)] max-w-md mx-auto relative bg-bg bg-grid-pattern"
        >

            {/* Header: Clean with Red Accent */}
            <div className="sticky top-0 z-30 bg-[#fdfbf7]/90 backdrop-blur-md border-b border-stone-200 p-4 flex items-center gap-4">
                <button
                    onClick={() => navigate("/menu")}
                    className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 shadow-sm hover:scale-105 transition active:bg-stone-50"
                >
                    <ChevronLeft size={22} />
                </button>
                <h2 className="text-2xl font-bold tracking-wide text-main">
                    My Cart
                </h2>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-44 scrollbar-hide">
                {details.map((item) => {
                    const addonTotal = (item.orderAdds || []).reduce(
                        (sum, a) => sum + (Number(a.ord_Qty || 0) * Number(a.ord_PriceNet || 0)),
                        0
                    );
                    const isProcessing = item.isSync === true;

                    return (
                        <div
                            key={`${item.m_Product_Id}-${item.s_Ord_D_Id}`}
                            className="group relative bg-white rounded-2xl p-4 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.08)] border border-stone-100 overflow-hidden"
                        >
                            {item.isTakehome && (
                                <div className="flex items-center justify-start mb-3 text-xs break-words px-3 py-1.5 text-main font-semibold rounded-xl">
                                    <Handbag size={20} className="mr-1" /> Takeaway
                                </div>
                            )}
                            {/* --- OVERLAY FOR SYNCING (JAPANESE STYLE) --- */}
                            {isProcessing && (
                                <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center select-none">
                                    <div className="bg-white p-3 rounded-full shadow-lg border border-stone-100">
                                        <Check />
                                    </div>
                                    ส่งรายการเรียบร้อย

                                </div>
                            )}

                            {/* Main Content */}
                            <div className="flex gap-4 items-start">
                                {/* Image */}
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

                                {/* Product Info */}
                                <div className="flex-1 min-h-[5rem] flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg text-gray-800 leading-tight line-clamp-2">
                                            {item.product_Name}
                                        </h3>
                                        <button
                                            onClick={() => handleRemove(item.s_Ord_D_Id)}
                                            className="text-gray-500 hover:text-red-500 transition -mt-1 -mr-2 p-2"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="flex items-end justify-between mt-2">
                                        {/* Qty Control: Outlined Style for Zen feel */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleQtyChange(item.s_Ord_D_Id, "decrement")}
                                                disabled={item.ord_Qty <= 1}
                                                className={`w-7 h-7 rounded-full border flex items-center justify-center transition
      ${item.ord_Qty <= 1
                                                        ? "border-stone-200 text-stone-400 cursor-not-allowed opacity-30"
                                                        : "border-main text-main"
                                                    }`}
                                            >
                                                <Minus size={14} />
                                            </button>

                                            <span className="font-bold text-gray-800 w-5 text-center text-lg">
                                                {qtyLoadingMap[item.s_Ord_D_Id] ? "..." : item.ord_Qty}
                                            </span>

                                            <button
                                                onClick={() => handleQtyChange(item.s_Ord_D_Id, "increment")}
                                                disabled={item.ord_Qty >= 10}
                                                className="w-7 h-7 rounded-full border border-main text-main flex items-center justify-center transition hover:bg-red-50 disabled:border-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>


                                        {/* Price: Highlighted with Theme Red */}
                                        <span className="font-bold text-lg text-main">
                                            {(item.ord_PriceNet * item.ord_Qty).toLocaleString()} ฿
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Add-ons Section */}
                            {(item.orderAdds || []).length > 0 && (
                                <div className="mt-4 pt-3 border-t border-dashed border-gray-200 space-y-3">
                                    {(item.orderAdds || []).map((addon) => (
                                        <div key={addon.s_Ord_Add_Id} className="flex items-center justify-between text-sm pl-2 border-l-2 border-main">
                                            <div className="flex flex-col">
                                                <span className="text-gray-600 font-medium">{addon.product_Name}</span>
                                                <span className="text-xs text-gray-400">+{addon.ord_PriceNet} ฿</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleQtyChange(addon.s_Ord_Add_Id, "decrement", true)}
                                                    disabled={addon.ord_Qty <= 1}
                                                    className="text-gray-400 hover:text-red-700 disabled:opacity-30"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="w-4 text-center font-medium text-gray-600">{addon.ord_Qty}</span>
                                                <button
                                                    onClick={() => handleQtyChange(addon.s_Ord_Add_Id, "increment", true)}
                                                    disabled={addon.ord_Qty >= 10}
                                                    className="text-gray-400 hover:text-red-700 disabled:opacity-30"
                                                >
                                                    <Plus size={12} className="text-main" />
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(addon.s_Ord_Add_Id, true)}
                                                    className="ml-4 text-main"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Note & Actions */}
                            <div className="mt-3 flex justify-between items-center">
                                <button
                                    onClick={() => handleOpenAddonPage(item)}
                                    className="text-xs font-medium flex items-center gap-1 transition px-3 py-1 rounded-md border border-main bg-stone-50 hover:bg-stone-100 text-stone-500"
                                >
                                    <Pen size={12} />
                                    Edit
                                </button>
                                {(addonTotal > 0) && (
                                    <span className="text-xs text-gray-400">
                                        (Add-on total: {addonTotal})
                                    </span>
                                )}
                            </div>

                            {item.ord_Comment && (
                                <div className="mt-2 text-xs break-words px-3 py-1.5 rounded bg-bg/60 text-text-heavy border border-main/20">
                                    Note: {item.ord_Comment}
                                </div>
                            )}
                        </div>
                    );
                })}

                {details.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-stone-300">
                        <div className="mb-4 p-6 bg-white rounded-full shadow-sm border border-stone-100">
                            <Trash2 size={32} strokeWidth={1.5} />
                        </div>
                        <p className="font-medium">ยังไม่มีรายการอาหาร</p>
                    </div>
                )}
            </div>

            {/* Footer Summary */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-stone-100 p-5 rounded-t-3xl shadow-[0_-5px_25px_rgba(0,0,0,0.05)] z-40">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-gray-500 font-medium mb-1">Total </span>
                    <span className="text-3xl font-bold leading-none text-main">
                        {details.reduce((sum, item) => {
                            const addonTotal = (item.orderAdds || []).reduce(
                                (s, a) => s + Number(a.ord_Qty || 0) * Number(a.ord_PriceNet || 0),
                                0
                            );
                            return sum + item.ord_PriceNet * item.ord_Qty + addonTotal;
                        }, 0).toLocaleString()}
                        <span className="text-lg ml-1 font-medium text-gray-400">฿</span>
                    </span>
                </div>

                <button
                    onClick={handleCheckoutClick}
                    disabled={details.length === 0 || isSubmitting}
                    className="w-full text-white bg-main h-14 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none"
                >
                    {isSubmitting ? (
                        <span className="loading loading-spinner loading-sm text-white"></span>
                    ) : (
                        <>
                            <span>Confirm Order</span>
                            <Check size={20} />
                        </>
                    )}
                </button>
            </div>
            {alert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center blur-backdrop bg-black/50 p-4">
                    <div className="bg-white pb-4 rounded-xl shadow-lg max-w-sm w-full flex flex-col items-center text-center space-y-4">
                        <img
                            src="/howtopayttk.png"
                            alt="Alert"
                            className="w-full h-auto rounded-md"
                        />
                        <div className="flex items-center justify-center gap-2">
                            <input className="checkbox checkbox-neutral" type="checkbox" id="dontShowAgain" onChange={(e) => {
                                if (e.target.checked) {
                                    localStorage.setItem("accept", true);
                                } else {
                                    localStorage.removeItem("accept");
                                }
                            }} />
                            <label htmlFor="dontShowAgain" className="text-sm text-gray-600">ไม่ต้องแสดงอีก</label>
                        </div>
                        <button
                            onClick={() => {
                                navigate('/menu');
                                setAlert(false);
                            }}
                            className="px-6 py-2 bg-main text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            )}
            {showMemberModal && (
                <motion.div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="relative bg-white rounded-2xl shadow-lg p-6 w-80 flex flex-col gap-4 text-center"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <button
                            onClick={() => setShowMemberModal(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-black"
                        >
                            <X />
                        </button>

                        <h3 className="text-xl font-bold text-main">Enter Member</h3>
                        <input
                            type="text"
                            placeholder="081-234-5678"
                            maxLength={10}
                            value={memberNumber}
                            onChange={(e) => setMemberNumber(e.target.value)}
                            className="border border-gray-300 text-main rounded-xl px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-main"
                        />

                        <div className="flex justify-between gap-2 mt-2">
                            <button
                                onClick={() => handleConfirmMember(true)} // กดข้าม
                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300 transition"
                            >
                                Skip
                            </button>
                            <button
                                onClick={() => handleConfirmMember(false)} // ยืนยันหมายเลข
                                disabled={memberNumber.length < 10}
                                className="flex-1 bg-main text-white py-2 font-semibold rounded-xl hover:scale-105 transition disabled:bg-main/50"
                            >
                                Confirm
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <motion.div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="relative bg-white rounded-2xl shadow-lg p-6 w-80 flex flex-col gap-4 text-center"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-black"
                        >
                            <X />
                        </button>

                        <h3 className="text-xl font-bold text-main">Select Payment Method</h3>

                        <div className="flex flex-col gap-3 mt-4">
                            {[
                                {
                                    id: "thaiQR",
                                    label: "Thai QR Payment",
                                    icon: <QrCode className="w-6 h-6" />,
                                    note: "Pay directly at your table"
                                },
                                {
                                    id: "cash",
                                    label: "Cash",
                                    icon: <Banknote className="w-6 h-6" />,
                                    note: "Pay at the cashier"
                                },
                                {
                                    id: "creditCard",
                                    label: "Credit Card",
                                    icon: <CreditCard className="w-6 h-6" />,
                                    note: "Pay at the cashier"
                                },
                            ].map((method) => (
                                <div key={method.id} className="flex flex-col gap-1">
                                    <button
                                        onClick={() => setSelectedPayment(method.id)}
                                        className={`flex items-center gap-3 justify-center py-2 px-3 rounded-xl transition border ${selectedPayment === method.id
                                            ? "border-main bg-main text-white"
                                            : "border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200"
                                            }`}
                                    >
                                        {method.icon}
                                        <span className="flex-1 text-center">{method.label}</span>
                                    </button>
                                    <span className="text-xs text-gray-500">{method.note}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleConfirmPayment}
                            disabled={!selectedPayment}
                            className="mt-4 bg-main text-white py-2 font-semibold rounded-xl hover:scale-105 transition disabled:opacity-50"
                        >
                            Confirm
                        </button>
                    </motion.div>
                </motion.div>
            )}

        </div >
    );
};