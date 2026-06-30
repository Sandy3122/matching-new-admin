import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedTable, ColumnDef } from '@/components/ui/enhanced-table';
import { fetchEventNotificationLogs } from '@/lib/api';

interface EventLog {
  id?: string;
  notificationId?: string;
  type?: string;
  userId?: string;
  status?: string;
  platform?: string;
  error?: string;
  [key: string]: unknown;
}

const statusColor = (status?: string) => {
  switch (status) {
    case 'sent':
    case 'opened':
    case 'clicked':
    case 'read':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'failed':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'pending':
      return 'bg-orange-100 text-orange-700 border-orange-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const NotificationEventLogsTab: React.FC = () => {
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [limit, setLimit] = useState('100');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['eventLogs', type, status, limit],
    queryFn: () =>
      fetchEventNotificationLogs({
        type: type === 'all' ? undefined : type,
        status: status === 'all' ? undefined : status,
        limit: Number(limit) || 100,
      }),
  });

  const columns: ColumnDef<EventLog>[] = [
    {
      header: 'Notification ID',
      accessorFn: (item) => item.notificationId || item.id || '',
      enableColumnFilter: true,
      cell: ({ row }) => <span className="text-xs">{row.original.notificationId || row.original.id}</span>,
    },
    {
      header: 'Type',
      accessorFn: (item) => item.type || '',
      enableSorting: true,
      cell: ({ row }) => <span className="text-xs capitalize">{row.original.type || '—'}</span>,
    },
    {
      header: 'User',
      accessorFn: (item) => item.userId || '',
      enableColumnFilter: true,
      cell: ({ row }) => <span className="text-xs">{row.original.userId || '—'}</span>,
    },
    {
      header: 'Status',
      accessorFn: (item) => item.status || '',
      enableSorting: true,
      cell: ({ row }) => <Badge className={statusColor(row.original.status)}>{row.original.status || '—'}</Badge>,
    },
    {
      header: 'Platform',
      accessorFn: (item) => item.platform || '',
      cell: ({ row }) => <span className="text-xs">{row.original.platform || '—'}</span>,
    },
    {
      header: 'Error',
      accessorFn: (item) => item.error || '',
      cell: ({ row }) => <span className="text-xs text-red-600 max-w-[200px] block truncate">{row.original.error || '—'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label>Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="new_match">New Match</SelectItem>
              <SelectItem value="profile_visit">Profile Visit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="opened">Opened</SelectItem>
              <SelectItem value="clicked">Clicked</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="limit">Limit</Label>
          <Input
            id="limit"
            type="number"
            min={1}
            max={500}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="w-[100px]"
          />
        </div>
      </div>

      <EnhancedTable
        data={(logs as EventLog[]) || []}
        columns={columns}
        title="Event Notification Logs"
        searchPlaceholder="Search logs..."
        isLoading={isLoading}
        itemsPerPageOptions={[10, 25, 50, 100]}
        defaultItemsPerPage={25}
      />
    </div>
  );
};

export default NotificationEventLogsTab;
