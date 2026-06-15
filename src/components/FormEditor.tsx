import React, { useState, useRef, useEffect } from "react";
import { Student, FormData, HouseholdMember, FormStatus } from "../types";
import { 
  ArrowLeft, Save, Eye, Sparkles, CheckCircle2, UserCheck, Trash2, 
  Plus, Edit2, AlertCircle, FileText, Camera, CheckSquare, RefreshCw, PenTool 
} from "lucide-react";

interface FormEditorProps {
  student: Student;
  onBack: () => void;
  onSave: (formData: FormData, status: FormStatus) => Promise<void>;
  onReset: () => void;
  isAiLoading: boolean;
  aiAnalysisResult: string | null;
  onTriggerAiAnalysis: (formData: FormData) => void;
  onClearAiAnalysis: () => void;
}

export const FormEditor: React.FC<FormEditorProps> = ({
  student,
  onBack,
  onSave,
  onReset,
  isAiLoading,
  aiAnalysisResult,
  onTriggerAiAnalysis,
  onClearAiAnalysis,
}) => {
  // Ensure we have form data, fallback to generated default
  const [formData, setFormData] = useState<FormData>(() => {
    if (student.formData) {
      return JSON.parse(JSON.stringify(student.formData));
    }
    // Generate default from init
    return {
      familyStatus: "พ่อแม่อยู่ด้วยกัน",
      staysWith: "พ่อ/แม่",
      guardianTitle: "นาย",
      guardianName: "",
      guardianSurname: "",
      guardianRelationship: "พ่อ",
      guardianEducation: "ประถมศึกษา",
      guardianOccupation: "เกษตรกร",
      guardianPhone: "",
      guardianNationalId: "",
      hasNoNationalId: false,
      hasWelfareCard: false,
      householdCount: 3,
      members: [
        {
          id: "1",
          name: `${student.title} ${student.name} ${student.surname}`,
          relationship: "ตัวนักเรียน",
          nationalId: student.nationalId,
          education: "กำลังศึกษาชั้น ป.2",
          age: 8,
          disabled: false,
          chronicDisease: false,
          incomeWage: 0,
          incomeAgriculture: 0,
          incomeBusiness: 0,
          incomeWelfare: 0,
          incomeOther: 0,
          incomeTotal: 0
        },
        {
          id: "2",
          name: "",
          relationship: "พ่อ",
          nationalId: "",
          education: "ประถมศึกษา",
          age: 36,
          disabled: false,
          chronicDisease: false,
          incomeWage: 3500,
          incomeAgriculture: 0,
          incomeBusiness: 0,
          incomeWelfare: 0,
          incomeOther: 0,
          incomeTotal: 3500
        },
        {
          id: "3",
          name: "",
          relationship: "แม่",
          nationalId: "",
          education: "ประถมศึกษา",
          age: 33,
          disabled: false,
          chronicDisease: false,
          incomeWage: 2500,
          incomeAgriculture: 0,
          incomeBusiness: 0,
          incomeWelfare: 0,
          incomeOther: 0,
          incomeTotal: 2500
        }
      ],
      hasDisabledBurden: false,
      hasChronicBurden: false,
      hasElderlyBurden: false,
      hasSingleParentBurden: false,
      hasUnemployedBurden: false,
      residencyType: "อยู่บ้านตนเอง",
      rentFee: 0,
      floorMaterial: "ไม้กระดาน",
      wallMaterial: "สังเกตจากฝาไม้/สังกะสี",
      roofMaterial: "โลหะ (เช่น สังกะสี/เหล็ก/อะลูมิเนียม)",
      hasToilet: "มี",
      hasAgriLand: false,
      agriLandSize: "น้อยกว่า 1 ไร่",
      drinkingWater: "น้ำประปา",
      electricitySource: "มีไฟฟ้า",
      electricityType: "ไฟบ้านหรือมิเตอร์",
      hasVehicle: false,
      vehicleCarOver15: false,
      vehicleCarUnder15: false,
      vehiclePickupOver15: false,
      vehiclePickupUnder15: false,
      vehicleTractorOver15: false,
      vehicleTractorUnder15: false,
      vehicleMotorcycle: false,
      hasNoAppliances: false,
      applianceComputer: false,
      applianceAircon: false,
      applianceTv: true,
      applianceWashingMachine: false,
      applianceFridge: true,
      travelMethod: "รถจักรยานยนต์ส่วนตัว",
      travelDistance: 2.0,
      travelTimeHour: 0,
      travelTimeMinute: 15,
      travelExpense: 100,
      dailyPocketMoney: 40,
      addressNo: "",
      addressMoo: "1",
      addressSoi: "",
      addressRoad: "",
      addressSubdistrict: "บ้านเชียงพิณ",
      addressDistrict: "เมืองอุดรธานี",
      addressProvince: "อุดรธานี",
      addressPostalCode: "41000",
      photoExterior: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600", // Standard beautiful Thai local typical field banner for external placeholder
      photoInterior: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&q=80&w=600",
      certifiedCorrect: true,
      studentSignature: "",
      guardianSignature: "",
      teacherSignature: "",
      principalSignature: "",
      surveyorName: "นางสาวเบญจภรณ์ มโนสัมฤทธิ์",
      surveyorPosition: "ครูประจำชั้น ป.2",
      recordDate: new Date().toISOString().split('T')[0]
    };
  });

  const [activeTab, setActiveTab] = useState<number>(1);
  const [saveStatus, setSaveStatus] = useState<string>("");

  // Refs for drawing canvases (Sig Pads)
  const studentSigCanvas = useRef<HTMLCanvasElement | null>(null);
  const guardianSigCanvas = useRef<HTMLCanvasElement | null>(null);
  const teacherSigCanvas = useRef<HTMLCanvasElement | null>(null);
  const principalSigCanvas = useRef<HTMLCanvasElement | null>(null);

  // States to track signature states
  const [isDrawStudent, setIsDrawStudent] = useState(false);
  const [isDrawGuardian, setIsDrawGuardian] = useState(false);
  const [isDrawTeacher, setIsDrawTeacher] = useState(false);
  const [isDrawPrincipal, setIsDrawPrincipal] = useState(false);

  // Canvas draw methods helper
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvasRef: React.RefObject<HTMLCanvasElement | null>, setDrawState: (v: boolean) => void) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1d4ed8"; // Blue color
    
    const pos = getMousePos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDrawState(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvasRef: React.RefObject<HTMLCanvasElement | null>, drawState: boolean) => {
    if (!drawState) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const pos = getMousePos(canvas, e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = (canvasRef: React.RefObject<HTMLCanvasElement | null>, setDrawState: (v: boolean) => void, fieldName: keyof FormData) => {
    setDrawState(false);
    // Export data URL from canvas to formData string
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      setFormData(prev => ({ ...prev, [fieldName]: dataUrl }));
    }
  };

  const getImgSignature = (fieldName: keyof FormData) => {
    return formData[fieldName] as string;
  };

  const getMousePos = (canvas: HTMLCanvasElement, e: any) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const clearSig = (canvasRef: React.RefObject<HTMLCanvasElement | null>, fieldName: keyof FormData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFormData(prev => ({ ...prev, [fieldName]: "" }));
  };

  // Helper inside members to autocalculate row total
  const updateMemberField = (id: string, field: keyof HouseholdMember, value: any) => {
    const updatedMembers = formData.members.map(member => {
      if (member.id === id) {
        const u = { ...member, [field]: value };
        // Check if numeric column to recalculate total
        if (field.toString().startsWith("income") && field !== "incomeTotal") {
          u.incomeTotal = 
            (Number(u.incomeWage) || 0) + 
            (Number(u.incomeAgriculture) || 0) + 
            (Number(u.incomeBusiness) || 0) + 
            (Number(u.incomeWelfare) || 0) + 
            (Number(u.incomeOther) || 0);
        }
        return u;
      }
      return member;
    });

    setFormData(prev => ({
      ...prev,
      members: updatedMembers,
      householdCount: updatedMembers.length
    }));
  };

  const addHouseholdMember = () => {
    const newId = (formData.members.length + 1).toString();
    const newMember: HouseholdMember = {
      id: newId,
      name: "",
      relationship: "น้อง",
      nationalId: "",
      education: "ยังไม่ได้เข้าเรียน",
      age: 4,
      disabled: false,
      chronicDisease: false,
      incomeWage: 0,
      incomeAgriculture: 0,
      incomeBusiness: 0,
      incomeWelfare: 0,
      incomeOther: 0,
      incomeTotal: 0
    };

    const newMembers = [...formData.members, newMember];
    setFormData(prev => ({
      ...prev,
      members: newMembers,
      householdCount: newMembers.length
    }));
  };

  const deleteHouseholdMember = (id: string) => {
    if (formData.members.length <= 1) return; // Prevent deleting student
    const newMembers = formData.members.filter(m => m.id !== id);
    setFormData(prev => ({
      ...prev,
      members: newMembers,
      householdCount: newMembers.length
    }));
  };

  const calculateHouseholdIncomes = () => {
    const total = formData.members.reduce((sum, m) => sum + (Number(m.incomeTotal) || 0), 0);
    const avg = formData.householdCount > 0 ? total / formData.householdCount : 0;
    return { total, avg };
  };

  const { total: totalIncome, avg: avgIncome } = calculateHouseholdIncomes();

  const handleSaveDraft = async () => {
    setSaveStatus("saving_draft");
    try {
      await onSave(formData, "draft");
      setSaveStatus("saved_draft");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch {
      setSaveStatus("error");
    }
  };

  const handleSaveComplete = async () => {
    setSaveStatus("saving_complete");
    try {
      await onSave(formData, "completed");
      setSaveStatus("saved_complete");
      setTimeout(() => {
        setSaveStatus("");
        onBack();
      }, 1500);
    } catch {
      setSaveStatus("error");
    }
  };

  const handleResetForm = () => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะรีเซ็ตแบบฟอร์มนักเรียนคนนี้? ข้อมูลที่เคยกรอกรวมทั้งลายเซ็นจะถูกลบทั้งหมด.")) {
      onReset();
    }
  };

  // Populate dynamic pre-existing signatures on canvas load
  useEffect(() => {
    const loadSigUrlToCanvas = (canvasRef: React.RefObject<HTMLCanvasElement | null>, url: string) => {
      const canvas = canvasRef.current;
      if (!canvas || !url) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = url;
    };

    if (activeTab === 5) {
      setTimeout(() => {
        loadSigUrlToCanvas(studentSigCanvas, formData.studentSignature);
        loadSigUrlToCanvas(guardianSigCanvas, formData.guardianSignature);
        loadSigUrlToCanvas(teacherSigCanvas, formData.teacherSignature);
        loadSigUrlToCanvas(principalSigCanvas, formData.principalSignature);
      }, 300);
    }
  }, [activeTab]);

  return (
    <div className="bg-natural-bg min-h-screen pb-12" id="form-editor-container">
      {/* Upper Navigation and Header Banner */}
      <div className="bg-white border-b border-natural-border sticky top-0 z-40 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-natural-subtle rounded-lg text-natural-muted hover:text-natural-dark transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-natural-subtle text-natural-accent rounded px-2 py-0.5">แบบ นร./กสศ.01 : ชั้น ป.2</span>
                <span className="text-natural-border">|</span>
                <span className="text-xs text-natural-muted font-mono">ID {student.id}</span>
              </div>
              <h2 className="text-lg font-extrabold text-natural-dark">
                แบบขอรับทุน - {student.title}{student.name} {student.surname}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleResetForm}
              className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors border border-rose-100 cursor-pointer"
            >
              รีเซ็ตข้อมูลนักเรียน
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={saveStatus !== ""}
              className="px-4 py-2 bg-natural-subtle hover:bg-natural-border text-natural-text border border-natural-border rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {saveStatus === "saving_draft" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saveStatus === "saved_draft" ? "บันทึกแบบร่างสำเร็จ" : "บันทึกข้อมูลชั่วคราว"}
            </button>
            <button
              onClick={handleSaveComplete}
              disabled={saveStatus !== ""}
              className="px-5 py-2 bg-natural-accent hover:bg-natural-accent-hover text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {saveStatus === "saving_complete" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              {saveStatus === "saved_complete" ? "ส่งสำเร็จ..." : "บันทึกเสร็จสมบูรณ์"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Multi-Tab Grid Workspace */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left step markers menu */}
          <div className="lg:col-span-1 space-y-2">
            <div className="bg-white p-4 rounded-xl border border-natural-border shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-natural-muted tracking-wider block mb-2 px-2.5">ลำดับการกรอกเอกสาร</span>
              {[
                { step: 1, label: "1. ข้อมูลนักเรียนและผู้ปกครอง" },
                { step: 2, label: "2. รายชื่อและรายได้สมาชิก" },
                { step: 3, label: "3. สถานะและวัสดุที่อยู่อาศัย" },
                { step: 4, label: "4. แหล่งน้ำ, ไฟฟ้า, ทรัพย์สิน" },
                { step: 5, label: "5. การดินทางแลที่อยู่ปัจจุบัน" },
                { step: 6, label: "6. ภาพถ่ายยืนยัน & ลายเซ็นต์" }
              ].map((tab) => (
                <button
                  key={tab.step}
                  onClick={() => {
                    onClearAiAnalysis();
                    setActiveTab(tab.step);
                  }}
                  className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    activeTab === tab.step 
                      ? "bg-natural-subtle text-natural-accent font-bold border-l-4 border-natural-accent pl-4" 
                      : "text-natural-text hover:bg-natural-subtle"
                  }`}
                >
                  <span>{tab.label}</span>
                  {activeTab > tab.step && <CheckCircle2 className="w-4 h-4 text-emerald-500 inline shrink-0 ml-1" />}
                </button>
              ))}
            </div>

            {/* Income threshold diagnostic side box */}
            <div className="bg-white p-4 rounded-xl border border-natural-border shadow-xs space-y-3.5">
              <span className="text-[10px] uppercase font-bold text-natural-muted tracking-wider block border-b border-natural-divider pb-1.5">ผลวิเคราะห์เกณฑ์ กสศ. ทันที</span>
              
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-natural-muted">รายได้รวมของครอบครัว (เดือน):</span>
                <span className="text-base font-bold text-natural-dark">
                  {totalIncome.toLocaleString()} บาท/เดือน
                </span>
              </div>

              <div className="flex flex-col gap-1 w-full bg-natural-subtle p-3 rounded-lg border border-natural-border text-center">
                <span className="text-[11px] text-natural-muted font-semibold">เฉลี่ยของสมาชิกทุกคนในบ้าน:</span>
                <span className={`text-xl font-black ${avgIncome <= 3000 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {Math.round(avgIncome).toLocaleString()} บ./คน
                </span>
                <span className="text-[10px] text-natural-muted block mt-0.5">
                  หารสมาชิกทั้งหมด: {formData.householdCount} คน
                </span>
              </div>

              {avgIncome <= 3000 ? (
                <div className="bg-emerald-50 text-emerald-800 text-xs px-3 py-2.5 rounded-lg border border-emerald-100 flex items-start gap-2 leading-relaxed">
                  <UserCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[11px] font-bold">เด็กอยู่ในเกณฑ์สนับสนุน</strong>
                    รายได้เฉลี่ยไม่เกิน 3,000 บาท/คน/เดือน ผ่านสิทธิ์ตามนโยบายระดับชาติ
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 text-rose-800 text-xs px-3 py-2.5 rounded-lg border border-rose-100 flex items-start gap-2 leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[11px] font-bold">เกินฐานเกณฑ์รายได้หลัก</strong>
                    รายได้เฉลี่ยมากกว่า 3,000 บาท แต่อาจได้รับการเสนอจากสภาวะความขัดสนอื่นๆ
                  </div>
                </div>
              )}
            </div>

            {/* AI Assistant Quick Tool */}
            <div className="bg-gradient-to-br from-natural-accent to-natural-accent-hover text-white p-5 rounded-2xl shadow-sm border border-natural-accent mt-4 relative overflow-hidden">
              <div className="absolute right-[-15px] top-[-15px] p-6 bg-white/10 rounded-full">
                <Sparkles className="w-8 h-8 opacity-20" />
              </div>
              
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span className="text-xs font-bold uppercase tracking-wider text-natural-subtle">AI ช่วยเหลือครูประจำชั้น</span>
                </div>
                <h3 className="font-bold text-sm tracking-tight leading-snug">
                  วิเคราะห์สิทธิและเกณฑ์ กสศ. พร้อมร่างรายงานความยากจน
                </h3>
                <p className="text-[11px] text-white/95 leading-relaxed font-light">
                  วิเคราะห์สภาพวัสดุ สังคม ภาระครัวเรือน และประมวลความจำเป็นสุภาพเป็นทางการเพื่อยื่นบอร์ดโรงเรียน
                </p>
                <button
                  type="button"
                  onClick={() => onTriggerAiAnalysis(formData)}
                  disabled={isAiLoading}
                  className="w-full py-2 bg-white text-natural-accent hover:bg-natural-subtle text-xs font-extrabold rounded-lg hover:text-natural-accent-hover active:bg-natural-subtle cursor-pointer shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isAiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {isAiLoading ? "กำลังประมวลผล..." : "ให้ AI ดราฟต์รายงานคุณครู"}
                </button>
              </div>
            </div>
          </div>

          {/* Right editing sheets */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Display AI Results if loaded */}
            {aiAnalysisResult && (
              <div className="bg-white p-6 rounded-xl border border-natural-accent/30 shadow-md relative overflow-hidden ring-2 ring-natural-accent/15">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-natural-accent" />
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-natural-dark text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-natural-accent fill-natural-accent" /> ผลการวิเคราะห์และร่างข้อเสนอแนะโดย Gemini AI
                  </h3>
                  <button 
                    onClick={onClearAiAnalysis}
                    className="text-xs text-natural-muted hover:text-natural-dark font-semibold cursor-pointer"
                  >
                    ปิดรายงาน
                  </button>
                </div>
                
                {/* Clean formatted output box */}
                <div className="bg-natural-subtle border border-natural-border p-4 rounded-lg text-xs text-natural-text leading-relaxed whitespace-pre-line font-medium">
                  {aiAnalysisResult}
                </div>

                <div className="mt-3.5 flex items-center justify-between text-[11px] text-natural-muted">
                  <span>* คุณครูสามารถคัดลอกส่วนข้อมูล &quot;ความเห็นของครูผู้วิจัย&quot; ไปส่งลงในใบสมัครได้โดยตรง</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiAnalysisResult || "");
                      alert("คัดลอกรายงานสำเร็จ!");
                    }}
                    className="px-2.5 py-1 bg-natural-subtle hover:bg-natural-border text-natural-accent font-bold rounded cursor-pointer"
                  >
                    คัดลอกเอกสาร
                  </button>
                </div>
              </div>
            )}

            {/* The Tab content sheets */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs min-h-[300px]">
              
              {/* TAB 1: ข้อมูลนักเรียนและผู้ปกครอง */}
              {activeTab === 1 && (
                <div className="space-y-6">
                  <h3 className="font-extrabold text-slate-800 text-lg border-b border-slate-50 pb-2">
                    ตอนที่ 1: ข้อมูลนักเรียนและผู้ปกครองเบื้องต้น
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">ชื่อนักเรียน</label>
                      <input 
                        type="text" 
                        disabled 
                        value={`${student.title}${student.name} ${student.surname}`}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 font-semibold text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">เลขประจำตัวประชาชน</label>
                      <input 
                        type="text" 
                        disabled 
                        value={student.nationalId}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 font-semibold text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">สถานภาพครอบครัว</label>
                      <select 
                        value={formData.familyStatus}
                        onChange={(e) => setFormData(prev => ({ ...prev, familyStatus: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-semibold text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option value="พ่อแม่อยู่ด้วยกัน">พ่อแม่อยู่ด้วยกัน</option>
                        <option value="พ่อแม่แยกกันอยู่">พ่อแม่แยกกันอยู่</option>
                        <option value="พ่อแม่หย่าร้าง">พ่อแม่หย่าร้าง</option>
                        <option value="พ่อเสียชีวิต/สาบสูญ">พ่อเสียชีวิต/สาบสูญ</option>
                        <option value="แม่เสียชีวิต/สาบสูญ">แม่เสียชีวิต/สาบสูญ</option>
                        <option value="เสียชีวิตทั้งคู่/สาบสูญ">เสียชีวิตทั้งคู่/สาบสูญ</option>
                        <option value="พ่อ/แม่ทอดทิ้ง">พ่อ/แม่ทอดทิ้ง</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">นักเรียนอาศัยอยู่กับใคร</label>
                      <select 
                        value={formData.staysWith}
                        onChange={(e) => setFormData(prev => ({ ...prev, staysWith: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-semibold text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option value="พ่อ/แม่">พ่อ/แม่</option>
                        <option value="ญาติ">ญาติ</option>
                        <option value="อยู่ลำพัง">อยู่ลำพัง</option>
                        <option value="ผู้อุปการะ/นายจ้าง">ผู้อุปการะ/นายจ้าง</option>
                        <option value="ครัวเรือนสถาบัน">ครัวเรือนสถาบัน (เช่น วัด, สถานสงเคราะห์)</option>
                      </select>
                    </div>
                  </div>

                  {/* Guardian section */}
                  <div className="pt-5 mt-4 border-t border-slate-100">
                    <h4 className="font-bold text-sm text-slate-700 mb-3.5">ข้อมูลผู้ปกครอง (ผู้ทำข้อมูล / รับเงินอุดหนุน)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1">คำนำหน้า</label>
                        <select
                          value={formData.guardianTitle}
                          onChange={(e) => setFormData(prev => ({ ...prev, guardianTitle: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-semibold text-sm focus:outline-none focus:border-blue-500"
                        >
                          <option value="นาย">นาย</option>
                          <option value="นาง">นาง</option>
                          <option value="นางสาว">นางสาว</option>
                        </select>
                      </div>

                      <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1">ชื่อ</label>
                        <input
                          type="text"
                          required
                          placeholder="ชื่อสะกดภาษาไทย"
                          value={formData.guardianName}
                          onChange={(e) => setFormData(prev => ({ ...prev, guardianName: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1">นามสกุล</label>
                        <input
                          type="text"
                          required
                          placeholder="นามสกุลสะกดภาษาไทย"
                          value={formData.guardianSurname}
                          onChange={(e) => setFormData(prev => ({ ...prev, guardianSurname: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1">ความสัมพันธ์กับนักเรียน</label>
                        <input
                          type="text"
                          placeholder="เช่น พ่อ, แม่, ปู่, ย่า, ตา, ยาย, ป้า"
                          value={formData.guardianRelationship}
                          onChange={(e) => setFormData(prev => ({ ...prev, guardianRelationship: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1">เบอร์โทรศัพท์ติดต่อ</label>
                        <input
                          type="text"
                          placeholder="เช่น 089-xxxxxxx"
                          value={formData.guardianPhone}
                          onChange={(e) => setFormData(prev => ({ ...prev, guardianPhone: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1">เลขประจำตัวประชาชนผู้ปกครอง</label>
                        <input
                          type="text"
                          placeholder="ตัวอย่าง 1-xxx-xxxxx-xx-x"
                          value={formData.guardianNationalId}
                          onChange={(e) => setFormData(prev => ({ ...prev, guardianNationalId: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1">การศึกษาสูงสุดผู้ปกครอง</label>
                        <select
                          value={formData.guardianEducation}
                          onChange={(e) => setFormData(prev => ({ ...prev, guardianEducation: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-semibold text-sm focus:outline-none focus:border-blue-500"
                        >
                          <option value="ไม่ได้เรียนหนังสือ">ไม่ได้เรียนหนังสือ</option>
                          <option value="ประถมศึกษา">ประถมศึกษา</option>
                          <option value="มัธยมศึกษาตอนต้น">มัธยมศึกษาตอนต้น</option>
                          <option value="มัธยมศึกษาตอนปลาย / ปวช.">มัธยมศึกษาตอนปลาย / ปวช.</option>
                          <option value="อนุปริญญา / ปวส.">อนุปริญญา / ปวส.</option>
                          <option value="ปริญญาตรีขึ้นไป">ปริญญาตรีขึ้นไป</option>
                        </select>
                      </div>

                      <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1">อาชีพหลัก</label>
                        <input
                          type="text"
                          placeholder="เช่น ทำนา, รับจ้างทั่วไป"
                          value={formData.guardianOccupation}
                          onChange={(e) => setFormData(prev => ({ ...prev, guardianOccupation: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="col-span-1 flex items-center mt-5">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 select-none cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.hasWelfareCard}
                            onChange={(e) => setFormData(prev => ({ ...prev, hasWelfareCard: e.target.checked }))}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span>ได้รับบัตรสวัสดิการแห่งรัฐ (ทะเบียนคนจน)</span>
                        </label>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: จำนวนสมาชิกและรายได้ */}
              {activeTab === 2 && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-50 pb-2">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-lg leading-tight">
                        ตอนที่ 2: สมาชิกภายในบ้านและรายได้ต่อเดือนแยกตามประเภท (บาท)
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        สมาชิกที่ติดต่อใช้ชีวิตและใช้ค่าใช้จ่ายร่วมกันในครอบครัวตั้งแต่ 3 เดือนขึ้นไป (รวมนักเรียนด้วย)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addHouseholdMember}
                      className="px-3.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> เพิ่มชื่อสมาชิกในบ้าน
                    </button>
                  </div>

                  <div className="w-full overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-100 min-w-[1000px] text-xs">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th className="border border-slate-100 p-2.5 text-center w-8">คนที่</th>
                          <th className="border border-slate-100 p-2.5 text-left w-36">ชื่อ-นามสกุล</th>
                          <th className="border border-slate-100 p-2.5 text-left w-20">ความสัมพันธ์</th>
                          <th className="border border-slate-100 p-2.5 text-left w-24">เลขบัตรประชาชน / อายุ</th>
                          <th className="border border-slate-100 p-2.5 text-center w-8">พิการ</th>
                          <th className="border border-slate-100 p-2.5 text-center w-8">ป่วยเรื้อรัง</th>
                          <th className="border border-slate-100 p-2.5 text-right w-20">ค่าจ้าง/เงินเดือน</th>
                          <th className="border border-slate-100 p-2.5 text-right w-20">เกษตรกรรม(หลังหักทุน)</th>
                          <th className="border border-slate-100 p-2.5 text-right w-20">ธุรกิจ(หลังหักทุน)</th>
                          <th className="border border-slate-100 p-2.5 text-right w-20">สวัสดิการรัฐ(บำนาญ/คนแก่)</th>
                          <th className="border border-slate-100 p-2.5 text-right w-20">รายได้อื่นๆ</th>
                          <th className="border border-slate-100 p-2.5 text-right w-24 font-bold col-span-1 bg-blue-50/20">รายได้รวม/เดือน</th>
                          <th className="border border-slate-100 p-2.5 text-center w-10">ลบ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.members.map((member, idx) => (
                          <tr key={member.id} className="hover:bg-slate-50/30">
                            <td className="border border-slate-100 p-2 text-center text-slate-400 font-bold">{idx + 1}</td>
                            
                            <td className="border border-slate-100 p-1.5">
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) => updateMemberField(member.id, "name", e.target.value)}
                                className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500"
                                placeholder="ชื่อ นามสกุล"
                              />
                            </td>

                            <td className="border border-slate-100 p-1.5">
                              <select
                                value={member.relationship}
                                onChange={(e) => updateMemberField(member.id, "relationship", e.target.value)}
                                className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs"
                              >
                                <option value="ตัวนักเรียน">ตัวนักเรียน</option>
                                <option value="พ่อ">พ่อ</option>
                                <option value="แม่">แม่</option>
                                <option value="ปู่">ปู่</option>
                                <option value="ย่า">ย่า</option>
                                <option value="ตา">ตา</option>
                                <option value="ยาย">ยาย</option>
                                <option value="พี่">พี่</option>
                                <option value="น้อง">น้อง</option>
                                <option value="ลุง/ป้า/น้า/อา">ลุง/ป้า/น้า/อา</option>
                                <option value="ผู้อุปการะ">ผู้อุปการะ</option>
                              </select>
                            </td>

                            <td className="border border-slate-100 p-1.5">
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  value={member.nationalId}
                                  onChange={(e) => updateMemberField(member.id, "nationalId", e.target.value)}
                                  className="w-2/3 border border-slate-200 rounded px-1.5 py-1 text-xs"
                                  placeholder="เลขบัตรประชาชน"
                                />
                                <input
                                  type="number"
                                  value={member.age}
                                  onChange={(e) => updateMemberField(member.id, "age", parseInt(e.target.value) || 0)}
                                  className="w-1/3 border border-slate-200 rounded px-1 py-1 text-xs"
                                  placeholder="อายุ"
                                />
                              </div>
                            </td>

                            <td className="border border-slate-100 p-1 text-center">
                              <input
                                type="checkbox"
                                checked={member.disabled}
                                onChange={(e) => updateMemberField(member.id, "disabled", e.target.checked)}
                                className="w-3.5 h-3.5 cursor-pointer accent-blue-600 rounded"
                              />
                            </td>

                            <td className="border border-slate-100 p-1 text-center">
                              <input
                                type="checkbox"
                                checked={member.chronicDisease}
                                onChange={(e) => updateMemberField(member.id, "chronicDisease", e.target.checked)}
                                className="w-3.5 h-3.5 cursor-pointer accent-blue-600 rounded"
                              />
                            </td>

                            <td className="border border-slate-100 p-1.5">
                              <input
                                type="number"
                                value={member.incomeWage === 0 ? "0" : member.incomeWage}
                                onChange={(e) => updateMemberField(member.id, "incomeWage", Number(e.target.value) || 0)}
                                className="w-full border border-slate-200 rounded px-1.5 py-1 text-right font-mono"
                              />
                            </td>

                            <td className="border border-slate-100 p-1.5">
                              <input
                                type="number"
                                value={member.incomeAgriculture === 0 ? "0" : member.incomeAgriculture}
                                onChange={(e) => updateMemberField(member.id, "incomeAgriculture", Number(e.target.value) || 0)}
                                className="w-full border border-slate-200 rounded px-1.5 py-1 text-right font-mono"
                              />
                            </td>

                            <td className="border border-slate-100 p-1.5">
                              <input
                                type="number"
                                value={member.incomeBusiness === 0 ? "0" : member.incomeBusiness}
                                onChange={(e) => updateMemberField(member.id, "incomeBusiness", Number(e.target.value) || 0)}
                                className="w-full border border-slate-200 rounded px-1.5 py-1 text-right font-mono"
                              />
                            </td>

                            <td className="border border-slate-100 p-1.5">
                              <input
                                type="number"
                                value={member.incomeWelfare === 0 ? "0" : member.incomeWelfare}
                                onChange={(e) => updateMemberField(member.id, "incomeWelfare", Number(e.target.value) || 0)}
                                className="w-full border border-slate-200 rounded px-1.5 py-1 text-right font-mono"
                              />
                            </td>

                            <td className="border border-slate-100 p-1.5">
                              <input
                                type="number"
                                value={member.incomeOther === 0 ? "0" : member.incomeOther}
                                onChange={(e) => updateMemberField(member.id, "incomeOther", Number(e.target.value) || 0)}
                                className="w-full border border-slate-200 rounded px-1.5 py-1 text-right font-mono"
                              />
                            </td>

                            <td className="border border-slate-100 p-1.5 font-bold text-slate-800 text-right bg-slate-50/20 font-mono">
                              {(member.incomeTotal || 0).toLocaleString()}
                            </td>

                            <td className="border border-slate-100 p-1 text-center">
                              {member.relationship !== "ตัวนักเรียน" ? (
                                <button
                                  type="button"
                                  onClick={() => deleteHouseholdMember(member.id)}
                                  className="p-1 hover:bg-rose-50 text-rose-500 rounded transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-300">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50/40 font-bold border-t-2 border-slate-200 text-slate-800">
                          <td colSpan={6} className="border border-slate-100 p-3 text-right">รวมรายได้ครัวเรือนทั้งหมด / เดือน:</td>
                          <td colSpan={5} className="border border-slate-100 p-3 text-right font-mono text-base font-extrabold text-blue-700">
                            {totalIncome.toLocaleString()} บาท/เดือน
                          </td>
                          <td className="border border-slate-100 p-3 text-right bg-blue-50/40 text-blue-800 font-extrabold font-mono text-base">
                            {Math.round(avgIncome).toLocaleString()} บ./คน
                          </td>
                          <td className="border border-slate-100"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: ข้อมูลสถานะและลักษณะที่อยู่ */}
              {activeTab === 3 && (
                <div className="space-y-6">
                  <h3 className="font-extrabold text-slate-800 text-lg border-b border-slate-50 pb-2">
                    ตอนที่ 3.1 & 3.2: ภาระพึ่งพิงและการอยู่ศัยในบ้าน
                  </h3>

                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2.5">
                      3.1 ข้อมูลภาระพึ่งพิง (เลือกเครื่องหมายถูก ได้ทุกข้อที่เป็นจริง)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs text-slate-600 font-semibold select-none">
                      <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded border border-slate-50">
                        <input
                          type="checkbox"
                          checked={formData.hasDisabledBurden}
                          onChange={(e) => setFormData(prev => ({ ...prev, hasDisabledBurden: e.target.checked }))}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        <span>มีความพิการทางร่างกาย/สติปัญญา</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded border border-slate-50">
                        <input
                          type="checkbox"
                          checked={formData.hasChronicBurden}
                          onChange={(e) => setFormData(prev => ({ ...prev, hasChronicBurden: e.target.checked }))}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        <span>มีสมาชิกโรคเรื้อรัง (ยกเว้นดัน/เบาหวาน)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded border border-slate-50">
                        <input
                          type="checkbox"
                          checked={formData.hasElderlyBurden}
                          onChange={(e) => setFormData(prev => ({ ...prev, hasElderlyBurden: e.target.checked }))}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        <span>มีผู้สูงอายุตั้งแต่ 60 ปีขึ้นไป</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded border border-slate-50">
                        <input
                          type="checkbox"
                          checked={formData.hasSingleParentBurden}
                          onChange={(e) => setFormData(prev => ({ ...prev, hasSingleParentBurden: e.target.checked }))}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        <span>ครอบครัวมีสถานะ พ่อ/แม่เลี้ยงเดี่ยว</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded border border-slate-50">
                        <input
                          type="checkbox"
                          checked={formData.hasUnemployedBurden}
                          onChange={(e) => setFormData(prev => ({ ...prev, hasUnemployedBurden: e.target.checked }))}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        <span>มีคนอายุ 15-65 ปีว่างงาน (ไม่ใช่ นร./พึ่งพิง)</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">3.2 สถานะการอยู่อาศัย</label>
                      <select 
                        value={formData.residencyType}
                        onChange={(e) => setFormData(prev => ({ ...prev, residencyType: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-semibold text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option value="อยู่บ้านตนเอง">อยู่บ้านตนเอง / เจ้าของบ้าน</option>
                        <option value="อยู่บ้านเช่า">อยู่บ้านเช่า (เสียค่าเช่าเป็นเงินสดรายเดือน)</option>
                        <option value="อยู่กับผู้อื่น">อยู่กับผู้อื่น / อยู่ฟรี (ไม่ต้องจ่ายเงิน)</option>
                        <option value="หอพัก">หอพัก</option>
                      </select>
                    </div>

                    {formData.residencyType === "อยู่บ้านเช่า" && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">ค่าเช่าต่อเดือน (บาท)</label>
                        <input 
                          type="number"
                          placeholder="ระบุกรณีเช่าบ้าน"
                          value={formData.rentFee === 0 ? "" : formData.rentFee}
                          onChange={(e) => setFormData(prev => ({ ...prev, rentFee: Number(e.target.value) || 0 }))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* 3.3 ลักษณะที่เห็นประจักษ์ */}
                  <div className="pt-5 mt-4 border-t border-slate-100">
                    <h3 className="font-extrabold text-slate-800 text-base mb-3.5">
                      3.3 ลักษณะที่อยู่อาศัยด้านกายภาพ (บันทึกข้อมูลจากที่เห็นในการเยี่ยมบ้าน)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">วัสดุทำพื้นบ้าน</label>
                        <select
                          value={formData.floorMaterial}
                          onChange={(e) => setFormData(prev => ({ ...prev, floorMaterial: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-semibold text-xs text-slate-600 focus:outline-none"
                        >
                          <option value="ไม้กระดาน">ไม้กระดาน</option>
                          <option value="กระเบื้อง/เซรามิค">กระเบื้อง/เซรามิค</option>
                          <option value="ปาเก้/ไม้ขัดเงา">ปาเก้/ไม้ขัดเงา</option>
                          <option value="ซีเมนต์เปลือย">ซีเมนต์เปลือย</option>
                          <option value="เสื่อน้ำมัน/เสื่อไผ่">ไวนิล/กระเบื้องยาง/เสื่อน้ำมัน</option>
                          <option value="ไม้ไผ่">ไม้ไผ่</option>
                          <option value="ดิน/ทราย">ดิน/ทราย</option>
                          <option value="อื่น ๆ">อื่นๆ</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">วัสดุทำฝาบ้าน</label>
                        <select
                          value={formData.wallMaterial}
                          onChange={(e) => setFormData(prev => ({ ...prev, wallMaterial: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-semibold text-xs text-slate-600 focus:outline-none"
                        >
                          <option value="ฝาไม้/ไม้กระดาน">ฝาไม้/ไม้กระดาน</option>
                          <option value="ฉาบซีเมนต์">ฉาบซีเมนต์</option>
                          <option value="อิฐ/ก้อนปูน/อิฐบล็อก">อิฐ/ก้อนปูน/อิฐบล็อก</option>
                          <option value="สังกะสี">สังกะสี</option>
                          <option value="ไม้อัด">ไม้อัด</option>
                          <option value="สมาร์ทบอร์ด/ไฟเบอร์บอร์ด">สมาร์ทบอร์ด (ไฟเบอร์บอร์ด)</option>
                          <option value="ไม้ไผ่/เศษวัสดุแผ่นไม้">ไม้ไผ่/เศษไม้</option>
                          <option value="ดินและวัสดุชั่วคราว">ดิน และวัสดุชั่วคราวอื่นๆ</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">หลังคาบ้าน</label>
                        <select
                          value={formData.roofMaterial}
                          onChange={(e) => setFormData(prev => ({ ...prev, roofMaterial: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-semibold text-xs text-slate-600 focus:outline-none"
                        >
                          <option value="โลหะ (เช่น สังกะสี/เหล็ก/อะลูมิเนียม)">สังกะสี / เมทัลชีท / โลหะ</option>
                          <option value="กระเบื้อง/เซรามิค">กระเบื้องซีเมนต์ / เซรามิค</option>
                          <option value="ไม้กระดาน">ไม้กระดาน</option>
                          <option value="ใบไม้/พืชธรรมชาติ">ใบไม้ / แฝก / หญ้าธรรมชาติ</option>
                          <option value="กระดาษมัน/ไวนิลพลาสติก">ไวนิล / ผ้าใบพลาสติกหนา</option>
                          <option value="อื่น ๆ">อื่นๆ</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">มีห้องส้วมในบ้านหรือไม่</label>
                        <select
                          value={formData.hasToilet}
                          onChange={(e) => setFormData(prev => ({ ...prev, hasToilet: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-semibold text-xs text-slate-600 focus:outline-none"
                        >
                          <option value="มี">มีห้องส้วมถูกหลักอนามัยภายในบ้าน</option>
                          <option value="ไม่มี">ไม่มีห้องส้วมภายในบ้าน / ชั่วคราวข้างนอก</option>
                        </select>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ที่ดิน แหล่งน้ำ แหล่งไฟ และ สินทรัพย์หรูหรา */}
              {activeTab === 4 && (
                <div className="space-y-6">
                  <h3 className="font-extrabold text-slate-800 text-lg border-b border-slate-50 pb-2">
                    ตอนที่ 3.4 - 3.8: สาธารณูปโภคและสิ่งบ่งชี้เศรษฐกิจในบ้าน
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    {/* Farmland */}
                    <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-xl space-y-3">
                      <h4 className="font-bold text-xs text-slate-600">3.4 ที่ดินทำการเกษตร (รวมเช่า)</h4>
                      <label className="flex items-center gap-2 text-xs font-semibold select-none cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.hasAgriLand}
                          onChange={(e) => setFormData(prev => ({ ...prev, hasAgriLand: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span>ครอบครัวมีที่ดินทำการเกษตร</span>
                      </label>
                      {formData.hasAgriLand && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">ขนาดที่ดิน</label>
                          <select
                            value={formData.agriLandSize}
                            onChange={(e) => setFormData(prev => ({ ...prev, agriLandSize: e.target.value }))}
                            className="w-full border border-slate-200 rounded px-2.5 py-1 text-xs"
                          >
                            <option value="น้อยกว่า 1 ไร่">น้อยกว่า 1 ไร่</option>
                            <option value="มีที่ดิน 1 ถึง 5 ไร่">มีที่ดิน 1 ถึง 5 ไร่</option>
                            <option value="มีที่ดินมากกว่า 5 ไร่">มีที่ดินมากกว่า 5 ไร่</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Drinking water */}
                    <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-xl space-y-3">
                      <h4 className="font-bold text-xs text-slate-600">3.5 แหล่งน้ำดื่มหลักในบ้าน</h4>
                      <select
                        value={formData.drinkingWater}
                        onChange={(e) => setFormData(prev => ({ ...prev, drinkingWater: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white"
                      >
                        <option value="น้ำตู้นิรภัย/น้ำบรรจุขวด">น้ำดื่มบรรจุขวด/ตู้หยอดน้ำ</option>
                        <option value="น้ำประปา">น้ำประปาหลวง / หมู่บ้าน</option>
                        <option value="น้ำบาดาล/น้ำบ่อ">น้ำบ่อ/น้ำบาดาลตามทุ่ง</option>
                        <option value="น้ำฝน/ลำธารธรรมชาติ">น้ำฝนสะสม/ลำธาร/ภูเขา</option>
                      </select>
                    </div>

                    {/* Electricity */}
                    <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-xl space-y-3">
                      <h4 className="font-bold text-xs text-slate-600">3.6 แหล่งไฟฟ้าหลักในบ้าน</h4>
                      <select
                        value={formData.electricitySource}
                        onChange={(e) => setFormData(prev => ({ ...prev, electricitySource: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white mb-2"
                      >
                        <option value="มีไฟฟ้า">มีระบบไฟฟ้าเข้าถึง</option>
                        <option value="ไม่มีไฟฟ้า">ไม่มีระบบกระแสไฟฟ้าใช้เลย</option>
                      </select>
                      {formData.electricitySource === "มีไฟฟ้า" && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">ประเภทระบบไฟฟ้า</label>
                          <select
                            value={formData.electricityType}
                            onChange={(e) => setFormData(prev => ({ ...prev, electricityType: e.target.value }))}
                            className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white"
                          >
                            <option value="ไฟบ้านหรือมิเตอร์">ไฟบ้านส่วนตัว หรือติดมิเตอร์เอง</option>
                            <option value="ต่อพ่วงไฟบ้านอื่น/แบตเตอรี่">ไฟหลวงต่อพ่วงบ้านอื่น / แบตเตอรี่เสา</option>
                            <option value="เครื่องปั่นไฟ/โซลาเซลล์">ใช้เครื่องปั่นส่วนตัว / แผงโซลาเซลล์</option>
                          </select>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* 3.7 ยานพาหนะ (ในส่วน กสศ. สำคัญมากถ้ามีรถยนต์จะหลุดเกณฑ์) */}
                  <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-xs text-slate-600 mb-3 block">3.7 เจ้าของยานพาหนะในครัวเรือน (ที่วิ่งขับได้)</h4>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-3.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.hasVehicle}
                          onChange={(e) => setFormData(prev => ({ ...prev, hasVehicle: e.target.checked }))}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        <span>ครอบครัวนี้ มียานพาหนะที่วิ่งใช้งานได้</span>
                      </label>

                      {formData.hasVehicle && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 font-semibold pl-6 space-y-1">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.vehicleCarUnder15}
                              onChange={(e) => setFormData(prev => ({ ...prev, vehicleCarUnder15: e.target.checked }))}
                              className="w-3.5 h-3.5"
                            />
                            <span>รถยนต์ส่วนตัว (อายุไม่เกิน 15 ปี)</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.vehiclePickupUnder15}
                              onChange={(e) => setFormData(prev => ({ ...prev, vehiclePickupUnder15: e.target.checked }))}
                              className="w-3.5 h-3.5"
                            />
                            <span>รถกระบะ/รถตู้ (อายุไม่เกิน 15 ปี)</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.vehicleTractorUnder15}
                              onChange={(e) => setFormData(prev => ({ ...prev, vehicleTractorUnder15: e.target.checked }))}
                              className="w-3.5 h-3.5"
                            />
                            <span>รถไถข้าว/แทรกเตอร์ (ไม่เกิน 15 ปี)</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.vehicleMotorcycle}
                              onChange={(e) => setFormData(prev => ({ ...prev, vehicleMotorcycle: e.target.checked }))}
                              className="w-3.5 h-3.5"
                            />
                            <span>รถจักรยานยนต์ / เรือประมงเล็ก</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.vehicleCarOver15}
                              onChange={(e) => setFormData(prev => ({ ...prev, vehicleCarOver15: e.target.checked }))}
                              className="w-3.5 h-3.5"
                            />
                            <span>รถยนต์ส่วนตัว (อายุเกิน 15 ปี)</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.vehiclePickupOver15}
                              onChange={(e) => setFormData(prev => ({ ...prev, vehiclePickupOver15: e.target.checked }))}
                              className="w-3.5 h-3.5"
                            />
                            <span>รถกระบะ/รถตู้ (อายุเกิน 15 ปี)</span>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* 3.8 ของใช้ในบ้าน */}
                    <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-xs text-slate-600 mb-3 block">3.8 เครื่องอำนวยความสะดวกในครอบครัว (ที่ใช้งานได้ปกติ)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 font-semibold space-y-1">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.applianceComputer}
                            onChange={(e) => setFormData(prev => ({ ...prev, applianceComputer: e.target.checked }))}
                            className="w-3.5 h-3.5 text-blue-600"
                          />
                          <span>เครื่องคอมพิวเตอร์</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.applianceAircon}
                            onChange={(e) => setFormData(prev => ({ ...prev, applianceAircon: e.target.checked }))}
                            className="w-3.5 h-3.5 text-blue-600"
                          />
                          <span>เครื่องปรับอากาศ (แอร์)</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.applianceTv}
                            onChange={(e) => setFormData(prev => ({ ...prev, applianceTv: e.target.checked }))}
                            className="w-3.5 h-3.5 text-blue-600"
                          />
                          <span>ทีวีจอแบน / สัญญาณดิจิตอล</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.applianceWashingMachine}
                            onChange={(e) => setFormData(prev => ({ ...prev, applianceWashingMachine: e.target.checked }))}
                            className="w-3.5 h-3.5 text-blue-600"
                          />
                          <span>เครื่องซักผ้า</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.applianceFridge}
                            onChange={(e) => setFormData(prev => ({ ...prev, applianceFridge: e.target.checked }))}
                            className="w-3.5 h-3.5 text-blue-600"
                          />
                          <span>ตู้เย็นปกติ</span>
                        </label>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 5: การเดินทางและที่ตั้ง */}
              {activeTab === 5 && (
                <div className="space-y-6">
                  <h3 className="font-extrabold text-slate-800 text-lg border-b border-slate-50 pb-2">
                    ตอนที่ 5 & 6: ข้อมูลการเดินทางไปโรงเรียน และพิกัดสถานที่อยู่อาศัยหลัก
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    <div className="space-y-4">
                      <h4 className="font-bold text-xs text-slate-700">ข้อมูลนำเดินทาง</h4>
                      
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">วิธีดินทางมาโรงเรียนหลัก</label>
                        <select
                          value={formData.travelMethod}
                          onChange={(e) => setFormData(prev => ({ ...prev, travelMethod: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-semibold text-xs text-slate-600 focus:outline-none"
                        >
                          <option value="เดินเท้า">เดินเท้ามาเรียน</option>
                          <option value="รถจักรยาน">ปีบขี่รถจักรยานส่วนตัว</option>
                          <option value="รถจักรยานยนต์ส่วนตัว">ซ้อนท้ายรถจักรยานยนต์ส่วนตัว</option>
                          <option value="รถรับส่งนักเรียน">รถโรงเรียน / รถตู้ไฟเหมา</option>
                          <option value="รถยนต์ส่วนตัว">นั่งรถยนต์ส่วนตัวมาส่ง</option>
                          <option value="รถเมล์ประจำทาง/จ้าง">โดยสารประจำทางสารธารณะ</option>
                          <option value="รถจักรยานยนต์รับจ้าง">ซ้อนรถมอเตอร์ไซค์รับจ้าง</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">ระยะทางขาไป (กม.)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={formData.travelDistance}
                            onChange={(e) => setFormData(prev => ({ ...prev, travelDistance: Number(e.target.value) || 0 }))}
                            className="w-full border border-slate-200 rounded px-2.5 py-1 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">เวลาเดินทาง (นาที/วัน)</label>
                          <input
                            type="number"
                            value={formData.travelTimeMinute}
                            onChange={(e) => setFormData(prev => ({ ...prev, travelTimeMinute: parseInt(e.target.value) || 0 }))}
                            className="w-full border border-slate-200 rounded px-2.5 py-1 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">ค่าใช้จ่ายเดินทาง (บ./เดือน)</label>
                          <input
                            type="number"
                            value={formData.travelExpense === 0 ? "" : formData.travelExpense}
                            onChange={(e) => setFormData(prev => ({ ...prev, travelExpense: Number(e.target.value) || 0 }))}
                            className="w-full border border-slate-200 rounded px-2.5 py-1 text-xs placeholder:text-slate-300"
                            placeholder="เว้นหากไม่มี"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">เงินมาโรงเรียน (บาท/วัน)</label>
                          <input
                            type="number"
                            value={formData.dailyPocketMoney}
                            onChange={(e) => setFormData(prev => ({ ...prev, dailyPocketMoney: Number(e.target.value) || 0 }))}
                            className="w-full border border-slate-200 rounded px-2.5 py-1 text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-xs text-slate-700">พิกัดที่ตั้งที่อยู่ปัจจุบัน (ตำบลบ้านเชียงพิณ)</h4>
                      
                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-0.5">บ้านเลขที่</label>
                          <input
                            type="text"
                            value={formData.addressNo}
                            onChange={(e) => setFormData(prev => ({ ...prev, addressNo: e.target.value }))}
                            className="w-full border border-slate-200 rounded px-2.5 py-1 text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-0.5">หมู่ที่</label>
                          <input
                            type="text"
                            value={formData.addressMoo}
                            onChange={(e) => setFormData(prev => ({ ...prev, addressMoo: e.target.value }))}
                            className="w-full border border-slate-200 rounded px-2.5 py-1 text-xs bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-0.5">ตำบล</label>
                          <input
                            type="text"
                            value={formData.addressSubdistrict}
                            onChange={(e) => setFormData(prev => ({ ...prev, addressSubdistrict: e.target.value }))}
                            className="w-full border border-slate-200 rounded px-2.5 py-1 text-xs bg-slate-100 text-slate-500"
                            disabled
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-0.5">อำเภอ</label>
                          <input
                            type="text"
                            value={formData.addressDistrict}
                            onChange={(e) => setFormData(prev => ({ ...prev, addressDistrict: e.target.value }))}
                            className="w-full border border-slate-200 rounded px-2.5 py-1 text-xs bg-slate-100 text-slate-500"
                            disabled
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-0.5">จังหวัด</label>
                          <input
                            type="text"
                            value={formData.addressProvince}
                            onChange={(e) => setFormData(prev => ({ ...prev, addressProvince: e.target.value }))}
                            className="w-full border border-slate-200 rounded px-2.5 py-1 text-xs bg-slate-100 text-slate-500"
                            disabled
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-0.5">รหัสไปรษณีย์</label>
                          <input
                            type="text"
                            value={formData.addressPostalCode}
                            onChange={(e) => setFormData(prev => ({ ...prev, addressPostalCode: e.target.value }))}
                            className="w-full border border-slate-200 rounded px-2.5 py-1 text-xs bg-slate-100 text-slate-500"
                            disabled
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: ภาพถ่ายยืนยัน และประทับลายเซ็นต์อิเล็กทรอนิกส์ */}
              {activeTab === 6 && (
                <div className="space-y-6">
                  <h3 className="font-extrabold text-slate-800 text-lg border-b border-slate-50 pb-2">
                    ตอนที่ 7: ภาพประกอบของบ้านนักเรียน และลงลายมือชื่อพยานความยาวถูกต้องเป็นประจักษ์
                  </h3>

                  {/* Photos Sim Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-500 block mb-2 text-center w-full">รูปภาพที่ 1: ภาพถ่ายด้านนอกพำนักอาศัย (เห็นหลังคาและฝาผนังทั้งหลัง)</span>
                      {formData.photoExterior ? (
                        <div className="relative group w-full max-w-[280px]">
                          <img 
                            src={formData.photoExterior} 
                            alt="Exterior house" 
                            className="w-full h-40 object-cover rounded-lg border shadow-xs"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, photoExterior: "" }))}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 text-white hover:bg-black/90 rounded-full text-[10px] cursor-pointer"
                          >
                            ลบรูปภาพ
                          </button>
                        </div>
                      ) : (
                        <div className="w-full max-w-[280px] h-40 rounded-lg border border-dashed border-slate-300 bg-white flex flex-col justify-center items-center gap-2 cursor-pointer hover:bg-slate-50 text-slate-400"
                          onClick={() => setFormData(prev => ({ ...prev, photoExterior: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600" }))}
                        >
                          <Camera className="w-8 h-8" />
                          <span className="text-[10px] block font-semibold text-slate-400">คลิกเพื่ออัปโหลดภาพนอกบ้าน (สมมติ)</span>
                        </div>
                      )}
                    </div>

                    <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-500 block mb-2 text-center w-full">รูปภาพที่ 2: ภาพถ่ายภายในพำนักอาศัย (สภาพพื้นและบริเวณในที่พักอาศัย)</span>
                      {formData.photoInterior ? (
                        <div className="relative group w-full max-w-[280px]">
                          <img 
                            src={formData.photoInterior} 
                            alt="Interior house" 
                            className="w-full h-40 object-cover rounded-lg border shadow-xs"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, photoInterior: "" }))}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 text-white hover:bg-black/90 rounded-full text-[10px] cursor-pointer"
                          >
                            ลบรูปภาพ
                          </button>
                        </div>
                      ) : (
                        <div className="w-full max-w-[280px] h-40 rounded-lg border border-dashed border-slate-300 bg-white flex flex-col justify-center items-center gap-2 cursor-pointer hover:bg-slate-50 text-slate-400"
                          onClick={() => setFormData(prev => ({ ...prev, photoInterior: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&q=80&w=600" }))}
                        >
                          <Camera className="w-8 h-8" />
                          <span className="text-[10px] block font-semibold text-slate-400">คลิกเพื่ออัปโหลดภาพในบ้าน (สมมติ)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interactive Digital Signature Drawing Pads */}
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="font-bold text-sm text-slate-700 mb-4 block text-center sm:text-left">
                      ลายมือชื่อผู้ยืนยัน (เซ็นวาดบนหน้าจอนี้ได้ทันที)
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      
                      {/* Signature 1: Student */}
                      <div className="border border-slate-100 rounded-xl p-3 bg-white flex flex-col items-center shadow-xs">
                        <span className="text-[10px] font-bold text-slate-400 mb-2">1. ลายมือชื่อนักเรียน</span>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden w-full relative h-28">
                          <canvas
                            width="180"
                            height="112"
                            ref={studentSigCanvas}
                            onMouseDown={(e) => startDrawing(e, studentSigCanvas, setIsDrawStudent)}
                            onMouseMove={(e) => draw(e, studentSigCanvas, isDrawStudent)}
                            onMouseUp={() => stopDrawing(studentSigCanvas, setIsDrawStudent, "studentSignature")}
                            onMouseLeave={() => setIsDrawStudent(false)}
                            onTouchStart={(e) => startDrawing(e, studentSigCanvas, setIsDrawStudent)}
                            onTouchMove={(e) => draw(e, studentSigCanvas, isDrawStudent)}
                            onTouchEnd={() => stopDrawing(studentSigCanvas, setIsDrawStudent, "studentSignature")}
                            className="w-full h-full cursor-crosshair bg-slate-50Touch block"
                          />
                          {!formData.studentSignature && (
                            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-[10px] text-slate-300 gap-1 select-none">
                              <PenTool className="w-4 h-4 text-slate-300" />
                              ใช้นิ้ว/เมาส์วาดเซ็นที่นี่
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => clearSig(studentSigCanvas, "studentSignature")}
                          className="mt-2 text-[10px] text-slate-400 hover:text-slate-600 font-bold underline cursor-pointer"
                        >
                          ล้างลายเซ็นต์
                        </button>
                      </div>

                      {/* Signature 2: Guardian */}
                      <div className="border border-slate-100 rounded-xl p-3 bg-white flex flex-col items-center shadow-xs">
                        <span className="text-[10px] font-bold text-slate-400 mb-2">2. ลายมือชื่อผู้ปกครอง</span>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden w-full relative h-28">
                          <canvas
                            width="180"
                            height="112"
                            ref={guardianSigCanvas}
                            onMouseDown={(e) => startDrawing(e, guardianSigCanvas, setIsDrawGuardian)}
                            onMouseMove={(e) => draw(e, guardianSigCanvas, isDrawGuardian)}
                            onMouseUp={() => stopDrawing(guardianSigCanvas, setIsDrawGuardian, "guardianSignature")}
                            onMouseLeave={() => setIsDrawGuardian(false)}
                            onTouchStart={(e) => startDrawing(e, guardianSigCanvas, setIsDrawGuardian)}
                            onTouchMove={(e) => draw(e, guardianSigCanvas, isDrawGuardian)}
                            onTouchEnd={() => stopDrawing(guardianSigCanvas, setIsDrawGuardian, "guardianSignature")}
                            className="w-full h-full cursor-crosshair bg-slate-50Touch block"
                          />
                          {!formData.guardianSignature && (
                            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-[10px] text-slate-300 gap-1 select-none">
                              <PenTool className="w-4 h-4 text-slate-300" />
                              ใช้นิ้ว/เมาส์วาดเซ็นที่นี่
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => clearSig(guardianSigCanvas, "guardianSignature")}
                          className="mt-2 text-[10px] text-slate-400 hover:text-slate-600 font-bold underline cursor-pointer"
                        >
                          ล้างลายเซ็นต์
                        </button>
                      </div>

                      {/* Signature 3: Teacher */}
                      <div className="border border-slate-100 rounded-xl p-3 bg-white flex flex-col items-center shadow-xs">
                        <span className="text-[10px] font-bold text-slate-400 mb-2">3. ลายมือชื่อครูผู้บันทึก</span>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden w-full relative h-28">
                          <canvas
                            width="180"
                            height="112"
                            ref={teacherSigCanvas}
                            onMouseDown={(e) => startDrawing(e, teacherSigCanvas, setIsDrawTeacher)}
                            onMouseMove={(e) => draw(e, teacherSigCanvas, isDrawTeacher)}
                            onMouseUp={() => stopDrawing(teacherSigCanvas, setIsDrawTeacher, "teacherSignature")}
                            onMouseLeave={() => setIsDrawTeacher(false)}
                            onTouchStart={(e) => startDrawing(e, teacherSigCanvas, setIsDrawTeacher)}
                            onTouchMove={(e) => draw(e, teacherSigCanvas, isDrawTeacher)}
                            onTouchEnd={() => stopDrawing(teacherSigCanvas, setIsDrawTeacher, "teacherSignature")}
                            className="w-full h-full cursor-crosshair bg-slate-50Touch block"
                          />
                          {!formData.teacherSignature && (
                            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-[10px] text-slate-300 gap-1 select-none">
                              <PenTool className="w-4 h-4 text-slate-300" />
                              ใช้นิ้ว/เมาส์วาดเซ็นที่นี่
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => clearSig(teacherSigCanvas, "teacherSignature")}
                          className="mt-2 text-[10px] text-slate-400 hover:text-slate-600 font-bold underline cursor-pointer"
                        >
                          ล้างลายเซ็นต์
                        </button>
                      </div>

                      {/* Signature 4: Principal */}
                      <div className="border border-slate-100 rounded-xl p-3 bg-white flex flex-col items-center shadow-xs">
                        <span className="text-[10px] font-bold text-slate-400 mb-2">4. ลายมือชื่อผู้รับรองสถานศึกษา</span>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden w-full relative h-28">
                          <canvas
                            width="180"
                            height="112"
                            ref={principalSigCanvas}
                            onMouseDown={(e) => startDrawing(e, principalSigCanvas, setIsDrawPrincipal)}
                            onMouseMove={(e) => draw(e, principalSigCanvas, isDrawPrincipal)}
                            onMouseUp={() => stopDrawing(principalSigCanvas, setIsDrawPrincipal, "principalSignature")}
                            onMouseLeave={() => setIsDrawPrincipal(false)}
                            onTouchStart={(e) => startDrawing(e, principalSigCanvas, setIsDrawPrincipal)}
                            onTouchMove={(e) => draw(e, principalSigCanvas, isDrawPrincipal)}
                            onTouchEnd={() => stopDrawing(principalSigCanvas, setIsDrawPrincipal, "principalSignature")}
                            className="w-full h-full cursor-crosshair bg-slate-50Touch block"
                          />
                          {!formData.principalSignature && (
                            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-[10px] text-slate-300 gap-1 select-none">
                              <PenTool className="w-4 h-4 text-slate-300" />
                              ใช้นิ้ว/เมาส์วาดเซ็นที่นี่
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => clearSig(principalSigCanvas, "principalSignature")}
                          className="mt-2 text-[10px] text-slate-400 hover:text-slate-600 font-bold underline cursor-pointer"
                        >
                          ล้างลายเซ็นต์
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Certification Checkbox */}
                  <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 text-xs text-slate-600 mt-5 space-y-2 select-none">
                    <label className="flex items-start gap-2.5 cursor-pointer font-semibold leading-relaxed">
                      <input
                        type="checkbox"
                        checked={formData.certifiedCorrect}
                        onChange={(e) => setFormData(prev => ({ ...prev, certifiedCorrect: e.target.checked }))}
                        className="w-4.5 h-4.5 text-blue-600 rounded mt-0.5 cursor-pointer"
                      />
                      <span>
                        ข้าพเจ้าขอรับรองว่าข้อมูลในแบบสอบถามนี้และรูปภาพถ่ายสภาพบ้านพร้อมลายมือชื่อดังกล่าวเป็นความจริงทุกประการ 
                        ทั้งนี้เพื่อนำส่ง กสศ. คัดกรองและประเมินเป็นขั้นตอนรับทุนอุดหนุนการศึกษานักเรียนยากจนพิเศษชั้น ป.2 โรงเรียนบ้านเชียงพิณ ปีการศึกษา 2569
                      </span>
                    </label>
                  </div>

                </div>
              )}

            </div>

            {/* Bottom Tab Navigation Controls */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
              <button
                type="button"
                disabled={activeTab === 1}
                onClick={() => {
                  onClearAiAnalysis();
                  setActiveTab(prev => Math.max(prev - 1, 1));
                }}
                className="px-4 py-2 text-slate-600 font-bold text-xs bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ย้อนกลับ
              </button>

              <span className="text-xs text-slate-400 font-bold">
                หน้า {activeTab} จาก 6
              </span>

              {activeTab < 6 ? (
                <button
                  type="button"
                  onClick={() => {
                    onClearAiAnalysis();
                    setActiveTab(prev => Math.min(prev + 1, 6));
                  }}
                  className="px-4 py-2 bg-natural-accent hover:bg-natural-accent-hover text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  ถัดไป
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveComplete}
                  disabled={saveStatus !== ""}
                  className="px-5 py-2 bg-natural-accent hover:bg-natural-accent-hover text-white font-bold text-xs rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  บันทึกเสร็จสมบูรณ์
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
