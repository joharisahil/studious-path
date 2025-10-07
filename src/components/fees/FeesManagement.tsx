import { useState, useEffect } from 'react';
import axios from 'axios';
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
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { AddFeeModal } from './AddFeeModal';
import { CollectFeeModal } from './CollectFeeModal';
import { FeeStructureModal } from './FeeStructureModal';
import { ClassFeeStructureModal } from './ClassFeeStructureModal';
import { PrintReceiptModal } from './PrintReceiptModal';
import { ViewFeeStructure } from './ViewFeeStructure';
import { getAllClasses } from '@/services/ClassesApi';
import { getAllFeeStructures } from '@/services/FeesApi';

interface ClassType {
  _id: string;
  grade: string;
  section: string;
}

interface FeeRecord {
  id: string;
  studentName: string;
  studentId: string;
  grade: string;
  academicYear: string;
  collectionPeriod: string;
  totalFee?: number;
  paidAmount?: number;
  dueAmount?: number;
  status: string;
  nextDueDate?: string;
  payments?: { id: string; amount: number; date: string }[];
}

export const FeesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const [classes, setClasses] = useState<ClassType[]>([]);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [feeStructures, setFeeStructures] = useState<any[]>([]);

  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingFees, setLoadingFees] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [addFeeModalOpen, setAddFeeModalOpen] = useState(false);
  const [collectFeeModalOpen, setCollectFeeModalOpen] = useState(false);
  const [feeStructureModalOpen, setFeeStructureModalOpen] = useState(false);
  const [classFeeStructureModalOpen, setClassFeeStructureModalOpen] = useState(false);
  const [printReceiptModalOpen, setPrintReceiptModalOpen] = useState(false);
  const [viewFeeStructureModalOpen, setViewFeeStructureModalOpen] = useState(false);

  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<any>(null);

  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'admin';

  /** Fetch Classes */
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        const data = await getAllClasses();
        setClasses(data);
      } catch (err) {
        console.error('Error fetching classes:', err);
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  /** Fetch Students */
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        const res = await axios.get('/api/students');
        setStudents(res.data?.students || []);
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  /** Fetch Fee Records */
  useEffect(() => {
    const fetchFees = async () => {
      try {
        setLoadingFees(true);
        const res = await axios.get('/api/fees');
        setFeeRecords(res.data?.data || []);
      } catch (err) {
        console.error('Error fetching fee records:', err);
      } finally {
        setLoadingFees(false);
      }
    };
    fetchFees();
  }, []);

  /** Fetch Fee Structures */
/** Fetch Fee Structures and add className */
useEffect(() => {
  const fetchFeeStructures = async () => {
    try {
      const data = await getAllFeeStructures();
      if (data && Array.isArray(data)) {
        const mapped = data.map((fs: any) => {
          const cls = classes.find(c => c._id === fs.classId._id);
          return {
            ...fs,
            className: cls ? `${cls.grade} ${cls.section}` : "Unknown Class",
          };
        });
        setFeeStructures(mapped);
      } else {
        setFeeStructures([]);
      }
    } catch (err) {
      console.error("Error fetching fee structures:", err);
    }
  };
  if (classes.length > 0) fetchFeeStructures(); // Ensure classes are loaded first
}, [classes]);


  /** Calculated Statistics */
  const totalCollected = feeRecords.reduce((sum, r) => sum + (r.paidAmount || 0), 0);
  const totalPending = feeRecords.reduce((sum, r) => sum + (r.dueAmount || 0), 0);
  const totalStudents = feeRecords.length;

  const lateSubmitters = feeRecords.filter(r => {
    if (!r || r.status === 'paid' || r.dueAmount === 0) return false;
    const now = new Date();
    if (selectedPeriod !== 'all' && selectedPeriod !== r.collectionPeriod) return false;
    return r.nextDueDate ? new Date(r.nextDueDate) < now : r.status === 'overdue';
  });

  /** Filtered Fee Records */
  const filteredRecords = feeRecords.filter(r => {
    const matchesSearch =
      r.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || r.grade === selectedGrade;
    const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
    const matchesPeriod = selectedPeriod === 'all' || r.collectionPeriod === selectedPeriod;
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
  const getClassName = (id: string) => {
  const cls = classes.find(c => c._id === id);
  return cls ? cls.name : "Unknown Class";
};

  return (
    <div className="space-y-8">
      {/* Header & Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold">Fee Management</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage student fees, payments, and track collections' : 'View fee status and payment history'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => alert('Export feature')} variant="outline">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>

          <Button onClick={() => setClassFeeStructureModalOpen(true)} variant="outline">
            <Eye className="w-4 h-4 mr-2" /> View Class Fee Structure
          </Button>

          {isAdmin && (
            <>
              <Button onClick={() => setCollectFeeModalOpen(true)} variant="outline">
                <CreditCard className="w-4 h-4 mr-2" /> Collect Fee
              </Button>
              <Button onClick={() => setFeeStructureModalOpen(true)} variant="outline">
                <Settings className="w-4 h-4 mr-2" /> Create Fee Structure
              </Button>
              <Button onClick={() => setAddFeeModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Fee
              </Button>
              <Button
                onClick={() => setViewFeeStructureModalOpen(true)}
                variant="outline"
              >
                <Eye className="w-4 h-4 mr-2" /> View All Structures
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalCollected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This academic year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalPending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Outstanding dues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Fee records tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Late Submitters</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lateSubmitters.length}</div>
            <p className="text-xs text-muted-foreground">Students with overdue fees</p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Records</CardTitle>
          <CardDescription>Search and filter student fee information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by student name or ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Period" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-[140px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Grade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {classes.map(cls => <SelectItem key={cls._id} value={cls.grade}>Grade {cls.grade}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map(record => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.studentName}</div>
                        <div className="text-sm text-muted-foreground">ID: {record.studentId}</div>
                      </div>
                    </TableCell>
                    <TableCell>{record.grade}</TableCell>
                    <TableCell>{record.academicYear}</TableCell>
                    <TableCell><Badge variant="outline">{record.collectionPeriod}</Badge></TableCell>
                    <TableCell>₹{record.totalFee?.toLocaleString() || 0}</TableCell>
                    <TableCell className="text-emerald-600">₹{record.paidAmount?.toLocaleString() || 0}</TableCell>
                    <TableCell className="text-red-600">₹{record.dueAmount?.toLocaleString() || 0}</TableCell>
                    <TableCell><Badge variant={getStatusColor(record.status)}>{record.status}</Badge></TableCell>
                    <TableCell>{record.nextDueDate ? new Date(record.nextDueDate).toLocaleDateString() : 'Not set'}</TableCell>
                    <TableCell>
                      {record.payments?.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const latestPayment = record.payments[record.payments.length - 1];
                            setSelectedPaymentForReceipt(latestPayment);
                            setPrintReceiptModalOpen(true);
                          }}
                        >
                          Print Receipt
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredRecords.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No fee records found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {isAdmin && (
        <>
          <AddFeeModal isOpen={addFeeModalOpen} onClose={() => setAddFeeModalOpen(false)} students={students} />
          <CollectFeeModal isOpen={collectFeeModalOpen} onClose={() => setCollectFeeModalOpen(false)} students={students} />
          <FeeStructureModal isOpen={feeStructureModalOpen} onClose={() => setFeeStructureModalOpen(false)} />
        </>
      )}

      <ClassFeeStructureModal
        isOpen={classFeeStructureModalOpen}
        onClose={() => setClassFeeStructureModalOpen(false)}
        classes={classes}
      />

      <ViewFeeStructure
        isOpen={viewFeeStructureModalOpen}
        onClose={() => setViewFeeStructureModalOpen(false)}
        structures={feeStructures} // Pass **all fee structures** here
      />

      <PrintReceiptModal
        isOpen={printReceiptModalOpen}
        onClose={() => {
          setPrintReceiptModalOpen(false);
          setSelectedPaymentForReceipt(null);
        }}
        payment={selectedPaymentForReceipt}
        studentName={feeRecords.find(r => r.payments?.some(p => p.id === selectedPaymentForReceipt?.id))?.studentName || ''}
        className={feeRecords.find(r => r.payments?.some(p => p.id === selectedPaymentForReceipt?.id))?.grade || ''}
      />
    </div>
  );
};
