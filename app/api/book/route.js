import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { patientName, patientPhone, serviceId, slotTime, date } = body;

    if (!patientName || !patientPhone || !serviceId) {
      return NextResponse.json({ success: false, error: 'Name, phone, and service are required' }, { status: 400 });
    }

    const today = date || new Date().toISOString().split('T')[0];
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(serviceId);
    if (!service) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }

    const clinic = db.prepare('SELECT * FROM clinics LIMIT 1').get();
    const doctor = db.prepare('SELECT * FROM doctors WHERE clinic_id = ? LIMIT 1').get(clinic.id);

    // Calculate next token number for today
    const maxTokenResult = db.prepare(`
      SELECT MAX(token_number) as max_token FROM appointments WHERE date = ?
    `).get(today);
    const nextToken = (maxTokenResult.max_token || 0) + 1;
    const appointmentId = `apt-${Date.now().toString().slice(-6)}`;

    db.prepare(`
      INSERT INTO appointments (
        id, clinic_id, doctor_id, patient_name, patient_phone, 
        service_id, service_name, service_price, token_number, date, slot_time, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'booked')
    `).run(
      appointmentId,
      clinic.id,
      doctor.id,
      patientName,
      patientPhone,
      service.id,
      service.name,
      service.price_inr,
      nextToken,
      today,
      slotTime || '07:00 PM'
    );

    const createdAppointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);

    return NextResponse.json({
      success: true,
      appointment: createdAppointment
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
