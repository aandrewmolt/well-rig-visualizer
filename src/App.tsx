
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import MainDashboard from "./pages/MainDashboard";
import CableJobs from "./pages/CableJobs";
import Inventory from "./pages/Inventory";
import InventorySettings from "./pages/InventorySettings";
import EquipmentInventory from "./pages/EquipmentInventory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <MainDashboard />
                </ProtectedRoute>
              } />
              <Route path="/cable-jobs" element={
                <ProtectedRoute>
                  <CableJobs />
                </ProtectedRoute>
              } />
              <Route path="/equipment-inventory" element={
                <ProtectedRoute>
                  <EquipmentInventory />
                </ProtectedRoute>
              } />
              <Route path="/inventory" element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              } />
              <Route path="/inventory/settings" element={
                <ProtectedRoute>
                  <InventorySettings />
                </ProtectedRoute>
              } />
              <Route path="/legacy-jobs" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
