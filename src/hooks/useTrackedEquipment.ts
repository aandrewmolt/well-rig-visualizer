
import { useState, useEffect } from 'react';
import { TrackedEquipment, EquipmentDeploymentHistory, JobEquipmentAssignment } from '@/types/equipment';
import { toast } from 'sonner';

export const useTrackedEquipment = () => {
  const [trackedEquipment, setTrackedEquipment] = useState<TrackedEquipment[]>([]);
  const [deploymentHistory, setDeploymentHistory] = useState<EquipmentDeploymentHistory[]>([]);

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
      const equipmentData = localStorage.getItem('tracked-equipment');
      const historyData = localStorage.getItem('deployment-history');
      
      if (equipmentData) {
        const parsed = JSON.parse(equipmentData);
        setTrackedEquipment(parsed.map((item: any) => ({
          ...item,
          lastUpdated: new Date(item.lastUpdated),
          purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : undefined,
        })));
      } else {
        setTrackedEquipment(createDefaultEquipment());
      }

      if (historyData) {
        const parsed = JSON.parse(historyData);
        setDeploymentHistory(parsed.map((item: any) => ({
          ...item,
          deploymentDate: new Date(item.deploymentDate),
          returnDate: item.returnDate ? new Date(item.returnDate) : undefined,
        })));
      }
    } catch (error) {
      console.error('Failed to load tracked equipment data:', error);
      setTrackedEquipment(createDefaultEquipment());
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

  useEffect(() => {
    loadData();
  }, []);

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
