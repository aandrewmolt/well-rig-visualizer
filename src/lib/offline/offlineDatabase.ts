import Dexie, { Table } from 'dexie';

export interface LocalJob {
  id?: number;
  cloudId?: string;
  name: string;
  wellCount: number;
  nodes: any;
  edges: any;
  equipmentAllocations: any;
  hasWellsideGauge?: boolean;
  companyComputerNames?: Record<string, string>;
  equipmentAssignment?: any;
  equipmentAllocated?: boolean;
  mainBoxName?: string;
  satelliteName?: string;
  wellsideGaugeName?: string;
  selectedCableType?: string;
  fracBaudRate?: string;
  gaugeBaudRate?: string;
  fracComPort?: string;
  gaugeComPort?: string;
  enhancedConfig?: any;
  createdAt?: string | Date;
  updatedAt: number;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface LocalEquipment {
  id?: number;
  cloudId?: string;
  name: string;
  type: string;
  status: string;
  locationId: string;
  quantity?: number;
  serialNumber?: string;
  updatedAt: number;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface SyncOperation {
  id?: number;
  operation: 'create' | 'update' | 'delete';
  tableName: string;
  recordId: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

export class RigUpOfflineDatabase extends Dexie {
  jobs!: Table<LocalJob>;
  equipment!: Table<LocalEquipment>;
  equipment_types!: Table<any>;
  storage_locations!: Table<any>;
  syncQueue!: Table<SyncOperation>;
  
  constructor() {
    super('RigUpOffline');
    
    this.version(1).stores({
      jobs: '++id, cloudId, name, updatedAt, syncStatus',
      equipment: '++id, cloudId, name, type, status, locationId, serialNumber, syncStatus',
      equipment_types: '++id, cloudId, name, category',
      storage_locations: '++id, cloudId, name',
      syncQueue: '++id, operation, tableName, timestamp'
    });
    
    this.version(2).stores({
      jobs: '++id, cloudId, name, updatedAt, syncStatus, createdAt',
      equipment: '++id, cloudId, name, type, status, locationId, serialNumber, syncStatus',
      equipment_types: '++id, cloudId, name, category',
      storage_locations: '++id, cloudId, name',
      syncQueue: '++id, operation, tableName, timestamp'
    });
  }
  
  async getUnsyncedRecords() {
    const unsyncedJobs = await this.jobs.where('syncStatus').equals('pending').toArray();
    const unsyncedEquipment = await this.equipment.where('syncStatus').equals('pending').toArray();
    return { jobs: unsyncedJobs, equipment: unsyncedEquipment };
  }
  
  async markAsSynced(tableName: string, localId: number, cloudId: string) {
    const table = this[tableName as keyof RigUpOfflineDatabase] as Table<any>;
    await table.update(localId, { 
      cloudId, 
      syncStatus: 'synced',
      updatedAt: Date.now()
    });
  }
  
  async addToSyncQueue(operation: SyncOperation['operation'], tableName: string, recordId: string, data: any) {
    await this.syncQueue.add({
      operation,
      tableName,
      recordId,
      data,
      timestamp: Date.now(),
      retryCount: 0
    });
  }
}

export const offlineDb = new RigUpOfflineDatabase();