import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "Pyta Property <noreply@pytagotech.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const PROPERTY_NAME = process.env.NEXT_PUBLIC_PROPERTY_NAME || "Graha Maju";

interface EmailResult {
  success: boolean;
  error?: string;
}

// Build consistent email footer with property contact info
function buildEmailFooter(options: {
  propertyName: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  operationalHours?: string | null;
}): string {
  const { propertyName, address, phone, email, operationalHours } = options;
  const year = new Date().getFullYear();

  const contactRows: string[] = [];

  if (address) {
    contactRows.push(`<p style="margin: 2px 0; color: #64748b; font-size: 13px;">
      <strong style="color: #475569;">Alamat:</strong> ${address}
    </p>`);
  }

  if (phone) {
    contactRows.push(`<p style="margin: 2px 0; color: #64748b; font-size: 13px;">
      <strong style="color: #475569;">Telepon:</strong> ${phone}
    </p>`);
  }

  if (email) {
    contactRows.push(`<p style="margin: 2px 0; color: #64748b; font-size: 13px;">
      <strong style="color: #475569;">Email:</strong> <a href="mailto:${email}" style="color: #3b82f6;">${email}</a>
    </p>`);
  }

  if (operationalHours) {
    contactRows.push(`<p style="margin: 2px 0; color: #64748b; font-size: 13px;">
      <strong style="color: #475569;">Jam Operasional:</strong> ${operationalHours}
    </p>`);
  }

  const contactSection = contactRows.length > 0
    ? `<div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 16px;">
         ${contactRows.join("")}
       </div>`
    : "";

  return `
    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; background: #f9fafb; border-radius: 0 0 12px 12px; margin-top: 20px;">
      ${contactSection}
      <p style="margin: 8px 0 0;">© ${year} ${propertyName}. All rights reserved.</p>
    </div>
  `;
}

async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string | null;
}): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not configured, skipping email notification");
    return { success: false, error: "Resend API key not configured" };
  }

  try {
    console.log(`[Email] Sending to: ${to}, subject: ${subject}`);
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      ...(replyTo && { replyTo }),
    });

    if (error) {
      console.error(`[Email] Failed to send email to ${to}:`, error);
      return { success: false, error: error.message };
    }

    console.log(`[Email] Successfully sent email to ${to}, message ID: ${data?.id}`);
    return { success: true };
  } catch (error) {
    console.error(`[Email] Exception while sending email to ${to}:`, error);
    return { success: false, error: String(error) };
  }
}

// Booking received email for guest (when they submit a booking)
export async function sendBookingReceivedEmail({
  guestEmail,
  guestName,
  bookingNumber,
  unitNumber,
  propertyName,
  checkInDate,
  duration,
  durationType,
  totalPrice,
  notes,
  ownerPhone,
  replyTo,
}: {
  guestEmail: string;
  guestName: string;
  bookingNumber: string;
  unitNumber: string;
  propertyName: string;
  checkInDate: string;
  duration: number;
  durationType: "bulan" | "malam";
  totalPrice: number;
  notes?: string;
  ownerPhone?: string | null;
  replyTo?: string | null;
}) {
  const durationText = durationType === "bulan" ? `${duration} bulan` : `${duration} malam`;
  const formattedTotal = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(totalPrice);

  const displayPhone = ownerPhone || process.env.OWNER_PHONE || "Hubungi kami";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Booking Diterima</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">${propertyName}</p>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="margin-top: 0;">Halo <strong>${guestName}</strong>,</p>

    <p>Terima kasih telah melakukan pemesanan di <strong>${propertyName}</strong>. Kami telah menerima pemesanan Anda.</p>

    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">No. Booking</td>
          <td style="padding: 8px 0; font-weight: 600;">${bookingNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Unit</td>
          <td style="padding: 8px 0; font-weight: 600;">Unit ${unitNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Check-in</td>
          <td style="padding: 8px 0; font-weight: 600;">${checkInDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Durasi</td>
          <td style="padding: 8px 0; font-weight: 600;">${durationText}</td>
        </tr>
      </table>
    </div>

    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">Estimasi Total</p>
      <p style="margin: 5px 0 0; font-size: 28px; font-weight: bold; color: #b45309;">${formattedTotal}</p>
      <p style="margin: 5px 0 0; color: #92400e; font-size: 12px;">* Belum termasuk listrik, air, dan biaya lainnya</p>
    </div>

    ${notes ? `
    <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; color: #0c4a6e;"><strong>Catatan Anda:</strong></p>
      <p style="margin: 5px 0 0; color: #0369a1;">${notes}</p>
    </div>
    ` : ""}

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; color: #92400e;"><strong>Status:</strong> Menunggu Konfirmasi</p>
      <p style="margin: 5px 0 0; color: #92400e;">Tim kami akan segera memproses pemesanan Anda dan akan menghubungi Anda dalam 1x24 jam untuk konfirmasi lebih lanjut.</p>
    </div>

    <p>Mohon simpan nomor booking Anda untuk referensi.</p>
    <p>Jika ada pertanyaan, silakan hubungi kami:</p>
    <p style="margin-bottom: 0;">
      <strong>WhatsApp:</strong> ${displayPhone}
    </p>
  </div>

  ${buildEmailFooter({
    propertyName,
    phone: ownerPhone,
  })}
</body>
</html>
`;

  return sendEmail({
    to: guestEmail,
    subject: `Booking Diterima - ${bookingNumber} - ${propertyName}`,
    html,
    replyTo,
  });
}

// Booking confirmation email for guest
export async function sendBookingConfirmationEmail({
  guestEmail,
  guestName,
  bookingNumber,
  unitNumber,
  propertyName,
  unitName,
  checkInDate,
  duration,
  ownerPhone,
  replyTo,
}: {
  guestEmail: string;
  guestName: string;
  bookingNumber: string;
  unitNumber: string;
  propertyName: string;
  unitName?: string;
  checkInDate: string;
  duration: number;
  ownerPhone?: string | null;
  replyTo?: string | null;
}) {
  const displayUnit = unitName ? `${unitName} - Unit ${unitNumber}` : `Unit ${unitNumber}`;
  const displayPhone = ownerPhone || process.env.OWNER_PHONE || "Hubungi kami";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Pemesanan Dikonfirmasi!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">${propertyName}</p>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="margin-top: 0;">Halo <strong>${guestName}</strong>,</p>

    <p>Selamat! Pemesanan Anda telah <strong>dikonfirmasi</strong>. Berikut detail pemesanan Anda:</p>

    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">No. Booking</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: right;">${bookingNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Unit</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: right;">${displayUnit}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Check-in</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: right;">${checkInDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Durasi</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: right;">${duration} bulan</td>
        </tr>
      </table>
    </div>

    <div style="background: #dcfce7; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; color: #166534;"><strong>Silakan lakukan pembayaran sesuai instruksi dari tim kami.</strong></p>
      <p style="margin: 5px 0 0; color: #166534;">Tim kami akan menghubungi Anda untuk detail pembayaran.</p>
    </div>

    <p>Jika ada pertanyaan, silakan hubungi kami:</p>
    <p style="margin-bottom: 0;">
      <strong>WhatsApp:</strong> ${displayPhone}
    </p>
  </div>

  ${buildEmailFooter({
    propertyName,
    phone: ownerPhone,
  })}
</body>
</html>
`;

  return sendEmail({
    to: guestEmail,
    subject: `Pemesanan Dikonfirmasi - ${bookingNumber} - ${propertyName}`,
    html,
    replyTo,
  });
}

// Payment confirmation email for tenant
export async function sendPaymentConfirmationEmail({
  tenantEmail,
  tenantName,
  invoiceNumber,
  period,
  amount,
  paidAt,
  propertyName,
  replyTo,
}: {
  tenantEmail: string;
  tenantName: string;
  invoiceNumber: string;
  period: string;
  amount: number;
  paidAt: string;
  propertyName?: string;
  replyTo?: string | null;
}) {
  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Pembayaran Diterima</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">${propertyName || PROPERTY_NAME}</p>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="margin-top: 0;">Halo <strong>${tenantName}</strong>,</p>

    <p>Pembayaran tagihan Anda telah kami terima. Berikut detailnya:</p>

    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; color: #16a34a; font-size: 14px;">Tagihan ${period}</p>
      <p style="margin: 10px 0 0; font-size: 32px; font-weight: bold; color: #16a34a;">${formattedAmount}</p>
    </div>

    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">No. Tagihan</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: right;">${invoiceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Periode</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: right;">${period}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Jumlah</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: right;">${formattedAmount}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Tanggal Bayar</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: right;">${paidAt}</td>
        </tr>
      </table>
    </div>

    <p>Terima kasih atas pembayarannya!</p>
    <p style="margin-bottom: 0;">
      <strong>Salam hangat,<br>Tim ${propertyName || PROPERTY_NAME}</strong>
    </p>
  </div>

  ${buildEmailFooter({ propertyName: propertyName || PROPERTY_NAME })}
</body>
</html>
`;

  return sendEmail({
    to: tenantEmail,
    subject: `Pembayaran Diterima - ${invoiceNumber} - ${propertyName || PROPERTY_NAME}`,
    html,
    replyTo,
  });
}

// Booking rejected email for guest
export async function sendBookingRejectedEmail({
  guestEmail,
  guestName,
  bookingNumber,
  reason,
  propertyName,
  replyTo,
}: {
  guestEmail: string;
  guestName: string;
  bookingNumber: string;
  reason: string;
  propertyName?: string;
  replyTo?: string | null;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Pemesanan Ditolak</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">${propertyName || PROPERTY_NAME}</p>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="margin-top: 0;">Halo <strong>${guestName}</strong>,</p>

    <p>Mohon maaf, pemesanan dengan detail berikut tidak dapat kami konfirmasi:</p>

    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">No. Booking</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: right;">${bookingNumber}</td>
        </tr>
      </table>
    </div>

    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; color: #991b1b;"><strong>Alasan:</strong></p>
      <p style="margin: 5px 0 0; color: #991b1b;">${reason}</p>
    </div>

    <p>Silakan coba memilih tanggal atau kamar lain yang tersedia.</p>
    <p style="margin-bottom: 0;">
      <a href="${APP_URL}/kamar" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Lihat Kamar Tersedia</a>
    </p>
  </div>

  ${buildEmailFooter({ propertyName: propertyName || PROPERTY_NAME })}
</body>
</html>
`;

  return sendEmail({
    to: guestEmail,
    subject: `Pemesanan ${bookingNumber} Tidak Dapat Dikonfirmasi - ${propertyName || PROPERTY_NAME}`,
    html,
    replyTo,
  });
}

// Payment reminder email for tenant
export async function sendPaymentReminderEmail({
  tenantEmail,
  tenantName,
  invoiceNumber,
  period,
  amount,
  dueDate,
  replyTo,
}: {
  tenantEmail: string;
  tenantName: string;
  invoiceNumber: string;
  period: string;
  amount: number;
  dueDate: string;
  replyTo?: string | null;
}) {
  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Reminder Tagihan</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">${PROPERTY_NAME}</p>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="margin-top: 0;">Halo <strong>${tenantName}</strong>,</p>

    <p>Ini adalah pengingat bahwa tagihan Anda akan jatuh tempo:</p>

    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">Tagihan ${period}</p>
      <p style="margin: 10px 0 0; font-size: 28px; font-weight: bold; color: #b45309;">${formattedAmount}</p>
      <p style="margin: 10px 0 0; color: #92400e;">Jatuh tempo: <strong>${dueDate}</strong></p>
    </div>

    <p>Segera lakukan pembayaran dan upload bukti transfer di portal tenant:</p>
    <p style="margin-bottom: 0;">
      <a href="${APP_URL}/tenant/invoice" style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Bayar Sekarang</a>
    </p>
  </div>

  ${buildEmailFooter({ propertyName: PROPERTY_NAME })}
</body>
</html>
`;

  return sendEmail({
    to: tenantEmail,
    subject: `Reminder: Tagihan ${period} - ${PROPERTY_NAME}`,
    html,
    replyTo,
  });
}

// Invoice created email for tenant
export async function sendInvoiceCreatedEmail({
  tenantEmail,
  tenantName,
  invoiceNumber,
  period,
  rentAmount,
  electricAmount,
  waterAmount,
  otherAmount,
  totalAmount,
  dueDate,
  unitNumber,
  unitName,
  propertyName,
  bankName,
  accountName,
  accountNumber,
  replyTo,
}: {
  tenantEmail: string;
  tenantName: string;
  invoiceNumber: string;
  period: string;
  rentAmount: number;
  electricAmount: number;
  waterAmount: number;
  otherAmount: number;
  totalAmount: number;
  dueDate: string;
  unitNumber: string;
  unitName?: string;
  propertyName: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  replyTo?: string | null;
}) {
  const formattedTotal = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(totalAmount);

  const displayUnit = unitName ? `${unitName} - Unit ${unitNumber}` : `Unit ${unitNumber}`;

  const bankInfoSection = bankName && accountName && accountNumber ? `
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px; color: #166534; font-size: 16px;">Instruksi Pembayaran</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Bank</td>
          <td style="padding: 4px 0; font-weight: 600; text-align: right;">${bankName}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Atas Nama</td>
          <td style="padding: 4px 0; font-weight: 600; text-align: right;">${accountName}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Nomor Rekening</td>
          <td style="padding: 4px 0; font-weight: 600; text-align: right;">${accountNumber}</td>
        </tr>
      </table>
    </div>
  ` : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Tagihan Bulanan</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">${propertyName}</p>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="margin-top: 0;">Halo <strong>${tenantName}</strong>,</p>

    <p>Tagihan bulan <strong>${period}</strong> telah dibuat. Berikut detail tagihan Anda:</p>

    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">No. Tagihan</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: right;">${invoiceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Unit</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: right;">${displayUnit}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Periode</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: right;">${period}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Jatuh Tempo</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: right;">${dueDate}</td>
        </tr>
      </table>
    </div>

    <h3 style="margin: 20px 0 10px; font-size: 16px;">Rincian Pembayaran</h3>
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">Sewa Kamar</td>
          <td style="padding: 12px; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: 500;">Rp ${rentAmount.toLocaleString("id-ID")}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">Listrik</td>
          <td style="padding: 12px; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: 500;">Rp ${electricAmount.toLocaleString("id-ID")}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">Air</td>
          <td style="padding: 12px; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: 500;">Rp ${waterAmount.toLocaleString("id-ID")}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #f3f4f6;">Lainnya</td>
          <td style="padding: 12px; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: 500;">Rp ${otherAmount.toLocaleString("id-ID")}</td>
        </tr>
        <tr style="background: #fef3c7;">
          <td style="padding: 12px; font-weight: 700; font-size: 18px;">TOTAL</td>
          <td style="padding: 12px; text-align: right; font-weight: 700; font-size: 18px; color: #b45309;">${formattedTotal}</td>
        </tr>
      </table>
    </div>

    ${bankInfoSection}

    <p style="margin-top: 20px;">Segera lakukan pembayaran sebelum jatuh tempo dan upload bukti transfer di portal tenant.</p>

    <p style="margin-bottom: 20px; text-align: center;">
      <a href="${APP_URL}/tenant/invoice" style="display: inline-block; background: #22c55e; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Bayar Sekarang</a>
    </p>

    <p style="margin-bottom: 0;">
      <strong>Salam hangat,<br>Tim ${propertyName}</strong>
    </p>
  </div>

  ${buildEmailFooter({ propertyName })}
</body>
</html>
`;

  return sendEmail({
    to: tenantEmail,
    subject: `Tagihan Bulan ${period} - ${invoiceNumber}`,
    html,
    replyTo,
  });
}

// Tenant account created email
interface TenantAccountEmailParams {
  tenantEmail: string;
  tenantName: string;
  password: string;
  unitName: string;
  unitNumber: string;
  replyTo?: string | null;
}

export async function sendTenantAccountEmail({
  tenantEmail,
  tenantName,
  password,
  unitName,
  unitNumber,
  replyTo,
}: TenantAccountEmailParams): Promise<EmailResult> {
  const propertyName = process.env.NEXT_PUBLIC_PROPERTY_NAME || "Pyta Property";
  const displayUnit = unitName ? `${unitName} - Unit ${unitNumber}` : `Unit ${unitNumber}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Akun Tenant Dibuat</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px; text-align: center; border-radius: 16px 16px 0 0;">
      <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">Akun Tenant Dibuat!</h1>
      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Selamat datang di ${propertyName}</p>
    </div>

    <!-- Content -->
    <div style="background: white; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px;">
      <p style="margin: 0; color: #334155; font-size: 16px; line-height: 1.6;">
        Halo <strong>${tenantName}</strong>,
      </p>
      <p style="margin: 16px 0; color: #475569; font-size: 14px; line-height: 1.6;">
        Akun tenant Anda telah berhasil dibuat. Berikut adalah detail akun Anda:
      </p>

      <!-- Account Details Card -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="margin: 0 0 16px; color: #1e293b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Detail Akun</h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 40%;">Unit</td>
            <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">${displayUnit}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email</td>
            <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500;">${tenantEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Password</td>
            <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500; font-family: monospace; background: #e2e8f0; padding: 4px 8px; border-radius: 4px; display: inline-block;">${password}</td>
          </tr>
        </table>
      </div>

      <!-- Login Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${APP_URL}/login" style="display: inline-block; background: #f59e0b; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Login ke Portal Tenant
        </a>
      </div>

      <!-- Security Notice -->
      <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 500;">
          ⚠️ Mohon segera ganti password Anda setelah login untuk keamanan akun Anda.
        </p>
      </div>

      <p style="margin: 24px 0 0; color: #64748b; font-size: 13px; line-height: 1.6;">
        Jika ada pertanyaan, silakan hubungi kami.
      </p>
    </div>

    ${buildEmailFooter({ propertyName })}
  </div>
</body>
</html>
`;

  return sendEmail({
    to: tenantEmail,
    subject: `Akun Tenant Anda - ${propertyName}`,
    html,
    replyTo,
  });
}

// Weekly vacancy report email for owner
export async function sendVacancyReportEmail({
  ownerEmail,
  ownerName,
  propertyName,
  vacantUnits,
  expiringContracts,
  replyTo,
}: {
  ownerEmail: string;
  ownerName?: string;
  propertyName: string;
  vacantUnits: Array<{ unitNumber: string; unitName: string; type: string }>;
  expiringContracts: Array<{ tenantName: string; unitNumber: string; unitName: string; endDate: string }>;
  replyTo?: string | null;
}) {
  const greeting = ownerName ? `Halo ${ownerName}` : "Halo Owner";
  const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const vacantUnitsHtml = vacantUnits.length > 0
    ? `<table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
        <tr style="background: #fef3c7;">
          <th style="padding: 10px; text-align: left; border-bottom: 1px solid #fcd34d;">Unit</th>
          <th style="padding: 10px; text-align: left; border-bottom: 1px solid #fcd34d;">Nama</th>
          <th style="padding: 10px; text-align: left; border-bottom: 1px solid #fcd34d;">Tipe</th>
        </tr>
        ${vacantUnits.map(u => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${u.unitNumber}</td>
            <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${u.unitName}</td>
            <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${u.type}</td>
          </tr>
        `).join("")}
      </table>`
    : "<p style='color: #64748b;'>Tidak ada unit kosong</p>";

  const expiringContractsHtml = expiringContracts.length > 0
    ? `<table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
        <tr style="background: #fee2e2;">
          <th style="padding: 10px; text-align: left; border-bottom: 1px solid #fca5a5;">Tenant</th>
          <th style="padding: 10px; text-align: left; border-bottom: 1px solid #fca5a5;">Unit</th>
          <th style="padding: 10px; text-align: left; border-bottom: 1px solid #fca5a5;">Berakhir</th>
        </tr>
        ${expiringContracts.map(c => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${c.tenantName}</td>
            <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${c.unitNumber}</td>
            <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${c.endDate}</td>
          </tr>
        `).join("")}
      </table>`
    : "<p style='color: #64748b;'>Tidak ada kontrak yang akan berakhir</p>";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laporan Mingguan</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 32px; text-align: center; border-radius: 16px 16px 0 0;">
      <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">📊 Laporan Mingguan</h1>
      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">${propertyName} - ${today}</p>
    </div>

    <!-- Content -->
    <div style="background: white; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px;">
      <p style="margin: 0; color: #334155; font-size: 16px; line-height: 1.6;">
        ${greeting},
      </p>
      <p style="margin: 16px 0; color: #475569; font-size: 14px; line-height: 1.6;">
        Berikut laporan properti Anda untuk minggu ini.
      </p>

      <!-- Vacant Units -->
      <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="margin: 0 0 8px; color: #92400e; font-size: 16px; font-weight: 600;">
          🏠 Unit Kosong (${vacantUnits.length})
        </h3>
        <p style="margin: 0 0 12px; color: #a16207; font-size: 13px;">
          Unit yang belum disewakan
        </p>
        ${vacantUnitsHtml}
      </div>

      <!-- Expiring Contracts -->
      <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="margin: 0 0 8px; color: #991b1b; font-size: 16px; font-weight: 600;">
          ⚠️ Kontrak Akan Berakhir (${expiringContracts.length})
        </h3>
        <p style="margin: 0 0 12px; color: #b91c1c; font-size: 13px;">
          Perlu follow-up untuk perpanjangan
        </p>
        ${expiringContractsHtml}
      </div>

      <p style="margin: 24px 0 0; color: #64748b; font-size: 13px; line-height: 1.6;">
        Laporan ini dikirim otomatis setiap minggu oleh sistem.
      </p>
    </div>

    ${buildEmailFooter({ propertyName })}
  </div>
</body>
</html>
`;

  return sendEmail({
    to: ownerEmail,
    subject: `📊 Laporan Mingguan - ${propertyName}`,
    html,
    replyTo,
  });
}
