// src/AppContent.jsx
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

import { Header } from "./components/Header";
import { Navbar } from "./components/Navbar";
import { WelcomeForm } from "./components/WelcomeForm";
import { MenuPage } from "./components/MenuPage";
import { CartPage } from "./components/CartPage";
import { QRCodePage } from "./components/QRCodePage";
import { ProductPage } from "./components/ProductPage";
import { KbankQR } from "./components/KbankQR";
import { KbankSuccess } from "./components/KBankSuccess";
import { useBranchAndOrder } from "./hooks/useBranchAndOrder";
import { ScrollToTop } from "./components/utils/ScrollToTop";
import { CategoryTabs } from "./components/CategoryTabs";
import { useMenuData } from "./context/MenuDataContext";
import { HistoryPage } from "./components/HistoryPage";
import LandingPage from "./components/LandingPage";
import TableClosedPage from "./components/TableClosedPage";
import MobileOnlyScreen from "./components/MobileOnlyScreen";
import MenuLayout from "./MenuLayout";
import FloatingCallButton from "./components/FloatingCallButton";

// =================== Route Guards ===================
const RequireNotCheckedOut = ({ children }) => {
  const finishedOrderId = sessionStorage.getItem("finishedOrderId");
  if (finishedOrderId) return <Navigate to={`/kbankqr/${finishedOrderId}/success`} replace />;
  return children;
};

const RequireToken = ({ children }) => {
  const token = sessionStorage.getItem("token");
  if (!token) return <Navigate to="/home" replace />;
  return children;
};

const RequireOrderContext = ({ children, currentOrder, currentOrderLoading }) => {
  const token = sessionStorage.getItem("token");
  if (!token) return <Navigate to="/home" replace />;
  // รอ loading ก่อน redirect
  if (!currentOrder && !currentOrderLoading) return <Navigate to="/home" replace />;
  return <RequireNotCheckedOut>{children}</RequireNotCheckedOut>;
};

const RequireSuccessLock = ({ children }) => {
  // useEffect(() => {
  //   const handlePopState = () => {
  //     window.history.pushState(null, document.title, window.location.pathname);
  //   };
  //   window.addEventListener("popstate", handlePopState);
  //   window.history.pushState(null, document.title, window.location.pathname);
  //   return () => window.removeEventListener("popstate", handlePopState);
  // }, []);
  useEffect(() => {
    const preventBack = (e) => {
      e.preventDefault();
      navigate(window.location.pathname, { replace: true });
    };
    window.addEventListener("popstate", preventBack);
    return () => window.removeEventListener("popstate", preventBack);
  }, []);

  return children;
};

// =================== AppContent ===================
export default function AppContent() {
  const {
    currentOrder,
    setCurrentOrder,
    currentOrderLoading,
    handleOrderCreated,
    history,
    setHistory,
    setToken,
    token,
  } = useBranchAndOrder();

  const location = useLocation();
  const navigate = useNavigate();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deptCode, setDeptCode] = useState("All");
  const [search, setSearch] = useState("");
  const { fetchMenu, checkTable, fetchCurrentOrder: fetchCurrentOrderOriginal } = useMenuData();
  const [cart, setCart] = useState([]);
  const [menu, setMenu] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [callStaff, setCallStaff] = useState(false);
  const isProgrammaticScroll = useRef(false);

  // console.log("CURRENT ORDER : ", currentOrder);

  const hasInit = useRef(false);

  useEffect(() => {
    if (location.pathname !== "/home" && location.pathname !== "/") return;
    hasInit.current = true
    const init = async () => {
      const tableNo = localStorage.getItem("tableNo");
      const refid = localStorage.getItem("refid");
      if (!tableNo && !refid) {
        navigate("/table-closed", { replace: true });
        return;
      }

      try {
        const result = await checkTable({ tableId: tableNo, refId: refid });
        console.log("Check Table Result:", result);
        if (result?.isClosed) {
          // โต๊ะปิด → ไปหน้า TableClosed
          sessionStorage.removeItem("token");
          navigate("/table-closed", { replace: true });
          return;
        }

        if (result?.hasExistingOrder && result.token) {
          sessionStorage.setItem("token", result.token);
          setToken(result.token);

          const orderData = await fetchCurrentOrderOriginal(result.token);
          if (orderData) {
            setCurrentOrder({
              ...orderData,
              orderDetails: [...(orderData.orderDetails || [])],
            });
          }
          navigate("/menu", { replace: true }); // โต๊ะเปิดและมี order → menu
        } else {
          // โต๊ะเปิดแต่ไม่มี order → หน้า WelcomeForm
          sessionStorage.removeItem("token");
          navigate("/home", { replace: true });
        }
      } catch (err) {
        console.error(err);
        sessionStorage.removeItem("token");
        navigate("/table-closed", { replace: true });
      }
    };

    init();
  }, [navigate, location.pathname, setCurrentOrder, setToken, fetchCurrentOrderOriginal]);

  // =================== Load menu ===================
  // useEffect(() => {
  //   if (!token) return;

  //   const loadMenu = async () => {
  //     try {
  //       const data = await fetchMenu(deptCode, search, token);
  //       console.log("MENU DATA FROM AppContext :", data);
  //       setMenu(data || []);
  //       if (data && data.length > 0) setActiveCategoryId(data[0].sT_PCategory_Id);
  //     } catch (err) {
  //       setMenu([]);
  //       if (err.response && err.response.status === 401) {
  //         sessionStorage.removeItem("token");
  //         navigate("/home", { replace: true });
  //       }
  //     }
  //   };

  //   loadMenu();
  // }, [deptCode, search, token, fetchMenu, navigate]);

  useEffect(() => {
    if (!token) return;

    const loadMenu = async () => {
      try {
        const data = await fetchMenu(deptCode, search, token);
        setMenu(data || []);
        if (data && data.length > 0) setActiveCategoryId(data[0].sT_PCategory_Id);
      } catch (err) {
        setMenu([]);
        if (err.response && err.response.status === 401) {
          sessionStorage.removeItem("token");
          navigate("/home", { replace: true });
        }
      }
    };

    loadMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, deptCode, search]); // ลบ fetchMenu, navigate ออก

  // =================== Loading animation ===================
  if (currentOrderLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        <motion.div
          className="fixed bg-bg bg-grid-pattern inset-0 flex flex-col items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.img
            src="./logo.png"
            alt="loading icon"
            className="w-28 h-28 object-contain mb-6"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          />
          <div className="text-2xl font-semibold text-main">Loading...</div>
        </motion.div>
      </div>
    );
  }

  // =================== Derived values ===================
  const cartCount =
    currentOrder?.orderDetails?.reduce((sum, p) => sum + p.ord_Qty, 0) || 0;
  const historyCount = history?.orderDetails;
  const showHeader = location.pathname == "/menu";
  const showNavbar = showHeader;


  return (
    <div className="min-h-screen max-w-screen bg-bg">
      {/* <ScrollToTop scrollContainer=".scroll-container" /> */}
      {showHeader && currentOrder && (
        <div className="sticky top-0 left-0 right-0 z-50 bg-white shadow-md px-4">
          <Header
            cartCount={cartCount}
            historyCount={historyCount}
            currentOrder={{
              ...currentOrder,
              orderDetails: [...(currentOrder.orderDetails || [])],
            }}
            search={search}
            setSearch={setSearch}
            setCallStaff={setCallStaff}
          />
          {menu.length > 0 && (
            <CategoryTabs
              categories={menu}
              activeId={activeCategoryId}
              setActiveId={setActiveCategoryId}
            />
          )}
        </div>
      )}
      {callStaff && (
        <FloatingCallButton setCallStaff={setCallStaff} callStaff={callStaff} />
      )}

      <Toaster
        position="top-right"
        reverseOrder={false}
        containerClassName="mt-12"
        toastOptions={{
          style: {
            background: "#fdfbf7",
            color: "#AF8F6F",
            border: "1px solid #6c020220"
          },
          success: {
            iconTheme: {
              primary: "#AF8F6F",
              secondary: "#fdfbf7"
            }
          },
          error: {
            iconTheme: {
              primary: "#AF8F6F",
              secondary: "#fdfbf7"
            }
          }
        }}
      />



      <Routes>
        {/* <Route
          path="/home"
          element={
            token ? (
              <Navigate to="/menu" replace />
            ) : (
              <WelcomeForm onOrderCreated={handleOrderCreated} />
            )
          }
        /> */}

        <Route path="/" element={<LandingPage />} />

        {/* หน้า WelcomeForm สำหรับโต๊ะยังไม่เปิด / ไม่มี order */}
        <Route path="/home" element={<WelcomeForm onOrderCreated={handleOrderCreated} />} />
        <Route path="/table-closed" element={<TableClosedPage />} />

        <Route
          path="/menu"
          element={
            <RequireOrderContext
              currentOrder={currentOrder}
              currentOrderLoading={currentOrderLoading}
            >

              <MenuLayout
                currentOrder={currentOrder}
                setCurrentOrder={setCurrentOrder}
                deptCode={deptCode}
                setDeptCode={setDeptCode}
                search={search}
                setSearch={setSearch}
                activeCategoryId={activeCategoryId}
                setActiveCategoryId={setActiveCategoryId}
                menu={menu}
                isCartOpen={isCartOpen}
                setIsCartOpen={setIsCartOpen}
              />

            </RequireOrderContext>
          }
        >
          {/* Overlay route */}
          <Route
            path="/menu/:productId"
            element={
              <ProductPage
                currentOrder={currentOrder}
                setCurrentOrder={setCurrentOrder}
              />
            }
          />
          <Route
            path="history"
            element={
              <RequireToken>
                <HistoryPage
                  currentOrder={currentOrder}
                  setCurrentOrder={(data) => setCurrentOrder([...data])}
                />
              </RequireToken>
            }
          />
          <Route
            path="cart"
            element={
              <RequireOrderContext
                currentOrder={currentOrder}
                currentOrderLoading={currentOrderLoading}
              >
                <CartPage
                  currentOrder={currentOrder}
                  setCurrentOrder={(data) =>
                    setCurrentOrder((prev) => ({
                      ...prev,
                      ...data,
                      orderDetails: [
                        ...(data.orderDetails || prev.orderDetails || []),
                      ],
                    }))
                  }
                  cart={cart}
                />
              </RequireOrderContext>
            }
          />
        </Route>



        <Route
          path="/qr/:orderId"
          element={
            <RequireToken>
              <QRCodePage
                currentOrder={history}
                setCurrentOrder={(data) => setHistory([...data])}
                setIsCartOpen={setIsCartOpen}
              />
            </RequireToken>
          }
        />
        <Route
          path="/kbankqr/:orderId"
          element={
            <RequireOrderContext
              currentOrder={currentOrder}
              currentOrderLoading={currentOrderLoading}
            >
              <KbankQR
                currentOrder={currentOrder}
                setCurrentOrder={(data) =>
                  setCurrentOrder((prev) => ({
                    ...prev,
                    ...data,
                    orderDetails: [
                      ...(data.orderDetails || prev.orderDetails || []),
                    ],
                  }))
                }
                setIsCartOpen={setIsCartOpen}
              />
            </RequireOrderContext>
          }
        />
        <Route
          path="/kbankqr/:orderId/success"
          element={
            <RequireOrderContext
              currentOrder={currentOrder}
              currentOrderLoading={currentOrderLoading}
            >
              <RequireSuccessLock>
                <KbankSuccess
                  currentOrder={currentOrder}
                  setCurrentOrder={setCurrentOrder}
                  // setCurrentOrder={(data) =>
                  //   setCurrentOrder((prev) => ({
                  //     ...prev,
                  //     ...data,
                  //     orderDetails: [
                  //       ...(data.orderDetails || prev.orderDetails || []),
                  //     ],

                  //   }))
                  // }

                  setIsCartOpen={setIsCartOpen}
                />
              </RequireSuccessLock>
            </RequireOrderContext>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div >
  );
}
