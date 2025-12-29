
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateUserData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DeleteProfileTabProps {
  userProfile: any;
  currentUser: any;
  userId: string;
}

const DeleteProfileTab: React.FC<DeleteProfileTabProps> = ({
  userProfile,
  currentUser,
  userId,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reasonForDelete, setReasonForDelete] = useState('');

  const deleteMutation = useMutation({
    mutationFn: (reason: string) => updateUserData(userId, {
      deleteProfile: 'yes',
      reasonForDelete: reason,
      profileStatus: 'deleted'
    }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile marked for deletion successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete profile",
        variant: "destructive",
      });
    },
  });

  const handleDeleteProfile = () => {
    if (!reasonForDelete.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for deletion",
        variant: "destructive",
      });
      return;
    }
    deleteMutation.mutate(reasonForDelete);
  };

  const canDelete = currentUser?.role === 'admin' || currentUser?.role === 'superAdmin';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delete Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Profile ID:</Label>
            <Input 
              value={userProfile?.customerId || userId.replace('app', '')} 
              readOnly 
              className="bg-gray-50" 
            />
          </div>

          <div>
            <Label>Delete Profile:</Label>
            <Input 
              value={userProfile?.deleteProfile || 'null'} 
              readOnly 
              className="bg-gray-50" 
            />
          </div>

          <div className="md:col-span-2">
            <Label>Reason For Delete:</Label>
            <Input
              value={reasonForDelete}
              onChange={(e) => setReasonForDelete(e.target.value)}
              placeholder="Enter reason for deletion"
              disabled={!canDelete}
            />
          </div>
        </div>

        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                disabled={!reasonForDelete.trim() || deleteMutation.isPending}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Delete Profile
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently mark the profile for deletion.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteProfile}
                  disabled={deleteMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {!canDelete && (
          <p className="text-sm text-gray-500">
            You don't have permission to delete profiles
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DeleteProfileTab;
