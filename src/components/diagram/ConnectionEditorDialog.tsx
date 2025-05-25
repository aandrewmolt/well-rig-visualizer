
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Node } from '@xyflow/react';

interface ConnectionEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateConnection: (newSourceId: string, newTargetId: string, newSourceHandle?: string, newTargetHandle?: string) => void;
  currentEdge: {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    data?: any;
  };
  nodes: Node[];
}

const ConnectionEditorDialog: React.FC<ConnectionEditorDialogProps> = ({
  isOpen,
  onClose,
  onUpdateConnection,
  currentEdge,
  nodes
}) => {
  const [newSourceId, setNewSourceId] = useState(currentEdge.source);
  const [newTargetId, setNewTargetId] = useState(currentEdge.target);
  const [newSourceHandle, setNewSourceHandle] = useState(currentEdge.sourceHandle || '');
  const [newTargetHandle, setNewTargetHandle] = useState(currentEdge.targetHandle || '');

  const sourceNode = nodes.find(n => n.id === newSourceId);
  const targetNode = nodes.find(n => n.id === newTargetId);

  const getAvailableSourceHandles = (node: Node) => {
    if (node?.type === 'mainBox') {
      return [
        { id: 'p1', label: 'P1 (COM1,2)' },
        { id: 'p2', label: 'P2 (COM3,4)' },
        { id: 'p3', label: 'P3 (COM5,6)' },
        { id: 'p4', label: 'P4 (COM7,8)' },
      ];
    }
    if (node?.type === 'yAdapter') {
      return [
        { id: 'output1', label: 'Output 1' },
        { id: 'output2', label: 'Output 2' },
      ];
    }
    return [];
  };

  const getAvailableTargetHandles = (node: Node) => {
    // Most target nodes only have one handle, but Y adapters have multiple outputs
    if (node?.type === 'yAdapter') {
      return [{ id: '', label: 'Input' }];
    }
    return [{ id: '', label: 'Input' }];
  };

  const getNodeLabel = (node: Node) => {
    return node?.data?.label || node?.id || 'Unknown';
  };

  const handleSave = () => {
    onUpdateConnection(newSourceId, newTargetId, newSourceHandle, newTargetHandle);
    onClose();
  };

  const sourceHandles = getAvailableSourceHandles(sourceNode!);
  const targetHandles = getAvailableTargetHandles(targetNode!);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Cable Connection</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Source Node</Label>
              <Select value={newSourceId} onValueChange={setNewSourceId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {nodes
                    .filter(n => n.type === 'mainBox' || n.type === 'yAdapter')
                    .map(node => (
                      <SelectItem key={node.id} value={node.id}>
                        {getNodeLabel(node)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Target Node</Label>
              <Select value={newTargetId} onValueChange={setNewTargetId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {nodes
                    .filter(n => ['well', 'yAdapter', 'companyComputer', 'satellite', 'wellsideGauge'].includes(n.type!))
                    .map(node => (
                      <SelectItem key={node.id} value={node.id}>
                        {getNodeLabel(node)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {sourceHandles.length > 0 && (
            <div>
              <Label>Source Port</Label>
              <Select value={newSourceHandle} onValueChange={setNewSourceHandle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select port" />
                </SelectTrigger>
                <SelectContent>
                  {sourceHandles.map(handle => (
                    <SelectItem key={handle.id} value={handle.id}>
                      {handle.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {targetHandles.length > 1 && (
            <div>
              <Label>Target Port</Label>
              <Select value={newTargetHandle} onValueChange={setNewTargetHandle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select port" />
                </SelectTrigger>
                <SelectContent>
                  {targetHandles.map(handle => (
                    <SelectItem key={handle.id} value={handle.id}>
                      {handle.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="text-sm text-gray-600">
            <p>Current: {getNodeLabel(nodes.find(n => n.id === currentEdge.source)!)} → {getNodeLabel(nodes.find(n => n.id === currentEdge.target)!)}</p>
            <p>Cable Type: {currentEdge.data?.cableType || 'Unknown'}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Update Connection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectionEditorDialog;
