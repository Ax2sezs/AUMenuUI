import { BrowserRouter as Router } from "react-router-dom";
import { MenuDataProvider } from "./context/MenuDataContext";
import AppContent from "./AppContent";
import { ScrollToTop } from "./components/utils/ScrollToTop";
import { BrowserRouter } from 'react-router-dom' // ✅ Import ตรงนี้
function App() {
  return (
    <BrowserRouter>
      <MenuDataProvider>
        <ScrollToTop />

        <AppContent />
      </MenuDataProvider>
    </BrowserRouter>
  );
}

export default App;
