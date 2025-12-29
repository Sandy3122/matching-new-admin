import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { searchEmployees } from '@/lib/api';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  Briefcase, 
  FileText,
  Shield,
  Hash
} from 'lucide-react';

interface Employee {
  firstName: string;
  lastName: string;
  gender: string;
  maritalStatus: string;
  dateOfBirth: string;
  accountCreatedDateTime: string;
  employeeId: string;
  email: string;
  phoneNumber: string;
  emergencyPhoneNumber: string;
  kycDocumentType: string;
  designation: string;
  joiningDate: string;
  photoUrl: string;
  resumeUrl: string;
  kycDocumentUrl: string;
  role: string;
  accountStatus: string;
}

const EmployeeCard: React.FC<{ employee: Employee }> = ({ employee }) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB');
    } catch {
      return dateString;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-300';
      case 'manager': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'user': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-700 border-green-300'
      : 'bg-red-100 text-red-700 border-red-300';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={employee.photoUrl} alt={`${employee.firstName} ${employee.lastName}`} />
            <AvatarFallback className="bg-pink-100 text-pink-600 text-lg font-semibold">
              {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {employee.firstName} {employee.lastName}
                </h3>
                <p className="text-gray-600 capitalize">{employee.designation}</p>
              </div>
              <div className="flex space-x-2">
                <Badge className={getRoleBadgeColor(employee.role)}>
                  <Shield className="w-3 h-3 mr-1" />
                  {employee.role}
                </Badge>
                <Badge className={getStatusBadgeColor(employee.accountStatus)}>
                  {employee.accountStatus}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Hash className="w-4 h-4 mr-2 text-pink-500" />
                  <span className="font-medium">Employee ID:</span>
                  <span className="ml-1 font-mono">{employee.employeeId}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2 text-pink-500" />
                  <span className="font-medium">Email:</span>
                  <span className="ml-1">{employee.email}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2 text-pink-500" />
                  <span className="font-medium">Phone:</span>
                  <span className="ml-1">{employee.phoneNumber}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2 text-pink-500" />
                  <span className="font-medium">Emergency:</span>
                  <span className="ml-1">{employee.emergencyPhoneNumber}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2 text-pink-500" />
                  <span className="font-medium">Gender:</span>
                  <span className="ml-1 capitalize">{employee.gender}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-pink-500" />
                  <span className="font-medium">DOB:</span>
                  <span className="ml-1">{formatDate(employee.dateOfBirth)}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Briefcase className="w-4 h-4 mr-2 text-pink-500" />
                  <span className="font-medium">Joined:</span>
                  <span className="ml-1">{formatDate(employee.joiningDate)}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <FileText className="w-4 h-4 mr-2 text-pink-500" />
                  <span className="font-medium">KYC:</span>
                  <span className="ml-1 capitalize">{employee.kycDocumentType.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              {employee.resumeUrl && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(employee.resumeUrl, '_blank')}
                  className="text-pink-600 border-pink-300 hover:bg-pink-50"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  View Resume
                </Button>
              )}
              {employee.kycDocumentUrl && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(employee.kycDocumentUrl, '_blank')}
                  className="text-pink-600 border-pink-300 hover:bg-pink-50"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  View KYC
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EmployeeSearchTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [shouldSearch, setShouldSearch] = useState(false);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['employeeSearch', searchQuery],
    queryFn: () => searchEmployees(searchQuery),
    enabled: shouldSearch && searchQuery.length > 0,
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShouldSearch(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-pink-600">Employee Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex space-x-4">
            <Input
              placeholder="Search employees by name, ID, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch}
              className="bg-pink-600 hover:bg-pink-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchResults && searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Search Results ({searchResults.length} found)
            </h3>
          </div>
          
          <div className="space-y-4">
            {searchResults.map((employee: Employee) => (
              <EmployeeCard key={employee.employeeId} employee={employee} />
            ))}
          </div>
        </div>
      )}

      {searchResults && searchResults.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No employees found matching your search criteria.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmployeeSearchTab;
