import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { DownloadCloud, Loader2, CheckCircle, X } from "lucide-react";
import { useMenuData } from "../context/MenuDataContext";
import { Loading } from "./LoadingScreen/Loading";

export const KbankQR = ({ currentOrder, setCurrentOrder, setIsCartOpen }) => {
    const {
        createPayment,
        paymentQr,
        paymentLoading,
        checkPaymentStatus,
        checkoutOrder,
        setPaymentQr,
    } = useMenuData();

    const { orderId } = useParams();
    const navigate = useNavigate();

    const [finished, setFinished] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const [showIntro, setShowIntro] = useState(true);

    const handleCloseIntro = () => {
        setShowIntro(false);
    };

    const intervalRef = useRef(null);
    const createdRef = useRef(false);

    // ========== สร้าง QR ครั้งเดียว ==========
    useEffect(() => {
        if (!createdRef.current) {
            createdRef.current = true;
            createPayment();
        }
    }, []);

    // ========== Poll payment status ==========
    useEffect(() => {
        if (!paymentQr || !currentOrder || finished) return;

        intervalRef.current = setInterval(async () => {
            try {
                const statusResult = await checkPaymentStatus();
                console.log("Status:", statusResult);

                if (Number(statusResult.status) === 1) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;

                    setIsCheckingOut(true);

                    const memberNumber = currentOrder.memberNumber || "";
                    const success = await checkoutOrder("thaiqr", memberNumber);

                    setIsCheckingOut(false);

                    if (success) {
                        setFinished(true);
                        navigate(`/kbankqr/${orderId}/success`, { replace: true });
                    } else {
                        console.warn("POS checkout failed");
                    }
                }

            } catch (err) {
                console.error("Error checking payment or checkout:", err);
            }
        }, 3000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [paymentQr, currentOrder, orderId, finished]);

    // ========== กัน Back Button ==========
    useEffect(() => {
        const handlePopState = () => {
            window.history.pushState(null, document.title, window.location.pathname);
        };
        window.addEventListener("popstate", handlePopState);
        window.history.pushState(null, document.title, window.location.pathname);

        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    // ========== คำนวณราคา ==========
    const details = currentOrder?.orderDetails || [];
    const totalPrice = details.reduce((sum, item) => {
        const addonTotal = (item.orderAdds || []).reduce(
            (addonSum, addon) => addonSum + addon.ord_Qty * addon.ord_PriceNet,
            0
        );
        return sum + item.ord_Qty * item.ord_PriceNet + addonTotal;
    }, 0);

    // ========== ปุ่ม Finish หลังจ่ายสำเร็จ ==========
    const handleFinishOrder = () => {
        sessionStorage.removeItem("finishedOrderId");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("currentOrder");
        localStorage.removeItem("branchCode");
        localStorage.removeItem("customerCount");
        localStorage.removeItem("tableNo");
        setCurrentOrder(null);
        setIsCartOpen(false);
        setPaymentQr("");
        navigate("/home", { replace: true });
    };

    // ========== ปุ่ม Cancel Payment ==========
    const handleCancelPayment = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        setPaymentQr("");
        navigate("/cart", { replace: true });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-bg bg-grid-pattern p-4">
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-2xl shadow-lg p-4 w-80 flex flex-col gap-4 text-center"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            {/* <h3 className="text-xl font-bold text-main">How to Pay</h3> */}
                            {/* <p className="text-gray-600 text-sm">
                                1. Scan the QR code at your table using your banking app.<br />
                                2. After payment, the system will automatically confirm your order.<br />
                                3. If paying by Cash or Card, please proceed to the cashier.
                            </p> */}
                            <img src='/howtopay2.jpg' className="w-full" />
                            <button
                                onClick={handleCloseIntro}
                                className="mt-4 bg-main text-white py-2 font-semibold rounded-xl hover:scale-105 transition"
                            >
                                Got it!
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden">

                {/* ========= QR / Success ========= */}
                <div className="p-6 flex flex-col items-center bg-gray-50 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-main mb-2 text-center">
                        {finished ? "Payment Successful!" : ""}
                    </h2>

                    {finished ? (
                        <>
                            <CheckCircle className="text-green-500 w-16 h-16 mb-2" />
                            <p className="text-gray-600 text-center">
                                Your payment has been received successfully. Thank you!
                            </p>
                        </>
                    ) : paymentLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                            <Loader2 className="animate-spin w-8 h-8 mb-2" />
                            <p>Generating QR Code...</p>
                        </div>
                    ) : paymentQr ? (
                        <>
                            <div className="border border-main flex flex-col items-center justify-center p-4 rounded-2xl mb-4">
                                <img src="/qrheader.png" className="" />

                                <div className="bg-white p-4 rounded-lg shadow-md mb-2">
                                    <img
                                        src={`data:image/png;base64,${paymentQr.qr_image}`}
                                        alt="KBank QR"
                                        className="w-48 h-48 object-contain"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-5">
                                <a
                                    href={`data:image/png;base64,${paymentQr.qr_image}`}
                                    download={`KBankQR_${totalPrice}.png`}
                                    className="btn bg-main border-hidden btn-sm gap-2 "
                                >
                                    <DownloadCloud /> Save QR Code
                                </a>

                                {/* ======== CANCEL BUTTON ======== */}
                                {!finished && (
                                    <button
                                        onClick={() => setShowCancelConfirm(true)}
                                        className="btn btn-sm border-heavy bg-white border text-main"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel Payment
                                    </button>

                                )}
                            </div>
                            <AnimatePresence>
                                {showCancelConfirm && (
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
                                            exit={{ scale: 0.9, opacity: 0 }}
                                        >
                                            <button
                                                onClick={() => setShowCancelConfirm(false)}
                                                className="absolute top-3 right-3 text-gray-500 hover:text-black"
                                            >
                                                ✕
                                            </button>

                                            <h3 className="text-xl font-bold text-main">Cancel Payment?</h3>

                                            <p className="text-gray-600 text-sm">
                                                Are you sure you want to cancel this payment?
                                            </p>

                                            <div className="flex justify-between gap-2 mt-2">
                                                <button
                                                    onClick={() => setShowCancelConfirm(false)}
                                                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300 transition"
                                                >
                                                    No
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowCancelConfirm(false);
                                                        handleCancelPayment();
                                                    }}
                                                    className="flex-1 bg-main text-white py-2 font-semibold rounded-xl hover:scale-105 transition"
                                                >
                                                    Yes, Cancel
                                                </button>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    ) : (
                        <p className="text-red-600 text-sm">Unable to generate QR code</p>
                    )}

                    {isCheckingOut &&
                        <Loading isLoading={isCheckingOut} />
                    }
                </div>

                {/* ========= Items ========= */}
                <div className="flex-1 overflow-auto p-4 space-y-3">
                    {details.map((item) => {
                        const addonTotal = (item.orderAdds || []).reduce(
                            (sum, addon) => sum + addon.ord_Qty * addon.ord_PriceNet,
                            0
                        );
                        const itemTotal = item.ord_Qty * item.ord_PriceNet + addonTotal;
                        return (
                            <div
                                key={item.s_Ord_D_Id}
                                className="p-3 border border-gray-100 rounded-lg bg-gray-50"
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-sm text-dark-text">
                                        {item.product_Name}
                                    </span>
                                    <span className="text-dark-text">
                                        {item.ord_Qty} × {item.ord_PriceNet} ฿
                                    </span>
                                </div>

                                {(item.orderAdds || []).map((addon) => (
                                    <div
                                        key={addon.s_Ord_Add_Id}
                                        className="flex justify-between ml-4 text-sm text-main"
                                    >
                                        <span>{addon.product_Name}</span>
                                        <span>
                                            {addon.ord_Qty} × {addon.ord_PriceNet} ฿
                                        </span>
                                    </div>
                                ))}

                                <div className="mt-2 text-right text-gray-800 font-semibold">
                                    Total: {itemTotal} ฿
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ========= Summary ========= */}
                <div className="border-t border-gray-200 p-4 bg-gray-50 flex flex-col gap-3">
                    <div className="flex justify-between text-gray-800 font-bold text-lg">
                        <span>Grand Total</span>
                        <span>{totalPrice} ฿</span>
                    </div>

                    {finished && (
                        <button
                            onClick={handleFinishOrder}
                            className="btn bg-main border-hidden w-full mt-4 text-white font-semibold"
                        >
                            Finish Order
                        </button>
                    )}
                </div>
            </div >
        </div >
    );
};
