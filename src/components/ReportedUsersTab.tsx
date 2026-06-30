import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { EnhancedTable, ColumnDef } from '@/components/ui/enhanced-table';
import { fetchReportedUsers, updateReportAction, type ReportedUser, type UserReport } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from './ui/loading-spinner';
import { ShieldAlert } from 'lucide-react';

const ACTION_STATUS_OPTIONS = ['pending', 'reviewed', 'actioned', 'dismissed'];

const statusColor = (status?: string) => {
  switch (status) {
    case 'pending':
      return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'reviewed':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'actioned':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'dismissed':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const ReportedUsersTab: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<ReportedUser | null>(null);
  const [draft, setDraft] = useState<Record<string, { actionStatus: string; actionRemarks: string }>>({});

  const { data: reportedUsers, isLoading } = useQuery({
    queryKey: ['reportedUsers'],
    queryFn: fetchReportedUsers,
  });

  const mutation = useMutation({
    mutationFn: updateReportAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportedUsers'] });
      toast({ title: 'Success', description: 'Report action updated' });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update report action',
        variant: 'destructive',
      });
    },
  });

  const openReports = (user: ReportedUser) => {
    const next: Record<string, { actionStatus: string; actionRemarks: string }> = {};
    user.reportedBy.forEach((r) => {
      next[r.reporterId] = {
        actionStatus: r.actionStatus || 'pending',
        actionRemarks: r.actionRemarks || '',
      };
    });
    setDraft(next);
    setSelected(user);
  };

  const handleSaveReport = (report: UserReport) => {
    if (!selected) return;
    const d = draft[report.reporterId];
    mutation.mutate({
      reportedUserId: selected.id,
      reporterId: report.reporterId,
      actionStatus: d.actionStatus,
      actionRemarks: d.actionRemarks,
    });
  };

  const columns: ColumnDef<ReportedUser>[] = [
    {
      header: 'Reported User',
      accessorFn: (item) => `${item.firstName || ''} ${item.lastName || ''} ${item.customerId || ''}`,
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="space-y-0.5">
            <div className="font-medium capitalize">
              {u.firstName} {u.lastName}
            </div>
            <div className="text-xs text-gray-500">#{u.customerId || u.id}</div>
            <div className="text-xs text-gray-500">{u.registeredMobileNumber}</div>
          </div>
        );
      },
    },
    {
      header: 'Reports',
      accessorFn: (item) => item.reportedBy.length,
      enableSorting: true,
      cell: ({ row }) => (
        <Badge className="bg-red-100 text-red-700 border-red-300">
          {row.original.reportedBy.length} report(s)
        </Badge>
      ),
    },
    {
      header: 'Pending',
      accessorFn: (item) => item.reportedBy.filter((r) => (r.actionStatus || 'pending') === 'pending').length,
      enableSorting: true,
      cell: ({ row }) => {
        const pending = row.original.reportedBy.filter((r) => (r.actionStatus || 'pending') === 'pending').length;
        return pending > 0 ? (
          <Badge className="bg-orange-100 text-orange-700 border-orange-300">{pending} pending</Badge>
        ) : (
          <Badge className="bg-green-100 text-green-700 border-green-300">resolved</Badge>
        );
      },
    },
    {
      header: 'Actions',
      accessorFn: () => '',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          className="text-pink-600 border-pink-300 hover:bg-pink-50 text-xs h-8"
          onClick={() => openReports(row.original)}
        >
          <ShieldAlert className="w-3 h-3 mr-1" />
          View Reports
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <LoadingSpinner size={48} />
        <span className="mt-3 text-pink-500">Loading reported users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EnhancedTable
        data={reportedUsers || []}
        columns={columns}
        title="Reported Users"
        searchPlaceholder="Search reported users..."
        isLoading={isLoading}
        itemsPerPageOptions={[10, 25, 50, 100]}
        defaultItemsPerPage={25}
      />

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Reports against {selected?.firstName} {selected?.lastName}
            </DialogTitle>
            <DialogDescription>Review each report and record an action.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selected?.reportedBy.map((report, idx) => (
              <div key={`${report.reporterId}-${idx}`} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">Reported by:</span> {report.reporterName} (#{report.reporterId})
                  </div>
                  <Badge className={statusColor(report.actionStatus)}>{report.actionStatus || 'pending'}</Badge>
                </div>
                <div className="text-xs text-gray-500">{report.reportedDateAndTime}</div>
                <div className="text-sm bg-gray-50 rounded p-2">{report.reportedComment}</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Action Status</label>
                    <Select
                      value={draft[report.reporterId]?.actionStatus}
                      onValueChange={(v) =>
                        setDraft((prev) => ({
                          ...prev,
                          [report.reporterId]: { ...prev[report.reporterId], actionStatus: v },
                        }))
                      }
                    >
                      <SelectTrigger className="h-9 text-sm mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50">
                        {ACTION_STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Action Remarks</label>
                    <Textarea
                      value={draft[report.reporterId]?.actionRemarks || ''}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          [report.reporterId]: { ...prev[report.reporterId], actionRemarks: e.target.value },
                        }))
                      }
                      className="text-sm mt-1"
                      rows={2}
                    />
                  </div>
                </div>
                {report.actionDateAndTime && (
                  <div className="text-xs text-gray-400">Last action: {report.actionDateAndTime}</div>
                )}
                <Button
                  size="sm"
                  className="bg-pink-600 hover:bg-pink-700"
                  disabled={mutation.isPending}
                  onClick={() => handleSaveReport(report)}
                >
                  {mutation.isPending ? 'Saving...' : 'Save Action'}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportedUsersTab;
