import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Camera, MapPin, Calendar, Tag, Upload, X } from 'lucide-react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { supabase } from '@/integrations/supabase/client';
import { optimizeImage, getOptimizedFileName } from '@/utils/imageOptimizer';
import { toast } from 'sonner';

const RedTagManager: React.FC = () => {
  const { data, updateSingleEquipmentItem, updateSingleIndividualEquipment } = useSupabaseInventory();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [redTagData, setRedTagData] = useState({
    reason: '',
    photos: [] as string[],
    notes: ''
  });

  const redTaggedItems = [
    ...data.equipmentItems.filter(item => item.status === 'red-tagged'),
    ...data.individualEquipment.filter(eq => eq.status === 'red-tagged')
  ];

  const handlePhotoUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // Optimize the image first
      const optimizedFile = await optimizeImage(file, {
        maxWidth: 1200,
        maxHeight: 800,
        quality: 0.85,
        format: 'webp'
      });

      const fileName = getOptimizedFileName(file.name);
      const filePath = `red-tags/${Date.now()}_${fileName}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('equipment-photos')
        .upload(filePath, optimizedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('equipment-photos')
        .getPublicUrl(filePath);

      setRedTagData(prev => ({
        ...prev,
        photos: [...prev.photos, publicUrl]
      }));

      toast.success('Photo uploaded and optimized successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (photoUrl: string) => {
    setRedTagData(prev => ({
      ...prev,
      photos: prev.photos.filter(url => url !== photoUrl)
    }));
  };

  const handleRedTag = async (item: any, isIndividual: boolean) => {
    if (!redTagData.reason) {
      toast.error('Red tag reason is required');
      return;
    }

    try {
      const updates = {
        status: 'red-tagged' as const,
        redTagReason: redTagData.reason,
        redTagPhoto: redTagData.photos[0] || null, // Store first photo for backward compatibility
        notes: redTagData.notes
      };

      if (isIndividual) {
        await updateSingleIndividualEquipment(item.id, updates);
      } else {
        await updateSingleEquipmentItem(item.id, updates);
      }

      // Save additional photos to red_tag_photos table if multiple photos
      if (redTagData.photos.length > 0) {
        for (const photoUrl of redTagData.photos) {
          await supabase
            .from('red_tag_photos')
            .insert({
              equipment_item_id: isIndividual ? null : item.id,
              individual_equipment_id: isIndividual ? item.id : null,
              photo_url: photoUrl,
              description: redTagData.reason
            });
        }
      }

      toast.success('Item red-tagged successfully');
      setIsDialogOpen(false);
      setRedTagData({ reason: '', photos: [], notes: '' });
    } catch (error) {
      console.error('Error red-tagging item:', error);
      toast.error('Failed to red-tag item');
    }
  };

  const handleRemoveRedTag = async (item: any, isIndividual: boolean) => {
    try {
      const updates = {
        status: 'available' as const,
        redTagReason: null,
        redTagPhoto: null
      };

      if (isIndividual) {
        await updateSingleIndividualEquipment(item.id, updates);
      } else {
        await updateSingleEquipmentItem(item.id, updates);
      }

      // Remove associated photos
      await supabase
        .from('red_tag_photos')
        .delete()
        .eq(isIndividual ? 'individual_equipment_id' : 'equipment_item_id', item.id);

      toast.success('Red tag removed successfully');
    } catch (error) {
      console.error('Error removing red tag:', error);
      toast.error('Failed to remove red tag');
    }
  };

  const getLocationName = (locationId: string) => {
    const location = data.storageLocations.find(l => l.id === locationId);
    return location?.name || 'Unknown Location';
  };

  const getTypeName = (typeId: string) => {
    const type = data.equipmentTypes.find(t => t.id === typeId);
    return type?.name || 'Unknown Type';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Red Tag Management</h2>
        <Badge variant="destructive" className="text-lg px-3 py-1">
          {redTaggedItems.length} Red Tagged Items
        </Badge>
      </div>

      {redTaggedItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Red Tagged Items</h3>
            <p className="text-gray-600">All equipment is currently in good condition.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {redTaggedItems.map((item) => {
            const isIndividual = 'equipmentId' in item;
            const typeName = data.equipmentTypes.find(t => t.id === item.typeId)?.name || 'Unknown Type';
            const locationName = data.storageLocations.find(l => l.id === item.locationId)?.name || 'Unknown Location';

            return (
              <Card key={item.id} className="border-red-200 bg-red-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-red-800">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        {isIndividual ? item.equipmentId : `${typeName} (Qty: ${(item as any).quantity})`}
                      </div>
                    </CardTitle>
                    <Badge variant="destructive">
                      <Tag className="h-3 w-3 mr-1" />
                      Red Tagged
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{locationName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{new Date(item.lastUpdated || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {item.redTagReason && (
                    <div className="bg-white p-3 rounded border border-red-200">
                      <h4 className="font-semibold text-red-800 mb-1">Red Tag Reason:</h4>
                      <p className="text-gray-700">{item.redTagReason}</p>
                    </div>
                  )}

                  {item.notes && (
                    <div className="bg-white p-3 rounded border border-red-200">
                      <h4 className="font-semibold text-red-800 mb-1">Notes:</h4>
                      <p className="text-gray-700">{item.notes}</p>
                    </div>
                  )}

                  {item.redTagPhoto && (
                    <div className="bg-white p-3 rounded border border-red-200">
                      <h4 className="font-semibold text-red-800 mb-2">Photo:</h4>
                      <img 
                        src={item.redTagPhoto} 
                        alt="Red tag photo"
                        className="max-w-sm h-32 object-cover rounded border"
                      />
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveRedTag(item, isIndividual)}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      Remove Red Tag
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setRedTagData({ reason: item.redTagReason || '', photos: [], notes: item.notes || '' });
                          }}
                        >
                          Edit Red Tag
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Red Tag</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Reason for Red Tag *</Label>
                            <Input
                              value={redTagData.reason}
                              onChange={(e) => setRedTagData(prev => ({ ...prev, reason: e.target.value }))}
                              placeholder="Damage, malfunction, etc."
                            />
                          </div>

                          <div>
                            <Label>Photos</Label>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handlePhotoUpload(file);
                                  }}
                                  disabled={isUploading}
                                />
                                {isUploading && <span className="text-sm text-blue-600">Optimizing...</span>}
                              </div>
                              
                              {redTagData.photos.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                  {redTagData.photos.map((photo, index) => (
                                    <div key={index} className="relative">
                                      <img 
                                        src={photo} 
                                        alt={`Red tag photo ${index + 1}`}
                                        className="w-full h-20 object-cover rounded border"
                                      />
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        className="absolute top-1 right-1 h-6 w-6 p-0"
                                        onClick={() => removePhoto(photo)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label>Additional Notes</Label>
                            <Textarea
                              value={redTagData.notes}
                              onChange={(e) => setRedTagData(prev => ({ ...prev, notes: e.target.value }))}
                              placeholder="Additional details..."
                            />
                          </div>
                          <Button 
                            onClick={() => handleRedTag(selectedItem, 'equipmentId' in selectedItem)}
                            className="w-full"
                            disabled={isUploading}
                          >
                            Update Red Tag
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RedTagManager;
