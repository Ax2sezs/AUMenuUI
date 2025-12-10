import { CreditCard, X, Trash2, ShoppingCart, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export const Cart = ({
    currentOrder,
    setCurrentOrder,
    fetchCurrentOrder,
    removeProductFromCart,
    removeAddonFromCart,
    updateProductQty,
    updateAddonQty,
    checkoutOrder,
    onClearOrder,
    onClose,
    loading,
    checkoutLoading,
    isAddonMode,
    openModal,
    addons,
    handdleAddAddon,
    setInitialLoad,
}) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false); // ✅ state สำหรับ overlay โหลด
    const [index, setIndex] = useState(0);

    const details = currentOrder?.orderDetails || currentOrder?.OrderDetails || [];

    const handleOpenAddonModal = (item) => {
        if (!item || !item.m_Product_Id) return;

        const productObj = {
            m_Product_Id: item.m_Product_Id,
            product_Name: item.product_Name,
            product_Image: item.product_Image,
            bProduct_PriceNet: item.ord_PriceNet,
        };

        const preloadAddons = (item.orderAdds || []).map(a => ({
            addon: a,
            qty: Number(a.ord_Qty) || 1
        }));


        openModal(
            productObj,    // ใช้ชื่อ productObj ให้ชัดเจน
            true,
            item.s_Ord_D_Id,
            setInitialLoad(preloadAddons)
        );
        console.log("Opening addon modal for item:", preloadAddons)
    };


    const handleCheckout = async () => {
        setIsSubmitting(true); // ✅ แสดง overlay
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const success = await checkoutOrder();
        if (success) {
            sessionStorage.setItem("finishedOrderId", currentOrder.s_Ord_H_Id);
            navigate(`/qr/${currentOrder.s_Ord_H_Id}`);
            onClearOrder();
            onClose();
        } else {
            toast.error("Checkout ล้มเหลว!");
            setIsSubmitting(false); // ❌ ปิด overlay ถ้า error
        }
    };

    const handleQtyChange = async (itemId, type, isAddon = false) => {
        if (loading || isSubmitting) return;
        const delta = type === "increment" ? 1 : -1;

        const success = isAddon
            ? await updateAddonQty(itemId, delta)
            : await updateProductQty(itemId, delta);

        if (success) {
            const updatedOrder = await fetchCurrentOrder(currentOrder.s_Ord_H_Id);
            setCurrentOrder(updatedOrder);
        }
    };

    const handleRemove = async (itemId, isAddon = false) => {
        if (loading || isSubmitting) return;

        const success = isAddon
            ? await removeAddonFromCart(itemId)
            : await removeProductFromCart(itemId);

        if (success) {
            const updatedOrder = await fetchCurrentOrder(currentOrder.s_Ord_H_Id);
            setCurrentOrder(prev => ({
                ...prev,
                ...updatedOrder,
            }));

        }
    };


    const icons = [
        "menu/1.png",
        "menu/2.png",
        "menu/3.png",
        "menu/4.png",
        "menu/5.png"
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % icons.length);
        }, 1500);
        return () => clearInterval(timer);
    }, []);

    return (

        <div className="relative bg-white bg-grid-pattern shadow-xl w-full h-full max-w-md p-5 font-itim text-gray-800 flex flex-col overflow-hidden">

            {/* ✅ Overlay Loading */}
            {isSubmitting && (

                <motion.div
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >

                    {/* 🔹 ภาพหลักแบบวนลูป */}
                    <div className="relative w-32 h-32 flex items-center justify-center mb-6">

                        <AnimatePresence mode="wait">
                            <motion.img
                                key={icons[index]} // เปลี่ยน key ทุกครั้งเพื่อให้ AnimatePresence ทำงาน
                                src={icons[index]}
                                alt="loading icon"
                                className="absolute w-28 h-28 object-contain"
                                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 1.2, rotate: 10 }}
                                transition={{
                                    duration: 0.3,
                                    ease: "easeInOut",
                                }}
                            />
                        </AnimatePresence>
                    </div>

                    {/* 🔹 จุดโหลด */}
                    <motion.div className="flex gap-2 mb-4">
                        <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-3 h-3 bg-white rounded-full animate-bounce"></span>
                    </motion.div>
                </motion.div>

            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b border-dashed pb-2">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-main">
                    <ShoppingCart /> Cart
                </h2>
                <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="p-2 rounded-full hover:bg-gray-200 transition disabled:opacity-50"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-auto space-y-4 pr-1">
                {details.map((item) => {
                    const addonTotal = (item.orderAdds || item.OrderAdds || []).reduce(
                        (sum, a) => sum + (Number(a.ord_Qty || 0) * Number(a.ord_PriceNet || 0)),
                        0
                    );

                    return (
                        <div
                            key={item.s_Ord_D_Id}
                            className="bg-gray-50 rounded-xl p-3 shadow border border-gray-100"
                        >
                            <div className="flex gap-3 items-center mb-2">
                                <figure className="relative overflow-hidden rounded-lg">
                                    <img
                                        src={`https://posau.mmm2007.net/Images/Products/${item.product_Image}`}
                                        alt={item.product_Name}
                                        className="h-16 w-16 object-cover rounded-lg"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = "/default.png";
                                        }}
                                    />
                                </figure>

                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-lg">{item.product_Name}</span>
                                        <button
                                            onClick={() => handleRemove(item.s_Ord_D_Id)}
                                            className="text-red-500 hover:bg-red-100 p-1 rounded-full disabled:opacity-50"
                                            disabled={isSubmitting}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {/* Qty control */}
                                    <div className="flex items-center gap-2 mt-1">
                                        <button
                                            onClick={() => handleQtyChange(item.s_Ord_D_Id, "decrement")}
                                            disabled={isSubmitting}
                                            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-lg disabled:opacity-50"
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <span className="w-7 text-center">{item.ord_Qty}</span>
                                        <button
                                            onClick={() => handleQtyChange(item.s_Ord_D_Id, "increment")}
                                            disabled={isSubmitting}
                                            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-lg disabled:opacity-50"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Addons */}
                            {(item.orderAdds || item.OrderAdds || []).map((addon) => (
                                <div
                                    key={addon.s_Ord_Add_Id}
                                    className="flex justify-between items-center ml-5 mt-2"
                                >
                                    <span className="text-sm text-gray-700">{addon.product_Name}</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() =>
                                                handleQtyChange(addon.s_Ord_Add_Id, "decrement", true)
                                            }
                                            disabled={isSubmitting}
                                            className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-sm disabled:opacity-50"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-5 text-center text-sm">{addon.ord_Qty}</span>
                                        <button
                                            onClick={() =>
                                                handleQtyChange(addon.s_Ord_Add_Id, "increment", true)
                                            }
                                            disabled={isSubmitting}
                                            className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-sm disabled:opacity-50"
                                        >
                                            <Plus size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleRemove(addon.s_Ord_Add_Id, true)}
                                            disabled={isSubmitting}
                                            className="ml-1 p-1 rounded-full hover:bg-red-100 text-red-600 disabled:opacity-50"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="mt-2 text-right">
                                <button
                                    onClick={() => handleOpenAddonModal(item)}
                                    className="btn bg-main btn-xs border-hidden text-white text-xs"
                                >
                                    + Add Addon
                                </button>
                            </div>
                            {/* Price summary */}
                            <div className="mt-3 text-right text-sm text-gray-500 border-t pt-2">
                                <div>Base: {item.ord_PriceNet * item.ord_Qty} ฿</div>
                                <div>Add-on: {addonTotal} ฿</div>
                                <div className="font-semibold text-gray-800 text-base">
                                    Total : {item.ord_PriceNet * item.ord_Qty + addonTotal} ฿
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="sticky -bottom-10 left-0 bg-white border-t border-dashed mt-4 pt-3 pb-2">
                <div className="flex justify-between items-center">
                    <span className="text-xl font-semibold">
                        Grand Total:{" "}
                        {details.reduce((sum, item) => {
                            const addonTotal = (item.orderAdds || item.OrderAdds || []).reduce(
                                (s, a) => s + (Number(a.ord_Qty || 0) * Number(a.ord_PriceNet || 0)),
                                0
                            );
                            return sum + item.ord_PriceNet * item.ord_Qty + addonTotal;
                        }, 0)}{" "}
                        ฿
                    </span>
                    <button
                        onClick={handleCheckout}
                        disabled={checkoutLoading || isSubmitting}
                        className="flex items-center gap-2 bg-main text-white px-4 py-2 rounded-lg font-semibold hover:bg-main-dark transition disabled:opacity-50"
                    >
                        {isSubmitting ? <span>Processing...</span> : <>
                            <CreditCard size={20} /> Confirm
                        </>}
                    </button>
                </div>
            </div>
        </div>
    );
};
