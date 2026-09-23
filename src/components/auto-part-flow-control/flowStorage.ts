import { Part, Category, LocationZone, MaterialRequest, Transaction, StockOpnameRecord } from './flowTypes';
import { SparePart, UioUnit } from '../../types';

const STORAGE_PREFIX = 'auto_part_flow_control_';

export function getFlowStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
  }
  return fallback;
}

export function setFlowStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

// Initial seed categories from auto-part-flow-control-v1
export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Engine Parts', description: 'Components related to engine operations, pistons, injectors', created_at: '2026-09-01' },
  { id: 'cat-2', name: 'Body Parts', description: 'External and cabin chassis components, mirrors, doors', created_at: '2026-09-01' },
  { id: 'cat-3', name: 'Electrical', description: 'Sensors, alternators, starters, headlight bulbs, wiring', created_at: '2026-09-01' },
  { id: 'cat-4', name: 'Filters', description: 'Air filters, lube oil filters, fuel water separators', created_at: '2026-09-01' },
  { id: 'cat-5', name: 'Fluids', description: 'Hydraulic oil, engine lube, coolant, gear oil', created_at: '2026-09-01' },
  { id: 'cat-6', name: 'Brakes', description: 'Brake pads, shoe linings, air brake chambers', created_at: '2026-09-01' },
  { id: 'cat-7', name: 'Tires & OTR', description: 'Heavy earthmover OTR tires, valve stems, flaps', created_at: '2026-09-01' }
];

// Initial seed locations from auto-part-flow-control-v1
export const INITIAL_LOCATIONS: LocationZone[] = [
  { id: 'loc-1', code: 'A01', zone: 'Zone A', rack: '01', level: '1', capacity: 100, occupied: 35, created_at: '2026-09-01' },
  { id: 'loc-2', code: 'A02', zone: 'Zone A', rack: '02', level: '1', capacity: 150, occupied: 28, created_at: '2026-09-01' },
  { id: 'loc-3', code: 'B01', zone: 'Zone B', rack: '01', level: '1', capacity: 200, occupied: 65, created_at: '2026-09-01' },
  { id: 'loc-4', code: 'B02', zone: 'Zone B', rack: '02', level: '2', capacity: 120, occupied: 42, created_at: '2026-09-01' },
  { id: 'loc-5', code: 'C01', zone: 'Zone C', rack: '01', level: '1', capacity: 80, occupied: 20, created_at: '2026-09-01' },
  { id: 'loc-6', code: 'D01', zone: 'Zone D', rack: '01', level: '1', capacity: 90, occupied: 82, created_at: '2026-09-01' }
];

// Seed parts combining auto-part-flow-control-v1 + fleet master parts
export const INITIAL_PARTS: Part[] = [
  {
    id: 'part-1',
    partNumber: 'ENG001',
    name: 'Engine Oil Filter C-Series',
    category: 'Filters',
    location: 'A01',
    minStock: 10,
    maxStock: 50,
    stockQuantity: 28,
    uom: 'PCS',
    price: 350000,
    partIn: 45,
    partOut: 20,
    description: 'High efficiency lube oil filter for heavy duty diesel',
    created_at: '2026-09-01'
  },
  {
    id: 'part-2',
    partNumber: 'BRK001',
    name: 'Brake Pad Set - Front Axle Heavy Duty',
    category: 'Brakes',
    location: 'A02',
    minStock: 5,
    maxStock: 25,
    stockQuantity: 12,
    uom: 'SET',
    price: 1850000,
    partIn: 22,
    partOut: 10,
    description: 'Ceramic composite brake linings for Dump Truck',
    created_at: '2026-09-01'
  },
  {
    id: 'part-3',
    partNumber: 'ELC001',
    name: 'Headlight LED Assembly 24V Mining Spec',
    category: 'Electrical',
    location: 'B01',
    minStock: 8,
    maxStock: 40,
    stockQuantity: 24,
    uom: 'PCS',
    price: 1250000,
    partIn: 35,
    partOut: 11,
    description: 'Heavy duty IP68 water resistant working light',
    created_at: '2026-09-01'
  },
  {
    id: 'part-4',
    partNumber: 'BOD001',
    name: 'Convex Cabin Blind-Spot Mirror Right',
    category: 'Body Parts',
    location: 'B02',
    minStock: 2,
    maxStock: 10,
    stockQuantity: 4,
    uom: 'PCS',
    price: 650000,
    partIn: 12,
    partOut: 8,
    description: 'Heated anti-vibration rearview mirror assembly',
    created_at: '2026-09-01'
  },
  {
    id: 'part-5',
    partNumber: 'FLD001',
    name: 'Engine Oil 15W-40 CI-4 (200L Drum)',
    category: 'Fluids',
    location: 'C01',
    minStock: 4,
    maxStock: 20,
    stockQuantity: 8,
    uom: 'DRUM',
    price: 7200000,
    partIn: 18,
    partOut: 10,
    description: 'Mineral premium high performance diesel lubricant',
    created_at: '2026-09-01'
  },
  {
    id: 'part-6',
    partNumber: 'FIL-CAT-1R1808',
    name: 'Filter Oli Caterpillar 1R-1808 Genuine',
    category: 'Filters',
    location: 'A01',
    minStock: 8,
    maxStock: 30,
    stockQuantity: 18,
    uom: 'PCS',
    price: 480000,
    partIn: 30,
    partOut: 12,
    description: 'OEM Caterpillar filter for Excavator PC2000 & 320D',
    created_at: '2026-09-02'
  },
  {
    id: 'part-7',
    partNumber: 'TYR-BRI-27R49',
    name: 'Ban Tubeless Bridgestone 27.00R49 V-Steel',
    category: 'Tires & OTR',
    location: 'D01',
    minStock: 4,
    maxStock: 16,
    stockQuantity: 3, // Low stock trigger
    uom: 'PCS',
    price: 85000000,
    partIn: 12,
    partOut: 9,
    description: 'Radial earthmover tire for heavy haul mining truck',
    created_at: '2026-09-05'
  }
];

// Initial Material Requests
export const INITIAL_REQUESTS: MaterialRequest[] = [
  {
    id: 'MR-001',
    reference: 'REQ-2026-09-001',
    date: '2026-09-23',
    requester: 'Herianto (Senior Mekanik)',
    department: 'Heavy Equipment Bay 2',
    targetUnit: 'EXCA-01',
    status: 'pending',
    priority: 'high',
    items: [
      { id: 'mri-1', partId: 'part-6', partNumber: 'FIL-CAT-1R1808', name: 'Filter Oli Caterpillar 1R-1808 Genuine', quantity: 4, available: 18, location: 'A01', uom: 'PCS' },
      { id: 'mri-2', partId: 'part-5', partNumber: 'FLD001', name: 'Engine Oil 15W-40 CI-4 (200L Drum)', quantity: 1, available: 8, location: 'C01', uom: 'DRUM' }
    ],
    notes: 'Kebutuhan darurat Preventive Maintenance 500 HM unit Excavator PC2000.'
  },
  {
    id: 'MR-002',
    reference: 'REQ-2026-09-002',
    date: '2026-09-22',
    requester: 'Hendra Saputra (Lead Tireman)',
    department: 'Tire Bay Area',
    targetUnit: 'DUMP-05',
    status: 'approved',
    priority: 'high',
    approvedBy: 'Agus Priyanto (Foreman)',
    approvedAt: '2026-09-22 15:30',
    items: [
      { id: 'mri-3', partId: 'part-7', partNumber: 'TYR-BRI-27R49', name: 'Ban Tubeless Bridgestone 27.00R49 V-Steel', quantity: 2, available: 3, location: 'D01', uom: 'PCS' }
    ],
    notes: 'Penggantian ban posisi 3-4 yang aus melebihi tread limit.'
  },
  {
    id: 'MR-003',
    reference: 'REQ-2026-09-003',
    date: '2026-09-21',
    requester: 'Bambang Sudarmo',
    department: 'Electrical Workshop',
    targetUnit: 'DUMP-03',
    status: 'completed',
    priority: 'medium',
    approvedBy: 'Agus Priyanto (Foreman)',
    approvedAt: '2026-09-21 10:15',
    items: [
      { id: 'mri-4', partId: 'part-3', partNumber: 'ELC001', name: 'Headlight LED Assembly 24V Mining Spec', quantity: 2, available: 24, location: 'B01', uom: 'PCS' }
    ],
    notes: 'Barang telah diambil dan dipasang di armada malam hari.'
  }
];

// Initial Transactions
export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TRX-101',
    reference: 'PO-2026-115',
    transaction_type: 'inbound',
    created_at: '2026-09-23 10:45',
    created_by: 'Logistik Penerimaan',
    notes: 'Penerimaan kiriman supplier PT Trakindo Utama',
    status: 'completed',
    vendorOrSupplier: 'PT Trakindo Utama',
    items: [
      { id: 'ti-1', part_id: 'part-6', part_number: 'FIL-CAT-1R1808', part_name: 'Filter Oli Caterpillar 1R-1808 Genuine', quantity: 10, location: 'A01', uom: 'PCS' }
    ]
  },
  {
    id: 'TRX-102',
    reference: 'WO-2026-088',
    transaction_type: 'outbound',
    created_at: '2026-09-23 09:30',
    created_by: 'Suryadi (Gudang)',
    notes: 'Pengeluaran part untuk SPK Servis Berkala',
    status: 'completed',
    targetUnit: 'EXCA-01',
    items: [
      { id: 'ti-2', part_id: 'part-1', part_number: 'ENG001', part_name: 'Engine Oil Filter C-Series', quantity: 4, location: 'A01', uom: 'PCS' }
    ]
  },
  {
    id: 'TRX-103',
    reference: 'WO-2026-084',
    transaction_type: 'outbound',
    created_at: '2026-09-22 14:15',
    created_by: 'M. Yusuf (Mekanik)',
    notes: 'Pemasangan kampas rem Dump Truck',
    status: 'completed',
    targetUnit: 'DUMP-05',
    items: [
      { id: 'ti-3', part_id: 'part-2', part_number: 'BRK001', part_name: 'Brake Pad Set - Front Axle Heavy Duty', quantity: 2, location: 'A02', uom: 'SET' }
    ]
  }
];

// Initial Stock Opname records
export const INITIAL_OPNAME: StockOpnameRecord[] = [
  {
    id: 'SO-001',
    name: 'Stock Opname Bulanan Q3 - Zone A (Filters & Brakes)',
    zone: 'Zone A',
    startDate: '2026-09-20',
    endDate: '2026-09-22',
    status: 'completed',
    progress: 100,
    assignedTo: 'Suryadi & Wahyu',
    itemCount: 4,
    discrepancies: 0,
    items: [
      { id: 'soi-1', partId: 'part-1', sku: 'ENG001', name: 'Engine Oil Filter C-Series', location: 'A01', systemQty: 28, countedQty: 28, status: 'matched' },
      { id: 'soi-2', partId: 'part-2', sku: 'BRK001', name: 'Brake Pad Set - Front Axle Heavy Duty', location: 'A02', systemQty: 12, countedQty: 12, status: 'matched' },
      { id: 'soi-3', partId: 'part-6', sku: 'FIL-CAT-1R1808', name: 'Filter Oli Caterpillar 1R-1808 Genuine', location: 'A01', systemQty: 18, countedQty: 18, status: 'matched' }
    ]
  },
  {
    id: 'SO-002',
    name: 'Cycle Count Audit - Zone D (OTR Heavy Tires)',
    zone: 'Zone D',
    startDate: '2026-09-23',
    endDate: '2026-09-24',
    status: 'in-progress',
    progress: 65,
    assignedTo: 'Hendra Saputra',
    itemCount: 2,
    discrepancies: 1,
    items: [
      { id: 'soi-4', partId: 'part-7', sku: 'TYR-BRI-27R49', name: 'Ban Tubeless Bridgestone 27.00R49 V-Steel', location: 'D01', systemQty: 3, countedQty: 2, status: 'discrepancy' }
    ]
  }
];

// Initialize and sync storage
export function initializeFlowData(existingFleetParts?: SparePart[]): void {
  if (!localStorage.getItem(`${STORAGE_PREFIX}categories`)) {
    setFlowStorage('categories', INITIAL_CATEGORIES);
  }
  if (!localStorage.getItem(`${STORAGE_PREFIX}locations`)) {
    setFlowStorage('locations', INITIAL_LOCATIONS);
  }
  if (!localStorage.getItem(`${STORAGE_PREFIX}parts`)) {
    let combinedParts = [...INITIAL_PARTS];
    if (existingFleetParts && existingFleetParts.length > 0) {
      existingFleetParts.forEach(fp => {
        if (!combinedParts.some(cp => cp.partNumber === fp.code)) {
          combinedParts.push({
            id: fp.id,
            partNumber: fp.code,
            name: fp.name,
            category: fp.category,
            location: 'A01',
            minStock: fp.minStock,
            maxStock: fp.minStock * 4,
            stockQuantity: fp.stock,
            uom: fp.unit,
            price: fp.price,
            partIn: fp.stock + 5,
            partOut: 5,
            created_at: new Date().toISOString().slice(0, 10)
          });
        }
      });
    }
    setFlowStorage('parts', combinedParts);
  }
  if (!localStorage.getItem(`${STORAGE_PREFIX}requests`)) {
    setFlowStorage('requests', INITIAL_REQUESTS);
  }
  if (!localStorage.getItem(`${STORAGE_PREFIX}transactions`)) {
    setFlowStorage('transactions', INITIAL_TRANSACTIONS);
  }
  if (!localStorage.getItem(`${STORAGE_PREFIX}opname`)) {
    setFlowStorage('opname', INITIAL_OPNAME);
  }
}
