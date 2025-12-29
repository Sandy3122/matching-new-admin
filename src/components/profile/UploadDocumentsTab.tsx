import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, Trash2, FileText, Edit3, Eye, X } from 'lucide-react';
import { uploadUserDocs, updateUserData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import ImageCropper from '@/components/ui/image-cropper';
import ImageModal from '@/components/ui/image-modal';

interface UploadDocumentsTabProps {
  userProfile: any;
  dropdowns: any;
  currentUser: any;
  userId: string;
}

const UploadDocumentsTab: React.FC<UploadDocumentsTabProps> = ({
  userProfile,
  dropdowns,
  currentUser,
  userId,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>({});
  const [filePreviewUrls, setFilePreviewUrls] = useState<{ [key: string]: string }>({});
  const [kycDocType, setKycDocType] = useState(
    userProfile?.kyc?.kycDocumentType || 'aadharCard'
  );
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [currentCropFile, setCurrentCropFile] = useState<File | null>(null);
  const [currentCropKey, setCurrentCropKey] = useState<string>('');
  const [croppedImageUrls, setCroppedImageUrls] = useState<{ [key: string]: string }>({});
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => uploadUserDocs(userId, formData),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Documents uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
      setSelectedFiles({});
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload documents",
        variant: "destructive",
      });
    },
  });

  const updateKycTypeMutation = useMutation({
    mutationFn: (docType: string) => updateUserData(userId, {
      kyc: {
        ...userProfile?.kyc,
        kycDocumentType: docType
      }
    }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "KYC document type updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update KYC document type",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (fileType: string, file: File) => {
    const isImageFile = file.type.startsWith('image/');
    
    if (isImageFile && (fileType === 'profileImage' || fileType.startsWith('image'))) {
      // Show cropper for all images (mandatory for profile, optional for others)
      setCurrentCropFile(file);
      setCurrentCropKey(fileType);
      setIsCropperOpen(true);
    } else {
      // For non-image files (KYC docs)
      setSelectedFiles(prev => ({ ...prev, [fileType]: file }));
      if (file.type === 'application/pdf') {
        setFilePreviewUrls(prev => ({ ...prev, [fileType]: 'PDF Document' }));
      } else if (isImageFile) {
        setFilePreviewUrls(prev => ({ ...prev, [fileType]: URL.createObjectURL(file) }));
      }
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    setSelectedFiles(prev => ({ ...prev, [currentCropKey]: croppedFile }));
    const croppedUrl = URL.createObjectURL(croppedFile);
    setCroppedImageUrls(prev => ({ ...prev, [currentCropKey]: croppedUrl }));
    setFilePreviewUrls(prev => ({ ...prev, [currentCropKey]: croppedUrl }));
    setIsCropperOpen(false);
  };

  const handleSkipCrop = () => {
    if (currentCropFile && currentCropKey !== 'profileImage') {
      setSelectedFiles(prev => ({ ...prev, [currentCropKey]: currentCropFile }));
      setFilePreviewUrls(prev => ({ ...prev, [currentCropKey]: URL.createObjectURL(currentCropFile) }));
    }
    setIsCropperOpen(false);
  };

  const handleRemoveFile = (fileType: string) => {
    setSelectedFiles(prev => {
      const updated = { ...prev };
      delete updated[fileType];
      return updated;
    });
    setFilePreviewUrls(prev => {
      const updated = { ...prev };
      delete updated[fileType];
      return updated;
    });
    setCroppedImageUrls(prev => {
      const updated = { ...prev };
      delete updated[fileType];
      return updated;
    });
  };

  const handleViewImage = (url: string) => {
    setModalImageUrl(url);
    setIsImageModalOpen(true);
  };

  const handleUploadKyc = () => {
    const formData = new FormData();
    formData.append('customerId', userId);
    
    if (selectedFiles.kycFront) {
      formData.append('kycDocumentFront', selectedFiles.kycFront);
    }
    if (selectedFiles.kycBack) {
      formData.append('kycDocumentBack', selectedFiles.kycBack);
    }

    uploadMutation.mutate(formData);
  };

  const handleUploadImages = () => {
    const formData = new FormData();
    formData.append('customerId', userId);
    
    Object.entries(selectedFiles).forEach(([key, file]) => {
      if (key.startsWith('image') || key === 'profileImage') {
        formData.append(key, file);
      }
    });

    uploadMutation.mutate(formData);
  };

  const handleUpdateKycType = () => {
    updateKycTypeMutation.mutate(kycDocType);
  };

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'superAdmin';
  const kycDocTypes = dropdowns?.find((d: any) => d.id === 'kycDocumentTypes')?.data || {};

  const FileUploadCard = ({ 
    title, 
    fileKey, 
    isKyc = false, 
    isProfileImage = false 
  }: {
    title: string;
    fileKey: string;
    isKyc?: boolean;
    isProfileImage?: boolean;
  }) => {
    const hasFile = selectedFiles[fileKey];
    const previewUrl = filePreviewUrls[fileKey];
    const isCropped = croppedImageUrls[fileKey];

    return (
      <div className="border border-border rounded-lg p-4 bg-card hover:shadow-sm transition-shadow">
        <div className="flex flex-col space-y-3">
          {/* File preview area */}
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            {previewUrl && previewUrl !== 'PDF Document' ? (
              <img
                src={previewUrl}
                alt={title}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => handleViewImage(previewUrl)}
              />
            ) : previewUrl === 'PDF Document' ? (
              <div className="text-center">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">PDF Document</p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No file</p>
              </div>
            )}
          </div>

          {/* Title and status */}
          <div className="text-center">
            <h3 className="font-medium text-sm text-card-foreground mb-1">{title}</h3>
            {hasFile && (
              <Badge variant="secondary" className="text-xs">
                {isCropped ? 'Cropped & Ready' : 'Selected'}
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col space-y-2">
            <input
              type="file"
              accept={isKyc ? "image/*,.pdf" : "image/*"}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(fileKey, file);
              }}
              className="hidden"
              id={fileKey}
              disabled={!canEdit}
            />
            
            <Button
              onClick={() => document.getElementById(fileKey)?.click()}
              size="sm"
              className="w-full"
              disabled={!canEdit}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>

            {hasFile && (
              <div className="flex space-x-2">
                {previewUrl && previewUrl !== 'PDF Document' && (
                  <Button
                    onClick={() => handleViewImage(previewUrl)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                )}
                
                <Button
                  onClick={() => handleRemoveFile(fileKey)}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  disabled={!canEdit}
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Re-sync KYC doc type every time profile changes
  useEffect(() => {
    if (userProfile?.kyc?.kycDocumentType) {
      setKycDocType(userProfile.kyc.kycDocumentType);
    }
  }, [userProfile]);

  return (
    <>
      <div className="space-y-8">
        {/* KYC Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Upload KYC Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* KYC Document Type Selection */}
            <div className="bg-gray-50 rounded-lg p-4">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                KYC Document Type:
              </Label>
              <div className="flex items-center space-x-3">
                <Select value={kycDocType} onValueChange={setKycDocType} disabled={!canEdit}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(kycDocTypes).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value as string}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {canEdit && (
                  <Button 
                    onClick={handleUpdateKycType}
                    disabled={updateKycTypeMutation.isPending}
                  >
                    {updateKycTypeMutation.isPending ? 'Updating...' : 'Update'}
                  </Button>
                )}
              </div>
            </div>

            {/* KYC Upload Cards */}
            <div className="grid grid-cols-2 gap-4">
              <FileUploadCard
                title="KYC Front"
                fileKey="kycFront"
                isKyc={true}
              />
              <FileUploadCard
                title="KYC Back"
                fileKey="kycBack"
                isKyc={true}
              />
            </div>

            {canEdit && (selectedFiles.kycFront || selectedFiles.kycBack) && (
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={handleUploadKyc}
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload KYC Documents'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Images Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Upload Images
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <FileUploadCard
                title="Profile Image"
                fileKey="profileImage"
                isProfileImage={true}
              />
              
              {[1, 2, 3, 4, 5].map((num) => (
                <FileUploadCard
                  key={num}
                  title={`Image ${num}`}
                  fileKey={`image${num}`}
                />
              ))}
            </div>

            {canEdit && Object.keys(selectedFiles).some(key => key.startsWith('image') || key === 'profileImage') && (
              <div className="flex justify-center pt-6">
                <Button 
                  onClick={handleUploadImages}
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload Selected Images'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Image Cropper Modal */}
      <ImageCropper
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        imageFile={currentCropFile}
        onCropComplete={handleCropComplete}
        aspectRatio={450 / 500}
        showSkip={currentCropKey !== 'profileImage'}
        onSkip={handleSkipCrop}
      />

      {/* Image Preview Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={modalImageUrl}
        imageName="Image Preview"
        showStatusControls={false}
      />
    </>
  );
};

export default UploadDocumentsTab;
