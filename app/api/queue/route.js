import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  try {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    const url = new URL(request.url);
    const filterDoctor = url.searchParams.get('doctor');
    const filterRoom = url.searchParams.get('room');

    let query = `SELECT * FROM appointments WHERE date = ?`;
    const params = [today];
    if (filterDoctor) {
      query += ` AND doctor_id = ?`;
      params.push(filterDoctor);
    } else if (filterRoom) {
      query += ` AND room_number = ?`;
      params.push(filterRoom);
    }
    query += ` ORDER BY token_number ASC`;

    const appointments = db.prepare(query).all(...params);

    const nowServingList = appointments.filter(a => a.status === 'in_progress');
    const nowServing = nowServingList[0] || null;
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
      nowServingList,
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
    const { action, appointmentId, patientName, patientPhone, serviceName, servicePrice, doctorId, roomNumber, notes, prescription } = body;
    const today = new Date().toISOString().split('T')[0];

    if (action === 'call_next') {
      const targetRoom = roomNumber || 'Room 1';
      const targetDoctor = doctorId || (targetRoom === 'Room 2' ? 'dr-ananya-sen' : 'dr-rohan-joshi');

      // 1. Mark current in_progress for this room/doctor as completed
      db.prepare(`
        UPDATE appointments 
        SET status = 'completed', completed_at = datetime('now') 
        WHERE date = ? AND status = 'in_progress' AND (room_number = ? OR doctor_id = ?)
      `).run(today, targetRoom, targetDoctor);

      // 2. Find next waiting patient (matching doctor/room first or unassigned)
      let nextPatient = db.prepare(`
        SELECT * FROM appointments 
        WHERE date = ? AND status IN ('arrived', 'booked') AND (doctor_id = ? OR room_number = ?)
        ORDER BY CASE WHEN status = 'arrived' THEN 1 ELSE 2 END, token_number ASC 
        LIMIT 1
      `).get(today, targetDoctor, targetRoom);

      if (!nextPatient) {
        nextPatient = db.prepare(`
          SELECT * FROM appointments 
          WHERE date = ? AND status IN ('arrived', 'booked')
          ORDER BY CASE WHEN status = 'arrived' THEN 1 ELSE 2 END, token_number ASC 
          LIMIT 1
        `).get(today);
      }

      if (nextPatient) {
        db.prepare(`
          UPDATE appointments 
          SET status = 'in_progress', called_at = datetime('now'), room_number = ?, doctor_id = ?
          WHERE id = ?
        `).run(targetRoom, targetDoctor, nextPatient.id);
      }

      return NextResponse.json({ success: true, nextPatient, room: targetRoom });
    }

    if (action === 'add_walk_in') {
      const maxTokenResult = db.prepare(`
        SELECT MAX(token_number) as max_token FROM appointments WHERE date = ?
      `).get(today);
      const nextToken = (maxTokenResult.max_token || 0) + 1;
      const newId = `apt-${Date.now().toString().slice(-6)}`;
      const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const assignedRoom = roomNumber || 'Room 1';
      const assignedDoctor = doctorId || (assignedRoom === 'Room 2' ? 'dr-ananya-sen' : 'dr-rohan-joshi');

      db.prepare(`
        INSERT INTO appointments (id, clinic_id, doctor_id, patient_name, patient_phone, service_name, service_price, token_number, date, slot_time, status, room_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'arrived', ?)
      `).run(
        newId,
        'smile-care-dombivli',
        assignedDoctor,
        patientName || 'Walk-In Patient',
        patientPhone || 'Walk-In',
        serviceName || 'Comprehensive Dental Consultation & X-Ray',
        servicePrice || 500,
        nextToken,
        today,
        nowTime,
        assignedRoom
      );

      return NextResponse.json({ success: true, tokenNumber: nextToken, id: newId, room: assignedRoom });
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
