import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../lib/store';
import { useSeo } from '../lib/seo';
import { PageHero } from '../components/ui';

type Section = { title: string; body: ReactNode };

const UPDATED = 'novembre 2026';
const a = 'underline decoration-gold underline-offset-4 hover:text-gold-deep';

function LegalPage({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: Section[] }) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} intro={intro} />
      <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 lg:py-20">
        <p className="text-sm font-light text-ink-soft">Dernière mise à jour : {UPDATED}</p>
        <ol className="mt-8 space-y-10">
          {sections.map((s, i) => (
            <li key={s.title}>
              <h2 className="flex items-baseline gap-4 font-display text-[1.45rem] leading-snug text-ink">
                <span className="text-foil shrink-0 text-lg italic">{String(i + 1).padStart(2, '0')}</span>
                {s.title}
              </h2>
              <div className="prose-mhb mt-4 space-y-4 font-light leading-[1.8] text-ink-soft [&_strong]:font-medium [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
                {s.body}
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-14 flex flex-wrap gap-x-8 gap-y-2 border-t border-line pt-6 text-sm">
          <Link to="/cgv" className={a}>Conditions générales de vente</Link>
          <Link to="/confidentialite" className={a}>Politique de confidentialité</Link>
          <Link to="/remboursement" className={a}>Politique de remboursement</Link>
        </div>
      </article>
    </>
  );
}

function useSeller() {
  const { settings } = useShop();
  const name = settings.legal_name || 'MHB Cake Design – Pâtissier';
  const lines = [
    settings.legal_status,
    settings.siret && `SIRET : ${settings.siret}`,
    settings.legal_address && `Adresse : ${settings.legal_address}`,
    settings.contact_email && `E-mail : ${settings.contact_email}`,
    settings.contact_phone && `Téléphone : ${settings.contact_phone}`,
    settings.publication_director && `Responsable de la publication : ${settings.publication_director}`,
  ].filter(Boolean) as string[];
  return { settings, name, lines };
}

const contactLink = <Link to="/contact" className={a}>formulaire de contact</Link>;

export function Cgv() {
  const { settings, name, lines } = useSeller();
  useSeo('Conditions générales de vente', 'Conditions générales de vente des ebooks numériques PDF proposés par MHB Cake Design – Pâtissier.');

  const sections: Section[] = [
    {
      title: 'Vendeur et éditeur du site',
      body: (
        <>
          <p>
            Le présent site est édité par <strong>{name}</strong> (ci-après « le Vendeur »).
          </p>
          {lines.length > 0 && <ul>{lines.map((l) => <li key={l}>{l}</li>)}</ul>}
          <p>Le service client est joignable via le {contactLink}.</p>
          <p>Hébergement du site : Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis.</p>
        </>
      ),
    },
    {
      title: 'Objet et champ d’application',
      body: (
        <p>
          Les présentes conditions générales de vente (CGV) régissent toutes les ventes de livres numériques conclues sur ce site entre
          le Vendeur et toute personne effectuant un achat (ci-après « le Client »). Toute commande implique l’acceptation pleine et
          entière des CGV en vigueur au jour de la commande.
        </p>
      ),
    },
    {
      title: 'Produits',
      body: (
        <>
          <p>
            Le Vendeur propose exclusivement des <strong>contenus numériques</strong> : des ebooks au format PDF, vendus à l’unité ou
            réunis en pack. Aucun produit physique n’est expédié.
          </p>
          <p>
            Les caractéristiques essentielles de chaque ebook (titre, contenu, nombre de pages, format) sont présentées sur sa fiche.
            La lecture nécessite un appareil (ordinateur, tablette ou smartphone) équipé d’un lecteur de fichiers PDF.
          </p>
        </>
      ),
    },
    {
      title: 'Prix',
      body: (
        <>
          <p>
            Les prix sont indiqués en euros. {settings.vat_mention || 'Le prix affiché est le prix total à payer par le Client.'} Aucun
            frais de livraison ne s’applique, les produits étant délivrés par voie électronique.
          </p>
          <p>
            Le Vendeur peut modifier ses prix à tout moment ; le prix applicable est celui affiché au moment de la validation de la
            commande.
          </p>
        </>
      ),
    },
    {
      title: 'Commande',
      body: (
        <>
          <p>Pour commander, le Client :</p>
          <ul>
            <li>ajoute le ou les ebooks de son choix à son panier ;</li>
            <li>renseigne ses nom, prénom et adresse e-mail ;</li>
            <li>vérifie le récapitulatif, accepte les présentes CGV et valide sa commande avec obligation de paiement.</li>
          </ul>
          <p>
            Une page de confirmation récapitule la commande et son numéro. Le Client est responsable de l’exactitude de l’adresse
            e-mail communiquée, qui permet de retrouver sa commande.
          </p>
        </>
      ),
    },
    {
      title: 'Paiement',
      body: (
        <p>
          Le prix est exigible en totalité à la commande. Le règlement s’effectue par carte bancaire (Visa, Mastercard) ou PayPal,
          selon les moyens proposés au moment de la commande, par l’intermédiaire de prestataires de paiement sécurisés. Le Vendeur
          n’a jamais accès aux coordonnées bancaires du Client et n’en conserve aucune.
        </p>
      ),
    },
    {
      title: 'Livraison des contenus numériques',
      body: (
        <>
          <p>
            Dès la confirmation du paiement, le Client accède à un <strong>lien de téléchargement sécurisé</strong> depuis sa page de
            confirmation de commande. Cette page reste accessible à tout moment depuis la rubrique{' '}
            <Link to="/mes-telechargements" className={a}>Mes téléchargements</Link>, à l’aide de l’adresse e-mail et du numéro de
            commande.
          </p>
          <p>En cas de difficulté d’accès au fichier, le Client contacte le service client, qui lui apportera une solution.</p>
        </>
      ),
    },
    {
      title: 'Droit de rétractation',
      body: (
        <>
          <p>
            Le consommateur dispose en principe d’un délai de quatorze jours pour se rétracter d’un achat à distance (article L221-18
            du Code de la consommation).
          </p>
          <p>
            Toutefois, conformément à l’<strong>article L221-28, 13° du Code de la consommation</strong>, ce droit ne peut être exercé
            pour la fourniture d’un contenu numérique sans support matériel dont l’exécution a commencé avec l’accord préalable exprès
            du consommateur, lequel a reconnu perdre son droit de rétractation.
          </p>
          <p>
            En validant sa commande, le Client demande expressément l’accès immédiat à son ebook et reconnaît renoncer à son droit de
            rétractation. Les cas de remboursement sont détaillés dans notre{' '}
            <Link to="/remboursement" className={a}>politique de remboursement</Link>.
          </p>
        </>
      ),
    },
    {
      title: 'Garanties légales',
      body: (
        <p>
          Le Client bénéficie de la garantie légale de conformité applicable aux contenus numériques (articles L224-25-12 et suivants
          du Code de la consommation) ainsi que de la garantie des vices cachés (articles 1641 à 1649 du Code civil). Si le fichier
          délivré est défectueux, illisible ou ne correspond pas à sa description, le Vendeur le met en conformité sans frais ou, à
          défaut, procède au remboursement.
        </p>
      ),
    },
    {
      title: 'Propriété intellectuelle',
      body: (
        <>
          <p>
            Les ebooks, leurs textes, recettes, photographies et illustrations sont protégés par le droit d’auteur. L’achat confère au
            Client un droit d’usage <strong>strictement personnel</strong>, non exclusif et non cessible.
          </p>
          <p>
            Toute reproduction, diffusion, partage, mise en ligne ou revente, totale ou partielle, sans autorisation écrite préalable
            du Vendeur est interdite et constitue une contrefaçon.
          </p>
        </>
      ),
    },
    {
      title: 'Responsabilité',
      body: (
        <p>
          Les recettes et conseils sont fournis à titre informatif. Il appartient au Client de vérifier la présence d’éventuels
          allergènes et d’adapter les préparations à son équipement. Le Vendeur ne saurait être tenu responsable d’une incompatibilité
          entre le fichier et un matériel ou logiciel obsolète, ni d’une interruption du réseau Internet indépendante de sa volonté.
        </p>
      ),
    },
    {
      title: 'Données personnelles',
      body: (
        <p>
          Les données collectées lors de la commande sont traitées conformément à notre{' '}
          <Link to="/confidentialite" className={a}>politique de confidentialité</Link>.
        </p>
      ),
    },
    {
      title: 'Réclamations et médiation',
      body: (
        <>
          <p>Toute réclamation peut être adressée au service client via le {contactLink}.</p>
          <p>
            Conformément à l’article L612-1 du Code de la consommation, le consommateur peut, après une réclamation écrite restée sans
            solution, recourir gratuitement à un médiateur de la consommation.{' '}
            {settings.mediator
              ? `Médiateur compétent : ${settings.mediator}.`
              : 'Les coordonnées du médiateur compétent sont communiquées sur simple demande auprès du service client.'}
          </p>
        </>
      ),
    },
    {
      title: 'Droit applicable',
      body: (
        <p>
          Les présentes CGV sont soumises au droit français. À défaut de résolution amiable, le litige sera porté devant les tribunaux
          compétents dans les conditions de droit commun.
        </p>
      ),
    },
  ];

  return (
    <LegalPage
      eyebrow="Informations légales"
      title="Conditions générales de vente"
      intro="Les règles qui encadrent l’achat de nos ebooks au format PDF."
      sections={sections}
    />
  );
}

export function Confidentialite() {
  const { name } = useSeller();
  useSeo('Politique de confidentialité', 'Politique de confidentialité et protection des données personnelles de MHB Cake Design – Pâtissier.');

  const sections: Section[] = [
    {
      title: 'Responsable du traitement',
      body: (
        <p>
          Les données personnelles collectées sur ce site sont traitées par <strong>{name}</strong>, responsable du traitement, joignable
          via le {contactLink}.
        </p>
      ),
    },
    {
      title: 'Données collectées',
      body: (
        <>
          <ul>
            <li><strong>Lors d’une commande :</strong> nom, prénom, adresse e-mail, détail et montant de la commande, date des consentements recueillis, historique des téléchargements.</li>
            <li><strong>Lors d’une prise de contact :</strong> nom, adresse e-mail, numéro de commande éventuel et contenu du message.</li>
            <li><strong>Lors du dépôt d’un avis :</strong> nom à afficher, adresse e-mail (non publiée), numéro de commande éventuel, note et témoignage. Avec votre accord, l’avis est publié sur le site accompagné du nom que vous avez indiqué ; vous pouvez en demander le retrait à tout moment.</li>
          </ul>
          <p>
            <strong>Aucune donnée bancaire</strong> n’est collectée ni conservée par nos soins : les paiements sont traités directement
            par les prestataires de paiement.
          </p>
        </>
      ),
    },
    {
      title: 'Finalités et bases légales',
      body: (
        <ul>
          <li>Traiter les commandes et délivrer les ebooks — exécution du contrat ;</li>
          <li>Tenir la comptabilité et conserver la preuve des transactions — obligation légale ;</li>
          <li>Répondre aux demandes adressées au service client — intérêt légitime.</li>
        </ul>
      ),
    },
    {
      title: 'Durées de conservation',
      body: (
        <ul>
          <li>Données de commande : dix ans, au titre des obligations comptables (article L123-22 du Code de commerce) ;</li>
          <li>Messages adressés au service client : le temps nécessaire au traitement de la demande, et au maximum trois ans.</li>
        </ul>
      ),
    },
    {
      title: 'Destinataires des données',
      body: (
        <>
          <p>Vos données sont destinées au seul Vendeur. Elles ne sont ni vendues ni louées. Elles sont hébergées par nos prestataires techniques :</p>
          <ul>
            <li>Vercel Inc. — hébergement du site ;</li>
            <li>Supabase Inc. — base de données et stockage sécurisé des fichiers ;</li>
            <li>les prestataires de paiement, pour le traitement des règlements.</li>
          </ul>
          <p>
            Certains de ces prestataires étant établis hors de l’Union européenne, les transferts éventuels sont encadrés par les
            garanties prévues par le RGPD (clauses contractuelles types de la Commission européenne).
          </p>
        </>
      ),
    },
    {
      title: 'Cookies et stockage local',
      body: (
        <p>
          Ce site n’utilise ni cookie publicitaire ni outil de mesure d’audience. Seul un stockage local strictement nécessaire au
          fonctionnement de la boutique est utilisé sur votre appareil, afin de mémoriser le contenu de votre panier.
        </p>
      ),
    },
    {
      title: 'Vos droits',
      body: (
        <>
          <p>
            Conformément au Règlement général sur la protection des données (RGPD) et à la loi Informatique et Libertés, vous disposez
            d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité de vos données.
          </p>
          <p>
            Pour exercer ces droits, écrivez-nous via le {contactLink}. Vous pouvez également introduire une réclamation auprès de la
            CNIL (3 place de Fontenoy, 75007 Paris — www.cnil.fr).
          </p>
        </>
      ),
    },
    {
      title: 'Sécurité',
      body: (
        <p>
          Les échanges avec le site sont chiffrés (HTTPS). Les fichiers des ebooks sont conservés dans un espace de stockage privé et
          ne sont accessibles qu’au moyen de liens de téléchargement temporaires, délivrés aux seuls clients ayant réglé leur commande.
        </p>
      ),
    },
  ];

  return (
    <LegalPage
      eyebrow="Informations légales"
      title="Politique de confidentialité"
      intro="Comment nous collectons, utilisons et protégeons vos données personnelles."
      sections={sections}
    />
  );
}

export function Remboursement() {
  useSeo('Politique de remboursement', 'Politique de remboursement des ebooks numériques MHB Cake Design – Pâtissier, conforme au droit français de la consommation.');

  const sections: Section[] = [
    {
      title: 'Des produits exclusivement numériques',
      body: (
        <p>
          Nos ebooks sont des contenus numériques au format PDF, délivrés par téléchargement dès la confirmation du paiement. Par
          nature, un fichier téléchargé ne peut pas être « retourné ».
        </p>
      ),
    },
    {
      title: 'Absence de droit de rétractation',
      body: (
        <>
          <p>
            Conformément à l’<strong>article L221-28, 13° du Code de la consommation</strong>, le droit de rétractation de quatorze
            jours ne s’applique pas aux contenus numériques fournis sans support matériel lorsque leur exécution a commencé avec
            l’accord préalable exprès du consommateur, qui a reconnu perdre ce droit.
          </p>
          <p>
            Lors de la commande, vous demandez expressément l’accès immédiat à votre ebook et reconnaissez renoncer à votre droit de
            rétractation. En conséquence, <strong>un achat validé n’est en principe ni repris ni remboursé</strong>.
          </p>
        </>
      ),
    },
    {
      title: 'Les cas dans lesquels nous vous remboursons',
      body: (
        <>
          <p>Vos droits restent pleinement protégés. Un remboursement est accordé dans les situations suivantes :</p>
          <ul>
            <li><strong>Fichier défectueux ou inaccessible :</strong> si le PDF est illisible, incomplet ou impossible à télécharger et que nous ne parvenons pas à vous fournir un fichier conforme ;</li>
            <li><strong>Contenu non conforme :</strong> si l’ebook reçu ne correspond pas à la description figurant sur sa fiche (garantie légale de conformité, articles L224-25-12 et suivants du Code de la consommation) ;</li>
            <li><strong>Erreur de paiement :</strong> en cas de double débit ou de montant prélevé par erreur.</li>
          </ul>
        </>
      ),
    },
    {
      title: 'Comment faire une demande',
      body: (
        <>
          <p>
            Écrivez-nous via le {contactLink} en indiquant votre numéro de commande, l’adresse e-mail utilisée lors de l’achat et une
            description du problème rencontré.
          </p>
          <p>
            Nous commençons toujours par chercher une solution : nouveau lien de téléchargement ou fichier corrigé. Si aucune solution
            n’est possible, le remboursement est effectué par le même moyen de paiement que celui utilisé pour la commande, dans un
            délai maximal de quatorze jours suivant son acceptation.
          </p>
        </>
      ),
    },
    {
      title: 'Garanties légales',
      body: (
        <p>
          La présente politique ne limite en rien les garanties légales dont vous bénéficiez : garantie légale de conformité des
          contenus numériques et garantie des vices cachés (articles 1641 à 1649 du Code civil). Voir également nos{' '}
          <Link to="/cgv" className={a}>conditions générales de vente</Link>.
        </p>
      ),
    },
  ];

  return (
    <LegalPage
      eyebrow="Informations légales"
      title="Politique de remboursement"
      intro="Une politique adaptée aux produits numériques et conforme au droit français de la consommation."
      sections={sections}
    />
  );
}
