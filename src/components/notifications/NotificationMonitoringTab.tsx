import React, { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedTable, ColumnDef } from '@/components/ui/enhanced-table';
import {
  fetchNotificationFailures,
  fetchNotificationSuccesses,
  retryFailedNotification,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface DeliveryRecord {
  notificationId?: string;
  type?: string;
  userId?: string;
  topic?: string;
  platform?: string;
  status?: string;
  error?: string;
  retryCount?: number;
  [key: string]: unknown;
}

interface GroupedRow {
  notificationId: string;
  type: string;
  targets: number;
  platforms: string;
  sent: number;
  failed: number;
  lastError: string;
}

const NotificationMonitoringTab: React.FC = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'failed' | 'success'>('all');

  const { data: failures, isLoading: loadingF } = useQuery({
    queryKey: ['notificationFailures'],
    queryFn: () => fetchNotificationFailures(300),
  });
  const { data: successes, isLoading: loadingS } = useQuery({
    queryKey: ['notificationSuccesses'],
    queryFn: () => fetchNotificationSuccesses(300),
  });

  const retryMutation = useMutation({
    mutationFn: retryFailedNotification,
    onSuccess: () => toast({ title: 'Success', description: 'Retry queued' }),
    onError: (e) => toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' }),
  });

  const grouped = useMemo<GroupedRow[]>(() => {
    const map = new Map<string, GroupedRow>();
    const ingest = (records: DeliveryRecord[], isFailure: boolean) => {
      (Array.isArray(records) ? records : []).forEach((r) => {
        const id = r.notificationId || 'unknown';
        if (!map.has(id)) {
          map.set(id, { notificationId: id, type: r.type || '', targets: 0, platforms: '', sent: 0, failed: 0, lastError: '' });
        }
        const row = map.get(id)!;
        row.targets += 1;
        if (r.type) row.type = r.type;
        if (r.platform && !row.platforms.includes(r.platform)) {
          row.platforms = row.platforms ? `${row.platforms}, ${r.platform}` : r.platform;
        }
        if (isFailure) {
          row.failed += 1;
          if (r.error) row.lastError = r.error;
        } else {
          row.sent += 1;
        }
      });
    };
    ingest((failures as DeliveryRecord[]) || [], true);
    ingest((successes as DeliveryRecord[]) || [], false);
    let rows = Array.from(map.values());
    if (filter === 'failed') rows = rows.filter((r) => r.failed > 0);
    if (filter === 'success') rows = rows.filter((r) => r.sent > 0 && r.failed === 0);
    return rows;
  }, [failures, successes, filter]);

  const totals = useMemo(() => {
    const f = (Array.isArray(failures) ? failures : []).length;
    const s = (Array.isArray(successes) ? successes : []).length;
    return { sent: s, failed: f, bundles: grouped.length };
  }, [failures, successes, grouped]);

  const columns: ColumnDef<GroupedRow>[] = [
    {
      header: 'Notification ID',
      accessorFn: (item) => item.notificationId,
      enableColumnFilter: true,
      cell: ({ row }) => <span className="text-xs">{row.original.notificationId}</span>,
    },
    {
      header: 'Type',
      accessorFn: (item) => item.type,
      enableSorting: true,
      cell: ({ row }) => <span className="text-xs capitalize">{row.original.type || '—'}</span>,
    },
    { header: 'Targets', accessorFn: (item) => item.targets, enableSorting: true },
    { header: 'Platforms', accessorFn: (item) => item.platforms, cell: ({ row }) => <span className="text-xs">{row.original.platforms || '—'}</span> },
    {
      header: 'Sent',
      accessorFn: (item) => item.sent,
      enableSorting: true,
      cell: ({ row }) => <Badge className="bg-green-100 text-green-700 border-green-300">{row.original.sent}</Badge>,
    },
    {
      header: 'Failed',
      accessorFn: (item) => item.failed,
      enableSorting: true,
      cell: ({ row }) =>
        row.original.failed > 0 ? (
          <Badge className="bg-red-100 text-red-700 border-red-300">{row.original.failed}</Badge>
        ) : (
          <span className="text-xs text-gray-400">0</span>
        ),
    },
    {
      header: 'Last Error',
      accessorFn: (item) => item.lastError,
      cell: ({ row }) => <span className="text-xs text-red-600 max-w-[180px] block truncate">{row.original.lastError || '—'}</span>,
    },
    {
      header: 'Action',
      accessorFn: () => '',
      cell: ({ row }) =>
        row.original.failed > 0 ? (
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7"
            disabled={retryMutation.isPending}
            onClick={() => retryMutation.mutate(row.original.notificationId)}
          >
            Retry
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totals.bundles}</div>
            <div className="text-sm text-gray-500">Notification Bundles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{totals.sent}</div>
            <div className="text-sm text-gray-500">Sent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{totals.failed}</div>
            <div className="text-sm text-gray-500">Failed</div>
          </CardContent>
        </Card>
      </div>

      <EnhancedTable
        data={grouped}
        columns={columns}
        title="Notification Delivery Monitoring"
        searchPlaceholder="Search notification IDs..."
        isLoading={loadingF || loadingS}
        itemsPerPageOptions={[10, 25, 50, 100]}
        defaultItemsPerPage={25}
        headerActions={
          <Select value={filter} onValueChange={(v) => setFilter(v as 'all' | 'failed' | 'success')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="failed">Failed only</SelectItem>
              <SelectItem value="success">Success only</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
};

export default NotificationMonitoringTab;
