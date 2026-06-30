import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedTable, ColumnDef } from '@/components/ui/enhanced-table';
import { fetchAllUsers, fetchProfilePdfData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from './ui/loading-spinner';
import { FileDown } from 'lucide-react';

interface AppUser {
  id: string;
  data: {
    customerId?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    registeredMobileNumber?: string;
    accountVerificationStatus?: string;
    accountCreatedBy?: string;
  };
}

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const buildProfileHtml = (profile: any): string => {
  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
  const rows: [string, unknown][] = [
    ['Profile ID', profile.customerId || profile.id],
    ['Name', fullName],
    ['Date of Birth', profile.dateOfBirth],
    ['Birth Place', profile.birthPlace],
    ['Time of Birth', profile.timeOfBirth],
    ['Height', profile.height],
    ['Marital Status', profile.maritalStatus],
    ['Manglik Status', profile.manglikStatus],
    ['Religion', profile.religion],
    ['Caste', profile.caste],
    ['Diet', profile.diet],
    ['Drink', profile.drink],
    ['Smoke', profile.smoke],
    ['Education Level', profile.educationLevel],
    ['Education Field', profile.educationField],
    ['Working With', profile.workingWith],
    ['Designation', profile.designation],
    ['Annual Income', profile.annualIncome],
    ['Primary Guardian', profile.primaryGuardian?.name || profile.primaryGuardian],
    ['Secondary Guardian', profile.secondaryGuardian?.name || profile.secondaryGuardian],
    ['No. of Brothers', profile.noOfBrothers],
    ['Brothers Married', profile.noOfBrothersMarried],
    ['No. of Sisters', profile.noOfSisters],
    ['Sisters Married', profile.noOfSistersMarried],
  ];

  const imgList = Array.isArray(profile.imgList) ? profile.imgList : [];
  const profileImg = imgList[5]?.imgUrl || imgList.find((i: any) => i?.imgUrl)?.imgUrl || '';

  return `
    <div class="profile">
      <h1>MatchingJodi.Com — Profile</h1>
      ${profileImg ? `<img class="photo" src="${escapeHtml(profileImg)}" alt="Profile" />` : ''}
      ${profile.aboutMeDescription ? `<p class="about"><strong>About:</strong> ${escapeHtml(profile.aboutMeDescription)}</p>` : ''}
      <table>
        ${rows
          .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
          .map(([label, v]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(v)}</td></tr>`)
          .join('')}
      </table>
    </div>
  `;
};

const printHtml = (innerHtml: string, title: string) => {
  const win = window.open('', '_blank', 'width=900,height=1000');
  if (!win) {
    throw new Error('Popup blocked. Please allow popups to generate the PDF.');
  }
  win.document.write(`<!DOCTYPE html><html><head><title>${escapeHtml(title)}</title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; color: #222; padding: 24px; }
      h1 { color: #db2777; font-size: 20px; border-bottom: 2px solid #db2777; padding-bottom: 8px; }
      .profile { page-break-after: always; margin-bottom: 32px; }
      .photo { width: 140px; height: auto; border-radius: 6px; margin: 12px 0; }
      .about { font-size: 13px; margin: 8px 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { text-align: left; padding: 6px 10px; border: 1px solid #e5e7eb; font-size: 13px; }
      th { background: #fce7f3; width: 35%; text-transform: capitalize; }
    </style></head><body>${innerHtml}
    <script>window.onload = function(){ window.print(); }</script>
    </body></html>`);
  win.document.close();
};

const GeneratePdfsTab: React.FC = () => {
  const { toast } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['pdfUsers'],
    queryFn: fetchAllUsers,
  });

  const generateOne = async (userId: string) => {
    setBusyId(userId);
    try {
      const profile = await fetchProfilePdfData(userId);
      const data = Array.isArray(profile) ? profile[0] : profile?.data || profile;
      printHtml(buildProfileHtml(data || {}), `profile_${userId}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate PDF',
        variant: 'destructive',
      });
    } finally {
      setBusyId(null);
    }
  };

  const generateAll = async () => {
    if (!Array.isArray(users) || users.length === 0) return;
    setBulkBusy(true);
    try {
      const profiles = await Promise.all(
        users.map(async (u: AppUser) => {
          try {
            const p = await fetchProfilePdfData(u.id);
            return Array.isArray(p) ? p[0] : p?.data || p;
          } catch {
            return null;
          }
        }),
      );
      const html = profiles.filter(Boolean).map((p) => buildProfileHtml(p)).join('');
      printHtml(html, 'all_profiles');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate PDFs',
        variant: 'destructive',
      });
    } finally {
      setBulkBusy(false);
    }
  };

  const columns: ColumnDef<AppUser>[] = [
    {
      header: 'User ID',
      accessorFn: (item) => item.id,
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => <span className="text-sm">{row.original.id}</span>,
    },
    {
      header: 'Name',
      accessorFn: (item) => `${item.data?.firstName || ''} ${item.data?.lastName || ''}`,
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => (
        <span className="capitalize font-medium">
          {row.original.data?.firstName} {row.original.data?.lastName}
        </span>
      ),
    },
    {
      header: 'Phone',
      accessorFn: (item) => item.data?.registeredMobileNumber || '',
      enableColumnFilter: true,
      cell: ({ row }) => <span className="text-sm">{row.original.data?.registeredMobileNumber}</span>,
    },
    {
      header: 'Email',
      accessorFn: (item) => item.data?.email || '',
      enableColumnFilter: true,
      cell: ({ row }) => <span className="text-sm">{row.original.data?.email}</span>,
    },
    {
      header: 'Verification',
      accessorFn: (item) => item.data?.accountVerificationStatus || '',
      enableSorting: true,
      cell: ({ row }) => (
        <Badge className="capitalize bg-gray-100 text-gray-700 border-gray-300">
          {row.original.data?.accountVerificationStatus || 'pending'}
        </Badge>
      ),
    },
    {
      header: 'Generate PDF',
      accessorFn: () => '',
      cell: ({ row }) => (
        <Button
          size="sm"
          className="bg-pink-600 hover:bg-pink-700 text-xs h-8"
          disabled={busyId === row.original.id}
          onClick={() => generateOne(row.original.id)}
        >
          <FileDown className="w-3 h-3 mr-1" />
          {busyId === row.original.id ? 'Generating...' : 'PDF'}
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <LoadingSpinner size={48} />
        <span className="mt-3 text-pink-500">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EnhancedTable
        data={users || []}
        columns={columns}
        title="Generate Profile PDFs"
        searchPlaceholder="Search users..."
        isLoading={isLoading}
        itemsPerPageOptions={[10, 25, 50, 100]}
        defaultItemsPerPage={25}
        headerActions={
          <Button
            className="bg-pink-600 hover:bg-pink-700"
            disabled={bulkBusy}
            onClick={generateAll}
          >
            <FileDown className="w-4 h-4 mr-2" />
            {bulkBusy ? 'Generating All...' : 'Generate All PDFs'}
          </Button>
        }
      />
    </div>
  );
};

export default GeneratePdfsTab;
