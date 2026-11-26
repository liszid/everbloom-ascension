import { townThemeOf } from "./townTheme";

// Coordinate-seeded scattering is stable while the camera moves; presentation never blocks a tile.
export const townSeed = (x: number, y: number) => ((x * 73856093) ^ (y * 19349663)) >>> 0;
export const adornBuilding = (x: number, y: number) => townSeed(x, y) % 5 < 2;

export function TownDecor({ race, x, y }: { race: string; x: number; y: number }) {
  const seed = townSeed(x, y);
  if (seed % 7 !== 0) return null;
  const theme = townThemeOf(race);
  if (theme === "citadel") return null;
  const bat = race === "vampire";
  return <svg className={`town-decor ${bat ? "town-bats" : ""}`} viewBox="0 0 64 64" aria-hidden="true" fill="var(--sprite-stone)" stroke="var(--sprite-ink)" strokeWidth="2">
    {theme === "undead" ? bat ? <g className="bat-body"><path d="M31 25Q20 8 4 18l5 13 9-4 9 10 6-6 6 6 9-10 9 4 5-13Q46 8 33 25z"/><path d="M29 23l-2-7 6 4 6-4-2 7"/></g> : race === "zombie" || race === "ghoul" ? <><ellipse cx="32" cy="52" rx="20" ry="5"/><path d="M26 52V33l-7-10 4-4 7 8V12h5v14l5-14 5 2-5 15 7-10 4 3-9 16-3 14z" fill="var(--sprite-moss)"/></> : <><path d="M17 54V30a15 15 0 0 1 30 0v24z"/><path d="M25 32h14m-7-7v22"/><path d="M10 56h44"/></> :
    theme === "sylvan" ? <><path d="M10 51v-9m11 9V31m23 20V39" stroke="var(--sprite-leaf)"/><path d="M3 42q7-15 15 0zM10 31q11-19 22 0zM34 39q10-17 21 0z" fill="var(--sprite-moss)"/></> :
    theme === "celestial" ? <><path d="M32 12l5 14 15 5-15 5-5 14-5-14-15-5 15-5z" fill="var(--sprite-gold)"/><circle cx="10" cy="13" r="3" fill="var(--sprite-bone)"/></> :
    theme === "infernal" ? <><path d="M5 51l14-8 8 5 10-13 18 8" fill="none" stroke="var(--sprite-flame)" strokeWidth="4"/><path d="M24 39q-12-13 6-27-3 13 7 10 14 18-13 17z" fill="var(--sprite-flame)"/></> :
    theme === "forge" ? <><path d="M8 49l7-18 14 4 7-13 18 11-5 16z"/><path d="M18 35l5 10m19-14 3 13" stroke="var(--sprite-gold)"/></> :
    theme === "tide" ? <><path d="M8 49q-8-20 4-28m1 18 10-10m19 23V19m0 16-9-8m9 14 12-11" fill="none" stroke="var(--sprite-teal)" strokeWidth="5"/><path d="M21 51l8-9 7 9z" fill="var(--sprite-bone)"/></> :
    <><path d="M24 48l-7-22 15-16 15 16-7 22z" fill="var(--sprite-ice)"/><path d="M32 10v38m-15-22h30"/></>}
  </svg>;
}