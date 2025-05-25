
export interface BulkOperation {
  id: string;
  type: 'transfer' | 'deploy' | 'return' | 'update_status' | 'delete';
  equipmentIds: string[];
  params: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface BulkTransferParams {
  fromLocationId: string;
  toLocationId: string;
  quantity: number;
}

export interface BulkStatusUpdateParams {
  newStatus: 'available' | 'deployed' | 'red-tagged';
  reason?: string;
}
