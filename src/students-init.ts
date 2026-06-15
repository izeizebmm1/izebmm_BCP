import { Student } from "./types";

// Class roster based on PDF: รายชื่อนักเรียน ชั้นประถมศึกษาปีที่ 2 ภาคเรียนที่ 1 ปีการศึกษา 2569 โรงเรียนบ้านเชียงพิณ
// Teacher: นางสาวเบญจภรณ์ มโนสัมฤทธิ์
export const initialStudents: Student[] = [
  {
    id: "3870",
    nationalId: "1-4199-03331-73-2",
    title: "เด็กชาย",
    name: "จรัญ",
    surname: "ปัญญาทอง",
    dob: "2560-11-03", // 3/11/2560
    weight: 18,
    height: 119,
    status: "pending",
    formData: null
  },
  {
    id: "3871",
    nationalId: "1-4199-03346-37-3",
    title: "เด็กชาย",
    name: "ธนวรรธน์",
    surname: "แก้วหาวงค์",
    dob: "2560-11-28", // 28/11/2560
    weight: 22,
    height: 123,
    status: "pending",
    formData: null
  },
  {
    id: "3872",
    nationalId: "1-4199-03332-83-6",
    title: "เด็กชาย",
    name: "ธนวรรธน์",
    surname: "ป้องนู",
    dob: "2560-08-30", // 30/8/2560
    weight: 23,
    height: 125,
    status: "pending",
    formData: null
  },
  {
    id: "3873",
    nationalId: "1-4199-03366-89-2",
    title: "เด็กชาย",
    name: "ณณนวัฒน์",
    surname: "เจริญวงศ์",
    dob: "2560-06-11", // 11/6/2560
    weight: 38,
    height: 124,
    status: "pending",
    formData: null
  },
  {
    id: "3875", // In OCR/PDF No.5 has ID 3875 (3874 is skipped)
    nationalId: "1-4199-03334-85-5",
    title: "เด็กชาย",
    name: "ศวิกรณ์",
    surname: "เสนา",
    dob: "2560-10-01", // 1/10/2560
    weight: 19,
    height: 123,
    status: "pending",
    formData: null
  },
  {
    id: "3885",
    nationalId: "1-1050-00020-33-0",
    title: "เด็กชาย",
    name: "ณัฐกิจ",
    surname: "แพงสา",
    dob: "2561-03-22", // 22/3/2561
    weight: 19,
    height: 127,
    status: "pending",
    formData: null
  },
  {
    id: "3886",
    nationalId: "1-4199-03335-09-6",
    title: "เด็กชาย",
    name: "ณัฐธรธิบดิ์",
    surname: "บุญสา",
    dob: "2561-01-01", // 1/1/2561
    weight: 19,
    height: 123,
    status: "pending",
    formData: null
  },
  {
    id: "3878",
    nationalId: "1-4199-03340-89-8",
    title: "เด็กหญิง",
    name: "พัดชา",
    surname: "ปากกาบุตร",
    dob: "2560-07-12", // 12/7/2560
    weight: 29,
    height: 130,
    status: "pending",
    formData: null
  },
  {
    id: "3879",
    nationalId: "1-4199-03342-30-1",
    title: "เด็กหญิง",
    name: "สาวิตรี",
    surname: "แพงศรี",
    dob: "2560-08-05", // 5/8/2560
    weight: 18,
    height: 123,
    status: "pending",
    formData: null
  },
  {
    id: "3887",
    nationalId: "1-4199-03321-05-2",
    title: "เด็กหญิง",
    name: "ณัฐณิชา",
    surname: "นนตะบุตร",
    dob: "2560-11-07", // 7/11/2560
    weight: 17,
    height: 121,
    status: "pending",
    formData: null
  }
];

export function createDefaultFormData(student: Student): any {
  return {
    familyStatus: "พ่อแม่อยู่ด้วยกัน",
    staysWith: "พ่อ/แม่",
    guardianTitle: student.name === "พัดชา" || student.name === "สาวิตรี" || student.name === "ณัฐณิชา" ? "นาย" : "นาย",
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
        name: student.title + " " + student.name + " " + student.surname,
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
        age: 35,
        disabled: false,
        chronicDisease: false,
        incomeWage: 4000,
        incomeAgriculture: 0,
        incomeBusiness: 0,
        incomeWelfare: 0,
        incomeOther: 0,
        incomeTotal: 4000
      },
      {
        id: "3",
        name: "",
        relationship: "แม่",
        nationalId: "",
        education: "ประถมศึกษา",
        age: 32,
        disabled: false,
        chronicDisease: false,
        incomeWage: 3000,
        incomeAgriculture: 0,
        incomeBusiness: 0,
        incomeWelfare: 0,
        incomeOther: 0,
        incomeTotal: 3000
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
    wallMaterial: "ฝาไม้/สังกะสี",
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
    travelDistance: 2.5,
    travelTimeHour: 0,
    travelTimeMinute: 15,
    travelExpense: 150,
    dailyPocketMoney: 40,
    addressNo: "",
    addressMoo: "",
    addressSoi: "",
    addressRoad: "",
    addressSubdistrict: "บ้านเชียงพิณ",
    addressDistrict: "เมืองอุดรธานี",
    addressProvince: "อุดรธานี",
    addressPostalCode: "41000",
    photoExterior: "",
    photoInterior: "",
    certifiedCorrect: true,
    studentSignature: "",
    guardianSignature: "",
    teacherSignature: "",
    principalSignature: "",
    surveyorName: "นางสาวเบญจภรณ์ มโนสัมฤทธิ์",
    surveyorPosition: "ครูประจำชั้น ป.2",
    recordDate: new Date().toISOString().split('T')[0]
  };
}
