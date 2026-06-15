import React from "react";
import { Student, ActivityLog } from "../types";
import { 
  Users, CheckCircle, HelpCircle, FileClock, ShieldAlert,
  Coins, Heart, TrendingDown, ClipboardList, MapPin
} from "lucide-react";

interface DashboardProps {
  students: Student[];
  logs: ActivityLog[];
  onSelectStudent: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ students, logs, onSelectStudent }) => {
  // Calculations
  const totalStudents = students.length;
  const completedCount = students.filter(s => s.status === "completed").length;
  const draftCount = students.filter(s => s.status === "draft").length;
  const pendingCount = students.filter(s => s.status === "pending").length;

  // Filter students with completed form data to check details
  const completedForms = students.filter(s => s.status === "completed" && s.formData);
  
  // Poverty criteria counts
  const eefLimit = 3000;
  const subsidyEligibleCount = completedForms.filter(s => {
    if (!s.formData) return false;
    const totalIncome = s.formData.members.reduce((sum, m) => sum + m.incomeTotal, 0);
    const avg = s.formData.householdCount > 0 ? totalIncome / s.formData.householdCount : 0;
    return avg <= eefLimit;
  }).length;

  // Average household income of the class
  const classAvgIncome = completedForms.length > 0 
    ? completedForms.reduce((sum, s) => {
        const totalIncome = s.formData!.members.reduce((sum, m) => sum + m.incomeTotal, 0);
        return sum + (s.formData!.householdCount > 0 ? totalIncome / s.formData!.householdCount : 0);
      }, 0) / completedForms.length
    : 0;

  // Burden metrics counts
  const singleParentCount = completedForms.filter(s => s.formData?.hasSingleParentBurden).length;
  const disabledBurdenCount = completedForms.filter(s => s.formData?.hasDisabledBurden).length;
  const unemployedBurdenCount = completedForms.filter(s => s.formData?.hasUnemployedBurden).length;
  const elderlyBurdenCount = completedForms.filter(s => s.formData?.hasElderlyBurden).length;

  // Residency metrics
  const ownsHome = completedForms.filter(s => s.formData?.residencyType === "อยู่บ้านตนเอง").length;
  const rentsHome = completedForms.filter(s => s.formData?.residencyType === "อยู่บ้านเช่า").length;
  const freeOther = completedForms.filter(s => s.formData?.residencyType === "อยู่กับผู้อื่น" || s.formData?.residencyType === "หอพัก").length;

  // Format date helper
  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "เมื่อครู่นี้";
      if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
      return date.toLocaleDateString("th-TH", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return isoString;
    }
  };

  // SVG Chart Calculations
  const chartHeight = 220;
  const chartWidth = 500;
  const maxChartVal = 12000;

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-natural-border shadow-xs flex items-center gap-4">
          <div className="p-3 bg-natural-subtle text-natural-accent rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-natural-muted font-bold block">นักเรียนชั้น ป.2 ทั้งหมด</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-natural-dark">{totalStudents}</span>
              <span className="text-xs font-bold text-natural-muted">คน</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-natural-accent font-bold">
              โรงเรียนบ้านเชียงพิณ อุดรธานี
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-natural-border shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-natural-muted font-bold block">แบบฟอร์มบันทึกเสร็จสิ้น</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-emerald-800">{completedCount}</span>
              <span className="text-xs font-bold text-natural-muted">/ 10 คน</span>
            </div>
            <div className="mt-1 w-24 bg-natural-subtle h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-600 h-full transition-all duration-500" 
                style={{ width: `${(completedCount / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-natural-border shadow-xs flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-700 rounded-xl">
            <FileClock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-natural-muted font-bold block">แบบร่างอยู่ระหว่างการกรอก</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-orange-850">{draftCount}</span>
              <span className="text-xs font-bold text-natural-muted">คน</span>
            </div>
            <span className="text-xs text-natural-muted block mt-1">
              กำลังดำเนินการ: {draftCount} | คงเหลือว่าง: {pendingCount}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-natural-border shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-natural-muted font-bold block">เข้าเกณฑ์ยากจนรุนแรง (ต่ำกว่า 3,000)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-rose-800">{subsidyEligibleCount}</span>
              <span className="text-xs font-bold text-rose-550 font-bold">คน</span>
            </div>
            <span className="text-xs text-rose-600 font-bold block mt-1">
              จากฟอร์มที่กรอกเสร็จแล้ว {completedCount} ฟอร์ม
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Realtime Income Chart (SVG based) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-natural-border shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 border-b border-natural-divider pb-4">
            <div>
              <h3 className="font-extrabold text-natural-dark text-lg flex items-center gap-2">
                <Coins className="w-5 h-5 text-orange-500" /> แผนภูมิแสดงรายได้เฉลี่ยต่อสมาชิกครัวเรือนของแต่ละบุคคล
              </h3>
              <p className="text-xs text-natural-muted">
                รายได้รวมทั้งหมดของครอบครัว หาร ด้วยจำนวนสมาชิกในบ้าน (เส้นแดงคือขีดความยากจน กสศ. 3,000 บาท)
              </p>
            </div>
            <div className="bg-natural-subtle border border-natural-border rounded-lg px-3 py-1.5 text-center shrink-0">
              <span className="block text-[10px] text-natural-muted font-bold">เฉลี่ยของเด็กที่บันทึกแล้ว</span>
              <span className="text-sm font-bold text-natural-dark">
                {classAvgIncome > 0 ? `${Math.round(classAvgIncome).toLocaleString()} บาท/เดือน` : "ไม่มีข้อมูล"}
              </span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <div className="min-w-[500px] h-[240px] relative">
              {/* SVG Canvas */}
              <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
                {/* Horizontal grid lines */}
                {[0, 3000, 6000, 9000, 12000].map((val) => {
                  const y = chartHeight - (val / maxChartVal) * (chartHeight - 40) - 25;
                  return (
                    <g key={val}>
                      <line 
                        x1="45" 
                        y1={y} 
                        x2={chartWidth - 10} 
                        y2={y} 
                        stroke={val === 3000 ? "#fda4af" : "#E5E2D9"} 
                        strokeWidth={val === 3000 ? 1.5 : 1} 
                        strokeDasharray={val === 3000 ? "4 4" : "0"}
                      />
                      <text x="5" y={y + 4} className="text-[10px] font-mono fill-slate-400 text-right">
                        {val.toLocaleString()}
                      </text>
                    </g>
                  );
                })}

                {/* Vertical bars */}
                {students.map((student, idx) => {
                  const colSpacing = (chartWidth - 60) / 10;
                  const x = 55 + idx * colSpacing + (colSpacing - 22) / 2;
                  
                  // Compute income
                  let incomePerPerson = 0;
                  if (student.formData) {
                    const totalIncome = student.formData.members.reduce((sum, m) => sum + m.incomeTotal, 0);
                    incomePerPerson = student.formData.householdCount > 0 ? totalIncome / student.formData.householdCount : 0;
                  }

                  const barHeight = (Math.min(incomePerPerson, maxChartVal) / maxChartVal) * (chartHeight - 40);
                  const y = chartHeight - barHeight - 25;

                  const isSelected = student.status === "completed";
                  const isDraft = student.status === "draft";
                  const color = isSelected 
                    ? (incomePerPerson <= 3000 ? "fill-rose-500 hover:fill-rose-600" : "fill-natural-accent hover:fill-natural-accent-hover")
                    : isDraft 
                    ? "fill-orange-300 hover:fill-orange-400"
                    : "fill-natural-divider hover:fill-natural-border";

                  return (
                    <g key={student.id} className="group cursor-pointer" onClick={() => onSelectStudent(student.id)}>
                      {/* Tooltip on hover */}
                      <title>{`${student.name}: ${incomePerPerson > 0 ? `${Math.round(incomePerPerson).toLocaleString()} บาท/คน/เดือน` : "ยังไม่ได้กรอกข้อมูล"}`}</title>
                      
                      {/* Bar shadow background */}
                      <rect 
                        x={x} 
                        y={15} 
                        width="22" 
                        height={chartHeight - 40} 
                        className="fill-natural-subtle opacity-0 group-hover:opacity-40"
                        rx="4"
                      />

                      {/* Actual value bar */}
                      {incomePerPerson > 0 && (
                        <rect 
                          x={x} 
                          y={y} 
                          width="22" 
                          height={barHeight} 
                          className={`${color} transition-all duration-500`}
                          rx="4"
                        />
                      )}

                      {/* Marker on top of bar */}
                      {incomePerPerson > 0 && (
                        <text x={x + 11} y={y - 6} className="text-[9px] font-bold fill-slate-500 text-center" textAnchor="middle">
                          {Math.round(incomePerPerson)}
                        </text>
                      )}

                      {/* Student nickname vertical on text label */}
                      <text 
                        x={x + 11} 
                        y={chartHeight - 8} 
                        className={`text-[9px] font-semibold text-center ${isSelected ? 'fill-slate-700 font-bold' : 'fill-slate-400'}`} 
                        textAnchor="middle"
                      >
                        {student.name}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Threshold indicator tag */}
              <div className="absolute right-2 top-[138px] bg-rose-50 text-rose-700 text-[10px] font-bold py-0.5 px-2 rounded-md border border-rose-100 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> ขีดพิจารณากลุ่มยากจนมาก (ต่ำกว่า 3,000 บ./เดือน)
              </div>
            </div>
          </div>
          
          {/* Legend indicators */}
          <div className="flex flex-wrap items-center justify-center gap-5 mt-4 pt-4 border-t border-natural-divider text-xs">
            <div className="flex items-center gap-1.5 text-natural-text">
              <span className="w-3 h-3 bg-rose-500 rounded-sm inline-block"></span>
              <span>เข้าเกณฑ์ยากจน (คนครัวเรือนเฉลี่ย ≤ 3,000)</span>
            </div>
            <div className="flex items-center gap-1.5 text-natural-text">
              <span className="w-3 h-3 bg-natural-accent rounded-sm inline-block"></span>
              <span>กรอกเสร็จ (รายได้เฉลี่ยเกิน 3,000)</span>
            </div>
            <div className="flex items-center gap-1.5 text-natural-text">
              <span className="w-3 h-3 bg-orange-300 rounded-sm inline-block"></span>
              <span>อยู่ระหว่างบันทึก (แบบร่าง)</span>
            </div>
            <div className="flex items-center gap-1.5 text-natural-text">
              <span className="w-3 h-3 bg-natural-divider rounded-sm inline-block"></span>
              <span>ไม่ได้กรอกข้อมูล</span>
            </div>
          </div>
        </div>

        {/* Real-time sync logs & stats summary */}
        <div className="bg-white p-6 rounded-2xl border border-natural-border shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-natural-dark text-lg flex items-center gap-2 mb-4 border-b border-natural-divider pb-3">
              <ClipboardList className="w-5 h-5 text-natural-accent" /> บันทึกกิจกรรมเรียลไทม์ (Live Logs)
            </h3>
            <div className="space-y-3.5 max-h-[200px] overflow-y-auto pr-1 text-xs">
              {logs.map((log) => (
                <div key={log.id} className="p-3 bg-natural-subtle/70 border border-natural-divider rounded-xl flex flex-col gap-1 transition-all duration-300">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-natural-dark">{log.studentName}</span>
                    <span className="text-[10px] font-mono text-natural-muted">{getRelativeTime(log.timestamp)}</span>
                  </div>
                  <div className="flex items-start gap-1 justify-between">
                    <p className="text-natural-text leading-tight">
                      <span className="font-bold text-natural-accent block sm:inline mr-1">[{log.action}]:</span>
                      {log.details}
                    </p>
                  </div>
                  <div className="text-[10px] text-natural-muted mt-0.5 text-right">
                    โดย: {log.user}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-natural-divider pt-4 mt-4 space-y-2.5">
            <h4 className="font-extrabold text-xs text-natural-dark">ตัวชี้วัดความขัดสนเชิงประจักษ์ (จากฟอร์มที่กรอกเสร็จ):</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-rose-50/50 rounded-lg border border-rose-100/50 flex flex-col gap-0.5">
                <span className="text-[10px] text-rose-750 font-bold">เลี้ยงเดี่ยว</span>
                <span className="font-extrabold text-rose-900">{singleParentCount} ครัวเรือน</span>
              </div>
              <div className="p-2 bg-orange-50/50 rounded-lg border border-orange-100/50 flex flex-col gap-0.5">
                <span className="text-[10px] text-orange-750 font-bold">มีสมาชิกพิการ</span>
                <span className="font-extrabold text-orange-900">{disabledBurdenCount} ครัวเรือน</span>
              </div>
              <div className="p-2 bg-natural-subtle rounded-lg border border-natural-border flex flex-col gap-0.5">
                <span className="text-[10px] text-natural-accent font-bold">มีผู้ว่างงาน</span>
                <span className="font-extrabold text-natural-dark">{unemployedBurdenCount} ครัวเรือน</span>
              </div>
              <div className="p-2 bg-natural-subtle rounded-lg border border-natural-border flex flex-col gap-0.5">
                <span className="text-[10px] text-natural-muted font-bold">มีผู้สูงอายุ</span>
                <span className="font-extrabold text-natural-dark">{elderlyBurdenCount} ครัวเรือน</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Class Overview Map-Card Details */}
      <div className="bg-natural-subtle p-5 rounded-2xl border border-natural-border grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white text-natural-accent rounded-xl shadow-xs mt-0.5">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-natural-dark">ข้อมูลโรงเรียน</h4>
            <p className="text-xs text-natural-muted mt-1 leading-relaxed">
              โรงเรียนบ้านเชียงพิณ หมู่ที่ 1 ตำบลบ้านเชียงพิณ อำเภอเมืองอุดรธานี จังหวัดอุดรธานี รหัสไปรษณีย์ 41000 
              สังกัดการศึกษารัฐบาลเขต 1 อุดรธานี
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-white text-emerald-700 rounded-xl shadow-xs mt-0.5">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-natural-dark">การอยู่อาศัยของนักเรียนที่ประเมินแล้ว</h4>
            <div className="flex flex-col gap-1 mt-1 text-xs text-natural-text">
              <div className="flex justify-between">
                <span>มีสถานะอยู่บ้านตนเอง:</span>
                <span className="font-bold text-natural-dark">{ownsHome} คน</span>
              </div>
              <div className="flex justify-between">
                <span>มีสถานะอยู่บ้านเช่า:</span>
                <span className="font-bold text-natural-dark">{rentsHome} คน</span>
              </div>
              <div className="flex justify-between">
                <span>อยู่ฟรี/หอพัก/อื่น ๆ:</span>
                <span className="font-bold text-natural-dark">{freeOther} คน</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-white text-orange-650 rounded-xl shadow-xs mt-0.5">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-natural-dark">เป้าหมายทุนอุดหนุน กสศ. ป.2</h4>
            <p className="text-xs text-natural-muted mt-1 leading-relaxed">
              เพื่อช่วยเหลือนักเรียนที่มีความขัดสนรุนแรงและขาดแคลนให้ได้รับการสนับสนุนทุนเรียนต่อภาคบังคับ 
              โดยมีการคัดกรองอย่างละเอียดด้วยฟอร์ม นร./กสศ.01 และยืนยันสภาพบ้านและลายเซ็นโดยครูและผู้ปกครอง
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
