
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Package, MapPin, AlertTriangle, RefreshCw, ArrowRightLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import InventoryDashboard from '@/components/inventory/InventoryDashboard';
import EquipmentTypeManager from '@/components/inventory/EquipmentTypeManager';
import StorageLocationManager from '@/components/inventory/StorageLocationManager';
import StorageTransferManager from '@/components/inventory/StorageTransferManager';
import { useInventoryData } from '@/hooks/useInventoryData';

type TabType = 'dashboard' | 'equipment' | 'locations' | 'transfers';

const EquipmentInventory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const { isLoading, syncStatus, syncData } = useInventoryData();

  const handleSync = async () => {
    try {
      await syncData();
      toast.success('Data synced successfully!');
    } catch (error) {
      toast.error('Failed to sync data');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <InventoryDashboard />;
      case 'equipment':
        return <EquipmentTypeManager />;
      case 'locations':
        return <StorageLocationManager />;
      case 'transfers':
        return <StorageTransferManager />;
      default:
        return <InventoryDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="mr-4 bg-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600">
              Status: {syncStatus}
            </div>
            <Button 
              onClick={handleSync}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="bg-white"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Sync
            </Button>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Equipment Inventory</h1>
          <p className="text-xl text-gray-600 mb-6">
            Track equipment across storage locations and job sites
          </p>
        </div>

        {/* Enhanced tab navigation */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
          <Button
            onClick={() => setActiveTab('dashboard')}
            variant={activeTab === 'dashboard' ? 'default' : 'outline'}
            className="flex items-center justify-center p-4 h-auto"
          >
            <Package className="mr-2 h-5 w-5" />
            <span className="text-sm font-medium">Dashboard</span>
          </Button>
          
          <Button
            onClick={() => setActiveTab('equipment')}
            variant={activeTab === 'equipment' ? 'default' : 'outline'}
            className="flex items-center justify-center p-4 h-auto"
          >
            <AlertTriangle className="mr-2 h-5 w-5" />
            <span className="text-sm font-medium">Equipment</span>
          </Button>
          
          <Button
            onClick={() => setActiveTab('locations')}
            variant={activeTab === 'locations' ? 'default' : 'outline'}
            className="flex items-center justify-center p-4 h-auto"
          >
            <MapPin className="mr-2 h-5 w-5" />
            <span className="text-sm font-medium">Locations</span>
          </Button>
          
          <Button
            onClick={() => setActiveTab('transfers')}
            variant={activeTab === 'transfers' ? 'default' : 'outline'}
            className="flex items-center justify-center p-4 h-auto"
          >
            <ArrowRightLeft className="mr-2 h-5 w-5" />
            <span className="text-sm font-medium">Transfers</span>
          </Button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default EquipmentInventory;
