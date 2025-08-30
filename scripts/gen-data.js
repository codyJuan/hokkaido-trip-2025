// scripts/gen-data.js
// 用法：node scripts/gen-data.js [inputDir] [outFile]
// 範例：node scripts/gen-data.js public/images src/data.js

const fs = require("fs");
const path = require("path");

const CITY_META = {
  Toya:    { en: "Toya",  zh: "洞爺湖" },
  Otaru:   { en: "Otaru", zh: "小樽"   },
  Sapporo: { en: "Sapporo", zh: "札幌" }
};

const INPUT_DIR   = path.resolve(process.cwd(), process.argv[2] || "images");
const OUTPUT_FILE = path.resolve(process.cwd(), process.argv[3] || "src/data.js");
const IMAGE_RE = /\.(jpe?g|png|webp|avif)$/i;

// ---------- helpers ----------
function ensureDir(p) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function hasCJK(s) {
  return /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(s);
}

function titleize(name) {
  const base = name.replace(/\.[a-z0-9]+$/i, "");
  if (hasCJK(base)) return base;
  return base.replace(/[_-]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function slugify(s) {
  const base = s.normalize("NFKC").replace(/\.[a-z0-9]+$/i, "").trim();
  return base
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function listDir(abs) {
  return fs.existsSync(abs) ? fs.readdirSync(abs, { withFileTypes: true }) : [];
}

function readImagesOnce(dirAbs, webBase) {
  return listDir(dirAbs)
    .filter((ent) => ent.isFile() && IMAGE_RE.test(ent.name))
    .map((ent) => path.posix.join(webBase, ent.name))
    .sort();
}

function readJSON(fileAbs) {
  try {
    if (fs.existsSync(fileAbs)) {
      const raw = fs.readFileSync(fileAbs, "utf8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn(`[gen-data] invalid JSON: ${fileAbs}\n${e.message}`);
  }
  return null;
}

function toWebPath(rootWebBase, fname) {
  return path.posix.join(rootWebBase, fname);
}

function sortByOrderThenName(a, b) {
  const ao = a.order ?? 999999;
  const bo = b.order ?? 999999;
  if (ao !== bo) return ao - bo;
  return (a.nameZh || a.title || "").localeCompare(b.nameZh || b.title || "");
}

// ---------- scan one city (spots only, with info.json) ----------
function scanCity(cityRoot, cityWebBase) {
  const spots = [];

  for (const ent of listDir(cityRoot)) {
    if (!ent.isDirectory()) continue;
    const spotDirAbs = path.join(cityRoot, ent.name);
    const webBase = path.posix.join(cityWebBase, ent.name);

    // 讀 info.json（可選）
    const info = readJSON(path.join(spotDirAbs, "info.json")) || {};

    // 圖片：若 info.images 指定則依序輸出；否則全讀資料夾
    let images = [];
    if (Array.isArray(info.images) && info.images.length) {
      images = info.images
        .filter((f) => IMAGE_RE.test(f))
        .map((f) => toWebPath(webBase, f));
    } else {
      images = readImagesOnce(spotDirAbs, webBase);
    }
    if (!images.length) continue;

    // 若指定 cover，移到第一張
    if (info.cover) {
      const coverPath = toWebPath(webBase, info.cover);
      const idx = images.indexOf(coverPath);
      if (idx > 0) {
        images.splice(idx, 1);
        images.unshift(coverPath);
      }
    }

    const fallbackName = titleize(ent.name);
    const nameEn = info.nameEn || (hasCJK(fallbackName) ? fallbackName : fallbackName);
    const nameZh = info.nameZh || fallbackName;

    spots.push({
      id: info.id || slugify(nameEn || nameZh || ent.name),
      nameEn,
      nameZh,
      tags: Array.isArray(info.tags) ? info.tags : [],
      rating: info.rating ?? null,
      blurb: info.blurb || "",
      order: info.order ?? undefined,
      images,

      // 其餘可用的擴充欄位都一併輸出（前端可選擇要不要用）
      coords: info.coords ?? undefined,
      address: info.address ?? undefined,
      mapUrl: info.mapUrl ?? undefined,
      timeSpent: info.timeSpent ?? undefined,
      ticket: info.ticket ?? undefined
    });
  }

  // root loose images（沒子資料夾、但直接丟圖片在城市根目錄）
  for (const ent of listDir(cityRoot)) {
    if (!(ent.isFile && ent.isFile())) continue;
    if (!IMAGE_RE.test(ent.name)) continue;
    const url = path.posix.join(cityWebBase, ent.name);
    const name = titleize(ent.name);
    spots.push({
      id: slugify(name),
      nameEn: hasCJK(name) ? name : name,
      nameZh: name,
      tags: [],
      rating: null,
      blurb: "",
      images: [url]
    });
  }

  spots.sort(sortByOrderThenName);
  return { spots };
}

// ---------- scan food (global) with info.json ----------
function scanFood(foodRoot, foodWebBase) {
  const foods = [];

  for (const ent of listDir(foodRoot)) {
    if (!ent.isDirectory()) continue;

    const folderName = ent.name;
    const dirAbs = path.join(foodRoot, folderName);
    const webBase = path.posix.join(foodWebBase, folderName);

    const info = readJSON(path.join(dirAbs, "info.json")) || {};

    let images = [];
    if (Array.isArray(info.images) && info.images.length) {
      images = info.images
        .filter((f) => IMAGE_RE.test(f))
        .map((f) => toWebPath(webBase, f));
    } else {
      images = readImagesOnce(dirAbs, webBase);
    }
    if (!images.length) continue;

    if (info.cover) {
      const coverPath = toWebPath(webBase, info.cover);
      const idx = images.indexOf(coverPath);
      if (idx > 0) {
        images.splice(idx, 1);
        images.unshift(coverPath);
      }
    }

    foods.push({
      id: info.id || slugify(folderName),
      title: info.title || titleize(folderName),
      note: info.note || "",
      rating: info.rating ?? 2,
      tags: Array.isArray(info.tags) ? info.tags : [],
      images,
      mapUrl: info.mapUrl ?? undefined,
      price: info.price ?? undefined,
      visitedAt: info.visitedAt ?? undefined
    });
  }

  foods.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  return foods;
}

// ---------- scan extra folders (gallery/friends) ----------
function scanLooseFolder(dirAbs, webBase) {
  if (!fs.existsSync(dirAbs) || !fs.statSync(dirAbs).isDirectory()) return [];
  return fs
    .readdirSync(dirAbs)
    .filter((f) => IMAGE_RE.test(f))
    .sort()
    .map((f) => path.posix.join(webBase, f));
}

// ---------- main ----------
function main() {
  console.log(`[gen-data] INPUT_DIR  = ${INPUT_DIR}`);
  console.log(`[gen-data] OUTPUT_FILE = ${OUTPUT_FILE}`);

  const cityDirs = listDir(INPUT_DIR).filter(
    (ent) => ent.isDirectory() && !ent.name.startsWith("_") && ent.name !== "food"
  );

  const perCity = {};
  for (const ent of cityDirs) {
    const cityKey = ent.name;
    const cityRoot = path.join(INPUT_DIR, cityKey);
    const cityWebBase = `./images/${ent.name}`;
    perCity[cityKey] = scanCity(cityRoot, cityWebBase);
  }

  const toya    = perCity.Toya    || { spots: [] };
  const otaru   = perCity.Otaru   || { spots: [] };
  const sapporo = perCity.Sapporo || { spots: [] };

  const foodRoot = path.join(INPUT_DIR, "food");
  const foodItems = scanFood(foodRoot, "./images/food");

  const galleryImages = scanLooseFolder(path.join(INPUT_DIR, "gallery"), "./images/gallery");
  const friendsPhotos = scanLooseFolder(path.join(INPUT_DIR, "friends"), "./images/friends");

  const output = `/* Auto-generated by gen-data.js at ${new Date().toISOString()} */
export const CITY_META = ${JSON.stringify(CITY_META, null, 2)};

export const toyaSpots = ${JSON.stringify(toya.spots, null, 2)};
export const otaruSpots = ${JSON.stringify(otaru.spots, null, 2)};
export const sapporoSpots = ${JSON.stringify(sapporo.spots, null, 2)};

export const foodItems = ${JSON.stringify(foodItems, null, 2)};

export const galleryImages = ${JSON.stringify(galleryImages, null, 2)};
export const friendsPhotos = ${JSON.stringify(friendsPhotos, null, 2)};
`;

  ensureDir(OUTPUT_FILE);
  fs.writeFileSync(OUTPUT_FILE, output, "utf8");
  console.log(`[gen-data] Wrote ${OUTPUT_FILE}`);
}

main();