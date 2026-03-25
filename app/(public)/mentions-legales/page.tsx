import Link from 'next/link'

export const metadata = {
  title: 'Mentions légales — TEF-LAB',
  description: 'Conditions d\'utilisation, politique de confidentialité et mentions légales de la plateforme TEF-LAB.',
}

const sections = [
  {
    id: 'editeur',
    title: '1. Éditeur de la plateforme',
    content: (
      <>
        <p>
          La plateforme <strong>TEF-LAB</strong> est un service en ligne de préparation au Test d&apos;Évaluation
          de Français Canada (TEF Canada), édité par un particulier établi au Cameroun.
        </p>
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li><strong>Nom commercial :</strong> TEF-LAB</li>
          <li><strong>Responsable de publication :</strong> Administrateur TEF-LAB</li>
          <li><strong>Adresse électronique :</strong> tifuzzied@gmail.com</li>
          <li><strong>Téléphone / WhatsApp :</strong> +237 683 008 287</li>
          <li><strong>Site web :</strong> https://tef-lab.com</li>
        </ul>
      </>
    ),
  },
  {
    id: 'hebergement',
    title: '2. Hébergement',
    content: (
      <>
        <p>
          TEF-LAB est hébergé sur des infrastructures cloud internationales reconnues pour leur fiabilité et leur sécurité.
          Les données de la plateforme sont stockées via <strong>Supabase</strong> (base de données et fichiers média)
          et le service est déployé sur <strong>Vercel</strong>.
        </p>
        <p className="mt-2">
          Ces prestataires appliquent leurs propres politiques de confidentialité et de sécurité, consultables
          directement sur leurs sites officiels respectifs.
        </p>
      </>
    ),
  },
  {
    id: 'acceptation',
    title: '3. Acceptation des conditions',
    content: (
      <>
        <p>
          En accédant à TEF-LAB, que ce soit pour consulter du contenu gratuit ou dans le cadre d&apos;un abonnement payant,
          vous reconnaissez avoir pris connaissance des présentes mentions légales et vous engagez à les respecter.
        </p>
        <p className="mt-2">
          Si vous n&apos;acceptez pas ces conditions, nous vous invitons à ne pas utiliser la plateforme.
          L&apos;utilisation continuée du service après toute mise à jour de ces mentions vaut acceptation des nouvelles conditions.
        </p>
      </>
    ),
  },
  {
    id: 'services',
    title: '4. Description des services',
    content: (
      <>
        <p>
          TEF-LAB propose une plateforme d&apos;entraînement au TEF Canada comprenant :
        </p>
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li>Des séries d&apos;exercices couvrant les quatre modules officiels : Compréhension Écrite (CE), Compréhension Orale (CO), Expression Écrite (EE) et Expression Orale (EO)</li>
          <li>Un système de correction automatisé pour les modules CE et CO</li>
          <li>Une correction par intelligence artificielle pour les modules EE et EO (soumise à quota selon le pack choisi)</li>
          <li>Un accès à du contenu gratuit sans inscription requise pour certaines séries</li>
          <li>Des abonnements payants donnant accès à un catalogue élargi de séries</li>
        </ul>
        <p className="mt-3">
          TEF-LAB est une plateforme de préparation indépendante. Elle n&apos;est ni affiliée, ni accréditée, ni
          approuvée par l&apos;Institut français du Canada, le Centre de Langue Française (CCI Paris Île-de-France)
          ni par Immigration, Réfugiés et Citoyenneté Canada (IRCC). Les résultats obtenus sur TEF-LAB sont
          indicatifs et ne constituent en aucun cas un résultat officiel.
        </p>
      </>
    ),
  },
  {
    id: 'compte',
    title: '5. Création de compte et responsabilités',
    content: (
      <>
        <p>
          L&apos;inscription sur TEF-LAB est ouverte à toute personne physique majeure (18 ans et plus). En créant
          un compte, vous vous engagez à :
        </p>
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li>Fournir des informations exactes et à jour lors de votre inscription</li>
          <li>Garder vos identifiants de connexion confidentiels et ne pas les partager</li>
          <li>Ne pas créer plusieurs comptes afin de contourner les restrictions d&apos;accès</li>
          <li>Signaler immédiatement tout accès non autorisé à votre compte</li>
          <li>Utiliser la plateforme uniquement à des fins personnelles et non commerciales</li>
        </ul>
        <p className="mt-3">
          Tout abus constaté (utilisation frauduleuse, partage de compte, tentative de contournement des systèmes
          de sécurité) peut entraîner la suspension immédiate du compte sans remboursement.
        </p>
      </>
    ),
  },
  {
    id: 'paiement',
    title: '6. Abonnements et paiements',
    content: (
      <>
        <p>
          Les tarifs des packs sont affichés en <strong>Francs CFA (XAF)</strong> avec une conversion indicative
          en USD basée sur le taux de change configuré sur la plateforme. Le prix en FCFA fait foi.
        </p>
        <p className="mt-2">
          Les paiements sont traités par des prestataires tiers sécurisés :
        </p>
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li><strong>NotchPay</strong> — pour les paiements en XAF (Orange Money, MTN MoMo, Visa, Mastercard)</li>
          <li><strong>Paiement manuel</strong> — via Orange Money ou MTN MoMo, avec activation en 5-10 min après vérification</li>
        </ul>
        <p className="mt-3">
          Chaque abonnement est à durée déterminée (généralement 30 jours à compter de la date d&apos;activation).
          Il ne se renouvelle pas automatiquement. À l&apos;expiration, l&apos;accès aux contenus payants est suspendu
          et vos données d&apos;entraînement restent consultables dans votre historique.
        </p>
        <p className="mt-2">
          TEF-LAB se réserve le droit de modifier ses tarifs à tout moment. Les abonnements en cours ne sont pas
          affectés par une révision tarifaire.
        </p>
      </>
    ),
  },
  {
    id: 'remboursement',
    title: '7. Politique de remboursement',
    content: (
      <>
        <p>
          En raison de la nature dématérialisée des services proposés et de l&apos;accès immédiat au contenu après
          activation, <strong>toute vente est définitive et ne donne pas lieu à remboursement</strong>, sauf dans
          les cas suivants :
        </p>
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li>Double facturation avérée pour la même commande</li>
          <li>Paiement débité mais accès non activé dans un délai de 48 heures (paiement automatique) ou 72 heures (paiement manuel)</li>
          <li>Dysfonctionnement majeur de la plateforme empêchant tout accès pendant plus de 7 jours consécutifs</li>
        </ul>
        <p className="mt-3">
          Pour toute réclamation, contactez-nous par email à <strong>tifuzzied@gmail.com</strong> ou sur WhatsApp
          au <strong>+237 683 008 287</strong> en précisant votre référence de commande et la nature du problème.
          Nous nous engageons à traiter chaque demande dans un délai de 5 jours ouvrables.
        </p>
      </>
    ),
  },
  {
    id: 'confidentialite',
    title: '8. Protection des données personnelles',
    content: (
      <>
        <p>
          TEF-LAB collecte uniquement les données nécessaires au bon fonctionnement de la plateforme. Ces données
          comprennent notamment votre nom, votre adresse email, votre ville de résidence et vos résultats
          d&apos;entraînement.
        </p>
        <p className="mt-2 font-semibold text-gray-800">Utilisation des données :</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Création et gestion de votre espace personnel</li>
          <li>Activation et suivi de votre abonnement</li>
          <li>Envoi de communications liées à votre compte (confirmation de paiement, expiration)</li>
          <li>Amélioration de la plateforme et analyse des usages (données agrégées et anonymisées)</li>
        </ul>
        <p className="mt-3 font-semibold text-gray-800">Partage des données :</p>
        <p className="mt-1">
          Vos données personnelles ne sont jamais vendues ni cédées à des tiers à des fins commerciales. Elles
          peuvent être transmises à nos prestataires techniques (hébergement, paiement) dans la stricte limite
          de la prestation fournie.
        </p>
        <p className="mt-3 font-semibold text-gray-800">Vos droits :</p>
        <p className="mt-1">
          Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données. Pour exercer
          ces droits, contactez-nous à <strong>tifuzzied@gmail.com</strong>. Toute demande de suppression de
          compte sera traitée dans les 30 jours suivant réception.
        </p>
        <p className="mt-3 font-semibold text-gray-800">Correction par IA :</p>
        <p className="mt-1">
          Les réponses soumises aux modules EE et EO peuvent être transmises à l&apos;API Anthropic (Claude)
          à des fins de correction automatisée. Ces données sont traitées en temps réel et ne sont pas conservées
          par Anthropic au-delà du traitement de la requête.
        </p>
      </>
    ),
  },
  {
    id: 'propriete',
    title: '9. Propriété intellectuelle',
    content: (
      <>
        <p>
          La majorité des contenus présents sur TEF-LAB — exercices originaux, sujets créés en interne,
          fichiers audio produits pour la plateforme, interfaces graphiques, logo et marque — sont la propriété
          exclusive de TEF-LAB et sont protégés par les lois en vigueur relatives au droit d&apos;auteur.
        </p>
        <p className="mt-3 font-semibold text-gray-800">Matériaux issus de « Le français des affaires » :</p>
        <p className="mt-1">
          Une partie des séries d&apos;entraînement gratuites disponibles sur TEF-LAB s&apos;appuie sur des documents
          exemples tirés de la publication <strong>« Le français des affaires »</strong>, éditée par la
          Chambre de Commerce et d&apos;Industrie de Paris Île-de-France (CCI Paris Île-de-France). Ces documents
          sont utilisés à titre pédagogique, dans le cadre de la préparation au TEF Canada, conformément à leur
          vocation première d&apos;exemples d&apos;épreuves officielles mis à disposition du public.
        </p>
        <p className="mt-2">
          TEF-LAB n&apos;est ni affilié, ni partenaire, ni accrédité par la CCI Paris Île-de-France. L&apos;utilisation
          de ces documents est strictement limitée à un usage éducatif non commercial, et TEF-LAB ne revendique
          aucun droit de propriété sur ces éléments. Toute reproduction ou redistribution de ces documents
          en dehors du cadre pédagogique de la plateforme est soumise aux conditions d&apos;utilisation de la CCI Paris.
        </p>
        <p className="mt-3 font-semibold text-gray-800">Contenus propriétaires :</p>
        <p className="mt-1">
          Pour les contenus originaux de TEF-LAB, toute reproduction, copie, diffusion ou commercialisation,
          même partielle, est strictement interdite sans autorisation écrite préalable. Cela inclut notamment :
        </p>
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li>La capture ou l&apos;enregistrement des exercices et sujets d&apos;entraînement originaux</li>
          <li>La redistribution des fichiers audio produits pour les modules CO et EO</li>
          <li>La revente ou le partage des accès abonnés</li>
          <li>L&apos;utilisation de robots, scrapers ou tout outil automatisé pour extraire le contenu</li>
        </ul>
        <p className="mt-3">
          Les marques citées sur la plateforme (TEF Canada, IRCC, CCI Paris Île-de-France, etc.) sont la
          propriété de leurs titulaires respectifs et sont mentionnées à titre informatif uniquement.
        </p>
      </>
    ),
  },
  {
    id: 'conduite',
    title: '10. Comportements interdits',
    content: (
      <>
        <p>Dans le cadre de l&apos;utilisation de TEF-LAB, il est formellement interdit de :</p>
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li>Partager ou revendre vos identifiants de connexion</li>
          <li>Tenter d&apos;accéder à des ressources pour lesquelles vous n&apos;avez pas souscrit</li>
          <li>Utiliser des outils automatisés (bots, scripts) pour interagir avec la plateforme</li>
          <li>Soumettre des contenus illicites, diffamatoires ou portant atteinte à des droits tiers</li>
          <li>Introduire des virus, malwares ou tout code malveillant dans les systèmes de la plateforme</li>
          <li>Tenter de décompiler, désassembler ou rétroingéniérer tout ou partie du code source</li>
          <li>Usurper l&apos;identité d&apos;un autre utilisateur ou d&apos;un membre de l&apos;équipe TEF-LAB</li>
        </ul>
        <p className="mt-3">
          Tout manquement à ces règles pourra entraîner la suspension immédiate et définitive du compte,
          sans préavis ni remboursement, et pourra faire l&apos;objet de poursuites légales si la gravité
          des faits le justifie.
        </p>
      </>
    ),
  },
  {
    id: 'responsabilite',
    title: '11. Limitation de responsabilité',
    content: (
      <>
        <p>
          TEF-LAB s&apos;engage à maintenir la plateforme accessible et fonctionnelle dans la mesure du possible.
          Toutefois, nous ne pouvons garantir une disponibilité ininterrompue du service, notamment en cas de :
        </p>
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li>Maintenance planifiée ou d&apos;urgence</li>
          <li>Panne des prestataires d&apos;hébergement (Supabase, Vercel)</li>
          <li>Incidents liés à la connectivité internet</li>
          <li>Événements de force majeure</li>
        </ul>
        <p className="mt-3">
          Les corrections générées par intelligence artificielle sont fournies à titre indicatif. Elles reflètent
          une évaluation automatisée et ne sauraient se substituer à l&apos;appréciation d&apos;un correcteur humain
          officiel. TEF-LAB décline toute responsabilité quant aux résultats obtenus lors du passage du TEF
          Canada officiel.
        </p>
        <p className="mt-2">
          En aucun cas TEF-LAB ne pourra être tenu responsable de préjudices indirects, notamment la perte de
          données, l&apos;échec à un examen officiel, des décisions administratives ou l&apos;impossibilité d&apos;immigration.
        </p>
      </>
    ),
  },
  {
    id: 'modifications',
    title: '12. Modifications des mentions légales',
    content: (
      <>
        <p>
          TEF-LAB se réserve le droit de mettre à jour les présentes mentions légales à tout moment, sans
          notification préalable. La date de dernière mise à jour est indiquée en bas de cette page.
        </p>
        <p className="mt-2">
          Nous vous encourageons à consulter régulièrement cette page. La poursuite de l&apos;utilisation de la
          plateforme après publication d&apos;une nouvelle version vaut acceptation des conditions modifiées.
        </p>
      </>
    ),
  },
  {
    id: 'droit',
    title: '13. Droit applicable et litiges',
    content: (
      <>
        <p>
          Les présentes mentions légales sont régies par le droit camerounais. En cas de désaccord ou de litige
          relatif à l&apos;utilisation de TEF-LAB, nous privilégions en premier lieu une résolution amiable.
        </p>
        <p className="mt-2">
          Pour tout différend, contactez-nous directement à <strong>tifuzzied@gmail.com</strong>. Si aucune
          solution amiable n&apos;est trouvée dans un délai de 30 jours, le litige pourra être porté devant les
          juridictions compétentes du lieu du siège de TEF-LAB.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    title: '14. Nous contacter',
    content: (
      <>
        <p>Pour toute question relative aux présentes mentions légales, à votre compte ou à vos données :</p>
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li><strong>Email :</strong> tifuzzied@gmail.com</li>
          <li><strong>WhatsApp :</strong> +237 683 008 287</li>
          <li>
            <strong>Formulaire de contact :</strong>{' '}
            <Link href="/contact" className="text-tef-blue hover:underline">
              tef-lab.com/contact
            </Link>
          </li>
        </ul>
        <p className="mt-3 text-sm text-gray-500">
          Nous nous efforçons de répondre à toutes les demandes dans un délai de 48 à 72 heures ouvrables.
        </p>
      </>
    ),
  },
]

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-tef-blue text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-blue-300 text-sm font-medium mb-2 uppercase tracking-widest">Légal</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Mentions légales</h1>
          <p className="text-blue-200 text-sm">
            Dernière mise à jour : mars 2026 &nbsp;·&nbsp; Plateforme TEF-LAB, préparation au TEF Canada
          </p>
        </div>
      </section>

      {/* Table of contents */}
      <section className="border-b border-gray-100 bg-gray-50 py-6 px-4 hidden md:block">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Sommaire</p>
          <ol className="grid grid-cols-2 gap-x-8 gap-y-1">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm text-tef-blue hover:underline hover:text-tef-blue-hover transition-colors"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-12">

          {/* Intro */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-sm text-gray-700 leading-relaxed">
            <p>
              Ces mentions légales ont pour objectif de vous informer de manière claire et transparente sur
              les conditions dans lesquelles TEF-LAB vous offre ses services, sur vos droits en tant
              qu&apos;utilisateur, ainsi que sur les règles qui encadrent l&apos;utilisation de la plateforme.
              Nous avons voulu un texte lisible — pas du jargon juridique opaque, mais des règles du jeu
              que tout le monde peut comprendre.
            </p>
          </div>

          {/* Sections */}
          {sections.map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-20">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                {section.title}
              </h2>
              <div className="text-gray-700 leading-relaxed text-sm space-y-2">
                {section.content}
              </div>
            </div>
          ))}

          {/* Footer note */}
          <div className="bg-gray-50 rounded-2xl p-6 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Ces mentions légales s&apos;appliquent à l&apos;ensemble des services proposés par TEF-LAB,
              qu&apos;ils soient gratuits ou payants.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                href="/contact"
                className="inline-block px-6 py-2.5 bg-tef-blue text-white font-semibold rounded-xl text-sm hover:bg-tef-blue-hover transition-colors"
              >
                Nous contacter →
              </Link>
              <Link
                href="/"
                className="inline-block px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                ← Retour à l&apos;accueil
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}
