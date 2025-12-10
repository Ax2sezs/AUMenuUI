import { Navigate, useParams } from "react-router-dom";

// ✅ กันไม่ให้เข้าถ้ามี finishedOrderId
export const RequireNotCheckedOut = ({ children }) => {
  const finishedOrderId = sessionStorage.getItem("finishedOrderId");
  if (finishedOrderId) return <Navigate to={`/qr/${finishedOrderId}`} replace />;
  return children;
};

// ✅ เช็กว่ามี branchCode และ currentOrder หรือยัง
export const RequireOrderContext = ({ children, currentOrder }) => {
  const branchCode = localStorage.getItem("branchCode");
  if (!branchCode || !currentOrder) return <Navigate to="/home" replace />;
  return <RequireNotCheckedOut>{children}</RequireNotCheckedOut>;
};

// ✅ QR Code wrapper
export const RequireBranchOnly = ({ children }) => {
  const branchCode = localStorage.getItem("branchCode");
  if (!branchCode) return <Navigate to="/home" replace />;
  return children;
};
const RequireAuth = ({ children }) => {
  const token = sessionStorage.getItem("token");
  if (!token) return <Navigate to="/home" replace />;
  return children;
};

