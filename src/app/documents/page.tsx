"use client";

import { useMemo, useState } from "react";
import { Card, Field, PrimaryButton, Screen, SelectField, Sheet } from "@/components/ui";
import { folderNames } from "@/lib/data";
import { loadFile } from "@/lib/files";
import { formatBytes, formatShortDate, withAccount } from "@/lib/format";
import { usePanel } from "@/lib/store";

export default function DocumentsPage() {
  const { documents, addDocument, removeDocument, account } = usePanel();
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [dest, setDest] = useState(folderNames[0]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [active, setActive] = useState<string | null>(null);

  const folders = useMemo(() => {
    const names = new Set<string>(folderNames);
    documents.forEach((doc) => names.add(doc.folder));
    return [...names];
  }, [documents]);

  const list = useMemo(
    () =>
      documents.filter((doc) => {
        const hit = doc.name.toLowerCase().includes(query.trim().toLowerCase());
        return hit && (!folder || doc.folder === folder);
      }),
    [documents, query, folder],
  );

  const current = documents.find((doc) => doc.id === active) ?? null;

  return (
    <Screen
      title="Documents"
      subtitle={withAccount("iCloud Drive", account?.appleId)}
      action={
        <PrimaryButton className="mb-1 px-3.5 text-[14px]" onClick={() => setOpen(true)}>
          Ajouter
        </PrimaryButton>
      }
    >
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Rechercher"
        className="search-field mb-4"
      />
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        {folders.map((name) => {
          const count = documents.filter((doc) => doc.folder === name).length;
          return (
            <button
              key={name}
              type="button"
              onClick={() => setFolder((currentFolder) => (currentFolder === name ? null : name))}
              className={`rounded-[14px] p-4 text-left ${folder === name ? "bg-apple text-white" : "bg-surface"}`}
            >
              <p className="text-[15px] font-medium">{name}</p>
              <p className={`text-[12px] ${folder === name ? "text-white/80" : "text-muted"}`}>{count} fichier{count > 1 ? "s" : ""}</p>
            </button>
          );
        })}
      </div>
      <Card>
        {list.length === 0 ? <p className="px-4 py-6 text-[14px] text-muted">Aucun document.</p> : null}
        {list.map((doc, index) => (
          <button
            key={doc.id}
            type="button"
            onClick={() => setActive(doc.id)}
            className={`flex w-full items-center justify-between px-4 py-3 text-left ${
              index === list.length - 1 ? "" : "border-b border-line"
            }`}
          >
            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium">{doc.name}</p>
              <p className="text-[12px] text-muted">
                {doc.folder} · {doc.size} · {formatShortDate(doc.updated)}
              </p>
            </div>
          </button>
        ))}
      </Card>

      <Sheet
        open={open}
        title="Ajouter un document"
        onClose={() => {
          setOpen(false);
          setError("");
        }}
      >
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim() && !file) {
              setError("Donne un nom ou choisis un fichier.");
              return;
            }
            if (file && file.size > 8 * 1024 * 1024) {
              setError("Fichier trop lourd (8 Mo maximum).");
              return;
            }
            void addDocument({
              name: name.trim() || file?.name || "Document",
              folder: dest,
              size: file ? formatBytes(file.size) : "Note",
              file: file ?? undefined,
            })
              .then(() => {
                setName("");
                setFile(null);
                setError("");
                setOpen(false);
              })
              .catch(() => setError("Impossible d’enregistrer le fichier."));
          }}
        >
          <Field label="Nom" value={name} onChange={(event) => setName(event.target.value)} placeholder="Quittance.pdf" />
          <SelectField label="Dossier" value={dest} onChange={(event) => setDest(event.target.value)}>
            {folders.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </SelectField>
          <label className="block">
            <span className="mb-1.5 block text-[12px] text-muted">Fichier</span>
            <input
              type="file"
              className="block w-full text-[14px] text-muted file:mr-3 file:rounded-full file:border-0 file:bg-raised file:px-3 file:py-2 file:text-ink"
              onChange={(event) => {
                const picked = event.target.files?.[0] ?? null;
                setFile(picked);
                if (picked && !name.trim()) setName(picked.name);
              }}
            />
          </label>
          {error ? <p className="text-[13px] text-apple-red">{error}</p> : null}
          <PrimaryButton type="submit" className="w-full">
            Enregistrer
          </PrimaryButton>
        </form>
      </Sheet>

      <Sheet open={Boolean(current)} title={current?.name ?? "Document"} onClose={() => setActive(null)}>
        {current ? (
          <div className="grid gap-3">
            <p className="text-[14px] text-muted">
              {current.folder} · {current.size} · {formatShortDate(current.updated)}
            </p>
            {current.hasFile ? (
              <PrimaryButton
                onClick={() => {
                  void loadFile(current.id).then((blob) => {
                    if (!blob) return;
                    const url = URL.createObjectURL(blob);
                    window.open(url, "_blank", "noopener,noreferrer");
                  });
                }}
              >
                Ouvrir
              </PrimaryButton>
            ) : (
              <p className="text-[14px] text-muted">Fiche enregistrée, sans fichier joint.</p>
            )}
            <button
              type="button"
              className="h-11 rounded-full bg-raised text-[15px]"
              onClick={() => {
                removeDocument(current.id);
                setActive(null);
              }}
            >
              Supprimer
            </button>
          </div>
        ) : null}
      </Sheet>
    </Screen>
  );
}
