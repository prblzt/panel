"use client";

import { Screen } from "@/components/ui";
import { usePanel } from "@/lib/store";

const scenes = [
  { id: "off" as const, label: "Tout éteindre" },
  { id: "evening" as const, label: "Soir" },
  { id: "home" as const, label: "Présent" },
];

export default function MaisonPage() {
  const { rooms, toggleDevice, applyScene, account } = usePanel();
  const lights = rooms.flatMap((room) => room.devices).filter((device) => device.kind === "light" && device.on).length;

  return (
    <Screen
      title="Maison"
      subtitle={`${lights} lumière${lights > 1 ? "s" : ""} allumée${lights > 1 ? "s" : ""} · ${account?.appleId ?? ""}`}
    >
      <div className="mb-4 grid grid-cols-3 gap-2">
        {scenes.map((scene) => (
          <button
            key={scene.id}
            type="button"
            onClick={() => applyScene(scene.id)}
            className="h-11 rounded-full bg-surface text-[15px] font-medium"
          >
            {scene.label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {rooms.map((room) => (
          <section key={room.id} className="widget p-4">
            <h2 className="mb-3 text-[17px] font-semibold">{room.name}</h2>
            <div className="grid grid-cols-2 gap-2">
              {room.devices.map((device) => (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => toggleDevice(room.id, device.id)}
                  className={`rounded-[14px] p-3 text-left ${device.on ? "bg-[#FF9500] text-black" : "bg-fill"}`}
                >
                  <p className="text-[14px] font-medium">{device.name}</p>
                  <p className={`mt-1 text-[12px] ${device.on ? "text-black/70" : "text-muted"}`}>{device.value}</p>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="mt-3 px-1 text-[12px] text-faint">
        Contrôle local de démonstration. Les états restent enregistrés sur cet appareil.
      </p>
    </Screen>
  );
}
