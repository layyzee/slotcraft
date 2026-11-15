// Zero-Cost WhatsApp Direct Messaging Helper
// Uses WhatsApp Web / Mobile URL protocol (https://wa.me/) without any paid API keys.

export function formatIndianPhone(phone) {
  if (!phone) return '';
  // Strip non-digits
  const clean = phone.replace(/\D/g, '');
  // If 10 digits, prepend 91
  if (clean.length === 10) return `91${clean}`;
  if (clean.length === 12 && clean.startsWith('91')) return clean;
  return clean;
}

export function getWhatsAppTokenCalledUrl(patientName, phone, tokenNumber, doctorName = 'Dr. Rohan Joshi') {
  const formattedPhone = formatIndianPhone(phone);
  const text = encodeURIComponent(
    `🔔 *Smile Care Dental Clinic — Token #${tokenNumber} Called*\n\n` +
    `Namaste ${patientName},\n` +
    `Your Token *#${tokenNumber}* is now being called into ${doctorName}'s consultation room.\n\n` +
    `📍 *Location:* Madhuban Complex, Opp. Dombivli Station, Phadke Road (East)\n` +
    `Please enter the clinic reception right away!`
  );
  return `https://wa.me/${formattedPhone}?text=${text}`;
}

export function getWhatsAppReminderUrl(patientName, phone, tokenNumber, patientsAhead) {
  const formattedPhone = formatIndianPhone(phone);
  const text = encodeURIComponent(
    `🚆 *Smile Care Dental Clinic — Queue Update*\n\n` +
    `Namaste ${patientName},\n` +
    `You are Token *#${tokenNumber}*. There are now *${patientsAhead} patient(s)* ahead of you in the queue.\n\n` +
    `If you are traveling on the Central Railway local train, please begin walking towards Phadke Road exit when you reach Dombivli station.\n\n` +
    `See you shortly!`
  );
  return `https://wa.me/${formattedPhone}?text=${text}`;
}

export function getWhatsAppBookingConfirmationUrl(patientName, phone, tokenNumber, serviceName, slotTime, tokenId) {
  const formattedPhone = formatIndianPhone(phone);
  const text = encodeURIComponent(
    `✅ *Smile Care Dental Clinic — Appointment Confirmed*\n\n` +
    `Namaste ${patientName},\n` +
    `Your appointment has been confirmed!\n\n` +
    `• *Assigned Token:* #${tokenNumber}\n` +
    `• *Service:* ${serviceName}\n` +
    `• *Slot Time:* ${slotTime}\n` +
    `• *Clinic:* Phadke Road, Dombivli East\n\n` +
    `Track your live queue position here:\n` +
    `http://localhost:3001/token/${tokenId}\n\n` +
    `Thank you!`
  );
  return `https://wa.me/${formattedPhone}?text=${text}`;
}
