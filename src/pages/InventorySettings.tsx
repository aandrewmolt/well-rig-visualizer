
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppHeader from '@/components/AppHeader';
import LocationManagementPanel from '@/components/inventory/LocationManagementPanel';
import EquipmentTransferManager from '@/components/inventory/EquipmentTransferManager';
import RedTagDashboard from '@/components/inventory/RedTagDashboard';
import DataInitializationGuard from '@/components/inventory/DataInitializationGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Building, ArrowRightLeft, AlertTriangle, Package } from 'lucide-react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';

const InventorySettings = () => {
  const { data } = useSupabaseInventory();

  // Calculate summary stats
  const availableItems = data.equipmentItems.filter(item => item.status === 'available').length;
  const deployedItems = data.equipmentItems.filter(item => item.status === 'deployed').length;
  const redTaggedItems = data.equipmentItems.filter(item => item.status === 'red-tagged').length + 
                        data.individualEquipment.filter(eq => eq.status === 'red-tagged').length;

  return (
    <DataInitializationGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <AppHeader />
        
        <div className="p-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Settings className="h-8 w-8" />
                Inventory Management
              </h1>
              <p className="text-gray-600">
                Manage storage locations, transfer equipment, and track red-tagged items
              </p>
            </div>

            <Tabs defaultValue="locations" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="locations" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Locations
                </TabsTrigger>
                <TabsTrigger value="transfers" className="flex items-center gap-2">
                  <ArrowRightLeft className="h-4 w-4" />
                  Transfers
                </TabsTrigger>
                <TabsTrigger value="redtag" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Red Tagged
                </TabsTrigger>
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Overview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="locations">
                <LocationManagementPanel />
              </TabsContent>

              <TabsContent value="transfers">
                <EquipmentTransferManager />
              </TabsContent>

              <TabsContent value="redtag">
                <RedTagDashboard />
              </TabsContent>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Equipment Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Equipment Types</span>
                          <span className="font-bold">{data.equipmentTypes.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Available Items</span>
                          <span className="font-bold text-green-600">{availableItems}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deployed Items</span>
                          <span className="font-bold text-blue-600">{deployedItems}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Red Tagged Items</span>
                          <span className="font-bold text-red-600">{redTaggedItems}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Location Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Storage Locations</span>
                          <span className="font-bold">{data.storageLocations.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Individual Equipment</span>
                          <span className="font-bold">{data.individualEquipment.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Equipment Items</span>
                          <span className="font-bold">{data.equipmentItems.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        System Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {redTaggedItems > 0 ? (
                          <div className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                            <span className="text-red-700">{redTaggedItems} items need attention (red tagged)</span>
                          </div>
                        ) : (
                          <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                            <span className="text-green-700">All equipment in good condition</span>
                          </div>
                        )}
                        
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                          <span className="text-blue-700">System running normally</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DataInitializationGuard>
  );
};

export default InventorySettings;
