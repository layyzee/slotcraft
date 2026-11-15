import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.join(process.cwd(), 'slotcraft.db');
let dbInstance = null;

export function getDb() {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(dbPath);
    initTables(dbInstance);
  }
  return dbInstance;
}

function initTables(db) {
  // 1. Clinics table
  db.exec(`
    CREATE TABLE IF NOT EXISTS clinics (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tagline TEXT,
      address TEXT NOT NULL,
      locality TEXT NOT NULL,
      phone TEXT NOT NULL,
      open_time TEXT DEFAULT '10:00 AM',
      close_time TEXT DEFAULT '09:30 PM'
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id TEXT PRIMARY KEY,
      clinic_id TEXT NOT NULL,
      name TEXT NOT NULL,
      qualification TEXT NOT NULL,
      specialization TEXT NOT NULL,
      avg_consultation_minutes INTEGER DEFAULT 20
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      clinic_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price_inr INTEGER NOT NULL,
      duration_minutes INTEGER DEFAULT 20
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      clinic_id TEXT NOT NULL,
      doctor_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      patient_phone TEXT NOT NULL,
      service_id TEXT,
      service_name TEXT NOT NULL,
      service_price INTEGER NOT NULL,
      token_number INTEGER NOT NULL,
      date TEXT NOT NULL,
      slot_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'arrived', -- booked | arrived | in_progress | completed | no_show
      notes TEXT,
      prescription TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      called_at TEXT,
      completed_at TEXT
    );
  `);

  try {
    db.exec(`ALTER TABLE appointments ADD COLUMN notes TEXT;`);
  } catch (e) {}
  try {
    db.exec(`ALTER TABLE appointments ADD COLUMN prescription TEXT;`);
  } catch (e) {}

  // Seed default clinic if empty
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM clinics');
  const result = countStmt.get();

  if (result.count === 0) {
    seedDefaultClinic(db);
  }
}

function seedDefaultClinic(db) {
  const clinicId = 'smile-care-dombivli';
  const doctorId = 'dr-rohan-joshi';

  // Seed clinic
  db.prepare(`
    INSERT INTO clinics (id, name, tagline, address, locality, phone, open_time, close_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    clinicId,
    'Smile Care Dental & Orthodontic Clinic',
    'Gentle & High-Precision Family Dentistry',
    'Shop No. 4, Madhuban Complex, Opposite Railway Station, Phadke Road',
    'Dombivli East, Maharashtra 421201',
    '+91 98201 44552',
    '10:00 AM',
    '09:30 PM'
  );

  // Seed doctor
  db.prepare(`
    INSERT INTO doctors (id, clinic_id, name, qualification, specialization, avg_consultation_minutes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    doctorId,
    clinicId,
    'Dr. Rohan Joshi',
    'BDS, MDS (Mumbai), Gold Medalist',
    'Senior Consultant Orthodontist & Dental Surgeon',
    20
  );

  // Seed services
  const services = [
    { id: 'srv-consult', name: 'Comprehensive Dental Consultation & X-Ray', desc: 'Digital checkup, gum evaluation, and consultation', price: 500, dur: 15 },
    { id: 'srv-clean', name: 'Ultrasonic Scaling & Teeth Polishing', desc: 'Stain and tartar removal with deep enamel polish', price: 1200, dur: 30 },
    { id: 'srv-fill', name: 'Tooth-Colored Composite Laser Filling', desc: 'Aesthetic cavity restoration matching natural teeth', price: 1500, dur: 30 },
    { id: 'srv-root', name: 'Single-Sitting Painless Root Canal (RCT)', desc: 'Advanced rotary endodontics with local anesthesia', price: 4500, dur: 45 },
    { id: 'srv-align', name: 'Invisible Clear Aligners / Braces Assessment', desc: '3D digital smile scan and custom aligner planning', price: 800, dur: 30 }
  ];

  const srvInsert = db.prepare(`
    INSERT INTO services (id, clinic_id, name, description, price_inr, duration_minutes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const s of services) {
    srvInsert.run(s.id, clinicId, s.name, s.desc, s.price, s.dur);
  }

  // Seed active live queue for today
  const today = new Date().toISOString().split('T')[0];
  const initialPatients = [
    { id: 'apt-001', name: 'Priya Sharma', phone: '9820011221', srv: 'Ultrasonic Scaling & Teeth Polishing', price: 1200, token: 1, time: '06:00 PM', status: 'completed' },
    { id: 'apt-002', name: 'Amit Deshmukh', phone: '9833445566', srv: 'Comprehensive Dental Consultation & X-Ray', price: 500, token: 2, time: '06:20 PM', status: 'completed' },
    { id: 'apt-003', name: 'Sneha Patil', phone: '9769123456', srv: 'Tooth-Colored Composite Laser Filling', price: 1500, token: 3, time: '06:45 PM', status: 'in_progress' },
    { id: 'apt-004', name: 'Rahul Kulkarni (Commuter - Dombivli Local)', phone: '9819876543', srv: 'Comprehensive Dental Consultation & X-Ray', price: 500, token: 4, time: '07:15 PM', status: 'arrived' },
    { id: 'apt-005', name: 'Neha Mehta', phone: '9920112233', srv: 'Single-Sitting Painless Root Canal (RCT)', price: 4500, token: 5, time: '07:35 PM', status: 'arrived' },
    { id: 'apt-006', name: 'Vikram Shinde', phone: '9867001122', srv: 'Invisible Clear Aligners / Braces Assessment', price: 800, token: 6, time: '08:00 PM', status: 'booked' }
  ];

  const aptInsert = db.prepare(`
    INSERT INTO appointments (id, clinic_id, doctor_id, patient_name, patient_phone, service_name, service_price, token_number, date, slot_time, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of initialPatients) {
    aptInsert.run(p.id, clinicId, doctorId, p.name, p.phone, p.srv, p.price, p.token, today, p.time, p.status);
  }
}
