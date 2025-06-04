
export interface EdgeData {
  connectionType?: 'cable' | 'direct';
  cableTypeId?: string;
  label?: string;
}

export interface DetailedEquipmentUsage {
  cables: {
    [typeId: string]: {
      typeName: string;
      quantity: number;
      category: string;
      length: string;
      version?: string;
    };
  };
  gauges: number;
  adapters: number;
  computers: number;
  satellite: number;
  directConnections: number;
  totalConnections: number;
}

export interface FallbackEquipmentType {
  id: string;
  name: string;
  category: 'cables' | 'gauges' | 'adapters' | 'communication' | 'power' | 'other';
  length: string;
  version?: string;
}
