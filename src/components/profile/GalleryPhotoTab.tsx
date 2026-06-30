import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateImageStatus, uploadUserDocs } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import ImageModal from '@/components/ui/image-modal';

interface GalleryPhotoTabProps {
  userProfile: any;
  currentUser: any;
  userId: string;
  userImages?: any;
}

const GalleryPhotoTab: React.FC<GalleryPhotoTabProps> = ({
  userProfile,
  currentUser,
  userId,
  userImages
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>({});
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string; index: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateStatusMutation = useMutation({
    mutationFn: ({ imageIndex, status }: { imageIndex: number; status: string }) => 
      updateImageStatus(userId, imageIndex, status),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Image status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['userImages', userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update image status",
        variant: "destructive",
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => uploadUserDocs(userId, formData),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Images uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['userImages', userId] });
      setSelectedFiles({});
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (imageIndex: number, status: string) => {
    updateStatusMutation.mutate({ imageIndex, status });
  };

  const handleFileSelect = (imageSlot: string, file: File) => {
    setSelectedFiles(prev => ({ ...prev, [imageSlot]: file }));
  };

  const handleUpload = () => {
    const formData = new FormData();
    formData.append('customerId', userId);
    
    Object.entries(selectedFiles).forEach(([slot, file]) => {
      formData.append(slot, file);
    });

    uploadMutation.mutate(formData);
  };

  const handleImageClick = (imageUrl: string, imageName: string, index: number) => {
    if (imageUrl) {
      setSelectedImage({ url: imageUrl, name: imageName, index });
      setIsModalOpen(true);
    }
  };

  const handleModalStatusUpdate = (status: string) => {
    if (selectedImage) {
      handleStatusUpdate(selectedImage.index, status);
    }
  };

  // Parse the `name/id/timestamp` audit string stored on each image slot.
  const parseVerifiedBy = (value?: string) => {
    const parts = String(value || '').split('/');
    return {
      name: parts[0] || '--',
      id: parts[1] || '--',
      date: parts[parts.length - 1] && parts.length > 1 ? parts[parts.length - 1] : '--',
    };
  };

  const slots = [
    { name: 'Photo 1', index: 0 },
    { name: 'Photo 2', index: 1 },
    { name: 'Photo 3', index: 2 },
    { name: 'Photo 4', index: 3 },
    { name: 'Photo 5', index: 4 },
    { name: 'Profile Image', index: 5 },
    { name: 'Selfie', index: 6 },
  ];

  const photoData = slots.map((slot) => {
    const img = userImages?.imgList?.[slot.index] || {};
    const audit = parseVerifiedBy(img.imgVerificationBy);
    return {
      name: slot.name,
      status: img.imgVerificationStatus || 'pending',
      verifiedBy: audit.id,
      verifiedByName: audit.name,
      statusText: img.imgVerificationStatus || 'Pending',
      date: audit.date,
      imageUrl: img.imgUrl,
      index: slot.index,
    };
  });

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'superAdmin';

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Photos Verification Details:</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {photoData.map((photo) => (
            <div key={photo.name} className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleImageClick(photo.imageUrl, photo.name, photo.index)}
                  className="text-blue-600 underline cursor-pointer min-w-[100px] hover:text-blue-800"
                  disabled={!photo.imageUrl}
                >
                  {photo.name}:
                </button>
                <span className="text-sm">
                  Verified By Id: <span className="text-blue-600">{photo.verifiedBy}</span>; 
                  Verified By Name: <span className="text-blue-600">{photo.verifiedByName}</span>; 
                  Status: <span className="text-yellow-600">{photo.statusText}</span>; 
                  Date: <span className="text-blue-600">{photo.date}</span>.
                </span>
              </div>
              
              {canEdit && (
                <div className="flex items-center space-x-2">
                  <Select 
                    value={photo.status}
                    onValueChange={(value) => handleStatusUpdate(photo.index, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Legacy field mapping: slot 5 -> profileImage, slot 6 -> selfieImage.
                        const slotKey =
                          photo.index === 5
                            ? 'profileImage'
                            : photo.index === 6
                            ? 'selfieImage'
                            : `image${photo.index + 1}`;
                        handleFileSelect(slotKey, file);
                      }
                    }}
                    className="hidden"
                    id={`file-${photo.index}`}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById(`file-${photo.index}`)?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              )}
            </div>
          ))}

          {canEdit && Object.keys(selectedFiles).length > 0 && (
            <div className="pt-4">
              <Button 
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload Selected Images'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          imageUrl={selectedImage.url}
          imageName={selectedImage.name}
          currentStatus={photoData[selectedImage.index]?.status}
          onStatusUpdate={canEdit ? handleModalStatusUpdate : undefined}
          showStatusControls={canEdit}
          isUpdating={updateStatusMutation.isPending}
        />
      )}
    </>
  );
};

export default GalleryPhotoTab;
