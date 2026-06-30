import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, Trash2, FileText, Eye } from 'lucide-react';
import { uploadUserDocs, updateUserData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import ImageCropper from '@/components/ui/image-cropper';
import ImageModal from '@/components/ui/image-modal';

interface UploadDocumentsTabProps {
  userProfile: any;
  dropdowns: any;
  currentUser: any;
  userId: string;
  userImages?: any;
}

const UploadDocumentsTab: React.FC<UploadDocumentsTabProps> = ({
  userProfile,
  dropdowns,
  currentUser,
  userId,
  userImages,
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
      // Images live on the userImages query (imgList) — refresh it too so the
      // newly uploaded images appear in their cards immediately.
      queryClient.invalidateQueries({ queryKey: ['userImages', userId] });
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

  // Resolve the already-uploaded URL for a given slot so existing documents/
  // images are shown in their cards (image slots: imgList[0..4] = gallery 1-5,
  // imgList[5] = profile image; KYC URLs live on userProfile.kyc).
  const imgList = Array.isArray(userImages?.imgList) ? userImages.imgList : [];
  const getExistingUrl = (fileKey: string): string => {
    if (fileKey === 'profileImage') return imgList[5]?.imgUrl || '';
    if (/^image[1-5]$/.test(fileKey)) {
      const slot = parseInt(fileKey.replace('image', ''), 10) - 1;
      return imgList[slot]?.imgUrl || '';
    }
    if (fileKey === 'kycFront') return userProfile?.kyc?.kycDocumentFrontUrl || '';
    if (fileKey === 'kycBack') return userProfile?.kyc?.kycDocumentBackUrl || '';
    return '';
  };

  const FileUploadCard = ({
    title,
    fileKey,
    isKyc = false,
    isProfileImage = false,
  }: {
    title: string;
    fileKey: string;
    isKyc?: boolean;
    isProfileImage?: boolean;
  }) => {
    const hasFile = selectedFiles[fileKey];
    const newPreview = filePreviewUrls[fileKey];
    const isCropped = croppedImageUrls[fileKey];
    const isNewPdf = newPreview === 'PDF Document';
    const existingUrl = getExistingUrl(fileKey);

    // Image to render: a freshly-selected (non-pdf) file takes priority,
    // otherwise fall back to the already-uploaded image/document.
    const imageUrl = hasFile && !isNewPdf && newPreview ? newPreview : !hasFile ? existingUrl : '';
    const showPdfTile = hasFile && isNewPdf;
    const statusLabel = hasFile ? (isCropped ? 'Cropped' : 'Selected') : existingUrl ? 'Uploaded' : '';

    const openPreview = () => {
      if (!imageUrl) return;
      // Existing KYC docs may be PDFs — open in a new tab; everything else
      // (images, freshly-selected files) opens in the in-app modal.
      if (!hasFile && isKyc && existingUrl) {
        window.open(existingUrl, '_blank', 'noopener');
      } else {
        handleViewImage(imageUrl);
      }
    };

    return (
      <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-pink-300 hover:shadow-md">
        {/* Preview / dropzone */}
        <div className="relative aspect-[9/10] bg-gray-50">
          {imageUrl ? (
            <button type="button" onClick={openPreview} className="absolute inset-0 h-full w-full">
              {/* Fallback shown if the image fails to load (e.g. a PDF document) */}
              <span className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                <FileText className="mb-2 h-10 w-10" />
                <span className="text-xs font-medium">View document</span>
              </span>
              <img
                src={imageUrl}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-800">
                  <Eye className="h-3.5 w-3.5" /> View
                </span>
              </span>
            </button>
          ) : showPdfTile ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
              <FileText className="mb-2 h-10 w-10" />
              <p className="text-xs font-medium">PDF Document</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => canEdit && document.getElementById(fileKey)?.click()}
              disabled={!canEdit}
              className="absolute inset-2 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 transition-colors hover:border-pink-300 hover:text-pink-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload className="h-7 w-7" />
              <span className="text-xs font-medium">Click to upload</span>
            </button>
          )}

          {statusLabel && (
            <Badge className="absolute left-2 top-2 border border-gray-200 bg-white/90 text-[10px] text-gray-700">
              {statusLabel}
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-sm font-medium text-gray-900">{title}</h3>
            {isProfileImage && (
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-pink-600">
                Required
              </span>
            )}
          </div>

          <input
            type="file"
            accept={isKyc ? 'image/*,.pdf' : 'image/*'}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(fileKey, file);
              e.currentTarget.value = '';
            }}
            className="hidden"
            id={fileKey}
            disabled={!canEdit}
          />

          <div className="flex items-center gap-2">
            <Button
              onClick={() => document.getElementById(fileKey)?.click()}
              size="sm"
              variant={hasFile || existingUrl ? 'outline' : 'default'}
              className="flex-1"
              disabled={!canEdit}
            >
              <Upload className="mr-1 h-3.5 w-3.5" />
              {hasFile || existingUrl ? 'Replace' : 'Upload'}
            </Button>
            {hasFile && (
              <Button
                onClick={() => handleRemoveFile(fileKey)}
                size="sm"
                variant="outline"
                className="px-2 text-destructive border-destructive/40 hover:bg-destructive hover:text-destructive-foreground"
                disabled={!canEdit}
                aria-label={`Remove ${title}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
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
      <div className="space-y-6 sm:space-y-8">
        {!canEdit && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            You have read-only access. Uploading and editing documents is restricted to admins.
          </div>
        )}
        {/* KYC Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
              Upload KYC Documents
            </CardTitle>
            <p className="text-sm text-gray-500">
              Front and back of the selected ID. Images or PDF accepted.
            </p>
          </CardHeader>
          <CardContent className="p-4 space-y-6 sm:p-6">
            {/* KYC Document Type Selection */}
            <div className="bg-gray-50 rounded-lg p-4">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                KYC Document Type:
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Select value={kycDocType} onValueChange={setKycDocType} disabled={!canEdit}>
                  <SelectTrigger className="w-full sm:flex-1">
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
                    className="w-full sm:w-auto"
                  >
                    {updateKycTypeMutation.isPending ? 'Updating...' : 'Update'}
                  </Button>
                )}
              </div>
            </div>

            {/* KYC Upload Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:max-w-xl">
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
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
              Upload Images
            </CardTitle>
            <p className="text-sm text-gray-500">
              Profile image is required and will be cropped to 450×500. Add up to 5 gallery images.
            </p>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
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
