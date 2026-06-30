import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedTable, ColumnDef } from '@/components/ui/enhanced-table';
import {
  fetchPlanEnquiries,
  updatePlanEnquiryStatus,
  PLAN_ENQUIRY_STATUS_OPTIONS,
  type PlanEnquiry,
  type PlanEnquiryStatus,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from './ui/loading-spinner';

interface RowState {
  planEnquiryStatus: PlanEnquiryStatus;
  planEnquiryComments: string;
  planEnquiryFollowUpDateTime: string;
  planEnquiryFollowUpComments: string;
}

const statusColor = (status?: string) => {
  switch (status) {
    case 'pending':
      return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'contacted':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'followup':
      return 'bg-purple-100 text-purple-700 border-purple-300';
    case 'closed':
      return 'bg-green-100 text-green-700 border-green-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const PlanEnquiriesTab: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rowState, setRowState] = useState<Record<string, RowState>>({});

  const { data: enquiries, isLoading } = useQuery({
    queryKey: ['planEnquiries'],
    queryFn: () => fetchPlanEnquiries(500),
  });

  useEffect(() => {
    if (Array.isArray(enquiries)) {
      const next: Record<string, RowState> = {};
      enquiries.forEach((e: PlanEnquiry) => {
        next[e.id] = {
          planEnquiryStatus: (e.planEnquiryStatus as PlanEnquiryStatus) || 'pending',
          planEnquiryComments: e.planEnquiryComments || '',
          planEnquiryFollowUpDateTime: e.planEnquiryFollowUpDateTime || '',
          planEnquiryFollowUpComments: e.planEnquiryFollowUpComments || '',
        };
      });
      setRowState(next);
    }
  }, [enquiries]);

  const mutation = useMutation({
    mutationFn: ({ id, update }: { id: string; update: RowState }) =>
      updatePlanEnquiryStatus(id, update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planEnquiries'] });
      toast({ title: 'Success', description: 'Enquiry updated successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update enquiry',
        variant: 'destructive',
      });
    },
  });

  const patchRow = (id: string, patch: Partial<RowState>) => {
    setRowState((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const columns: ColumnDef<PlanEnquiry>[] = [
    {
      header: 'Customer',
      accessorFn: (item) => `${item.customerName || ''} ${item.customerUserId || ''} ${item.customerMobileNumber || ''}`,
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => {
        const e = row.original;
        return (
          <div className="space-y-0.5 min-w-[140px]">
            <div className="font-medium capitalize">{e.customerName || '—'}</div>
            <div className="text-xs text-gray-500">#{e.customerUserId || '—'}</div>
            <div className="text-xs text-gray-500">{e.customerMobileNumber || '—'}</div>
          </div>
        );
      },
    },
    {
      header: 'Plan',
      accessorFn: (item) => `${item.planName || ''} ${item.planAmount || ''}`,
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => {
        const e = row.original;
        return (
          <div className="space-y-0.5">
            <div className="font-medium">{e.planName || '—'}</div>
            <div className="text-xs text-gray-500">{e.planAmount ? `₹${e.planAmount}` : '—'}</div>
          </div>
        );
      },
    },
    {
      header: 'Enquiry Date',
      accessorFn: (item) => item.planEnquiryDateTime || '',
      enableSorting: true,
      cell: ({ row }) => <div className="text-xs">{row.original.planEnquiryDateTime || '—'}</div>,
    },
    {
      header: 'Status',
      accessorFn: (item) => item.planEnquiryStatus || 'pending',
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => {
        const e = row.original;
        const state = rowState[e.id];
        return (
          <div className="space-y-2 min-w-[130px]">
            <Badge className={statusColor(e.planEnquiryStatus)}>{e.planEnquiryStatus || 'pending'}</Badge>
            <Select
              value={state?.planEnquiryStatus}
              onValueChange={(v) => patchRow(e.id, { planEnquiryStatus: v as PlanEnquiryStatus })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {PLAN_ENQUIRY_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      },
    },
    {
      header: 'Comments',
      accessorFn: (item) => item.planEnquiryComments || '',
      cell: ({ row }) => {
        const e = row.original;
        const state = rowState[e.id];
        return (
          <Textarea
            value={state?.planEnquiryComments || ''}
            onChange={(ev) => patchRow(e.id, { planEnquiryComments: ev.target.value })}
            className="min-w-[160px] text-xs"
            rows={2}
          />
        );
      },
    },
    {
      header: 'Follow Up',
      accessorFn: (item) => item.planEnquiryFollowUpDateTime || '',
      cell: ({ row }) => {
        const e = row.original;
        const state = rowState[e.id];
        return (
          <div className="space-y-1 min-w-[180px]">
            <Input
              type="datetime-local"
              value={state?.planEnquiryFollowUpDateTime || ''}
              onChange={(ev) => patchRow(e.id, { planEnquiryFollowUpDateTime: ev.target.value })}
              className="h-8 text-xs"
            />
            <Textarea
              value={state?.planEnquiryFollowUpComments || ''}
              onChange={(ev) => patchRow(e.id, { planEnquiryFollowUpComments: ev.target.value })}
              placeholder="Follow up comments"
              className="text-xs"
              rows={2}
            />
          </div>
        );
      },
    },
    {
      header: 'Action By',
      accessorFn: (item) => item.planEnquiryActionByAdminId || '',
      cell: ({ row }) => (
        <div className="text-xs space-y-0.5 min-w-[120px]">
          <div>{row.original.planEnquiryActionByAdminId || '—'}</div>
          <div className="text-gray-400">{row.original.planEnquiryActionDateTime || ''}</div>
        </div>
      ),
    },
    {
      header: 'Update',
      accessorFn: () => '',
      cell: ({ row }) => {
        const e = row.original;
        return (
          <Button
            size="sm"
            className="bg-pink-600 hover:bg-pink-700 text-xs h-8"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate({ id: e.id, update: rowState[e.id] })}
          >
            Save
          </Button>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <LoadingSpinner size={48} />
        <span className="mt-3 text-pink-500">Loading plan enquiries...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EnhancedTable
        data={enquiries || []}
        columns={columns}
        title="Plan Enquiries"
        searchPlaceholder="Search enquiries..."
        isLoading={isLoading}
        itemsPerPageOptions={[10, 25, 50, 100]}
        defaultItemsPerPage={25}
      />
    </div>
  );
};

export default PlanEnquiriesTab;
