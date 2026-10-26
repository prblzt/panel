import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { initialState } from "@/lib/data";
import { clearFiles } from "@/lib/files";
import { PanelProvider, usePanel } from "@/lib/store";

vi.mock("@/lib/files", () => ({
  saveFile: vi.fn(async () => {}),
  loadFile: vi.fn(async () => undefined),
  deleteFile: vi.fn(async () => {}),
  clearFiles: vi.fn(async () => {}),
}));

const accountKey = "panel-apple-account";
const stateKey = "panel-state:lea@exemple.fr";
const profile = { appleId: "Lea@exemple.fr", firstName: "Léa", lastName: "Martin" };

function wrapper({ children }: { children: ReactNode }) {
  return <PanelProvider>{children}</PanelProvider>;
}

async function openPanel() {
  const rendered = renderHook(() => usePanel(), { wrapper });
  await waitFor(() => expect(rendered.result.current.ready).toBe(true));
  return rendered;
}

async function signIn(result: { current: ReturnType<typeof usePanel> }) {
  await act(async () => {
    result.current.signIn(profile);
  });
}

describe("mémoire locale du tableau de bord", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(clearFiles).mockClear();
  });

  test("enregistre une modification dans le navigateur", async () => {
    const { result } = await openPanel();
    await signIn(result);

    await act(async () => {
      result.current.sendMail({
        to: "ami@exemple.fr",
        subject: "Note locale",
        body: "Ce message reste sur cet appareil.",
      });
    });

    await waitFor(() => {
      const saved = localStorage.getItem(stateKey);
      expect(saved).toContain("Note locale");
    });
    expect(JSON.parse(localStorage.getItem(accountKey) ?? "")).toMatchObject({
      appleId: "lea@exemple.fr",
      firstName: "Léa",
    });
  });

  test("la déconnexion garde les données enregistrées", async () => {
    const first = await openPanel();
    await signIn(first.result);
    await act(async () => {
      first.result.current.addTransaction({
        accountId: "a1",
        label: "Courses test",
        amount: 10,
        category: "Courses",
        income: false,
      });
    });
    await waitFor(() => expect(localStorage.getItem(stateKey)).toContain("Courses test"));

    await act(async () => {
      first.result.current.signOut();
    });

    expect(first.result.current.account).toBeNull();
    expect(localStorage.getItem(accountKey)).toBeNull();
    expect(localStorage.getItem(stateKey)).toContain("Courses test");
    first.unmount();

    const second = await openPanel();
    expect(second.result.current.account).toBeNull();
    await signIn(second.result);

    expect(second.result.current.transactions.some((item) => item.label === "Courses test")).toBe(true);
    expect(second.result.current.accounts[0]?.balance).toBe(2830.17);
  });

  test("la réinitialisation remet les données de démonstration", async () => {
    const demo = initialState();
    const { result, unmount } = await openPanel();
    await signIn(result);
    await act(async () => {
      result.current.sendMail({
        to: "ami@exemple.fr",
        subject: "Note locale",
        body: "À effacer",
      });
    });
    await waitFor(() => expect(localStorage.getItem(stateKey)).toContain("Note locale"));

    await act(async () => {
      result.current.reset();
    });

    expect(result.current.mails.map((mail) => mail.id)).toEqual(demo.mails.map((mail) => mail.id));
    expect(result.current.accounts).toEqual(demo.accounts);
    expect(result.current.transactions).toEqual(demo.transactions);
    expect(clearFiles).toHaveBeenCalledOnce();

    await waitFor(() => {
      const saved = localStorage.getItem(stateKey);
      expect(saved).not.toContain("Note locale");
      expect(saved).toContain("Votre reçu App Store");
    });
    unmount();

    const again = await openPanel();
    await signIn(again.result);
    expect(again.result.current.mails.map((mail) => mail.subject)).toEqual(demo.mails.map((mail) => mail.subject));
    expect(again.result.current.accounts[0]?.balance).toBe(2840.17);
  });
});
