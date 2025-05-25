
import { useState, useEffect } from 'react';
import { TrackedEquipment, EquipmentDeploymentHistory, JobEquipmentAssignment } from '@/types/equipment';
import { useInventoryData, IndividualEquipment } from '@/hooks/useInventoryData';
import { toast } from 'sonner';

export const useTrackedEquipment = () => {
  const { data: inventoryData } = useInventoryData();
  const [trackedEquipment, setTrackedEquipment] = useState<TrackedEquipment[]>([]);
  const [deploymentHistory, setDeploymentHistory] = useState<EquipmentDeploymentHistory[]>([]);

  // Map individual equipment types to tracked equipment types
  const mapToTrackedType = (typeId: string): TrackedEquipment['type'] | null => {
    const equipmentType = inventoryData.equipmentTypes.find(type => type.id === typeId);
    if (!equipmentType) return null;
    
    const typeName = equipmentType.name.toLowerCase();
    if (typeName.includes('shearstream') || typeName.includes('ss')) return 'shearstream-box';
    if (typeName.includes('starlink') || typeName.includes('sl')) return 'starlink';
    if (typeName.includes('computer') || typeName.includes('cc')) return 'company-computer';
    
    return null;
  };

  // Convert individual equipment to tracked equipment format
  const syncFromInventory = () => {
    console.log('Syncing tracked equipment from inventory data');
    
    // Get relevant individual equipment (only tracked types)
    const relevantEquipment = inventoryData.individualEquipment.filter(eq => {
      const mappedType = mapToTrackedType(eq.typeId);
      return mappedType !== null;
    });

    console.log('Found relevant equipment:', relevantEquipment.length);

    // Convert to tracked equipment format
    const syncedEquipment: TrackedEquipment[] = relevantEquipment.map(eq => {
      const mappedType = mapToTrackedType(eq.typeId);
      return {
        id: eq.id,
        equipmentId: eq.equipmentId,
        type: mappedType!,
        name: eq.name,
        serialNumber: eq.serialNumber,
        status: eq.status === 'maintenance' ? 'maintenance' : 
                eq.status === 'red-tagged' ? 'retired' :
                eq.status === 'retired' ? 'retired' :
                eq.status === 'deployed' ? 'deployed' : 'available',
        currentJobId: eq.jobId,
        lastUpdated: eq.lastUpdated,
      };
    });

    // Load existing tracked equipment from localStorage
    const existingData = localStorage.getItem('tracked-equipment');
    let existingEquipment: TrackedEquipment[] = [];
    
    if (existingData) {
      try {
        const parsed = JSON.parse(existingData);
        existingEquipment = parsed.map((item: any) => ({
          ...item,
          lastUpdated: new Date(item.lastUpdated),
          purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : undefined,
        }));
      } catch (error) {
        console.error('Failed to parse existing tracked equipment:', error);
      }
    }

    // Merge synced equipment with existing, prioritizing inventory data
    const mergedEquipment = [...syncedEquipment];
    
    // Add any existing tracked equipment that's not in inventory
    existingEquipment.forEach(existing => {
      const foundInSync = syncedEquipment.find(synced => synced.id === existing.id || synced.equipmentId === existing.equipmentId);
      if (!foundInSync) {
        mergedEquipment.push(existing);
      }
    });

    console.log('Merged equipment count:', mergedEquipment.length);
    setTrackedEquipment(mergedEquipment);
  };

  const createDefaultEquipment = (): TrackedEquipment[] => [
    {
      id: 'ss-001',
      equipmentId: 'SS-001',
      type: 'shearstream-box',
      name: 'ShearStream Box #1',
      status: 'available',
      lastUpdated: new Date(),
    },
    {
      id: 'sl-001',
      equipmentId: 'SL-001',
      type: 'starlink',
      name: 'Starlink #1',
      status: 'available',
      lastUpdated: new Date(),
    },
    {
      id: 'cc-001',
      equipmentId: 'CC-001',
      type: 'company-computer',
      name: 'Company Computer #1',
      status: 'available',
      lastUpdated: new Date(),
    },
    {
      id: 'cc-002',
      equipmentId: 'CC-002',
      type: 'company-computer',
      name: 'Company Computer #2',
      status: 'available',
      lastUpdated: new Date(),
    },
  ];

  const loadData = () => {
    try {
      const historyData = localStorage.getItem('deployment-history');
      
      if (historyData) {
        const parsed = JSON.parse(historyData);
        setDeploymentHistory(parsed.map((item: any) => ({
          ...item,
          deploymentDate: new Date(item.deploymentDate),
          returnDate: item.returnDate ? new Date(item.returnDate) : undefined,
        })));
      }
    } catch (error) {
      console.error('Failed to load deployment history:', error);
    }
  };

  const saveData = () => {
    try {
      localStorage.setItem('tracked-equipment', JSON.stringify(trackedEquipment));
      localStorage.setItem('deployment-history', JSON.stringify(deploymentHistory));
    } catch (error) {
      console.error('Failed to save tracked equipment data:', error);
    }
  };

  const deployEquipment = (
    equipmentId: string, 
    jobId: string, 
    jobName: string, 
    customName: string,
    location?: string
  ) => {
    const equipment = trackedEquipment.find(eq => eq.id === equipmentId);
    if (!equipment) {
      toast.error('Equipment not found');
      return;
    }

    if (equipment.status === 'deployed') {
      toast.error(`${equipment.name} is already deployed`);
      return;
    }

    // Update equipment status
    setTrackedEquipment(prev => prev.map(eq => 
      eq.id === equipmentId 
        ? { ...eq, status: 'deployed', currentJobId: jobId, currentLocation: location, lastUpdated: new Date() }
        : eq
    ));

    // Add deployment history
    const historyEntry: EquipmentDeploymentHistory = {
      id: `deploy-${equipmentId}-${Date.now()}`,
      equipmentId,
      jobId,
      jobName,
      customNameUsed: customName,
      deploymentDate: new Date(),
      location,
    };

    setDeploymentHistory(prev => [...prev, historyEntry]);
    toast.success(`${equipment.name} deployed to ${jobName}`);
  };

  const returnEquipment = (equipmentId: string) => {
    const equipment = trackedEquipment.find(eq => eq.id === equipmentId);
    if (!equipment) return;

    // Update equipment status
    setTrackedEquipment(prev => prev.map(eq => 
      eq.id === equipmentId 
        ? { ...eq, status: 'available', currentJobId: undefined, currentLocation: undefined, lastUpdated: new Date() }
        : eq
    ));

    // Update deployment history
    setDeploymentHistory(prev => prev.map(history => 
      history.equipmentId === equipmentId && !history.returnDate
        ? { ...history, returnDate: new Date() }
        : history
    ));

    toast.success(`${equipment.name} returned to inventory`);
  };

  const updateEquipment = (equipmentId: string, updates: Partial<TrackedEquipment>) => {
    setTrackedEquipment(prev => prev.map(eq => 
      eq.id === equipmentId 
        ? { ...eq, ...updates, lastUpdated: new Date() }
        : eq
    ));
  };

  const getAvailableEquipment = (type?: TrackedEquipment['type']) => {
    return trackedEquipment.filter(eq => 
      eq.status === 'available' && (!type || eq.type === type)
    );
  };

  const getEquipmentHistory = (equipmentId: string) => {
    return deploymentHistory
      .filter(history => history.equipmentId === equipmentId)
      .sort((a, b) => b.deploymentDate.getTime() - a.deploymentDate.getTime());
  };

  // Load data and sync on mount
  useEffect(() => {
    loadData();
  }, []);

  // Sync from inventory whenever inventory data changes
  useEffect(() => {
    if (inventoryData.individualEquipment.length > 0) {
      syncFromInventory();
    } else if (trackedEquipment.length === 0) {
      // Fallback to default equipment if no inventory data
      setTrackedEquipment(createDefaultEquipment());
    }
  }, [inventoryData.individualEquipment]);

  // Save whenever tracked equipment or deployment history changes
  useEffect(() => {
    if (trackedEquipment.length > 0) {
      saveData();
    }
  }, [trackedEquipment, deploymentHistory]);

  return {
    trackedEquipment,
    deploymentHistory,
    deployEquipment,
    returnEquipment,
    updateEquipment,
    getAvailableEquipment,
    getEquipmentHistory,
  };
};
