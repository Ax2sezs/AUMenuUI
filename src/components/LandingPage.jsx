// src/components/LandingPage.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useBranchAndOrder } from "../hooks/useBranchAndOrder";
import { useMenuData } from "../context/MenuDataContext";

export default function LandingPage() {
    const navigate = useNavigate();
    const { setCurrentOrder, setToken } = useBranchAndOrder();
    const { checkTable, fetchCurrentOrder } = useMenuData();

    useEffect(() => {
        const init = async () => {
            const tableNo = localStorage.getItem("tableNo");
            if (!tableNo) {
                navigate("/home", { replace: true });
                return;
            }

            try {
                const result = await checkTable(tableNo);
                if (result?.hasExistingOrder && result.token) {
                    sessionStorage.setItem("token", result.token);
                    setToken(result.token);

                    const orderData = await fetchCurrentOrder(result.token);
                    if (orderData) {
                        setCurrentOrder({
                            ...orderData,
                            orderDetails: [...(orderData.orderDetails || [])],
                        });
                    }
                    navigate("/menu", { replace: true });
                } else {
                    sessionStorage.removeItem("token");
                    navigate("/home", { replace: true });
                }
            } catch (err) {
                console.error(err);
                navigate("/home", { replace: true });
            }
        };

        init();
    }, [checkTable, fetchCurrentOrder, navigate, setCurrentOrder, setToken]);

    return (
        <div className="flex h-screen items-center justify-center bg-bg">
            <motion.div
                className="flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <img
                    src="./logo.png"
                    alt="loading logo"
                    className="w-40 h-40 object-contain mb-6 animate-pulse"
                />
            </motion.div>
        </div>
    );
}
