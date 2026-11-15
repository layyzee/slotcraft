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
