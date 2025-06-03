
import React from 'react';
import AppHeader from '@/components/AppHeader';
import InventoryDashboard from '@/components/inventory/InventoryDashboard';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';

const EquipmentInventory = () => {
  // Use the new Supabase-based inventory hook
  const inventoryData = useSupabaseInventory();

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
          
          <InventoryDashboard {...inventoryData} />
        </div>
      </div>
    </div>
  );
};

export default EquipmentInventory;
