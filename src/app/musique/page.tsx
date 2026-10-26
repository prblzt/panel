"use client";

import { useEffect, useRef, useState } from "react";
import { IconPause, IconPlay, IconSkip } from "@/components/icons";
import { Field, PrimaryButton, Screen, Sheet } from "@/components/ui";
import { durationSeconds, withAccount } from "@/lib/format";
import { usePanel } from "@/lib/store";

export default function MusiquePage() {
  const { tracks, trackId, setTrack, addTrack, removeTrack, account } = usePanel();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const track = tracks.find((item) => item.id === trackId) ?? tracks[0];
  const tracksRef = useRef(tracks);
  const trackRef = useRef(track);
  tracksRef.current = tracks;
  trackRef.current = track;

  function go(step: number) {
    if (!tracks.length) return;
    const index = Math.max(0, tracks.findIndex((item) => item.id === track?.id));
    const next = tracks[(index + step + tracks.length) % tracks.length];
    setTrack(next.id);
    setProgress(0);
    setPlaying(true);
  }

  useEffect(() => {
    if (!playing || !track) return;
    const total = Math.max(durationSeconds(track.duration), 1);
    const timer = window.setInterval(() => {
      setProgress((value) => (value + 1 / total >= 1 ? 1 : value + 1 / total));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing, track]);

  useEffect(() => {
    if (!playing || progress < 1) return;
    const list = tracksRef.current;
    const current = trackRef.current;
    const index = list.findIndex((item) => item.id === current?.id);
    const following = list[index + 1];
    setProgress(0);
    if (following) setTrack(following.id);
  }, [playing, progress, setTrack]);

  return (
    <Screen
      title="Musique"
      subtitle={withAccount("Apple Music", account?.appleId)}
      action={
        <PrimaryButton className="mb-1 h-9 px-3.5 text-[14px]" onClick={() => setAdding(true)}>
          Ajouter
        </PrimaryButton>
      }
    >
      <div className="overflow-hidden rounded-[28px] bg-[#1d1d1f] p-6 text-white">
        <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#fa2d48] to-[#ff8fa3] text-5xl shadow-2xl">
          ♪
        </div>
        <h2 className="mt-5 text-[22px] font-semibold">{track?.title ?? "Playlist vide"}</h2>
        <p className="text-[15px] text-white/70">{track?.artist ?? "Ajoute un titre"}</p>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-[#FA2D48]" style={{ width: `${Math.min(progress, 1) * 100}%` }} />
        </div>
        <div className="mt-5 flex items-center justify-center gap-8">
          <button
            type="button"
            className="rotate-180 text-white"
            aria-label="Précédent"
            onClick={() => {
              if (progress > 0.08) {
                setProgress(0);
                return;
              }
              go(-1);
            }}
          >
            <IconSkip className="h-7 w-7" />
          </button>
          <button
            type="button"
            onClick={() => track && setPlaying((value) => !value)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black"
            aria-label={playing ? "Pause" : "Lecture"}
          >
            {playing ? <IconPause className="h-7 w-7" /> : <IconPlay className="h-7 w-7" />}
          </button>
          <button type="button" aria-label="Suivant" onClick={() => go(1)}>
            <IconSkip className="h-7 w-7" />
          </button>
        </div>
      </div>

      <ul className="mt-4 overflow-hidden rounded-[10px] bg-surface">
        {tracks.length === 0 ? <li className="px-4 py-6 text-[14px] text-muted">Aucun titre.</li> : null}
        {tracks.map((item, index) => (
          <li key={item.id} className={index === tracks.length - 1 ? "" : "border-b border-line"}>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => {
                  setTrack(item.id);
                  setProgress(0);
                  setPlaying(true);
                }}
                className="flex min-w-0 flex-1 items-center justify-between px-4 py-3 text-left"
              >
                <span className="min-w-0">
                  <p className={`truncate text-[15px] ${item.id === track?.id ? "text-[#FA2D48]" : ""}`}>{item.title}</p>
                  <p className="truncate text-[12px] text-muted">{item.artist}</p>
                </span>
                <span className="ml-3 text-[13px] text-muted">{item.duration}</span>
              </button>
              <button type="button" onClick={() => removeTrack(item.id)} className="px-4 text-[12px] text-faint">
                Retirer
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Sheet open={adding} title="Ajouter un titre" onClose={() => setAdding(false)}>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim()) return;
            addTrack({ title, artist });
            setTitle("");
            setArtist("");
            setAdding(false);
            setProgress(0);
            setPlaying(true);
          }}
        >
          <Field label="Titre" value={title} onChange={(event) => setTitle(event.target.value)} required />
          <Field label="Artiste" value={artist} onChange={(event) => setArtist(event.target.value)} />
          <PrimaryButton type="submit" className="w-full">
            Ajouter à la playlist
          </PrimaryButton>
        </form>
      </Sheet>
    </Screen>
  );
}
