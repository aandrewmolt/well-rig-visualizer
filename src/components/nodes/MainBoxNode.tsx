
import React, { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Square } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseJobs } from '@/hooks/useSupabaseJobs';

const MainBoxNode = ({ id, data }: { id: string; data: any }) => {
  const { getNodes } = useReactFlow();
  const { saveJob } = useSupabaseJobs();
  const [fracDataPort, setFracDataPort] = useState<string>(data.fracComPort || '');
  const [gaugeDataPort, setGaugeDataPort] = useState<string>(data.gaugeComPort || '');
  const [fracBaudRate, setFracBaudRate] = useState<string>(data.fracBaudRate || '19200');
  const [gaugeBaudRate, setGaugeBaudRate] = useState<string>(data.gaugeBaudRate || '9600');

  // Save settings whenever they change
  useEffect(() => {
    if (data.jobId) {
      const jobData = {
        id: data.jobId,
        fracComPort: fracDataPort,
        gaugeComPort: gaugeDataPort,
        fracBaudRate,
        gaugeBaudRate,
      };
      saveJob(jobData);
    }
  }, [fracDataPort, gaugeDataPort, fracBaudRate, gaugeBaudRate, data.jobId, saveJob]);

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

  // Common baud rates with 9600 and 19200 first
  const baudRates = [
    { id: '9600', label: '9600' },
    { id: '19200', label: '19200' },
    { id: '38400', label: '38400' },
    { id: '57600', label: '57600' },
    { id: '115200', label: '115200' },
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
    <div className="bg-slate-900 text-white rounded-lg p-4 border-2 border-slate-600 min-w-[280px] shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Square className="h-5 w-5 text-blue-400" />
        <div>
          <h3 className="font-bold text-lg text-white">ShearStream Box</h3>
          {isAssigned && data.equipmentId && (
            <p className="text-sm text-green-400 font-medium">{data.equipmentId}</p>
          )}
        </div>
      </div>
      
      {/* COM Port Selection with Baud Rates - Improved layout and contrast */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-200 w-12">Frac:</span>
          <Select value={fracDataPort} onValueChange={setFracDataPort}>
            <SelectTrigger className="h-8 text-sm bg-slate-700 border-slate-500 text-white hover:bg-slate-600 flex-1">
              <SelectValue placeholder="COM" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {comPorts.map(port => (
                <SelectItem key={port.id} value={port.id} className="text-white hover:bg-slate-700">
                  {port.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={fracBaudRate} onValueChange={setFracBaudRate}>
            <SelectTrigger className="h-8 text-sm bg-slate-700 border-slate-500 text-white hover:bg-slate-600 w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {baudRates.map(rate => (
                <SelectItem key={rate.id} value={rate.id} className="text-white hover:bg-slate-700">
                  {rate.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-200 w-12">Gauge:</span>
          <Select value={gaugeDataPort} onValueChange={setGaugeDataPort}>
            <SelectTrigger className="h-8 text-sm bg-slate-700 border-slate-500 text-white hover:bg-slate-600 flex-1">
              <SelectValue placeholder="COM" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {comPorts.map(port => (
                <SelectItem key={port.id} value={port.id} className="text-white hover:bg-slate-700">
                  {port.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={gaugeBaudRate} onValueChange={setGaugeBaudRate}>
            <SelectTrigger className="h-8 text-sm bg-slate-700 border-slate-500 text-white hover:bg-slate-600 w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {baudRates.map(rate => (
                <SelectItem key={rate.id} value={rate.id} className="text-white hover:bg-slate-700">
                  {rate.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        {pressurePorts.map((port, index) => (
          <div key={port.id} className="flex items-center justify-between bg-slate-700 rounded-md p-3 relative border border-slate-600">
            <div>
              <span className="font-semibold text-white text-base">{port.label}</span>
              <span className="text-sm text-slate-300 ml-2">({port.pressure})</span>
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
