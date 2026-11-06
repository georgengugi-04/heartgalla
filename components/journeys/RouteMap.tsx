import { destinations, bySlug } from "@/lib/journeys/destinations";

/**
 * Schematic map: town positions are projected linearly from approximate coordinates. The lines connect stops in
 * order only. They are NOT driving routes and no distance or travel time is shown or implied.
 */
const W = 520, H = 460, LAT = [-4.8, 1.0], LNG = [33.6, 41.6];
const x = (lng: number) => ((lng - LNG[0]) / (LNG[1] - LNG[0])) * (W - 80) + 40;
const y = (lat: number) => ((LAT[1] - lat) / (LAT[1] - LAT[0])) * (H - 60) + 30;

export default function RouteMap({ stops }: { stops: string[] }) {
  const sel = stops.map(bySlug).filter((d): d is NonNullable<typeof d> => !!d);
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={sel.length ? `Schematic map of your stops in order: ${sel.map((d) => d.name).join(", ")}` : "Schematic map of Kenyan destinations"} className="h-auto w-full rounded-sm border border-ivory/10 bg-gallery-dark">
        {sel.length > 1 && <polyline points={sel.map((d) => `${x(d.lng)},${y(d.lat)}`).join(" ")} fill="none" stroke="var(--color-gold)" strokeWidth="1.5" strokeDasharray="5 5" />}
        {destinations.map((d) => {
          const i = stops.indexOf(d.slug);
          const on = i >= 0;
          const right = d.lng < 38;
          return (
            <g key={d.slug}>
              <circle cx={x(d.lng)} cy={y(d.lat)} r={on ? 7 : 4} fill={on ? "var(--color-gold)" : "none"} stroke={on ? "var(--color-gold)" : "var(--color-ivory)"} strokeOpacity={on ? 1 : 0.5} />
              {on && <text x={x(d.lng)} y={y(d.lat) + 3.5} textAnchor="middle" fontSize="9" fill="var(--color-charcoal)" fontWeight="600">{i + 1}</text>}
              <text x={x(d.lng) + (right ? 12 : -12)} y={y(d.lat) + 4} textAnchor={right ? "start" : "end"} fontSize="11" fill="var(--color-ivory)" fillOpacity={on ? 1 : 0.6}>{d.name}</text>
            </g>
          );
        })}
      </svg>
      <figcaption className="label-mono mt-2 text-ivory/50">Schematic only. Not a driving route; distances and times are not shown.</figcaption>
    </figure>
  );
}
