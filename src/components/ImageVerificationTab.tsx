
import React, { useState } from 'react';
import { useImageVerification } from '@/hooks/useImageVerification';
import ImageVerificationTable from '@/components/ImageVerificationTable';
import ImageModal from '@/components/ui/image-modal';
import LoadingSpinner from "./ui/loading-spinner";

interface ImageItem {
  userId: string;
  customerId: string;
  firstName: string;
  lastName: string;
  registeredMobileNumber: string;
  imageIndex: number;
  imgUrl: string;
  imgVerificationStatus: string;
  imgUploadedBy: string;
  imgVerificationBy: string;
}

const getImageName = (imgUrl: string) => {
  if (!imgUrl) return 'Image 0';
  if (imgUrl.includes('image1')) return 'Image 1';
  if (imgUrl.includes('image2')) return 'Image 2';
  if (imgUrl.includes('image3')) return 'Image 3';
  if (imgUrl.includes('image4')) return 'Image 4';
  if (imgUrl.includes('image5')) return 'Image 5';
  if (imgUrl.includes('profileImage')) return 'Profile Image';
  return 'Image';
};

const ImageVerificationTab: React.FC = () => {
  const { imageList, isLoading, handleStatusUpdate, isUpdating } = useImageVerification();
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageClick = (item: ImageItem) => {
    setSelectedImage(item);
    setIsModalOpen(true);
  };

  const handleModalStatusUpdate = (status: string) => {
    if (selectedImage) {
      handleStatusUpdate(selectedImage.userId, selectedImage.imageIndex, status);
      setIsModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <LoadingSpinner size={40} />
        <span className="mt-3 text-pink-500">Fetching images...</span>
      </div>
    );
  }

  return (
    <>
      <ImageVerificationTable
        imageList={imageList}
        isLoading={isLoading}
        onImageClick={handleImageClick}
        onStatusUpdate={handleStatusUpdate}
        isUpdating={isUpdating}
      />
      {selectedImage && (
        <ImageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          imageUrl={selectedImage.imgUrl}
          imageName={getImageName(selectedImage.imgUrl)}
          currentStatus={selectedImage.imgVerificationStatus}
          onStatusUpdate={handleModalStatusUpdate}
          showStatusControls={true}
          isUpdating={isUpdating}
        />
      )}
    </>
  );
};

export default ImageVerificationTab;

