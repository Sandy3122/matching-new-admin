
import React from 'react';
import { AdvancedTable, ColumnDef } from '@/components/ui/advanced-table';
import ImageStatusBadge from '@/components/ui/image-status-badge';
import ImageActionControls from '@/components/ui/image-action-controls';

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

interface ImageVerificationTableProps {
  imageList: any[] | undefined;
  isLoading: boolean;
  onImageClick: (item: ImageItem) => void;
  onStatusUpdate: (userId: string, imageIndex: number, status: string) => void;
  isUpdating: boolean;
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

const ImageVerificationTable: React.FC<ImageVerificationTableProps> = ({
  imageList,
  isLoading,
  onImageClick,
  onStatusUpdate,
  isUpdating,
}) => {
  // Flatten the image data for the table and filter only pending images
  const flattenedData: ImageItem[] = React.useMemo(() => {
    if (!imageList) return [];
    
    const flattened: ImageItem[] = [];
    imageList.forEach((user: any) => {
      user.imgList?.forEach((img: any, index: number) => {
        if (img.imgUrl && img.imgVerificationStatus === 'pending') {
          flattened.push({
            userId: user.id,
            customerId: user.customerId,
            firstName: user.firstName,
            lastName: user.lastName,
            registeredMobileNumber: user.registeredMobileNumber,
            imageIndex: index,
            imgUrl: img.imgUrl,
            imgVerificationStatus: img.imgVerificationStatus,
            imgUploadedBy: img.imgUploadedBy,
            imgVerificationBy: img.imgVerificationBy,
          });
        }
      });
    });
    return flattened;
  }, [imageList]);

  const columns: ColumnDef<ImageItem>[] = [
    {
      header: 'User ID',
      accessorFn: (item) => item.userId,
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
      cell: ({ row }) => (
        <span className="font-medium text-pink-600">{row.original.userId}</span>
      ),
    },
    {
      header: 'Customer ID',
      accessorFn: (item) => item.customerId,
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
    },
    {
      header: 'Name',
      accessorFn: (item) => `${item.firstName} ${item.lastName}`,
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
      cell: ({ row }) => (
        <span className="font-medium">{`${row.original.firstName} ${row.original.lastName}`}</span>
      ),
    },
    {
      header: 'Phone Number',
      accessorFn: (item) => item.registeredMobileNumber,
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
    },
    {
      header: 'Image',
      accessorFn: (item) => getImageName(item.imgUrl),
      cell: ({ row }) => (
        <button 
          onClick={() => onImageClick(row.original)}
          className="text-pink-500 hover:text-pink-700 hover:underline font-medium cursor-pointer"
        >
          {getImageName(row.original.imgUrl)}
        </button>
      ),
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
    },
    {
      header: 'Status',
      accessorFn: (item) => item.imgVerificationStatus,
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
      cell: ({ row }) => (
        <ImageStatusBadge status={row.original.imgVerificationStatus} />
      ),
    },
    {
      header: 'Uploaded By',
      accessorFn: (item) => item.imgUploadedBy?.split('/')[0] || 'N/A',
      enableSorting: true,
      enableColumnFilter: true,
      enableGlobalFilter: true,
    },
    {
      header: 'Actions',
      accessorFn: () => '',
      cell: ({ row }) => (
        <ImageActionControls
          currentStatus={row.original.imgVerificationStatus}
          onStatusUpdate={(status) => onStatusUpdate(row.original.userId, row.original.imageIndex, status)}
          isUpdating={isUpdating}
        />
      ),
      enableSorting: false,
      enableColumnFilter: false,
      enableGlobalFilter: false,
    },
  ];

  return (
    <AdvancedTable
      data={flattenedData}
      columns={columns}
      title="Pending Image Verification"
      searchPlaceholder="Search by user name, ID, or phone..."
      itemsPerPageOptions={[10, 25, 50, 100]}
      defaultItemsPerPage={25}
      isLoading={isLoading}
    />
  );
};

export default ImageVerificationTable;
