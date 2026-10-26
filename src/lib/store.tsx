"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  eventColors,
  folderNames,
  initialState,
  subscriptionColors,
  type DeviceKind,
  type MailBox,
  type PanelState,
} from "@/lib/data";
import { clearFiles, deleteFile, saveFile } from "@/lib/files";
import { clock, isoDate, roundMoney, uid } from "@/lib/format";

const LEGACY_KEY = "panel-state-v1";
const ACCOUNT_KEY = "panel-apple-account";

export type AppleAccount = {
  appleId: string;
  firstName: string;
  lastName: string;
};

type Scene = "off" | "evening" | "home";

type PanelApi = PanelState & {
  ready: boolean;
  account: AppleAccount | null;
  signIn: (input: AppleAccount) => void;
  signOut: () => void;
  openMail: (id: string) => void;
  toggleMailRead: (id: string) => void;
  moveMail: (id: string, box: MailBox) => void;
  sendMail: (input: { to: string; subject: string; body: string }) => void;
  openConversation: (id: string) => void;
  sendMessage: (id: string, text: string) => void;
  createConversation: (name: string) => string;
  toggleDevice: (roomId: string, deviceId: string) => void;
  applyScene: (scene: Scene) => void;
  setTrack: (id: string) => void;
  addTrack: (input: { title: string; artist: string }) => void;
  removeTrack: (id: string) => void;
  addTransaction: (input: {
    accountId: string;
    label: string;
    amount: number;
    category: string;
    income: boolean;
  }) => void;
  transfer: (input: { fromId: string; toId: string; amount: number; label: string }) => void;
  addEvent: (input: { title: string; time: string; place: string; date: string }) => void;
  removeEvent: (id: string) => void;
  addSubscription: (input: { name: string; price: number; next: string }) => void;
  removeSubscription: (id: string) => void;
  addDocument: (input: { name: string; folder: string; size: string; file?: Blob }) => Promise<void>;
  removeDocument: (id: string) => void;
  reset: () => void;
};

const PanelContext = createContext<PanelApi | null>(null);

function valueFor(kind: DeviceKind, on: boolean, previous: string) {
  if (!on) {
    if (kind === "lock") return "Ouverte";
    if (kind === "cover") return "Fermés";
    return "Off";
  }
  if (kind === "lock") return "Verrouillée";
  if (kind === "cover") return "Ouverts";
  if (kind === "cam") return "Live";
  if (kind === "climate") return previous.includes("°") ? previous : "21,5°";
  if (kind === "light") return previous.includes("%") ? previous : "On";
  return "On";
}

function sceneOn(scene: Scene, id: string) {
  if (scene === "off") return false;
  if (scene === "evening") return id === "d1" || id === "d3" || id === "d4" || id === "d6" || id === "d7";
  return id !== "d2" && id !== "d4" && id !== "d6";
}

function normalize(raw: Partial<PanelState> | null): PanelState {
  const base = initialState();
  if (!raw) return base;
  return {
    mails: Array.isArray(raw.mails) ? raw.mails.map((mail) => ({ ...mail, box: mail.box ?? "inbox", body: mail.body ?? mail.preview })) : base.mails,
    conversations: Array.isArray(raw.conversations) ? raw.conversations : base.conversations,
    rooms: Array.isArray(raw.rooms) ? raw.rooms : base.rooms,
    tracks: Array.isArray(raw.tracks) ? raw.tracks : base.tracks,
    trackId: typeof raw.trackId === "string" ? raw.trackId : base.trackId,
    accounts: Array.isArray(raw.accounts) ? raw.accounts : base.accounts,
    transactions: Array.isArray(raw.transactions)
      ? raw.transactions.map((tx) => ({ ...tx, accountId: tx.accountId ?? "a1" }))
      : base.transactions,
    events: Array.isArray(raw.events) ? raw.events : base.events,
    subscriptions: Array.isArray(raw.subscriptions) ? raw.subscriptions : base.subscriptions,
    documents: Array.isArray(raw.documents)
      ? raw.documents.map((doc) => ({ ...doc, hasFile: Boolean(doc.hasFile) }))
      : base.documents,
  };
}

function stateKey(appleId: string) {
  return `panel-state:${appleId}`;
}

function readState(raw: string | null) {
  if (!raw) return null;
  return normalize(JSON.parse(raw) as Partial<PanelState>);
}

function loadState(appleId: string) {
  try {
    const saved = readState(localStorage.getItem(stateKey(appleId)));
    if (saved) return saved;
    const legacy = readState(localStorage.getItem(LEGACY_KEY));
    if (legacy) {
      localStorage.setItem(stateKey(appleId), JSON.stringify(legacy));
      return legacy;
    }
  } catch {
    /* données de départ */
  }
  return initialState();
}

export function PanelProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PanelState>(initialState);
  const [account, setAccount] = useState<AppleAccount | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ACCOUNT_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as AppleAccount;
        setAccount(saved);
        setState(loadState(saved.appleId));
      }
    } catch {
      /* reste sur l’écran de connexion */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !account) return;
    localStorage.setItem(stateKey(account.appleId), JSON.stringify(state));
  }, [account, ready, state]);

  const openMail = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      mails: current.mails.map((mail) => (mail.id === id ? { ...mail, unread: false } : mail)),
    }));
  }, []);

  const toggleMailRead = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      mails: current.mails.map((mail) => (mail.id === id ? { ...mail, unread: !mail.unread } : mail)),
    }));
  }, []);

  const moveMail = useCallback((id: string, box: MailBox) => {
    setState((current) => ({
      ...current,
      mails: current.mails.map((mail) => (mail.id === id ? { ...mail, box, unread: box === "inbox" ? mail.unread : false } : mail)),
    }));
  }, []);

  const sendMail = useCallback((input: { to: string; subject: string; body: string }) => {
    const body = input.body.trim();
    setState((current) => ({
      ...current,
      mails: [
        {
          id: uid("m"),
          from: account ? `${account.firstName} ${account.lastName}`.trim() : "Moi",
          email: input.to.trim(),
          subject: input.subject.trim() || "(sans objet)",
          preview: body.slice(0, 140) || "Message vide",
          body: body || "Message vide",
          time: clock(),
          unread: false,
          tag: "Envoyé",
          box: "sent",
        },
        ...current.mails,
      ],
    }));
  }, [account]);

  const openConversation = useCallback((id: string) => {
    setState((current) => {
      const thread = current.conversations.find((item) => item.id === id);
      if (!thread || thread.unread === 0) return current;
      return {
        ...current,
        conversations: current.conversations.map((item) => (item.id === id ? { ...item, unread: 0 } : item)),
      };
    });
  }, []);

  const sendMessage = useCallback((id: string, text: string) => {
    const time = clock();
    setState((current) => ({
      ...current,
      conversations: current.conversations.map((thread) =>
        thread.id === id
          ? {
              ...thread,
              last: text,
              time,
              messages: [...thread.messages, { fromMe: true, text, time }],
            }
          : thread,
      ),
    }));
  }, []);

  const createConversation = useCallback((name: string) => {
    const id = uid("c");
    setState((current) => ({
      ...current,
      conversations: [
        { id, name: name.trim(), last: "Nouvelle conversation", time: clock(), unread: 0, messages: [] },
        ...current.conversations,
      ],
    }));
    return id;
  }, []);

  const toggleDevice = useCallback((roomId: string, deviceId: string) => {
    setState((current) => ({
      ...current,
      rooms: current.rooms.map((room) =>
        room.id !== roomId
          ? room
          : {
              ...room,
              devices: room.devices.map((device) => {
                if (device.id !== deviceId) return device;
                const on = !device.on;
                return { ...device, on, value: valueFor(device.kind, on, device.value) };
              }),
            },
      ),
    }));
  }, []);

  const applyScene = useCallback((scene: Scene) => {
    setState((current) => ({
      ...current,
      rooms: current.rooms.map((room) => ({
        ...room,
        devices: room.devices.map((device) => {
          const on = sceneOn(scene, device.id);
          return { ...device, on, value: valueFor(device.kind, on, device.value) };
        }),
      })),
    }));
  }, []);

  const setTrack = useCallback((id: string) => {
    setState((current) => ({ ...current, trackId: id }));
  }, []);

  const addTrack = useCallback((input: { title: string; artist: string }) => {
    const id = uid("t");
    setState((current) => ({
      ...current,
      trackId: id,
      tracks: [...current.tracks, { id, title: input.title.trim(), artist: input.artist.trim() || "Inconnu", duration: "3:00" }],
    }));
  }, []);

  const removeTrack = useCallback((id: string) => {
    setState((current) => {
      const tracks = current.tracks.filter((track) => track.id !== id);
      return {
        ...current,
        tracks,
        trackId: current.trackId === id ? (tracks[0]?.id ?? "") : current.trackId,
      };
    });
  }, []);

  const addTransaction = useCallback(
    (input: { accountId: string; label: string; amount: number; category: string; income: boolean }) => {
      const signed = input.income ? input.amount : -input.amount;
      setState((current) => ({
        ...current,
        accounts: current.accounts.map((account) =>
          account.id === input.accountId ? { ...account, balance: roundMoney(account.balance + signed) } : account,
        ),
        transactions: [
          {
            id: uid("tx"),
            accountId: input.accountId,
            label: input.label.trim(),
            amount: signed,
            date: isoDate(),
            category: input.category,
          },
          ...current.transactions,
        ],
      }));
    },
    [],
  );

  const transfer = useCallback((input: { fromId: string; toId: string; amount: number; label: string }) => {
    if (input.fromId === input.toId) return;
    const label = input.label.trim() || "Virement";
    setState((current) => ({
      ...current,
      accounts: current.accounts.map((account) => {
        if (account.id === input.fromId) return { ...account, balance: roundMoney(account.balance - input.amount) };
        if (account.id === input.toId) return { ...account, balance: roundMoney(account.balance + input.amount) };
        return account;
      }),
      transactions: [
        { id: uid("tx"), accountId: input.toId, label, amount: input.amount, date: isoDate(), category: "Transfert" },
        { id: uid("tx"), accountId: input.fromId, label, amount: -input.amount, date: isoDate(), category: "Transfert" },
        ...current.transactions,
      ],
    }));
  }, []);

  const addEvent = useCallback((input: { title: string; time: string; place: string; date: string }) => {
    setState((current) => ({
      ...current,
      events: [
        ...current.events,
        {
          id: uid("e"),
          date: input.date,
          time: input.time,
          title: input.title.trim(),
          place: input.place.trim() || "Sans lieu",
          color: eventColors[current.events.length % eventColors.length],
        },
      ],
    }));
  }, []);

  const removeEvent = useCallback((id: string) => {
    setState((current) => ({ ...current, events: current.events.filter((event) => event.id !== id) }));
  }, []);

  const addSubscription = useCallback((input: { name: string; price: number; next: string }) => {
    setState((current) => ({
      ...current,
      subscriptions: [
        ...current.subscriptions,
        {
          id: uid("s"),
          name: input.name.trim(),
          price: input.price,
          cycle: "mensuel",
          next: input.next,
          color: subscriptionColors[current.subscriptions.length % subscriptionColors.length],
        },
      ],
    }));
  }, []);

  const removeSubscription = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      subscriptions: current.subscriptions.filter((item) => item.id !== id),
    }));
  }, []);

  const addDocument = useCallback(async (input: { name: string; folder: string; size: string; file?: Blob }) => {
    const id = uid("doc");
    if (input.file) await saveFile(id, input.file);
    const folder = folderNames.includes(input.folder) ? input.folder : input.folder.trim() || "Identité";
    setState((current) => ({
      ...current,
      documents: [
        {
          id,
          name: input.name.trim(),
          folder,
          size: input.size,
          updated: isoDate(),
          hasFile: Boolean(input.file),
        },
        ...current.documents,
      ],
    }));
  }, []);

  const removeDocument = useCallback((id: string) => {
    setState((current) => ({ ...current, documents: current.documents.filter((doc) => doc.id !== id) }));
    void deleteFile(id);
  }, []);

  const signIn = useCallback((input: AppleAccount) => {
    const saved: AppleAccount = {
      appleId: input.appleId.trim().toLowerCase(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
    };
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(saved));
    setAccount(saved);
    setState(loadState(saved.appleId));
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(ACCOUNT_KEY);
    setAccount(null);
  }, []);

  const reset = useCallback(() => {
    setState(initialState());
    if (account) localStorage.removeItem(stateKey(account.appleId));
    void clearFiles();
  }, [account]);

  const api = useMemo<PanelApi>(
    () => ({
      ...state,
      ready,
      account,
      signIn,
      signOut,
      openMail,
      toggleMailRead,
      moveMail,
      sendMail,
      openConversation,
      sendMessage,
      createConversation,
      toggleDevice,
      applyScene,
      setTrack,
      addTrack,
      removeTrack,
      addTransaction,
      transfer,
      addEvent,
      removeEvent,
      addSubscription,
      removeSubscription,
      addDocument,
      removeDocument,
      reset,
    }),
    [
      state,
      ready,
      account,
      signIn,
      signOut,
      openMail,
      toggleMailRead,
      moveMail,
      sendMail,
      openConversation,
      sendMessage,
      createConversation,
      toggleDevice,
      applyScene,
      setTrack,
      addTrack,
      removeTrack,
      addTransaction,
      transfer,
      addEvent,
      removeEvent,
      addSubscription,
      removeSubscription,
      addDocument,
      removeDocument,
      reset,
    ],
  );

  return <PanelContext.Provider value={api}>{children}</PanelContext.Provider>;
}

export function usePanel() {
  const value = useContext(PanelContext);
  if (!value) throw new Error("usePanel doit être utilisé dans PanelProvider");
  return value;
}
