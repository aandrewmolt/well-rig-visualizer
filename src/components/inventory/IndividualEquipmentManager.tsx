import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Package, Save, Clock } from 'lucide-react';
import { useInventoryData, IndividualEquipment, EquipmentType } from '@/hooks/useInventoryData';
import { useDraftEquipmentManager, DraftEquipment } from '@/hooks/useDraftEquipmentManager';
import SaveControlBar from './SaveControlBar';
import { toast } from '@/hooks/use-toast';

interface IndividualEquipmentManagerProps {
  equipmentType: EquipmentType;
  onDraftCountChange?: (count: number) => void;
}

const IndividualEquipmentManager: React.FC<IndividualEquipmentManagerProps> = ({ 
  equipmentType, 
  onDraftCountChange 
}) => {
  const { data, updateIndividualEquipment } = useInventoryData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkCreateOpen, setIsBulkCreateOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<IndividualEquipment | null>(null);
  const [formData, setFormData] = useState({
    equipmentId: '',
    name: '',
    locationId: '',
    serialNumber: '',
    notes: ''
  });
  const [bulkCreateData, setBulkCreateData] = useState({
    count: 5,
    prefix: equipmentType.defaultIdPrefix || '',
    startNumber: 1,
    locationId: ''
  });

  // Memoize the individual equipment to prevent re-renders
  const individualEquipment = useMemo(() => 
    data.individualEquipment.filter(eq => eq.typeId === equipmentType.id),
    [data.individualEquipment, equipmentType.id]
  );
  
  const {
    draftEquipment,
    hasUnsavedChanges,
    addDraftEquipment,
    addBulkDraftEquipment,
    saveChanges,
    saveImmediately,
    discardChanges,
    unsavedCount,
  } = useDraftEquipmentManager(individualEquipment, updateIndividualEquipment);

  // Update parent component about draft count changes
  useEffect(() => {
    if (onDraftCountChange) {
      onDraftCountChange(draftEquipment.length);
    }
  }, [draftEquipment.length, onDraftCountChange]);

  // Memoize the combined equipment array with stable IDs
  const allEquipment = useMemo(() => {
    console.log('Recalculating allEquipment array for type:', equipmentType.name);
    console.log('Individual equipment count:', individualEquipment.length);
    console.log('Draft equipment count:', draftEquipment.length);
    return [
      ...individualEquipment,
      ...draftEquipment.map((draft, index) => ({
        ...draft,
        id: draft.id || `draft-${equipmentType.id}-${index}`,
        lastUpdated: draft.lastUpdated || new Date('2024-01-01'), // Use stable date for drafts
      } as IndividualEquipment))
    ];
  }, [individualEquipment, draftEquipment, equipmentType.id, equipmentType.name]);

  // Memoize the next equipment ID generation
  const generateNextEquipmentId = useCallback(() => {
    const prefix = equipmentType.defaultIdPrefix || 'EQ-';
    const existingIds = allEquipment.map(eq => eq.equipmentId);
    let counter = 1;
    let newId = `${prefix}${counter.toString().padStart(3, '0')}`;
    
    while (existingIds.includes(newId)) {
      counter++;
      newId = `${prefix}${counter.toString().padStart(3, '0')}`;
    }
    
    return newId;
  }, [allEquipment, equipmentType.defaultIdPrefix]);

  // Initialize form data when dialog opens for new equipment
  const handleAddItemClick = useCallback(() => {
    if (!editingEquipment) {
      setFormData({
        equipmentId: generateNextEquipmentId(),
        name: '',
        locationId: '',
        serialNumber: '',
        notes: ''
      });
    }
    setIsDialogOpen(true);
  }, [editingEquipment, generateNextEquipmentId]);

  const handleSubmit = useCallback((saveImmediate = false) => {
    if (!formData.equipmentId.trim() || !formData.name.trim() || !formData.locationId) {
      toast({
        title: "Validation Error",
        description: "Equipment ID, name, and location are required",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate equipment ID
    const existingEquipment = allEquipment.find(eq => 
      eq.equipmentId === formData.equipmentId && (!editingEquipment || eq.id !== editingEquipment.id)
    );
    
    if (existingEquipment) {
      toast({
        title: "Duplicate ID",
        description: "Equipment ID already exists",
        variant: "destructive",
      });
      return;
    }

    if (editingEquipment) {
      // Update existing equipment immediately (no draft for edits)
      const updatedEquipment = data.individualEquipment.map(equipment =>
        equipment.id === editingEquipment.id
          ? { 
              ...equipment, 
              ...formData,
              lastUpdated: new Date()
            }
          : equipment
      );
      updateIndividualEquipment(updatedEquipment);
      toast({
        title: "Equipment Updated",
        description: "Equipment updated successfully",
      });
    } else {
      // Add new equipment to drafts
      const newEquipment: DraftEquipment = {
        typeId: equipmentType.id,
        status: 'available',
        ...formData
      };
      addDraftEquipment(newEquipment, saveImmediate);
      toast({
        title: "Equipment Added",
        description: saveImmediate ? "Equipment saved successfully" : "Equipment added to drafts (will auto-save in 1 second)",
      });
    }

    resetForm();
  }, [formData, allEquipment, editingEquipment, data.individualEquipment, updateIndividualEquipment, equipmentType.id, addDraftEquipment]);

  const handleBulkCreate = useCallback((saveImmediate = false) => {
    if (!bulkCreateData.locationId || bulkCreateData.count <= 0) {
      toast({
        title: "Validation Error",
        description: "Location and valid count are required",
        variant: "destructive",
      });
      return;
    }

    const newEquipment: DraftEquipment[] = [];
    const existingIds = allEquipment.map(eq => eq.equipmentId);

    for (let i = 0; i < bulkCreateData.count; i++) {
      const number = bulkCreateData.startNumber + i;
      const equipmentId = `${bulkCreateData.prefix}${number.toString().padStart(3, '0')}`;
      
      if (existingIds.includes(equipmentId)) {
        toast({
          title: "Duplicate ID",
          description: `Equipment ID ${equipmentId} already exists`,
          variant: "destructive",
        });
        return;
      }

      newEquipment.push({
        equipmentId,
        name: `${equipmentType.name} ${equipmentId}`,
        typeId: equipmentType.id,
        locationId: bulkCreateData.locationId,
        status: 'available',
      });
    }

    addBulkDraftEquipment(newEquipment, saveImmediate);
    toast({
      title: "Bulk Creation",
      description: saveImmediate 
        ? `${bulkCreateData.count} equipment items saved successfully`
        : `${bulkCreateData.count} equipment items added to drafts (will auto-save in 1 second)`,
    });
    setIsBulkCreateOpen(false);
    setBulkCreateData({
      count: 5,
      prefix: equipmentType.defaultIdPrefix || '',
      startNumber: bulkCreateData.startNumber + bulkCreateData.count,
      locationId: ''
    });
  }, [bulkCreateData, allEquipment, equipmentType, addBulkDraftEquipment]);

  const handleEdit = useCallback((equipment: IndividualEquipment) => {
    setEditingEquipment(equipment);
    setFormData({
      equipmentId: equipment.equipmentId,
      name: equipment.name,
      locationId: equipment.locationId,
      serialNumber: equipment.serialNumber || '',
      notes: equipment.notes || ''
    });
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((equipmentId: string) => {
    const equipment = individualEquipment.find(eq => eq.id === equipmentId);
    if (equipment?.status === 'deployed') {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete deployed equipment",
        variant: "destructive",
      });
      return;
    }

    const updatedEquipment = data.individualEquipment.filter(eq => eq.id !== equipmentId);
    updateIndividualEquipment(updatedEquipment);
    toast({
      title: "Equipment Deleted",
      description: "Equipment deleted successfully",
    });
  }, [individualEquipment, data.individualEquipment, updateIndividualEquipment]);

  const resetForm = useCallback(() => {
    setFormData({
      equipmentId: '',
      name: '',
      locationId: '',
      serialNumber: '',
      notes: ''
    });
    setEditingEquipment(null);
    setIsDialogOpen(false);
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'deployed': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'red-tagged': return 'bg-red-100 text-red-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getLocationName = useCallback((locationId: string) => {
    return data.storageLocations.find(loc => loc.id === locationId)?.name || 'Unknown';
  }, [data.storageLocations]);

  // Add before-unload warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Individual {equipmentType.name} Items
              <Badge variant="outline">{individualEquipment.length} saved</Badge>
              {draftEquipment.length > 0 && (
                <Badge className="bg-orange-100 text-orange-800">
                  {draftEquipment.length} draft
                </Badge>
              )}
              <Badge variant="secondary">
                {allEquipment.length} total
              </Badge>
            </div>
            <div className="flex gap-2">
              {hasUnsavedChanges && (
                <Button onClick={saveImmediately} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Save className="mr-2 h-4 w-4" />
                  Save All Now
                </Button>
              )}
              
              <Dialog open={isBulkCreateOpen} onOpenChange={setIsBulkCreateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    Bulk Create
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Create {equipmentType.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Count</Label>
                        <Input
                          type="number"
                          min="1"
                          value={bulkCreateData.count}
                          onChange={(e) => setBulkCreateData({...bulkCreateData, count: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <Label>Start Number</Label>
                        <Input
                          type="number"
                          min="1"
                          value={bulkCreateData.startNumber}
                          onChange={(e) => setBulkCreateData({...bulkCreateData, startNumber: parseInt(e.target.value) || 1})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>ID Prefix</Label>
                      <Input
                        value={bulkCreateData.prefix}
                        onChange={(e) => setBulkCreateData({...bulkCreateData, prefix: e.target.value})}
                        placeholder="e.g., SS-, SL-, CC-"
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Select value={bulkCreateData.locationId} onValueChange={(value) => setBulkCreateData({...bulkCreateData, locationId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {data.storageLocations.map(location => (
                            <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={() => handleBulkCreate(false)} variant="outline" className="flex-1">
                        <Clock className="mr-2 h-4 w-4" />
                        Add to Drafts
                      </Button>
                      <Button onClick={() => handleBulkCreate(true)} className="flex-1">
                        <Save className="mr-2 h-4 w-4" />
                        Create & Save Now
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={handleAddItemClick}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingEquipment ? 'Edit Equipment' : 'Add Equipment'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Equipment ID</Label>
                      <Input
                        value={formData.equipmentId}
                        onChange={(e) => setFormData({...formData, equipmentId: e.target.value})}
                        placeholder="e.g., SS-001, SL-002"
                      />
                    </div>
                    <div>
                      <Label>Equipment Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g., ShearStream Alpha, Starlink Unit 1"
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Select value={formData.locationId} onValueChange={(value) => setFormData({...formData, locationId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {data.storageLocations.map(location => (
                            <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Serial Number (Optional)</Label>
                      <Input
                        value={formData.serialNumber}
                        onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                        placeholder="Equipment serial number"
                      />
                    </div>
                    <div>
                      <Label>Notes (Optional)</Label>
                      <Input
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Additional notes"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={() => handleSubmit(false)} variant="outline" className="flex-1">
                        <Clock className="mr-2 h-4 w-4" />
                        {editingEquipment ? 'Update' : 'Add to Drafts'}
                      </Button>
                      <Button onClick={() => handleSubmit(true)} className="flex-1">
                        <Save className="mr-2 h-4 w-4" />
                        {editingEquipment ? 'Update' : 'Add & Save Now'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allEquipment.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No individual equipment items created yet</p>
              <p className="text-sm">Use "Add Item" or "Bulk Create" to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allEquipment.map(equipment => {
                const isDraft = draftEquipment.some(draft => draft.equipmentId === equipment.equipmentId);
                return (
                  <div 
                    key={equipment.id} 
                    className={`border rounded-lg p-4 ${isDraft ? 'border-orange-200 bg-orange-50' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-lg flex items-center gap-2">
                          {equipment.equipmentId}
                          {isDraft && <Badge variant="outline" className="bg-orange-100 text-orange-800 text-xs">Draft</Badge>}
                        </h3>
                        <p className="text-sm text-gray-600">{equipment.name}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(equipment)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDelete(equipment.id)}
                          disabled={equipment.status === 'deployed'}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Badge className={getStatusColor(equipment.status)}>
                        {equipment.status}
                      </Badge>
                      
                      <div className="text-sm text-gray-600">
                        <div>Location: {getLocationName(equipment.locationId)}</div>
                        {equipment.serialNumber && (
                          <div>S/N: {equipment.serialNumber}</div>
                        )}
                        {equipment.notes && (
                          <div>Notes: {equipment.notes}</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <SaveControlBar
        hasUnsavedChanges={hasUnsavedChanges}
        unsavedCount={unsavedCount}
        onSave={saveImmediately}
        onDiscard={discardChanges}
      />
    </>
  );
};

export default IndividualEquipmentManager;
