
export interface CableUsageDetails {
  quantity: number;
  typeName: string;
  category: string;
  length: string;
  version?: string;
}

export interface DetailedEquipmentUsage {
  cables: { [typeId: string]: CableUsageDetails };
  gauges: number;
  adapters: number;
  computers: number;
  satellite: number;
  directConnections: number;
  totalConnections: number;
}
