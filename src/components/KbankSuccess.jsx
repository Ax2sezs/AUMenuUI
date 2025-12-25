// src/components/KBankSuccess.jsx
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle, ChevronRight, DownloadCloud } from "lucide-react";

export const KbankSuccess = ({ currentOrder, setCurrentOrder, setIsCartOpen }) => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const details = currentOrder?.orderDetails || [];
  const totalPrice = details.reduce((sum, item) => {
    const addonTotal = (item.orderAdds || []).reduce(
      (s, a) => s + a.ord_Qty * a.ord_PriceNet,
      0
    );
    return sum + item.ord_Qty * item.ord_PriceNet + addonTotal;
  }, 0);

  // ล็อก back browser
  useEffect(() => {
    const handlePopState = () => {
      window.history.pushState(null, document.title, window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    window.history.pushState(null, document.title, window.location.pathname);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleFinishOrder = () => {
    sessionStorage.removeItem("finishedOrderId");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("currentOrder");
    // localStorage.removeItem("branchCode");
    // localStorage.removeItem("customerCount");
    // localStorage.removeItem("tableNo");

    setCurrentOrder(null);
    setIsCartOpen(false);
    navigate("/home", { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg bg-grid-pattern p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden">
        {/* Success Header */}
        <div className="p-6 flex flex-col items-center bg-gray-50 border-b border-gray-200">
          <CheckCircle className="text-main w-16 h-16 mb-2" />
          <h2 className="text-xl font-bold text-main mb-2 text-center">
            Payment Successful!
          </h2>
          <p className="text-gray-600 text-center">
            Your payment has been received successfully. Thank you for your order!
          </p>
        </div>

        {/* Order Items */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {details.map((item) => {
            console.log("ITEM : ",item)
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
                  <span className="font-semibold break-words text-sm w-48 text-dark-text">
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
                    <span className="flex w-48 break-words">
                      <ChevronRight size={16}/>
                      {addon.product_Name}</span>
                    <span>
                      {addon.ord_Qty} × {addon.ord_PriceNet} ฿
                    </span>
                  </div>
                ))}
                <div className="mt-2 text-right text-text-heavy font-semibold">
                  Total: {itemTotal} ฿
                </div>

              </div>
            );
          })}
        </div>

        {/* Summary / Finish */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex flex-col gap-3">
          <div className="flex justify-between text-gray-800 font-bold text-lg">
            <span>Grand Total</span>
            <span>{totalPrice} ฿</span>
          </div>
          <button
            onClick={handleFinishOrder}
            className="btn bg-main border-hidden w-full mt-4 text-white font-semibold"
          >
            Finish Order
          </button>
        </div>
      </div>
    </div>
  );
};
