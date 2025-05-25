
import { DetailedEquipmentUsage } from './useEquipmentUsageAnalyzer';

export const useEquipmentReportGenerator = () => {
  const generateEquipmentReport = (usage: DetailedEquipmentUsage) => {
    const report = {
      summary: {
        totalCables: Object.values(usage.cables).reduce((sum, cable) => sum + cable.quantity, 0),
        cableTypes: Object.keys(usage.cables).length,
        totalEquipment: usage.gauges + usage.adapters + usage.computers + usage.satellite,
        directConnections: usage.directConnections,
        totalConnections: usage.totalConnections,
      },
      cables: usage.cables,
      equipment: {
        gauges: usage.gauges,
        adapters: usage.adapters,
        computers: usage.computers,
        satellite: usage.satellite,
      },
    };

    console.log('Enhanced Equipment Usage Report:', report);
    return report;
  };

  return {
    generateEquipmentReport,
  };
};
