
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Monitor, Satellite, Square } from 'lucide-react';
import { useTrackedEquipment } from '@/hooks/useTrackedEquipment';
import { JobEquipmentAssignment } from '@/types/equipment';

interface EquipmentSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (assignment: JobEquipmentAssignment, customNames: {
    shearstreamBox?: string;
    starlink?: string;
    companyComputers: Record<string, string>;
  }) => void;
  jobId: string;
  jobName: string;
  hasWellsideGauge: boolean;
  companyComputerCount: number;
}

const EquipmentSelectionDialog: React.FC<EquipmentSelectionDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  jobId,
  jobName,
  hasWellsideGauge,
  companyComputerCount
}) => {
  const { getAvailableEquipment, getEquipmentHistory } = useTrackedEquipment();
  
  const [selectedShearstreamBox, setSelectedShearstreamBox] = useState<string>('');
  const [selectedStarlink, setSelectedStarlink] = useState<string>('');
  const [selectedCompanyComputers, setSelectedCompanyComputers] = useState<string[]>([]);
  
  const [shearstreamBoxName, setShearstreamBoxName] = useState('ShearStream Box');
  const [starlinkName, setStarlinkName] = useState('Starlink');
  const [companyComputerNames, setCompanyComputerNames] = useState<Record<string, string>>({});

  const availableSSBoxes = getAvailableEquipment('shearstream-box');
  const availableStarlinks = getAvailableEquipment('starlink');
  const availableComputers = getAvailableEquipment('company-computer');

  const handleCompanyComputerSelect = (index: number, equipmentId: string) => {
    const newSelection = [...selectedCompanyComputers];
    newSelection[index] = equipmentId;
    setSelectedCompanyComputers(newSelection);
    
    // Set default name if not already set
    if (!companyComputerNames[equipmentId]) {
      const equipment = availableComputers.find(eq => eq.id === equipmentId);
      if (equipment) {
        setCompanyComputerNames(prev => ({
          ...prev,
          [equipmentId]: equipment.name
        }));
      }
    }
  };

  const handleConfirm = () => {
    const assignment: JobEquipmentAssignment = {
      shearstreamBoxId: selectedShearstreamBox || undefined,
      starlinkId: selectedStarlink || undefined,
      companyComputerIds: selectedCompanyComputers.filter(Boolean),
    };

    const customNames = {
      shearstreamBox: shearstreamBoxName,
      starlink: starlinkName,
      companyComputers: companyComputerNames,
    };

    onConfirm(assignment, customNames);
  };

  const getLastDeployment = (equipmentId: string) => {
    const history = getEquipmentHistory(equipmentId);
    return history.length > 0 ? history[0] : null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Equipment for {jobName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* ShearStream Box Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Square className="h-4 w-4" />
              <Label className="font-semibold">ShearStream Box</Label>
            </div>
            <Select value={selectedShearstreamBox} onValueChange={setSelectedShearstreamBox}>
              <SelectTrigger>
                <SelectValue placeholder="Select ShearStream Box" />
              </SelectTrigger>
              <SelectContent>
                {availableSSBoxes.map(equipment => {
                  const lastDeployment = getLastDeployment(equipment.id);
                  return (
                    <SelectItem key={equipment.id} value={equipment.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{equipment.equipmentId} - {equipment.name}</span>
                        {lastDeployment && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Last: {lastDeployment.jobName}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedShearstreamBox && (
              <div>
                <Label>Custom Name for Job</Label>
                <Input
                  value={shearstreamBoxName}
                  onChange={(e) => setShearstreamBoxName(e.target.value)}
                  placeholder="ShearStream Box"
                />
              </div>
            )}
          </div>

          {/* Starlink Selection */}
          {hasWellsideGauge && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Satellite className="h-4 w-4" />
                <Label className="font-semibold">Starlink</Label>
              </div>
              <Select value={selectedStarlink} onValueChange={setSelectedStarlink}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Starlink" />
                </SelectTrigger>
                <SelectContent>
                  {availableStarlinks.map(equipment => {
                    const lastDeployment = getLastDeployment(equipment.id);
                    return (
                      <SelectItem key={equipment.id} value={equipment.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{equipment.equipmentId} - {equipment.name}</span>
                          {lastDeployment && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Last: {lastDeployment.jobName}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {selectedStarlink && (
                <div>
                  <Label>Custom Name for Job</Label>
                  <Input
                    value={starlinkName}
                    onChange={(e) => setStarlinkName(e.target.value)}
                    placeholder="Starlink"
                  />
                </div>
              )}
            </div>
          )}

          {/* Company Computers Selection */}
          {companyComputerCount > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                <Label className="font-semibold">Company Computers ({companyComputerCount} needed)</Label>
              </div>
              {Array.from({ length: companyComputerCount }, (_, index) => (
                <div key={index} className="space-y-2 p-3 border rounded-lg">
                  <Label>Computer {index + 1}</Label>
                  <Select 
                    value={selectedCompanyComputers[index] || ''} 
                    onValueChange={(value) => handleCompanyComputerSelect(index, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Company Computer" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableComputers
                        .filter(eq => !selectedCompanyComputers.includes(eq.id) || selectedCompanyComputers[index] === eq.id)
                        .map(equipment => {
                          const lastDeployment = getLastDeployment(equipment.id);
                          return (
                            <SelectItem key={equipment.id} value={equipment.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{equipment.equipmentId} - {equipment.name}</span>
                                {lastDeployment && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    Last: {lastDeployment.jobName}
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                  {selectedCompanyComputers[index] && (
                    <div>
                      <Label>Custom Name for Job</Label>
                      <Input
                        value={companyComputerNames[selectedCompanyComputers[index]] || ''}
                        onChange={(e) => setCompanyComputerNames(prev => ({
                          ...prev,
                          [selectedCompanyComputers[index]]: e.target.value
                        }))}
                        placeholder={`Company Computer ${index + 1}`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Selected equipment will be marked as deployed and tracked throughout the job lifecycle.
              Custom names are used only for this job while maintaining equipment identity.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedShearstreamBox}
          >
            Assign Equipment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentSelectionDialog;
