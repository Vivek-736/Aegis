"use client";

import { MapPin, Navigation } from "lucide-react";

interface GeoMapProps {
  latitude: number | null;
  longitude: number | null;
  city?: string;
  country?: string;
  ipAddress?: string;
}

export function GeoMap({ latitude, longitude, city, country, ipAddress }: GeoMapProps) {
  if (latitude === null || longitude === null) {
    return (
      <div className="flex h-56 w-full flex-col items-center justify-center rounded-xl border border-border bg-muted/30 p-6 text-center">
        <MapPin className="size-8 text-muted-foreground/50 mb-2" />
        <p className="text-xs font-medium text-foreground">Geographic Coordinates Unavailable</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Server IP address could not be geo-located.
        </p>
      </div>
    );
  }

  // Generate OpenStreetMap embed with bounding box centered on latitude/longitude
  const delta = 0.05;
  const bbox = `${longitude - delta},${latitude - delta},${longitude + delta},${latitude + delta}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
  const externalMapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=13/${latitude}/${longitude}`;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Navigation className="size-3.5 text-blue-accent" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Server Location Map
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            ({latitude.toFixed(4)}, {longitude.toFixed(4)})
          </span>
        </div>
        <a
          href={externalMapUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] font-medium text-blue-accent hover:underline"
        >
          View Full Map
        </a>
      </div>

      <div className="relative aspect-21/9 w-full min-h-55 bg-muted/20">
        <iframe
          src={embedUrl}
          title={`Map location for ${ipAddress || "server"}`}
          className="size-full border-0"
          loading="lazy"
        />
      </div>

      <div className="flex items-center justify-between bg-card px-4 py-2 text-[11px] text-muted-foreground">
        <span>
          {city ? `${city}, ` : ""}{country || "Unknown Region"} · IP: {ipAddress || "N/A"}
        </span>
        <span>© OpenStreetMap contributors</span>
      </div>
    </div>
  );
}