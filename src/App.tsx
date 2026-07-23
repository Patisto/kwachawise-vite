import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/Home";
import InsightsPage from "@/pages/Insights";
import TransactionsPage from "@/pages/Transactions";
import TransactionDetailPage from "@/pages/TransactionDetail";
import SortPage from "@/pages/Sort";
import ProfilePage from "@/pages/Profile";
import NotificationsPage from "@/pages/Notifications";
import BudgetPage from "@/pages/Budget";
import ShareTargetPage from "@/pages/ShareTarget";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen w-full">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/transactions/:id" element={<TransactionDetailPage />} />
          <Route path="/sort" element={<SortPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/notifications" element={<NotificationsPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/share-target" element={<ShareTargetPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
