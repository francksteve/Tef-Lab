import nodemailer from 'nodemailer'
import { config } from './config'
import { generateAdminToClientLink } from './whatsapp'

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  requireTLS: config.smtp.port === 587,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  },
})

// ─── Template 1 : Nouvelle commande → Admin ────────────────────────────────

export interface NewOrderEmailData {
  reference: string
  packName: string
  price: number
  visitorName: string
  visitorEmail: string
  visitorPhone: string
  visitorMessage?: string
  createdAt: Date
}

export async function sendNewOrderEmail(data: NewOrderEmailData): Promise<void> {
  const firstName = data.visitorName.split(' ')[0]
  const waLink = generateAdminToClientLink({
    clientPhone: data.visitorPhone,
    clientFirstName: firstName,
    packName: data.packName,
    price: data.price,
  })

  const formattedDate = new Date(data.createdAt).toLocaleString('fr-FR', {
    timeZone: 'Africa/Douala',
    dateStyle: 'long',
    timeStyle: 'short',
  })

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Nouvelle commande – TEF-LAB</title></head>
<body style="font-family:Arial,sans-serif; background:#f5f5f5; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

    <div style="background:#003087; padding:24px 32px;">
      <p style="color:#fff; margin:0; font-size:20px; font-weight:900;">TEF-LAB</p>
      <p style="color:#cce0ff; margin:6px 0 0; font-size:13px;">Nouvelle commande reçue</p>
    </div>

    <div style="padding:32px;">
      <h2 style="color:#003087; margin-top:0; font-size:17px;">Commande ${data.reference}</h2>

      <table style="width:100%; border-collapse:collapse; margin-bottom:24px; font-size:14px;">
        <tr style="background:#f0f4ff;">
          <td style="padding:9px 14px; font-weight:bold; color:#003087; width:38%;">Référence</td>
          <td style="padding:9px 14px; font-family:monospace;">${data.reference}</td>
        </tr>
        <tr>
          <td style="padding:9px 14px; font-weight:bold; color:#003087;">Pack</td>
          <td style="padding:9px 14px;">${data.packName}</td>
        </tr>
        <tr style="background:#f0f4ff;">
          <td style="padding:9px 14px; font-weight:bold; color:#003087;">Montant</td>
          <td style="padding:9px 14px; font-weight:bold;">${data.price.toLocaleString('fr-FR')} FCFA</td>
        </tr>
        <tr>
          <td style="padding:9px 14px; font-weight:bold; color:#003087;">Date</td>
          <td style="padding:9px 14px;">${formattedDate}</td>
        </tr>
      </table>

      <h3 style="color:#003087; font-size:14px; text-transform:uppercase; letter-spacing:0.5px; border-bottom:1px solid #e5e7eb; padding-bottom:8px; margin-bottom:16px;">Client</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:28px; font-size:14px;">
        <tr style="background:#f0f4ff;">
          <td style="padding:9px 14px; font-weight:bold; color:#003087; width:38%;">Nom</td>
          <td style="padding:9px 14px;">${data.visitorName}</td>
        </tr>
        <tr>
          <td style="padding:9px 14px; font-weight:bold; color:#003087;">Email</td>
          <td style="padding:9px 14px;"><a href="mailto:${data.visitorEmail}" style="color:#0055B3;">${data.visitorEmail}</a></td>
        </tr>
        <tr style="background:#f0f4ff;">
          <td style="padding:9px 14px; font-weight:bold; color:#003087;">WhatsApp</td>
          <td style="padding:9px 14px;">${data.visitorPhone}</td>
        </tr>
        ${data.visitorMessage ? `<tr>
          <td style="padding:9px 14px; font-weight:bold; color:#003087; vertical-align:top;">Message</td>
          <td style="padding:9px 14px; color:#555;">${data.visitorMessage}</td>
        </tr>` : ''}
      </table>

      <div style="text-align:center; margin-bottom:12px;">
        <a href="${waLink}"
           style="display:inline-block; background:#25D366; color:#fff; text-decoration:none;
                  padding:12px 28px; border-radius:6px; font-size:14px; font-weight:bold;">
          Contacter le client sur WhatsApp
        </a>
      </div>
      <div style="text-align:center;">
        <a href="${config.siteUrl}/admin/commandes"
           style="display:inline-block; background:#003087; color:#fff; text-decoration:none;
                  padding:12px 28px; border-radius:6px; font-size:14px;">
          Gérer dans l'administration
        </a>
      </div>
    </div>

    <div style="background:#f5f5f5; padding:14px 32px; text-align:center; color:#888; font-size:12px;">
      © ${new Date().getFullYear()} TEF-LAB &nbsp;·&nbsp;
      <a href="${config.siteUrl}" style="color:#0055B3; text-decoration:none;">tef-lab.com</a>
    </div>
  </div>
</body>
</html>
`

  await transporter.sendMail({
    from: config.smtp.from,
    to: config.adminEmail,
    subject: `[TEF-LAB] Commande ${data.reference} — ${data.packName}`,
    html,
  })
}

// ─── Template 2 : Compte activé → Client ───────────────────────────────────

export interface AccountActivatedEmailData {
  visitorName: string
  visitorEmail: string
  packName: string
  tempPassword: string
  activatedAt: Date
  expiresAt: Date
  modules: string[]
}

export async function sendAccountActivatedEmail(data: AccountActivatedEmailData): Promise<void> {
  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString('fr-FR', {
      timeZone: 'Africa/Douala',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  const modulesList = data.modules.map((m) => `<li style="margin:4px 0;">${m}</li>`).join('')

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Votre compte TEF-LAB est activé</title></head>
<body style="font-family:Arial,sans-serif; background:#f5f5f5; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

    <div style="background:#003087; padding:24px 32px;">
      <p style="color:#fff; margin:0; font-size:20px; font-weight:900;">TEF-LAB</p>
      <p style="color:#cce0ff; margin:6px 0 0; font-size:13px;">Confirmation d'accès</p>
    </div>

    <div style="padding:32px;">
      <p style="color:#444; font-size:15px; margin-top:0;">Bonjour ${data.visitorName},</p>
      <p style="color:#444; font-size:14px; line-height:1.7; margin-bottom:24px;">
        Votre commande pour le pack <strong>${data.packName}</strong> a été validée.
        Voici vos identifiants de connexion :
      </p>

      <div style="background:#f0f4ff; border:1px solid #c3d3f0; border-radius:6px; padding:20px; margin-bottom:20px; text-align:center;">
        <p style="margin:0 0 10px; font-size:13px; color:#666; text-transform:uppercase; letter-spacing:0.8px;">Identifiants de connexion</p>
        <p style="margin:6px 0; font-size:14px; color:#333;"><strong>Email :</strong> ${data.visitorEmail}</p>
        <p style="margin:6px 0; font-size:14px; font-family:monospace; letter-spacing:1px; color:#003087;">
          <strong>Mot de passe :</strong> ${data.tempPassword}
        </p>
      </div>

      <div style="background:#fffbeb; border-left:3px solid #f59e0b; padding:12px 16px; border-radius:4px; margin-bottom:24px; font-size:13px; color:#78350f;">
        Ce mot de passe est temporaire. Vous serez invité(e) à le modifier lors de votre première connexion.
      </div>

      <div style="text-align:center; margin:24px 0;">
        <a href="${config.siteUrl}/connexion"
           style="display:inline-block; background:#003087; color:#fff; text-decoration:none;
                  padding:13px 32px; border-radius:6px; font-size:15px; font-weight:bold;">
          Se connecter
        </a>
      </div>

      <h3 style="color:#003087; font-size:14px; text-transform:uppercase; letter-spacing:0.5px; border-bottom:1px solid #e5e7eb; padding-bottom:8px; margin:28px 0 16px;">Détails de l'abonnement</h3>
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <tr style="background:#f0f4ff;">
          <td style="padding:9px 14px; font-weight:bold; color:#003087; width:38%;">Pack</td>
          <td style="padding:9px 14px;">${data.packName}</td>
        </tr>
        <tr>
          <td style="padding:9px 14px; font-weight:bold; color:#003087;">Actif du</td>
          <td style="padding:9px 14px;">${formatDate(data.activatedAt)}</td>
        </tr>
        <tr style="background:#f0f4ff;">
          <td style="padding:9px 14px; font-weight:bold; color:#003087;">Jusqu'au</td>
          <td style="padding:9px 14px; color:#E30613; font-weight:bold;">${formatDate(data.expiresAt)}</td>
        </tr>
        <tr>
          <td style="padding:9px 14px; font-weight:bold; color:#003087; vertical-align:top;">Modules</td>
          <td style="padding:9px 14px;"><ul style="margin:0; padding-left:18px;">${modulesList}</ul></td>
        </tr>
      </table>

      <p style="color:#888; font-size:12px; line-height:1.6; margin-top:28px;">
        Pour toute question, contactez-nous sur
        <a href="https://wa.me/${config.adminWhatsapp}" style="color:#555;">WhatsApp</a>
        ou à <a href="mailto:${config.adminEmail}" style="color:#555;">${config.adminEmail}</a>.
      </p>
    </div>

    <div style="background:#f5f5f5; padding:14px 32px; text-align:center; color:#888; font-size:12px;">
      © ${new Date().getFullYear()} TEF-LAB &nbsp;·&nbsp;
      <a href="${config.siteUrl}" style="color:#0055B3; text-decoration:none;">tef-lab.com</a>
    </div>
  </div>
</body>
</html>
`

  await transporter.sendMail({
    from: config.smtp.from,
    to: data.visitorEmail,
    subject: `[TEF-LAB] Compte activé — Pack ${data.packName}`,
    html,
  })
}

// ─── Template 3 : Commande rejetée → Client ────────────────────────────────

export interface OrderRejectedEmailData {
  visitorName: string
  visitorEmail: string
  packName: string
  reference: string
}

// ─── Template 5 : Paiement confirmé (NotchPay/PayPal) → Client ─────────────

export interface PaymentConfirmedEmailData {
  clientName: string
  clientEmail: string
  packName: string
  price: number
  reference: string
  activatedAt: Date
  expiresAt: Date
  moduleAccess: 'EE_EO' | 'ALL'
}

export async function sendPaymentConfirmedEmail(data: PaymentConfirmedEmailData): Promise<void> {
  const firstName = data.clientName.split(' ')[0]
  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString('fr-FR', {
      timeZone: 'Africa/Douala',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  const modulesLabel =
    data.moduleAccess === 'ALL'
      ? 'CE · CO · EE · EO (tous les modules)'
      : 'EE · EO (Expression Écrite &amp; Orale)'

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Paiement confirmé – TEF-LAB</title></head>
<body style="font-family:Arial,sans-serif; background:#f5f5f5; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

    <div style="background:#003087; padding:24px 32px;">
      <p style="color:#fff; margin:0; font-size:20px; font-weight:900;">TEF-LAB</p>
      <p style="color:#cce0ff; margin:6px 0 0; font-size:13px;">Confirmation de paiement</p>
    </div>

    <div style="padding:32px;">
      <p style="color:#444; font-size:15px; margin-top:0;">Bonjour ${firstName},</p>
      <p style="color:#444; font-size:14px; line-height:1.7; margin-bottom:24px;">
        Votre paiement de <strong>${data.price.toLocaleString('fr-FR')} FCFA</strong> pour le pack
        <strong>${data.packName}</strong> a bien été reçu. Votre accès est maintenant actif.
      </p>

      <table style="width:100%; border-collapse:collapse; margin-bottom:28px; font-size:14px;">
        <tr style="background:#f0f4ff;">
          <td style="padding:9px 14px; font-weight:bold; color:#003087; width:38%;">Pack</td>
          <td style="padding:9px 14px; font-weight:bold;">${data.packName}</td>
        </tr>
        <tr>
          <td style="padding:9px 14px; font-weight:bold; color:#003087;">Montant payé</td>
          <td style="padding:9px 14px;">${data.price.toLocaleString('fr-FR')} FCFA</td>
        </tr>
        <tr style="background:#f0f4ff;">
          <td style="padding:9px 14px; font-weight:bold; color:#003087;">Référence</td>
          <td style="padding:9px 14px; font-family:monospace; font-size:13px;">${data.reference}</td>
        </tr>
        <tr>
          <td style="padding:9px 14px; font-weight:bold; color:#003087;">Modules inclus</td>
          <td style="padding:9px 14px;">${modulesLabel}</td>
        </tr>
        <tr style="background:#f0f4ff;">
          <td style="padding:9px 14px; font-weight:bold; color:#003087;">Activé le</td>
          <td style="padding:9px 14px;">${formatDate(data.activatedAt)}</td>
        </tr>
        <tr>
          <td style="padding:9px 14px; font-weight:bold; color:#003087;">Expire le</td>
          <td style="padding:9px 14px; color:#E30613; font-weight:bold;">${formatDate(data.expiresAt)}</td>
        </tr>
      </table>

      <div style="text-align:center; margin-bottom:24px;">
        <a href="${config.siteUrl}/dashboard"
           style="display:inline-block; background:#003087; color:#fff; text-decoration:none;
                  padding:13px 32px; border-radius:6px; font-size:15px; font-weight:bold;">
          Accéder à mon espace
        </a>
      </div>

      <p style="color:#888; font-size:12px; line-height:1.6; margin-top:8px;">
        Pour toute question, contactez-nous sur
        <a href="https://wa.me/${config.adminWhatsapp}" style="color:#555;">WhatsApp</a>
        ou à <a href="mailto:${config.adminEmail}" style="color:#555;">${config.adminEmail}</a>.
      </p>
    </div>

    <div style="background:#f5f5f5; padding:14px 32px; text-align:center; color:#888; font-size:12px;">
      © ${new Date().getFullYear()} TEF-LAB &nbsp;·&nbsp;
      <a href="${config.siteUrl}" style="color:#0055B3; text-decoration:none;">tef-lab.com</a>
    </div>
  </div>
</body>
</html>
`

  await transporter.sendMail({
    from: config.smtp.from,
    to: data.clientEmail,
    subject: `[TEF-LAB] Paiement confirmé — Pack ${data.packName}`,
    html,
  })
}

// ─── Template 6 : Pack expiré → Client ─────────────────────────────────────

export interface PackExpiredEmailData {
  clientName: string
  clientEmail: string
  packName: string
}

export async function sendPackExpiredEmail(data: PackExpiredEmailData): Promise<void> {
  const firstName = data.clientName.split(' ')[0]

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Votre pack TEF-LAB a expiré</title></head>
<body style="font-family:Arial,sans-serif; background:#f5f5f5; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

    <div style="background:#003087; padding:24px 32px;">
      <p style="color:#fff; margin:0; font-size:20px; font-weight:900;">TEF-LAB</p>
      <p style="color:#cce0ff; margin:6px 0 0; font-size:13px;">Information sur votre abonnement</p>
    </div>

    <div style="padding:32px;">
      <p style="color:#444; font-size:15px; margin-top:0;">Bonjour ${firstName},</p>
      <p style="color:#444; font-size:14px; line-height:1.7; margin-bottom:24px;">
        Votre pack <strong>${data.packName}</strong> est arrivé à expiration.
        Pour continuer votre préparation au TEF Canada, vous pouvez renouveler votre abonnement.
      </p>

      <div style="text-align:center; margin:28px 0;">
        <a href="${config.siteUrl}/packs"
           style="display:inline-block; background:#003087; color:#fff; text-decoration:none;
                  padding:13px 32px; border-radius:6px; font-size:15px; font-weight:bold;">
          Renouveler mon abonnement
        </a>
      </div>

      <p style="color:#888; font-size:12px; line-height:1.6; margin-top:8px;">
        Pour toute question, contactez-nous sur
        <a href="https://wa.me/${config.adminWhatsapp}" style="color:#555;">WhatsApp</a>
        ou à <a href="mailto:${config.adminEmail}" style="color:#555;">${config.adminEmail}</a>.
      </p>
    </div>

    <div style="background:#f5f5f5; padding:14px 32px; text-align:center; color:#888; font-size:12px;">
      © ${new Date().getFullYear()} TEF-LAB &nbsp;·&nbsp;
      <a href="${config.siteUrl}" style="color:#0055B3; text-decoration:none;">tef-lab.com</a>
    </div>
  </div>
</body>
</html>
`

  await transporter.sendMail({
    from: config.smtp.from,
    to: data.clientEmail,
    subject: `[TEF-LAB] Votre pack ${data.packName} est arrivé à expiration`,
    html,
  })
}

// ─── Template 7 : Paiement automatisé reçu → Admin ─────────────────────────

export interface AdminPaymentNotificationData {
  clientName: string
  clientEmail: string
  packName: string
  price: number
  reference: string
  paymentMethod: string
  activatedAt: Date
  expiresAt: Date
}

export async function sendAdminPaymentNotification(data: AdminPaymentNotificationData): Promise<void> {
  const formatDate = (d: Date) =>
    new Date(d).toLocaleString('fr-FR', {
      timeZone: 'Africa/Douala',
      dateStyle: 'long',
      timeStyle: 'short',
    })

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Paiement automatique – TEF-LAB</title></head>
<body style="font-family:Arial,sans-serif; background:#f5f5f5; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

    <div style="background:#003087; padding:24px 32px;">
      <p style="color:#fff; margin:0; font-size:20px; font-weight:900;">TEF-LAB</p>
      <p style="color:#cce0ff; margin:6px 0 0; font-size:13px;">Paiement automatique reçu</p>
    </div>

    <div style="padding:32px;">
      <div style="background:#f0fdf4; border-left:3px solid #22c55e; padding:12px 16px; border-radius:4px; margin-bottom:24px; font-size:14px; color:#166534;">
        Paiement confirmé via ${data.paymentMethod} — ${data.price.toLocaleString('fr-FR')} FCFA
      </div>

      <h3 style="color:#003087; font-size:14px; text-transform:uppercase; letter-spacing:0.5px; border-bottom:1px solid #e5e7eb; padding-bottom:8px; margin-bottom:16px;">Paiement</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:24px; font-size:14px;">
        <tr style="background:#f0f4ff;">
          <td style="padding:9px 14px; font-weight:bold; color:#003087; width:38%;">Référence</td>
          <td style="padding:9px 14px; font-family:monospace;">${data.reference}</td>
        </tr>
        <tr>
          <td style="padding:9px 14px; font-weight:bold; color:#003087;">Pack</td>
          <td style="padding:9px 14px; font-weight:bold;">${data.packName}</td>
        </tr>
        <tr style="background:#f0f4ff;">
          <td style="padding:9px 14px; font-weight:bold; color:#003087;">Montant</td>
          <td style="padding:9px 14px; font-weight:bold;">${data.price.toLocaleString('fr-FR')} FCFA</td>
        </tr>
        <tr>
          <td style="padding:9px 14px; font-weight:bold; color:#003087;">Méthode</td>
          <td style="padding:9px 14px;">${data.paymentMethod}</td>
        </tr>
        <tr style="background:#f0f4ff;">
          <td style="padding:9px 14px; font-weight:bold; color:#003087;">Activé le</td>
          <td style="padding:9px 14px;">${formatDate(data.activatedAt)}</td>
        </tr>
        <tr>
          <td style="padding:9px 14px; font-weight:bold; color:#003087;">Expire le</td>
          <td style="padding:9px 14px; color:#E30613; font-weight:bold;">${formatDate(data.expiresAt)}</td>
        </tr>
      </table>

      <h3 style="color:#003087; font-size:14px; text-transform:uppercase; letter-spacing:0.5px; border-bottom:1px solid #e5e7eb; padding-bottom:8px; margin-bottom:16px;">Client</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:28px; font-size:14px;">
        <tr style="background:#f0f4ff;">
          <td style="padding:9px 14px; font-weight:bold; color:#003087; width:38%;">Nom</td>
          <td style="padding:9px 14px;">${data.clientName}</td>
        </tr>
        <tr>
          <td style="padding:9px 14px; font-weight:bold; color:#003087;">Email</td>
          <td style="padding:9px 14px;"><a href="mailto:${data.clientEmail}" style="color:#0055B3;">${data.clientEmail}</a></td>
        </tr>
      </table>

      <div style="text-align:center;">
        <a href="${config.siteUrl}/admin/commandes"
           style="display:inline-block; background:#003087; color:#fff; text-decoration:none;
                  padding:12px 28px; border-radius:6px; font-size:14px;">
          Voir dans l'administration
        </a>
      </div>
    </div>

    <div style="background:#f5f5f5; padding:14px 32px; text-align:center; color:#888; font-size:12px;">
      © ${new Date().getFullYear()} TEF-LAB — Notification automatique
    </div>
  </div>
</body>
</html>
`

  await transporter.sendMail({
    from: config.smtp.from,
    to: config.adminEmail,
    subject: `[TEF-LAB] Paiement ${data.paymentMethod} — ${data.clientName} · ${data.packName} · ${data.price.toLocaleString('fr-FR')} FCFA`,
    html,
  })
}

// ─── Template 4 : Réinitialisation de mot de passe ─────────────────────────

export interface PasswordResetEmailData {
  name: string
  email: string
  resetUrl: string
}

export async function sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Réinitialisation de mot de passe – TEF-LAB</title></head>
<body style="font-family: Arial, sans-serif; background:#f5f5f5; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <!-- En-tête -->
    <div style="background:#003087; padding:24px 32px;">
      <h1 style="color:#fff; margin:0; font-size:22px; font-weight:900;">TEF-LAB</h1>
      <p style="color:#cce0ff; margin:6px 0 0;">Réinitialisation de mot de passe</p>
    </div>

    <!-- Corps -->
    <div style="padding:32px;">
      <h2 style="color:#003087; margin-top:0;">Bonjour ${data.name},</h2>
      <p style="color:#444; line-height:1.6;">
        Vous avez demandé la réinitialisation de votre mot de passe TEF-LAB.
        Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :
      </p>

      <!-- Bouton -->
      <div style="text-align:center; margin:32px 0;">
        <a href="${data.resetUrl}"
           style="display:inline-block; background:#003087; color:#fff; text-decoration:none;
                  padding:16px 40px; border-radius:8px; font-size:16px; font-weight:bold;
                  letter-spacing:0.5px;">
          Réinitialiser mon mot de passe
        </a>
      </div>

      <!-- Avertissements -->
      <div style="background:#fff3cd; border-left:4px solid #E30613; padding:12px 16px; border-radius:4px; margin-bottom:24px;">
        <p style="margin:0; color:#856404; font-size:14px; line-height:1.6;">
          <strong>⚠️ Ce lien expire dans 1 heure.</strong><br>
          Si vous n'avez pas fait cette demande, ignorez cet email — votre mot de passe reste inchangé.
        </p>
      </div>

      <!-- Lien texte de secours -->
      <p style="color:#888; font-size:12px; line-height:1.6;">
        Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
        <a href="${data.resetUrl}" style="color:#0055B3; word-break:break-all;">${data.resetUrl}</a>
      </p>
    </div>

    <!-- Pied de page -->
    <div style="background:#f5f5f5; padding:16px 32px; text-align:center; color:#888; font-size:12px;">
      © 2025 TEF-LAB · <a href="${config.siteUrl}" style="color:#0055B3; text-decoration:none;">tef-lab.com</a>
    </div>
  </div>
</body>
</html>
`

  await transporter.sendMail({
    from: config.smtp.from,
    to: data.email,
    subject: '[TEF-LAB] Réinitialisation de votre mot de passe',
    html,
  })
}

// ─── Template 8 : Bienvenue → Nouvel inscrit ────────────────────────────────

export interface WelcomeEmailData {
  name: string
  email: string
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
  const firstName = data.name.split(' ')[0]

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Bienvenue sur TEF-LAB</title></head>
<body style="font-family:Arial,sans-serif; background:#f5f5f5; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

    <div style="background:#003087; padding:24px 32px;">
      <p style="color:#fff; margin:0; font-size:20px; font-weight:900;">TEF-LAB</p>
      <p style="color:#cce0ff; margin:6px 0 0; font-size:13px;">Préparation au TEF Canada</p>
    </div>

    <div style="padding:32px;">
      <p style="color:#444; font-size:15px; margin-top:0;">Bonjour ${firstName},</p>
      <p style="color:#444; font-size:14px; line-height:1.7; margin-bottom:24px;">
        Votre compte TEF-LAB a été créé. Vous avez accès aux séries gratuites de
        Compréhension Écrite (CE) et Compréhension Orale (CO) dès maintenant.
      </p>

      <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:6px; padding:18px 20px; margin-bottom:24px;">
        <p style="margin:0 0 10px; font-size:13px; font-weight:bold; color:#003087; text-transform:uppercase; letter-spacing:0.5px;">Inclus avec votre compte gratuit</p>
        <ul style="margin:0; padding-left:18px; color:#444; font-size:14px; line-height:2;">
          <li>Séries CE et CO disponibles immédiatement</li>
          <li>Résultats et niveau CECRL après chaque série</li>
          <li>Suivi de progression</li>
        </ul>
      </div>

      <div style="text-align:center; margin:24px 0;">
        <a href="${config.siteUrl}/dashboard"
           style="display:inline-block; background:#003087; color:#fff; text-decoration:none;
                  padding:13px 32px; border-radius:6px; font-size:15px; font-weight:bold;">
          Accéder à mon espace
        </a>
      </div>

      <p style="color:#666; font-size:13px; line-height:1.6; margin-bottom:0;">
        Pour accéder aux modules Expression Écrite et Expression Orale, consultez nos
        <a href="${config.siteUrl}/packs" style="color:#003087;">packs de préparation</a>.
      </p>

      <p style="color:#888; font-size:12px; line-height:1.6; margin-top:20px;">
        Pour toute question, contactez-nous sur
        <a href="https://wa.me/${config.adminWhatsapp}" style="color:#555;">WhatsApp</a>
        ou à <a href="mailto:${config.adminEmail}" style="color:#555;">${config.adminEmail}</a>.
      </p>
    </div>

    <div style="background:#f5f5f5; padding:14px 32px; text-align:center; color:#888; font-size:12px;">
      © ${new Date().getFullYear()} TEF-LAB &nbsp;·&nbsp;
      <a href="${config.siteUrl}" style="color:#0055B3; text-decoration:none;">tef-lab.com</a>
    </div>
  </div>
</body>
</html>
`

  await transporter.sendMail({
    from: config.smtp.from,
    to: data.email,
    subject: '[TEF-LAB] Votre compte est créé',
    html,
  })
}

// ─── Template 3 : Commande rejetée → Client ────────────────────────────────

export async function sendOrderRejectedEmail(data: OrderRejectedEmailData): Promise<void> {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Commande non traitée – TEF-LAB</title></head>
<body style="font-family:Arial,sans-serif; background:#f5f5f5; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

    <div style="background:#003087; padding:24px 32px;">
      <p style="color:#fff; margin:0; font-size:20px; font-weight:900;">TEF-LAB</p>
      <p style="color:#cce0ff; margin:6px 0 0; font-size:13px;">Mise à jour de votre commande</p>
    </div>

    <div style="padding:32px;">
      <p style="color:#444; font-size:15px; margin-top:0;">Bonjour ${data.visitorName},</p>
      <p style="color:#444; font-size:14px; line-height:1.7; margin-bottom:20px;">
        Votre commande pour le pack <strong>${data.packName}</strong> n'a pas pu être traitée.
        Si vous avez effectué un paiement, contactez-nous pour régularisation.
      </p>

      <div style="background:#fef2f2; border:1px solid #fca5a5; border-radius:6px; padding:14px 18px; margin-bottom:24px; text-align:center;">
        <p style="margin:0 0 4px; font-size:12px; color:#666; text-transform:uppercase; letter-spacing:0.8px;">Référence</p>
        <p style="margin:0; font-size:16px; font-family:monospace; font-weight:bold; color:#E30613;">${data.reference}</p>
      </div>

      <div style="margin:24px 0;">
        <a href="https://wa.me/${config.adminWhatsapp}?text=${encodeURIComponent(`Bonjour, je vous contacte au sujet de ma commande (réf. ${data.reference}) pour le pack ${data.packName}.`)}"
           style="display:inline-block; background:#25D366; color:#fff; text-decoration:none;
                  padding:11px 22px; border-radius:6px; font-size:14px; font-weight:bold; margin-right:10px;">
          Contacter sur WhatsApp
        </a>
      </div>
      <p style="font-size:13px; color:#444; margin-top:4px;">
        Ou par email : <a href="mailto:${config.adminEmail}" style="color:#0055B3;">${config.adminEmail}</a>
      </p>
    </div>

    <div style="background:#f5f5f5; padding:14px 32px; text-align:center; color:#888; font-size:12px;">
      © ${new Date().getFullYear()} TEF-LAB &nbsp;·&nbsp;
      <a href="${config.siteUrl}" style="color:#0055B3; text-decoration:none;">tef-lab.com</a>
    </div>
  </div>
</body>
</html>
`

  await transporter.sendMail({
    from: config.smtp.from,
    to: data.visitorEmail,
    subject: `[TEF-LAB] Commande ${data.reference} — paiement non confirmé`,
    html,
  })
}

// ─── Template 9 : Rappel quotidien → Abonnés actifs ─────────────────────────

export interface DailyPracticeReminderData {
  clientName: string
  clientEmail: string
  packName: string
  moduleAccess: 'FREE' | 'EE_EO' | 'ALL'
  daysLeft?: number
}

export async function sendDailyPracticeReminder(data: DailyPracticeReminderData): Promise<void> {
  const firstName = data.clientName.split(' ')[0]
  const siteUrl = config.siteUrl

  const modulesAvailable =
    data.moduleAccess === 'ALL'
      ? 'CE, CO, EE, EO (tous les modules)'
      : 'EE, EO (Expression Écrite et Orale)'

  const expiryNotice = data.daysLeft !== undefined && data.daysLeft <= 5
    ? `<div style="background:#fffbeb; border-left:3px solid #f59e0b; padding:12px 16px; border-radius:4px; margin-bottom:20px; font-size:13px; color:#78350f;">
        Votre pack ${data.packName} expire dans ${data.daysLeft} jour${data.daysLeft > 1 ? 's' : ''}.
        <a href="${siteUrl}/packs" style="color:#78350f; font-weight:bold; display:inline-block; margin-top:4px;">Renouveler mon abonnement</a>
      </div>`
    : ''

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Rappel de pratique – TEF-LAB</title></head>
<body style="font-family:Arial,sans-serif; background:#f5f5f5; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

    <div style="background:#003087; padding:24px 32px;">
      <p style="color:#fff; margin:0; font-size:20px; font-weight:900;">TEF-LAB</p>
      <p style="color:#cce0ff; margin:6px 0 0; font-size:13px;">Rappel de pratique quotidienne</p>
    </div>

    <div style="padding:32px;">
      <p style="color:#444; font-size:15px; margin-top:0;">Bonjour ${firstName},</p>

      ${expiryNotice}

      <p style="color:#444; font-size:14px; line-height:1.7; margin-bottom:20px;">
        Votre pack <strong>${data.packName}</strong> vous donne accès aux modules ${modulesAvailable}.
        Prenez quelques minutes aujourd'hui pour vous entraîner.
      </p>

      <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:6px; padding:16px 20px; margin-bottom:24px;">
        <p style="margin:0 0 10px; font-size:13px; font-weight:bold; color:#003087; text-transform:uppercase; letter-spacing:0.5px;">Conseils pour votre session</p>
        <ul style="margin:0; padding-left:18px; color:#444; font-size:13px; line-height:2;">
          <li>Travaillez dans le silence pour simuler les conditions d'examen</li>
          <li>Visez au moins une série complète par session</li>
          <li>Lisez votre résultat après chaque série pour identifier vos axes d'amélioration</li>
        </ul>
      </div>

      <div style="text-align:center; margin:24px 0;">
        <a href="${siteUrl}/dashboard"
           style="display:inline-block; background:#003087; color:#fff; text-decoration:none;
                  padding:13px 32px; border-radius:6px; font-size:15px; font-weight:bold;">
          Commencer ma session
        </a>
      </div>

      <p style="color:#888; font-size:12px; line-height:1.6; margin-top:8px;">
        Pour toute question, contactez-nous sur
        <a href="https://wa.me/${config.adminWhatsapp}" style="color:#555;">WhatsApp</a>
        ou à <a href="mailto:${config.adminEmail}" style="color:#555;">${config.adminEmail}</a>.
      </p>
    </div>

    <div style="background:#f5f5f5; padding:14px 32px; text-align:center; color:#888; font-size:12px;">
      © ${new Date().getFullYear()} TEF-LAB &nbsp;·&nbsp;
      <a href="${siteUrl}" style="color:#0055B3; text-decoration:none;">tef-lab.com</a>
    </div>
  </div>
</body>
</html>
`

  await transporter.sendMail({
    from: config.smtp.from,
    to: data.clientEmail,
    subject: `[TEF-LAB] Rappel — votre session du jour`,
    html,
  })
}

// ─── Template 11 : Email J-0 → Jour de l'examen ────────────────────────────

export interface ExamDayEmailData {
  clientName: string
  clientEmail: string
  targets: { CE?: string | null; CO?: string | null; EE?: string | null; EO?: string | null }
}

export async function sendExamDayEmail(data: ExamDayEmailData): Promise<void> {
  const firstName = data.clientName.split(' ')[0]
  const siteUrl = config.siteUrl

  const targetLines = Object.entries(data.targets)
    .filter(([, v]) => v)
    .map(([mod, level]) => `<li style="margin:4px 0;"><strong>${mod}</strong> : objectif ${level}</li>`)
    .join('')

  const targetsBlock = targetLines
    ? `<div style="background:#f0f4ff; border:1px solid #c3d3f0; border-radius:6px; padding:16px 20px; margin-bottom:24px;">
        <p style="margin:0 0 8px; font-size:13px; font-weight:bold; color:#003087; text-transform:uppercase; letter-spacing:0.5px;">Vos objectifs du jour</p>
        <ul style="margin:0; padding-left:18px; color:#444; font-size:14px; line-height:1.8;">${targetLines}</ul>
      </div>`
    : ''

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>C'est le grand jour – TEF-LAB</title></head>
<body style="font-family:Arial,sans-serif; background:#f5f5f5; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

    <div style="background:#003087; padding:24px 32px;">
      <p style="color:#fff; margin:0; font-size:20px; font-weight:900;">TEF-LAB</p>
      <p style="color:#cce0ff; margin:6px 0 0; font-size:13px;">Conseils de dernière minute</p>
    </div>

    <div style="padding:32px;">
      <p style="color:#003087; font-size:20px; font-weight:bold; margin-top:0;">Bon courage, ${firstName} !</p>
      <p style="color:#444; font-size:14px; line-height:1.7; margin-bottom:20px;">
        C'est le grand jour. Toute l'équipe TEF-LAB est avec vous.
        Voici quelques conseils pratiques pour aborder l'examen sereinement.
      </p>

      ${targetsBlock}

      <h3 style="color:#003087; font-size:14px; text-transform:uppercase; letter-spacing:0.5px; border-bottom:1px solid #e5e7eb; padding-bottom:8px; margin:24px 0 16px;">Avant l'examen</h3>
      <ul style="color:#444; font-size:14px; line-height:2; padding-left:18px; margin-bottom:20px;">
        <li>Arrivez <strong>30 minutes en avance</strong> — inutile de stresser à la dernière minute</li>
        <li>Apportez une <strong>pièce d'identité valide</strong> (carte nationale ou passeport)</li>
        <li>Mangez léger, hydratez-vous et respirez profondément</li>
        <li>Éteignez votre téléphone avant d'entrer dans la salle</li>
      </ul>

      <h3 style="color:#003087; font-size:14px; text-transform:uppercase; letter-spacing:0.5px; border-bottom:1px solid #e5e7eb; padding-bottom:8px; margin:24px 0 16px;">Pendant les épreuves</h3>
      <ul style="color:#444; font-size:14px; line-height:2; padding-left:18px; margin-bottom:20px;">
        <li><strong>CE</strong> : lisez les questions <em>avant</em> le texte — cherchez les mots-clés</li>
        <li><strong>CO</strong> : l'audio ne se joue qu'une fois — notez les informations essentielles dès la 1ʳᵉ écoute</li>
        <li><strong>EE</strong> : respectez les minimums (80 mots T1 · 200 mots T2), réservez 5 min pour relire</li>
        <li><strong>EO</strong> : parlez clairement, ne cherchez pas la perfection, montrez votre aisance</li>
      </ul>

      <div style="background:#f0fdf4; border-left:3px solid #22c55e; padding:14px 18px; border-radius:4px; margin:24px 0; font-size:14px; color:#166534; line-height:1.7;">
        <strong>Rappel :</strong> en cas de doute sur une question, passez à la suivante et revenez-y si le temps le permet.
        Une question sans réponse vaut 0, une réponse hasardeuse a une chance sur 4 — tentez votre chance.
      </div>

      <div style="text-align:center; margin:28px 0 12px;">
        <p style="color:#003087; font-size:16px; font-weight:bold; margin:0 0 8px;">Vous avez préparé, vous êtes prêt(e).</p>
        <p style="color:#555; font-size:14px; margin:0;">On croit en vous — allez chercher ce score !</p>
      </div>

      <p style="color:#888; font-size:12px; line-height:1.6; margin-top:28px;">
        Pour toute question après l'examen, contactez-nous sur
        <a href="https://wa.me/${config.adminWhatsapp}" style="color:#555;">WhatsApp</a>.
      </p>
    </div>

    <div style="background:#f5f5f5; padding:14px 32px; text-align:center; color:#888; font-size:12px;">
      © ${new Date().getFullYear()} TEF-LAB &nbsp;·&nbsp;
      <a href="${siteUrl}" style="color:#0055B3; text-decoration:none;">tef-lab.com</a>
    </div>
  </div>
</body>
</html>
`

  await transporter.sendMail({
    from: config.smtp.from,
    to: data.clientEmail,
    subject: `[TEF-LAB] Bon courage ${firstName} — c'est le jour de votre TEF Canada !`,
    html,
  })
}

// ─── Template 12 : Résultat IA vs objectif → Abonné ─────────────────────────

export interface AIResultEmailData {
  clientName: string
  clientEmail: string
  moduleCode: 'EE' | 'EO'
  moduleName: string
  cecrlLevel: string
  targetLevel: string
  metTarget: boolean
  seriesTitle: string
}

export async function sendAIResultEmail(data: AIResultEmailData): Promise<void> {
  const firstName = data.clientName.split(' ')[0]
  const siteUrl = config.siteUrl

  const CECRL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const gapLevels = CECRL_ORDER.indexOf(data.targetLevel) - CECRL_ORDER.indexOf(data.cecrlLevel)

  const headline = data.metTarget
    ? `Objectif ${data.targetLevel} atteint en ${data.moduleName} !`
    : `Vous progressez en ${data.moduleName}`

  const resultColor = data.metTarget ? '#22c55e' : '#003087'
  const resultBg = data.metTarget ? '#f0fdf4' : '#f0f4ff'
  const resultBorder = data.metTarget ? '#86efac' : '#c3d3f0'

  const bodyText = data.metTarget
    ? `Bravo ! Votre correction IA pour la série <strong>${data.seriesTitle}</strong> affiche un niveau <strong>${data.cecrlLevel}</strong> — vous avez atteint votre objectif ${data.targetLevel} pour le ${data.moduleName}.`
    : `Votre correction IA pour la série <strong>${data.seriesTitle}</strong> indique un niveau <strong>${data.cecrlLevel}</strong> (objectif : ${data.targetLevel}).
       Il reste ${gapLevels === 1 ? 'un niveau' : `${gapLevels} niveaux`} à franchir — c'est tout à fait atteignable avec de la pratique régulière.`

  const encouragement = data.metTarget
    ? `<div style="background:#f0fdf4; border-left:3px solid #22c55e; padding:14px 18px; border-radius:4px; margin:20px 0; font-size:14px; color:#166534; line-height:1.7;">
        Excellent travail ! Essayez de maintenir ce niveau sur les prochaines séries.
        Si ce n'est pas déjà fait, définissez un objectif plus ambitieux pour continuer à progresser.
      </div>`
    : `<div style="background:#fffbeb; border-left:3px solid #f59e0b; padding:14px 18px; border-radius:4px; margin:20px 0; font-size:14px; color:#78350f; line-height:1.7;">
        <strong>Conseil :</strong> relisez les textes corrigés par l'IA et notez les structures que vous n'avez pas maîtrisées.
        Refaites une série dans 24h en appliquant ces corrections — le progrès sera visible rapidement.
      </div>`

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Résultat IA – ${data.moduleName} – TEF-LAB</title></head>
<body style="font-family:Arial,sans-serif; background:#f5f5f5; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

    <div style="background:#003087; padding:24px 32px;">
      <p style="color:#fff; margin:0; font-size:20px; font-weight:900;">TEF-LAB</p>
      <p style="color:#cce0ff; margin:6px 0 0; font-size:13px;">Résultat de correction IA · ${data.moduleName}</p>
    </div>

    <div style="padding:32px;">
      <p style="color:#444; font-size:15px; margin-top:0;">Bonjour ${firstName},</p>

      <div style="background:${resultBg}; border:1px solid ${resultBorder}; border-radius:8px; padding:20px 24px; margin:20px 0; text-align:center;">
        <p style="margin:0 0 6px; font-size:13px; color:#666; text-transform:uppercase; letter-spacing:0.8px;">${headline}</p>
        <p style="margin:0; font-size:32px; font-weight:900; color:${resultColor};">${data.cecrlLevel}</p>
        ${!data.metTarget ? `<p style="margin:6px 0 0; font-size:12px; color:#666;">Objectif : ${data.targetLevel}</p>` : ''}
      </div>

      <p style="color:#444; font-size:14px; line-height:1.7; margin-bottom:16px;">${bodyText}</p>

      ${encouragement}

      <div style="text-align:center; margin:24px 0;">
        <a href="${siteUrl}/dashboard"
           style="display:inline-block; background:#003087; color:#fff; text-decoration:none;
                  padding:13px 32px; border-radius:6px; font-size:15px; font-weight:bold;">
          Continuer ma préparation
        </a>
      </div>

      <p style="color:#888; font-size:12px; line-height:1.6; margin-top:8px;">
        Pour toute question, contactez-nous sur
        <a href="https://wa.me/${config.adminWhatsapp}" style="color:#555;">WhatsApp</a>
        ou à <a href="mailto:${config.adminEmail}" style="color:#555;">${config.adminEmail}</a>.
      </p>
    </div>

    <div style="background:#f5f5f5; padding:14px 32px; text-align:center; color:#888; font-size:12px;">
      © ${new Date().getFullYear()} TEF-LAB &nbsp;·&nbsp;
      <a href="${siteUrl}" style="color:#0055B3; text-decoration:none;">tef-lab.com</a>
    </div>
  </div>
</body>
</html>
`

  await transporter.sendMail({
    from: config.smtp.from,
    to: data.clientEmail,
    subject: data.metTarget
      ? `[TEF-LAB] Objectif ${data.targetLevel} atteint en ${data.moduleName} !`
      : `[TEF-LAB] Votre résultat IA en ${data.moduleName} — niveau ${data.cecrlLevel}`,
    html,
  })
}

// ─── Template 10 : Rappel upgrade → Utilisateurs gratuits ──────────────────

export interface PackSummary {
  name: string
  price: number
  durationDays: number
  isRecommended: boolean
}

export interface DailyUpgradeReminderData {
  clientName: string
  clientEmail: string
  packs: PackSummary[]
  discountRate?: number
}

export async function sendDailyUpgradeReminder(data: DailyUpgradeReminderData): Promise<void> {
  const firstName = data.clientName.split(' ')[0]
  const siteUrl = config.siteUrl
  const discount = data.discountRate ?? 0

  const packsRows = data.packs.map((pack) => {
    const finalPrice = discount > 0
      ? Math.round(pack.price * (1 - discount / 100))
      : pack.price
    const discountBadge = discount > 0
      ? ` <span style="color:#E30613; font-size:11px; font-weight:bold;">-${discount}%</span>`
      : ''
    const rec = pack.isRecommended
    return `
          <tr>
            <td style="padding:6px 0; font-weight:bold;${rec ? ' color:#003087;' : ''}">
              ${pack.name}${rec ? ' ⭐' : ''}
            </td>
            <td style="padding:6px 0; text-align:right;${rec ? ' color:#003087; font-weight:bold;' : ''}">
              ${finalPrice.toLocaleString('fr-FR')} FCFA / ${pack.durationDays} j${discountBadge}
            </td>
          </tr>`
  }).join('')

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>TEF-LAB – Modules disponibles</title></head>
<body style="font-family:Arial,sans-serif; background:#f5f5f5; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

    <div style="background:#003087; padding:24px 32px;">
      <p style="color:#fff; margin:0; font-size:20px; font-weight:900;">TEF-LAB</p>
      <p style="color:#cce0ff; margin:6px 0 0; font-size:13px;">Préparation au TEF Canada</p>
    </div>

    <div style="padding:32px;">
      <p style="color:#444; font-size:15px; margin-top:0;">Bonjour ${firstName},</p>
      <p style="color:#444; font-size:14px; line-height:1.7; margin-bottom:24px;">
        Avec votre compte gratuit, vous avez accès aux séries de Compréhension Écrite (CE)
        et Compréhension Orale (CO). Les modules Expression Écrite (EE) et Expression Orale (EO)
        sont disponibles dans les packs payants.
      </p>

      <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:6px; padding:18px 20px; margin-bottom:24px;">
        <p style="margin:0 0 12px; font-size:13px; font-weight:bold; color:#003087; text-transform:uppercase; letter-spacing:0.5px;">Ce que vous débloquez avec un pack</p>
        <ul style="margin:0; padding-left:18px; color:#444; font-size:14px; line-height:2;">
          <li>Expression Écrite (EE) — rédaction et correction par intelligence artificielle</li>
          <li>Expression Orale (EO) — simulation et évaluation</li>
          <li>Toutes les séries CE et CO avancées</li>
          <li>Score CECRL et NCLC après chaque série</li>
        </ul>
      </div>

      ${data.packs.length > 0 ? `
      <div style="background:#f0f4ff; border:1px solid #c3d3f0; border-radius:6px; padding:16px 20px; margin-bottom:24px;">
        <p style="margin:0 0 10px; font-size:13px; font-weight:bold; color:#003087;">Tarifs disponibles</p>
        <table style="width:100%; border-collapse:collapse; font-size:13px; color:#444;">
          ${packsRows}
        </table>
      </div>` : ''}

      <div style="text-align:center; margin:24px 0;">
        <a href="${siteUrl}/packs"
           style="display:inline-block; background:#003087; color:#fff; text-decoration:none;
                  padding:13px 32px; border-radius:6px; font-size:15px; font-weight:bold;">
          Voir tous les packs
        </a>
      </div>

      <p style="color:#666; font-size:13px; line-height:1.6; margin-bottom:0;">
        Paiement accepté via Orange Money, MTN Mobile Money et PayPal.
      </p>

      <p style="color:#888; font-size:12px; line-height:1.6; margin-top:20px;">
        Pour toute question, contactez-nous sur
        <a href="https://wa.me/${config.adminWhatsapp}" style="color:#555;">WhatsApp</a>
        ou à <a href="mailto:${config.adminEmail}" style="color:#555;">${config.adminEmail}</a>.
      </p>
    </div>

    <div style="background:#f5f5f5; padding:14px 32px; text-align:center; color:#888; font-size:12px;">
      © ${new Date().getFullYear()} TEF-LAB &nbsp;·&nbsp;
      <a href="${siteUrl}" style="color:#0055B3; text-decoration:none;">tef-lab.com</a>
    </div>
  </div>
</body>
</html>
`

  await transporter.sendMail({
    from: config.smtp.from,
    to: data.clientEmail,
    subject: `[TEF-LAB] Accédez aux 4 modules du TEF Canada`,
    html,
  })
}

// ─── Template 14 : Email groupé admin → tous les inscrits ─────────────────

export interface BroadcastEmailData {
  clientName: string
  clientEmail: string
  subject: string
  htmlBody: string // HTML déjà formaté par l'admin
}

export async function sendBroadcastEmail(data: BroadcastEmailData): Promise<void> {
  const firstName = data.clientName.split(' ')[0]

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>${data.subject}</title></head>
<body style="font-family:Arial,sans-serif; background:#f5f5f5; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

    <div style="background:#003087; padding:24px 32px;">
      <p style="color:#fff; margin:0; font-size:20px; font-weight:900;">TEF-LAB</p>
      <p style="color:#cce0ff; margin:6px 0 0; font-size:13px;">Préparation au TEF Canada</p>
    </div>

    <div style="padding:32px;">
      <p style="color:#444; font-size:15px; margin-top:0;">Bonjour ${firstName},</p>
      <div style="color:#444; font-size:14px; line-height:1.8;">
        ${data.htmlBody}
      </div>
    </div>

    <div style="background:#f9fafb; border-top:1px solid #e5e7eb; padding:20px 32px; text-align:center;">
      <p style="color:#999; font-size:11px; margin:0;">
        © ${new Date().getFullYear()} TEF-LAB · Préparation au TEF Canada<br>
        Vous recevez cet email car vous êtes inscrit(e) sur la plateforme TEF-LAB.
      </p>
    </div>

  </div>
</body>
</html>
`

  await transporter.sendMail({
    from: config.smtp.from,
    to: data.clientEmail,
    subject: data.subject,
    html,
  })
}
