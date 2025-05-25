
import { useCallback } from 'react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { ValidationIssue, ValidationResult } from '@/types/validation';

export const useEquipmentValidator = () => {
  const { data } = useInventoryData();

  const validateEquipmentConsistency = useCallback((): ValidationResult => {
    const issues: ValidationIssue[] = [];

    // Check for orphaned deployments (deployed items without valid job references)
    data.equipmentItems.forEach(item => {
      if (item.status === 'deployed' && item.jobId) {
        // In a real implementation, we'd check against actual job data
        // For now, we'll validate basic data integrity
        const equipmentType = data.equipmentTypes.find(type => type.id === item.typeId);
        const location = data.storageLocations.find(loc => loc.id === item.locationId);
        
        if (!equipmentType || !location) {
          issues.push({
            id: `orphaned-${item.id}`,
            type: 'orphaned_deployment',
            severity: 'error',
            equipmentTypeId: item.typeId,
            locationId: item.locationId,
            jobId: item.jobId,
            message: `Deployed ${equipmentType?.name || 'Unknown'} has invalid references`,
            expectedValue: 0,
            actualValue: item.quantity,
            suggestedAction: 'manual_review'
          });
        }
      }
    });

    // Check for quantity mismatches between locations
    data.storageLocations.forEach(location => {
      data.equipmentTypes.forEach(type => {
        const availableItems = data.equipmentItems.filter(
          item => item.typeId === type.id && item.locationId === location.id && item.status === 'available'
        );
        const deployedItems = data.equipmentItems.filter(
          item => item.typeId === type.id && item.locationId === location.id && item.status === 'deployed'
        );

        const totalAvailable = availableItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalDeployed = deployedItems.reduce((sum, item) => sum + item.quantity, 0);

        // Check for negative quantities
        if (totalAvailable < 0) {
          issues.push({
            id: `negative-${type.id}-${location.id}`,
            type: 'data_inconsistency',
            severity: 'error',
            equipmentTypeId: type.id,
            locationId: location.id,
            message: `Negative quantity detected for ${type.name} at ${location.name}`,
            expectedValue: 0,
            actualValue: totalAvailable,
            suggestedAction: 'update_inventory'
          });
        }

        // Check for individual equipment tracking consistency
        if (type.requiresIndividualTracking) {
          const individualCount = data.individualEquipment.filter(
            eq => eq.typeId === type.id && eq.locationId === location.id
          ).length;
          
          if (individualCount !== totalAvailable + totalDeployed) {
            issues.push({
              id: `individual-mismatch-${type.id}-${location.id}`,
              type: 'quantity_mismatch',
              severity: 'warning',
              equipmentTypeId: type.id,
              locationId: location.id,
              message: `Individual tracking count doesn't match bulk quantity for ${type.name}`,
              expectedValue: individualCount,
              actualValue: totalAvailable + totalDeployed,
              suggestedAction: 'manual_review'
            });
          }
        }
      });
    });

    const result: ValidationResult = {
      isValid: issues.length === 0,
      issues,
      summary: {
        totalIssues: issues.length,
        criticalIssues: issues.filter(issue => issue.severity === 'error').length,
        autoFixableIssues: issues.filter(issue => issue.suggestedAction !== 'manual_review').length,
      }
    };

    return result;
  }, [data]);

  return {
    validateEquipmentConsistency,
  };
};
