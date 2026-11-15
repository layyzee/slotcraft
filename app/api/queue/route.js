import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  try {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    const appointments = db.prepare(`
      SELECT * FROM appointments 
      WHERE date = ? 
      ORDER BY token_number ASC
    `).all(today);

    const nowServing = appointments.find(a => a.status === 'in_progress') || null;
    const waiting = appointments.filter(a => a.status === 'arrived');
    const upcoming = appointments.filter(a => a.status === 'booked');
    const completed = appointments.filter(a => a.status === 'completed');
    const noShow = appointments.filter(a => a.status === 'no_show');

    // Calculate estimated wait time (20 mins per waiting patient)
    const avgMinutesPerPatient = 20;
    const revenueToday = completed.reduce((sum, a) => sum + (Number(a.service_price) || 0), 0);

    return NextResponse.json({
      success: true,
      today,
      nowServing,
      waiting,
      upcoming,
      completed,
      noShow,
      stats: {
        totalToday: appointments.length,
        completedCount: completed.length,
        waitingCount: waiting.length,
        nowServingToken: nowServing ? nowServing.token_number : null,
        avgMinutesPerPatient,
        revenueToday
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { action, appointmentId, patientName, patientPhone, serviceName, servicePrice, notes, prescription } = body;
    const today = new Date().toISOString().split('T')[0];

    if (action === 'call_next') {
      // 1. Mark current in_progress as completed
      db.prepare(`
        UPDATE appointments 
        SET status = 'completed', completed_at = datetime('now') 
        WHERE date = ? AND status = 'in_progress'
      `).run(today);

      // 2. Find next waiting patient (arrived first, then booked)
      const nextPatient = db.prepare(`
        SELECT * FROM appointments 
        WHERE date = ? AND status IN ('arrived', 'booked') 
        ORDER BY CASE WHEN status = 'arrived' THEN 1 ELSE 2 END, token_number ASC 
        LIMIT 1
      `).get(today);

      if (nextPatient) {
        db.prepare(`
          UPDATE appointments 
          SET status = 'in_progress', called_at = datetime('now') 
          WHERE id = ?
        `).run(nextPatient.id);
      }

      return NextResponse.json({ success: true, nextPatient });
    }

    if (action === 'add_walk_in') {
      const maxTokenResult = db.prepare(`
        SELECT MAX(token_number) as max_token FROM appointments WHERE date = ?
      `).get(today);
      const nextToken = (maxTokenResult.max_token || 0) + 1;
      const newId = `apt-${Date.now().toString().slice(-6)}`;
      const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      db.prepare(`
        INSERT INTO appointments (id, clinic_id, doctor_id, patient_name, patient_phone, service_name, service_price, token_number, date, slot_time, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'arrived')
      `).run(
        newId,
        'smile-care-dombivli',
        'dr-rohan-joshi',
        patientName || 'Walk-In Patient',
        patientPhone || 'Walk-In',
        serviceName || 'Consultation & Checkup',
        servicePrice || 500,
        nextToken,
        today,
        nowTime
      );

      return NextResponse.json({ success: true, tokenNumber: nextToken, id: newId });
    }

    if (action === 'mark_arrived' && appointmentId) {
      db.prepare(`UPDATE appointments SET status = 'arrived' WHERE id = ?`).run(appointmentId);
      return NextResponse.json({ success: true });
    }

    if (action === 'save_notes' && appointmentId) {
      db.prepare(`UPDATE appointments SET notes = ?, prescription = ? WHERE id = ?`).run(
        notes || '',
        prescription || '',
        appointmentId
      );
      return NextResponse.json({ success: true });
    }

    if (action === 'complete_consultation' && appointmentId) {
      db.prepare(`
        UPDATE appointments 
        SET status = 'completed', completed_at = datetime('now'), notes = ?, prescription = ?
        WHERE id = ?
      `).run(
        notes || '',
        prescription || '',
        appointmentId
      );

      // Auto call next patient if requested
      return NextResponse.json({ success: true });
    }

    if (action === 'delay_patient' && appointmentId) {
      const pt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);
      if (pt) {
        // Swap with next waiting patient if available
        const nextPt = db.prepare(`
          SELECT * FROM appointments 
          WHERE date = ? AND status IN ('arrived', 'booked') AND token_number > ? 
          ORDER BY token_number ASC LIMIT 1
        `).get(pt.date, pt.token_number);

        if (nextPt) {
          db.prepare('UPDATE appointments SET token_number = ? WHERE id = ?').run(nextPt.token_number, pt.id);
          db.prepare('UPDATE appointments SET token_number = ? WHERE id = ?').run(pt.token_number, nextPt.id);
        } else {
          db.prepare('UPDATE appointments SET token_number = token_number + 1 WHERE id = ?').run(pt.id);
        }
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'cancel_appointment' && appointmentId) {
      db.prepare(`UPDATE appointments SET status = 'cancelled' WHERE id = ?`).run(appointmentId);
      return NextResponse.json({ success: true });
    }

    if (action === 'mark_no_show' && appointmentId) {
      db.prepare(`UPDATE appointments SET status = 'no_show' WHERE id = ?`).run(appointmentId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
