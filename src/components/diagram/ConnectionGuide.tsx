
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cable } from 'lucide-react';

const ConnectionGuide: React.FC = () => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-1">
        <CardTitle className="text-blue-800 flex items-center gap-2 text-base">
          <Cable className="h-4 w-4" />
          Cable Connection Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-blue-700 space-y-1 pt-0">
        <p><strong>300ft Reels:</strong> Connect from Main Box → Y Adapter → Wells (direct connection from Y adapter)</p>
        <p><strong>200ft Cables:</strong> Connect directly Main Box → Well (or add Y Adapter for multiple wells)</p>
        <p><strong>100ft Cables:</strong> Can connect through Y Adapter or directly to wells/gauges</p>
        <p><strong>Y Adapters:</strong> Can connect directly to wells and wellside gauges without cable restrictions</p>
        <p><strong>COM Ports:</strong> P1(COM1,2) | P2(COM3,4) | P3(COM5,6) | P4(COM7,8)</p>
        <p><strong>Delete Connections:</strong> Select any cable connection and press Delete key</p>
      </CardContent>
    </Card>
  );
};

export default ConnectionGuide;
