
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
  currentStatus?: string;
  onStatusUpdate?: (status: string) => void;
  showStatusControls?: boolean;
  isUpdating?: boolean;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageName,
  currentStatus = 'pending',
  onStatusUpdate,
  showStatusControls = false,
  isUpdating = false,
}) => {
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    if (onStatusUpdate) {
      onStatusUpdate(val);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{imageName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <AspectRatio ratio={16 / 9} className="bg-muted">
            <img
              src={imageUrl}
              alt={imageName}
              className="rounded-md object-contain w-full h-full"
            />
          </AspectRatio>
          {showStatusControls && onStatusUpdate && (
            <div className="flex items-center justify-between">
              <Select
                value={selectedStatus || ''}
                onValueChange={handleStatusChange}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified" className="text-green-700">Verify</SelectItem>
                  <SelectItem value="rejected" className="text-red-700">Reject</SelectItem>
                </SelectContent>
              </Select>
              <button 
                onClick={onClose}
                className="rounded px-4 py-2 bg-gray-100 border hover:bg-gray-200"
                type="button"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;

