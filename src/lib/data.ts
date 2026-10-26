export type MailBox = "inbox" | "sent" | "archive";

export type Mail = {
  id: string;
  from: string;
  email: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  unread: boolean;
  tag: string;
  box: MailBox;
};

export type ChatMessage = {
  fromMe: boolean;
  text: string;
  time: string;
};

export type Conversation = {
  id: string;
  name: string;
  last: string;
  time: string;
  unread: number;
  messages: ChatMessage[];
};

export type DeviceKind = "light" | "tv" | "climate" | "cover" | "lock" | "cam";

export type Device = {
  id: string;
  name: string;
  kind: DeviceKind;
  on: boolean;
  value: string;
};

export type Room = {
  id: string;
  name: string;
  devices: Device[];
};

export type Track = {
  id: string;
  title: string;
  artist: string;
  duration: string;
};

export type Account = {
  id: string;
  name: string;
  bank: string;
  balance: number;
  iban: string;
};

export type Transaction = {
  id: string;
  accountId: string;
  label: string;
  amount: number;
  date: string;
  category: string;
};

export type CalendarEvent = {
  id: string;
  date: string;
  time: string;
  title: string;
  place: string;
  color: string;
};

export type Subscription = {
  id: string;
  name: string;
  price: number;
  cycle: string;
  next: string;
  color: string;
};

export type DocumentItem = {
  id: string;
  name: string;
  folder: string;
  size: string;
  updated: string;
  hasFile: boolean;
};

export type PanelState = {
  mails: Mail[];
  conversations: Conversation[];
  rooms: Room[];
  tracks: Track[];
  trackId: string;
  accounts: Account[];
  transactions: Transaction[];
  events: CalendarEvent[];
  subscriptions: Subscription[];
  documents: DocumentItem[];
};

export const profile = {
  firstName: "Théo",
  city: "Paris",
};

export const playlistTitle = "Soirée calme";

export const folderNames = ["Identité", "Banque", "Santé", "Logement"];

export const subscriptionColors = ["#0A84FF", "#30D158", "#FF9F0A", "#BF5AF2", "#FF453A", "#64D2FF", "#5E5CE6"];

export const eventColors = ["#30D158", "#FF9F0A", "#FF453A", "#0A84FF", "#BF5AF2"];

export const seed: PanelState = {
  mails: [
    {
      id: "m1",
      from: "Apple",
      email: "no_reply@email.apple.com",
      subject: "Votre reçu App Store",
      preview: "Abonnement iCloud+ 200 Go — 2,99 € ont été débités.",
      body: "Bonjour Théo,\n\nAbonnement iCloud+ 200 Go — 2,99 € ont été débités sur votre moyen de paiement.\n\nDate : 25 octobre 2026\nRéférence : APL-204918",
      time: "09:14",
      unread: true,
      tag: "Factures",
      box: "inbox",
    },
    {
      id: "m2",
      from: "SNCF Connect",
      email: "noreply@sncf-connect.com",
      subject: "Billet confirmé — Paris → Lyon",
      preview: "Départ demain 08:52, TGV 6615, voiture 8 place 43.",
      body: "Votre billet est confirmé.\n\nParis Gare de Lyon → Lyon Part-Dieu\nDemain, 08:52 — TGV 6615\nVoiture 8, place 43.\n\nPrésentez le QR code à la montée.",
      time: "08:02",
      unread: true,
      tag: "Voyage",
      box: "inbox",
    },
    {
      id: "m3",
      from: "Amélie Martin",
      email: "amelie@studio.fr",
      subject: "Maquette panel v2",
      preview: "Je t’envoie les écrans iOS ce soir, dis-moi si le dock te va.",
      body: "Salut,\n\nJe t’envoie les écrans iOS ce soir, dis-moi si le dock te va.\nLa version Windows garde la barre latérale.\n\nAmélie",
      time: "Hier",
      unread: false,
      tag: "Perso",
      box: "inbox",
    },
    {
      id: "m4",
      from: "EDF",
      email: "contact@edf.fr",
      subject: "Facture d’électricité octobre",
      preview: "Montant : 68,40 € — prélèvement le 28 octobre.",
      body: "Votre facture d’électricité d’octobre est disponible.\n\nMontant : 68,40 €\nPrélèvement prévu le 28 octobre.",
      time: "Lun.",
      unread: false,
      tag: "Maison",
      box: "inbox",
    },
  ],
  conversations: [
    {
      id: "c1",
      name: "Léa",
      last: "On se voit vers 19h au canal ?",
      time: "18:21",
      unread: 2,
      messages: [
        { fromMe: false, text: "Tu sors ce soir ?", time: "18:02" },
        { fromMe: true, text: "Oui, j’ai fini vers 18h30.", time: "18:11" },
        { fromMe: false, text: "On se voit vers 19h au canal ?", time: "18:21" },
      ],
    },
    {
      id: "c2",
      name: "Équipe studio",
      last: "Build PWA OK sur iPhone",
      time: "16:44",
      unread: 0,
      messages: [
        { fromMe: false, text: "Quelqu’un a testé l’ajout à l’écran d’accueil ?", time: "16:30" },
        { fromMe: true, text: "Oui, ça se lance en plein écran.", time: "16:40" },
        { fromMe: false, text: "Build PWA OK sur iPhone", time: "16:44" },
      ],
    },
    {
      id: "c3",
      name: "Papa",
      last: "J’ai mis le colis dans l’entrée.",
      time: "Hier",
      unread: 0,
      messages: [
        { fromMe: false, text: "J’ai mis le colis dans l’entrée.", time: "Hier" },
        { fromMe: true, text: "Parfait, merci !", time: "Hier" },
      ],
    },
  ],
  rooms: [
    {
      id: "salon",
      name: "Salon",
      devices: [
        { id: "d1", name: "Lumière canapé", kind: "light", on: true, value: "72%" },
        { id: "d2", name: "TV", kind: "tv", on: false, value: "Off" },
        { id: "d3", name: "Température", kind: "climate", on: true, value: "21,5°" },
      ],
    },
    {
      id: "chambre",
      name: "Chambre",
      devices: [
        { id: "d4", name: "Chevet", kind: "light", on: false, value: "Off" },
        { id: "d5", name: "Volets", kind: "cover", on: true, value: "Ouverts" },
      ],
    },
    {
      id: "entree",
      name: "Entrée",
      devices: [
        { id: "d6", name: "Serrure", kind: "lock", on: true, value: "Verrouillée" },
        { id: "d7", name: "Caméra", kind: "cam", on: true, value: "Live" },
      ],
    },
  ],
  tracks: [
    { id: "t1", title: "Night Drive", artist: "Kiasmos", duration: "4:12" },
    { id: "t2", title: "Weightless", artist: "Marconi Union", duration: "8:00" },
    { id: "t3", title: "Holocene", artist: "Bon Iver", duration: "5:36" },
    { id: "t4", title: "Nuvole Bianche", artist: "Ludovico Einaudi", duration: "5:57" },
  ],
  trackId: "t1",
  accounts: [
    { id: "a1", name: "Compte courant", bank: "BoursoBank", balance: 2840.17, iban: "FR76 •••• 4412" },
    { id: "a2", name: "Livret A", bank: "Crédit Mutuel", balance: 12150, iban: "FR76 •••• 8891" },
  ],
  transactions: [
    { id: "tx1", accountId: "a1", label: "Apple", amount: -2.99, date: "2026-10-25", category: "Abonnements" },
    { id: "tx2", accountId: "a1", label: "Monoprix", amount: -23.4, date: "2026-10-25", category: "Courses" },
    { id: "tx3", accountId: "a1", label: "Virement Léa", amount: 40, date: "2026-10-24", category: "Transfert" },
    { id: "tx4", accountId: "a1", label: "EDF", amount: -68.4, date: "2026-10-19", category: "Maison" },
    { id: "tx5", accountId: "a1", label: "Salaire", amount: 2450, date: "2026-10-25", category: "Revenus" },
  ],
  events: [
    { id: "e1", date: "2026-10-25", time: "09:00", title: "Stand-up équipe", place: "Meet", color: "#30D158" },
    { id: "e2", date: "2026-10-25", time: "12:30", title: "Déjeuner Léa", place: "Canal Saint-Martin", color: "#FF9F0A" },
    { id: "e3", date: "2026-10-25", time: "16:00", title: "Médecin", place: "12e arr.", color: "#FF453A" },
    { id: "e4", date: "2026-10-25", time: "19:00", title: "Ciné", place: "UGC Opéra", color: "#0A84FF" },
  ],
  subscriptions: [
    { id: "s1", name: "iCloud+", price: 2.99, cycle: "mensuel", next: "2026-11-02", color: "#A2AAAD" },
    { id: "s2", name: "Spotify", price: 10.99, cycle: "mensuel", next: "2026-11-08", color: "#1DB954" },
    { id: "s3", name: "Netflix", price: 13.49, cycle: "mensuel", next: "2026-11-12", color: "#E50914" },
    { id: "s4", name: "ChatGPT Plus", price: 20, cycle: "mensuel", next: "2026-11-18", color: "#10A37F" },
    { id: "s5", name: "SFR Fibre", price: 29.99, cycle: "mensuel", next: "2026-11-05", color: "#E2001A" },
  ],
  documents: [
    { id: "doc1", name: "Passeport.pdf", folder: "Identité", size: "1,2 Mo", updated: "2026-01-12", hasFile: false },
    { id: "doc2", name: "RIB BoursoBank.pdf", folder: "Banque", size: "240 Ko", updated: "2026-03-03", hasFile: false },
    { id: "doc3", name: "Attestation assurance.pdf", folder: "Logement", size: "890 Ko", updated: "2026-09-01", hasFile: false },
    { id: "doc4", name: "Ordonnance oct-2026.pdf", folder: "Santé", size: "510 Ko", updated: "2026-10-04", hasFile: false },
    { id: "doc5", name: "Quittance loyer.pdf", folder: "Logement", size: "180 Ko", updated: "2026-10-01", hasFile: false },
  ],
};

export function initialState(): PanelState {
  return structuredClone(seed);
}

export function euro(n: number) {
  const negative = n < 0;
  const [int, dec] = Math.abs(n).toFixed(2).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  return `${negative ? "−" : ""}${grouped},${dec}\u00a0€`;
}
