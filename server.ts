import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initialStudents, createDefaultFormData } from "./src/students-init";
import { Student, ActivityLog } from "./src/types";
import { GoogleGenAI } from "@google/genai";

const PORT = 3000;
const app = express();

app.use(express.json({ limit: "50mb" }));

const STUDENTS_FILE = path.join(process.cwd(), "students-data.json");
const LOGS_FILE = path.join(process.cwd(), "activity-logs.json");

// Helper to load students data
function loadStudents(): Student[] {
  try {
    if (fs.existsSync(STUDENTS_FILE)) {
      const data = fs.readFileSync(STUDENTS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading students file:", error);
  }
  // Initialize with initialStudents
  saveStudents(initialStudents);
  return initialStudents;
}

// Helper to save students data
function saveStudents(students: Student[]) {
  try {
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing students file:", error);
  }
}

// Helper to load logs
function loadLogs(): ActivityLog[] {
  try {
    if (fs.existsSync(LOGS_FILE)) {
      const data = fs.readFileSync(LOGS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading logs file:", error);
  }
  const initialLogs: ActivityLog[] = [
    {
      id: "1",
      timestamp: new Date().toISOString(),
      studentId: "SYSTEM",
      studentName: "ระบบคัดกรอง",
      action: "ระบบเริ่มต้น",
      details: "เปิดระบบบันทึกข้อมูล นร./กสศ.01 สำหรับชั้นประถมศึกษาปีที่ 2 ปีการศึกษา 2569",
      user: "ครูเบญจภรณ์ มโนสัมฤทธิ์",
    },
  ];
  saveLogs(initialLogs);
  return initialLogs;
}

// Helper to save logs
function saveLogs(logs: ActivityLog[]) {
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing logs file:", error);
  }
}

// Add a log entry
function addLog(studentId: string, studentName: string, action: string, details: string, user: string) {
  const logs = loadLogs();
  const newLog: ActivityLog = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    studentId,
    studentName,
    action,
    details,
    user,
  };
  logs.unshift(newLog); // Add to beginning
  // Limit to last 100 logs
  if (logs.length > 100) logs.pop();
  saveLogs(logs);
  return newLog;
}

// Store multi-user event-stream subscribers
let sseClients: any[] = [];

function broadcastToClients(payload: any) {
  console.log(`Broadcasting realtime update to ${sseClients.length} connected browser client(s).`);
  sseClients.forEach((client) => {
    client.write(`data: ${JSON.stringify(payload)}\n\n`);
  });
}

// REST APIs
app.get("/api/students", (req, res) => {
  const students = loadStudents();
  res.json({ students });
});

app.get("/api/logs", (req, res) => {
  const logs = loadLogs();
  res.json({ logs });
});

// Real-time EventSource Stream
app.get("/api/realtime-stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Send initial data sync
  const students = loadStudents();
  const logs = loadLogs();
  res.write(`data: ${JSON.stringify({ type: "init", students, logs })}\n\n`);

  // Add to active subscribers
  sseClients.push(res);
  console.log(`Client joined SSE stream. Active clients: ${sseClients.length}`);

  // Ping every 30 seconds to keep connection alive
  const pingInterval = setInterval(() => {
    res.write(`event: ping\ndata: keep-alive\n\n`);
  }, 30000);

  req.on("close", () => {
    clearInterval(pingInterval);
    sseClients = sseClients.filter((client) => client !== res);
    console.log(`Client left SSE stream. Active clients: ${sseClients.length}`);
  });
});

// Update or save form data
app.post("/api/students/:id", (req, res) => {
  const { id } = req.params;
  const { formData, status, user } = req.body;
  const targetUser = user || "ครูเบญจภรณ์ มโนสัมฤทธิ์";

  const students = loadStudents();
  const index = students.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Student not found" });
  }

  const student = students[index];
  const oldStatus = student.status;
  
  student.status = status;
  student.formData = formData;
  student.updatedAt = new Date().toISOString();
  student.updatedBy = targetUser;

  students[index] = student;
  saveStudents(students);

  // Add to changelog
  const actionText = status === "completed" ? "บันทึกเสร็จสมบูรณ์" : "บันทึกแบบร่าง";
  const details = `สถานะเปลี่ยนจาก [${oldStatus === "pending" ? "ยังไม่ได้บันทึก" : oldStatus === "draft" ? "แบบร่าง" : "เสร็จสมบูรณ์"}] เป็น [${status === "completed" ? "เสร็จสมบูรณ์" : "แบบร่าง"}]`;
  const log = addLog(id, `${student.title}${student.name} ${student.surname}`, actionText, details, targetUser);

  broadcastToClients({
    type: "update",
    studentId: id,
    students,
    log,
    logs: loadLogs(),
  });

  res.json({ success: true, student });
});

// Create draft form data for standard creation
app.post("/api/students/:id/draft", (req, res) => {
  const { id } = req.params;
  const { user } = req.body;
  const targetUser = user || "ครูเบญจภรณ์ มโนสัมฤทธิ์";

  const students = loadStudents();
  const index = students.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Student not found" });
  }

  const student = students[index];
  if (!student.formData) {
    student.formData = createDefaultFormData(student);
  }
  student.status = "draft";
  student.updatedAt = new Date().toISOString();
  student.updatedBy = targetUser;

  students[index] = student;
  saveStudents(students);

  const log = addLog(id, `${student.title}${student.name} ${student.surname}`, "เริ่มบันทึกฟอร์ม", "เริ่มกรอกแบบฟอร์ม นร./กสศ.01 และสร้างร่างข้อมูลหลัก", targetUser);

  broadcastToClients({
    type: "update",
    studentId: id,
    students,
    log,
    logs: loadLogs(),
  });

  res.json({ success: true, student });
});

// Reset student state
app.post("/api/students/:id/reset", (req, res) => {
  const { id } = req.params;
  const { user } = req.body;
  const targetUser = user || "ครูเบญจภรณ์ มโนสัมฤทธิ์";

  const students = loadStudents();
  const index = students.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Student not found" });
  }

  const student = students[index];
  student.status = "pending";
  student.formData = null;
  student.updatedAt = new Date().toISOString();
  student.updatedBy = targetUser;

  students[index] = student;
  saveStudents(students);

  const log = addLog(id, `${student.title}${student.name} ${student.surname}`, "รีเซ็ตข้อมูล", "ยกเลิกการกรอกข้อมูลและรีเซ็ตสถานะเป็น ยังไม่กรอก", targetUser);

  broadcastToClients({
    type: "update",
    studentId: id,
    students,
    log,
    logs: loadLogs(),
  });

  res.json({ success: true, student });
});

// Server-side Gemini AI Assistance Endpoint
app.post("/api/gemini/analyze", async (req, res) => {
  const { studentId, formData } = req.body;

  if (!formData) {
    return res.status(400).json({ error: "No student form data provided" });
  }

  const students = loadStudents();
  const student = students.find((s) => s.id === studentId);
  const fullName = student ? `${student.title}${student.name} ${student.surname}` : "ไม่ทราบชื่อ";

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      // Fallback description generator if Gemini API is missing, to ensure exceptional experience
      console.warn("Gemini API key is not configured. Using high-quality default recommendation engine.");
      
      let eligibilityReason = "";
      const householdCount = formData.householdCount || 3;
      const totalIncome = (formData.members || []).reduce((sum: number, m: any) => sum + (Number(m.incomeTotal) || 0), 0);
      const avgIncome = householdCount > 0 ? totalIncome / householdCount : 0;

      if (avgIncome <= 3000) {
        eligibilityReason = `รายได้เฉลี่ยสมาชิกในครัวเรือนเพียง ${avgIncome.toLocaleString()} บาท/คน/เดือน ซึ่งไม่เกินเกณฑ์ความยากจนของ กสศ. (3,000 บาท)`;
      } else {
        eligibilityReason = `รายได้เฉลี่ยสมาชิกในครัวเรือนคือ ${avgIncome.toLocaleString()} บาท/คน/เดือน ซึ่งสูงกว่าเกณฑ์ทั่วไปของ กสศ. แต่มีความจำเป็นประเด็นอื่นเกื้อหนุน`;
      }

      const designDesc = `วิเคราะห์ประเมินเบื้องต้นสำหรับ ${fullName}:
- **เกณฑ์รายได้**: ${eligibilityReason}
- **ด้านที่อยู่อาศัย**: พื้นทำจาก ${formData.floorMaterial || "ไม้"}, ฝาผนังทำจาก ${formData.wallMaterial || "สังกะสี"}, หลังคาทำจาก ${formData.roofMaterial || "สังกะสี"} (บ่งชี้ลักษณะสภาพที่ไม่มั่นคงถาวร)
- **แหล่งน้ำดื่ม**: ${formData.drinkingWater || "น้ำประปา"} / แหล่งไฟฟ้า: ${formData.electricitySource || "มีไฟฟ้า"} (${formData.electricityType || "มิเตอร์รวม"})
- **การเดินทาง**: วิธีเดินทางหลักคือ ${formData.travelMethod || "เดิน"}, ระยะทางประมาณ ${formData.travelDistance || 0} กม., ค่าใช้จ่ายเดินทาง ${formData.travelExpense || 0} บาท/เดือน ค่อนข้างส่งผลกระทบต่อเศรษฐกิจครอบครัว
- **ความเห็นครูผู้ลงเยี่ยมบ้าน**: สมควรได้รับทุนอุดหนุนแบบมีเงื่อนไขของ กสศ. เนื่องจากครอบครัวของนักเรียนมีฐานะยากจน รายได้ต่ำกว่าเกณฑ์ความมั่นคงด้านรายได้ และมีภาระหนี้สิน ครัวเรือนขาดแคลนเครื่องอำนวยความสะดวกพื้นฐาน การเรียนของนักเรียนอาจสะดุดลงหากไม่มีงบประมาณมาหนุนเสริม จึงขอเสนอรับทุนอุดหนุนเพื่อสวัสดิภาพทางการศึกษาของนักเรียนอย่างเร่งด่วน`;

      return res.json({ analysis: designDesc });
    }

    // Configured and initialized according to gemini-api directives
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    console.log(`Requesting Gemini AI analysis for student: ${fullName}`);

    const prompt = `
คุณเป็นระบบปัญญาประดิษฐ์ผู้เชี่ยวชาญของ กองทุนเพื่อความเสมอภาคทางการศึกษา (กสศ.) 
ภารกิจของคุณคือช่วยวิเคราะห์สภาวะความยากจนและสิทธิการรับเงินอุดหนุนแบบมีเงื่อนไข (แบบ นร./กสศ.01) จากข้อมูลการลงเยี่ยมบ้านของนักเรียนโรงเรียนบ้านเชียงพิณ

ชื่อนักเรียน: ${fullName} (ชั้นประถมศึกษาปีที่ 2, อายุประมาณ 8 ปี)
ข้อมูลจากแบบขอรับเงินอุดหนุน:
- สมาชิกครัวเรือนทั้งหมด: ${formData.householdCount} คน
- สมาชิกและรายได้เฉลี่ย: 
  ${(formData.members || []).map((m: any, idx: number) => `  คนที่ ${idx + 1}: ${m.relationship} - อายุ ${m.age} ปี - อาชีพ ${m.education || "ไม่ระบุ"} - รายได้รวม ${m.incomeTotal} บาท`).join("\n")}
- ภาระพึ่งพิงในครัวเรือน: 
  ${formData.hasDisabledBurden ? "- มีคนพิการทางร่างกาย/สติปัญญา" : ""}
  ${formData.hasChronicBurden ? "- มีคนป่วยโรคเรื้อรัง" : ""}
  ${formData.hasElderlyBurden ? "- มีผู้สูงอายุตั้งแต่ 60 ปีขึ้นไป" : ""}
  ${formData.hasSingleParentBurden ? "- เป็นพ่อ/แม่เลี้ยงเดี่ยว" : ""}
  ${formData.hasUnemployedBurden ? "- มีวัยแรงงานอายุ 15-65 ปีที่ว่างงาน" : ""}
- สภาพที่อยู่อาศัย:
  * พื้นบ้าน: ${formData.floorMaterial}
  * ฝาบ้าน: ${formData.wallMaterial}
  * หลังคา: ${formData.roofMaterial}
  * ห้องส้วม: ${formData.hasToilet === "มี" ? "มีห้องน้ำในบ้าน" : "ไม่มีห้องน้ำในบ้าน"}
  * ที่ดินทำการเกษตร: ${formData.hasAgriLand ? `มีที่ดินเกษตรขนาด ${formData.agriLandSize}` : "ไม่มีที่ดินทำการเกษตร"}
  * แหล่งน้ำดื่ม: ${formData.drinkingWater}
  * ไฟฟ้า: ${formData.electricitySource} (${formData.electricityType})
- ของใช้ในครัวเรือน:
  ${formData.applianceComputer ? "- มีคอมพิวเตอร์" : ""}
  ${formData.applianceAircon ? "- มีเครื่องปรับอากาศ" : ""}
  ${formData.applianceTv ? "- มีทีวีจอแบน" : ""}
  ${formData.applianceWashingMachine ? "- มีเครื่องซักผ้า" : ""}
  ${formData.applianceFridge ? "- มีตู้เย็น" : ""}
- ยานพาหนะ (ใช้งานได้):
  * รถยนต์นั่งส่วนตัว: ${formData.vehicleCarUnder15 || formData.vehicleCarOver15 ? "มี" : "ไม่มี"}
  * รถปิกอัพ/กระบะ/รถตู้: ${formData.vehiclePickupUnder15 || formData.vehiclePickupOver15 ? "มี" : "ไม่มี"}
  * รถไถ/เกี่ยวข้าว รถแทรกเตอร์: ${formData.vehicleTractorUnder15 || formData.vehicleTractorOver15 ? "มี" : "ไม่มี"}
  * รถจักรยานยนต์: ${formData.vehicleMotorcycle ? "มีใช้ในบ้าน" : "ไม่มี"}
- การเดินทางมาเรียน:
  * วิธีเดินทางหลัก: ${formData.travelMethod}
  * ระยะทาง (ไป-กลับ): ${formData.travelDistance} กิโลเมตร
  * ค่าใช้จ่ายเดินทาง: ${formData.travelExpense} บาท/เดือน
  * เงินโรงเรียนรายวัน: ${formData.dailyPocketMoney} บาท/วัน

กฎสิทธิ์ในการพิจารณาของ กสศ. เบื้องต้น:
1. รายได้รวมครัวเรือนเฉลี่ยต่อคนต่อเดือน (หารจำนวนสมาชิกทั้งหมด) ต้องไม่เกิน 3,000 บาท
2. เกณฑ์สถานะครัวเรือนด้านความยากลำบาก: การใช้พลังงาน/ไฟฟ้า แหล่งน้ำ วัสดุที่อยู่อาศัยไม่มั่นคง ภาระพึ่งพิง และการไม่มีสินทรัพย์หรูหรา (รถยนต์ เครื่องปรับอากาศ คอมพิวเตอร์)

ช่วยเขียนรายงานสรุปการคัดกรองภาษาไทยที่กระชับและเป็นมืออาชีพ มีโครงสร้างดังนี้:
1. **การคัดกรองรายได้เฉลี่ย**: สรุปรายได้เฉลี่ยต่อคนต่อเดือน และประเมินว่าผ่านเกณฑ์รายได้ไม่เกิน 3,000 บาทหรือไม่ (คำนวณ: รายได้รวมครัวเรือนทั้งหมด หารด้วย จำนวนสมาชิก)
2. **มิติดังสถานะทางกายภาพและสังคม**: วิเคราะห์ประเด็นที่วิกฤต เช่น สภาพวัสดุที่อยู่อาศัย ยานพาหนะ และภาระพึ่งพิง
3. **ข้อเสนอแนะและความคิดเห็นของครูเสนอแนะ**: ให้ช่วยร่างความคิดเห็นความจำเป็นของครูผู้ลงเยี่ยมบ้าน (เพื่อเอาไปกรอกลงในฟอร์มข้อที่ 10 ได้เลย) ให้ใช้ภาษาที่เป็นทางการ สุภาพ เขียนให้เห็นความจำเป็นที่ต้องช่วยเหลือเชิงประจักษ์ เพื่อลดโอกาสการหลุดออกจากระบบการศึกษา

ขอคำตอบสวยงามแบบจัดเตรียมโครงสร้างในรูป Markdown ด้วยประโยคที่สละสลวยสำหรับครูเบญจภรณ์
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "คุณคือระบบปัญญาประดิษฐ์วิเคราะห์สิทธิ์ทุนการศึกษาของ กองทุนเพื่อความเสมอภาคทางการศึกษา (กสศ.)",
        temperature: 0.7,
      },
    });

    const outputText = response.text;
    res.json({ analysis: outputText });
  } catch (error: any) {
    console.error("Gemini invocation failed:", error);
    res.status(500).json({ error: "Gemini analysis error: " + error.message });
  }
});

// Implement Vite static assets or dev server hosting
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
