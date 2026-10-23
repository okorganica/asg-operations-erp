import type { RecordItem } from "../lib/types";

export const demoProjects: RecordItem[] = [
  { id: "ASG-PRJ-024", title: "Corporate HQ Access Control", subtitle: "Lahore · Access control & visitor management", status: "In Progress", amount: 12800000, owner: "Project Team", date: "2026-11-18" },
  { id: "ASG-PRJ-025", title: "Industrial CCTV Upgrade", subtitle: "Karachi · CCTV / AI analytics", status: "At Risk", amount: 8650000, owner: "Field Operations", date: "2026-11-04" },
  { id: "ASG-PRJ-026", title: "Perimeter Intrusion Detection", subtitle: "Islamabad · Perimeter security", status: "Planning", amount: 19400000, owner: "Engineering", date: "2026-12-02" },
  { id: "ASG-PRJ-027", title: "Parking Guidance System", subtitle: "Lahore · Parking management", status: "On Track", amount: 7200000, owner: "Projects", date: "2026-10-30" }
];

export const demoLeads: RecordItem[] = [
  { id: "LEAD-1048", title: "Northstar Industrial Estate", subtitle: "Perimeter security · Lahore", status: "Qualified", amount: 15600000, owner: "Sales Team", date: "2026-10-29" },
  { id: "LEAD-1049", title: "Crescent Medical Centre", subtitle: "CCTV and access control · Islamabad", status: "Site Survey", amount: 4800000, owner: "Sales Team", date: "2026-10-31" },
  { id: "LEAD-1050", title: "Metro Retail Group", subtitle: "Parking & ANPR · Karachi", status: "Proposal", amount: 9200000, owner: "Business Development", date: "2026-11-03" }
];

export const demoTickets: RecordItem[] = [
  { id: "SRV-2208", title: "Gate barrier intermittent fault", subtitle: "Customer: Atlas Logistics · Lahore", status: "High", owner: "Service Team", date: "2026-10-23" },
  { id: "SRV-2209", title: "CCTV camera offline", subtitle: "Customer: Crescent Medical Centre · Islamabad", status: "Open", owner: "Service Team", date: "2026-10-24" },
  { id: "SRV-2210", title: "AMC preventive visit", subtitle: "Customer: Northstar Estate · Lahore", status: "Scheduled", owner: "Field Engineer", date: "2026-10-27" }
];

export const revenueSeries = [
  { month: "May", revenue: 18.2, collection: 14.8 },
  { month: "Jun", revenue: 21.5, collection: 17.1 },
  { month: "Jul", revenue: 19.8, collection: 16.9 },
  { month: "Aug", revenue: 24.4, collection: 18.2 },
  { month: "Sep", revenue: 27.1, collection: 22.6 },
  { month: "Oct", revenue: 29.7, collection: 24.3 }
];