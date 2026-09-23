export interface Part {
  id: string;
  partNumber: string;
  name: string;
  category: string;
  location: string;
  minStock: number;
  maxStock: number;
  stockQuantity: number;
  uom: string;
  price: number;
  partIn: number;
  partOut: number;
  description?: string;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  created_at?: string;
}

export interface LocationZone {
  id: string;
  code: string;
  zone: string;
  rack: string;
  level: string;
  capacity: number;
  occupied: number;
  created_at?: string;
}

export interface MaterialRequestItem {
  id: string;
  partId: string;
  partNumber: string;
  name: string;
  quantity: number;
  available: number;
  location: string;
  uom: string;
}

export interface MaterialRequest {
  id: string;
  reference: string;
  date: string;
  requester: string;
  department: string;
  targetUnit?: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  items: MaterialRequestItem[];
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface TransactionItem {
  id: string;
  part_id: string;
  part_number: string;
  part_name: string;
  quantity: number;
  location: string;
  uom: string;
}

export interface Transaction {
  id: string;
  reference: string;
  transaction_type: 'inbound' | 'outbound';
  created_at: string;
  created_by: string;
  received_date?: string;
  delivery_date?: string;
  notes?: string;
  status: 'completed' | 'pending' | 'cancelled';
  items: TransactionItem[];
  targetUnit?: string;
  vendorOrSupplier?: string;
}

export interface StockOpnameItem {
  id: string;
  partId: string;
  name: string;
  sku: string;
  location: string;
  systemQty: number;
  countedQty: number | null;
  status: 'matched' | 'discrepancy' | 'pending';
}

export interface StockOpnameRecord {
  id: string;
  name: string;
  zone: string;
  startDate: string;
  endDate: string;
  status: 'completed' | 'in-progress' | 'scheduled';
  progress: number;
  assignedTo: string;
  itemCount: number;
  discrepancies: number;
  items: StockOpnameItem[];
}
