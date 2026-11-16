import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const clinic = db.prepare('SELECT * FROM clinics LIMIT 1').get();
    const doctors = db.prepare('SELECT * FROM doctors WHERE clinic_id = ?').all(clinic.id);
    const services = db.prepare('SELECT * FROM services WHERE clinic_id = ?').all(clinic.id);

    return NextResponse.json({
      success: true,
      clinic,
      doctors,
      services
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { action } = body;

    if (action === 'update_clinic') {
      const { name, tagline, address, locality, phone, open_time, close_time } = body;
      db.prepare(`
        UPDATE clinics 
        SET name = ?, tagline = ?, address = ?, locality = ?, phone = ?, open_time = ?, close_time = ?
        WHERE id = 'smile-care-dombivli'
      `).run(name, tagline, address, locality, phone, open_time, close_time);

      return NextResponse.json({ success: true, message: 'Clinic details saved successfully.' });
    }

    if (action === 'update_doctor') {
      const { id, name, qualification, specialization, avg_consultation_minutes, room_number } = body;
      db.prepare(`
        UPDATE doctors 
        SET name = ?, qualification = ?, specialization = ?, avg_consultation_minutes = ?, room_number = ?
        WHERE id = ?
      `).run(name, qualification, specialization, avg_consultation_minutes, room_number, id);

      return NextResponse.json({ success: true, message: 'Doctor profile updated.' });
    }

    if (action === 'reset_queue') {
      const today = new Date().toISOString().split('T')[0];
      db.prepare('DELETE FROM appointments WHERE date = ?').run(today);

      const clinicId = 'smile-care-dombivli';
      const initialPatients = [
        { id: 'apt-001', doctorId: 'dr-rohan-joshi', room: 'Room 1', name: 'Priya Sharma', phone: '9820011221', srv: 'Ultrasonic Scaling & Teeth Polishing', price: 1200, token: 1, time: '06:00 PM', status: 'completed' },
        { id: 'apt-002', doctorId: 'dr-ananya-sen', room: 'Room 2', name: 'Aarav Kothari (Child Checkup)', phone: '9833445566', srv: 'Invisible Clear Aligners / Braces Assessment', price: 800, token: 2, time: '06:20 PM', status: 'completed' },
        { id: 'apt-003', doctorId: 'dr-rohan-joshi', room: 'Room 1', name: 'Sneha Patil', phone: '9769123456', srv: 'Tooth-Colored Composite Laser Filling', price: 1500, token: 3, time: '06:45 PM', status: 'in_progress' },
        { id: 'apt-004', doctorId: 'dr-rohan-joshi', room: 'Room 1', name: 'Rahul Kulkarni (Commuter - Dombivli Local)', phone: '9819876543', srv: 'Comprehensive Dental Consultation & X-Ray', price: 500, token: 4, time: '07:15 PM', status: 'arrived' },
        { id: 'apt-005', doctorId: 'dr-ananya-sen', room: 'Room 2', name: 'Neha Mehta', phone: '9920112233', srv: 'Single-Sitting Painless Root Canal (RCT)', price: 4500, token: 5, time: '07:35 PM', status: 'arrived' },
        { id: 'apt-006', doctorId: 'dr-rohan-joshi', room: 'Room 1', name: 'Vikram Shinde', phone: '9867001122', srv: 'Invisible Clear Aligners / Braces Assessment', price: 800, token: 6, time: '08:00 PM', status: 'booked' }
      ];

      const aptInsert = db.prepare(`
        INSERT INTO appointments (id, clinic_id, doctor_id, patient_name, patient_phone, service_name, service_price, token_number, date, slot_time, status, room_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const p of initialPatients) {
        aptInsert.run(p.id, clinicId, p.doctorId, p.name, p.phone, p.srv, p.price, p.token, today, p.time, p.status, p.room);
      }

      return NextResponse.json({ success: true, message: "Queue reset and reseeded with today's Dombivli schedule." });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
