import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import MainPage from "@/pages/MainPage";
import TaskFormPage from "@/pages/TaskFormPage";
import HistoryPage from "@/pages/HistoryPage";
import AppLayout from "@/components/AppLayout";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<AppLayout><MainPage /></AppLayout>} />
        <Route path="/principal" element={<Navigate to="/" replace />} />
        <Route path="/cadastro" element={<AppLayout><TaskFormPage /></AppLayout>} />
        <Route path="/cadastro/:id" element={<AppLayout><TaskFormPage /></AppLayout>} />
        <Route path="/historico" element={<AppLayout><HistoryPage /></AppLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}