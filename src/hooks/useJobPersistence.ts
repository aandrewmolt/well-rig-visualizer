
import { useState, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';

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
  companyComputerNames: Record<string, string>;
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

  const saveJobData = (data: Partial<JobData>) => {
    console.log('Saving job data with keys:', Object.keys(data));
    
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
    updated.companyComputerNames = updated.companyComputerNames || {};
    updated.nodes = updated.nodes || [];
    updated.edges = updated.edges || [];
    
    setJobData(updated);
    
    try {
      const serialized = JSON.stringify(updated);
      localStorage.setItem(`job-${jobId}`, serialized);
      console.log('Successfully saved job data to localStorage');
    } catch (error) {
      console.error('Failed to save job data to localStorage:', error);
    }
  };

  const loadJobData = () => {
    const stored = localStorage.getItem(`job-${jobId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        
        if (!validateJobData(parsed)) {
          console.warn('Invalid job data found, clearing...');
          localStorage.removeItem(`job-${jobId}`);
          return null;
        }
        
        // Convert date string back to Date object
        parsed.lastUpdated = new Date(parsed.lastUpdated);
        
        // Ensure edge styling is preserved
        if (parsed.edges) {
          parsed.edges = parsed.edges.map((edge: any) => ({
            ...edge,
            type: edge.type || 'cable',
            style: edge.style || {
              stroke: edge.data?.cableType === '100ft' ? '#ef4444' : 
                     edge.data?.cableType === '200ft' ? '#3b82f6' : 
                     edge.data?.cableType === '300ft' ? '#10b981' : '#6b7280',
              strokeWidth: 3,
            },
            data: edge.data || { cableType: '200ft', label: '200ft' }
          }));
        }
        
        console.log('Successfully loaded job data from localStorage');
        setJobData(parsed);
        return parsed;
      } catch (error) {
        console.error('Failed to parse stored job data:', error);
        localStorage.removeItem(`job-${jobId}`);
      }
    }
    return null;
  };

  useEffect(() => {
    loadJobData();
  }, [jobId]);

  return { jobData, saveJobData, loadJobData };
};
