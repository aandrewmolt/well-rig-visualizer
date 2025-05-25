
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

  const saveJobData = (data: Partial<JobData>) => {
    const updated: JobData = {
      ...jobData,
      ...data,
      id: jobId,
      lastUpdated: new Date(),
    } as JobData;
    
    setJobData(updated);
    localStorage.setItem(`job-${jobId}`, JSON.stringify(updated));
  };

  const loadJobData = () => {
    const stored = localStorage.getItem(`job-${jobId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        parsed.lastUpdated = new Date(parsed.lastUpdated);
        setJobData(parsed);
        return parsed;
      } catch (error) {
        console.error('Failed to parse stored job data:', error);
      }
    }
    return null;
  };

  useEffect(() => {
    loadJobData();
  }, [jobId]);

  return { jobData, saveJobData, loadJobData };
};
