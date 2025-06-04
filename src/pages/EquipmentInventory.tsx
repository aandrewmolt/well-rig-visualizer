
import React, { useState } from 'react';
import AppHeader from '@/components/AppHeader';
import InventoryDashboard from '@/components/inventory/InventoryDashboard';
import EquipmentTypeManager from '@/components/inventory/EquipmentTypeManager';
import StorageLocationManager from '@/components/inventory/StorageLocationManager';
import EquipmentListView from '@/components/inventory/EquipmentListView';
import EquipmentTransferPanel from '@/components/inventory/EquipmentTransferPanel';
import RedTagPanel from '@/components/inventory/RedTagPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Settings, MapPin, List, ArrowRightLeft, AlertTriangle } from 'lucide-react';

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Equipment Inventory</h1>
            <p className="text-gray-600">
              Manage your equipment inventory across all storage locations. All team members can view and update inventory in real-time.
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="equipment-list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Equipment List
              </TabsTrigger>
              <TabsTrigger value="transfers" className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4" />
                Transfers
              </TabsTrigger>
              <TabsTrigger value="red-tag" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Red Tagged
              </TabsTrigger>
              <TabsTrigger value="equipment-types" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Equipment Types
              </TabsTrigger>
              <TabsTrigger value="storage-locations" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Storage Locations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <InventoryDashboard onSwitchToTab={handleSwitchToTab} />
            </TabsContent>

            <TabsContent value="equipment-list">
              <EquipmentListView />
            </TabsContent>

            <TabsContent value="transfers">
              <EquipmentTransferPanel />
            </TabsContent>

            <TabsContent value="red-tag">
              <RedTagPanel />
            </TabsContent>

            <TabsContent value="equipment-types">
              <EquipmentTypeManager />
            </TabsContent>

            <TabsContent value="storage-locations">
              <StorageLocationManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EquipmentInventory;
