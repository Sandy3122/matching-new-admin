import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedTable, ColumnDef } from '@/components/ui/enhanced-table';
import {
  listCampaigns,
  createCampaign,
  sendCampaignNow,
  scheduleCampaign,
  cancelCampaign,
  listTopics,
  listNotificationUsers,
  type NotificationUser,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  title?: string;
  body?: string;
  status?: string;
  type?: string;
  audience?: { targetType?: string; topic?: string; userId?: string };
  scheduledAt?: unknown;
}

const statusColor = (status?: string) => {
  switch (status) {
    case 'queued':
    case 'sent':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'scheduled':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'cancelled':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    default:
      return 'bg-orange-100 text-orange-700 border-orange-300';
  }
};

const NotificationCampaignsTab: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [form, setForm] = useState({
    title: '',
    body: '',
    type: 'admin_manual',
    targetType: 'topic' as 'topic' | 'user',
    topic: '',
    userId: '',
    scheduledAt: '',
  });

  const { data: campaigns, isLoading } = useQuery({ queryKey: ['campaigns'], queryFn: () => listCampaigns(100) });
  const { data: topics } = useQuery({ queryKey: ['notificationTopics'], queryFn: listTopics });
  const { data: users } = useQuery({ queryKey: ['notificationUsers'], queryFn: () => listNotificationUsers(500) });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['campaigns'] });

  const filteredUsers = useMemo(() => {
    const list: NotificationUser[] = Array.isArray(users) ? users : [];
    const q = userSearch.trim().toLowerCase();
    if (!q) return list.slice(0, 50);
    return list
      .filter((u) =>
        `${u.firstName || ''} ${u.lastName || ''} ${u.userId || u.id || ''}`.toLowerCase().includes(q),
      )
      .slice(0, 50);
  }, [users, userSearch]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const result = await createCampaign({
        title: form.title,
        body: form.body,
        type: form.type,
        audience: {
          targetType: form.targetType,
          topic: form.targetType === 'topic' ? form.topic : undefined,
          userId: form.targetType === 'user' ? form.userId : undefined,
        },
      });
      const campaignId = result?.campaignId;
      if (campaignId && form.scheduledAt) {
        await scheduleCampaign(campaignId, form.scheduledAt);
      } else if (campaignId) {
        await sendCampaignNow(campaignId);
      }
    },
    onSuccess: () => {
      toast({ title: 'Success', description: form.scheduledAt ? 'Campaign scheduled' : 'Campaign created & queued' });
      setShowForm(false);
      setForm({ title: '', body: '', type: 'admin_manual', targetType: 'topic', topic: '', userId: '', scheduledAt: '' });
      invalidate();
    },
    onError: (e) => toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' }),
  });

  const sendMutation = useMutation({
    mutationFn: sendCampaignNow,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Campaign queued for sending' });
      invalidate();
    },
    onError: (e) => toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' }),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelCampaign,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Campaign cancelled' });
      invalidate();
    },
    onError: (e) => toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' }),
  });

  const columns: ColumnDef<Campaign>[] = [
    {
      header: 'Campaign ID',
      accessorFn: (item) => item.id,
      enableColumnFilter: true,
      cell: ({ row }) => <span className="text-xs">{row.original.id}</span>,
    },
    {
      header: 'Title',
      accessorFn: (item) => item.title || '',
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
    },
    {
      header: 'Target',
      accessorFn: (item) => item.audience?.targetType || '',
      cell: ({ row }) => {
        const a = row.original.audience;
        return (
          <div className="text-xs">
            <div className="capitalize">{a?.targetType || '—'}</div>
            <div className="text-gray-500">{a?.topic || a?.userId || ''}</div>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessorFn: (item) => item.status || '',
      enableSorting: true,
      cell: ({ row }) => <Badge className={statusColor(row.original.status)}>{row.original.status || 'draft'}</Badge>,
    },
    {
      header: 'Actions',
      accessorFn: () => '',
      cell: ({ row }) => {
        const c = row.original;
        const disabled = c.status === 'cancelled' || c.status === 'sent';
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7"
              disabled={disabled || sendMutation.isPending}
              onClick={() => sendMutation.mutate(c.id)}
            >
              Send
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 text-red-600"
              disabled={disabled || cancelMutation.isPending}
              onClick={() => cancelMutation.mutate(c.id)}
            >
              Cancel
            </Button>
          </div>
        );
      },
    },
  ];

  const topicList = Array.isArray(topics) ? topics : [];

  return (
    <div className="space-y-6">
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cTitle">Title</Label>
                <Input id="cTitle" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="cType">Type</Label>
                <Input id="cType" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="cBody">Body</Label>
              <Textarea id="cBody" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Target Type</Label>
                <Select value={form.targetType} onValueChange={(v) => setForm({ ...form, targetType: v as 'topic' | 'user' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="topic">Topic</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cSchedule">Schedule At (optional)</Label>
                <Input
                  id="cSchedule"
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                />
              </div>
            </div>
            {form.targetType === 'topic' ? (
              <div>
                <Label>Topic</Label>
                <Select value={form.topic} onValueChange={(v) => setForm({ ...form, topic: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {topicList.map((t) => (
                      <SelectItem key={t.id} value={t.topicName || t.id}>
                        {t.topicName || t.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label>Target User</Label>
                <Input
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="mb-2"
                />
                <div className="border rounded-md max-h-44 overflow-y-auto divide-y">
                  {filteredUsers.map((u) => {
                    const uid = u.userId || u.id || '';
                    return (
                      <label key={uid} className="flex items-center gap-3 p-2 text-sm cursor-pointer hover:bg-pink-50">
                        <input
                          type="radio"
                          name="campaignUser"
                          checked={form.userId === uid}
                          onChange={() => setForm({ ...form, userId: uid })}
                        />
                        <span className="capitalize font-medium">
                          {u.firstName} {u.lastName}
                        </span>
                        <span className="text-gray-500">#{uid}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                className="bg-pink-600 hover:bg-pink-700"
                disabled={!form.title.trim() || !form.body.trim() || createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                {createMutation.isPending ? 'Saving...' : form.scheduledAt ? 'Create & Schedule' : 'Create & Send'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <EnhancedTable
        data={(campaigns as Campaign[]) || []}
        columns={columns}
        title="Campaigns"
        searchPlaceholder="Search campaigns..."
        isLoading={isLoading}
        itemsPerPageOptions={[10, 25, 50, 100]}
        defaultItemsPerPage={25}
        headerActions={
          <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Hide Form' : 'Create Campaign'}
          </Button>
        }
      />
    </div>
  );
};

export default NotificationCampaignsTab;
