
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ImageActionControlsProps {
  currentStatus: string;
  onStatusUpdate: (status: string) => void;
  isUpdating?: boolean;
}

const ImageActionControls: React.FC<ImageActionControlsProps> = ({
  currentStatus,
  onStatusUpdate,
  isUpdating = false,
}) => {
  return (
    <Select
      value={currentStatus === 'pending' ? '' : currentStatus}
      onValueChange={onStatusUpdate}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-[100px] bg-white border">
        <SelectValue placeholder="Action" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="verified" className="text-green-700">Verify</SelectItem>
        <SelectItem value="rejected" className="text-red-700">Reject</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default ImageActionControls;

