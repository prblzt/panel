"use client";

import { useEffect, useRef } from "react";

const frameStyle = `
  html, body { margin: 0; padding: 0; background: #fff; color: #111; }
  body { padding: 4px 2px 20px; font: 16px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; overflow-wrap: anywhere; }
  img { max-width: 100%; height: auto; }
  table { max-width: 100%; border-collapse: collapse; }
  a { color: #007aff; }
`;

function documentFor(safeHtml: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${frameStyle}</style></head><body>${safeHtml}</body></html>`;
}

export function MailFrame({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    const fit = () => {
      const height = frame.contentDocument?.documentElement.scrollHeight;
      if (height) frame.style.height = `${height}px`;
    };
    const observer = new ResizeObserver(fit);
    const onLoad = () => {
      fit();
      const body = frame.contentDocument?.body;
      if (body) observer.observe(body);
    };
    frame.addEventListener("load", onLoad);
    onLoad();
    return () => {
      frame.removeEventListener("load", onLoad);
      observer.disconnect();
    };
  }, [html]);

  return (
    <iframe
      ref={ref}
      title="Contenu du message"
      sandbox="allow-same-origin"
      referrerPolicy="no-referrer"
      srcDoc={documentFor(html)}
      className="mt-6 block w-full max-w-full rounded-[10px] border-0 bg-white"
      style={{ height: 180 }}
    />
  );
}
