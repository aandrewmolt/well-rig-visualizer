import { useState, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { JobEquipmentAssignment } from '@/types/equipment';

export interface JobData {
  id: string;
  name: string;
  wellCount: number;
  hasWellsideGauge: boolean;
  nodes: Node[];
  edges: Edge[];
  mainBoxName: string;
  satelliteName: string;
  wellsideGaugeName: string;
  customerComputerNames: Record<string, string>;
  selectedCableType?: string;
  equipmentAssignment?: JobEquipmentAssignment;
  lastUpdated: Date;
}

export const useJobPersistence = (jobId: string) => {
  const [jobData, setJobData] = useState<JobData | null>(null);

  const validateJobData = (data: any): boolean => {
    if (!data || typeof data !== 'object') return false;
    
    // Check required fields
    const requiredFields = ['id', 'name', 'nodes', 'edges'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        console.warn(`Missing required field: ${field}`);
        return false;
      }
    }
    
    // Validate arrays
    if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      console.warn('Nodes or edges are not arrays');
      return false;
    }
    
    return true;
  };

  const validateEdgeData = (edge: any): boolean => {
    // Ensure edge has required properties for proper rendering
    return edge && 
           typeof edge.id === 'string' && 
           typeof edge.source === 'string' && 
           typeof edge.target === 'string';
  };

  const sanitizeEdgeData = (edges: any[]): Edge[] => {
    return edges.map((edge) => {
      if (!validateEdgeData(edge)) {
        console.warn('Invalid edge data found, attempting to fix:', edge);
        return {
          ...edge,
          id: edge.id || `edge-${Date.now()}-${Math.random()}`,
          source: edge.source || '',
          target: edge.target || '',
          type: edge.type || 'cable',
        };
      }

      // Ensure proper styling for cable edges
      const sanitizedEdge = {
        ...edge,
        type: edge.type || 'cable',
        data: edge.data || {},
      };

      // Restore cable edge styling based on cable type
      if (sanitizedEdge.type === 'cable' && sanitizedEdge.data.cableType) {
        const getEdgeColor = (cableType: string) => {
          if (cableType.toLowerCase().includes('100ft')) return '#ef4444';
          if (cableType.toLowerCase().includes('200ft')) return '#3b82f6';
          if (cableType.toLowerCase().includes('300ft')) return '#10b981';
          return '#6b7280';
        };

        sanitizedEdge.style = {
          ...sanitizedEdge.style,
          stroke: getEdgeColor(sanitizedEdge.data.cableType),
          strokeWidth: 3,
        };
      }

      return sanitizedEdge;
    }).filter(edge => validateEdgeData(edge));
  };

  const saveJobData = (data: Partial<JobData>) => {
    console.log('Saving job data with keys:', Object.keys(data));
    console.log('Edges being saved:', data.edges?.length || 0, data.edges);
    
    const updated: JobData = {
      ...jobData,
      ...data,
      id: jobId,
      lastUpdated: new Date(),
    } as JobData;
    
    // Ensure all required fields have defaults
    updated.mainBoxName = updated.mainBoxName || 'ShearStream Box';
    updated.satelliteName = updated.satelliteName || 'Starlink';
    updated.wellsideGaugeName = updated.wellsideGaugeName || 'Wellside Gauge';
    updated.customerComputerNames = updated.customerComputerNames || {};
    updated.equipmentAssignment = updated.equipmentAssignment || { 
      shearstreamBoxIds: [],
      customerComputerIds: [] 
    };
    updated.nodes = updated.nodes || [];
    updated.edges = sanitizeEdgeData(updated.edges || []);
    
    setJobData(updated);
    
    try {
      // Create backup in case primary save fails
      const backupKey = `job-backup-${jobId}`;
      const primaryKey = `job-${jobId}`;
      
      const serialized = JSON.stringify(updated);
      
      // Save to primary location
      localStorage.setItem(primaryKey, serialized);
      
      // Save backup copy
      localStorage.setItem(backupKey, serialized);
      
      console.log('Successfully saved job data to localStorage with', updated.edges.length, 'edges');
      console.log('Edge details:', updated.edges.map(e => ({ id: e.id, type: e.type, source: e.source, target: e.target })));
    } catch (error) {
      console.error('Failed to save job data to localStorage:', error);
    }
  };

  const loadJobData = () => {
    const primaryKey = `job-${jobId}`;
    const backupKey = `job-backup-${jobId}`;
    
    let stored = localStorage.getItem(primaryKey);
    let isBackup = false;
    
    // Try backup if primary fails
    if (!stored) {
      stored = localStorage.getItem(backupKey);
      isBackup = true;
      if (stored) {
        console.log('Loading from backup storage');
      }
    }
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        
        if (!validateJobData(parsed)) {
          console.warn('Invalid job data found, clearing...');
          localStorage.removeItem(primaryKey);
          localStorage.removeItem(backupKey);
          return null;
        }
        
        // Convert date string back to Date object
        parsed.lastUpdated = new Date(parsed.lastUpdated);
        
        // Sanitize and restore edges with proper validation
        if (parsed.edges) {
          console.log('Raw edges from storage:', parsed.edges.length, parsed.edges);
          parsed.edges = sanitizeEdgeData(parsed.edges);
          console.log('Sanitized edges:', parsed.edges.length, parsed.edges);
        }
        
        // Ensure equipment assignment exists with new structure
        if (!parsed.equipmentAssignment) {
          parsed.equipmentAssignment = { 
            shearstreamBoxIds: [],
            customerComputerIds: [] 
          };
        } else {
          // Migrate old single shearstreamBoxId to new array format
          if (parsed.equipmentAssignment.shearstreamBoxId) {
            parsed.equipmentAssignment.shearstreamBoxIds = [parsed.equipmentAssignment.shearstreamBoxId];
            delete parsed.equipmentAssignment.shearstreamBoxId;
          }
          // Migrate old companyComputerIds to customerComputerIds
          if (parsed.equipmentAssignment.companyComputerIds) {
            parsed.equipmentAssignment.customerComputerIds = parsed.equipmentAssignment.companyComputerIds;
            delete parsed.equipmentAssignment.companyComputerIds;
          }
          // Ensure arrays exist
          parsed.equipmentAssignment.shearstreamBoxIds = parsed.equipmentAssignment.shearstreamBoxIds || [];
          parsed.equipmentAssignment.customerComputerIds = parsed.equipmentAssignment.customerComputerIds || [];
        }
        
        // Migrate old companyComputerNames to customerComputerNames
        if (parsed.companyComputerNames && !parsed.customerComputerNames) {
          parsed.customerComputerNames = parsed.companyComputerNames;
          delete parsed.companyComputerNames;
        }
        parsed.customerComputerNames = parsed.customerComputerNames || {};
        
        console.log(`Successfully loaded job data from ${isBackup ? 'backup' : 'primary'} storage with ${parsed.edges.length} edges`);
        setJobData(parsed);
        return parsed;
      } catch (error) {
        console.error('Failed to parse stored job data:', error);
        localStorage.removeItem(primaryKey);
        localStorage.removeItem(backupKey);
      }
    }
    return null;
  };

  useEffect(() => {
    loadJobData();
  }, [jobId]);

  return { jobData, saveJobData, loadJobData };
};
