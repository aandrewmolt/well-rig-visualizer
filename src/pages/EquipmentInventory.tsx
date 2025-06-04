
import React, { useState } from 'react';
import AppHeader from '@/components/AppHeader';
import EnhancedInventoryDashboard from '@/components/inventory/EnhancedInventoryDashboard';
import EquipmentTypeManager from '@/components/inventory/EquipmentTypeManager';
import StorageLocationManager from '@/components/inventory/StorageLocationManager';
import EquipmentListView from '@/components/inventory/EquipmentListView';
import EquipmentTransferSystem from '@/components/inventory/EquipmentTransferSystem';
import RedTagManager from '@/components/inventory/RedTagManager';
import AdvancedSearchPanel from '@/components/inventory/AdvancedSearchPanel';
import InventoryStatusIndicator from '@/components/inventory/InventoryStatusIndicator';
import EquipmentHistoryViewer from '@/components/inventory/EquipmentHistoryViewer';
import EquipmentReportsExporter from '@/components/inventory/EquipmentReportsExporter';
import MaintenanceSchedulePanel from '@/components/inventory/MaintenanceSchedulePanel';
import DataSetupVerifier from '@/components/inventory/DataSetupVerifier';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Settings, MapPin, List, ArrowRightLeft, AlertTriangle, Search, History, FileText, Wrench, CheckSquare } from 'lucide-react';

const EquipmentInventory = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleSwitchToTab = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <AppHeader />
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Equipment Inventory</h1>
              <InventoryStatusIndicator />
            </div>
            <p className="text-gray-600">
              Manage your equipment inventory across all storage locations. All team members can view and update inventory in real-time.
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 mb-6">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="equipment-list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Equipment List
              </TabsTrigger>
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </TabsTrigger>
              <TabsTrigger value="transfers" className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4" />
                Transfers
              </TabsTrigger>
              <TabsTrigger value="red-tag" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Red Tagged
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Maintenance
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                System
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <EnhancedInventoryDashboard onSwitchToTab={handleSwitchToTab} />
            </TabsContent>

            <TabsContent value="equipment-list">
              <EquipmentListView />
            </TabsContent>

            <TabsContent value="search">
              <AdvancedSearchPanel />
            </TabsContent>

            <TabsContent value="transfers">
              <EquipmentTransferSystem />
            </TabsContent>

            <TabsContent value="red-tag">
              <RedTagManager />
            </TabsContent>

            <TabsContent value="history">
              <EquipmentHistoryViewer />
            </TabsContent>

            <TabsContent value="reports">
              <EquipmentReportsExporter />
            </TabsContent>

            <TabsContent value="maintenance">
              <MaintenanceSchedulePanel />
            </TabsContent>

            <TabsContent value="system">
              <DataSetupVerifier />
            </TabsContent>

            <TabsContent value="settings">
              <Tabs defaultValue="equipment-types" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="equipment-types" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Equipment Types
                  </TabsTrigger>
                  <TabsTrigger value="storage-locations" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Storage Locations
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="equipment-types">
                  <EquipmentTypeManager />
                </TabsContent>
                <TabsContent value="storage-locations">
                  <StorageLocationManager />
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EquipmentInventory;
