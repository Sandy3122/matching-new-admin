import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  listTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  subscribeUsersToTopic,
  unsubscribeUsersFromTopic,
  type NotificationTopic,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Pencil } from 'lucide-react';

const NotificationTopicsTab: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newTopic, setNewTopic] = useState({ topicName: '', description: '' });
  const [subTopic, setSubTopic] = useState('');
  const [editing, setEditing] = useState<NotificationTopic | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NotificationTopic | null>(null);

  const { data: topics, isLoading } = useQuery({
    queryKey: ['notificationTopics'],
    queryFn: listTopics,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['notificationTopics'] });

  const createMutation = useMutation({
    mutationFn: createTopic,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Topic created' });
      setNewTopic({ topicName: '', description: '' });
      invalidate();
    },
    onError: (e) => toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ topic, description, isActive }: { topic: string; description: string; isActive: boolean }) =>
      updateTopic(topic, { description, isActive }),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Topic updated' });
      setEditing(null);
      invalidate();
    },
    onError: (e) => toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (topic: string) => deleteTopic(topic),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Topic deleted' });
      setDeleteTarget(null);
      invalidate();
    },
    onError: (e) => toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' }),
  });

  const subscribeMutation = useMutation({
    mutationFn: (topic: string) => subscribeUsersToTopic(topic, { allUsers: true }),
    onSuccess: () => toast({ title: 'Success', description: 'All users subscribed' }),
    onError: (e) => toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' }),
  });

  const unsubscribeMutation = useMutation({
    mutationFn: (topic: string) => unsubscribeUsersFromTopic(topic, { allUsers: true }),
    onSuccess: () => toast({ title: 'Success', description: 'All users unsubscribed' }),
    onError: (e) => toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' }),
  });

  const topicList: NotificationTopic[] = Array.isArray(topics) ? topics : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Topic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="topicName">Topic Name</Label>
              <Input
                id="topicName"
                value={newTopic.topicName}
                onChange={(e) => setNewTopic({ ...newTopic, topicName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="topicDesc">Description</Label>
              <Textarea
                id="topicDesc"
                value={newTopic.description}
                onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                rows={2}
              />
            </div>
            <Button
              className="bg-pink-600 hover:bg-pink-700"
              disabled={!newTopic.topicName.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate(newTopic)}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Topic'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Subscribe / Unsubscribe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Topic</Label>
              <Select value={subTopic} onValueChange={setSubTopic}>
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!subTopic || subscribeMutation.isPending}
                onClick={() => subscribeMutation.mutate(subTopic)}
              >
                Subscribe All Users
              </Button>
              <Button
                variant="outline"
                disabled={!subTopic || unsubscribeMutation.isPending}
                onClick={() => unsubscribeMutation.mutate(subTopic)}
              >
                Unsubscribe All Users
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Topics</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading topics...</p>
          ) : topicList.length === 0 ? (
            <p className="text-sm text-gray-500">No topics yet.</p>
          ) : (
            <div className="space-y-2">
              {topicList.map((t) => (
                <div key={t.id} className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {t.topicName || t.id}
                      {t.isSystemTopic && <Badge variant="outline">system</Badge>}
                      <Badge className={t.isActive === false ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}>
                        {t.isActive === false ? 'inactive' : 'active'}
                      </Badge>
                    </div>
                    {t.description && <div className="text-sm text-gray-500">{t.description}</div>}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(t)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setDeleteTarget(t)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <AlertDialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Topic: {editing?.topicName}</AlertDialogTitle>
            <AlertDialogDescription>Update the topic description and status.</AlertDialogDescription>
          </AlertDialogHeader>
          {editing && <EditTopicForm topic={editing} onChange={setEditing} />}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                editing &&
                updateMutation.mutate({
                  topic: editing.topicName || editing.id,
                  description: editing.description || '',
                  isActive: editing.isActive !== false,
                })
              }
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete topic "{deleteTarget?.topicName}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the topic and unsubscribes all users. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.topicName || deleteTarget.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const EditTopicForm: React.FC<{
  topic: NotificationTopic;
  onChange: (t: NotificationTopic) => void;
}> = ({ topic, onChange }) => (
  <div className="space-y-3">
    <div>
      <Label>Description</Label>
      <Textarea
        value={topic.description || ''}
        onChange={(e) => onChange({ ...topic, description: e.target.value })}
        rows={2}
      />
    </div>
    <div className="flex items-center gap-2">
      <Checkbox
        id="topicActive"
        checked={topic.isActive !== false}
        onCheckedChange={(c) => onChange({ ...topic, isActive: !!c })}
      />
      <Label htmlFor="topicActive" className="cursor-pointer">
        Active
      </Label>
    </div>
  </div>
);

export default NotificationTopicsTab;
