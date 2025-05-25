
import { useState, useCallback } from 'react';
import { useInventoryData, EquipmentItem, IndividualEquipment } from './useInventoryData';
import { useAuditTrail } from './useAuditTrail';
import { toast } from 'sonner';

interface ValidationIssue {
  id: string;
  type: 'quantity_mismatch' | 'missing_equipment' | 'orphaned_deployment' | 'data_inconsistency';
  severity: 'warning' | 'error' | 'info';
  equipmentTypeId: string;
  locationId?: string;
  jobId?: string;
  message: string;
  expectedValue: number;
  actualValue: number;
  suggestedAction: 'update_dialog' | 'update_inventory' | 'manual_review';
}

interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    autoFixableIssues: number;
  };
}

export const useEquipmentValidation = () => {
  const { data, updateEquipmentItems, updateIndividualEquipment } = useInventoryData();
  const { addAuditEntry } = useAuditTrail();
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<ValidationResult | null>(null);

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

    setLastValidation(result);
    return result;
  }, [data]);

  const autoFixIssues = useCallback(async (issues: ValidationIssue[]) => {
    setIsValidating(true);
    let fixedCount = 0;

    try {
      const updatedItems = [...data.equipmentItems];

      for (const issue of issues) {
        if (issue.suggestedAction === 'update_inventory') {
          // Auto-fix inventory issues
          const affectedItems = updatedItems.filter(
            item => item.typeId === issue.equipmentTypeId && 
                   item.locationId === issue.locationId
          );

          if (issue.type === 'data_inconsistency' && issue.actualValue < 0) {
            // Fix negative quantities
            affectedItems.forEach(item => {
              if (item.quantity < 0) {
                item.quantity = 0;
                item.lastUpdated = new Date();
              }
            });
            fixedCount++;
          }
        }
      }

      if (fixedCount > 0) {
        updateEquipmentItems(updatedItems);
        
        addAuditEntry({
          action: 'modify',
          entityType: 'equipment',
          entityId: 'system',
          details: {
            reason: `Auto-fixed ${fixedCount} validation issues`,
            fixedIssues: issues.slice(0, fixedCount).map(i => i.message)
          },
          metadata: { source: 'auto-sync' }
        });

        toast.success(`Auto-fixed ${fixedCount} validation issues`);
      }
    } catch (error) {
      console.error('Error auto-fixing issues:', error);
      toast.error('Failed to auto-fix some validation issues');
    } finally {
      setIsValidating(false);
    }

    return fixedCount;
  }, [data, updateEquipmentItems, addAuditEntry]);

  const runFullValidation = useCallback(async () => {
    setIsValidating(true);
    
    try {
      const result = validateEquipmentConsistency();
      
      if (result.summary.autoFixableIssues > 0) {
        const autoFixableIssues = result.issues.filter(
          issue => issue.suggestedAction !== 'manual_review'
        );
        await autoFixIssues(autoFixableIssues);
      }

      if (result.summary.totalIssues > 0) {
        toast.warning(
          `Found ${result.summary.totalIssues} validation issues. ${result.summary.autoFixableIssues} were auto-fixed.`
        );
      } else {
        toast.success('All equipment data is consistent');
      }

      return result;
    } finally {
      setIsValidating(false);
    }
  }, [validateEquipmentConsistency, autoFixIssues]);

  return {
    validateEquipmentConsistency,
    autoFixIssues,
    runFullValidation,
    isValidating,
    lastValidation,
  };
};
