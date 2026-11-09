// In-game guide: explains buildings, items and rules. Numbers are read from the game data
// modules so the guide stays accurate when balance values change.
import { useState, type ReactNode } from "react";
import { GRADES, GRADE_GATES, PROPS, PROP_LABEL, RACES, SLOTS, SLOT_INFO, AFFINITIES, getMat } from "./data";
import { SPOTS, SPOT_MAX, type SpotId } from "./gathering";
import { AILMENTS, BLESSINGS, BLDG_INFO, BLDG_MAX, TOOLS, TRAP_RANGE, BASE_SIGHT, enchantPower, type BldgId } from "./items";
import { MAX_COMPANIONS, RENT_FLOORS, CAPTURE_HP, GUILD_BUY_MULT, TECH_REQ, techGold } from "./guild";
import { SCHOOLS, SCHOOL_MAX, COMBO_LEVEL, ASCENSIONS, ASC_RACES, SPELLS } from "./magic";
import { THEMES, THEME_SPAN } from "./themes";
import { RACE_CLASSES, RANK_AT } from "./raceClasses";
import { MAX_STARS, STAR_HOURS } from "./titles";
import { GEAR_CAP, MAX_SKILL, MAX_SPELL_SLOTS, SPELL_MAX_LV } from "./engine";

const H = ({ children }: { children: ReactNode }) => <h4 className="mt-3 mb-1 text-sm text-primary">{children}</h4>;
const P = ({ children }: { children: ReactNode }) => <p className="mb-1.5 text-sm leading-relaxed">{children}</p>;
const L = ({ items }: { items: ReactNode[] }) => <ul className="mb-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>;
const B = ({ children }: { children: ReactNode }) => <b className="text-accent">{children}</b>;
const Grid = ({ head, rows }: { head: string[]; rows: ReactNode[][] }) => (
  <div className="mb-2 overflow-x-auto">
    <table className="w-full text-left text-xs">
      <thead><tr>{head.map((h) => <th key={h} className="border-b border-border px-1 py-1 text-muted-foreground">{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="border-b border-border/40 px-1 py-1 align-top">{c}</td>)}</tr>)}</tbody>
    </table>
  </div>
);

const BLDG_ROWS: { icon: string; name: string; id?: BldgId; text: ReactNode }[] = [
  { icon: "🏠", name: "Home", id: "house", text: <>Three tabs: <B>Rest</B> heals HP, mana and stamina; <B>Storage</B> keeps gear and materials safe; <B>Kitchen</B> cooks food you eat in battle or on the map.</> },
  { icon: "⚖️", name: "Market", id: "market", text: <><B>Shop</B> sells basic seeds and supplies, and buys anything you carry, sorted by tier. <B>Market</B> has 4 changing offers and 3 materials in high demand (paid 1.5–2.3×). Offers change every time you come back from the Tower.</> },
  { icon: "⚒️", name: "Forge", text: <><B>Smithy</B> crafts, enhances and repairs gear and upgrades the forge. <B>Sawmill</B> carves logs into planks. <B>Smelter</B> turns ores into ingots. Refined materials have a higher tier.</> },
  { icon: "⛪", name: "Church", id: "church", text: <>Cures ailments, sells blessings that last a number of battles, lets you pray once per return for a free blessing, and enchants weapons and off-hands with an element.</> },
  { icon: "🔮", name: "Magic Tower", text: <>Learn magic schools, study them to raise their level, unlock spells, equip up to {MAX_SPELL_SLOTS} of them, level spells up, and perform race-changing rituals.</> },
  { icon: "🪤", name: "Craftery", id: "craftery", text: <>Makes single-use throwing items and traps, ammunition, ranged off-hand weapons and torches. Higher Craftery levels unlock stronger recipes.</> },
  { icon: "🛡️", name: "Adventurers Guild", id: "guild", text: <><B>Missions</B> board, a <B>Merchant</B> paying more for monster parts, skill <B>Training</B> and specialist trainers, and <B>Hire</B> for companions.</> },
  { icon: "🎰", name: "Casino", text: <>Dice, Slots and High-Low. Play as long as you have gold; the maximum bet grows with your best floor. Winnings give tokens for the token shop. The house always has a small edge.</> },
  { icon: "🗼", name: "Tower", text: <>Enter the dungeon. You can start at any floor you have already reached, using the − / + buttons or the floor picker.</> },
];

function Section({ id, icon, title, open, toggle, children }: { id: string; icon: string; title: string; open: boolean; toggle: (id: string) => void; children: ReactNode }) {
  return (
    <div className="mb-1.5 border-2 border-border">
      <button className="flex min-h-11 w-full items-center gap-2 px-2 py-2 text-left" aria-expanded={open} onClick={() => toggle(id)}>
        <span className="text-lg">{icon}</span><span className="flex-1 text-primary">{title}</span><span className="text-muted-foreground">{open ? "▾" : "▸"}</span>
      </button>
      {open && <div className="border-t border-border/60 px-2.5 pb-2 pt-1">{children}</div>}
    </div>
  );
}

export function Guide({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState<string | null>("start");
  const toggle = (id: string) => setOpen((o) => (o === id ? null : id));
  const S = (p: { id: string; icon: string; title: string; children: ReactNode }) => <Section {...p} open={open === p.id} toggle={toggle} />;
  const throws = TOOLS.filter((t) => t.kind === "throw"), traps = TOOLS.filter((t) => t.kind === "trap");
  const ranged = TOOLS.filter((t) => t.kind === "ranged"), torches = TOOLS.filter((t) => t.kind === "torch");
  const perSchool = SPELLS.filter((x) => x.school === "fire").length;

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <button className="pixel-btn px-3 py-2" onClick={onBack}>← Back</button>
        <h3 className="text-primary">📖 Game Guide</h3>
      </div>
      <p className="mb-2 text-xs text-muted-foreground">Tap a topic to open it.</p>

      <S id="start" icon="🧭" title="Goal & controls">
        <P>Your goal is to beat the <B>1000th floor</B> of the Tower. After every floor you return to the village of Thornvale to rest, gather materials and craft better gear.</P>
        <L items={[
          <>Move with the <B>joystick</B> on the map, or tap a tile to walk there.</>,
          <>Tap buildings, gathering spots, crop fields and objects next to you to use them. Walk into a monster to fight it.</>,
          <>In the dungeon, <B>long-press</B> the map to place a trap from your bag.</>,
          <>Your character, gear, titles and companions are in the menu at the bottom. Saving and character slots are in Settings.</>,
        ]} />
      </S>

      <S id="bldg" icon="🏘️" title="Village buildings">
        {BLDG_ROWS.map((b) => (
          <div key={b.name} className="mb-2">
            <div className="text-sm text-primary">{b.icon} {b.name}</div>
            <P>{b.text}</P>
            {b.id && <p className="text-xs text-muted-foreground">Upgrades (Lv 1–{BLDG_MAX}) — at Lv 2: {BLDG_INFO[b.id].perk(2)}; at Lv {BLDG_MAX}: {BLDG_INFO[b.id].perk(BLDG_MAX)}.</p>}
          </div>
        ))}
        <P>Upgrade a building with gold from the button inside it.</P>
      </S>

      <S id="gather" icon="🌲" title="Gathering spots">
        <P>The Forest, Mine, Pond, Animal Farm and flower Field open a window. Choose a material and press the button repeatedly to collect it. Each spot can be upgraded up to Lv {SPOT_MAX} with gold and its best material; higher levels unlock better materials and make the spot look richer.</P>
        <Grid head={["Spot", "Materials (unlock level)"]} rows={(Object.keys(SPOTS) as SpotId[]).map((id) => [
          `${SPOTS[id].icon} ${SPOTS[id].name}`, SPOTS[id].mats.map(([m, l]) => `${getMat(m).name} (${l})`).join(", "),
        ])} />
        <P><B>Crop field:</B> tap it to open the whole field, pick a seed and plant or harvest every plot at once. Crops grow as time passes: walking, resting and every trip to the Tower move them closer to harvest.</P>
      </S>

      <S id="craft" icon="⚒️" title="Crafting gear">
        <P>Any mix of materials makes a piece of gear; nothing is predetermined. Each material has eight properties that decide the stats:</P>
        <L items={PROPS.map((p) => <><B>{PROP_LABEL[p]}</B>{{ hard: " — physical attack and defense", dens: " — health and defense", sharp: " — attack, crit chance and crit damage", flex: " — dodge, speed and stamina", cond: " — magic attack and mana", magic: " — magic attack, magic defense and luck", dura: " — durability and health", weight: " — heavy gear slows you down and lowers dodge" }[p]}</>)} />
        <P>Gear types: {SLOTS.map((s) => SLOT_INFO[s].name).join(", ")}. Two-handed weapons take both hands; one-handed weapons can be paired with an off-hand.</P>
        <H>Grade</H>
        <P>Using <B>more kinds</B> and a <B>larger quantity</B> of materials raises the grade. Each grade also needs a minimum average material tier, forge level and Smithing level:</P>
        <Grid head={["Grade", "Avg tier", "Forge", "Smithing"]} rows={GRADES.map((g, i) => [g, String(GRADE_GATES[i]![0]), String(GRADE_GATES[i]![1]), String(GRADE_GATES[i]![2])])} />
        <P><B>EX</B> gear also needs an <B>Ancient Schematic</B> and a catalyst material. The forge is upgraded with gold and boss relics (Guardian Sigils, Warden Crests).</P>
        <P>From Rare upward, gear gains an effect from its main element (burn, life steal, regeneration…). The gear bag holds {GEAR_CAP} items; store the rest at Home.</P>
        <H>Enhancing & repair</H>
        <L items={[
          <>Enhancing costs gold and the gear's best material, up to +20. Each level is less likely to succeed.</>,
          <>A failure at +5 or higher drops one level; at +10 or higher it also cracks durability.</>,
          <>Gear loses durability in every fight (weapons faster). Repair it at the Smithy.</>,
        ]} />
      </S>

      <S id="offhand" icon="🛡️" title="Off-hand rules">
        <P>The off-hand holds <B>one</B> of: a shield, a ranged weapon, or a torch. Equipping one removes the others.</P>
        <L items={[
          <>Ranged weapons need ammunition (arrows, bolts, bullets or energy cells) and add a <B>Shoot</B> action to the battle Items menu.</>,
          <>Large ranged weapons are <B>two-handed</B>: {ranged.filter((r) => r.two).map((r) => r.name).join(", ")}. They remove your one-handed weapon.</>,
          <>Torches widen your sight in the dark dungeon (base sight {BASE_SIGHT} tiles) and add fire damage when you attack or defend. Special torches add sleep, life steal, blind, venom, chill, mana or burn effects.</>,
        ]} />
      </S>

      <S id="skills" icon="📈" title="Skills, affinities & classes">
        <P>Skills grow by doing: walking trains Mobility, sword attacks train One-Hand Mastery, mining trains Mining, and so on (max level {MAX_SKILL}). Each skill also feeds an affinity such as Sword, Might, Nature or Arcane.</P>
        <P>Your <B>class</B> is decided by your <B>top five skills</B>, your <B>top two affinities</B> and your <B>equipped title</B>. A strong second affinity creates a hybrid class. Classes rise through four tiers and give passives and combat skills.</P>
        <P>Affinities: {AFFINITIES.map((a) => `${a.icon} ${a.name}`).join(", ")}.</P>
      </S>

      <S id="titles" icon="🏅" title="Titles & stars">
        <P>Titles are earned through achievements. Equip one to get its kit of 3–5 passive and active skills usable in the dungeon.</P>
        <L items={[
          <>Stars (1–{MAX_STARS}) show rarity. 1–2★ unlock 3 skills, 3–4★ unlock 4, 5★ unlock all 5, and skills get stronger.</>,
          <>Stars grow only while the title is equipped: after {STAR_HOURS.join("h, ")}h of total equipped time.</>,
          <>The equipped title also shapes your class.</>,
        ]} />
      </S>

      <S id="magic" icon="🔮" title="Magic Tower">
        <L items={[
          <>Learn a school by paying tuition once you meet its M.Atk need. Study for gold to raise it up to Lv {SCHOOL_MAX}.</>,
          <>Each school teaches {perSchool} spells spread over its levels; they are learned automatically when the school level and your M.Atk are high enough.</>,
          <>You can equip up to <B>{MAX_SPELL_SLOTS} spells</B> at a time. Each spell can be levelled up to Lv {SPELL_MAX_LV} for gold.</>,
          <>Combined schools are discovered when both parent schools reach Lv {COMBO_LEVEL}.</>,
        ]} />
        <Grid head={["School", "Needs"]} rows={SCHOOLS.map((sc) => [`${sc.icon} ${sc.name}`, sc.combo ? `${SCHOOLS.find((x) => x.id === sc.combo![0])!.name} + ${SCHOOLS.find((x) => x.id === sc.combo![1])!.name}, ${sc.matk} M.Atk` : `${sc.matk} M.Atk, ${sc.gold}g`])} />
      </S>

      <S id="races" icon="🧬" title="Races & ascension">
        <P>Starting races: {RACES.map((r) => `${r.icon} ${r.name}`).join(", ")}. Each has its own stat bonuses, a passive and a battle skill.</P>
        <P>You can transform into an ascended race mid-game at the Magic Tower by learning the right school and meeting its lore condition:</P>
        <Grid head={["Race", "School", "Condition"]} rows={ASCENSIONS.map((a) => {
          const r = ASC_RACES.find((x) => x.id === a.race)!;
          return [`${r.icon} ${r.name}`, SCHOOLS.find((x) => x.id === a.school)!.name, a.reqs.map((q) => `${q.label}: ${q.need.toLocaleString()}`).join("; ")];
        })} />
        <P>Ascending <B>locks your class to the new race</B>. You start at its lowest rank and rise as your race mastery grows (its magic schools, skills, affinities and deeds). Mastery needed per rank: {RANK_AT.join("%, ")}%.</P>
        <Grid head={["Race", "Class ranks"]} rows={RACE_CLASSES.map((l) => [`${ASC_RACES.find((x) => x.id === l.race)!.icon} ${ASC_RACES.find((x) => x.id === l.race)!.name}`, l.ranks.join(" → ")])} />
      </S>

      <S id="church" icon="⛪" title="Church services">
        <H>Ailments (cure for gold)</H>
        <L items={Object.values(AILMENTS).map((a) => <>{a.icon} <B>{a.name}</B> — {a.desc}</>)} />
        <P>Dying always leaves you Cursed until you are cured.</P>
        <H>Blessings</H>
        <L items={Object.values(BLESSINGS).map((b) => <>{b.icon} <B>{b.name}</B> — {b.desc}</>)} />
        <P>Prices rise with your best floor. Praying raises your faith, which makes blessings cheaper.</P>
        <H>Elemental enchanting</H>
        <P>Enchant a weapon for extra elemental damage, or an off-hand for less damage from that element. Power is {enchantPower(0)}% at Common, rising to {enchantPower(7)}% at EX.</P>
      </S>

      <S id="craftery" icon="🪤" title="Craftery items">
        <P>Craftery items are used up when used. Recipes need materials and gold; some need a higher Craftery level.</P>
        <H>Throwing items</H>
        <L items={throws.map((t) => <>{t.icon} <B>{t.name}</B> — {t.desc}{t.lvl ? ` (Lv ${t.lvl})` : ""}</>)} />
        <H>Traps</H>
        <P>Long-press the dungeon map to place a trap within {TRAP_RANGE} tiles. A monster that walks into it takes damage.</P>
        <L items={traps.map((t) => <>{t.icon} <B>{t.name}</B> — {t.desc}{t.lvl ? ` (Lv ${t.lvl})` : ""}</>)} />
        <H>Ranged weapons</H>
        <L items={ranged.map((t) => <>{t.icon} <B>{t.name}</B> — {t.desc}{t.lvl ? ` (Lv ${t.lvl})` : ""}</>)} />
        <H>Torches</H>
        <L items={torches.map((t) => <>{t.icon} <B>{t.name}</B> — {t.desc}{t.lvl ? ` (Lv ${t.lvl})` : ""}</>)} />
      </S>

      <S id="guild" icon="🛡️" title="Guild & companions">
        <L items={[
          <><B>Missions:</B> slay, gather, forge or reach-a-floor tasks for gold and tokens. A new set appears when you finish them all.</>,
          <><B>Merchant:</B> buys monster parts at about {GUILD_BUY_MULT}× the shop price (more with Guild level).</>,
          <><B>Training:</B> pay gold for a chance to raise a skill. Higher skills cost more and succeed less often.</>,
          <><B>Specialists:</B> only teach your top two affinities — a passive at affinity Lv {TECH_REQ.passive} ({techGold("passive")}g) and an active at Lv {TECH_REQ.active} ({techGold("active")}g).</>,
          <><B>Companions:</B> up to {MAX_COMPANIONS}. Rent one for {RENT_FLOORS} expeditions, or buy one to keep forever. Owned companions get their own Stats, Equipment and Title tabs and use your spare gear.</>,
          <><B>Capture:</B> a normal monster below {Math.round(CAPTURE_HP * 100)}% HP can be captured in battle and joins as a companion. Guardians cannot be captured.</>,
        ]} />
      </S>

      <S id="tower" icon="🗼" title="Tower & combat">
        <L items={[
          <>Monsters get stronger every floor. Elite monsters with special traits appear more often higher up.</>,
          <>Every 10th floor has a <B>Guardian</B>, every 100th an <B>Arch-Warden</B>, and floor 1000 the <B>Eternal Warden</B>. Bosses must be defeated to use the stairs, you cannot flee from them, and they drop the relics needed for forge upgrades.</>,
          <>Battle buttons: <B>Hit</B> attacks with your weapon; the <B>spell button</B> casts your highest-level equipped Magic Tower spell (the first equipped one on a tie); <B>Defend</B> uses your off-hand — a shield takes only 30% damage instead of 50%, a torch burns back; <B>Items</B> lets you eat (2 per fight), throw tools or shoot; <B>Skills</B> lists every active skill, your race skill and Capture; <B>Flee</B> escapes (not from bosses).</>,
          <>A result screen shows damage, loot and skill gains after every fight.</>,
          <>Taking the stairs clears the floor, gives a gold bonus (triple the first time) and sends you home with your loot.</>,
          <>If you fall, you lose the loot gathered on that floor and 10% of your gold, return home with 30% HP, and become Cursed.</>,
          <>Mine veins, open chests and pick up gems inside the dungeon.</>,
        ]} />
        <H>Floor themes</H>
        <P>The look of the dungeon changes every {THEME_SPAN} floors and cycles after {THEMES.length * THEME_SPAN} floors:</P>
        <P>{THEMES.map((t, i) => `${t.icon} ${t.name} (${i * THEME_SPAN + 1}–${(i + 1) * THEME_SPAN})`).join(" · ")}</P>
      </S>

      <S id="items" icon="🎒" title="Materials, food & selling">
        <L items={[
          <>Every material has a tier (0–10). Higher tiers come from deeper floors, upgraded gathering spots and refining.</>,
          <>Materials you collect in the dungeon go into your expedition bag. You keep them when you take the stairs or retreat, but lose them if you fall.</>,
          <>Cook any edible materials together at the Kitchen. More and better ingredients make stronger meals that heal more.</>,
          <>Selling shows each item's tier and lists the highest tiers first. The Trading skill improves prices.</>,
          <>Storage at Home grows by 10 slots per Home level.</>,
        ]} />
      </S>
    </div>
  );
}
