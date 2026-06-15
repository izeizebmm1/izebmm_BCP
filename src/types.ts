/**
 * Types for the student subsidy record application (แบบ นร./กสศ.01)
 * Primary 2 - Ban Chiang Phin School (โรงเรียนบ้านเชียงพิณ)
 */

export interface HouseholdMember {
  id: string;
  name: string;
  relationship: string;
  nationalId: string;
  education: string;
  age: number;
  disabled: boolean;
  chronicDisease: boolean;
  incomeWage: number;
  incomeAgriculture: number;
  incomeBusiness: number;
  incomeWelfare: number;
  incomeOther: number;
  incomeTotal: number;
}

export interface FormData {
  // 1. ข้อมูลนักเรียน & ผู้ปกครองเพิ่มเติม
  familyStatus: string; // พ่อแม่อยู่ด้วยกัน, พ่อแม่แยกกันอยู่, พ่อแม่หย่าร้าง, พ่อเสียชีวิต, แม่เสียชีวิต, พ่อแม่เสียชีวิตคู่, พ่อแม่ทอดทิ้ง
  staysWith: string; // พ่อ/แม่, ญาติ, อยู่ลำพัง, ผู้อุปการะ, ครัวเรือนสถาบัน
  guardianTitle: string;
  guardianName: string;
  guardianSurname: string;
  guardianRelationship: string;
  guardianEducation: string;
  guardianOccupation: string;
  guardianPhone: string;
  guardianNationalId: string;
  hasNoNationalId: boolean;
  hasWelfareCard: boolean; // ได้รับสวัสดิการแห่งรัฐ

  // 2. จำนวนสมาชิกในครัวเรือน
  householdCount: number;
  members: HouseholdMember[];

  // 3. ข้อมูลสถานะของครัวเรือน (พึ่งพิง & การอยู่อาศัย)
  // 3.1 ภาระพึ่งพิง
  hasDisabledBurden: boolean;
  hasChronicBurden: boolean;
  hasElderlyBurden: boolean;
  hasSingleParentBurden: boolean;
  hasUnemployedBurden: boolean;
  
  // 3.2 การอยู่อาศัย
  residencyType: string; // อยู่บ้านตนเอง, อยู่บ้านเช่า, อยู่กับผู้อื่น, หอพัก
  rentFee: number; // ค่าเช่าต่อเดือน (ถ้ามี)

  // 3.3 ลักษณะที่อยู่อาศัย (บันทึกจากที่เห็น)
  floorMaterial: string;
  wallMaterial: string;
  roofMaterial: string;
  hasToilet: string; // มี / ไม่มี

  // 3.4 ที่ดินทำการเกษตร (รวมเช่า)
  hasAgriLand: boolean; // ไม่ทำเกษตร / ทำเกษตร
  agriLandSize: string; // น้อยกว่า 1 ไร่, 1 ถึง 5 ไร่, มากกว่า 5 ไร่

  // 3.5 แหล่งน้ำดื่ม
  drinkingWater: string;

  // 3.6 แหล่งไฟฟ้า
  electricitySource: string; // ไม่มีไฟฟ้า, มีไฟฟ้า
  electricityType: string; // เครื่องปั่นไฟ/โซลาเซลล์, ไฟต่อพ่วง/แบตเตอรี่, ไฟบ้านหรือมิเตอร์

  // 3.7 ยานพาหนะในครัวเรือน
  hasVehicle: boolean;
  vehicleCarOver15: boolean;
  vehicleCarUnder15: boolean;
  vehiclePickupOver15: boolean;
  vehiclePickupUnder15: boolean;
  vehicleTractorOver15: boolean;
  vehicleTractorUnder15: boolean;
  vehicleMotorcycle: boolean;

  // 3.8 ของใช้ในครัวเรือน
  hasNoAppliances: boolean;
  applianceComputer: boolean;
  applianceAircon: boolean;
  applianceTv: boolean;
  applianceWashingMachine: boolean;
  applianceFridge: boolean;

  // 5. การเดินทางจากที่พักอาศัยไปโรงเรียน
  travelMethod: string; // เดิน, จักรยาน, รถโรงเรียน, จักรยานยนต์ส่วนตัว, รถส่วนตัว, เรือส่วนตัว, รถรับจ้าง, รถโดยสารประจำทาง ฯลฯ
  travelDistance: number; // กิโลเมตร
  travelTimeHour: number;
  travelTimeMinute: number;
  travelExpense: number; // บาทต่อเดือน
  dailyPocketMoney: number; // บาทต่อวัน

  // 6. ที่ตั้งที่พักอาศัยปัจจุบัน
  addressNo: string;
  addressMoo: string;
  addressSoi: string;
  addressRoad: string;
  addressSubdistrict: string;
  addressDistrict: string;
  addressProvince: string;
  addressPostalCode: string;

  // 7. ภาพถ่ายที่พักอาศัย
  photoExterior: string; // Base64 or placeholder url/description
  photoInterior: string; // Base64 or placeholder url/description

  // 8 & 9 & 10. การรับรองข้อมูล
  certifiedCorrect: boolean;
  studentSignature: string; // Base64 drawing
  guardianSignature: string; // Base64 drawing
  teacherSignature: string; // Base64 drawing
  principalSignature: string; // Base64 drawing
  surveyorName: string; // ชื่อครูผู้บันทึก (ครูเบญจภรณ์ มโนสัมฤทธิ์)
  surveyorPosition: string; // ครูประจำชั้น
  recordDate: string;
}

export type FormStatus = "pending" | "draft" | "completed";

export interface Student {
  id: string; // เลขประจำตัวนักเรียน
  nationalId: string; // เลขประจำตัวประชาชน
  title: string;
  name: string;
  surname: string;
  dob: string;
  weight: number;
  height: number;
  status: FormStatus;
  formData: FormData | null;
  updatedAt?: string;
  updatedBy?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  studentId: string;
  studentName: string;
  action: string; // "create" | "update" | "complete"
  details: string;
  user: string;
}
