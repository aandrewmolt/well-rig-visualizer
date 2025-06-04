
import React from 'react';
import EquipmentTransferManager from './EquipmentTransferManager';
import StorageTransferManager from './StorageTransferManager';
import BulkLocationTransfer from './BulkLocationTransfer';

const EquipmentTransferSystem = () => {
  return (
    <div className="space-y-6">
      <BulkLocationTransfer />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EquipmentTransferManager />
        <StorageTransferManager />
      </div>
    </div>
  );
};

export default EquipmentTransferSystem;
