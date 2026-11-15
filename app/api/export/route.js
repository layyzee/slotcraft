import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  try {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    const rows = db.prepare(`
      SELECT token_number, patient_name, patient_phone, service_name, service_price, status, slot_time, notes, prescription, created_at, completed_at 
      FROM appointments 
      WHERE date = ? 
      ORDER BY token_number ASC
    `).all(today);

    // Build CSV
    const headers = [
      'Token',
      'Patient Name',
      'Mobile Phone',
      'Service / Treatment',
      'Fee (INR)',
      'Status',
      'Slot Time',
      'Clinical Notes',
      'Prescription',
      'Created At',
      'Completed At'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""').replace(/\n/g, ' ');
      return `"${s}"`;
    };

    const csvLines = [
      headers.join(','),
      ...rows.map(r => [
        r.token_number,
        escapeCsv(r.patient_name),
        escapeCsv(r.patient_phone),
        escapeCsv(r.service_name),
        r.service_price,
        escapeCsv(r.status),
        escapeCsv(r.slot_time),
        escapeCsv(r.notes),
        escapeCsv(r.prescription),
        escapeCsv(r.created_at),
        escapeCsv(r.completed_at)
      ].join(','))
    ];

    const csvContent = csvLines.join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="smile-care-daily-register-${today}.csv"`
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
