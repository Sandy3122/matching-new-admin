import React, { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  listNotificationUsers,
  listTopics,
  sendManualNotification,
  processNotificationQueue,
  type NotificationUser,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const NotificationSendTab: React.FC = () => {
  const { toast } = useToast();
  const [targetType, setTargetType] = useState<'user' | 'topic'>('user');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [autoProcess, setAutoProcess] = useState(true);
  const [form, setForm] = useState({
    type: 'admin_manual',
    title: '',
    body: '',
    deepLink: '',
    imageUrl: '',
  });

  const { data: users } = useQuery({
    queryKey: ['notificationUsers'],
    queryFn: () => listNotificationUsers(500),
  });

  const { data: topics } = useQuery({
    queryKey: ['notificationTopics'],
    queryFn: listTopics,
  });

  const filteredUsers = useMemo(() => {
    const list: NotificationUser[] = Array.isArray(users) ? users : [];
    const q = userSearch.trim().toLowerCase();
    if (!q) return list.slice(0, 100);
    return list
      .filter((u) =>
        `${u.firstName || ''} ${u.lastName || ''} ${u.userId || u.id || ''} ${u.registeredMobileNumber || ''}`
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 100);
  }, [users, userSearch]);

  const mutation = useMutation({
    mutationFn: async () => {
      await sendManualNotification({
        targetType,
        userId: targetType === 'user' ? selectedUserId : undefined,
        topic: targetType === 'topic' ? selectedTopic : undefined,
        type: form.type || 'admin_manual',
        title: form.title,
        body: form.body,
        deepLink: form.deepLink || undefined,
        imageUrl: form.imageUrl || undefined,
      });
      if (autoProcess) {
        await processNotificationQueue();
      }
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Notification queued successfully' });
      setForm({ type: 'admin_manual', title: '', body: '', deepLink: '', imageUrl: '' });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send notification',
        variant: 'destructive',
      });
    },
  });

  const processQueue = useMutation({
    mutationFn: processNotificationQueue,
    onSuccess: () => toast({ title: 'Queue processed', description: 'Pending notifications processed' }),
    onError: (error) =>
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process queue',
        variant: 'destructive',
      }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      toast({ title: 'Error', description: 'Title and body are required', variant: 'destructive' });
      return;
    }
    if (targetType === 'user' && !selectedUserId) {
      toast({ title: 'Error', description: 'Select a target user', variant: 'destructive' });
      return;
    }
    if (targetType === 'topic' && !selectedTopic) {
      toast({ title: 'Error', description: 'Select a target topic', variant: 'destructive' });
      return;
    }
    mutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Send Notification</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={processQueue.isPending}
            onClick={() => processQueue.mutate()}
          >
            {processQueue.isPending ? 'Processing...' : 'Process Queue Now'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Target Type</Label>
              <Select value={targetType} onValueChange={(v) => setTargetType(v as 'user' | 'topic')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="topic">Topic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Input id="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
            </div>
          </div>

          {targetType === 'user' ? (
            <div>
              <Label>Target User</Label>
              <Input
                placeholder="Search users by name, id or phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="mb-2"
              />
              <div className="border rounded-md max-h-56 overflow-y-auto divide-y">
                {filteredUsers.length === 0 && <div className="p-3 text-sm text-gray-500">No users found.</div>}
                {filteredUsers.map((u) => {
                  const uid = u.userId || u.id || '';
                  return (
                    <label
                      key={uid}
                      className={`flex items-center gap-3 p-2 text-sm cursor-pointer hover:bg-pink-50 ${
                        selectedUserId === uid ? 'bg-pink-50' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="targetUser"
                        checked={selectedUserId === uid}
                        onChange={() => setSelectedUserId(uid)}
                      />
                      <span className="font-medium capitalize">
                        {u.firstName} {u.lastName}
                      </span>
                      <span className="text-gray-500">#{uid}</span>
                      <span className="text-gray-400 ml-auto">{u.registeredMobileNumber}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <Label>Target Topic</Label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(topics) ? topics : []).map((t) => (
                    <SelectItem key={t.id} value={t.topicName || t.id}>
                      {t.topicName || t.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="body">Body</Label>
            <Textarea id="body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={3} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deepLink">Deep Link</Label>
              <Input id="deepLink" value={form.deepLink} onChange={(e) => setForm({ ...form, deepLink: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input id="imageUrl" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="autoProcess" checked={autoProcess} onCheckedChange={(c) => setAutoProcess(!!c)} />
            <Label htmlFor="autoProcess" className="cursor-pointer">
              Auto-process queue after sending
            </Label>
          </div>

          <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white" disabled={mutation.isPending}>
            {mutation.isPending ? 'Sending...' : 'Send Notification'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NotificationSendTab;
