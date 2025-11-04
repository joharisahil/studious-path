// src/components/dashboards/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Users,
  UserCheck,
  BookOpen,
  IndianRupee,
  PlusCircle,
  ClipboardList,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// ✅ API Services
import { getAllStudents } from "@/services/StudentsApi";
import { getAllTeachers } from "@/services/TeachersApi";

// ✅ MODALS
import CreateStudentModal from "@/components/students/CreateStudentModal";
import CreateTeacherModal from "@/components/teachers/CreateTeacherModal";
import CreateSubjectModal from "@/components/subjects/CreateSubjectModal";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // ✅ COUNTS
  const [studentsCount, setStudentsCount] = useState(0);
  const [teachersCount, setTeachersCount] = useState(0);
  const [subjectsCount, setSubjectsCount] = useState(0);
  const [feesPending, setFeesPending] = useState(450000);

  // ✅ MODAL STATES
  const [createStudentOpen, setCreateStudentOpen] = useState(false);
  const [createTeacherOpen, setCreateTeacherOpen] = useState(false);
  const [createSubjectOpen, setCreateSubjectOpen] = useState(false);

  const today = new Date();
  const dateString = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ✅ Fetch Students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await getAllStudents(1, 1);
        setStudentsCount(res.pagination?.total ?? 0);
      } catch (err) {
        console.error("Failed to load students", err);
      }
    };
    fetchStudents();
  }, []);

  // ✅ Fetch Teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await getAllTeachers(1, 1);
        setTeachersCount(res.pagination?.total ?? 0);
      } catch (err) {
        console.error("Failed to load teachers", err);
      }
    };
    fetchTeachers();
  }, []);

  // ✅ Quick Action Handlers
  const handleAddStudent = () => setCreateStudentOpen(true);
  const handleAddTeacher = () => setCreateTeacherOpen(true);
  const handleAddSubject = () => setCreateSubjectOpen(true);

  const handleViewFees = () => navigate("/fees");
  const handleTimetable = () => navigate("/timetable");

  // ✅ ACTION BUTTONS
  const actions = [
    {
      title: "Add Student",
      icon: <PlusCircle className="h-6 w-6" />,
      color: "bg-blue-600",
      onClick: handleAddStudent,
    },
    {
      title: "Add Teacher",
      icon: <UserCheck className="h-6 w-6" />,
      color: "bg-blue-700",
      onClick: handleAddTeacher,
    },
    {
      title: "Add Subject",
      icon: <BookOpen className="h-6 w-6" />,
      color: "bg-blue-500",
      onClick: handleAddSubject,
    },
    {
      title: "View Fees",
      icon: <IndianRupee className="h-6 w-6" />,
      color: "bg-blue-800",
      onClick: handleViewFees,
    },
    {
      title: "View Timetable",
      icon: <ClipboardList className="h-6 w-6" />,
      color: "bg-blue-600",
      onClick: handleTimetable,
    },
  ];

  return (
    <div className="p-6 space-y-10">
      {/* ✅ HEADER */}
      <div className="relative w-full rounded-3xl p-12 overflow-hidden shadow-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 flex justify-center items-center">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-300 blur-3xl opacity-20 rounded-full" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-200 blur-3xl opacity-20 rounded-full" />

        <div className="relative z-10 text-center text-white">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/30 backdrop-blur-lg flex items-center justify-center shadow-xl border border-white/40 text-3xl font-bold">
            GV
          </div>

          <h1 className="text-4xl font-bold tracking-wide drop-shadow-lg">
            Welcome to School ERP
          </h1>

          <p className="text-xl opacity-95 mt-1">
            Green Valley International School
          </p>

          <p className="mt-4 inline-block bg-white/20 px-4 py-2 rounded-xl text-sm shadow">
            {dateString}
          </p>
        </div>
      </div>

      {/* ✅ QUICK ACTIONS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {actions.map((a, i) => (
          <button
            key={i}
            onClick={a.onClick}
            className="cursor-pointer rounded-2xl p-4 bg-white/50 backdrop-blur-lg border border-blue-200 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 text-left"
          >
            <div
              className={`w-12 h-12 ${a.color} rounded-xl flex items-center justify-center text-white shadow mb-3`}
            >
              {a.icon}
            </div>
            <p className="text-sm font-semibold text-blue-900">{a.title}</p>
          </button>
        ))}
      </div>

      {/* ✅ KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          {
            title: "Total Students",
            value: studentsCount,
            icon: <Users className="h-8 w-8 text-blue-600" />,
          },
          {
            title: "Total Teachers",
            value: teachersCount,
            icon: <UserCheck className="h-8 w-8 text-blue-700" />,
          },
          {
            title: "Total Classes", // ✅ CHANGED (was Total Subjects)
            value: subjectsCount, // ✅ Keep count coming from subject modal
            icon: <BookOpen className="h-8 w-8 text-blue-500" />,
          },
          {
            title: "Fees Pending",
            value: `₹ ${feesPending.toLocaleString()}`,
            icon: <IndianRupee className="h-8 w-8 text-blue-800" />,
          },
        ].map((kpi, i) => (
          <Card
            key={i}
            className="rounded-2xl overflow-hidden backdrop-blur-xl bg-white/70 border border-blue-200 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-blue-900">
                {kpi.title}
              </CardTitle>
              {kpi.icon}
            </CardHeader>

            <CardContent>
              <p className="text-4xl font-bold text-blue-950">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ✅ PLAN EXPIRING */}
      <div className="w-full flex justify-center">
        <Card className="rounded-2xl p-6 shadow-xl bg-white/70 backdrop-blur-lg border border-blue-200 w-full max-w-md">
          <CardTitle className="text-blue-900 text-center">
            Plan Expiring
          </CardTitle>

          <div className="mt-5 text-center">
            <p className="text-6xl font-bold text-blue-700">200</p>
            <p className="text-sm text-blue-900 mt-1">Days Remaining</p>

            <div className="mt-6 w-full h-3 bg-blue-200 rounded-full">
              <div
                className="h-full bg-blue-700 rounded-full"
                style={{ width: "40%" }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* ✅ MODALS */}
      <CreateStudentModal
        open={createStudentOpen}
        onOpenChange={setCreateStudentOpen}
        onSuccess={async () => {
          setCreateStudentOpen(false);
          const res = await getAllStudents(1, 1);
          setStudentsCount(res.pagination.total);
        }}
      />

      <CreateTeacherModal
        open={createTeacherOpen}
        onOpenChange={setCreateTeacherOpen}
        onSuccess={async () => {
          setCreateTeacherOpen(false);
          const res = await getAllTeachers(1, 1);
          setTeachersCount(res.pagination.total);
        }}
      />

      {/* ✅ SUBJECT MODAL (opens when Add Subject is clicked) */}
      <CreateSubjectModal
        open={createSubjectOpen}
        onOpenChange={setCreateSubjectOpen}
        onSuccess={async () => {
          setCreateSubjectOpen(false);
          setSubjectsCount((prev) => prev + 1);
        }}
      />
    </div>
  );
};

export default AdminDashboard;
