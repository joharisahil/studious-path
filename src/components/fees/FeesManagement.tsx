// src/components/fees/FeesManagement.tsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RootState } from "@/store";
import { fetchFilteredFees, SearchFilters } from "@/services/FeesApi";
import { ApplyScholarshipModal } from "./ApplyScholarshipModal";
import { CollectFeeModal } from "./CollectFeeModal";
import { FeeStructureModal } from "./FeeStructureModal";
import { ClassFeeStructureModal } from "./ClassFeeStructureModal";
import { ChildPrintReceiptModal } from "./ChildPrintReceiptModal";
import { PendingReceiptModal } from "./PendingReceiptModal";
import { ViewFeeStructure } from "./ViewFeeStructure";
import { getAllClasses } from "@/services/ClassesApi";
import { getAllFeeStructures } from "@/services/FeesApi";

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
  scholarshipType?: "full" | "half" | "none" | "None";
  payments?: { id: string; amount: number; date?: string; mode?: string }[];
}

/** Small reusable spinner component */
const Spinner = ({ size = 32 }: { size?: number }) => (
  <div
    role="status"
    style={{ width: size, height: size }}
    className="inline-block rounded-full border-4 border-gray-200 border-t-gray-800 animate-spin"
  />
);

export const FeesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedScholarship, setSelectedScholarship] = useState("all");

  const [classes, setClasses] = useState<ClassType[]>([]);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingFees, setLoadingFees] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [applyScholarshipModalOpen, setApplyScholarshipModalOpen] =
    useState(false);
  const [collectFeeModalOpen, setCollectFeeModalOpen] = useState(false);
  const [feeStructureModalOpen, setFeeStructureModalOpen] = useState(false);
  const [classFeeStructureModalOpen, setClassFeeStructureModalOpen] =
    useState(false);
  const [printReceiptModalOpen, setPrintReceiptModalOpen] = useState(false);
  const [pendingReceiptModalOpen, setPendingReceiptModalOpen] = useState(false);
  const [viewFeeStructureModalOpen, setViewFeeStructureModalOpen] =
    useState(false);

  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] =
    useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [totalCollected, setTotalCollected] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);

  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";

  /** Fetch Classes */
  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const data = await getAllClasses();
        setClasses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  /** Fetch Fee Structures */
  const fetchFeeStructuresOnClick = async () => {
    try {
      const data = await getAllFeeStructures();
      if (data && Array.isArray(data)) {
        const mapped = data.map((fs: any) => {
          const cls = classes.find((c) => c._id === fs.classId._id);
          return {
            ...fs,
            className: cls ? `${cls.grade} ${cls.section}` : "Unknown",
          };
        });
        setFeeStructures(mapped);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /** Fetch Fee Records */
  const fetchFeeRecords = async (page: number = 1) => {
    setLoadingFees(true);
    try {
      const filters: SearchFilters = {
        grade: selectedGrade !== "all" ? selectedGrade : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        period: selectedPeriod !== "all" ? selectedPeriod : undefined,
        scholarship:
          selectedScholarship !== "all" ? selectedScholarship : undefined,
        studentName: searchTerm || undefined,
        page,
        limit: 10,
      };

      const res = await fetchFilteredFees(filters);

      const mappedFees: FeeRecord[] = (res.fees || []).map((fee: any) => ({
        id: fee._id,
        studentName: `${fee.studentId.firstName} ${fee.studentId.lastName || ""}`.trim(),
        studentId: fee.studentId.registrationNumber,
        grade: `${fee.classId.grade} ${fee.classId.section}`,
        academicYear: fee.session,
        collectionPeriod: fee.structureId?.session || "N/A",
        totalFee: fee.totalAmount,
        paidAmount: fee.totalPaid,
        dueAmount: fee.balance,
        status:
          fee.balance === 0
            ? "Paid"
            : fee.totalPaid === 0
            ? "Pending"
            : "Partial",
        scholarshipType: fee.scholarships?.length
          ? fee.scholarships[0].type || "None"
          : "None",
        nextDueDate: fee.installments?.find((inst: any) => inst.status !== "Paid")
          ?.dueDate,
        payments: (fee.payments || []).map((p: any) => ({ ...p, id: p._id })),
      }));

      setFeeRecords(mappedFees);
      setCurrentPage(res.page || 1);
      setTotalPages(Math.max(1, Math.ceil((res.totalStudents || 0) / 10)));

      setTotalCollected(res.totalCollected || 0);
      setTotalPending(res.totalPending || 0);
      setTotalStudents(res.totalStudents || 0);
    } catch (err) {
      console.error(err);
      setFeeRecords([]);
      setTotalCollected(0);
      setTotalPending(0);
      setTotalStudents(0);
      setTotalPages(1);
    } finally {
      setLoadingFees(false);
    }
  };

  const lateSubmitters = feeRecords.filter(
    (r) => r.dueAmount && r.status !== "Paid"
  );

  const getStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "default";
      case "partial":
        return "secondary";
      case "overdue":
      case "pending":
        return "destructive";
      default:
        return "outline";
    }
  };

  useEffect(() => {
    fetchFeeRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => fetchFeeRecords(1);
  const handlePageChange = (page: number) => fetchFeeRecords(page);

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold">Fee Management</h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Manage student fees, payments, and track collections"
              : "View fee status and payment history"}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => alert("Export feature")} variant="outline">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
          <Button
            onClick={() => setClassFeeStructureModalOpen(true)}
            variant="outline"
          >
            <Eye className="w-4 h-4 mr-2" /> View Class Fee Structure
          </Button>
          {isAdmin && (
            <>
              <Button
                onClick={() => setCollectFeeModalOpen(true)}
                variant="outline"
              >
                <CreditCard className="w-4 h-4 mr-2" /> Collect Fee
              </Button>
              <Button
                onClick={() => setFeeStructureModalOpen(true)}
                variant="outline"
              >
                <Settings className="w-4 h-4 mr-2" /> Create Fee Structure
              </Button>

              <Button
                onClick={async () => {
                  await fetchFeeStructuresOnClick();
                  setViewFeeStructureModalOpen(true);
                }}
                variant="outline"
              >
                <Eye className="w-4 h-4 mr-2" /> View All Structures
              </Button>

              <Button onClick={() => setApplyScholarshipModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Apply Scholarship
              </Button>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{totalCollected.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This academic year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{totalPending.toLocaleString()}
            </div>
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
            <div className="text-2xl font-bold text-yellow-600">
              {lateSubmitters.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Students with overdue fees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by student name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
          <SelectTrigger className="w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls._id} value={cls.grade}>
                Grade {cls.grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Partial">Partial</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={selectedScholarship}
          onValueChange={setSelectedScholarship}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Scholarship" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="full">Full</SelectItem>
            <SelectItem value="half">Half</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>

        <Button
          className="h-10"
          onClick={handleSearch}
          disabled={loadingFees}
        >
          {loadingFees ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Searching</span>
            </div>
          ) : (
            "Search"
          )}
        </Button>
      </div>

      {/* Fee Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Records</CardTitle>
          <CardDescription>
            Search and filter student fee information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                  <TableHead>Scholarship</TableHead>
                  <TableHead>Next Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingFees ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-10 text-center">
                      <Spinner size={36} />
                    </TableCell>
                  </TableRow>
                ) : feeRecords.length > 0 ? (
                  feeRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.studentName}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {record.studentId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{record.grade}</TableCell>
                      <TableCell>{record.academicYear}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.collectionPeriod}</Badge>
                      </TableCell>
                      <TableCell>
                        ₹{record.totalFee?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="text-emerald-600">
                        ₹{record.paidAmount?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="text-red-600">
                        ₹{record.dueAmount?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.scholarshipType || "None"}</TableCell>
                      <TableCell>
                        {record.nextDueDate
                          ? new Date(record.nextDueDate).toLocaleDateString()
                          : "Not set"}
                      </TableCell>
                      <TableCell>
                        {record.payments?.length > 0 ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const latestPayment =
                                record.payments![record.payments!.length - 1];
                              setSelectedPaymentForReceipt(latestPayment);
                              setPrintReceiptModalOpen(true);
                            }}
                          >
                            Print Receipt
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="py-8 text-center text-muted-foreground">
                      No fee records found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {applyScholarshipModalOpen && (
        <ApplyScholarshipModal
          isOpen={applyScholarshipModalOpen}
          onClose={() => {
            setApplyScholarshipModalOpen(false);
            fetchFeeRecords(currentPage);
          }}
        />
      )}
      {collectFeeModalOpen && (
        <CollectFeeModal
          isOpen={collectFeeModalOpen}
          onClose={() => {
            setCollectFeeModalOpen(false);
            fetchFeeRecords(currentPage);
          }}
          students={students}
        />
      )}
      {feeStructureModalOpen && (
        <FeeStructureModal
          isOpen={feeStructureModalOpen}
          onClose={() => {
            setFeeStructureModalOpen(false);
            fetchFeeRecords(currentPage);
          }}
        />
      )}
      <ClassFeeStructureModal
        isOpen={classFeeStructureModalOpen}
        onClose={() => {
          setClassFeeStructureModalOpen(false);
          fetchFeeRecords(currentPage);
        }}
        classes={classes}
      />
      <ViewFeeStructure
        isOpen={viewFeeStructureModalOpen}
        onClose={() => {
          setViewFeeStructureModalOpen(false);
          fetchFeeRecords(currentPage);
        }}
        structures={feeStructures}
      />
      {printReceiptModalOpen && selectedPaymentForReceipt && (
        <ChildPrintReceiptModal
          isOpen={printReceiptModalOpen}
          onClose={() => {
            setPrintReceiptModalOpen(false);
            setSelectedPaymentForReceipt(null);
            // printing doesn't change data normally, but refresh anyway to be safe
            fetchFeeRecords(currentPage);
          }}
          payment={selectedPaymentForReceipt}
          studentName={
            feeRecords.find((r) =>
              r.payments?.some((p) => p.id === selectedPaymentForReceipt?.id)
            )?.studentName || ""
          }
          className={
            feeRecords.find((r) =>
              r.payments?.some((p) => p.id === selectedPaymentForReceipt?.id)
            )?.grade || ""
          }
        />
      )}
      {pendingReceiptModalOpen && selectedPaymentForReceipt && (
        <PendingReceiptModal
          isOpen={pendingReceiptModalOpen}
          onClose={() => {
            setPendingReceiptModalOpen(false);
            setSelectedPaymentForReceipt(null);
            fetchFeeRecords(currentPage);
          }}
          payment={selectedPaymentForReceipt} // <-- changed from student to payment
        />
      )}

      {/* Full-screen overlay loader (non-blocking visuals for background loads)
      {(loadingFees || loadingClasses || loadingStudents) && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-none">
          <div className="p-4 rounded-full bg-white/10">
            <Spinner size={48} />
          </div>
        </div>
      )} */}
    </div>
  );
};
