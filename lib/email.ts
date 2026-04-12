import nodemailer from 'nodemailer'
import { config } from './config'
import { generateAdminToClientLink } from './whatsapp'

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
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
<body style="font-family: Arial, sans-serif; background:#f5f5f5; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <!-- En-tête -->
    <div style="background:#003087; padding:24px 32px;">
      <h1 style="color:#fff; margin:0; font-size:22px;">
        <span style="color:#fff; font-weight:900;">TEF CAN</span><span style="color:#E30613; font-weight:900;">237</span>
      </h1>
      <p style="color:#cce0ff; margin:6px 0 0;">Nouvelle commande reçue</p>
    </div>

    <!-- Corps -->
    <div style="padding:32px;">
      <h2 style="color:#003087; margin-top:0;">Une nouvelle commande vient d'être passée</h2>

      <!-- Détails commande -->
      <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
        <tr style="background:#f0f4ff;">
          <td style="padding:10px 14px; font-weight:bold; color:#003087; width:40%;">Référence</td>
          <td style="padding:10px 14px; font-family:monospace; font-size:15px; font-weight:bold;">${data.reference}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px; font-weight:bold; color:#003087;">Pack commandé</td>
          <td style="padding:10px 14px;">${data.packName}</td>
        </tr>
        <tr style="background:#f0f4ff;">
          <td style="padding:10px 14px; font-weight:bold; color:#003087;">Montant</td>
          <td style="padding:10px 14px; font-weight:bold; color:#003087;">${data.price.toLocaleString('fr-FR')} FCFA</td>
        </tr>
        <tr>
          <td style="padding:10px 14px; font-weight:bold; color:#003087;">Date</td>
          <td style="padding:10px 14px;">${formattedDate}</td>
        </tr>
      </table>

      <!-- Infos client -->
      <h3 style="color:#003087; border-bottom:2px solid #E30613; padding-bottom:8px;">Informations client</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
        <tr style="background:#f0f4ff;">
          <td style="padding:10px 14px; font-weight:bold; color:#003087; width:40%;">Nom</td>
          <td style="padding:10px 14px;">${data.visitorName}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px; font-weight:bold; color:#003087;">Email</td>
          <td style="padding:10px 14px;"><a href="mailto:${data.visitorEmail}" style="color:#0055B3;">${data.visitorEmail}</a></td>
        </tr>
        <tr style="background:#f0f4ff;">
          <td style="padding:10px 14px; font-weight:bold; color:#003087;">WhatsApp / Tél.</td>
          <td style="padding:10px 14px;">${data.visitorPhone}</td>
        </tr>
        ${
          data.visitorMessage
            ? `<tr>
          <td style="padding:10px 14px; font-weight:bold; color:#003087; vertical-align:top;">Message</td>
          <td style="padding:10px 14px; font-style:italic;">${data.visitorMessage}</td>
        </tr>`
            : ''
        }
      </table>

      <!-- Bouton WhatsApp -->
      <div style="text-align:center; margin:28px 0;">
        <a href="${waLink}"
           style="display:inline-block; background:#25D366; color:#fff; text-decoration:none;
                  padding:14px 32px; border-radius:6px; font-size:16px; font-weight:bold;">
          Contacter le client sur WhatsApp
        </a>
      </div>

      <!-- Lien admin -->
      <div style="text-align:center; margin-bottom:8px;">
        <a href="${config.siteUrl}/admin/commandes"
           style="display:inline-block; background:#003087; color:#fff; text-decoration:none;
                  padding:12px 28px; border-radius:6px; font-size:15px;">
          Gérer la commande dans l'admin
        </a>
      </div>
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
    to: config.adminEmail,
    subject: `[TEF-LAB] Nouvelle commande ${data.reference} – ${data.packName}`,
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
<body style="font-family: Arial, sans-serif; background:#f5f5f5; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <!-- En-tête -->
    <div style="background:#003087; padding:24px 32px;">
      <h1 style="color:#fff; margin:0; font-size:22px;">
        <span style="color:#fff; font-weight:900;">TEF CAN</span><span style="color:#E30613; font-weight:900;">237</span>
      </h1>
      <p style="color:#cce0ff; margin:6px 0 0;">Votre accès est prêt !</p>
    </div>

    <!-- Corps -->
    <div style="padding:32px;">
      <h2 style="color:#003087; margin-top:0;">Félicitations, ${data.visitorName} !</h2>
      <p style="color:#444; line-height:1.6;">
        Votre commande pour le pack <strong>${data.packName}</strong> a été validée.
        Votre compte TEF-LAB est maintenant actif. Voici vos identifiants de connexion :
      </p>

      <!-- Identifiants -->
      <div style="background:#f0f4ff; border:2px solid #003087; border-radius:8px; padding:20px; margin:24px 0; text-align:center;">
        <p style="margin:0 0 8px; font-size:13px; color:#666; text-transform:uppercase; letter-spacing:1px;">Vos identifiants</p>
        <p style="margin:4px 0; font-size:16px;"><strong>Email :</strong> ${data.visitorEmail}</p>
        <p style="margin:4px 0; font-size:20px; font-family:monospace; letter-spacing:2px; color:#003087;">
          <strong>Mot de passe :</strong> ${data.tempPassword}
        </p>
      </div>

      <!-- Avertissement changement de mot de passe -->
      <div style="background:#fff3cd; border-left:4px solid #E30613; padding:12px 16px; border-radius:4px; margin-bottom:24px;">
        <p style="margin:0; color:#856404; font-size:14px;">
          <strong>Important :</strong> Ce mot de passe est temporaire. Vous devrez le modifier lors de votre première connexion.
        </p>
      </div>

      <!-- Bouton connexion -->
      <div style="text-align:center; margin:24px 0;">
        <a href="${config.siteUrl}/connexion"
           style="display:inline-block; background:#003087; color:#fff; text-decoration:none;
                  padding:14px 36px; border-radius:6px; font-size:16px; font-weight:bold;">
          Se connecter maintenant
        </a>
      </div>

      <!-- Détails du pack -->
      <h3 style="color:#003087; border-bottom:2px solid #E30613; padding-bottom:8px;">Détails de votre abonnement</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
        <tr style="background:#f0f4ff;">
          <td style="padding:10px 14px; font-weight:bold; color:#003087; width:40%;">Pack</td>
          <td style="padding:10px 14px;">${data.packName}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px; font-weight:bold; color:#003087;">Valide du</td>
          <td style="padding:10px 14px;">${formatDate(data.activatedAt)}</td>
        </tr>
        <tr style="background:#f0f4ff;">
          <td style="padding:10px 14px; font-weight:bold; color:#003087;">Jusqu'au</td>
          <td style="padding:10px 14px; font-weight:bold; color:#E30613;">${formatDate(data.expiresAt)}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px; font-weight:bold; color:#003087; vertical-align:top;">Modules inclus</td>
          <td style="padding:10px 14px;"><ul style="margin:0; padding-left:18px;">${modulesList}</ul></td>
        </tr>
      </table>

      <p style="color:#666; font-size:14px; line-height:1.6;">
        En cas de problème, contactez-nous sur WhatsApp au
        <a href="https://wa.me/${config.adminWhatsapp}" style="color:#25D366; font-weight:bold;">+237 683 008 287</a>
        ou par email à
        <a href="mailto:${config.adminEmail}" style="color:#0055B3;">${config.adminEmail}</a>.
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
    to: data.visitorEmail,
    subject: `[TEF-LAB] Votre compte est activé – Bienvenue ${data.visitorName} !`,
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
<body style="font-family: Arial, sans-serif; background:#f5f5f5; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <!-- En-tête -->
    <div style="background:#003087; padding:24px 32px;">
      <h1 style="color:#fff; margin:0; font-size:22px; font-weight:900;">TEF-LAB</h1>
      <p style="color:#cce0ff; margin:6px 0 0;">Confirmation de paiement</p>
    </div>

    <!-- Corps -->
    <div style="padding:32px;">
      <!-- Icône succès -->
      <div style="text-align:center; margin-bottom:24px;">
        <div style="width:64px; height:64px; background:#d1fae5; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:28px;">✅</div>
      </div>

      <h2 style="color:#003087; margin-top:0; text-align:center;">Pack activé avec succès !</h2>

      <!-- Message personnalisé -->
      <div style="background:#f0fff4; border-left:4px solid #22c55e; border-radius:4px; padding:16px 20px; margin-bottom:24px;">
        <p style="margin:0; color:#15803d; font-size:16px; line-height:1.7;">
          Salut <strong>${firstName}</strong>,<br>
          Vous venez d'activer le pack <strong>${data.packName}</strong> —
          ceci vous a coûté <strong>${data.price.toLocaleString('fr-FR')} FCFA</strong>.<br>
          Merci de votre confiance.<br>
          <em>La team TEF-LAB</em>
        </p>
      </div>

      <!-- Récapitulatif -->
      <div style="background:#f0f4ff; border-radius:8px; padding:20px; margin-bottom:24px;">
        <h3 style="color:#003087; margin:0 0 16px; font-size:15px; text-transform:uppercase; letter-spacing:0.5px;">Récapitulatif de votre abonnement</h3>
        <table style="width:100%; border-collapse:collapse;">
          <tr style="border-bottom:1px solid #dde6ff;">
            <td style="padding:10px 0; font-weight:bold; color:#003087; width:40%;">Pack</td>
            <td style="padding:10px 0; font-weight:bold; color:#003087;">${data.packName}</td>
          </tr>
          <tr style="border-bottom:1px solid #dde6ff;">
            <td style="padding:10px 0; font-weight:bold; color:#555;">Montant payé</td>
            <td style="padding:10px 0; font-weight:bold; color:#003087;">${data.price.toLocaleString('fr-FR')} FCFA</td>
          </tr>
          <tr style="border-bottom:1px solid #dde6ff;">
            <td style="padding:10px 0; font-weight:bold; color:#555;">Référence</td>
            <td style="padding:10px 0; font-family:monospace; font-size:13px;">${data.reference}</td>
          </tr>
          <tr style="border-bottom:1px solid #dde6ff;">
            <td style="padding:10px 0; font-weight:bold; color:#555;">Modules inclus</td>
            <td style="padding:10px 0;">${modulesLabel}</td>
          </tr>
          <tr style="border-bottom:1px solid #dde6ff;">
            <td style="padding:10px 0; font-weight:bold; color:#555;">Activé le</td>
            <td style="padding:10px 0;">${formatDate(data.activatedAt)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0; font-weight:bold; color:#555;">Expire le</td>
            <td style="padding:10px 0; font-weight:bold; color:#E30613;">${formatDate(data.expiresAt)}</td>
          </tr>
        </table>
      </div>

      <!-- Bouton -->
      <div style="text-align:center; margin:28px 0 16px;">
        <a href="${config.siteUrl}/dashboard"
           style="display:inline-block; background:#003087; color:#fff; text-decoration:none;
                  padding:16px 40px; border-radius:8px; font-size:16px; font-weight:bold;">
          Accéder à mon espace
        </a>
      </div>

      <p style="color:#666; font-size:13px; line-height:1.6; text-align:center;">
        Une question ? Contactez-nous sur WhatsApp au
        <a href="https://wa.me/${config.adminWhatsapp}" style="color:#25D366; font-weight:bold;">+237 683 008 287</a>
      </p>
    </div>

    <!-- Pied de page -->
    <div style="background:#f5f5f5; padding:16px 32px; text-align:center; color:#888; font-size:12px;">
      © ${new Date().getFullYear()} TEF-LAB · <a href="${config.siteUrl}" style="color:#0055B3; text-decoration:none;">tef-lab.com</a>
    </div>
  </div>
</body>
</html>
`

  await transporter.sendMail({
    from: config.smtp.from,
    to: data.clientEmail,
    subject: `[TEF-LAB] ✅ Pack ${data.packName} activé — Merci !`,
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
<body style="font-family: Arial, sans-serif; background:#f5f5f5; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <!-- En-tête -->
    <div style="background:#003087; padding:24px 32px;">
      <h1 style="color:#fff; margin:0; font-size:22px; font-weight:900;">TEF-LAB</h1>
      <p style="color:#cce0ff; margin:6px 0 0;">Information sur votre abonnement</p>
    </div>

    <!-- Corps -->
    <div style="padding:32px;">
      <div style="text-align:center; margin-bottom:24px;">
        <div style="width:64px; height:64px; background:#fef2f2; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:28px;">⏰</div>
      </div>

      <h2 style="color:#E30613; margin-top:0; text-align:center;">Votre pack a expiré</h2>

      <!-- Message personnalisé -->
      <div style="background:#fef2f2; border-left:4px solid #E30613; border-radius:4px; padding:16px 20px; margin-bottom:24px;">
        <p style="margin:0; color:#991b1b; font-size:16px; line-height:1.7;">
          Salut <strong>${firstName}</strong>,<br>
          Votre pack <strong>${data.packName}</strong> est arrivé à expiration.<br>
          Bien vouloir le renouveler pour continuer votre formation.<br>
          Merci de votre confiance.<br>
          <em>La team TEF-LAB</em>
        </p>
      </div>

      <!-- Bouton renouvellement -->
      <div style="text-align:center; margin:28px 0 16px;">
        <a href="${config.siteUrl}/packs"
           style="display:inline-block; background:#E30613; color:#fff; text-decoration:none;
                  padding:16px 40px; border-radius:8px; font-size:16px; font-weight:bold;">
          Renouveler mon pack →
        </a>
      </div>

      <p style="color:#666; font-size:13px; line-height:1.6; text-align:center;">
        Des questions sur le renouvellement ? Contactez-nous sur WhatsApp au<br>
        <a href="https://wa.me/${config.adminWhatsapp}" style="color:#25D366; font-weight:bold;">+237 683 008 287</a>
      </p>
    </div>

    <!-- Pied de page -->
    <div style="background:#f5f5f5; padding:16px 32px; text-align:center; color:#888; font-size:12px;">
      © ${new Date().getFullYear()} TEF-LAB · <a href="${config.siteUrl}" style="color:#0055B3; text-decoration:none;">tef-lab.com</a>
    </div>
  </div>
</body>
</html>
`

  await transporter.sendMail({
    from: config.smtp.from,
    to: data.clientEmail,
    subject: `[TEF-LAB] ⏰ Votre pack ${data.packName} a expiré — Renouvelez maintenant`,
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
<head><meta charset="UTF-8"><title>Nouveau paiement automatique – TEF-LAB</title></head>
<body style="font-family: Arial, sans-serif; background:#f5f5f5; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <!-- En-tête -->
    <div style="background:#003087; padding:24px 32px;">
      <h1 style="color:#fff; margin:0; font-size:22px; font-weight:900;">TEF-LAB</h1>
      <p style="color:#cce0ff; margin:6px 0 0;">💳 Nouveau paiement automatique reçu</p>
    </div>

    <!-- Corps -->
    <div style="padding:32px;">
      <div style="background:#d1fae5; border-left:4px solid #22c55e; border-radius:4px; padding:14px 18px; margin-bottom:24px;">
        <p style="margin:0; color:#166534; font-size:15px; font-weight:bold;">
          ✅ Paiement confirmé via ${data.paymentMethod} — ${data.price.toLocaleString('fr-FR')} FCFA
        </p>
      </div>

      <h3 style="color:#003087; border-bottom:2px solid #E30613; padding-bottom:8px;">Détails du paiement</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
        <tr style="background:#f0f4ff;">
          <td style="padding:10px 14px; font-weight:bold; color:#003087; width:40%;">Référence</td>
          <td style="padding:10px 14px; font-family:monospace;">${data.reference}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px; font-weight:bold; color:#003087;">Pack</td>
          <td style="padding:10px 14px; font-weight:bold;">${data.packName}</td>
        </tr>
        <tr style="background:#f0f4ff;">
          <td style="padding:10px 14px; font-weight:bold; color:#003087;">Montant</td>
          <td style="padding:10px 14px; font-weight:bold; color:#003087; font-size:16px;">${data.price.toLocaleString('fr-FR')} FCFA</td>
        </tr>
        <tr>
          <td style="padding:10px 14px; font-weight:bold; color:#003087;">Méthode</td>
          <td style="padding:10px 14px;">${data.paymentMethod}</td>
        </tr>
        <tr style="background:#f0f4ff;">
          <td style="padding:10px 14px; font-weight:bold; color:#003087;">Activé le</td>
          <td style="padding:10px 14px;">${formatDate(data.activatedAt)}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px; font-weight:bold; color:#003087;">Expire le</td>
          <td style="padding:10px 14px; color:#E30613; font-weight:bold;">${formatDate(data.expiresAt)}</td>
        </tr>
      </table>

      <h3 style="color:#003087; border-bottom:2px solid #E30613; padding-bottom:8px;">Informations client</h3>
      <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
        <tr style="background:#f0f4ff;">
          <td style="padding:10px 14px; font-weight:bold; color:#003087; width:40%;">Nom</td>
          <td style="padding:10px 14px;">${data.clientName}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px; font-weight:bold; color:#003087;">Email</td>
          <td style="padding:10px 14px;"><a href="mailto:${data.clientEmail}" style="color:#0055B3;">${data.clientEmail}</a></td>
        </tr>
      </table>

      <div style="text-align:center;">
        <a href="${config.siteUrl}/admin/commandes"
           style="display:inline-block; background:#003087; color:#fff; text-decoration:none;
                  padding:12px 28px; border-radius:6px; font-size:15px;">
          Voir dans l'administration →
        </a>
      </div>
    </div>

    <!-- Pied de page -->
    <div style="background:#f5f5f5; padding:16px 32px; text-align:center; color:#888; font-size:12px;">
      © ${new Date().getFullYear()} TEF-LAB — Notification automatique
    </div>
  </div>
</body>
</html>
`

  await transporter.sendMail({
    from: config.smtp.from,
    to: config.adminEmail,
    subject: `[TEF-LAB] 💳 Paiement reçu — ${data.clientName} · Pack ${data.packName} · ${data.price.toLocaleString('fr-FR')} FCFA`,
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
<body style="font-family: Arial, sans-serif; background:#f5f5f5; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div style="background:#003087; padding:24px 32px;">
      <h1 style="color:#fff; margin:0; font-size:22px; font-weight:900;">TEF-LAB</h1>
      <p style="color:#cce0ff; margin:6px 0 0;">Bienvenue dans ta préparation TEF Canada</p>
    </div>
    <div style="padding:32px;">
      <div style="text-align:center; margin-bottom:24px;">
        <div style="width:64px; height:64px; background:#dbeafe; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:28px;">🎉</div>
      </div>
      <h2 style="color:#003087; margin-top:0; text-align:center;">Compte créé avec succès !</h2>
      <div style="background:#f0f4ff; border-left:4px solid #003087; border-radius:4px; padding:16px 20px; margin-bottom:24px;">
        <p style="margin:0; color:#1e3a8a; font-size:16px; line-height:1.7;">
          Salut <strong>${firstName}</strong>,<br>
          Ton compte TEF-LAB est maintenant actif. Tu peux commencer immédiatement
          à t'entraîner sur les séries gratuites de Compréhension Écrite (CE)
          et Compréhension Orale (CO).<br><br>
          Pour accéder aux modules Expression Écrite (EE) et Expression Orale (EO),
          choisis un pack adapté à tes objectifs.<br><br>
          <em>Bonne préparation ! — La team TEF-LAB</em>
        </p>
      </div>
      <div style="background:#f9fafb; border-radius:8px; padding:20px; margin-bottom:24px;">
        <h3 style="color:#003087; margin:0 0 14px; font-size:14px; text-transform:uppercase; letter-spacing:0.5px;">Avec ton compte gratuit</h3>
        <ul style="margin:0; padding-left:20px; color:#444; font-size:14px; line-height:2;">
          <li>Séries CE et CO gratuites disponibles immédiatement</li>
          <li>Suivi de ta progression en temps réel</li>
          <li>Résultats et niveau CECRL après chaque série</li>
        </ul>
      </div>
      <div style="text-align:center; margin:28px 0 16px;">
        <a href="${config.siteUrl}/dashboard"
           style="display:inline-block; background:#003087; color:#fff; text-decoration:none;
                  padding:16px 40px; border-radius:8px; font-size:16px; font-weight:bold;">
          Accéder à mon espace →
        </a>
      </div>
      <p style="color:#666; font-size:13px; line-height:1.6; text-align:center;">
        Une question ? Contactez-nous sur WhatsApp au
        <a href="https://wa.me/${config.adminWhatsapp}" style="color:#25D366; font-weight:bold;">+237 683 008 287</a>
      </p>
    </div>
    <div style="background:#f5f5f5; padding:16px 32px; text-align:center; color:#888; font-size:12px;">
      © ${new Date().getFullYear()} TEF-LAB · <a href="${config.siteUrl}" style="color:#0055B3; text-decoration:none;">tef-lab.com</a>
    </div>
  </div>
</body>
</html>
`

  await transporter.sendMail({
    from: config.smtp.from,
    to: data.email,
    subject: '[TEF-LAB] Bienvenue ! Ton compte est prêt',
    html,
  })
}

// ─── Template 3 : Commande rejetée → Client ────────────────────────────────

export async function sendOrderRejectedEmail(data: OrderRejectedEmailData): Promise<void> {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Commande non validée – TEF-LAB</title></head>
<body style="font-family: Arial, sans-serif; background:#f5f5f5; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <!-- En-tête -->
    <div style="background:#003087; padding:24px 32px;">
      <h1 style="color:#fff; margin:0; font-size:22px;">
        <span style="color:#fff; font-weight:900;">TEF CAN</span><span style="color:#E30613; font-weight:900;">237</span>
      </h1>
      <p style="color:#cce0ff; margin:6px 0 0;">Mise à jour de votre commande</p>
    </div>

    <!-- Corps -->
    <div style="padding:32px;">
      <h2 style="color:#E30613; margin-top:0;">Commande non validée</h2>
      <p style="color:#444; line-height:1.6;">
        Bonjour ${data.visitorName},
      </p>
      <p style="color:#444; line-height:1.6;">
        Nous avons le regret de vous informer que votre commande pour le pack
        <strong>${data.packName}</strong> n'a pas pu être validée.
      </p>

      <!-- Référence -->
      <div style="background:#fff3f3; border:1px solid #E30613; border-radius:8px; padding:16px; margin:20px 0; text-align:center;">
        <p style="margin:0; font-size:13px; color:#666; text-transform:uppercase; letter-spacing:1px;">Référence de commande</p>
        <p style="margin:8px 0 0; font-size:18px; font-family:monospace; font-weight:bold; color:#E30613;">${data.reference}</p>
      </div>

      <p style="color:#444; line-height:1.6;">
        Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez régulariser votre paiement,
        contactez-nous directement :
      </p>

      <!-- Contacts -->
      <div style="display:flex; gap:16px; margin:20px 0;">
        <a href="https://wa.me/${config.adminWhatsapp}?text=${encodeURIComponent(`Bonjour, je vous contacte au sujet de ma commande rejetée (réf. ${data.reference}) pour le pack ${data.packName}.`)}"
           style="display:inline-block; background:#25D366; color:#fff; text-decoration:none;
                  padding:12px 24px; border-radius:6px; font-size:15px; font-weight:bold; margin-right:12px;">
          WhatsApp : +237 683 008 287
        </a>
      </div>
      <p style="color:#444; font-size:14px;">
        Email :
        <a href="mailto:${config.adminEmail}" style="color:#0055B3;">${config.adminEmail}</a>
      </p>

      <p style="color:#666; font-size:14px; line-height:1.6; margin-top:24px;">
        Nous restons disponibles pour vous accompagner dans votre préparation au TEF Canada.
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
    to: data.visitorEmail,
    subject: `[TEF-LAB] Votre commande ${data.reference} n'a pas pu être validée`,
    html,
  })
}

// ─── Template 9 : Rappel quotidien pratique → Abonnés actifs ────────────────

export interface DailyPracticeReminderData {
  clientName: string
  clientEmail: string
  packName: string
  moduleAccess: 'FREE' | 'EE_EO' | 'ALL'
  daysLeft?: number // jours restants avant expiration
}

export async function sendDailyPracticeReminder(data: DailyPracticeReminderData): Promise<void> {
  const firstName = data.clientName.split(' ')[0]
  const siteUrl = config.siteUrl

  const modulesAvailable =
    data.moduleAccess === 'ALL'
      ? ['Compréhension Écrite (CE)', 'Compréhension Orale (CO)', 'Expression Écrite (EE)', 'Expression Orale (EO)']
      : ['Expression Écrite (EE)', 'Expression Orale (EO)']

  const moduleCardsArr = modulesAvailable.map((mod) => {
    const [label, code] = mod.match(/^(.+?)\s+\((\w+)\)$/)?.slice(1) ?? [mod, '']
    const colors: Record<string, string> = { CE: '#003087', CO: '#0055B3', EE: '#1a7f5e', EO: '#7c3aed' }
    const icons: Record<string, string> = { CE: '📖', CO: '🎧', EE: '✍️', EO: '🎙️' }
    const bg = colors[code] ?? '#003087'
    const icon = icons[code] ?? '📚'
    return `
    <td style="width:50%; padding:8px; vertical-align:top;">
      <div style="background:${bg}; border-radius:10px; padding:16px 12px; text-align:center;">
        <div style="font-size:24px; margin-bottom:6px;">${icon}</div>
        <div style="color:#fff; font-weight:bold; font-size:13px; line-height:1.4;">${label}</div>
        <div style="color:rgba(255,255,255,0.7); font-size:11px; margin-top:4px;">${code}</div>
      </div>
    </td>`
  })

  const expiryWarning = data.daysLeft !== undefined && data.daysLeft <= 5
    ? `<div style="background:#fff7ed; border-left:4px solid #f97316; border-radius:4px; padding:14px 18px; margin-bottom:24px;">
        <p style="margin:0; color:#c2410c; font-size:14px;">
          ⚠️ <strong>Votre pack ${data.packName} expire dans ${data.daysLeft} jour${data.daysLeft > 1 ? 's' : ''}</strong> — pensez à renouveler pour ne pas perdre votre accès.
          <a href="${siteUrl}/packs" style="color:#c2410c; font-weight:bold; display:block; margin-top:6px;">→ Renouveler mon abonnement</a>
        </p>
      </div>`
    : ''

  const motivations = [
    'Chaque session compte. Les candidats qui s\'entraînent quotidiennement progressent 3× plus vite.',
    'La régularité est la clé du succès au TEF Canada. Une session par jour suffit !',
    'Les meilleurs scores TEF Canada s\'obtiennent par la pratique régulière. À vous de jouer !',
    'Votre cerveau consolide mieux les acquis quand vous pratiquez chaque jour à la même heure.',
    'Chaque question résolue vous rapproche de votre objectif d\'immigration au Canada.',
  ]
  const motivation = motivations[new Date().getDay() % motivations.length]

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre session TEF-LAB du jour</title>
</head>
<body style="font-family:'Segoe UI',Arial,sans-serif; background:#f0f4f8; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto;">

    <!-- Logo + En-tête -->
    <div style="background:linear-gradient(135deg,#003087 0%,#0055B3 100%); border-radius:12px 12px 0 0; padding:28px 32px; text-align:center;">
      <h1 style="color:#fff; margin:0; font-size:26px; font-weight:900; letter-spacing:-0.5px;">
        TEF<span style="color:#E30613;">-</span>LAB
      </h1>
      <p style="color:#cce0ff; margin:6px 0 0; font-size:14px;">Votre préparation TEF Canada au quotidien</p>
    </div>

    <!-- Bandeau heure + date -->
    <div style="background:#E30613; padding:10px 32px; text-align:center;">
      <p style="color:#fff; margin:0; font-size:13px; font-weight:600; letter-spacing:0.5px;">
        🌅 RAPPEL DU MATIN — ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
      </p>
    </div>

    <!-- Corps principal -->
    <div style="background:#fff; padding:32px; border-left:1px solid #e2e8f0; border-right:1px solid #e2e8f0;">

      ${expiryWarning}

      <!-- Accroche personnalisée -->
      <h2 style="color:#003087; margin-top:0; font-size:20px;">Bonjour ${firstName} 👋</h2>
      <p style="color:#475569; font-size:15px; line-height:1.7; margin-bottom:20px;">
        C'est l'heure de votre session quotidienne ! Votre pack <strong style="color:#003087;">${data.packName}</strong>
        vous donne accès à ${modulesAvailable.length === 4 ? 'tous les modules du TEF Canada' : 'l\'Expression Écrite et Orale'}.
        Profitez-en dès maintenant.
      </p>

      <!-- Citation motivation -->
      <div style="background:#f8faff; border-left:4px solid #003087; border-radius:0 8px 8px 0; padding:14px 20px; margin-bottom:28px;">
        <p style="margin:0; color:#003087; font-style:italic; font-size:14px; line-height:1.6;">
          💡 ${motivation}
        </p>
      </div>

      <!-- Modules disponibles -->
      <h3 style="color:#003087; font-size:15px; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:16px;">
        Vos modules disponibles
      </h3>
      <table style="width:100%; border-collapse:separate; border-spacing:0; margin-bottom:28px;">
        <tr>${moduleCardsArr.slice(0, 2).join('')}</tr>
        ${modulesAvailable.length > 2 ? `<tr style="margin-top:0;">${moduleCardsArr.slice(2, 4).join('')}</tr>` : ''}
      </table>

      <!-- CTA principal -->
      <div style="text-align:center; margin-bottom:28px;">
        <a href="${siteUrl}/dashboard"
           style="display:inline-block; background:#003087; color:#fff; font-weight:bold; font-size:16px;
                  padding:16px 40px; border-radius:8px; text-decoration:none; letter-spacing:0.3px;
                  box-shadow:0 4px 12px rgba(0,48,135,0.3);">
          🚀 Commencer ma session du jour
        </a>
      </div>

      <!-- Modules TEF rappel rapide -->
      <div style="background:#f8faff; border-radius:8px; padding:18px 20px; margin-bottom:8px;">
        <p style="margin:0 0 10px; color:#64748b; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.4px;">
          Conseils pour votre session
        </p>
        <ul style="margin:0; padding-left:18px; color:#475569; font-size:13px; line-height:2;">
          <li>Faites au moins <strong>1 série complète</strong> par session (40 min – 1h)</li>
          <li>Entraînez-vous dans le <strong>silence</strong> pour simuler les conditions réelles</li>
          <li>Consultez vos <strong>résultats</strong> après chaque série pour cibler vos lacunes</li>
          <li>Pour l'EO, pratiquez à voix haute même si vous êtes seul(e)</li>
        </ul>
      </div>
    </div>

    <!-- Pied de page -->
    <div style="background:#1e293b; border-radius:0 0 12px 12px; padding:20px 32px; text-align:center;">
      <p style="color:#94a3b8; font-size:12px; margin:0 0 8px;">
        Des questions ? Écrivez-nous sur
        <a href="https://wa.me/${config.adminWhatsapp}" style="color:#25D366; text-decoration:none; font-weight:bold;">WhatsApp</a>
        ou à <a href="mailto:${config.adminEmail}" style="color:#93c5fd; text-decoration:none;">${config.adminEmail}</a>
      </p>
      <p style="color:#64748b; font-size:11px; margin:0;">
        © ${new Date().getFullYear()} TEF-LAB ·
        <a href="${siteUrl}" style="color:#64748b; text-decoration:none;">tef-lab.com</a>
      </p>
    </div>

  </div>
</body>
</html>`

  await transporter.sendMail({
    from: config.smtp.from,
    to: data.clientEmail,
    subject: `🎯 ${firstName}, c'est l'heure de votre session TEF Canada !`,
    html,
  })
}

// ─── Template 10 : Rappel quotidien upgrade → Utilisateurs gratuits ──────────

export interface DailyUpgradeReminderData {
  clientName: string
  clientEmail: string
}

export async function sendDailyUpgradeReminder(data: DailyUpgradeReminderData): Promise<void> {
  const firstName = data.clientName.split(' ')[0]
  const siteUrl = config.siteUrl

  const lockedFeatures = [
    { icon: '✍️', label: 'Expression Écrite (EE)', desc: 'Rédaction + correction IA', locked: true },
    { icon: '🎙️', label: 'Expression Orale (EO)', desc: 'Simulation + IA conversationnelle', locked: true },
    { icon: '📊', label: '30+ séries avancées', desc: 'Toutes les séries CE & CO', locked: true },
    { icon: '🤖', label: 'Correction IA', desc: 'Feedback détaillé sur vos textes', locked: true },
  ]

  const lockedCards = lockedFeatures.map(f => `
    <tr>
      <td style="padding:12px 14px; font-size:18px; width:40px;">${f.icon}</td>
      <td style="padding:12px 0;">
        <div style="font-weight:bold; color:#1e293b; font-size:14px;">${f.label}</div>
        <div style="color:#64748b; font-size:12px; margin-top:2px;">${f.desc}</div>
      </td>
      <td style="padding:12px 14px; text-align:right;">
        <span style="background:#fef2f2; color:#E30613; font-size:11px; font-weight:bold;
                     padding:3px 10px; border-radius:20px; white-space:nowrap;">🔒 Verrouillé</span>
      </td>
    </tr>`).join('<tr><td colspan="3" style="padding:0; border-bottom:1px solid #f1f5f9;"></td></tr>')

  const packs = [
    { name: 'Essai', price: '5 000', modules: 'Tous modules', duration: '30j', ia: '2/j', recommended: false },
    { name: 'Silver ⭐', price: '25 000', modules: 'Tous modules', duration: '30j', ia: '10/j', recommended: true },
    { name: 'Bronze', price: '10 000', modules: 'Tous modules', duration: '30j', ia: '3/j', recommended: false },
  ]

  const packCards = packs.map(p => `
    <td style="width:33%; padding:6px; vertical-align:top;">
      <div style="border:${p.recommended ? '2px solid #003087' : '1px solid #e2e8f0'};
                  border-radius:10px; padding:16px 12px; text-align:center;
                  background:${p.recommended ? '#f0f4ff' : '#fff'}; position:relative;">
        ${p.recommended ? '<div style="background:#003087; color:#fff; font-size:10px; font-weight:bold; padding:2px 10px; border-radius:10px; display:inline-block; margin-bottom:8px;">RECOMMANDÉ</div>' : '<div style="height:22px;"></div>'}
        <div style="font-weight:900; color:#003087; font-size:15px; margin-bottom:4px;">${p.name}</div>
        <div style="font-size:20px; font-weight:bold; color:#E30613; margin-bottom:4px;">${p.price} <span style="font-size:11px; color:#64748b;">FCFA</span></div>
        <div style="font-size:11px; color:#64748b; line-height:1.8;">
          ${p.modules}<br>${p.duration} · IA ${p.ia}
        </div>
      </div>
    </td>`).join('')

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Débloquez votre potentiel TEF-LAB</title>
</head>
<body style="font-family:'Segoe UI',Arial,sans-serif; background:#f0f4f8; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto;">

    <!-- Logo + En-tête -->
    <div style="background:linear-gradient(135deg,#003087 0%,#0055B3 100%); border-radius:12px 12px 0 0; padding:28px 32px; text-align:center;">
      <h1 style="color:#fff; margin:0; font-size:26px; font-weight:900; letter-spacing:-0.5px;">
        TEF<span style="color:#E30613;">-</span>LAB
      </h1>
      <p style="color:#cce0ff; margin:6px 0 0; font-size:14px;">Votre préparation TEF Canada au quotidien</p>
    </div>

    <!-- Bandeau accroche -->
    <div style="background:#E30613; padding:10px 32px; text-align:center;">
      <p style="color:#fff; margin:0; font-size:13px; font-weight:600; letter-spacing:0.5px;">
        🚀 PASSEZ AU NIVEAU SUPÉRIEUR · OFFRE DISPONIBLE MAINTENANT
      </p>
    </div>

    <!-- Corps principal -->
    <div style="background:#fff; padding:32px; border-left:1px solid #e2e8f0; border-right:1px solid #e2e8f0;">

      <!-- Accroche personnalisée -->
      <h2 style="color:#003087; margin-top:0; font-size:20px;">Bonjour ${firstName} 👋</h2>
      <p style="color:#475569; font-size:15px; line-height:1.7; margin-bottom:24px;">
        Vous avez un compte gratuit sur TEF-LAB — c'est un bon début !
        Mais pour maximiser vos chances à l'examen, vous avez besoin d'accéder aux <strong>4 modules officiels</strong>
        du TEF Canada, notamment l'Expression Écrite et l'Expression Orale.
      </p>

      <!-- Ce que vous manquez -->
      <div style="background:#fafafa; border:1px solid #f1f5f9; border-radius:10px; overflow:hidden; margin-bottom:28px;">
        <div style="background:#1e293b; padding:12px 18px;">
          <p style="margin:0; color:#fff; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">
            🔒 Fonctionnalités verrouillées sur votre compte
          </p>
        </div>
        <table style="width:100%; border-collapse:collapse;">
          ${lockedCards}
        </table>
      </div>

      <!-- Comparaison packs -->
      <h3 style="color:#003087; font-size:15px; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:16px;">
        Choisissez votre pack
      </h3>
      <table style="width:100%; border-collapse:separate; border-spacing:0; margin-bottom:28px;">
        <tr>${packCards}</tr>
      </table>

      <!-- CTA principal -->
      <div style="text-align:center; margin-bottom:24px;">
        <a href="${siteUrl}/packs"
           style="display:inline-block; background:#E30613; color:#fff; font-weight:bold; font-size:16px;
                  padding:16px 40px; border-radius:8px; text-decoration:none; letter-spacing:0.3px;
                  box-shadow:0 4px 12px rgba(227,6,19,0.35);">
          Voir tous les packs →
        </a>
        <p style="color:#94a3b8; font-size:12px; margin:10px 0 0;">
          Paiement sécurisé via NotchPay (Mobile Money) ou PayPal
        </p>
      </div>

      <!-- Modes de paiement -->
      <div style="background:#f8faff; border-radius:8px; padding:16px 20px; text-align:center; margin-bottom:8px;">
        <p style="margin:0 0 8px; color:#64748b; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.3px;">
          Moyens de paiement acceptés
        </p>
        <p style="margin:0; font-size:14px; color:#475569; line-height:2;">
          📱 <strong>Orange Money</strong> &nbsp;·&nbsp; 📱 <strong>MTN Mobile Money</strong>
          &nbsp;·&nbsp; 💳 <strong>PayPal</strong> (USD)
        </p>
      </div>

      <!-- Preuve sociale -->
      <div style="border-top:1px solid #f1f5f9; padding-top:20px; margin-top:20px;">
        <p style="color:#64748b; font-size:13px; text-align:center; line-height:1.6; margin:0;">
          Des milliers de candidats camerounais ont déjà obtenu leur score TEF grâce à TEF-LAB.
          <strong style="color:#003087;">Commencez votre préparation complète aujourd'hui.</strong>
        </p>
      </div>
    </div>

    <!-- Pied de page -->
    <div style="background:#1e293b; border-radius:0 0 12px 12px; padding:20px 32px; text-align:center;">
      <p style="color:#94a3b8; font-size:12px; margin:0 0 8px;">
        Questions ? Contactez-nous sur
        <a href="https://wa.me/${config.adminWhatsapp}" style="color:#25D366; text-decoration:none; font-weight:bold;">WhatsApp</a>
        ou à <a href="mailto:${config.adminEmail}" style="color:#93c5fd; text-decoration:none;">${config.adminEmail}</a>
      </p>
      <p style="color:#64748b; font-size:11px; margin:0;">
        © ${new Date().getFullYear()} TEF-LAB ·
        <a href="${siteUrl}" style="color:#64748b; text-decoration:none;">tef-lab.com</a>
      </p>
    </div>

  </div>
</body>
</html>`

  await transporter.sendMail({
    from: config.smtp.from,
    to: data.clientEmail,
    subject: `🎓 ${firstName}, débloquez votre potentiel TEF Canada dès aujourd'hui`,
    html,
  })
}
