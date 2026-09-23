/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UioUnit {
  id: string;
  code: string; // e.g. EXCA-01, TRK-24
  name: string; // e.g. CAT 320D, Scania P410
  category: 'Excavator' | 'Bulldozer' | 'Dump Truck' | 'Wheel Loader' | 'Light Vehicle' | 'Other';
  serialNumber: string;
  engineNumber: string;
  manufactureYear: number;
  location: string;
  status: 'Operating' | 'Breakdown' | 'Under Maintenance' | 'Standby';
  currentHm: number; // Hour Meter (or KM for Light Vehicle)
  currentKm?: number; // Kilometer meter
  lastServiceHm: number; // HM when last serviced
  lastOilChangeHm: number; // HM when oil was last changed
  serviceInterval: number; // e.g. every 250 HM
  oilChangeInterval: number; // e.g. every 250 HM
  notes?: string;
  photoUrl?: string; // Base64 or URL for the unit image
}

export interface SparePart {
  id: string;
  code: string; // e.g. OIL-15W40, FIL-OIL-02
  name: string;
  category: 'Oil' | 'Filter' | 'Engine Parts' | 'Brakes' | 'Tires' | 'Hydraulics' | 'Electrical' | 'Other';
  stock: number;
  minStock: number;
  unit: string; // e.g. Liter, Pcs, Box, Set
  price: number; // Price in IDR (Rupiah)
}

export type UserRole = 'Planner / Admin' | 'Foreman / Leader Workshop' | 'Tim Gudang' | 'Mekanik / Operator';

export type PauseReason = 'Waiting for Parts' | 'Waiting Approval' | 'End of Shift';

export interface PauseLog {
  id: string;
  startTime: string; // YYYY-MM-DD HH:mm
  endTime?: string; // YYYY-MM-DD HH:mm
  reason: PauseReason;
  notes?: string;
  durationHours?: number;
  isOffShift?: boolean; // True for "End of Shift / Jam Kerja Berakhir"
}

export interface PartUsage {
  partId: string;
  quantity: number;
  priceAtSale: number;
}

export interface ProgressLog {
  id: string;
  timestamp: string; // YYYY-MM-DD HH:mm
  status: string; // e.g. Admin Processing, Waiting for Parts, On Repair, Quality Control, Ready for Pickup, Completed
  notes: string;
  updatedBy: string;
}

export interface WorkshopBooking {
  id: string;
  unitId: string;
  unitCode: string;
  bookingDate: string; // YYYY-MM-DD
  workshopName: string; // e.g. Workshop Utama, Workshop Site Maro, Bengkel Mitra A
  serviceType: 'Periodic Service' | 'Oil Change' | 'Repair' | 'General Inspection';
  targetHm: number; // Expected HM at service
  mechanicName?: string; // Primary mechanic or joined names (can be empty initially in queue)
  mechanicsAssigned?: string[]; // Up to 3 mechanics assigned
  notes: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  partsUsed: PartUsage[];
  actualCompletionHm: number | null; // Filled when completed
  totalCost: number;
  
  // Flat Rate fields
  flatRateHours?: number; // Standard Flat Rate hours
  flatRateCost?: number;  // Standard Flat Rate labor cost

  // New fields for extended complaints, KM/HM tracking, timeline progress, pause logs
  kmAtBooking: number;
  hmAtBooking: number;
  damageType: string; // e.g. Engine, Hydraulic, Electrical, Brake System, Transmission, AC, etc.
  complaint: string; // Keluhan
  progressStatus: 'Admin Processing' | 'Waiting for Parts' | 'On Repair' | 'Quality Control' | 'Ready for Pickup' | 'Completed';
  progressLogs: ProgressLog[];

  // Advanced Pause & Time tracking
  pauseState?: 'Active' | 'Paused';
  currentPauseReason?: PauseReason;
  pauseLogs?: PauseLog[];
  totalWorkHoursCalculated?: number;
  totalPausedHoursCalculated?: number;
  offShiftPausedDaysCalculated?: number;

  // Role notes & Warehouse tracking
  plannerNotes?: string;
  warehouseInputBy?: string;
  warehouseInputAt?: string;
}

export type WorkOrder = WorkshopBooking;

export interface InspectionComment {
  id: string;
  senderName: string;
  senderRole: 'Mekanik' | 'Planner' | 'Foreman' | 'Supervisor';
  timestamp: string;
  commentText: string;
  photoUrl?: string;
}

export interface MechanicInspection {
  id: string;
  unitId: string;
  unitCode: string;
  unitName?: string;
  inspectorName: string;
  inspectionDate: string; // YYYY-MM-DD
  systemCategory: 'Engine' | 'Hydraulic' | 'Brakes' | 'Transmission' | 'Electrical' | 'Undercarriage' | 'Cabin & AC' | 'Structure' | 'Other';
  findings: string; // Temuan kerusakan / hasil pengecekan mekanik
  recommendation: string; // Rekomendasi perbaikan / tindakan
  urgency: 'Routine' | 'Urgent' | 'Critical';
  status: 'Pending Planner' | 'Need Info' | 'Scheduled' | 'Rejected';
  plannerNotes?: string; // Alasan penolakan atau catatan planner
  workOrderId?: string; // ID Work Order jika disetujui / dijadwalkan
  createdAt: string;
  comments?: InspectionComment[];
  photos?: string[]; // Attached photo URLs or Base64 images
}

export interface UnitDispatchLog {
  id: string;
  unitId: string;
  unitCode: string;
  dispatchTime: string; // YYYY-MM-DD HH:mm (Jam Keluar Unit dari Workshop)
  operatingHours: number; // Jam Operasi Unit (Operating Hours)
  operatorName: string;
  notes?: string;
}

export interface FleetKPIs {
  mttrHours: number; // Mean Time To Repair
  mtbfHours: number; // Mean Time Between Failures
  mechanicalAvailability: number; // MA %
  physicalAvailability: number; // PA %
  totalOperatingHours: number;
  totalDowntimeHours: number;
}

export interface BreakdownLog {
  id: string;
  unitId: string;
  unitCode: string;
  reportedDate: string; // YYYY-MM-DD HH:mm
  damageDescription: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  reportedBy: string;
  status: 'Open' | 'Investigating' | 'On Repair' | 'Resolved';
  resolvedDate: string | null;
  actionTaken: string | null;
  gpsLocation?: {
    latitude: number;
    longitude: number;
    locationName?: string;
    googleMapsUrl?: string;
  };
}

export interface RepairHistory {
  id: string;
  unitId: string;
  unitCode: string;
  completionDate: string; // YYYY-MM-DD
  serviceType: string;
  hmAtService: number;
  description: string;
  mechanicName: string;
  partsUsed: Array<{
    partId: string;
    partName: string;
    partCode: string;
    quantity: number;
    price: number;
  }>;
  totalCost: number;
  bookingId: string | null;
}

export interface HmUpdateLog {
  id: string;
  unitId: string;
  unitCode: string;
  previousHm: number;
  newHm: number;
  previousKm?: number;
  newKm?: number;
  updatedAt: string; // YYYY-MM-DD HH:mm
  notes?: string;
}

export interface Mechanic {
  id: string;
  name: string;
  role: string; // e.g., 'Mekanik Utama', 'Mekanik Senior', 'Helper Mekanik', 'Spesialis Elektrikal'
  availableHours: number; // Jam tersedia dalam sebulan (default: 173)
  schedule: { [date: string]: 'Work' | 'Off' }; // Jadwal harian bulanan (e.g. "2026-07-20": "Work")
}

export interface AppUser {
  id: string;
  username: string;
  name: string;
  role: 'Super Admin' | 'Workshop Manager' | 'Admin Bengkel' | 'Mekanik';
  status: 'Active' | 'Inactive';
}

export interface AppSettings {
  totalBays: number;
}

export interface DashboardStats {
  totalUnits: number;
  activeUnits: number;
  breakdownUnits: number;
  underMaintenanceUnits: number;
  standbyUnits: number; // Unit status 'Standby'
  unitsEnteredThisMonth: number; // Unit masuk bulan ini
  totalRepairHours: number; // Total estimasi jam perbaikan
  totalAvailableHours: number; // Total jam mekanik tersedia
  overdueServiceCount: number;
  overdueOilCount: number;
  lowStockCount: number;
  activeBookings: number;
}

// ----------------------------------------------------
// MANPOWER MANAGEMENT & PRODUCTIVITY TRACKING TYPES
// ----------------------------------------------------

export type ManpowerRole = 'Foreman' | 'Mekanik' | 'Helper' | 'Tireman' | 'Auto-Electrician' | 'Welder';

export type ManpowerSkillLevel = 'Junior' | 'Senior' | 'Lead' | 'Spesialis';

export type ManpowerShift = 'Shift 1 (Pagi)' | 'Shift 2 (Malam)' | 'Roster Off' | 'Standby';

export type ManpowerStatus = 'On Duty' | 'In Job' | 'Standby' | 'Roster Off' | 'Cuti / Izin' | 'Sakit';

export interface ActiveJobAssignment {
  workOrderId?: string;
  unitCode: string;
  unitName?: string;
  jobType: string;
  bay?: string;
  startTime: string;
  targetHours: number;
}

export interface WeeklyRosterSchedule {
  monday: ManpowerShift;
  tuesday: ManpowerShift;
  wednesday: ManpowerShift;
  thursday: ManpowerShift;
  friday: ManpowerShift;
  saturday: ManpowerShift;
  sunday: ManpowerShift;
}

export interface ManpowerPerson {
  id: string;
  nrp: string; // Nomor Registrasi Pegawai
  name: string;
  role: ManpowerRole;
  skillLevel: ManpowerSkillLevel;
  phone: string;
  email?: string;
  shift: ManpowerShift;
  status: ManpowerStatus;
  assignedBay?: string;
  activeJob?: ActiveJobAssignment | null;
  weeklyRoster?: WeeklyRosterSchedule;
  checkInTime?: string;
  standardMonthlyHours: number; // Default standar jam kerja per bulan (173 jam)
  actualWorkHours: number; // Jam aktual kerja fisik bulan berjalan
  flatRateHoursEarned: number; // Jam standar flat rate yang berhasil diselesaikan
  efficiencyRatio: number; // (flatRateHoursEarned / actualWorkHours) * 100
  utilizationRate: number; // (actualWorkHours / standardMonthlyHours) * 100
  completedJobsCount: number; // Jumlah WO/tugas yang diselesaikan bulan ini
  specialties: string[]; // Keahlian khusus, misal: 'Engine Overhaul', 'Troubleshooting Hidrolik'
  certifications: string[]; // Sertifikasi: 'POP Pertambangan', 'Komatsu Specialist', 'Tire OTR Level 2'
  joinedDate: string; // YYYY-MM-DD
  rating: number; // 1.0 - 5.0
  notes?: string;
}

export interface ManpowerTaskLog {
  id: string;
  personId: string;
  personName: string;
  role: ManpowerRole;
  unitCode: string;
  taskTitle: string;
  category: 'Preventive Maintenance' | 'Breakdown / Corrective' | 'Tire Management' | 'Inspection & Backlog' | 'Welding & Fabrikasi' | 'General Repair';
  completedAt: string;
  actualHours: number;
  flatRateHours: number;
  efficiencyScore: number; // (flatRateHours / actualHours) * 100
  status: 'Completed' | 'Pending QC';
  notes?: string;
}

