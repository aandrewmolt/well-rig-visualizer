
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Camera, MapPin, AlertTriangle, X } from 'lucide-react';
import { useInventoryData, EquipmentItem } from '@/hooks/useInventoryData';
import { toast } from 'sonner';

interface RedTagManagerProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentItem?: EquipmentItem;
  onRedTag: (itemId: string, reason: string, photo?: string, location?: string) => void;
}

const RedTagManager: React.FC<RedTagManagerProps> = ({
  isOpen,
  onClose,
  equipmentItem,
  onRedTag,
}) => {
  const [reason, setReason] = useState('');
  const [location, setLocation] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera');
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhoto(photoDataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.error('Please enter a reason for red tagging');
      return;
    }

    if (equipmentItem) {
      onRedTag(equipmentItem.id, reason, photo || undefined, location || undefined);
      setReason('');
      setLocation('');
      setPhoto(null);
      onClose();
      toast.success('Equipment red-tagged successfully');
    }
  };

  const handleClose = () => {
    stopCamera();
    setReason('');
    setLocation('');
    setPhoto(null);
    onClose();
  };

  if (!isOpen || !equipmentItem) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Red Tag Equipment
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Equipment Details</h4>
            <div className="p-2 bg-gray-50 rounded text-sm">
              <p>Type: {equipmentItem.typeId}</p>
              <p>Quantity: {equipmentItem.quantity}</p>
              <Badge variant="outline">Current Status: {equipmentItem.status}</Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Reason for Red Tag *</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter detailed reason for red tagging..."
              className="h-20 resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Current Location</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter current location of equipment..."
              className="flex items-center gap-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Photo Evidence</label>
            {!photo && !isCapturing && (
              <Button
                onClick={startCamera}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Take Photo
              </Button>
            )}

            {isCapturing && (
              <div className="space-y-2">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded border"
                />
                <div className="flex gap-2">
                  <Button onClick={capturePhoto} className="flex-1">
                    Capture
                  </Button>
                  <Button onClick={stopCamera} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {photo && (
              <div className="space-y-2">
                <img src={photo} alt="Equipment photo" className="w-full rounded border" />
                <Button
                  onClick={() => setPhoto(null)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Retake Photo
                </Button>
              </div>
            )}

            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} className="flex-1 bg-red-600 hover:bg-red-700">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Red Tag Equipment
            </Button>
            <Button onClick={handleClose} variant="outline">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RedTagManager;
