import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Users, AlertCircle, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetFeeRecordsQuery } from '@/store/api/feesApi';

const FeeReport = () => {
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  const { data: feeRecordsResponse, isLoading } = useGetFeeRecordsQuery({});
  const feeRecords = feeRecordsResponse?.data || [];

  // Mock aggregated data
  const feeStats = {
    totalCollected: 2450000,
    totalPending: 350000,
    totalOverdue: 75000,
    totalStudents: 1247,
    collectionRate: 87.4,
    monthlyGrowth: 12.5,
  };

  const recentPayments = [
    {
      id: '1',
      studentName: 'Sarah Johnson',
      grade: '10-A',
      amount: 1500,
      paymentDate: '2024-01-15',
      method: 'Bank Transfer',
      status: 'completed',
    },
    {
      id: '2',
      studentName: 'Mike Davis',
      grade: '11-B',
      amount: 1200,
      paymentDate: '2024-01-14',
      method: 'Card',
      status: 'completed',
    },
    {
      id: '3',
      studentName: 'Emily Wilson',
      grade: '9-C',
      amount: 800,
      paymentDate: '2024-01-13',
      method: 'Cash',
      status: 'completed',
    }
  ];

  const overduePayments = [
    {
      id: '1',
      studentName: 'John Smith',
      grade: '12-A',
      dueAmount: 2500,
      daysOverdue: 15,
      lastPaymentDate: '2023-12-01',
    },
    {
      id: '2',
      studentName: 'Lisa Brown',
      grade: '10-B',
      dueAmount: 1800,
      daysOverdue: 8,
      lastPaymentDate: '2023-12-15',
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">Fee Report</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive fee collection and payment analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            <SelectItem value="9">Grade 9</SelectItem>
            <SelectItem value="10">Grade 10</SelectItem>
            <SelectItem value="11">Grade 11</SelectItem>
            <SelectItem value="12">Grade 12</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Payment Status" />
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

      {/* Fee Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Collected
            </CardTitle>
            <DollarSign className="w-5 h-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ${feeStats.totalCollected.toLocaleString()}
            </div>
            <div className="flex items-center text-sm text-success">
              <TrendingUp className="w-4 h-4 mr-1" />
              +{feeStats.monthlyGrowth}% this month
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Amount
            </CardTitle>
            <AlertCircle className="w-5 h-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              ${feeStats.totalPending.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round((feeStats.totalPending / (feeStats.totalCollected + feeStats.totalPending)) * 100)}% of total
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue Amount
            </CardTitle>
            <TrendingDown className="w-5 h-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ${feeStats.totalOverdue.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              {overduePayments.length} students affected
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Collection Rate
            </CardTitle>
            <Users className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feeStats.collectionRate}%
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round(feeStats.totalStudents * feeStats.collectionRate / 100)} of {feeStats.totalStudents} students
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Payments</CardTitle>
            <CardDescription>Latest fee payments received</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.studentName}</div>
                        <div className="text-sm text-muted-foreground">{payment.grade}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-success">
                      ${payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{payment.method}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Overdue Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              Overdue Payments
            </CardTitle>
            <CardDescription>Students with overdue fee payments</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Due Amount</TableHead>
                  <TableHead>Days Overdue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overduePayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.studentName}</div>
                        <div className="text-sm text-muted-foreground">{payment.grade}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-destructive">
                      ${payment.dueAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">{payment.daysOverdue} days</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeeReport;