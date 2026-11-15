import type { Language } from './translations'

export interface CookiePolicySubsection {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export interface CookiePolicySection {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
  subsections?: CookiePolicySubsection[]
}

export interface CookiePolicyCopy {
  policyTitle: string
  policyDescription: string
  lastUpdatedLabel: string
  updatedDate: string
  manageCookies: string
  policyLink: string
  bannerTitle: string
  bannerDescription: string
  acceptNonessential: string
  rejectNonessential: string
  customize: string
  settingsTitle: string
  settingsDescription: string
  necessaryTitle: string
  necessaryDescription: string
  preferencesTitle: string
  preferencesDescription: string
  statisticsTitle: string
  statisticsDescription: string
  marketingTitle: string
  marketingDescription: string
  alwaysOn: string
  saveChoices: string
  cancel: string
  storageError: string
  sections: CookiePolicySection[]
}

export const cookiePolicy: Record<Language, CookiePolicyCopy> = {
  fr: {
    policyTitle: 'Politique de cookies',
    policyDescription: 'Comment SPACE LEARN utilise les cookies et les technologies similaires.',
    lastUpdatedLabel: 'Dernière mise à jour :',
    updatedDate: '15 novembre 2026',
    manageCookies: 'Gérer les cookies',
    policyLink: 'Politique de cookies',
    bannerTitle: 'Vos choix de confidentialité',
    bannerDescription: 'Les cookies non essentiels ne sont utilisés qu’avec votre accord. Vous pouvez accepter, refuser ou personnaliser vos choix.',
    acceptNonessential: 'Accepter les cookies non essentiels',
    rejectNonessential: 'Refuser les cookies non essentiels',
    customize: 'Personnaliser',
    settingsTitle: 'Personnaliser vos choix',
    settingsDescription: 'Vous pouvez modifier ou retirer votre choix à tout moment depuis le pied de page.',
    necessaryTitle: 'Cookies et stockage nécessaires',
    necessaryDescription: 'Toujours actifs : mémorisation de votre choix de consentement et sauvegarde locale de votre progression et de vos résultats aux quiz.',
    preferencesTitle: 'Préférences',
    preferencesDescription: 'Mémoriser la langue choisie sur cet appareil. Si vous refusez, votre choix de langue ne sera pas conservé après cette visite.',
    statisticsTitle: 'Statistiques',
    statisticsDescription: 'Aucun outil de mesure d’audience n’est actuellement configuré. Votre accord ne déclenchera aucun suivi tant qu’un outil n’aura pas été ajouté.',
    marketingTitle: 'Marketing',
    marketingDescription: 'Aucun cookie publicitaire ni outil de ciblage comportemental n’est utilisé. Cette catégorie reste désactivée.',
    alwaysOn: 'Toujours actif',
    saveChoices: 'Enregistrer mes choix',
    cancel: 'Annuler',
    storageError: 'Le navigateur n’a pas pu enregistrer votre choix. Il sera appliqué à cette visite seulement ; vérifiez les paramètres de stockage du navigateur pour le conserver.',
    sections: [
      {
        heading: '1. Qu’est-ce qu’un cookie ?',
        paragraphs: [
          'Un cookie est un petit fichier enregistré dans le navigateur ou sur l’appareil d’un utilisateur lors de sa visite sur un site Internet.',
          'Il peut notamment mémoriser certaines préférences, maintenir une session ou mesurer la fréquentation d’un site.',
          'D’autres technologies similaires peuvent également être utilisées pour collecter des informations relatives à la navigation.',
        ],
      },
      {
        heading: '2. Pourquoi utilisons-nous des cookies ?',
        paragraphs: ['SPACE LEARN peut utiliser des cookies ou technologies similaires pour :'],
        bullets: [
          'Assurer le bon fonctionnement de la plateforme.',
          'Sécuriser les connexions.',
          'Mémoriser les préférences de navigation.',
          'Conserver les choix relatifs au consentement.',
          'Mesurer la fréquentation du site.',
          'Améliorer les fonctionnalités pédagogiques.',
        ],
      },
      {
        heading: '3. Les catégories de cookies',
        subsections: [
          {
            heading: 'A. Cookies nécessaires',
            paragraphs: [
              'Ils sont indispensables au fonctionnement technique du site. Ils peuvent notamment servir à maintenir une connexion, sécuriser les formulaires et mémoriser les choix de consentement.',
              'Ils ne nécessitent pas de consentement uniquement lorsqu’ils répondent effectivement aux critères des cookies strictement nécessaires.',
              'La progression et les résultats aux quiz sont conservés dans le stockage local du navigateur pour fournir la fonction « Ma progression ».',
            ],
          },
          {
            heading: 'B. Cookies de préférences',
            paragraphs: [
              'Ils permettent de mémoriser certaines préférences, notamment la langue de l’interface.',
              'La langue n’est conservée sur l’appareil que si vous acceptez cette catégorie.',
            ],
          },
          {
            heading: 'C. Cookies statistiques',
            paragraphs: [
              'Si Google Analytics 4 est activé, il pourra être utilisé pour mesurer :',
            ],
            bullets: [
              'Les pages consultées.',
              'Le nombre de visites.',
              'Les interactions avec les fonctionnalités.',
              'Les types d’appareils et de navigateurs.',
              'La fréquentation générale de la plateforme.',
              'Ces cookies ne sont activés qu’après votre consentement lorsque celui-ci est requis.',
            ],
          },
          {
            heading: 'D. Cookies marketing',
            paragraphs: [
              'À la date de cette politique, SPACE LEARN ne déclare pas utiliser de cookies publicitaires ou de ciblage comportemental.',
              'Si de tels outils sont ajoutés, la politique sera mise à jour et les choix nécessaires seront proposés.',
            ],
          },
        ],
      },
      {
        heading: '4. Google Analytics',
        paragraphs: [
          'SPACE LEARN peut utiliser Google Analytics 4, un service de mesure d’audience fourni par Google. À la date de mise à jour de cette politique, aucun code Google Analytics n’est configuré dans l’application.',
          'Si cet outil est activé, il permettra d’obtenir des statistiques générales sur l’utilisation du site afin d’améliorer les contenus et les fonctionnalités. Les données seront traitées selon les paramètres configurés et les conditions de confidentialité de Google.',
          'Les informations directement identifiantes, telles que les mots de passe, les adresses e-mail et les numéros de téléphone, ne doivent pas être transmises à Google Analytics.',
          'L’activation de la mesure d’audience est soumise au mécanisme de consentement mis en place sur le site.',
        ],
      },
      {
        heading: '5. Choix de l’utilisateur',
        paragraphs: ['Lors de sa première visite, l’utilisateur peut :'],
        bullets: [
          'Accepter les cookies non essentiels.',
          'Refuser les cookies non essentiels.',
          'Personnaliser ses préférences.',
          'Les cookies strictement nécessaires au fonctionnement du service restent actifs.',
          'Le simple fait de naviguer sur le site ne vaut pas acceptation des cookies statistiques ou publicitaires.',
        ],
      },
      {
        heading: '6. Modification du consentement',
        paragraphs: [
          'L’utilisateur peut modifier ou retirer son consentement à tout moment.',
          'Le lien permanent « Gérer les cookies » est disponible dans le pied de page de la plateforme.',
          'Le retrait du consentement désactive les préférences facultatives concernées. Aucun traceur statistique ou marketing n’est actuellement configuré.',
        ],
      },
      {
        heading: '7. Durée de conservation',
        paragraphs: [
          'Le choix de consentement est conservé dans le navigateur pendant 6 mois. À l’expiration de cette durée, un nouveau choix est demandé.',
          'Les préférences de langue sont supprimées lorsque le consentement correspondant est retiré. La progression pédagogique reste enregistrée localement dans le navigateur.',
          'Les durées précises des cookies utilisés et des données analytiques dépendront de la configuration effective des services et seront indiquées lors de leur activation.',
        ],
      },
      {
        heading: '8. Contact',
        paragraphs: [
          'Pour toute question relative aux cookies :',
          'E-mail : [Adresse e-mail officielle]',
          'Responsable : [Nom de la personne ou de la structure responsable]',
        ],
      },
      {
        heading: '9. Mise à jour',
        paragraphs: [
          'Cette politique peut être modifiée en fonction de l’évolution des technologies utilisées et des services proposés par SPACE LEARN.',
        ],
      },
    ],
  },
  en: {
    policyTitle: 'Cookie policy',
    policyDescription: 'How SPACE LEARN uses cookies and similar technologies.',
    lastUpdatedLabel: 'Last updated:',
    updatedDate: 'November 15, 2026',
    manageCookies: 'Manage cookies',
    policyLink: 'Cookie policy',
    bannerTitle: 'Your privacy choices',
    bannerDescription: 'Non-essential cookies are used only with your permission. You can accept, reject, or customize your choices.',
    acceptNonessential: 'Accept non-essential cookies',
    rejectNonessential: 'Reject non-essential cookies',
    customize: 'Customize',
    settingsTitle: 'Customize your choices',
    settingsDescription: 'You can change or withdraw your choice at any time using the footer link.',
    necessaryTitle: 'Necessary cookies and storage',
    necessaryDescription: 'Always on: remembering your consent choice and saving your lesson progress and quiz results in this browser.',
    preferencesTitle: 'Preferences',
    preferencesDescription: 'Remember your chosen language on this device. If you decline, your language choice will not be saved after this visit.',
    statisticsTitle: 'Statistics',
    statisticsDescription: 'No audience measurement tool is currently configured. Your choice will not trigger tracking unless a tool is added.',
    marketingTitle: 'Marketing',
    marketingDescription: 'No advertising cookies or behavioral targeting tools are used. This category remains disabled.',
    alwaysOn: 'Always on',
    saveChoices: 'Save my choices',
    cancel: 'Cancel',
    storageError: 'Your browser could not save your choice. It will apply to this visit only; check your browser storage settings to keep it.',
    sections: [
      {
        heading: '1. What is a cookie?',
        paragraphs: [
          'A cookie is a small file stored in a user’s browser or on their device when they visit a website.',
          'It can be used to remember preferences, maintain a session, or measure website traffic.',
          'Other similar technologies may also be used to collect information about browsing activity.',
        ],
      },
      {
        heading: '2. Why do we use cookies?',
        paragraphs: ['SPACE LEARN may use cookies or similar technologies to:'],
        bullets: [
          'Ensure that the platform works properly.',
          'Secure connections.',
          'Remember browsing preferences.',
          'Store consent choices.',
          'Measure website traffic.',
          'Improve educational features.',
        ],
      },
      {
        heading: '3. Cookie categories',
        subsections: [
          {
            heading: 'A. Necessary cookies',
            paragraphs: [
              'They are essential to the technical operation of the site. They may help maintain a connection, secure forms, and remember consent choices.',
              'They do not require consent only when they genuinely meet the applicable criteria for strictly necessary cookies.',
              'Lesson progress and quiz results are kept in the browser’s local storage to provide the “My progress” feature.',
            ],
          },
          {
            heading: 'B. Preference cookies',
            paragraphs: [
              'They remember preferences such as the interface language.',
              'The language is stored on your device only if you consent to this category.',
            ],
          },
          {
            heading: 'C. Statistics cookies',
            paragraphs: ['If Google Analytics 4 is enabled, it may be used to measure:'],
            bullets: [
              'Pages viewed.',
              'Number of visits.',
              'Interactions with features.',
              'Types of devices and browsers.',
              'General platform traffic.',
              'These cookies are enabled only after your consent when it is required.',
            ],
          },
          {
            heading: 'D. Marketing cookies',
            paragraphs: [
              'As of the date of this policy, SPACE LEARN does not declare using advertising or behavioral targeting cookies.',
              'If such tools are added, this policy will be updated and the necessary choices will be offered.',
            ],
          },
        ],
      },
      {
        heading: '4. Google Analytics',
        paragraphs: [
          'SPACE LEARN may use Google Analytics 4, an audience measurement service provided by Google. As of this policy’s update date, no Google Analytics code is configured in the application.',
          'If enabled, this tool will provide general statistics about site usage to help improve content and features. Data will be processed according to the configured settings and Google’s privacy terms.',
          'Directly identifying information, such as passwords, email addresses, and phone numbers, must not be sent to Google Analytics.',
          'Audience measurement is subject to the consent mechanism provided on the site.',
        ],
      },
      {
        heading: '5. User choices',
        paragraphs: ['On their first visit, users can:'],
        bullets: [
          'Accept non-essential cookies.',
          'Reject non-essential cookies.',
          'Customize their preferences.',
          'Cookies that are strictly necessary for the service remain active.',
          'Simply browsing the site does not constitute acceptance of statistics or advertising cookies.',
        ],
      },
      {
        heading: '6. Changing consent',
        paragraphs: [
          'Users can change or withdraw their consent at any time.',
          'A permanent “Manage cookies” link is available in the platform footer.',
          'Withdrawing consent disables the affected optional preferences. No statistics or marketing tracker is currently configured.',
        ],
      },
      {
        heading: '7. Retention period',
        paragraphs: [
          'The consent choice is stored in the browser for 6 months. A new choice is requested when it expires.',
          'Language preferences are deleted when the related consent is withdrawn. Learning progress remains stored locally in the browser.',
          'The exact retention periods for any cookies and analytics data will depend on the services actually configured and will be stated when they are enabled.',
        ],
      },
      {
        heading: '8. Contact',
        paragraphs: [
          'For questions about cookies:',
          'Email: [Official email address]',
          'Responsible person: [Name of the person or organization responsible]',
        ],
      },
      {
        heading: '9. Updates',
        paragraphs: [
          'This policy may be changed as the technologies used and services offered by SPACE LEARN evolve.',
        ],
      },
    ],
  },
}

