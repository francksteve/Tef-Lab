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
<head><meta charset="UTF-8"><title>Nouvelle commande – Tef-Lab</title></head>
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
      © 2025 Tef-Lab · <a href="${config.siteUrl}" style="color:#0055B3; text-decoration:none;">tef-lab.com</a>
    </div>
  </div>
</body>
</html>
`

  await transporter.sendMail({
    from: config.smtp.from,
    to: config.adminEmail,
    subject: `[Tef-Lab] Nouvelle commande ${data.reference} – ${data.packName}`,
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
<head><meta charset="UTF-8"><title>Votre compte Tef-Lab est activé</title></head>
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
        Votre compte Tef-Lab est maintenant actif. Voici vos identifiants de connexion :
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
      © 2025 Tef-Lab · <a href="${config.siteUrl}" style="color:#0055B3; text-decoration:none;">tef-lab.com</a>
    </div>
  </div>
</body>
</html>
`

  await transporter.sendMail({
    from: config.smtp.from,
    to: data.visitorEmail,
    subject: `[Tef-Lab] Votre compte est activé – Bienvenue ${data.visitorName} !`,
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

export async function sendOrderRejectedEmail(data: OrderRejectedEmailData): Promise<void> {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Commande non validée – Tef-Lab</title></head>
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
      © 2025 Tef-Lab · <a href="${config.siteUrl}" style="color:#0055B3; text-decoration:none;">tef-lab.com</a>
    </div>
  </div>
</body>
</html>
`

  await transporter.sendMail({
    from: config.smtp.from,
    to: data.visitorEmail,
    subject: `[Tef-Lab] Votre commande ${data.reference} n'a pas pu être validée`,
    html,
  })
}
