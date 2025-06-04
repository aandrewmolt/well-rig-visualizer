
import { Edge } from '@xyflow/react';
import { toast } from 'sonner';

export interface EdgeError {
  edgeId: string;
  type: 'connection' | 'validation' | 'toggle' | 'delete';
  message: string;
  severity: 'warning' | 'error';
}

export class EdgeErrorHandler {
  private static errors: Map<string, EdgeError> = new Map();

  static handleEdgeError(error: EdgeError): void {
    this.errors.set(error.edgeId, error);
    
    if (error.severity === 'error') {
      toast.error(`Edge Error: ${error.message}`);
    } else {
      toast.warning(`Edge Warning: ${error.message}`);
    }
    
    console.error('Edge error:', error);
  }

  static clearEdgeError(edgeId: string): void {
    this.errors.delete(edgeId);
  }

  static getEdgeError(edgeId: string): EdgeError | undefined {
    return this.errors.get(edgeId);
  }

  static hasError(edgeId: string): boolean {
    return this.errors.has(edgeId);
  }

  static validateEdgeOperation(edge: Edge, operation: string): boolean {
    try {
      // Basic validation
      if (!edge.id || !edge.source || !edge.target) {
        this.handleEdgeError({
          edgeId: edge.id || 'unknown',
          type: 'validation',
          message: `Invalid edge data for ${operation}`,
          severity: 'error'
        });
        return false;
      }

      return true;
    } catch (error) {
      this.handleEdgeError({
        edgeId: edge.id || 'unknown',
        type: 'validation',
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
      return false;
    }
  }

  static handleConnectionError(sourceId: string, targetId: string, reason: string): void {
    this.handleEdgeError({
      edgeId: `${sourceId}-${targetId}`,
      type: 'connection',
      message: `Connection failed: ${reason}`,
      severity: 'warning'
    });
  }
}

export const { handleEdgeError, clearEdgeError, getEdgeError, hasError, validateEdgeOperation, handleConnectionError } = EdgeErrorHandler;
