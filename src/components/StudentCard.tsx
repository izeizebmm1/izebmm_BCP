import React from "react";
import { Student } from "../types";
import { UserCheck, Clock, FileText, ChevronRight, User } from "lucide-react";

interface StudentCardProps {
  student: Student;
  onEdit: (student: Student) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, onEdit }) => {
  const getStatusBadge = () => {
    switch (student.status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <UserCheck className="w-3.5 h-3.5" /> บันทึกเสร็จแล้ว
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <Clock className="w-3.5 h-3.5" /> แบบร่าง
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-natural-subtle text-natural-muted border border-natural-border">
            <FileText className="w-3.5 h-3.5" /> ยังไม่กรอก
          </span>
        );
    }
  };

  const calculateAge = (dobString: string) => {
    try {
      const year = parseInt(dobString.split("-")[0]);
      // DOB in Thai format year is usually 2560 etc. Let's handle it
      if (year > 2500) {
        return 2569 - year; // Academic year is 2569 (2026)
      }
      return 2026 - year;
    } catch {
      return 8;
    }
  };

  const getFormatDob = (dobStr: string) => {
    try {
      const [y, m, d] = dobStr.split("-");
      const thaiMonths = [
        "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
        "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
      ];
      const thaiYear = parseInt(y) < 2100 ? parseInt(y) + 543 : parseInt(y);
      return `${parseInt(d)} ${thaiMonths[parseInt(m) - 1]} ${thaiYear}`;
    } catch {
      return dobStr;
    }
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-xs border border-natural-border hover:border-natural-accent hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between"
      id={`student-card-${student.id}`}
    >
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${student.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : student.status === 'draft' ? 'bg-orange-50 text-orange-600' : 'bg-natural-subtle text-natural-muted'}`}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-natural-muted">เลขประจำตัว: {student.id}</span>
              <h3 className="font-extrabold text-natural-dark text-base leading-tight">
                {student.title}{student.name} {student.surname}
              </h3>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-1.5 py-3 border-t border-b border-natural-divider text-xs text-natural-muted mb-4">
          <div className="flex justify-between">
            <span>เลขบัตรประชาชน:</span>
            <span className="font-medium text-natural-text">{student.nationalId}</span>
          </div>
          <div className="flex justify-between">
            <span>วันเกิด:</span>
            <span className="font-medium text-natural-text">
              {getFormatDob(student.dob)} (อายุ {calculateAge(student.dob)} ปี)
            </span>
          </div>
          <div className="flex justify-between">
            <span>น้ำหนัก / ส่วนสูง:</span>
            <span className="font-medium text-natural-text">{student.weight} กก. / {student.height} ซม.</span>
          </div>
          {student.formData && (
            <div className="flex justify-between mt-1 pt-1 border-t border-dotted border-natural-divider">
              <span>รายได้เฉลี่ยหัวละ:</span>
              <span className="font-bold text-natural-accent">
                {student.formData.householdCount > 0
                  ? ((student.formData.members || []).reduce((sum: number, m: any) => sum + Number(m.incomeTotal), 0) / student.formData.householdCount).toLocaleString(undefined, { maximumFractionDigits: 0 })
                  : 0}{" "}
                บาท/เดือน
              </span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => onEdit(student)}
        className={`w-full py-2 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
          student.status === "completed"
            ? "bg-natural-subtle hover:bg-natural-border text-natural-text border border-natural-border"
            : student.status === "draft"
            ? "bg-orange-650 hover:bg-orange-700 text-white"
            : "bg-natural-accent hover:bg-natural-accent-hover text-white"
        }`}
        id={`btn-edit-${student.id}`}
      >
        {student.status === "completed" ? "ดู / แก้ไขข้อมูล" : student.status === "draft" ? "กรอกข้อมูลต่อ" : "ลงทะเบียนบันทึก"}
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
