const ENGINE_RAW_ROOT = "https://raw.githubusercontent.com/lewisxatk/osrshub-combat-engine/main/";

const encodePath = value => String(value).split("/").map(part => encodeURIComponent(part)).join("/");

export function equipmentIconUrl(name, imagePath = "") {
  const itemName = String(name ?? "").trim();
  if (!itemName || itemName === "—" || itemName === "-") return "";

  const supplied = String(imagePath ?? "").trim();
  if (/^https?:\/\//i.test(supplied)) return supplied;
  if (supplied.startsWith("/")) return supplied;

  if (supplied) {
    const relative = supplied.replace(/^\.\//, "");
    const assetPath = relative.startsWith("cdn/")
      ? relative
      : relative.startsWith("equipment/")
        ? `cdn/${relative}`
        : `cdn/equipment/${relative}`;
    return ENGINE_RAW_ROOT + encodePath(assetPath);
  }

  return ENGINE_RAW_ROOT + encodePath(`cdn/equipment/${itemName}.png`);
}
