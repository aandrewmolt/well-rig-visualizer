
import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Square } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MainBoxNode = ({ data }: { data: any }) => {
  const [fracDataPort, setFracDataPort] = useState<string>('');
  const [gaugeDataPort, setGaugeDataPort] = useState<string>('');

  // Available COM ports for selection
  const comPorts = [
    { id: 'com1', label: 'COM1' },
    { id: 'com2', label: 'COM2' },
    { id: 'com3', label: 'COM3' },
    { id: 'com4', label: 'COM4' },
    { id: 'com5', label: 'COM5' },
    { id: 'com6', label: 'COM6' },
    { id: 'com7', label: 'COM7' },
    { id: 'com8', label: 'COM8' },
  ];

  // These pressure ports all come from the selected gauge COM port
  const pressurePorts = [
    { id: 'p1', label: 'P1', pressure: 'Pressure1,2' },
    { id: 'p2', label: 'P2', pressure: 'Pressure3,4' },
    { id: 'p3', label: 'P3', pressure: 'Pressure5,6' },
    { id: 'p4', label: 'P4', pressure: 'Pressure7,8' },
  ];

  const isAssigned = data.assigned && data.equipmentId;

  return (
    <div className="bg-gray-800 text-white rounded-lg p-4 border-2 border-gray-600 min-w-[200px]">
      <div className="flex items-center gap-2 mb-3">
        <Square className="h-5 w-5" />
        <div>
          <h3 className="font-bold text-lg">ShearStream Box</h3>
          {isAssigned && data.equipmentId && (
            <p className="text-xs text-green-300">{data.equipmentId}</p>
          )}
        </div>
      </div>
      
      {/* COM Port Selection - Compact layout */}
      <div className="mb-3 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-300 w-12">Frac:</span>
          <Select value={fracDataPort} onValueChange={setFracDataPort}>
            <SelectTrigger className="h-6 text-xs bg-gray-700 border-gray-600">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {comPorts.map(port => (
                <SelectItem key={port.id} value={port.id}>
                  {port.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-300 w-12">Gauge:</span>
          <Select value={gaugeDataPort} onValueChange={setGaugeDataPort}>
            <SelectTrigger className="h-6 text-xs bg-gray-700 border-gray-600">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {comPorts.map(port => (
                <SelectItem key={port.id} value={port.id}>
                  {port.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        {pressurePorts.map((port, index) => (
          <div key={port.id} className="flex items-center justify-between bg-gray-700 rounded p-2 relative">
            <div>
              <span className="font-semibold">{port.label}</span>
              <span className="text-xs text-gray-300 ml-2">({port.pressure})</span>
            </div>
            <Handle
              type="source"
              position={Position.Right}
              id={port.id}
              style={{
                right: -8,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: '#3b82f6',
                border: '2px solid white',
                width: 12,
                height: 12,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainBoxNode;
