import React, { useState, useRef } from "react";

const dummyStudents = [
  {
    name: "Riya Sharma",
    className: "6th A",
    rollNo: "23",
    dob: "2008-05-10",
    subjects: [
      { name: "Mathematics", marks: 88, grade: "A" },
      { name: "Science", marks: 92, grade: "A+" },
      { name: "English", marks: 81, grade: "B+" },
      { name: "Social Studies", marks: 76, grade: "B" },
    ],
    remarks: "Excellent performance throughout the year.",
  },
  {
    name: "Arjun Verma",
    className: "7th B",
    rollNo: "17",
    dob: "2008-06-12",
    subjects: [
      { name: "Mathematics", marks: 78, grade: "B+" },
      { name: "Science", marks: 85, grade: "A" },
      { name: "English", marks: 79, grade: "B+" },
      { name: "Social Studies", marks: 90, grade: "A+" },
    ],
    remarks: "Good academic performance, needs improvement in English.",
  },
];

const ReportCard = () => {
  const printRef = useRef(null);
  const [student, setStudent] = useState(dummyStudents[0]);
  const [borderColor, setBorderColor] = useState("#4F46E5"); // Indigo
  const [bgColor, setBgColor] = useState("#FFFFFF"); // White

  const handlePrint = () => {
    if (!printRef.current) return;
    const originalContents = document.body.innerHTML;
    const printContents = printRef.current.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const updateSubject = (index: number, key: "marks" | "grade", value: any) => {
    const newSubjects: any[] = [...student.subjects];
    newSubjects[index][key] = value;
    setStudent({ ...student, subjects: newSubjects });
  };

  return (
    <div className="p-6 space-y-8">
      {/* Student Selection */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-md flex items-center gap-4">
        <label className="font-semibold">Select Student:</label>
        <select
          value={student.name}
          onChange={(e) =>
            setStudent(dummyStudents.find((s) => s.name === e.target.value)!)
          }
          className="border p-2 rounded"
        >
          {dummyStudents.map((s, idx) => (
            <option key={idx} value={s.name}>
              {s.name} ({s.className})
            </option>
          ))}
        </select>
      </div>

      {/* Form Section */}
      <div className="bg-gray-100 p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-xl font-semibold">Edit Student Data</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={student.name}
            onChange={(e) => setStudent({ ...student, name: e.target.value })}
            placeholder="Student Name"
            className="border p-2 rounded"
          />
          <input
            type="text"
            value={student.className}
            onChange={(e) =>
              setStudent({ ...student, className: e.target.value })
            }
            placeholder="Class"
            className="border p-2 rounded"
          />
        </div>

        {/* Editable Subjects Table */}
        <table className="w-full border-collapse border border-gray-300 mt-4">
          <thead style={{ backgroundColor: borderColor, color: "#fff" }}>
            <tr>
              <th className="p-2 text-left">Subject</th>
              <th className="p-2 text-center">Marks</th>
              <th className="p-2 text-center">Grade</th>
            </tr>
          </thead>
          <tbody>
            {student.subjects.map((sub, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? "#f3f4f6" : "white",
                }}
              >
                <td className="p-2">{sub.name}</td>
                <td className="p-2 text-center">
                  <input
                    type="number"
                    value={sub.marks}
                    onChange={(e) =>
                      updateSubject(index, "marks", Number(e.target.value))
                    }
                    className="w-16 text-center border rounded"
                  />
                </td>
                <td className="p-2 text-center">
                  <input
                    type="text"
                    value={sub.grade}
                    onChange={(e) =>
                      updateSubject(index, "grade", e.target.value)
                    }
                    className="w-16 text-center border rounded"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Border & Background */}
        <div className="flex gap-4 mt-2 items-center">
          <label>Border Color:</label>
          <input
            type="color"
            value={borderColor}
            onChange={(e) => setBorderColor(e.target.value)}
          />
          <label>Background Color:</label>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
          />
        </div>

        <button
          onClick={handlePrint}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Print Report Card
        </button>
      </div>

      {/* Report Card Preview */}
      <div
        ref={printRef}
        className="max-w-4xl mx-auto relative p-8 rounded-3xl shadow-2xl"
        style={{ border: `8px solid ${borderColor}`, backgroundColor: bgColor }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] text-[6rem] text-indigo-100 opacity-20 pointer-events-none select-none">
          Your School Name
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <div className="flex items-center gap-4">
              <img
                src="https://dummyimage.com/80x80/000/fff&text=Logo"
                alt="School Logo"
                className="w-20 h-20 rounded-full border-2 border-gray-400"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Your School Name
                </h1>
                <p className="text-gray-600 text-lg">Academic Year: 2024-25</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">Report Card</p>
            </div>
          </div>
            <div className="flex items-center justify-center h-full mb-4">
  <p className="font-semibold text-lg">Mid Terms</p>
</div>



          <div className="grid grid-cols-2 gap-4 mb-6 text-gray-700">
            <p>
              <span className="font-semibold">Name:</span> {student.name}
            </p>

            <p>
              <span className="font-semibold">Class:</span> {student.className}
            </p>
            <p>
              <span className="font-semibold">Roll No:</span> {student.rollNo}
            </p>
            <p>
              <span className="font-semibold">DOB:</span> {student.dob}
            </p>
          </div>

          {/* Subjects Table in Preview */}
          <table className="w-full border-collapse border border-gray-300 mb-6">
            <thead style={{ backgroundColor: borderColor, color: "#fff" }}>
              <tr>
                <th className="p-2 text-left">Subject</th>
                <th className="p-2 text-center">Marks</th>
                <th className="p-2 text-center">Grade</th>
              </tr>
            </thead>
            <tbody>
              {student.subjects.map((sub, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#f3f4f6" : "white",
                  }}
                >
                  <td className="p-2">{sub.name}</td>
                  <td className="p-2 text-center">{sub.marks}</td>
                  <td className="p-2 text-center">{sub.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mb-6">
            <span className="font-semibold">Teacher's Remarks:</span>{" "}
            {student.remarks}
          </p>

          <div className="flex justify-between mt-6 text-gray-700 text-sm border-t pt-4">
            <div>
              <p>Date: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p>____________________</p>
              <p>Principal's Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
