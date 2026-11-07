/**
 * Target intelligence built only from the canonical Combat Engine monster row.
 * Attribute affinities and elemental weaknesses are separate OSRS mechanics.
 * This module is descriptive metadata for the UI; the live engine remains the
 * authority for all DPS, phase, immunity and weapon-specific calculations.
 */
const key = value => String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
const finite = value => typeof value === "number" && Number.isFinite(value);

const ATTRIBUTE_COUNTERS = Object.freeze({
  dragon: {
    label: "Draconic",
    summary: "Dragonbane effects are applied only when the selected canonical monster record has the draconic attribute and the weapon is valid for that target.",
    equipment: { Weapon: { Ranged: ["Dragon hunter crossbow"], Melee: ["Dragon hunter lance"], Magic: ["Dragon hunter wand"] } },
  },
  demon: {
    label: "Demon",
    summary: "Demonbane effects are target-specific. The engine handles Arclight/Emberlight, Silverlight/Darklight and supported demonbane spells, including target effectiveness.",
    equipment: { Weapon: { Melee: ["Arclight", "Emberlight", "Silverlight", "Darklight", "Bone claws", "Burning claws"] , Ranged: ["Scorching bow"] } },
    spells: ["Inferior Demonbane", "Superior Demonbane", "Dark Demonbane"],
  },
  undead: {
    label: "Undead",
    summary: "Salve amulet variants receive their engine-defined bonuses against undead. Crumble Undead is only valid against undead targets.",
    equipment: { Neck: { Melee: ["Salve amulet (e)", "Salve amulet (i)"], Ranged: ["Salve amulet (e)", "Salve amulet (i)"], Magic: ["Salve amulet (e)", "Salve amulet (i)"] } },
    spells: ["Crumble Undead"],
  },
  kalphite: {
    label: "Kalphite",
    summary: "Keris and Keris partisan variants have special damage rules; the breaching variant also has an accuracy modifier.",
    equipment: { Weapon: { Melee: ["Keris partisan of breaching", "Keris partisan of amascut", "Keris partisan of corruption", "Keris partisan of the sun", "Keris partisan", "Keris"] } },
  },
  vampyre1: {
    label: "Vampyre (tier 1)",
    summary: "Tier 1 vampyres can be harmed by ordinary weapons; vampyre-bane effects may still improve damage.",
    equipment: { Weapon: { Melee: ["Blisterwood flail", "Blisterwood sickle", "Hallowed flail", "Sunspear", "Ivandis flail"] } },
  },
  vampyre2: {
    label: "Vampyre (tier 2)",
    summary: "Tier 2 vampyres have silver-weapon restrictions. Efaritay's aid can modify which weapons are effective; the engine checks the exact tier and weapon.",
    equipment: {
      Weapon: { Melee: ["Silverlight", "Darklight", "Arclight", "Emberlight", "Rod of Ivandis", "Ivandis flail", "Blisterwood flail", "Blisterwood sickle", "Hallowed flail", "Sunspear"], Ranged: ["Blisterwood stake"] },
      Ammo: { Ranged: ["Silver bolts"] },
      Ring: { Melee: ["Efaritay's aid"], Ranged: ["Efaritay's aid"] },
    },
  },
  vampyre3: {
    label: "Vampyre (tier 3)",
    summary: "Tier 3 vampyres have strict weapon restrictions and different vampyre-bane multipliers. The engine validates the exact weapon/tier combination.",
    equipment: {
      Weapon: { Melee: ["Silverlight", "Darklight", "Arclight", "Emberlight", "Ivandis flail", "Blisterwood flail", "Blisterwood sickle", "Hallowed flail", "Sunspear"], Ranged: ["Blisterwood stake"] },
      Ammo: { Ranged: ["Silver bolts"] },
      Ring: { Melee: ["Efaritay's aid"], Ranged: ["Efaritay's aid"] },
    },
  },
  golem: {
    label: "Golem",
    summary: "Barronite mace and Granite hammer have golem-specific effects which are calculated by the engine.",
    equipment: { Weapon: { Melee: ["Barronite mace", "Granite hammer"] } },
  },
  leafy: {
    label: "Leafy",
    summary: "Kurask and Turoth-style leafy targets require leaf-bladed weapons, broad ammunition or Magic Dart; ordinary attacks can be ineffective.",
    equipment: { Weapon: { Melee: ["Leaf-bladed battleaxe", "Leaf-bladed spear", "Leaf-bladed sword"], Ranged: ["Broad arrows", "Broad bolts", "Amethyst broad bolts"] } },
    spells: ["Magic Dart"],
  },
  rat: {
    label: "Rat",
    summary: "Ratbone weapons receive a target-specific maximum-hit bonus against rat-attribute monsters.",
    equipment: { Weapon: { Melee: ["Bone mace"], Ranged: ["Bone shortbow"], Magic: ["Bone staff"] } },
  },
  shade: {
    label: "Shade",
    summary: "Gadderhammer receives its shade-specific effect against shade-attribute targets.",
    equipment: { Weapon: { Melee: ["Gadderhammer"] } },
  },
  xerician: {
    label: "Xerician",
    summary: "The Twisted bow uses a higher magic-level scaling cap against xerician targets.",
    equipment: { Weapon: { Ranged: ["Twisted bow"] } },
  },
  fiery: {
    label: "Fiery",
    summary: "Pearl bolt effects are stronger against fiery targets. Dragonstone bolt special effects are suppressed on fiery or draconic targets.",
    equipment: { Ammo: { Ranged: ["Pearl bolts (e)", "Pearl dragon bolts (e)"] } },
  },
  flying: {
    label: "Flying",
    summary: "The combat engine has target-specific melee restrictions for some flying monsters; exact exceptions such as halberds are resolved by the engine.",
  },
  penance: {
    label: "Penance",
    summary: "Penance targets can use Barbarian Assault attacker-role scaling. The current Auto Build does not configure an attacker role, so this is displayed as a mechanic rather than assumed.",
  },
  spectral: {
    label: "Spectral",
    summary: "Spectral is a canonical monster attribute. It is not, by itself, proof of a universal damage bonus.",
  },
});

const DEFENCE_FIELDS = [
  ["stab", "Stab"], ["slash", "Slash"], ["crush", "Crush"], ["magic", "Magic"],
  ["light", "Ranged · light"], ["standard", "Ranged · standard"], ["heavy", "Ranged · heavy"],
];

function countersFor(attribute, style) {
  const data = ATTRIBUTE_COUNTERS[attribute];
  if (!data) return null;
  const bySlot = [];
  for (const [slot, byStyle] of Object.entries(data.equipment ?? {})) {
    const values = style ? (byStyle[style] ?? []) : [...new Set(Object.values(byStyle).flat())];
    if (values.length) bySlot.push({ slot, items: values });
  }
  return { attribute, label: data.label, summary: data.summary, equipment: bySlot, spells: data.spells ?? [] };
}

/** Analyze one exact canonical monster variant; never infer attributes from its name. */
export function buildMonsterIntelligence(record, { style = null } = {}) {
  if (!record || typeof record !== "object" || !Array.isArray(record.attributes)) return null;
  const attributes = [...new Set(record.attributes.map(value => key(value)).filter(Boolean))];
  const weakness = record.weakness && typeof record.weakness === "object"
    && ["air", "water", "earth", "fire"].includes(key(record.weakness.element))
    && finite(record.weakness.severity) && record.weakness.severity > 0
    ? { element: key(record.weakness.element), severity: record.weakness.severity }
    : null;
  const def = record.defensive && typeof record.defensive === "object" ? record.defensive : {};
  const defences = DEFENCE_FIELDS
    .filter(([field]) => finite(def[field]))
    .map(([field, label]) => ({ field, label, value: def[field] }));
  const meleeDefences = defences.filter(row => ["stab", "slash", "crush", "magic"].includes(row.field));
  const lowest = meleeDefences.length
    ? Math.min(...meleeDefences.map(row => row.value))
    : null;
  const weakestStyles = lowest === null ? [] : meleeDefences.filter(row => row.value === lowest).map(row => row.label);
  const counters = attributes.map(attribute => countersFor(attribute, style)).filter(Boolean);
  const immunity = record.immunities && typeof record.immunities === "object"
    ? { burn: record.immunities.burn ?? null }
    : { burn: null };

  return {
    source: "Canonical Combat Engine monster record",
    id: record.id ?? null,
    recordIndex: Number.isInteger(record.recordIndex) ? record.recordIndex : null,
    name: record.name ?? "Unknown monster",
    version: record.version ?? "",
    style: record.style ?? null,
    attributes,
    attributeLabels: attributes.map(attribute => ATTRIBUTE_COUNTERS[attribute]?.label ?? attribute),
    weakness,
    elementalAdvice: weakness
      ? `Use a matching ${weakness.element} elemental spell. The combat engine applies the recorded ${weakness.severity}% weakness to that element; a different element receives no weakness bonus.`
      : "No elemental weakness is recorded for this exact monster variant.",
    defences,
    rangedDefences: defences.filter(row => ["light", "standard", "heavy"].includes(row.field)),
    weakestStyles,
    counters,
    immunities: immunity,
    isSlayerMonster: record.is_slayer_monster === true,
    note: "Attribute affinities and elemental weaknesses are separate mechanics. These are source-record hints; the selected variant, equipment, spell, stance and DPS result are evaluated by the live combat engine.",
  };
}

export function getTargetSpecificEquipmentNames(record, style = null) {
  const intelligence = buildMonsterIntelligence(record, { style });
  if (!intelligence) return [];
  return [...new Set(intelligence.counters.flatMap(counter => counter.equipment
    .filter(group => group.slot === "Weapon" || group.slot === "Ammo" || group.slot === "Neck" || group.slot === "Ring")
    .flatMap(group => group.items)))];
}
