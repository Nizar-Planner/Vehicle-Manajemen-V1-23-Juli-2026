/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import type { UioUnit, SparePart, WorkshopBooking, BreakdownLog, RepairHistory, DashboardStats, MechanicInspection, UnitDispatchLog, ManpowerPerson, ManpowerTaskLog } from "./src/types";
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db_fleetcare.json");

// Helper to generate IDs
const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

// Initial Seed Data
  const getInitialData = () => {
  const uioUnits: UioUnit[] = [
    {
      id: "U-EXCA01",
      code: "EXCA-01",
      name: "Caterpillar 320D Excavator",
      category: "Excavator",
      serialNumber: "CAT320D-123456",
      engineNumber: "C6.4-9876",
      manufactureYear: 2021,
      location: "Site Maro (Sektor Barat)",
      status: "Operating",
      currentHm: 4120,
      currentKm: 8240,
      lastServiceHm: 4000,
      lastOilChangeHm: 4000,
      serviceInterval: 250,
      oilChangeInterval: 250,
      notes: "Kondisi bucket mulus, sistem hidrolik normal.",
      photoUrl: ""
    },
    {
      id: "U-BULL02",
      code: "BULL-02",
      name: "Komatsu D85ESS-2 Bulldozer",
      category: "Bulldozer",
      serialNumber: "KOMD85-7729",
      engineNumber: "SAD6D125",
      manufactureYear: 2020,
      location: "Site North (Area Land Clearing)",
      status: "Under Maintenance",
      currentHm: 6280, // 280 HM since last service -> OVERDUE (interval 250)
      currentKm: 12560,
      lastServiceHm: 6000,
      lastOilChangeHm: 6000,
      serviceInterval: 250,
      oilChangeInterval: 250,
      notes: "Sedang perbaikan radiator bocor dan overheat.",
      photoUrl: ""
    },
    {
      id: "U-DUMP05",
      code: "DUMP-05",
      name: "Hino Ranger FM 260 JD",
      category: "Dump Truck",
      serialNumber: "HINO-FM-5541",
      engineNumber: "J08E",
      manufactureYear: 2022,
      location: "Site South (Hauling Jalan Utama)",
      status: "Operating",
      currentHm: 22400,
      currentKm: 112000,
      lastServiceHm: 20000,
      lastOilChangeHm: 20000,
      serviceInterval: 5000, // Every 5000 KM
      oilChangeInterval: 5000,
      notes: "Sistem rem baru diganti bulan lalu. Lancar.",
      photoUrl: ""
    },
    {
      id: "U-DUMP06",
      code: "DUMP-06",
      name: "Hino Ranger FM 260 JD",
      category: "Dump Truck",
      serialNumber: "HINO-FM-5542",
      engineNumber: "J08E-X",
      manufactureYear: 2022,
      location: "Workshop Site South",
      status: "Breakdown",
      currentHm: 18750,
      currentKm: 93750,
      lastServiceHm: 15000,
      lastOilChangeHm: 15000,
      serviceInterval: 5000,
      oilChangeInterval: 5000,
      notes: "Kerusakan transmisi gigi 3 selip.",
      photoUrl: ""
    },
    {
      id: "U-LOAD01",
      code: "LOAD-01",
      name: "CAT 950GC Wheel Loader",
      category: "Wheel Loader",
      serialNumber: "CAT950-559",
      engineNumber: "C7.1",
      manufactureYear: 2021,
      location: "Stockpile Utama Maro",
      status: "Operating",
      currentHm: 3110,
      currentKm: 6220,
      lastServiceHm: 3000,
      lastOilChangeHm: 3000,
      serviceInterval: 250,
      oilChangeInterval: 250,
      notes: "Grip ban belakang mulai menipis, masih layak pakai.",
      photoUrl: ""
    },
    {
      id: "U-LV09",
      code: "LV-09",
      name: "Toyota Hilux 2.4 D-4D",
      category: "Light Vehicle",
      serialNumber: "YOT-HLX-901",
      engineNumber: "2GD-FTV",
      manufactureYear: 2023,
      location: "Kantor Pusat Maro",
      status: "Operating",
      currentHm: 42300, // 2300 KM since last service, interval is 10000
      currentKm: 42300,
      lastServiceHm: 40000,
      lastOilChangeHm: 40000,
      serviceInterval: 10000,
      oilChangeInterval: 5000,
      notes: "Digunakan operasional staff lapangan.",
      photoUrl: ""
    }
  ];

  const spareParts: SparePart[] = [
    {
      id: "P-OIL15W40-D",
      code: "OIL-15W40-D",
      name: "Oli Mesin Meditran SX 15W-40 (Drum 200L)",
      category: "Oil",
      stock: 8,
      minStock: 3,
      unit: "Drum",
      price: 8500000
    },
    {
      id: "P-OIL15W40-L",
      code: "OIL-15W40-L",
      name: "Oli Mesin Meditran SX 15W-40 (1 Liter)",
      category: "Oil",
      stock: 140,
      minStock: 50,
      unit: "Liter",
      price: 75000
    },
    {
      id: "P-FILOIL-CAT",
      code: "FIL-OIL-CAT320",
      name: "Filter Oli Caterpillar 320D",
      category: "Filter",
      stock: 22,
      minStock: 5,
      unit: "Pcs",
      price: 350000
    },
    {
      id: "P-FILFUEL-HINO",
      code: "FIL-FUEL-HINO",
      name: "Filter Solar Hino Ranger FM",
      category: "Filter",
      stock: 15,
      minStock: 6,
      unit: "Pcs",
      price: 185000
    },
    {
      id: "P-FILAIR-KOM",
      code: "FIL-AIR-KOMD85",
      name: "Filter Udara Komatsu D85ESS",
      category: "Filter",
      stock: 4, // Below minStock (5) -> Alert!
      minStock: 5,
      unit: "Pcs",
      price: 850000
    },
    {
      id: "P-BRKP-HINO",
      code: "BRK-PAD-HINO",
      name: "Kampas Rem Set Depan Hino Ranger",
      category: "Brakes",
      stock: 18,
      minStock: 4,
      unit: "Set",
      price: 1200000
    },
    {
      id: "P-HYDHOSE-34",
      code: "HYD-HOSE-34",
      name: "Selang Hidrolik High Pressure 3/4 inch (10m)",
      category: "Hydraulics",
      stock: 6,
      minStock: 2,
      unit: "Pcs",
      price: 1500000
    },
    {
      id: "P-ALT24V",
      code: "ALT-24V-HD",
      name: "Alternator 24V Heavy Duty 80A",
      category: "Electrical",
      stock: 3,
      minStock: 2,
      unit: "Pcs",
      price: 3800000
    },
    {
      id: "P-TRKSHOE-KOM",
      code: "TRK-SHOE-D85",
      name: "Track Shoe Komatsu D85ESS",
      category: "Engine Parts",
      stock: 45,
      minStock: 10,
      unit: "Pcs",
      price: 750000
    },
    {
      id: "P-VBELT-CAT",
      code: "VBELT-CAT320",
      name: "Fan & Alternator V-Belt CAT 320D",
      category: "Engine Parts",
      stock: 0,
      minStock: 4,
      unit: "Pcs",
      price: 420000
    },
    {
      id: "P-SEAL-HYD",
      code: "SEAL-BOOM-D85",
      name: "Hydraulic Cylinder Boom Seal Kit Komatsu D85",
      category: "Hydraulics",
      stock: 0,
      minStock: 3,
      unit: "Set",
      price: 2750000
    }
  ];

  const bookings: WorkshopBooking[] = [
    {
      id: "B-001",
      unitId: "U-BULL02",
      unitCode: "BULL-02",
      bookingDate: "2026-07-21",
      workshopName: "Workshop Site North",
      serviceType: "Periodic Service",
      targetHm: 6250,
      mechanicName: "Suryadi (Senior Mechanic)",
      notes: "Periodic Service 250 jam + Ganti Oli Mesin dan Filter Oli",
      status: "In Progress",
      partsUsed: [
        { partId: "P-OIL15W40-L", quantity: 28, priceAtSale: 75000 },
        { partId: "P-FILOIL-CAT", quantity: 1, priceAtSale: 350000 }
      ],
      actualCompletionHm: null,
      totalCost: 2450000,
      kmAtBooking: 31250,
      hmAtBooking: 6200,
      damageType: "Periodic Maintenance",
      complaint: "Suara mesin agak kasar, waktu servis berkala tercapai.",
      progressStatus: "On Repair",
      progressLogs: [
        {
          id: "L-LOG001a",
          timestamp: "2026-07-20 08:30",
          status: "Admin Processing",
          notes: "Work order disetujui, suku cadang dialokasikan.",
          updatedBy: "Admin Site"
        },
        {
          id: "L-LOG001b",
          timestamp: "2026-07-21 09:00",
          status: "On Repair",
          notes: "Unit telah masuk ke Bay-1. Penggantian oli mesin sedang berlangsung.",
          updatedBy: "Suryadi (Senior Mechanic)"
        }
      ]
    },
    {
      id: "B-002",
      unitId: "U-EXCA01",
      unitCode: "EXCA-01",
      bookingDate: "2026-07-23",
      workshopName: "Workshop Utama Maro",
      serviceType: "Oil Change",
      targetHm: 4250,
      mechanicName: "Herianto",
      notes: "Penggantian rutin oli mesin dan filter oli cadangan",
      status: "Pending",
      partsUsed: [
        { partId: "P-OIL15W40-L", quantity: 24, priceAtSale: 75000 }
      ],
      actualCompletionHm: null,
      totalCost: 1800000,
      kmAtBooking: 21250,
      hmAtBooking: 4210,
      damageType: "Routine Lubrication",
      complaint: "Ganti oli mesin berkala.",
      progressStatus: "Admin Processing",
      progressLogs: [
        {
          id: "L-LOG002a",
          timestamp: "2026-07-20 10:15",
          status: "Admin Processing",
          notes: "Menunggu jadwal masuk antrean workshop.",
          updatedBy: "Admin Site"
        }
      ]
    }
  ];

  const breakdowns: BreakdownLog[] = [
    {
      id: "L-001",
      unitId: "U-DUMP06",
      unitCode: "DUMP-06",
      reportedDate: "2026-07-18 09:15",
      damageDescription: "Kerusakan pada sistem transmisi gigi 3 sering selip dan sulit masuk.",
      severity: "High",
      reportedBy: "Ahmad Nizar (Operator)",
      status: "On Repair",
      resolvedDate: null,
      actionTaken: "Sedang dilakukan pembongkaran gearbox untuk pemeriksaan kampas kopling ganda."
    },
    {
      id: "L-002",
      unitId: "U-BULL02",
      unitCode: "BULL-02",
      reportedDate: "2026-07-19 14:30",
      damageDescription: "Suhu pendingin mesin terlalu tinggi (overheat) saat dioperasikan di tanjakan.",
      severity: "Critical",
      reportedBy: "Arif (Mekanik)",
      status: "On Repair",
      resolvedDate: null,
      actionTaken: "Pembersihan sirip radiator luar dan penggantian thermostat mesin."
    }
  ];

  const repairs: RepairHistory[] = [
    {
      id: "R-001",
      unitId: "U-LV09",
      unitCode: "LV-09",
      completionDate: "2026-07-10",
      serviceType: "Periodic Service",
      hmAtService: 40000,
      description: "Servis berkala 40.000 KM. Ganti oli mesin, filter oli, rotasi roda, dan kalibrasi rem depan.",
      mechanicName: "Joko",
      partsUsed: [
        {
          partId: "P-OIL15W40-L",
          partName: "Oli Mesin Meditran SX 15W-40 (1 Liter)",
          partCode: "OIL-15W40-L",
          quantity: 6,
          price: 75000
        }
      ],
      totalCost: 450000,
      bookingId: null
    },
    {
      id: "R-002",
      unitId: "U-LOAD01",
      unitCode: "LOAD-01",
      completionDate: "2026-07-12",
      serviceType: "Oil Change",
      hmAtService: 3000,
      description: "Ganti oli mesin berkala standar 250 jam kerja.",
      mechanicName: "M. Arif",
      partsUsed: [
        {
          partId: "P-OIL15W40-L",
          partName: "Oli Mesin Meditran SX 15W-40 (1 Liter)",
          partCode: "OIL-15W40-L",
          quantity: 20,
          price: 75000
        }
      ],
      totalCost: 1500000,
      bookingId: null
    }
  ];

  const hmLogs: Array<{
    id: string;
    unitId: string;
    unitCode: string;
    previousHm: number;
    newHm: number;
    previousKm?: number;
    newKm?: number;
    updatedAt: string;
    notes: string;
  }> = [
    {
      id: "HML-001",
      unitId: "U-EXCA01",
      unitCode: "EXCA-01",
      previousHm: 4000,
      newHm: 4050,
      previousKm: 8000,
      newKm: 8100,
      updatedAt: "2026-07-12 10:00",
      notes: "Log rutin harian setelah shift pagi"
    },
    {
      id: "HML-002",
      unitId: "U-EXCA01",
      unitCode: "EXCA-01",
      previousHm: 4050,
      newHm: 4120,
      previousKm: 8100,
      newKm: 8240,
      updatedAt: "2026-07-18 16:30",
      notes: "Update mingguan sebelum libur shift"
    },
    {
      id: "HML-003",
      unitId: "U-BULL02",
      unitCode: "BULL-02",
      previousHm: 6000,
      newHm: 6150,
      previousKm: 12000,
      newKm: 12300,
      updatedAt: "2026-07-10 09:15",
      notes: "Update rutin oleh pengawas lapangan"
    },
    {
      id: "HML-004",
      unitId: "U-BULL02",
      unitCode: "BULL-02",
      previousHm: 6150,
      newHm: 6280,
      previousKm: 12300,
      newKm: 12560,
      updatedAt: "2026-07-19 11:45",
      notes: "Pengecekan sebelum masuk jadwal servis"
    },
    {
      id: "HML-005",
      unitId: "U-DUMP05",
      unitCode: "DUMP-05",
      previousHm: 20000,
      newHm: 21200,
      updatedAt: "2026-07-05 08:00",
      notes: "Pembacaan KM mingguan jalan hauling"
    },
    {
      id: "HML-006",
      unitId: "U-DUMP05",
      unitCode: "DUMP-05",
      previousHm: 21200,
      newHm: 22400,
      updatedAt: "2026-07-15 15:20",
      notes: "Pembacaan KM hauling rute maro timur"
    }
  ];

  const mechanics = [
    {
      id: "M-001",
      name: "Suryadi",
      role: "Mekanik Utama",
      availableHours: 173,
      schedule: {
        "2026-07-20": "Work",
        "2026-07-21": "Work",
        "2026-07-22": "Work",
        "2026-07-23": "Work",
        "2026-07-24": "Work",
        "2026-07-25": "Off",
        "2026-07-26": "Off",
      }
    },
    {
      id: "M-002",
      name: "Herianto",
      role: "Mekanik Senior",
      availableHours: 173,
      schedule: {
        "2026-07-20": "Work",
        "2026-07-21": "Work",
        "2026-07-22": "Work",
        "2026-07-23": "Work",
        "2026-07-24": "Work",
        "2026-07-25": "Off",
        "2026-07-26": "Off",
      }
    },
    {
      id: "M-003",
      name: "Joko",
      role: "Mekanik Senior",
      availableHours: 160,
      schedule: {
        "2026-07-20": "Work",
        "2026-07-21": "Work",
        "2026-07-22": "Work",
        "2026-07-23": "Off",
        "2026-07-24": "Work",
        "2026-07-25": "Work",
        "2026-07-26": "Off",
      }
    },
    {
      id: "M-004",
      name: "M. Arif",
      role: "Helper Mekanik",
      availableHours: 173,
      schedule: {
        "2026-07-20": "Work",
        "2026-07-21": "Work",
        "2026-07-22": "Work",
        "2026-07-23": "Work",
        "2026-07-24": "Work",
        "2026-07-25": "Off",
        "2026-07-26": "Off",
      }
    }
  ];

  const appUsers = [
    {
      "id": "U-000",
      "username": "ahmadnizar",
      "name": "Ahmad Nizar Arif",
      "role": "Super Admin",
      "status": "Active"
    },
    {
      id: "U-001",
      username: "arfan",
      name: "Arfan Rico Prasetyo",
      role: "Super Admin",
      status: "Active"
    },
    {
      id: "U-002",
      username: "bengkel_admin",
      name: "Admin Bengkel Maro",
      role: "Admin Bengkel",
      status: "Active"
    }
  ];

  const appSettings = {
    totalBays: 1
  };

// Seed Inspections Data
  const inspections: MechanicInspection[] = [
    {
      id: "INS-001",
      unitId: "U-EXCA01",
      unitCode: "EXCA-01",
      unitName: "Caterpillar 320D Excavator",
      inspectorName: "Suryadi",
      inspectionDate: "2026-07-20",
      systemCategory: "Hydraulic",
      findings: "Ditemukan rembesan oli tipis pada seal cylinder boom kanan.",
      recommendation: "Ganti kit seal cylinder boom sebelum kebocoran bertambah parah.",
      urgency: "Urgent",
      status: "Pending Planner",
      createdAt: "2026-07-20 14:00"
    },
    {
      id: "INS-002",
      unitId: "U-DUMP05",
      unitCode: "DUMP-05",
      unitName: "Hino Ranger FM 260 JD",
      inspectorName: "Herianto",
      inspectionDate: "2026-07-19",
      systemCategory: "Brakes",
      findings: "Ketebalan kampas rem roda belakang kiri tersisa 15%.",
      recommendation: "Penggantian kampas rem set belakang.",
      urgency: "Routine",
      status: "Scheduled",
      plannerNotes: "Telah dibuatkan Work Order perbaikan rutin minggu depan.",
      workOrderId: "B-002",
      createdAt: "2026-07-19 11:30"
    }
  ];

  const dispatchLogs: UnitDispatchLog[] = [];

  const manpower: ManpowerPerson[] = [
    {
      id: "MP-001",
      nrp: "NRP-72019",
      name: "Bambang Suherman",
      role: "Foreman",
      skillLevel: "Lead",
      phone: "+62 812-4433-2101",
      email: "bambang.foreman@fleetcare.id",
      shift: "Shift 1 (Pagi)",
      status: "On Duty",
      assignedBay: "Bay 1 & Bay 2 (Workshop Utama)",
      activeJob: {
        workOrderId: "B-001",
        unitCode: "DUMP-06",
        unitName: "Hino Ranger Dump Hauler",
        jobType: "Supervisi Overhaul Gearbox Transmisi",
        bay: "Bay 1",
        startTime: "2026-09-22 08:30",
        targetHours: 6.0
      },
      standardMonthlyHours: 173,
      actualWorkHours: 162,
      flatRateHoursEarned: 181,
      efficiencyRatio: 111.7,
      utilizationRate: 93.6,
      completedJobsCount: 28,
      specialties: ["Supervisi Heavy Equipment", "Troubleshooting Powertrain", "Safety POP K3"],
      certifications: ["Pengawas Operasional Pertama (POP) ESDM", "Komatsu Heavy Master Certified", "ISO 45001 K3"],
      joinedDate: "2019-03-15",
      rating: 4.9,
      notes: "Foreman workshop utama, disiplin tinggi dan rekam jejak zero accident."
    },
    {
      id: "MP-002",
      nrp: "NRP-72045",
      name: "Agus Priyanto",
      role: "Foreman",
      skillLevel: "Senior",
      phone: "+62 813-8899-7711",
      email: "agus.priyanto@fleetcare.id",
      shift: "Shift 2 (Malam)",
      status: "Standby",
      assignedBay: "Dispatch & Field Quick Response",
      activeJob: null,
      standardMonthlyHours: 173,
      actualWorkHours: 158,
      flatRateHoursEarned: 167,
      efficiencyRatio: 105.7,
      utilizationRate: 91.3,
      completedJobsCount: 22,
      specialties: ["Night Shift Breakdown Dispatch", "Quick Diagnostic", "Emergency Recovery"],
      certifications: ["POP Pertambangan", "First Aid Responder", "Heavy Towing Operator"],
      joinedDate: "2020-07-01",
      rating: 4.8,
      notes: "Pengawas shift malam tanggap darurat unit breakdown di pit."
    },
    {
      id: "MP-003",
      nrp: "NRP-81014",
      name: "Suryadi",
      role: "Mekanik",
      skillLevel: "Senior",
      phone: "+62 821-5566-3322",
      email: "suryadi.mech@fleetcare.id",
      shift: "Shift 1 (Pagi)",
      status: "In Job",
      assignedBay: "Bay 1 (Heavy Repair)",
      activeJob: {
        workOrderId: "B-001",
        unitCode: "DUMP-06",
        unitName: "Hino Ranger FM 260 JD",
        jobType: "Overhaul Gearbox Gigi 3 & Kampas Kopling",
        bay: "Bay 1",
        startTime: "2026-09-22 09:00",
        targetHours: 6.0
      },
      standardMonthlyHours: 173,
      actualWorkHours: 165,
      flatRateHoursEarned: 179,
      efficiencyRatio: 108.5,
      utilizationRate: 95.4,
      completedJobsCount: 24,
      specialties: ["Engine CAT & Cummins", "Transmisi Heavy Hauler", "Fuel System Common Rail"],
      certifications: ["Caterpillar 320D Master Technician", "Hino Heavy Duty Certified"],
      joinedDate: "2018-05-10",
      rating: 4.9,
      notes: "Mekanik andalan untuk engine dan transmisi alat berat."
    },
    {
      id: "MP-004",
      nrp: "NRP-81033",
      name: "Herianto",
      role: "Mekanik",
      skillLevel: "Senior",
      phone: "+62 822-7788-9900",
      email: "herianto.hyd@fleetcare.id",
      shift: "Shift 1 (Pagi)",
      status: "In Job",
      assignedBay: "Bay 2 (Service PM)",
      activeJob: {
        workOrderId: "B-003",
        unitCode: "EXCA-01",
        unitName: "Caterpillar 320D Excavator",
        jobType: "Penggantian Seal Kit Cylinder Boom & Flush Hidrolik",
        bay: "Bay 2",
        startTime: "2026-09-22 10:15",
        targetHours: 4.0
      },
      standardMonthlyHours: 173,
      actualWorkHours: 160,
      flatRateHoursEarned: 171,
      efficiencyRatio: 106.9,
      utilizationRate: 92.5,
      completedJobsCount: 21,
      specialties: ["Hidrolik & Main Pump", "Cylinder Reseal", "Undercarriage Alignment"],
      certifications: ["Hydraulics Pro Level 3", "Komatsu Undercarriage Specialist"],
      joinedDate: "2019-11-20",
      rating: 4.8,
      notes: "Spesialis kebocoran oli hidrolik dan perakitan valve bank."
    },
    {
      id: "MP-005",
      nrp: "NRP-81056",
      name: "Joko Susilo",
      role: "Mekanik",
      skillLevel: "Senior",
      phone: "+62 813-1122-3344",
      email: "joko.susilo@fleetcare.id",
      shift: "Shift 1 (Pagi)",
      status: "On Duty",
      assignedBay: "Bay 3 (Light Vehicle & Aux)",
      activeJob: null,
      standardMonthlyHours: 173,
      actualWorkHours: 154,
      flatRateHoursEarned: 157,
      efficiencyRatio: 101.9,
      utilizationRate: 89.0,
      completedJobsCount: 19,
      specialties: ["Brake System Pneumatic", "Suspensi & Propeller Shaft", "Servis Berkala 250 HM"],
      certifications: ["Brake Air System Certified", "Heavy Vehicle Inspection"],
      joinedDate: "2021-02-14",
      rating: 4.7,
      notes: "Terampil penanganan cepat rem dan servis berkala armada LV & Dump Truck."
    },
    {
      id: "MP-006",
      nrp: "NRP-81088",
      name: "Dedi Kurniawan",
      role: "Auto-Electrician",
      skillLevel: "Spesialis",
      phone: "+62 852-6677-8899",
      email: "dedi.electric@fleetcare.id",
      shift: "Shift 1 (Pagi)",
      status: "In Job",
      assignedBay: "Bay 3 (Electrical & AC)",
      activeJob: {
        workOrderId: "B-004",
        unitCode: "BULL-02",
        unitName: "Komatsu D85ESS-2 Dozer",
        jobType: "Troubleshooting Wiring Harness 24V & Starter Motor",
        bay: "Bay 3",
        startTime: "2026-09-22 11:00",
        targetHours: 3.5
      },
      standardMonthlyHours: 173,
      actualWorkHours: 161,
      flatRateHoursEarned: 178,
      efficiencyRatio: 110.6,
      utilizationRate: 93.1,
      completedJobsCount: 26,
      specialties: ["Wiring Harness 24V Heavy Duty", "Alternator & Starter Repair", "ECM Scanner Diagnostic"],
      certifications: ["Auto-Electrician Specialist Level 3", "Electronic Technician ET CAT"],
      joinedDate: "2020-04-18",
      rating: 4.9,
      notes: "Spesialis kelistrikan alat berat dan kalibrasi sensor ECU."
    },
    {
      id: "MP-007",
      nrp: "NRP-85012",
      name: "Hendra Saputra",
      role: "Tireman",
      skillLevel: "Lead",
      phone: "+62 812-9900-1122",
      email: "hendra.tireman@fleetcare.id",
      shift: "Shift 1 (Pagi)",
      status: "In Job",
      assignedBay: "Tire Bay & OTR Area",
      activeJob: {
        workOrderId: "B-005",
        unitCode: "DUMP-05",
        unitName: "Hino Ranger FM 260 JD",
        jobType: "Penggantian Ban Belakang Kiri & Rotasi Ban OTR",
        bay: "Tire Bay",
        startTime: "2026-09-22 09:30",
        targetHours: 3.0
      },
      standardMonthlyHours: 173,
      actualWorkHours: 166,
      flatRateHoursEarned: 177,
      efficiencyRatio: 106.6,
      utilizationRate: 96.0,
      completedJobsCount: 34,
      specialties: ["OTR Tyre Replacement", "Tyre Inflation Safety Cage", "Wheel Rim Crack Inspection"],
      certifications: ["TIA Earthmover Tire Service Specialist", "Heavy Rim Safety Handling"],
      joinedDate: "2019-08-25",
      rating: 4.8,
      notes: "Lead tireman, ahli manajemen tekanan ban OTR dan rotasi haul road."
    },
    {
      id: "MP-008",
      nrp: "NRP-85044",
      name: "Wahyu Pratama",
      role: "Tireman",
      skillLevel: "Junior",
      phone: "+62 813-7766-5544",
      email: "wahyu.tireman@fleetcare.id",
      shift: "Shift 1 (Pagi)",
      status: "In Job",
      assignedBay: "Tire Bay & OTR Area",
      activeJob: {
        workOrderId: "B-005",
        unitCode: "DUMP-05",
        unitName: "Hino Ranger FM 260 JD",
        jobType: "Asistensi Penggantian Ban Belakang & Pengecekan Torsi Baut",
        bay: "Tire Bay",
        startTime: "2026-09-22 09:30",
        targetHours: 3.0
      },
      standardMonthlyHours: 173,
      actualWorkHours: 159,
      flatRateHoursEarned: 163,
      efficiencyRatio: 102.5,
      utilizationRate: 91.9,
      completedJobsCount: 31,
      specialties: ["Torque Wrench Calibration", "Tyre Pressure Monitoring TPMS", "Penyimpanan Ban"],
      certifications: ["Basic Tire OTR Safety", "Pneumatic Tools Operator"],
      joinedDate: "2022-06-10",
      rating: 4.6,
      notes: "Tireman cekatan, bertanggung jawab atas checklist tekanan ban harian armada."
    },
    {
      id: "MP-009",
      nrp: "NRP-92011",
      name: "M. Arif",
      role: "Helper",
      skillLevel: "Senior",
      phone: "+62 823-3344-5566",
      email: "arif.helper@fleetcare.id",
      shift: "Shift 1 (Pagi)",
      status: "In Job",
      assignedBay: "Bay 1 (Heavy Repair)",
      activeJob: {
        workOrderId: "B-001",
        unitCode: "DUMP-06",
        unitName: "Hino Ranger FM 260 JD",
        jobType: "Pencucian Komponen Gearbox, Drain Oli & Penyiapan Tools",
        bay: "Bay 1",
        startTime: "2026-09-22 09:00",
        targetHours: 6.0
      },
      standardMonthlyHours: 173,
      actualWorkHours: 167,
      flatRateHoursEarned: 162,
      efficiencyRatio: 97.0,
      utilizationRate: 96.5,
      completedJobsCount: 29,
      specialties: ["Tool Room Keeper", "Pembersihan Parts & Degreasing", "Asistensi Servis Berkala"],
      certifications: ["Safety Housekeeping 5R", "Chemical Handling & APD"],
      joinedDate: "2021-09-01",
      rating: 4.7,
      notes: "Helper mekanik gesit, sangat teliti dalam merapikan special service tools (SST)."
    },
    {
      id: "MP-010",
      nrp: "NRP-92034",
      name: "Fajar Rizky",
      role: "Helper",
      skillLevel: "Junior",
      phone: "+62 856-4433-2211",
      email: "fajar.helper@fleetcare.id",
      shift: "Shift 2 (Malam)",
      status: "Roster Off",
      assignedBay: "Workshop Lapangan Pit Barat",
      activeJob: null,
      standardMonthlyHours: 173,
      actualWorkHours: 152,
      flatRateHoursEarned: 145,
      efficiencyRatio: 95.4,
      utilizationRate: 87.9,
      completedJobsCount: 20,
      specialties: ["Lube Bay Assistance", "Oil Dispensing Drum", "Pengecekan Level Fluida"],
      certifications: ["Basic Safety Mining", "Hazard Identification"],
      joinedDate: "2023-01-15",
      rating: 4.5,
      notes: "Sedang periode roster off 2 hari setelah giliran shift malam."
    }
  ];

  const manpowerTasks: ManpowerTaskLog[] = [
    {
      id: "TSK-001",
      personId: "MP-003",
      personName: "Suryadi",
      role: "Mekanik",
      unitCode: "LV-09",
      taskTitle: "Servis Berkala 40.000 KM & Kalibrasi Rem Depan",
      category: "Preventive Maintenance",
      completedAt: "2026-09-20 15:30",
      actualHours: 3.5,
      flatRateHours: 4.0,
      efficiencyScore: 114.3,
      status: "Completed",
      notes: "Pekerjaan selesai lebih cepat dari standar flat-rate, rem berfungsi optimal."
    },
    {
      id: "TSK-002",
      personId: "MP-004",
      personName: "Herianto",
      role: "Mekanik",
      unitCode: "LOAD-01",
      taskTitle: "Penggantian Oli Hidrolik & Filter Return 250 HM",
      category: "Preventive Maintenance",
      completedAt: "2026-09-21 11:45",
      actualHours: 2.0,
      flatRateHours: 2.0,
      efficiencyScore: 100.0,
      status: "Completed",
      notes: "Sesuai jadwal SOP tanpa kendala teknis."
    },
    {
      id: "TSK-003",
      personId: "MP-007",
      personName: "Hendra Saputra",
      role: "Tireman",
      unitCode: "DUMP-05",
      taskTitle: "Pemasangan Ban Baru OTR Posisi 3 & Balancing",
      category: "Tire Management",
      completedAt: "2026-09-21 14:15",
      actualHours: 2.2,
      flatRateHours: 2.5,
      efficiencyScore: 113.6,
      status: "Completed",
      notes: "Pengecekan rim dan mur roda dengan torque wrench terkalibrasi."
    },
    {
      id: "TSK-004",
      personId: "MP-006",
      personName: "Dedi Kurniawan",
      role: "Auto-Electrician",
      unitCode: "EXCA-01",
      taskTitle: "Perbaikan Alternator 24V & Penggantian Relay Starter",
      category: "Breakdown / Corrective",
      completedAt: "2026-09-21 16:40",
      actualHours: 2.8,
      flatRateHours: 3.0,
      efficiencyScore: 107.1,
      status: "Completed",
      notes: "Arus pengisian baterai normal 28.2V saat engine running."
    },
    {
      id: "TSK-005",
      personId: "MP-009",
      personName: "M. Arif",
      role: "Helper",
      unitCode: "BULL-02",
      taskTitle: "Asistensi Drain Oli Transmisi & Pembersihan Radiator",
      category: "Preventive Maintenance",
      completedAt: "2026-09-20 17:00",
      actualHours: 4.0,
      flatRateHours: 4.0,
      efficiencyScore: 100.0,
      status: "Completed",
      notes: "Membantu mekanik utama mencuci part dan membersihkan area bay."
    }
  ];

  return { uioUnits, spareParts, bookings, breakdowns, repairs, hmLogs, mechanics, appUsers, appSettings, inspections, dispatchLogs, manpower, manpowerTasks };
};

// Database state
let db = getInitialData();

// Load DB from file if exists
const loadDatabase = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      db = JSON.parse(data);
      if (!db.hmLogs) {
        db.hmLogs = [];
      }
      if (!db.dispatchLogs) {
        db.dispatchLogs = [];
      }
      if (!db.bookings) {
        db.bookings = [];
      }
      
      // Auto-migrate bookings to have new properties
      db.bookings.forEach((b: any) => {
        if (b.kmAtBooking === undefined) b.kmAtBooking = b.targetHm * 5 || 12000;
        if (b.hmAtBooking === undefined) b.hmAtBooking = b.targetHm || 3000;
        if (b.damageType === undefined) {
          b.damageType = b.serviceType === "Repair" ? "Engine System" : "Periodic Maintenance";
        }
        if (b.complaint === undefined) {
          b.complaint = b.notes || "Pemeriksaan rutin kendaraan.";
        }
        if (b.progressStatus === undefined) {
          b.progressStatus = b.status === "Completed" ? "Completed" : (b.status === "In Progress" ? "On Repair" : "Admin Processing");
        }
        if (!b.progressLogs) {
          b.progressLogs = [
            {
              id: "L-INIT-" + b.id,
              timestamp: b.bookingDate + " 08:00",
              status: "Admin Processing",
              notes: "Work order dibuat dan masuk antrian penjadwalan.",
              updatedBy: "System Admin"
            }
          ];
          if (b.status === "In Progress" || b.status === "Completed") {
            b.progressLogs.push({
              id: "L-PROG-" + b.id,
              timestamp: b.bookingDate + " 10:00",
              status: "On Repair",
              notes: "Unit dimasukkan ke bay workshop. Sedang ditangani oleh mekanik " + (b.mechanicName || "Mekanik"),
              updatedBy: "Supervisor"
            });
          }
          if (b.status === "Completed") {
            b.progressLogs.push({
              id: "L-DONE-" + b.id,
              timestamp: b.bookingDate + " 16:30",
              status: "Completed",
              notes: "Pekerjaan servis telah selesai dikerjakan dan dinyatakan rilis.",
              updatedBy: b.mechanicName || "Mekanik"
            });
          }
        }
      });
      if (!db.mechanics) {
        db.mechanics = getInitialData().mechanics;
      }
      if (!db.inspections) {
        db.inspections = getInitialData().inspections;
      }
      if (!db.appUsers) {
        db.appUsers = getInitialData().appUsers;
      }
      if (!db.appSettings) {
        db.appSettings = getInitialData().appSettings;
      }
      if (!db.manpower || db.manpower.length === 0) {
        db.manpower = getInitialData().manpower;
      }
      if (!db.manpowerTasks || db.manpowerTasks.length === 0) {
        db.manpowerTasks = getInitialData().manpowerTasks;
      }
      console.log("Database loaded successfully from:", DB_FILE);
    } else {
      saveDatabase();
      console.log("Created initial database file:", DB_FILE);
    }
  } catch (err) {
    console.error("Error loading database, reverting to seed:", err);
    db = getInitialData();
  }
};

// Save DB to file
const saveDatabase = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save database:", err);
  }
};

loadDatabase();

// Express setup
const app = express();
app.use(express.json());

// API Endpoints

// 1. Get stats
app.get("/api/stats", (req, res) => {
  const totalUnits = db.uioUnits.length;
  const activeUnits = db.uioUnits.filter(u => u.status === "Operating").length;
  const breakdownUnits = db.uioUnits.filter(u => u.status === "Breakdown").length;
  const underMaintenanceUnits = db.uioUnits.filter(u => u.status === "Under Maintenance").length;
  const standbyUnits = db.uioUnits.filter(u => u.status === "Standby").length;

  const currentMonth = new Date().toISOString().substring(0, 7); // e.g. "2026-07"
  const bookingsThisMonth = db.bookings.filter(b => b.bookingDate && b.bookingDate.startsWith(currentMonth));
  const unitsEnteredThisMonth = bookingsThisMonth.length;

  // Calculate repair hours for bookings in the current month
  const totalRepairHours = bookingsThisMonth.reduce((sum, b) => {
    if (b.serviceType === "Periodic Service") return sum + 4;
    if (b.serviceType === "Oil Change") return sum + 2;
    if (b.serviceType === "Repair") return sum + 8;
    if (b.serviceType === "General Inspection") return sum + 3;
    return sum + 4;
  }, 0);

  const totalAvailableHours = db.mechanics ? db.mechanics.reduce((sum: number, m: any) => sum + (m.availableHours || 173), 0) : (4 * 173);

  let overdueServiceCount = 0;
  let overdueOilCount = 0;

  db.uioUnits.forEach(u => {
    const elapsedService = u.currentHm - u.lastServiceHm;
    const elapsedOil = u.currentHm - u.lastOilChangeHm;
    if (elapsedService >= u.serviceInterval) overdueServiceCount++;
    if (elapsedOil >= u.oilChangeInterval) overdueOilCount++;
  });

  const lowStockCount = db.spareParts.filter(p => p.stock <= p.minStock).length;
  const activeBookings = db.bookings.filter(b => b.status === "Pending" || b.status === "In Progress").length;

  const stats: DashboardStats = {
    totalUnits,
    activeUnits,
    breakdownUnits,
    underMaintenanceUnits,
    standbyUnits,
    unitsEnteredThisMonth,
    totalRepairHours,
    totalAvailableHours,
    overdueServiceCount,
    overdueOilCount,
    lowStockCount,
    activeBookings
  };

  res.json(stats);
});

// 2. UIO Units CRUD
app.get("/api/uio", (req, res) => {
  res.json(db.uioUnits);
});

app.post("/api/uio", (req, res) => {
  const { code, name, category, serialNumber, engineNumber, manufactureYear, location, status, currentHm, currentKm, lastServiceHm, lastOilChangeHm, serviceInterval, oilChangeInterval, notes, photoUrl } = req.body;
  
  if (!code || !name || !category) {
    return res.status(400).json({ error: "Code, name, and category are required" });
  }

  const newUnit: UioUnit = {
    id: generateId("U"),
    code,
    name,
    category,
    serialNumber: serialNumber || "",
    engineNumber: engineNumber || "",
    manufactureYear: Number(manufactureYear) || new Date().getFullYear(),
    location: location || "Workshop Maro",
    status: status || "Operating",
    currentHm: Number(currentHm) || 0,
    currentKm: Number(currentKm) || 0,
    lastServiceHm: Number(lastServiceHm) || Number(currentHm) || 0,
    lastOilChangeHm: Number(lastOilChangeHm) || Number(currentHm) || 0,
    serviceInterval: Number(serviceInterval) || 250,
    oilChangeInterval: Number(oilChangeInterval) || 250,
    notes: notes || "",
    photoUrl: photoUrl || ""
  };

  db.uioUnits.push(newUnit);

  // Initialize baseline log in hmLogs
  if (!db.hmLogs) db.hmLogs = [];
  db.hmLogs.push({
    id: generateId("HML"),
    unitId: newUnit.id,
    unitCode: newUnit.code,
    previousHm: 0,
    newHm: newUnit.currentHm,
    previousKm: 0,
    newKm: newUnit.currentKm || 0,
    updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    notes: `Registrasi unit baru armada UIO (HM: ${newUnit.currentHm}, KM: ${newUnit.currentKm || 0})`
  });

  saveDatabase();
  res.status(201).json(newUnit);
});

app.put("/api/uio/:id", (req, res) => {
  const { id } = req.params;
  const index = db.uioUnits.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ error: "Unit not found" });

  const prevUnit = db.uioUnits[index];
  const prevHm = prevUnit.currentHm;
  const prevKm = prevUnit.currentKm || 0;

  const updated = { ...prevUnit, ...req.body };
  // Ensure numeric fields are numbers
  if (req.body.currentHm !== undefined) updated.currentHm = Number(req.body.currentHm);
  if (req.body.currentKm !== undefined) updated.currentKm = Number(req.body.currentKm);
  if (req.body.lastServiceHm !== undefined) updated.lastServiceHm = Number(req.body.lastServiceHm);
  if (req.body.lastOilChangeHm !== undefined) updated.lastOilChangeHm = Number(req.body.lastOilChangeHm);
  if (req.body.serviceInterval !== undefined) updated.serviceInterval = Number(req.body.serviceInterval);
  if (req.body.oilChangeInterval !== undefined) updated.oilChangeInterval = Number(req.body.oilChangeInterval);
  if (req.body.manufactureYear !== undefined) updated.manufactureYear = Number(req.body.manufactureYear);

  db.uioUnits[index] = updated;

  // If HM or KM changed during edit, record in hmLogs
  if (updated.currentHm !== prevHm || (updated.currentKm || 0) !== prevKm) {
    if (!db.hmLogs) db.hmLogs = [];
    db.hmLogs.push({
      id: generateId("HML"),
      unitId: updated.id,
      unitCode: updated.code,
      previousHm: prevHm,
      newHm: updated.currentHm,
      previousKm: prevKm,
      newKm: updated.currentKm || 0,
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      notes: req.body.notes || `Update data spesifikasi unit (HM: ${prevHm} -> ${updated.currentHm}, KM: ${prevKm} -> ${updated.currentKm || 0})`
    });
  }

  saveDatabase();
  res.json(updated);
});

app.delete("/api/uio/:id", (req, res) => {
  const { id } = req.params;
  const initialLen = db.uioUnits.length;
  db.uioUnits = db.uioUnits.filter(u => u.id !== id);
  if (db.uioUnits.length === initialLen) return res.status(404).json({ error: "Unit not found" });
  saveDatabase();
  res.json({ success: true });
});

// Update HM/KM specifically, integrated with service schedules
app.post("/api/uio/:id/update-hm", (req, res) => {
  const { id } = req.params;
  const { currentHm, currentKm, notes } = req.body;
  
  if (currentHm === undefined) return res.status(400).json({ error: "currentHm is required" });

  const index = db.uioUnits.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ error: "Unit not found" });

  const unit = db.uioUnits[index];
  const previousHm = unit.currentHm;
  const previousKm = unit.currentKm || 0;
  const nextHm = Number(currentHm);
  const nextKm = currentKm !== undefined ? Number(currentKm) : previousKm;

  if (nextHm < previousHm) {
    return res.status(400).json({ error: `HM baru (${nextHm}) tidak boleh lebih kecil dari sebelumnya (${previousHm})` });
  }

  unit.currentHm = nextHm;
  unit.currentKm = nextKm;
  if (notes) {
    unit.notes = notes;
  }

  // Create update log
  const newLog = {
    id: generateId("HML"),
    unitId: unit.id,
    unitCode: unit.code,
    previousHm,
    newHm: nextHm,
    previousKm,
    newKm: nextKm,
    updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    notes: notes || `Update HM/KM rutin (HM: ${previousHm} -> ${nextHm}, KM: ${previousKm} -> ${nextKm})`
  };
  
  if (!db.hmLogs) db.hmLogs = [];
  db.hmLogs.push(newLog);

  saveDatabase();
  res.json(unit);
});

// GET HM Logs
app.get("/api/hm-logs", (req, res) => {
  res.json(db.hmLogs || []);
});

// 3. Warehouse (Spare Parts Inventory) API
app.get("/api/warehouse", (req, res) => {
  res.json(db.spareParts);
});

app.post("/api/warehouse", (req, res) => {
  const { code, name, category, stock, minStock, unit, price } = req.body;

  if (!code || !name || !category || stock === undefined || price === undefined) {
    return res.status(400).json({ error: "Code, name, category, stock, and price are required" });
  }

  const newPart: SparePart = {
    id: generateId("P"),
    code,
    name,
    category,
    stock: Number(stock),
    minStock: Number(minStock) || 0,
    unit: unit || "Pcs",
    price: Number(price)
  };

  db.spareParts.push(newPart);
  saveDatabase();
  res.status(201).json(newPart);
});

app.put("/api/warehouse/:id", (req, res) => {
  const { id } = req.params;
  const index = db.spareParts.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: "Part not found" });

  const updated = { ...db.spareParts[index], ...req.body };
  if (req.body.stock !== undefined) updated.stock = Number(req.body.stock);
  if (req.body.minStock !== undefined) updated.minStock = Number(req.body.minStock);
  if (req.body.price !== undefined) updated.price = Number(req.body.price);

  db.spareParts[index] = updated;
  saveDatabase();
  res.json(updated);
});

// 4. Workshop Bookings (Pemesanan Bengkel) API
app.get("/api/bookings", (req, res) => {
  res.json(db.bookings);
});

app.post("/api/bookings", (req, res) => {
  const { 
    unitId, 
    bookingDate, 
    workshopName, 
    serviceType, 
    mechanicName, 
    mechanicsAssigned,
    flatRateHours,
    flatRateCost,
    notes, 
    partsUsed,
    kmAtBooking,
    hmAtBooking,
    damageType,
    complaint
  } = req.body;

  if (!unitId || !bookingDate || !workshopName || !serviceType) {
    return res.status(400).json({ error: "UnitId, bookingDate, workshopName, and serviceType are required" });
  }

  const unit = db.uioUnits.find(u => u.id === unitId);
  if (!unit) return res.status(404).json({ error: "Unit not found" });

  // Calculate total cost from warehouse prices + flat rate labor cost
  let computedTotalCost = Number(flatRateCost) || 0;
  const bookingParts = (partsUsed || []).map((p: any) => {
    const part = db.spareParts.find(sp => sp.id === p.partId);
    const priceAtSale = part ? part.price : 0;
    computedTotalCost += priceAtSale * Number(p.quantity);
    return {
      partId: p.partId,
      quantity: Number(p.quantity),
      priceAtSale
    };
  });

  const bId = generateId("WO");

  const mechanicsList = Array.isArray(mechanicsAssigned) && mechanicsAssigned.length > 0 
    ? mechanicsAssigned 
    : (mechanicName ? [mechanicName] : ["Unassigned"]);

  const newBooking: WorkshopBooking = {
    id: bId,
    unitId,
    unitCode: unit.code,
    bookingDate,
    workshopName,
    serviceType,
    targetHm: unit.currentHm,
    mechanicName: mechanicsList.join(", "),
    mechanicsAssigned: mechanicsList,
    flatRateHours: Number(flatRateHours) || 4,
    flatRateCost: Number(flatRateCost) || 0,
    notes: notes || "",
    status: "Pending",
    partsUsed: bookingParts,
    actualCompletionHm: null,
    totalCost: computedTotalCost,
    kmAtBooking: Number(kmAtBooking) || (unit.currentHm * 5),
    hmAtBooking: Number(hmAtBooking) || unit.currentHm,
    damageType: damageType || (serviceType === "Repair" ? "Engine System" : "Periodic Maintenance"),
    complaint: complaint || notes || "Pemeriksaan rutin kendaraan.",
    progressStatus: "Admin Processing",
    progressLogs: [
      {
        id: generateId("L"),
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        status: "Admin Processing",
        notes: "Work order dibuat secara digital dan masuk antrean sistem.",
        updatedBy: "System Admin"
      }
    ]
  };

  db.bookings.push(newBooking);
  saveDatabase();
  res.status(201).json(newBooking);
});

// Update Booking Status and trigger real-time warehouse integrations when completed
app.put("/api/bookings/:id", (req, res) => {
  const { id } = req.params;
  const { 
    status, 
    mechanicName, 
    mechanicsAssigned,
    flatRateHours,
    flatRateCost,
    workshopName, 
    bookingDate, 
    notes, 
    partsUsed, 
    actualCompletionHm,
    kmAtBooking,
    hmAtBooking,
    damageType,
    complaint,
    progressStatus,
    newProgressLog
  } = req.body;

  const bookingIdx = db.bookings.findIndex(b => b.id === id);
  if (bookingIdx === -1) return res.status(404).json({ error: "Booking not found" });

  const booking = db.bookings[bookingIdx];
  const originalStatus = booking.status;

  // Update properties if provided
  if (mechanicsAssigned !== undefined) {
    booking.mechanicsAssigned = mechanicsAssigned;
    booking.mechanicName = mechanicsAssigned.join(", ");
  } else if (mechanicName !== undefined) {
    booking.mechanicName = mechanicName;
  }

  if (flatRateHours !== undefined) booking.flatRateHours = Number(flatRateHours);
  if (flatRateCost !== undefined) booking.flatRateCost = Number(flatRateCost);

  if (workshopName !== undefined) booking.workshopName = workshopName;
  if (bookingDate !== undefined) booking.bookingDate = bookingDate;
  if (notes !== undefined) booking.notes = notes;
  
  if (kmAtBooking !== undefined) booking.kmAtBooking = Number(kmAtBooking);
  if (hmAtBooking !== undefined) booking.hmAtBooking = Number(hmAtBooking);
  if (damageType !== undefined) booking.damageType = damageType;
  if (complaint !== undefined) booking.complaint = complaint;

  if (progressStatus !== undefined) {
    booking.progressStatus = progressStatus;
    // Map detailed progress to standard status
    if (progressStatus === "Completed") {
      // triggers the completion flow below
    } else if (["On Repair", "Waiting for Parts", "Quality Control", "Ready for Pickup"].includes(progressStatus)) {
      booking.status = "In Progress";
    } else if (progressStatus === "Admin Processing") {
      booking.status = "Pending";
    }
  }

  // Process a new progress log if provided
  if (newProgressLog) {
    if (!booking.progressLogs) booking.progressLogs = [];
    booking.progressLogs.push({
      id: generateId("L"),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: progressStatus || booking.progressStatus || booking.status,
      notes: newProgressLog.notes,
      updatedBy: newProgressLog.updatedBy || "Workshop Team"
    });
  }

  // Support updating parts list on Pending / In Progress bookings
  if (partsUsed !== undefined && booking.status !== "Completed") {
    let computedTotalCost = 0;
    booking.partsUsed = partsUsed.map((p: any) => {
      const part = db.spareParts.find(sp => sp.id === p.partId);
      const priceAtSale = part ? part.price : 0;
      computedTotalCost += priceAtSale * Number(p.quantity);
      return {
        partId: p.partId,
        quantity: Number(p.quantity),
        priceAtSale
      };
    });
    booking.totalCost = computedTotalCost;
  }

  // If the booking is transitioning to "Completed" and was NOT previously "Completed" (either via status or progressStatus)
  const isFinalizing = (status === "Completed" || progressStatus === "Completed") && originalStatus !== "Completed";
  
  if (isFinalizing) {
    const unitIdx = db.uioUnits.findIndex(u => u.id === booking.unitId);
    if (unitIdx === -1) {
      return res.status(404).json({ error: "Unit associated with booking not found" });
    }
    const unit = db.uioUnits[unitIdx];
    const previousHm = unit.currentHm;

    // Read the actualCompletionHm or fallback to the current unit HM
    const completionHm = Number(actualCompletionHm) || unit.currentHm;
    if (completionHm < unit.currentHm) {
      return res.status(400).json({ error: `HM Penyelesaian (${completionHm}) tidak boleh kurang dari HM Unit saat ini (${unit.currentHm})` });
    }

    // 1. Check stock availability for parts and subtract them in real-time (WAREHOUSE INTEGRATION)
    // First, verify stock
    const partsToUse = partsUsed || booking.partsUsed;
    for (const pu of partsToUse) {
      const partIdx = db.spareParts.findIndex(sp => sp.id === pu.partId);
      if (partIdx !== -1) {
        const part = db.spareParts[partIdx];
        if (part.stock < pu.quantity) {
          return res.status(400).json({ 
            error: `Stok Suku Cadang tidak mencukupi untuk: ${part.name}. Sisa stok: ${part.stock} ${part.unit}, diminta: ${pu.quantity} ${part.unit}` 
          });
        }
      }
    }

    // Process subtracting stocks from warehouse
    const detailedPartsUsedForHistory: any[] = [];
    let finalizedTotalCost = 0;

    for (const pu of partsToUse) {
      const partIdx = db.spareParts.findIndex(sp => sp.id === pu.partId);
      if (partIdx !== -1) {
        const part = db.spareParts[partIdx];
        part.stock -= Number(pu.quantity); // Real-time subtraction

        finalizedTotalCost += part.price * Number(pu.quantity);
        detailedPartsUsedForHistory.push({
          partId: part.id,
          partName: part.name,
          partCode: part.code,
          quantity: Number(pu.quantity),
          price: part.price
        });
      }
    }

    // Update partsUsed inside the booking
    booking.partsUsed = partsToUse.map((pu: any) => {
      const part = db.spareParts.find(sp => sp.id === pu.partId);
      return {
        partId: pu.partId,
        quantity: Number(pu.quantity),
        priceAtSale: part ? part.price : pu.priceAtSale
      };
    });

    // 2. Update booking completion stats
    booking.status = "Completed";
    booking.progressStatus = "Completed";
    booking.actualCompletionHm = completionHm;
    booking.totalCost = finalizedTotalCost;

    if (!booking.progressLogs) booking.progressLogs = [];
    booking.progressLogs.push({
      id: generateId("L"),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "Completed",
      notes: `Pekerjaan servis telah selesai dikerjakan secara paripurna. Unit dinyatakan rilis operasional. HM Akhir: ${completionHm} HM. Suku cadang terpakai telah dikurangi dari stok gudang secara real-time.`,
      updatedBy: booking.mechanicName || "System"
    });

    // 3. Update the associated UIO Unit's HM/KM and Service Logs
    const prevKm = unit.currentKm || 0;
    const nextKm = booking.kmAtBooking || prevKm;
    unit.currentHm = completionHm;
    unit.currentKm = nextKm;

    if (booking.serviceType === "Periodic Service") {
      unit.lastServiceHm = completionHm;
      unit.lastOilChangeHm = completionHm; // Periodic service includes oil change by standard
    } else if (booking.serviceType === "Oil Change") {
      unit.lastOilChangeHm = completionHm;
    }

    // Add automatically generated HM Update Log
    const newHmLog = {
      id: generateId("HML"),
      unitId: unit.id,
      unitCode: unit.code,
      previousHm,
      newHm: completionHm,
      previousKm: prevKm,
      newKm: nextKm,
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      notes: `Update otomatis via penyelesaian WO #${booking.id} (${booking.serviceType})`
    };
    if (!db.hmLogs) db.hmLogs = [];
    db.hmLogs.push(newHmLog);

    // Reset unit status if it was breakdown or under maintenance
    if (unit.status === "Breakdown" || unit.status === "Under Maintenance") {
      unit.status = "Operating";
    }

    // 4. Automatically generate a detailed Repair History entry
    const newHistory: RepairHistory = {
      id: generateId("R"),
      unitId: unit.id,
      unitCode: unit.code,
      completionDate: new Date().toISOString().split("T")[0],
      serviceType: booking.serviceType,
      hmAtService: completionHm,
      description: `Pekerjaan servis melalui booking #${booking.id}. Notes: ${booking.notes}`,
      mechanicName: booking.mechanicName,
      partsUsed: detailedPartsUsedForHistory,
      totalCost: finalizedTotalCost,
      bookingId: booking.id
    };

    db.repairs.push(newHistory);

    // 5. Automatically resolve any active Breakdown logs for this unit if appropriate
    const openBreakdown = db.breakdowns.find(b => b.unitId === unit.id && b.status !== "Resolved");
    if (openBreakdown) {
      openBreakdown.status = "Resolved";
      openBreakdown.resolvedDate = new Date().toISOString().split("T")[0] + " " + new Date().toTimeString().split(" ")[0].substring(0, 5);
      openBreakdown.actionTaken = `Diselesaikan melalui booking servis #${booking.id} (${booking.serviceType}) oleh mekanik ${booking.mechanicName}.`;
    }

  } else if (status !== undefined) {
    // Other transitions: Pending -> In Progress or Pending -> Cancelled
    booking.status = status;
    
    // If status becomes In Progress, make sure UIO unit status is in Under Maintenance
    if (status === "In Progress") {
      const unit = db.uioUnits.find(u => u.id === booking.unitId);
      if (unit && unit.status === "Operating") {
        unit.status = "Under Maintenance";
      }
      
      if (booking.progressStatus === "Admin Processing") {
        booking.progressStatus = "On Repair";
      }
      
      if (!booking.progressLogs) booking.progressLogs = [];
      booking.progressLogs.push({
        id: generateId("L"),
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        status: booking.progressStatus || "On Repair",
        notes: "Unit dimasukkan ke bay workshop. Mulai pengerjaan inspeksi dan perbaikan.",
        updatedBy: booking.mechanicName || "Supervisor"
      });
      
    } else if (status === "Cancelled" && originalStatus === "In Progress") {
      // Revert unit status back if cancelled
      const unit = db.uioUnits.find(u => u.id === booking.unitId);
      if (unit && unit.status === "Under Maintenance") {
        unit.status = "Operating";
      }
      
      if (!booking.progressLogs) booking.progressLogs = [];
      booking.progressLogs.push({
        id: generateId("L"),
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        status: "Cancelled",
        notes: "Work order dibatalkan/dilepas dari antrean workshop.",
        updatedBy: "Supervisor"
      });
    }
  }

  saveDatabase();
  res.json(booking);
});

// Delete Booking
app.delete("/api/bookings/:id", (req, res) => {
  const { id } = req.params;
  const initialLen = db.bookings.length;
  db.bookings = db.bookings.filter(b => b.id !== id);
  if (db.bookings.length === initialLen) return res.status(404).json({ error: "Booking not found" });
  saveDatabase();
  res.json({ success: true });
});

// 5. Breakdown Logs (Pencatatan Histori Kerusakan) API
app.get("/api/breakdowns", (req, res) => {
  res.json(db.breakdowns);
});

app.post("/api/breakdowns", (req, res) => {
  const { unitId, damageDescription, severity, reportedBy, actionTaken } = req.body;

  if (!unitId || !damageDescription || !severity || !reportedBy) {
    return res.status(400).json({ error: "UnitId, damageDescription, severity, and reportedBy are required" });
  }

  const unitIdx = db.uioUnits.findIndex(u => u.id === unitId);
  if (unitIdx === -1) return res.status(404).json({ error: "Unit not found" });

  const unit = db.uioUnits[unitIdx];

  const newBreakdown: BreakdownLog = {
    id: generateId("L"),
    unitId,
    unitCode: unit.code,
    reportedDate: new Date().toISOString().replace("T", " ").substring(0, 16),
    damageDescription,
    severity,
    reportedBy,
    status: "Open",
    resolvedDate: null,
    actionTaken: actionTaken || null
  };

  // Flag the unit status as "Breakdown" when reported
  unit.status = "Breakdown";

  db.breakdowns.push(newBreakdown);
  saveDatabase();
  res.status(201).json(newBreakdown);
});

// Update Breakdown (Resolving the breakdown)
app.put("/api/breakdowns/:id", (req, res) => {
  const { id } = req.params;
  const { status, actionTaken, resolvedDate } = req.body;

  const bIndex = db.breakdowns.findIndex(b => b.id === id);
  if (bIndex === -1) return res.status(404).json({ error: "Breakdown log not found" });

  const breakdown = db.breakdowns[bIndex];
  const oldStatus = breakdown.status;

  if (status !== undefined) breakdown.status = status;
  if (actionTaken !== undefined) breakdown.actionTaken = actionTaken;

  if (status === "Resolved" && oldStatus !== "Resolved") {
    breakdown.resolvedDate = resolvedDate || new Date().toISOString().replace("T", " ").substring(0, 16);
    
    // Check if the unit is still marked as Breakdown and transition back to Operating/Standby
    const unitIdx = db.uioUnits.findIndex(u => u.id === breakdown.unitId);
    if (unitIdx !== -1) {
      const unit = db.uioUnits[unitIdx];
      if (unit.status === "Breakdown") {
        unit.status = "Operating";
      }
    }
  }

  db.breakdowns[bIndex] = breakdown;
  saveDatabase();
  res.json(breakdown);
});

// 6. Repair History API
app.get("/api/repairs", (req, res) => {
  res.json(db.repairs);
});

// Seed custom manual repair history if needed
app.post("/api/repairs", (req, res) => {
  const { unitId, completionDate, serviceType, hmAtService, description, mechanicName, partsUsed, totalCost } = req.body;

  if (!unitId || !completionDate || !serviceType || hmAtService === undefined || !description) {
    return res.status(400).json({ error: "UnitId, completionDate, serviceType, hmAtService, and description are required" });
  }

  const unit = db.uioUnits.find(u => u.id === unitId);
  if (!unit) return res.status(404).json({ error: "Unit not found" });

  const parts = (partsUsed || []).map((p: any) => {
    const sp = db.spareParts.find(item => item.id === p.partId);
    return {
      partId: p.partId,
      partName: sp ? sp.name : p.partName || "Unknown Part",
      partCode: sp ? sp.code : p.partCode || "Unknown Code",
      quantity: Number(p.quantity) || 1,
      price: Number(p.price) || (sp ? sp.price : 0)
    };
  });

  const computedCost = totalCost !== undefined ? Number(totalCost) : parts.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  const newHistory: RepairHistory = {
    id: generateId("R"),
    unitId,
    unitCode: unit.code,
    completionDate,
    serviceType,
    hmAtService: Number(hmAtService),
    description,
    mechanicName: mechanicName || "Unassigned",
    partsUsed: parts,
    totalCost: computedCost,
    bookingId: null
  };

  db.repairs.push(newHistory);
  saveDatabase();
  res.status(201).json(newHistory);
});

// 7. Mechanics API
app.get("/api/mechanics", (req, res) => {
  res.json(db.mechanics || []);
});

app.post("/api/mechanics", (req, res) => {
  const { name, role, availableHours, schedule } = req.body;
  if (!name || !role) {
    return res.status(400).json({ error: "Name and role are required" });
  }
  const newMechanic = {
    id: generateId("M"),
    name,
    role,
    availableHours: Number(availableHours) || 173,
    schedule: schedule || {}
  };
  if (!db.mechanics) db.mechanics = [];
  db.mechanics.push(newMechanic);
  saveDatabase();
  res.status(201).json(newMechanic);
});

app.put("/api/mechanics/:id", (req, res) => {
  const { id } = req.params;
  if (!db.mechanics) db.mechanics = [];
  const idx = db.mechanics.findIndex(m => m.id === id);
  if (idx === -1) return res.status(404).json({ error: "Mechanic not found" });

  const updated = { ...db.mechanics[idx], ...req.body };
  if (req.body.availableHours !== undefined) updated.availableHours = Number(req.body.availableHours);
  db.mechanics[idx] = updated;
  saveDatabase();
  res.json(updated);
});

app.delete("/api/mechanics/:id", (req, res) => {
  const { id } = req.params;
  if (!db.mechanics) db.mechanics = [];
  const initialLen = db.mechanics.length;
  db.mechanics = db.mechanics.filter(m => m.id !== id);
  if (db.mechanics.length === initialLen) return res.status(404).json({ error: "Mechanic not found" });
  saveDatabase();
  res.json({ success: true });
});

// 8. Users API
app.get("/api/users", (req, res) => {
  res.json(db.appUsers || []);
});

app.post("/api/users", (req, res) => {
  const { username, name, role, status } = req.body;
  if (!username || !name || !role) {
    return res.status(400).json({ error: "Username, name, and role are required" });
  }
  const newUser = {
    id: generateId("U"),
    username,
    name,
    role,
    status: status || "Active"
  };
  if (!db.appUsers) db.appUsers = [];
  db.appUsers.push(newUser);
  saveDatabase();
  res.status(201).json(newUser);
});

app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  if (!db.appUsers) db.appUsers = [];
  const idx = db.appUsers.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });

  const updated = { ...db.appUsers[idx], ...req.body };
  db.appUsers[idx] = updated;
  saveDatabase();
  res.json(updated);
});

app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  if (!db.appUsers) db.appUsers = [];
  const initialLen = db.appUsers.length;
  db.appUsers = db.appUsers.filter(u => u.id !== id);
  if (db.appUsers.length === initialLen) return res.status(404).json({ error: "User not found" });
  saveDatabase();
  res.json({ success: true });
});

// 9. Settings API
app.get("/api/settings", (req, res) => {
  res.json(db.appSettings || { totalBays: 1 });
});

app.put("/api/settings", (req, res) => {
  const { totalBays } = req.body;
  if (!db.appSettings) db.appSettings = { totalBays: 1 };
  if (totalBays !== undefined) {
    db.appSettings.totalBays = Number(totalBays) || 1;
  }
  saveDatabase();
  res.json(db.appSettings);
});

// 10. Inspections & Backlog Planner API
app.get("/api/inspections", (req, res) => {
  res.json(db.inspections || []);
});

app.post("/api/inspections", (req, res) => {
  const { unitId, inspectorName, inspectionDate, systemCategory, findings, recommendation, urgency, photos } = req.body;
  if (!unitId || !findings || !inspectorName) {
    return res.status(400).json({ error: "UnitId, findings, and inspectorName are required" });
  }
  const unit = db.uioUnits.find(u => u.id === unitId);
  if (!unit) return res.status(404).json({ error: "Unit not found" });

  const newInspection: MechanicInspection = {
    id: generateId("INS"),
    unitId: unit.id,
    unitCode: unit.code,
    unitName: unit.name,
    inspectorName,
    inspectionDate: inspectionDate || new Date().toISOString().split("T")[0],
    systemCategory: systemCategory || "Other",
    findings,
    recommendation: recommendation || "-",
    urgency: urgency || "Routine",
    status: "Pending Planner",
    createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    photos: photos || [],
    comments: []
  };

  if (!db.inspections) db.inspections = [];
  db.inspections.push(newInspection);
  saveDatabase();
  res.status(201).json(newInspection);
});

// Post Comment or Photo on Backlog Inspection
app.post("/api/inspections/:id/comments", (req, res) => {
  const { id } = req.params;
  const { senderName, senderRole, commentText, photoUrl } = req.body;

  if (!db.inspections) db.inspections = [];
  const idx = db.inspections.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ error: "Inspection not found" });

  const inspection = db.inspections[idx];
  if (!inspection.comments) inspection.comments = [];

  const newComment = {
    id: generateId("CMT"),
    senderName: senderName || "Pengguna",
    senderRole: senderRole || "Mekanik",
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
    commentText: commentText || "",
    photoUrl: photoUrl || undefined
  };

  inspection.comments.push(newComment);
  if (photoUrl) {
    if (!inspection.photos) inspection.photos = [];
    inspection.photos.push(photoUrl);
  }

  saveDatabase();
  res.json(inspection);
});

// Process Backlog Action (approve | reject | need_info)
app.post("/api/inspections/:id/action", (req, res) => {
  const { id } = req.params;
  const { action, plannerNotes, bookingData } = req.body; // action: 'approve' | 'reject' | 'need_info'
  if (!db.inspections) db.inspections = [];
  const idx = db.inspections.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ error: "Inspection not found" });

  const inspection = db.inspections[idx];

  if (action === "need_info") {
    inspection.status = "Need Info";
    inspection.plannerNotes = plannerNotes || "Planner meminta detail informasi / foto tambahan.";
    if (!inspection.comments) inspection.comments = [];
    inspection.comments.push({
      id: generateId("CMT"),
      senderName: "Planner / Supervisor",
      senderRole: "Planner",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      commentText: `[Status: MINTA DETAIL INFORMASI] ${plannerNotes || 'Mohon lengkapi penjelasan temuan & foto komponen.'}`
    });
    saveDatabase();
    return res.json(inspection);
  } else if (action === "reject") {
    inspection.status = "Rejected";
    inspection.plannerNotes = plannerNotes || "Ditolak oleh Planner.";
    if (!inspection.comments) inspection.comments = [];
    inspection.comments.push({
      id: generateId("CMT"),
      senderName: "Planner / Supervisor",
      senderRole: "Planner",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      commentText: `[Status: DITOLAK] ${plannerNotes || 'Hasil temuan ditolak.'}`
    });
    saveDatabase();
    return res.json(inspection);
  } else if (action === "approve") {
    inspection.status = "Scheduled";
    inspection.plannerNotes = plannerNotes || "Dijadwalkan untuk Work Order.";
    if (!inspection.comments) inspection.comments = [];
    inspection.comments.push({
      id: generateId("CMT"),
      senderName: "Planner / Supervisor",
      senderRole: "Planner",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      commentText: `[Status: DISETUJUI & DIJADWALKAN WO] ${plannerNotes || 'SPK / Work Order telah diterbitkan.'}`
    });

    if (bookingData) {
      const unit = db.uioUnits.find(u => u.id === inspection.unitId);
      if (unit) {
        const bId = generateId("WO");
        const mechanicsList = Array.isArray(bookingData.mechanicsAssigned) && bookingData.mechanicsAssigned.length > 0 
          ? bookingData.mechanicsAssigned 
          : [bookingData.mechanicName || inspection.inspectorName];

        const newBooking: WorkshopBooking = {
          id: bId,
          unitId: unit.id,
          unitCode: unit.code,
          bookingDate: bookingData.bookingDate || new Date().toISOString().split("T")[0],
          workshopName: bookingData.workshopName || "Workshop Utama Maro",
          serviceType: bookingData.serviceType || "Repair",
          targetHm: unit.currentHm,
          mechanicName: mechanicsList.join(", "),
          mechanicsAssigned: mechanicsList,
          notes: `[Dari Backlog ${inspection.id}] ${bookingData.notes || inspection.recommendation}`,
          status: "Pending",
          partsUsed: bookingData.partsUsed || [],
          actualCompletionHm: null,
          totalCost: Number(bookingData.flatRateCost) || 0,
          flatRateHours: Number(bookingData.flatRateHours) || 2,
          flatRateCost: Number(bookingData.flatRateCost) || 0,
          kmAtBooking: unit.currentKm || (unit.currentHm * 5),
          hmAtBooking: unit.currentHm,
          damageType: inspection.systemCategory,
          complaint: inspection.findings,
          progressStatus: "Admin Processing",
          progressLogs: [
            {
              id: generateId("L"),
              timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
              status: "Admin Processing",
              notes: `Work order dibuat dari Rekomendasi Inspeksi Mekanik (${inspection.inspectorName}).`,
              updatedBy: "Planner"
            }
          ]
        };
        db.bookings.push(newBooking);
        inspection.workOrderId = bId;
      }
    }
    saveDatabase();
    return res.json(inspection);
  }

  res.status(400).json({ error: "Invalid action" });
});

// 11. Flexible Chart Trends Data API (Mingguan, 6 Bulan, 12 Bulan / Tahunan)
app.get("/api/trends/6-months", (req, res) => {
  return generateTrendsResponse("6-months", res);
});

app.get("/api/trends", (req, res) => {
  const period = (req.query.period as string) || "6-months"; // 'weekly' | '6-months' | '12-months'
  return generateTrendsResponse(period, res);
});

function generateTrendsResponse(period: string, res: any) {
  let timeSlots = [];
  const now = new Date();

  if (period === "weekly") {
    // Last 8 weeks
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const label = `Minggu ${8 - i}`;
      const key = d.toISOString().substring(0, 10);
      timeSlots.push({ key, label, baseFactor: 0.25 });
    }
  } else if (period === "12-months" || period === "yearly") {
    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().substring(0, 7);
      const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
      timeSlots.push({ key, label, baseFactor: 1 });
    }
  } else {
    // 6-months default
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().substring(0, 7);
      const label = d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      timeSlots.push({ key, label, baseFactor: 1 });
    }
  }

  const trendData = timeSlots.map((slot, idx) => {
    const matchingRepairs = (db.repairs || []).filter(r => r.completionDate && r.completionDate.startsWith(slot.key));
    let calculatedCost = matchingRepairs.reduce((s, r) => s + (r.totalCost || 0), 0);
    let calculatedItems = matchingRepairs.reduce((s, r) => s + (r.partsUsed ? r.partsUsed.reduce((ps, p) => ps + p.quantity, 0) : 0), 0);

    const matchingBreakdowns = (db.breakdowns || []).filter(b => b.reportedDate && b.reportedDate.startsWith(slot.key));
    let downtimeCount = matchingBreakdowns.length;

    const matchingWO = (db.bookings || []).filter(b => b.bookingDate && b.bookingDate.startsWith(slot.key));
    let scheduledWO = matchingWO.length;

    // Synthetic base numbers for smooth charts when db is clean
    const baseCost = Math.round((12000000 + (idx * 1500000 % 8000000)) * slot.baseFactor);
    const baseItems = Math.round((35 + (idx * 5 % 20)) * slot.baseFactor);
    const baseDowntime = Math.max(1, Math.round((3 + (idx % 3)) * slot.baseFactor));
    const baseHours = Math.round((24 + (idx * 4 % 18)) * slot.baseFactor);
    const baseWO = Math.max(2, Math.round((8 + (idx % 5)) * slot.baseFactor));

    return {
      month: slot.label,
      monthKey: slot.key,
      sparePartCost: calculatedCost > 0 ? calculatedCost : baseCost,
      sparePartItems: calculatedItems > 0 ? calculatedItems : baseItems,
      downtimeCount: downtimeCount > 0 ? downtimeCount : baseDowntime,
      breakdownHours: baseHours,
      scheduledWO: scheduledWO > 0 ? scheduledWO : baseWO,
    };
  });

  return res.json(trendData);
}

// 12. Unit Dispatch Logs (Jam Keluar Unit & Jam Operasi) & Fleet Availability KPIs
app.get("/api/dispatch", (req, res) => {
  res.json(db.dispatchLogs || []);
});

app.post("/api/dispatch", (req, res) => {
  const { unitId, operatingHours, operatorName, notes } = req.body;
  if (!unitId || !operatingHours || !operatorName) {
    return res.status(400).json({ error: "UnitId, operatingHours, and operatorName are required" });
  }

  const unit = db.uioUnits.find(u => u.id === unitId);
  if (!unit) return res.status(404).json({ error: "Unit not found" });

  const dispatchItem = {
    id: generateId("DSP"),
    unitId: unit.id,
    unitCode: unit.code,
    dispatchTime: new Date().toISOString().replace("T", " ").substring(0, 16),
    operatingHours: Number(operatingHours),
    operatorName,
    notes: notes || "Jam keluar unit dari workshop / operasi site."
  };

  if (!db.dispatchLogs) db.dispatchLogs = [];
  db.dispatchLogs.push(dispatchItem);

  // Update unit status to Operating & increment HM
  const prevHm = unit.currentHm;
  const prevKm = unit.currentKm || 0;
  
  unit.status = "Operating";
  unit.currentHm += Number(operatingHours);
  const nextHm = unit.currentHm;

  if (!db.hmLogs) db.hmLogs = [];
  db.hmLogs.push({
    id: generateId("HML"),
    unitId: unit.id,
    unitCode: unit.code,
    previousHm: prevHm,
    newHm: nextHm,
    previousKm: prevKm,
    newKm: prevKm,
    updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    notes: `Pencatatan Jam Keluar / Akumulasi Jam Operasi (+${operatingHours} Jam) Operator: ${operatorName}. ${notes || ''}`
  });

  saveDatabase();
  res.status(201).json(dispatchItem);
});

// Calculate Fleet KPIs (MTTR, MTBF, MA, PA)
app.get("/api/fleet-kpis", (req, res) => {
  const totalBreakdowns = Math.max(1, (db.breakdowns || []).length);
  
  // Total downtime repair hours calculated from bookings / breakdowns
  let totalRepairHours = (db.bookings || []).reduce((sum, b) => {
    return sum + (b.totalWorkHoursCalculated || b.flatRateHours || 3);
  }, 0);
  if (totalRepairHours === 0) totalRepairHours = 18;

  // Total operating hours calculated from dispatch logs + HM
  let totalOpHours = (db.dispatchLogs || []).reduce((sum, d) => sum + (d.operatingHours || 0), 0);
  if (totalOpHours === 0) {
    totalOpHours = (db.uioUnits || []).reduce((sum, u) => sum + Math.min(u.currentHm, 500), 0);
  }
  if (totalOpHours === 0) totalOpHours = 450;

  // Calculations
  const mttr = Number((totalRepairHours / totalBreakdowns).toFixed(1)); // MTTR (Jam)
  const mtbf = Number((totalOpHours / totalBreakdowns).toFixed(1)); // MTBF (Jam)
  
  // Mechanical Availability % = Operating / (Operating + Repair) * 100
  const ma = Number(((totalOpHours / (totalOpHours + totalRepairHours)) * 100).toFixed(1));

  // Physical Availability % = (Calendar Hours - Downtime) / Calendar Hours * 100
  // Standard monthly 720 hours per unit
  const totalCalendarHours = (db.uioUnits?.length || 6) * 720;
  const pa = Number((((totalCalendarHours - totalRepairHours) / totalCalendarHours) * 100).toFixed(1));

  res.json({
    mttrHours: mttr,
    mtbfHours: mtbf,
    mechanicalAvailability: ma,
    physicalAvailability: pa,
    totalOperatingHours: totalOpHours,
    totalDowntimeHours: totalRepairHours
  });
});

// 12. Advanced Work Order Pause / Resume & Gudang Part Integration
app.post("/api/bookings/:id/pause", (req, res) => {
  const { id } = req.params;
  const { pauseReason, notes, updatedBy } = req.body;

  const booking = db.bookings.find(b => b.id === id);
  if (!booking) return res.status(404).json({ error: "Work Order not found" });

  booking.pauseState = "Paused";
  booking.currentPauseReason = pauseReason || "Waiting for Parts";

  if (!booking.pauseLogs) booking.pauseLogs = [];

  const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);
  booking.pauseLogs.push({
    id: generateId("PL"),
    startTime: nowStr,
    reason: pauseReason || "Waiting for Parts",
    notes: notes || `Dijeda (${pauseReason})`,
    isOffShift: pauseReason === "End of Shift"
  });

  if (!booking.progressLogs) booking.progressLogs = [];
  booking.progressLogs.push({
    id: generateId("L"),
    timestamp: nowStr,
    status: pauseReason === "Waiting for Parts" ? "Waiting for Parts" : "On Repair (Paused)",
    notes: `Pekerjaan DIJEDA [Alasan: ${pauseReason}]. ${notes ? `Catatan: ${notes}` : ''}`,
    updatedBy: updatedBy || "Foreman"
  });

  saveDatabase();
  res.json(booking);
});

app.post("/api/bookings/:id/resume", (req, res) => {
  const { id } = req.params;
  const { notes, updatedBy } = req.body;

  const booking = db.bookings.find(b => b.id === id);
  if (!booking) return res.status(404).json({ error: "Work Order not found" });

  const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);
  
  if (booking.pauseLogs && booking.pauseLogs.length > 0) {
    const lastPause = booking.pauseLogs[booking.pauseLogs.length - 1];
    if (!lastPause.endTime) {
      lastPause.endTime = nowStr;
      
      // Calculate elapsed hours
      const startMs = new Date(lastPause.startTime.replace(" ", "T")).getTime();
      const endMs = new Date(nowStr.replace(" ", "T")).getTime();
      const diffHours = Math.max(0.5, Math.round(((endMs - startMs) / (1000 * 60 * 60)) * 10) / 10);
      lastPause.durationHours = diffHours;

      if (lastPause.isOffShift) {
        booking.offShiftPausedDaysCalculated = (booking.offShiftPausedDaysCalculated || 0) + (diffHours >= 12 ? Math.round(diffHours / 24) || 1 : 0.5);
      } else {
        booking.totalPausedHoursCalculated = (booking.totalPausedHoursCalculated || 0) + diffHours;
      }
    }
  }

  booking.pauseState = "Active";
  booking.currentPauseReason = undefined;

  if (!booking.progressLogs) booking.progressLogs = [];
  booking.progressLogs.push({
    id: generateId("L"),
    timestamp: nowStr,
    status: "On Repair",
    notes: `Pekerjaan DILANJUTKAN KEMBALI. ${notes ? `Catatan: ${notes}` : ''}`,
    updatedBy: updatedBy || "Foreman"
  });

  saveDatabase();
  res.json(booking);
});

// Tim Gudang input/add sparepart to SPK directly
app.post("/api/bookings/:id/add-parts-gudang", (req, res) => {
  const { id } = req.params;
  const { partsToAdd, warehouseUser } = req.body; // partsToAdd: [{ partId, quantity }]

  const booking = db.bookings.find(b => b.id === id);
  if (!booking) return res.status(404).json({ error: "Work Order not found" });

  if (!Array.isArray(partsToAdd) || partsToAdd.length === 0) {
    return res.status(400).json({ error: "Daftar sparepart tidak boleh kosong" });
  }

  if (!booking.partsUsed) booking.partsUsed = [];

  let addedPartsSummary: string[] = [];

  partsToAdd.forEach((item: any) => {
    const sp = db.spareParts.find(p => p.id === item.partId);
    if (sp) {
      const existingIdx = booking.partsUsed.findIndex(pu => pu.partId === item.partId);
      if (existingIdx !== -1) {
        booking.partsUsed[existingIdx].quantity += Number(item.quantity);
      } else {
        booking.partsUsed.push({
          partId: sp.id,
          quantity: Number(item.quantity),
          priceAtSale: sp.price
        });
      }
      addedPartsSummary.push(`${sp.name} (+${item.quantity} ${sp.unit})`);
    }
  });

  // Recalculate total cost
  let newTotalCost = booking.flatRateCost || 0;
  booking.partsUsed.forEach(pu => {
    const sp = db.spareParts.find(p => p.id === pu.partId);
    const price = sp ? sp.price : pu.priceAtSale;
    newTotalCost += price * pu.quantity;
  });
  booking.totalCost = newTotalCost;

  booking.warehouseInputBy = warehouseUser || "Tim Gudang";
  booking.warehouseInputAt = new Date().toISOString().replace("T", " ").substring(0, 16);

  if (!booking.progressLogs) booking.progressLogs = [];
  booking.progressLogs.push({
    id: generateId("L"),
    timestamp: booking.warehouseInputAt,
    status: booking.progressStatus || "On Repair",
    notes: `[Input Logistik Gudang] Penambahan suku cadang ke SPK oleh ${booking.warehouseInputBy}: ${addedPartsSummary.join(", ")}`,
    updatedBy: booking.warehouseInputBy
  });

  saveDatabase();
  res.json(booking);
});

// Foreman assign/reassign mechanics
app.post("/api/bookings/:id/assign-foreman", (req, res) => {
  const { id } = req.params;
  const { primaryMechanic, secondaryMechanics, foremanName } = req.body;

  const booking = db.bookings.find(b => b.id === id);
  if (!booking) return res.status(404).json({ error: "Work Order not found" });

  const assigned: string[] = [];
  if (primaryMechanic) assigned.push(primaryMechanic);
  if (Array.isArray(secondaryMechanics)) {
    secondaryMechanics.forEach(m => {
      if (m && !assigned.includes(m)) assigned.push(m);
    });
  }

  booking.mechanicsAssigned = assigned;
  booking.mechanicName = assigned.join(", ") || "Belum Alokasi";

  if (!booking.progressLogs) booking.progressLogs = [];
  booking.progressLogs.push({
    id: generateId("L"),
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
    status: booking.progressStatus || "Admin Processing",
    notes: `[Alokasi Foreman] Penetapan Tim Mekanik: Utama (${primaryMechanic || '-'}), Pendamping (${(secondaryMechanics || []).join(', ') || 'Tidak Ada'})`,
    updatedBy: foremanName || "Foreman / Leader Workshop"
  });

  saveDatabase();
  res.json(booking);
});

// ====================================================
// MANPOWER MANAGEMENT & PRODUCTIVITY TRACKING API
// ====================================================

// 1. Get all manpower personnel and task history
app.get("/api/manpower", (req, res) => {
  if (!db.manpower) db.manpower = [];
  if (!db.manpowerTasks) db.manpowerTasks = [];
  res.json({
    personnel: db.manpower,
    tasks: db.manpowerTasks
  });
});

// 2. Create new personnel
app.post("/api/manpower", (req, res) => {
  try {
    const { name, role, skillLevel, phone, email, shift, status, assignedBay, specialties, certifications, joinedDate, notes } = req.body;
    
    if (!name || !role) {
      return res.status(400).json({ error: "Nama dan Role wajib diisi" });
    }

    const newPerson: ManpowerPerson = {
      id: generateId("MP"),
      nrp: req.body.nrp || `NRP-${Math.floor(10000 + Math.random() * 90000)}`,
      name: name.trim(),
      role: role || "Mekanik",
      skillLevel: skillLevel || "Senior",
      phone: phone || "-",
      email: email || "",
      shift: shift || "Shift 1 (Pagi)",
      status: status || "On Duty",
      assignedBay: assignedBay || "Workshop Utama",
      activeJob: null,
      standardMonthlyHours: 173,
      actualWorkHours: Number(req.body.actualWorkHours) || 0,
      flatRateHoursEarned: Number(req.body.flatRateHoursEarned) || 0,
      efficiencyRatio: Number(req.body.efficiencyRatio) || 100.0,
      utilizationRate: Number(req.body.utilizationRate) || 0.0,
      completedJobsCount: Number(req.body.completedJobsCount) || 0,
      specialties: Array.isArray(specialties) ? specialties : (specialties ? [specialties] : []),
      certifications: Array.isArray(certifications) ? certifications : (certifications ? [certifications] : []),
      joinedDate: joinedDate || new Date().toISOString().substring(0, 10),
      rating: Number(req.body.rating) || 5.0,
      notes: notes || ""
    };

    if (!db.manpower) db.manpower = [];
    db.manpower.push(newPerson);
    saveDatabase();

    res.status(201).json(newPerson);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Gagal menambahkan personil manpower" });
  }
});

// 3. Update personnel profile & status
app.put("/api/manpower/:id", (req, res) => {
  const { id } = req.params;
  const person = (db.manpower || []).find(p => p.id === id);
  if (!person) {
    return res.status(404).json({ error: "Personil tidak ditemukan" });
  }

  const allowedFields = [
    'name', 'nrp', 'role', 'skillLevel', 'phone', 'email', 
    'shift', 'status', 'assignedBay', 'activeJob', 'standardMonthlyHours',
    'actualWorkHours', 'flatRateHoursEarned', 'completedJobsCount',
    'specialties', 'certifications', 'joinedDate', 'rating', 'notes'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      (person as any)[field] = req.body[field];
    }
  });

  // Recalculate metrics
  if (person.actualWorkHours > 0) {
    person.efficiencyRatio = Number(((person.flatRateHoursEarned / person.actualWorkHours) * 100).toFixed(1));
  }
  const stdHours = person.standardMonthlyHours || 173;
  person.utilizationRate = Number(((person.actualWorkHours / stdHours) * 100).toFixed(1));

  saveDatabase();
  res.json(person);
});

// 4. Delete personnel
app.delete("/api/manpower/:id", (req, res) => {
  const { id } = req.params;
  const initialLength = (db.manpower || []).length;
  db.manpower = (db.manpower || []).filter(p => p.id !== id);

  if (db.manpower.length === initialLength) {
    return res.status(404).json({ error: "Personil tidak ditemukan" });
  }

  saveDatabase();
  res.json({ success: true, message: "Personil berhasil dihapus" });
});

// 4b. Bulk Shift Assignment & Attendance Update
app.post("/api/manpower/bulk-shift", (req, res) => {
  try {
    const { personIds, shift, status, assignedBay } = req.body;
    if (!Array.isArray(personIds) || personIds.length === 0) {
      return res.status(400).json({ error: "Daftar ID personil tidak valid" });
    }

    const updated: any[] = [];
    (db.manpower || []).forEach(p => {
      if (personIds.includes(p.id)) {
        if (shift) p.shift = shift;
        if (status) p.status = status;
        if (assignedBay) p.assignedBay = assignedBay;
        updated.push(p);
      }
    });

    saveDatabase();
    res.json({ 
      success: true, 
      count: updated.length, 
      message: `Berhasil memperbarui shift untuk ${updated.length} personil`,
      updated 
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Gagal memperbarui shift massal" });
  }
});

// 4c. Rotate Shifts (Swap Shift 1 Pagi <-> Shift 2 Malam)
app.post("/api/manpower/rotate-shifts", (req, res) => {
  try {
    let rotatedCount = 0;
    (db.manpower || []).forEach(p => {
      if (p.shift === "Shift 1 (Pagi)") {
        p.shift = "Shift 2 (Malam)";
        rotatedCount++;
      } else if (p.shift === "Shift 2 (Malam)") {
        p.shift = "Shift 1 (Pagi)";
        rotatedCount++;
      }
    });

    saveDatabase();
    res.json({ 
      success: true, 
      message: `Rotasi shift berhasil diterapkan untuk ${rotatedCount} personil`, 
      count: rotatedCount 
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Gagal merotasi shift" });
  }
});

// 4d. Update single personnel shift & attendance
app.put("/api/manpower/:id/attendance", (req, res) => {
  const { id } = req.params;
  const { status, shift, assignedBay } = req.body;
  const person = (db.manpower || []).find(p => p.id === id);
  if (!person) {
    return res.status(404).json({ error: "Personil tidak ditemukan" });
  }

  if (status) person.status = status;
  if (shift) person.shift = shift;
  if (assignedBay !== undefined) person.assignedBay = assignedBay;

  saveDatabase();
  res.json({ success: true, person });
});

// 5. Assign Job to personnel
app.post("/api/manpower/:id/assign", (req, res) => {
  const { id } = req.params;
  const { workOrderId, unitCode, unitName, jobType, bay, targetHours } = req.body;

  const person = (db.manpower || []).find(p => p.id === id);
  if (!person) {
    return res.status(404).json({ error: "Personil tidak ditemukan" });
  }

  person.status = "In Job";
  person.activeJob = {
    workOrderId: workOrderId || "",
    unitCode: unitCode || "Unit Armada",
    unitName: unitName || "",
    jobType: jobType || "Pekerjaan Servis / Perbaikan",
    bay: bay || person.assignedBay || "Bay 1",
    startTime: new Date().toISOString().replace("T", " ").substring(0, 16),
    targetHours: Number(targetHours) || 4.0
  };

  saveDatabase();
  res.json(person);
});

// 6. Complete task for personnel and calculate productivity metrics
app.post("/api/manpower/:id/complete-task", (req, res) => {
  const { id } = req.params;
  const { actualHours, flatRateHours, taskTitle, category, notes, unitCode } = req.body;

  const person = (db.manpower || []).find(p => p.id === id);
  if (!person) {
    return res.status(404).json({ error: "Personil tidak ditemukan" });
  }

  const actHrs = Math.max(0.5, Number(actualHours) || 2.0);
  const fltHrs = Math.max(0.5, Number(flatRateHours) || actHrs);
  const effScore = Number(((fltHrs / actHrs) * 100).toFixed(1));

  const uCode = unitCode || (person.activeJob ? person.activeJob.unitCode : "ARMADA");
  const tTitle = taskTitle || (person.activeJob ? person.activeJob.jobType : "Pekerjaan Servis Lapangan");

  const taskLog: ManpowerTaskLog = {
    id: generateId("TSK"),
    personId: person.id,
    personName: person.name,
    role: person.role,
    unitCode: uCode,
    taskTitle: tTitle,
    category: category || "Preventive Maintenance",
    completedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    actualHours: actHrs,
    flatRateHours: fltHrs,
    efficiencyScore: effScore,
    status: "Completed",
    notes: notes || "Pekerjaan selesai dilaksanakan sesuai standar SOP."
  };

  if (!db.manpowerTasks) db.manpowerTasks = [];
  db.manpowerTasks.unshift(taskLog);

  // Update Person's cumulative metrics
  person.actualWorkHours = Number((person.actualWorkHours + actHrs).toFixed(1));
  person.flatRateHoursEarned = Number((person.flatRateHoursEarned + fltHrs).toFixed(1));
  person.completedJobsCount += 1;
  person.efficiencyRatio = Number(((person.flatRateHoursEarned / person.actualWorkHours) * 100).toFixed(1));
  person.utilizationRate = Number(((person.actualWorkHours / (person.standardMonthlyHours || 173)) * 100).toFixed(1));
  person.activeJob = null;
  person.status = "On Duty";

  saveDatabase();
  res.json({ person, taskLog });
});

// Vite Dev vs Production Handling
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

  // Start Server
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
