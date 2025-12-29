
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ImageStatusBadgeProps {
  status: string;
}

const ImageStatusBadge: React.FC<ImageStatusBadgeProps> = ({ status }) => {
  return (
    <Badge 
      variant="outline"
      className={
        status === 'verified' 
          ? 'border-green-500 text-green-600 bg-green-50' 
          : status === 'rejected'
          ? 'border-red-500 text-red-600 bg-red-50'
          : 'border-orange-500 text-orange-600 bg-orange-50'
      }
    >
      {status}
    </Badge>
  );
};

export default ImageStatusBadge;
