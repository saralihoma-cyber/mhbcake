import type { Faq, Product, Settings } from '../lib/api';

/**
 * Catalogue statique de la boutique MHB Cake Design – Pâtissier.
 *
 * Toutes les données affichées par le site (ebooks, pack, liens d'achat Payhip, FAQ,
 * coordonnées) sont définies ici : aucune requête serveur n'est nécessaire pour l'affichage.
 *
 * FAQ : le champ « featured » (1, 2, 3…) désigne les questions affichées sur la page d'accueil, dans cet ordre.
 *
 * Pour modifier un prix, un texte ou un lien : changez la valeur ci-dessous, puis redéployez.
 *  - price_cents : prix de vente en centimes (990 = 9,90 €). Pensez à aligner le prix sur Payhip.
 *  - compare_at_cents : ancien prix affiché barré (1990 = 19,90 €) ; null = pas de prix barré.
 *  - bonus : ligne « bonus offert » affichée sous la description (pack).
 *  - payhip_url  : lien ouvert par les boutons « Acheter maintenant ».
 *  - included_ids : pour un pack, identifiants (id) des ebooks qu'il contient.
 */
export const PRODUCTS: Product[] = [
  {
    id: 1,
    slug: "l-art-de-la-patisserie-masterclass",
    type: "ebook",
    title: "L’Art de la Pâtisserie – Masterclass",
    subtitle: "Histoire, recettes, techniques et secrets des grands chefs",
    short_description: "Découvrez un guide complet pour apprendre et maîtriser l’art de la pâtisserie. Un ebook de 70 pages consacré aux techniques, recettes et fondamentaux de la pâtisserie.",
    description: "Pensé comme une véritable masterclass, cet ebook vous accompagne pas à pas dans l’apprentissage de la pâtisserie. Des fondamentaux aux techniques professionnelles, chaque partie a été conçue pour vous donner des bases solides et l’envie de pâtisser.\n\nAu fil de ses 70 pages, vous découvrirez les recettes incontournables, les gestes techniques, la décoration créative et les conseils du Chef pour progresser à votre rythme.\n\nUn guide complet, pour débutants comme pour passionnés, à consulter sur l’écran de votre choix : ordinateur, tablette ou smartphone.",
    highlights: [
      "Les bases inratables (génoises moelleuses, crèmes légères).",
      "Les astuces de chefs pour éviter les erreurs de cuisson.",
      "Recettes détaillées étape par étape, accessibles aux débutants.",
      "Les fondamentaux de la pâtisserie.",
      "Les recettes incontournables.",
      "Les techniques professionnelles.",
      "La décoration créative.",
      "Les conseils du Chef.",
      "Un guide complet pour débutants et passionnés."
    ],
    pages: 70,
    price_cents: 990,
    compare_at_cents: 1990,
    badge: "Édition Prestige 2026",
    is_new: true,
    cover_url: "/images/couverture-art-de-la-patisserie.webp",
    included_ids: [],
    sort_order: 1,
    has_file: false,
    file_size: null,
    best_seller: false,
    payhip_url: "https://payhip.com/b/iV4qv"
  },
  {
    id: 2,
    slug: "l-art-du-cake-design",
    type: "ebook",
    title: "L’Art du Cake Design",
    subtitle: "Le guide complet du cake design, des recettes fondamentales aux créations artistiques professionnelles",
    short_description: "Découvrez l’univers du cake design à travers un guide complet consacré aux recettes fondamentales, aux techniques professionnelles et aux créations artistiques.",
    description: "Entrez dans l’univers du cake design avec un guide qui réunit l’essentiel : les recettes fondamentales, les techniques professionnelles et l’inspiration nécessaire pour imaginer vos propres créations.\n\nAu fil de ses 72 pages, vous retrouverez les recettes incontournables, les décorations créatives et les astuces de Chef qui donnent à un gâteau son allure et sa finition.\n\nUn ebook pensé pour vous faire passer, étape après étape, des bases aux créations artistiques — à consulter sur l’écran de votre choix : ordinateur, tablette ou smartphone.",
    highlights: [
      "Montage et lissage parfait (effet angles droits).",
      "Travail de la pâte à sucre et décors floraux élégants.",
      "Calcul des parts et conservation professionnelle.",
      "Les techniques professionnelles du cake design.",
      "Les recettes incontournables.",
      "Des décorations créatives.",
      "Les astuces de Chef.",
      "Des recettes fondamentales aux créations artistiques."
    ],
    pages: 72,
    price_cents: 990,
    compare_at_cents: 1990,
    badge: "Édition Prestige 2026",
    is_new: true,
    cover_url: "/images/couverture-art-du-cake-design.webp",
    included_ids: [],
    sort_order: 2,
    has_file: false,
    file_size: null,
    best_seller: false,
    payhip_url: "https://payhip.com/b/G2aB0"
  },
  {
    id: 3,
    slug: "pack-patisserie-cake-design",
    type: "pack",
    title: "Le Pack Pâtisserie & Cake Design",
    subtitle: "Les deux ebooks de la maison MHB, réunis en une seule offre",
    short_description: "Réunissez L’Art de la Pâtisserie – Masterclass et L’Art du Cake Design en un seul achat : deux guides complémentaires pour maîtriser les fondamentaux de la pâtisserie et donner vie à vos créations de cake design.",
    description: "Deux ebooks qui se répondent : l’un pose les bases de la pâtisserie, l’autre vous ouvre les portes du cake design. Ensemble, ils forment un parcours complet, des fondamentaux jusqu’aux créations artistiques.\n\nAvec le pack, vous réglez en une seule fois et téléchargez vos deux fichiers PDF depuis la même page de commande.",
    highlights: [
      "Les deux ebooks complets, au format PDF",
      "Un seul paiement, deux téléchargements",
      "Un prix plus avantageux que l’achat séparé",
      "Des fondamentaux de la pâtisserie aux créations de cake design"
    ],
    pages: null,
    price_cents: 1490,
    compare_at_cents: 2990,
    badge: "MEILLEURE OFFRE • -50%",
    bonus: "BONUS OFFERT : Guide des équivalences et conversions en pâtisserie (PDF)",
    is_new: false,
    cover_url: "/images/couverture-pack-patisserie-cake-design.webp",
    included_ids: [
      1,
      2
    ],
    sort_order: 3,
    has_file: false,
    file_size: null,
    best_seller: false,
    payhip_url: "https://payhip.com/b/a6KBN"
  }
];

/** Questions fréquentes (page FAQ et page d'accueil). */
export const FAQS: Faq[] = [
  {
    id: 1,
    question: "Sous quel format sont proposés vos ebooks ?",
    answer: "Nos ebooks sont des livres numériques au format PDF. Vous pouvez les lire sur ordinateur, tablette ou smartphone, avec n’importe quel lecteur de fichiers PDF.",
    category: "Les ebooks",
    sort_order: 1
  },
  {
    id: 2,
    question: "Est-ce adapté aux débutants ?",
    answer: "Oui ! Chaque recette et technique est expliquée étape par étape, avec des astuces simples pour réussir dès le premier essai.",
    category: "Les ebooks",
    sort_order: 2,
    featured: 1
  },
  {
    id: 12,
    question: "Faut-il du matériel professionnel coûteux ?",
    answer: "Non, la majorité des recettes sont pensées pour être réalisées avec des ustensiles de cuisine classiques.",
    category: "Les ebooks",
    sort_order: 2,
    featured: 3
  },
  {
    id: 3,
    question: "Vais-je recevoir un livre papier ?",
    answer: "Non. Nous vendons exclusivement des produits numériques : aucun livre imprimé n’est expédié. Vous téléchargez votre ebook au format PDF.",
    category: "Les ebooks",
    sort_order: 3
  },
  {
    id: 4,
    question: "Puis-je acheter les deux ebooks ensemble ?",
    answer: "Oui. Le pack réunit L’Art de la Pâtisserie – Masterclass et L’Art du Cake Design à un prix plus avantageux que l’achat séparé. Si vous ajoutez les deux ebooks à votre panier, le pack vous est proposé automatiquement.",
    category: "Les ebooks",
    sort_order: 4
  },
  {
    id: 5,
    question: "Quels sont les moyens de paiement acceptés ?",
    answer: "Les moyens de paiement disponibles — carte bancaire (Visa, Mastercard) et PayPal — vous sont proposés au moment de la commande. Vos coordonnées bancaires ne nous sont jamais transmises.",
    category: "Commande et paiement",
    sort_order: 5
  },
  {
    id: 6,
    question: "Dois-je créer un compte pour commander ?",
    answer: "Non. Il vous suffit d’indiquer vos nom, prénom et adresse e-mail au moment de la commande.",
    category: "Commande et paiement",
    sort_order: 6
  },
  {
    id: 7,
    question: "Comment vais-je recevoir mon ebook ?",
    answer: "Immédiatement après votre paiement, vous recevez un lien de téléchargement direct (format PDF) lisible sur téléphone, tablette et ordinateur.",
    category: "Téléchargement",
    sort_order: 7,
    featured: 2
  },
  {
    id: 8,
    question: "Puis-je télécharger à nouveau mon ebook plus tard ?",
    answer: "Oui. Rendez-vous dans la rubrique « Mes téléchargements », saisissez l’adresse e-mail utilisée lors de l’achat et votre numéro de commande : vous retrouverez votre page de commande et vos fichiers.",
    category: "Téléchargement",
    sort_order: 8
  },
  {
    id: 9,
    question: "Je n’arrive pas à télécharger ou à ouvrir mon fichier, que faire ?",
    answer: "Vérifiez d’abord votre connexion et essayez depuis un autre navigateur ou un autre appareil. Si le problème persiste, écrivez-nous depuis la page Contact en indiquant votre numéro de commande : nous vous apporterons une solution.",
    category: "Téléchargement",
    sort_order: 9
  },
  {
    id: 10,
    question: "Puis-je être remboursé(e) après mon achat ?",
    answer: "Un ebook est un contenu numérique accessible immédiatement : conformément au Code de la consommation, le droit de rétractation ne s’applique plus une fois que vous avez demandé l’accès au fichier. En revanche, si votre fichier est défectueux ou non conforme et que nous ne pouvons pas y remédier, vous êtes remboursé(e). Tous les détails figurent dans notre politique de remboursement.",
    category: "Remboursement et droits",
    sort_order: 10
  },
  {
    id: 11,
    question: "Puis-je partager mon ebook avec d’autres personnes ?",
    answer: "Non. Votre achat vous donne un droit d’usage strictement personnel. Les ebooks sont protégés par le droit d’auteur : leur partage, leur diffusion ou leur revente ne sont pas autorisés.",
    category: "Remboursement et droits",
    sort_order: 11
  }
];

/** Coordonnées et mentions affichées sur le site (pied de page, Contact, pages légales). */
export const SETTINGS: Settings = {
  checkout_mode: "test",
  paypal_me_url: "",
  contact_email: "",
  contact_phone: "",
  contact_address: "",
  instagram_url: "",
  facebook_url: "",
  legal_name: "",
  legal_status: "",
  siret: "",
  legal_address: "",
  publication_director: "",
  vat_mention: "",
  mediator: ""
};
