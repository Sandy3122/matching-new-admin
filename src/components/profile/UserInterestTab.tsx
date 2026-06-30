import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fetchUserInterest, updateUserData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UserInterestTabProps {
  userProfile: any;
  currentUser: any;
  userId: string;
}

const statusColor = (status?: string) => {
  switch ((status || '').toLowerCase()) {
    case 'accepted':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'rejected':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'pending':
      return 'bg-orange-100 text-orange-700 border-orange-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const ListBlock: React.FC<{ title: string; items: any[]; showStatus?: boolean }> = ({
  title,
  items,
  showStatus,
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base flex items-center justify-between">
        <span>{title}</span>
        <Badge variant="outline">{items.length}</Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No records.</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {items.map((item, idx) => {
            const id =
              typeof item === 'string'
                ? item
                : item?.userId || item?.profileId || item?.id || item?.profileContactViewId || JSON.stringify(item);
            const status = typeof item === 'object' ? item?.interestStatus || item?.status : undefined;
            const dateTime =
              typeof item === 'object'
                ? item?.dateTime || item?.sentDateTime || item?.profileContactViewDateTime || item?.visitedDateTime
                : undefined;
            return (
              <div key={idx} className="flex items-center justify-between text-sm border-b pb-1">
                <span className="font-medium">{id}</span>
                <div className="flex items-center gap-2">
                  {dateTime && <span className="text-xs text-gray-400">{dateTime}</span>}
                  {showStatus && status && <Badge className={statusColor(status)}>{status}</Badge>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CardContent>
  </Card>
);

const UserInterestTab: React.FC<UserInterestTabProps> = ({ currentUser, userId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [contactCount, setContactCount] = useState('0');

  const { data, isLoading } = useQuery({
    queryKey: ['userInterest', userId],
    queryFn: () => fetchUserInterest(userId),
    enabled: !!userId,
  });

  useEffect(() => {
    if (data?.availableContactCount !== undefined) {
      setContactCount(String(data.availableContactCount));
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (value: string) => updateUserData(userId, { availableContactCount: value }),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Contact count updated' });
      queryClient.invalidateQueries({ queryKey: ['userInterest', userId] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update contact count', variant: 'destructive' });
    },
  });

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'superAdmin';

  if (isLoading) {
    return <div className="p-4">Loading user interest...</div>;
  }

  const visited = Array.isArray(data?.userVisitedList) ? data.userVisitedList : [];
  const shortlisted = Array.isArray(data?.userShortlistedList) ? data.userShortlistedList : [];
  const sentInterest = Array.isArray(data?.userSentInterestList) ? data.userSentInterestList : [];
  const viewedContacts = Array.isArray(data?.viewContactDetailsList) ? data.viewContactDetailsList : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Contact Count</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 max-w-sm">
            <div className="flex-1">
              <Label htmlFor="contactCount">Available Contact Count</Label>
              <Input
                id="contactCount"
                value={contactCount}
                onChange={(e) => setContactCount(e.target.value.replace(/\D/g, ''))}
                disabled={!canEdit}
              />
            </div>
            {canEdit && (
              <Button
                className="bg-pink-600 hover:bg-pink-700"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate(contactCount)}
              >
                {mutation.isPending ? 'Saving...' : 'Update'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ListBlock title="Visited Profiles" items={visited} />
        <ListBlock title="Shortlisted Profiles" items={shortlisted} />
        <ListBlock title="Sent Interest" items={sentInterest} showStatus />
        <ListBlock title="Viewed Contact Details" items={viewedContacts} />
      </div>
    </div>
  );
};

export default UserInterestTab;
