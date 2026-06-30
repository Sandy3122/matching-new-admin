
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { updateUserData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface KycDetailsTabProps {
  userProfile: any;
  currentUser: any;
  userId: string;
}

const KycDetailsTab: React.FC<KycDetailsTabProps> = ({
  userProfile,
  currentUser,
  userId,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [verificationStatus, setVerificationStatus] = useState(
    userProfile?.kyc?.kycVerificationStatus || 'pending'
  );

  const updateMutation = useMutation({
    mutationFn: (status: string) => updateUserData(userId, {
      kyc: {
        ...userProfile?.kyc,
        kycVerificationStatus: status,
        kycVerifiedBy: `${currentUser?.name}/${currentUser?.id}/${new Date().toLocaleString()}`
      }
    }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "KYC verification status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update KYC verification status",
        variant: "destructive",
      });
    },
  });

  const handleUpdate = () => {
    updateMutation.mutate(verificationStatus);
  };

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'superAdmin';

  const kycData = userProfile?.kyc || {};

  // Audit strings are stored as `name/id/timestamp` (or `name/id/phone/timestamp`).
  const formatAudit = (value?: string) => {
    if (!value) return '—';
    const parts = String(value).split('/');
    const name = parts[0] || '—';
    const id = parts[1] || '—';
    const date = parts[parts.length - 1] || '—';
    return `Id: ${id}; Name: ${name}; Date: ${date}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>KYC Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Kyc Document Name:</Label>
            <div className="p-2 bg-gray-50 rounded">
              {kycData.kycDocumentType || '—'}
            </div>
          </div>

          <div></div>

          <div>
            <Label>Document Front Url:</Label>
            <div className="p-2">
              {kycData.kycDocumentFrontUrl ? (
                <a
                  href={kycData.kycDocumentFrontUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View Front Doc
                </a>
              ) : (
                <span className="text-gray-400 text-sm">Not uploaded</span>
              )}
            </div>
          </div>

          <div>
            <Label>Document Back Url:</Label>
            <div className="p-2">
              {kycData.kycDocumentBackUrl ? (
                <a
                  href={kycData.kycDocumentBackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View Back Doc
                </a>
              ) : (
                <span className="text-gray-400 text-sm">Not uploaded</span>
              )}
            </div>
          </div>

          <div>
            <Label>Front Doc Uploaded At:</Label>
            <div className="p-2 bg-gray-50 rounded text-sm">
              {formatAudit(kycData.kycFrontDocUploadedBy)}
            </div>
          </div>

          <div>
            <Label>Back Doc Uploaded At:</Label>
            <div className="p-2 bg-gray-50 rounded text-sm">
              {formatAudit(kycData.kycBackDocUploadedBy)}
            </div>
          </div>

          <div>
            <Label>Kyc Verified By:</Label>
            <div className="p-2 bg-gray-50 rounded text-sm">
              {formatAudit(kycData.kycVerifiedBy)}
              {kycData.kycVerificationStatus ? `; Status: ${kycData.kycVerificationStatus}` : ''}
            </div>
          </div>

          <div>
            <Label>Verification Status:</Label>
            <div className="flex items-center space-x-2">
              <Select 
                value={verificationStatus} 
                onValueChange={setVerificationStatus}
                disabled={!canEdit}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              {canEdit && (
                <Button 
                  onClick={handleUpdate}
                  disabled={updateMutation.isPending}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  {updateMutation.isPending ? 'Updating...' : 'Update'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KycDetailsTab;
