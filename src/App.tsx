import { useState, useEffect } from "react";
import { Student, ActivityLog, FormData, FormStatus } from "./types";
import { Dashboard } from "./components/Dashboard";
import { StudentCard } from "./components/StudentCard";
import { FormEditor } from "./components/FormEditor";
import { 
  Users, Activity, Wifi, ShieldAlert, GraduationCap, LayoutDashboard, Database,
  Settings, UserCheck, HelpCircle, AlertCircle
} from "lucide-react";

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentUser, setCurrentUser] = useState<string>("นางสาวเบญจภรณ์ มโนสัมฤทธิ์");
  const [viewMode, setViewMode] = useState<"dashboard" | "students" | "logs">("dashboard");

  // Realtime SSE State
  const [syncStatus, setSyncStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [syncError, setSyncError] = useState<string | null>(null);

  // Gemini AI state
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  // Connect to the Realtime EventSource API
  useEffect(() => {
    let sse: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connectSSE = () => {
      setSyncStatus("connecting");
      sse = new EventSource("/api/realtime-stream");

      sse.onopen = () => {
        setSyncStatus("connected");
        setSyncError(null);
        console.log("Connected to real-time events stream.");
      };

      sse.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          console.log("Received realtime payload:", payload.type);
          if (payload.students) {
            setStudents(payload.students);
            // Sync selected student if currently opened
            if (selectedStudent) {
              const updated = payload.students.find((s: Student) => s.id === selectedStudent.id);
              if (updated) {
                setSelectedStudent(updated);
              }
            }
          }
          if (payload.logs) {
            setLogs(payload.logs);
          }
        } catch (err: any) {
          console.error("Error parsing stream content:", err);
        }
      };

      sse.onerror = (err) => {
        console.error("SSE stream disconnected:", err);
        setSyncStatus("disconnected");
        setSyncError("ตัดการเชื่อมต่อชั่วคราว - กำลังเชื่อมต่อใหม่...");
        sse?.close();

        // Attempt reconnection after 5 seconds
        reconnectTimeout = setTimeout(() => {
          connectSSE();
        }, 5000);
      };
    };

    connectSSE();

    return () => {
      sse?.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [selectedStudent?.id]);

  // Handle entering the edit session for a student
  const handleEditStudent = async (student: Student) => {
    try {
      // First, trigger a draft update on the server so other users see it as draft status instantly!
      const res = await fetch(`/api/students/${student.id}/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: currentUser })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedStudent(data.student);
      } else {
        setSelectedStudent(student);
      }
      setAiAnalysisResult(null); // Clear previous AI views
    } catch (err) {
      console.error("Failed to initialize draft on server:", err);
      setSelectedStudent(student);
    }
  };

  // Save student's form data (both as draft or completed)
  const handleSaveStudentForm = async (formData: FormData, status: FormStatus) => {
    if (!selectedStudent) return;
    const res = await fetch(`/api/students/${selectedStudent.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData, status, user: currentUser })
    });
    const data = await res.json();
    if (data.success) {
      setSelectedStudent(data.student);
    } else {
      throw new Error("Failed to save data on server");
    }
  };

  // Reset student form completely back to default pending state
  const handleResetStudent = async () => {
    if (!selectedStudent) return;
    try {
      const res = await fetch(`/api/students/${selectedStudent.id}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: currentUser })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedStudent(null);
      }
    } catch (err) {
      console.error("Failed to reset student:", err);
    }
  };

  // Invoke Gemini AI screening
  const handleTriggerAiAnalysis = async (formData: FormData) => {
    if (!selectedStudent) return;
    setIsAiLoading(true);
    setAiAnalysisResult(null);
    try {
      const res = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selectedStudent.id, formData })
      });
      const data = await res.json();
      if (data.analysis) {
        setAiAnalysisResult(data.analysis);
      } else if (data.error) {
        setAiAnalysisResult(`เกิดข้อผิดพลาดในการวิเคราะห์ AI: ${data.error}`);
      }
    } catch (err: any) {
      setAiAnalysisResult(`เกิดข้อผิดพลาดขาดการเชื่อมโยงเครือข่าย AI helper: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="bg-natural-bg min-h-screen font-sans flex flex-col text-natural-text" id="app-workspace">
      
      {/* Upper Navigation Sidebar or Header */}
      {!selectedStudent ? (
        <>
          {/* Main Top Header */}
          <header className="bg-white border-b border-natural-border py-4 px-6 sticky top-0 z-30 shadow-xs">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              
              {/* Logo Branding */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-natural-accent text-white rounded-xl shadow-sm">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="font-extrabold text-natural-dark text-base leading-snug sm:text-lg">
                    ระบบบันทึกข้อมูลสุขภาวะและขอรับทุน กสศ. (นร./กสศ.01)
                  </h1>
                  <p className="text-xs text-natural-muted font-medium">
                    ชั้นประถมศึกษาปีที่ 2 โรงเรียนบ้านเชียงพิณ | ครูผู้บันทึก: {currentUser}
                  </p>
                </div>
              </div>

              {/* Central Connection / Sync Indicators */}
              <div className="flex items-center gap-3">
                {syncStatus === "connected" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-natural-subtle text-natural-accent font-bold text-xs rounded-full border border-natural-border">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
                    เชื่อมโยงแบบเรียลไทม์แล้ว
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 / text-amber-700 font-bold text-xs rounded-full border border-amber-100">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce inline-block" />
                    {syncError || "กำลังต่อเชื่อมข้อมูล..."}
                  </span>
                )}

                <div className="text-xs text-natural-muted font-semibold hidden md:block border-l border-natural-border pl-3">
                  ปีการศึกษา 1/2569
                </div>
              </div>

            </div>
          </header>

          {/* Tab Navigation Rail */}
          <div className="bg-white border-b border-natural-border/60 py-1.5 px-4 mb-6">
            <div className="max-w-7xl mx-auto flex gap-1.5">
              <button
                onClick={() => setViewMode("dashboard")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "dashboard" 
                    ? "bg-natural-accent text-white shadow-xs" 
                    : "text-natural-muted hover:text-natural-dark hover:bg-natural-subtle"
                }`}
                id="tab-dashboard"
              >
                <LayoutDashboard className="w-4 h-4" />
                แผงวิเคราะห์ Dashboard ป.2
              </button>

              <button
                onClick={() => setViewMode("students")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "students" 
                    ? "bg-natural-accent text-white shadow-xs" 
                    : "text-natural-muted hover:text-natural-dark hover:bg-natural-subtle"
                }`}
                id="tab-students"
              >
                <Database className="w-4 h-4" />
                รายชื่อป้อนข้อมูลนักเรียน (10 คน)
              </button>
            </div>
          </div>

          {/* Tab Content Display Area */}
          <main className="max-w-7xl mx-auto px-4 flex-1 w-full">
            {viewMode === "dashboard" && (
              <Dashboard 
                students={students} 
                logs={logs}
                onSelectStudent={(id) => {
                  const s = students.find(item => item.id === id);
                  if (s) handleEditStudent(s);
                }}
              />
            )}

            {viewMode === "students" && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl border border-natural-border shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="font-extrabold text-natural-dark text-base leading-tight">
                      ทะเบียนประเมินความขัดสนรายบุคคล ชั้น ป.2
                    </h2>
                    <p className="text-xs text-natural-muted mt-1">
                      เลือกเด็กนักเรียนจากข้อมูลบัญชีชั้นเรียน เพื่อลงบันทึกรายละเอียดตามทะเบียนเยี่ยมบ้านจริง
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0 text-xs">
                    <span className="font-bold text-natural-muted">เข้าชมในฐานะ:</span>
                    <input 
                      type="text" 
                      value={currentUser}
                      onChange={(e) => setCurrentUser(e.target.value)}
                      className="border border-natural-border bg-natural-subtle px-3 py-1.5 rounded-lg font-bold text-natural-dark text-center focus:outline-none focus:border-natural-accent w-48"
                      placeholder="ระบุชื่อผู้กรอก"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {students.map((student) => (
                    <StudentCard 
                      key={student.id} 
                      student={student}
                      onEdit={handleEditStudent}
                    />
                  ))}
                </div>
              </div>
            )}
          </main>
        </>
      ) : (
        /* The Full screen replicate editor paper form (แบบ นร./กสศ.01) */
        <FormEditor
          student={selectedStudent}
          onBack={() => {
            setSelectedStudent(null);
            setViewMode("students");
          }}
          onSave={handleSaveStudentForm}
          onReset={handleResetStudent}
          isAiLoading={isAiLoading}
          aiAnalysisResult={aiAnalysisResult}
          onTriggerAiAnalysis={handleTriggerAiAnalysis}
          onClearAiAnalysis={() => setAiAnalysisResult(null)}
        />
      )}

      {/* Footer System Margin */}
      <footer className="mt-12 py-6 border-t border-natural-border/60 bg-white text-center text-xs text-natural-muted font-medium">
        <p>© 2569 โรงเรียนบ้านเชียงพิณ อบจ.อุดรธานี สพป.อุดรธานี เขต 1</p>
        <p className="mt-1 text-[11px] text-natural-muted/50">ระบบบันทึกความขัดสนเชื่อมโยงและคัดกรองจัดขึ้นภายในองค์กรแบบ Real-time sync</p>
      </footer>

    </div>
  );
}
