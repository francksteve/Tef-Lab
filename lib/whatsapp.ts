export function generateVisitorToAdminLink(data: {
  packName: string
  visitorName: string
  visitorEmail: string
  reference: string
  price: number
}): string {
  const message =
    `Bonjour, je vous contacte depuis TEF-LAB. 🙏\n\n` +
    `Je m'appelle *${data.visitorName}* et je viens d'effectuer une demande d'abonnement sur la plateforme.\n\n` +
    `Voici les détails de ma commande :\n` +
    `• 📋 Référence : *${data.reference}*\n` +
    `• 📦 Pack : *${data.packName}*\n` +
    `• 💰 Montant : *${data.price.toLocaleString('fr-FR')} FCFA*\n` +
    `• 📧 Email : ${data.visitorEmail}\n\n` +
    `Je reste disponible pour tout renseignement complémentaire. Merci ! 😊`
  return `https://wa.me/237683008287?text=${encodeURIComponent(message)}`
}

export function generateAdminToClientLink(data: {
  clientPhone: string
  clientFirstName: string
  packName: string
  price: number
}): string {
  const phone = data.clientPhone.replace(/\+/g, '').replace(/\s/g, '')
  const message = `Bonjour ${data.clientFirstName}, nous avons bien reçu votre commande pour le pack ${data.packName} sur TEF-LAB. Veuillez nous envoyer la preuve de paiement de ${data.price} FCFA. Merci !`
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
