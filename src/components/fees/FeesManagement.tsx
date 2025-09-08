import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Plus,
  Search,
  Filter,
  Download,
  AlertTriangle,
  DollarSign,
  Users,
  TrendingUp,
  CreditCard,
  Settings,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useGetFeeRecordsQuery } from '@/store/api/feesApi';
import { useGetStudentsQuery } from '@/store/api/studentsApi';
import { RootState } from '@/store';
import { AddFeeModal } from './AddFeeModal';
import { CollectFeeModal } from './CollectFeeModal';
import { FeeStructureModal } from './FeeStructureModal';
import { ClassFeeStructureModal } from './ClassFeeStructureModal';

export const FeesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [addFeeModalOpen, setAddFeeModalOpen] = useState(false);
  const [collectFeeModalOpen, setCollectFeeModalOpen] = useState(false);
  const [feeStructureModalOpen, setFeeStructureModalOpen] = useState(false);
  const [classFeeStructureModalOpen, setClassFeeStructureModalOpen] = useState(false);
  const { toast } = useToast();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'admin';
  
  const { data: feeRecordsResponse } = useGetFeeRecordsQuery({});
  const { data: studentsResponse } = useGetStudentsQuery({ page: 1, limit: 1000 });
  
  const feeRecords = feeRecordsResponse?.data || [];
  const students = studentsResponse?.data?.data || [];

  // Calculate fee statistics
  const totalCollected = feeRecords.reduce((sum, record) => sum + record.paidAmount, 0);
  const totalPending = feeRecords.reduce((sum, record) => sum + record.dueAmount, 0);
  const totalStudents = feeRecords.length;
  // Calculate late submitters based on selected period
  const calculateLateSubmitters = () => {
    const now = new Date();
    return feeRecords.filter(record => {
      if (record.status === 'paid' || record.dueAmount === 0) return false;
      
      if (selectedPeriod === 'all') {
        // Show overdue or those with no payment for 30+ days
        return record.status === 'overdue' || 
               (record.dueAmount > 0 && new Date(record.lastPaymentDate || 0) < new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
      }
      
      // Filter by specific collection period
      if (selectedPeriod !== record.collectionPeriod) return false;
      
      if (record.nextDueDate) {
        return new Date(record.nextDueDate) < now;
      }
      
      return record.status === 'overdue';
    });
  };

  const lateSubmitters = calculateLateSubmitters();

  // Filter fee records
  const filteredRecords = feeRecords.filter(record => {
    const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || record.grade === selectedGrade;
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    const matchesPeriod = selectedPeriod === 'all' || record.collectionPeriod === selectedPeriod;
    
    return matchesSearch && matchesGrade && matchesStatus && matchesPeriod;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'partial': return 'secondary';
      case 'overdue': return 'destructive';
      default: return 'outline';
    }
  };

  const exportData = () => {
    toast({
      title: "Export Started",
      description: "Fee report is being generated...",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fee Management</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage student fees, payments, and track collections' : 'View fee status and payment history'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={() => setClassFeeStructureModalOpen(true)} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            View Fee Structure
          </Button>
          {isAdmin && (
            <>
              <Button onClick={() => setCollectFeeModalOpen(true)} variant="outline">
                <CreditCard className="w-4 h-4 mr-2" />
                Collect Fee
              </Button>
              <Button onClick={() => setFeeStructureModalOpen(true)} variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Manage Structure
              </Button>
              <Button onClick={() => setAddFeeModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Fee
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'hsl(var(--success))' }}>₹{totalCollected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This academic year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">₹{totalPending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Outstanding dues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Fee records tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Submitters</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'hsl(var(--warning))' }}>{lateSubmitters.length}</div>
            <p className="text-xs text-muted-foreground">Students with overdue fees</p>
          </CardContent>
        </Card>
      </div>

      {/* Late Submitters Alert */}
      {isAdmin && lateSubmitters.length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Late Fee Submitters ({lateSubmitters.length})
            </CardTitle>
            <CardDescription>
              Students with overdue fee payments that require immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lateSubmitters.slice(0, 10).map((record) => (
                <Badge key={record.id} variant="destructive">
                  {record.studentName} - ₹{record.dueAmount}
                </Badge>
              ))}
              {lateSubmitters.length > 10 && (
                <Badge variant="outline">+{lateSubmitters.length - 10} more</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Records</CardTitle>
          <CardDescription>Search and filter student fee information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by student name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="1">Grade 1</SelectItem>
                <SelectItem value="2">Grade 2</SelectItem>
                <SelectItem value="3">Grade 3</SelectItem>
                <SelectItem value="4">Grade 4</SelectItem>
                <SelectItem value="5">Grade 5</SelectItem>
                <SelectItem value="6">Grade 6</SelectItem>
                <SelectItem value="7">Grade 7</SelectItem>
                <SelectItem value="8">Grade 8</SelectItem>
                <SelectItem value="9">Grade 9</SelectItem>
                <SelectItem value="10">Grade 10</SelectItem>
                <SelectItem value="11">Grade 11</SelectItem>
                <SelectItem value="12">Grade 12</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fee Records Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Collection Period</TableHead>
                  <TableHead>Total Fee</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Due Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.studentName}</div>
                        <div className="text-sm text-muted-foreground">ID: {record.studentId}</div>
                      </div>
                    </TableCell>
                    <TableCell>{record.grade}</TableCell>
                    <TableCell>{record.academicYear}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {record.collectionPeriod.charAt(0).toUpperCase() + record.collectionPeriod.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{record.totalFee.toLocaleString()}</TableCell>
                    <TableCell className="text-emerald-600">₹{record.paidAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-red-600">₹{record.dueAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.nextDueDate 
                        ? new Date(record.nextDueDate).toLocaleDateString()
                        : 'Not set'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No fee records found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {isAdmin && (
        <>
          <AddFeeModal 
            isOpen={addFeeModalOpen}
            onClose={() => setAddFeeModalOpen(false)}
            students={students}
          />
          <CollectFeeModal 
            isOpen={collectFeeModalOpen}
            onClose={() => setCollectFeeModalOpen(false)}
            students={students}
          />
          <FeeStructureModal 
            isOpen={feeStructureModalOpen}
            onClose={() => setFeeStructureModalOpen(false)}
          />
        </>
      )}
      <ClassFeeStructureModal 
        isOpen={classFeeStructureModalOpen}
        onClose={() => setClassFeeStructureModalOpen(false)}
      />
    </div>
  );
};