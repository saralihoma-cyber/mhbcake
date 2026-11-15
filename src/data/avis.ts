/**
 * Avis clients publiés sur le site MHB Cake Design – Pâtissier.
 *
 * Cette liste est la seule source des avis affichés (accueil, fiches ebooks, page du pack).
 * Tant qu'elle est vide, le site affiche une invitation à déposer le premier avis.
 *
 * N'y inscrivez que des avis authentiques, tels que rédigés par vos clientes et clients :
 * publier de faux avis est interdit (pratique commerciale trompeuse).
 *
 * Les avis déposés depuis le site arrivent dans l'espace administrateur, onglet « Messages »,
 * avec le sujet « Avis client ». Pour en publier un, ajoutez-le ci-dessous puis redéployez.
 *
 * Champs :
 *  - id         : identifiant unique (ex. 'avis-001')
 *  - name       : nom affiché, choisi par le client (ex. 'Camille D.')
 *  - rating     : note de 1 à 5
 *  - date       : date de l'avis au format AAAA-MM-JJ
 *  - text       : le témoignage
 *  - title      : titre court (facultatif)
 *  - product_id : 1 = L'Art de la Pâtisserie – Masterclass, 2 = L'Art du Cake Design, 3 = Le Pack (facultatif)
 *  - verified   : true uniquement si vous avez retrouvé la commande correspondante
 *
 * Exemple à copier dans la liste (sans les barres de commentaire) :
 *
 *   {
 *     id: 'avis-001',
 *     name: 'Prénom N.',
 *     rating: 5,
 *     date: '2026-12-01',
 *     product_id: 1,
 *     title: 'Titre facultatif',
 *     text: 'Le texte de l’avis, tel que rédigé par la cliente ou le client.',
 *     verified: true,
 *   },
 */
export type Review = {
  id: string;
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date: string;
  text: string;
  title?: string;
  product_id?: number;
  verified?: boolean;
};

export const REVIEWS: Review[] = [];
