
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Camera, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface JobPhotoUploadProps {
  sectionLabel: string;
  onUpload: (file: File, sectionLabel: string, caption?: string) => void;
  isUploading: boolean;
}

const JobPhotoUpload: React.FC<JobPhotoUploadProps> = ({
  sectionLabel,
  onUpload,
  isUploading
}) => {
  const [caption, setCaption] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    onUpload(file, sectionLabel, caption);
    setCaption('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="h-4 w-4 text-green-500" />
          Add Photo to {sectionLabel}
          <span className="text-xs text-green-600 font-normal">(Auto-optimized)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="caption" className="text-xs">Caption (optional)</Label>
          <Textarea
            id="caption"
            placeholder="Add a description for this photo..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="h-16 text-xs"
          />
        </div>
        
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="space-y-2">
            <div className="flex justify-center">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-xs text-gray-600">
              Drag & drop an image here, or click to select
            </p>
            <p className="text-xs text-green-600">
              Images will be automatically compressed and optimized for web
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-xs"
              >
                <Upload className="h-3 w-3 mr-1" />
                Choose File
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  fileInputRef.current?.setAttribute('capture', 'environment');
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
                className="text-xs"
              >
                <Camera className="h-3 w-3 mr-1" />
                Take Photo
              </Button>
            </div>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        {isUploading && (
          <div className="text-xs text-blue-600 text-center space-y-1">
            <p>Optimizing and uploading...</p>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div className="bg-blue-600 h-1 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobPhotoUpload;
