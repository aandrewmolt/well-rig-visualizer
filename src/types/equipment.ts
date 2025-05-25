
export interface TrackedEquipment {
  id: string;
  equipmentId: string; // User-editable ID like "SS-001", "SL-002"
  type: 'shearstream-box' | 'starlink' | 'company-computer';
  name: string; // User-friendly name
  serialNumber?: string;
  purchaseDate?: Date;
  notes?: string;
  status: 'available' | 'deployed' | 'maintenance' | 'retired';
  currentJobId?: string;
  currentLocation?: string;
  lastUpdated: Date;
}

export interface EquipmentDeploymentHistory {
  id: string;
  equipmentId: string;
  jobId: string;
  jobName: string;
  customNameUsed: string;
  deploymentDate: Date;
  returnDate?: Date;
  location?: string;
  notes?: string;
}

export interface JobEquipmentAssignment {
  shearstreamBoxId?: string;
  starlinkId?: string;
  companyComputerIds: string[];
}
