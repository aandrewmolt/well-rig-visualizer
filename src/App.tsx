
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { InventoryProvider } from "./contexts/InventoryContext";
import { InventoryMapperProvider } from "./contexts/InventoryMapperContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CableJobs from "./pages/CableJobs";
import Inventory from "./pages/Inventory";
import InventorySettings from "./pages/InventorySettings";
import EquipmentInventory from "./pages/EquipmentInventory";
import MainDashboard from "./pages/MainDashboard";
import NotFound from "./pages/NotFound";
import { OfflineStatusBar } from "./components/offline/OfflineStatusBar";
import { serviceWorkerManager } from "./lib/offline/serviceWorker";
import { deploymentHelper } from "./lib/offline/deploymentHelper";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  // Register service worker for offline support
  useEffect(() => {
    // Check deployment status
    deploymentHelper.logDeploymentStatus();
    
    // Only register service worker in production-like environments
    if (deploymentHelper.canUseServiceWorkers()) {
      serviceWorkerManager.register().then(success => {
        if (success) {
          console.log('🎉 RigUp is now available offline!');
        }
      });
    } else {
      console.log('ℹ️ Offline features will be available in production deployment');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <InventoryProvider>
          <InventoryMapperProvider>
            <TooltipProvider>
              <Toaster />
              <BrowserRouter>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Navigate to="/dashboard" replace />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <MainDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/jobs"
                    element={
                      <ProtectedRoute>
                        <CableJobs />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory"
                    element={
                      <ProtectedRoute>
                        <Inventory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory/settings"
                    element={
                      <ProtectedRoute>
                        <InventorySettings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory/equipment"
                    element={
                      <ProtectedRoute>
                        <EquipmentInventory />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
                <OfflineStatusBar />
              </BrowserRouter>
            </TooltipProvider>
          </InventoryMapperProvider>
        </InventoryProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
