
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { fetchImageList, updateImageStatus } from '@/lib/api';

export const useImageVerification = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: imageList, isLoading } = useQuery({
    queryKey: ['imageList'],
    queryFn: fetchImageList,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, imageIndex, status }: { userId: string; imageIndex: number; status: string }) => 
      updateImageStatus(userId, imageIndex, status),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Image status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['imageList'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update image status",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (userId: string, imageIndex: number, status: string) => {
    updateStatusMutation.mutate({ userId, imageIndex, status });
  };

  return {
    imageList,
    isLoading,
    handleStatusUpdate,
    isUpdating: updateStatusMutation.isPending,
  };
};
