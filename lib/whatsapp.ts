export function generateVisitorToAdminLink(data: {
  packName: string
  visitorName: string
  visitorEmail: string
  reference: string
  price: number
}): string {
  const message = `Bonjour, je souhaite commander le pack ${data.packName} sur Tef-Lab. Mon nom est ${data.visitorName}, mon email est ${data.visitorEmail}. Référence commande : ${data.reference}. Montant : ${data.price} FCFA.`
  return `https://wa.me/237683008287?text=${encodeURIComponent(message)}`
}

export function generateAdminToClientLink(data: {
  clientPhone: string
  clientFirstName: string
  packName: string
  price: number
}): string {
  const phone = data.clientPhone.replace(/\+/g, '').replace(/\s/g, '')
  const message = `Bonjour ${data.clientFirstName}, nous avons bien reçu votre commande pour le pack ${data.packName} sur Tef-Lab. Veuillez nous envoyer la preuve de paiement de ${data.price} FCFA. Merci !`
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
