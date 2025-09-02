// scripts/gen-data.js
// 用法：node scripts/gen-data.js public/images src/data.js

const fs = require("fs");
const path = require("path");

const CITY_META = {
  Toya:    { en: "Toya",    zh: "洞爺湖" },
  Otaru:   { en: "Otaru",   zh: "小樽"   },
  Sapporo: { en: "Sapporo", zh: "札幌"   },
};

const INPUT_DIR   = path.resolve(process.cwd(), process.argv[2] || "images");
const OUTPUT_FILE = path.resolve(process.cwd(), process.argv[3] || "src/data.js");

const IMAGE_RE = /\.(jpe?g|png|webp|avif)$/i;
const WIDTH_CANDIDATES = [400, 800, 1600];
const DEFAULT_SIZES = "(max-width: 768px) 100vw, 50vw";

/* ========= helpers ========= */

function ensureDir(p) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function listDir(abs) {
  return fs.existsSync(abs) ? fs.readdirSync(abs, { withFileTypes: true }) : [];
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
function webJoin(...parts) {
  return path.posix.join(...parts);
}

/** cover-800.jpg → cover；cover.jpg → cover */
function canonicalStem(filename) {
  const { name } = path.parse(filename);
  const m = name.match(/^(.*?)-(\d{2,5})$/);
  return m ? m[1] : name;
}
/** 列出資料夾內「不重複的 stem」 */
function listCanonicalStems(dirAbs) {
  const stems = new Set();
  for (const ent of listDir(dirAbs)) {
    if (ent.isFile() && IMAGE_RE.test(ent.name)) {
      stems.add(canonicalStem(ent.name));
    }
  }
  return Array.from(stems).sort();
}

/** 依 stem 彙整變體（多尺寸/多格式） */
function collectVariantsByStem(dirAbs, webBase, stem) {
  const found = { avif: [], webp: [], jpeg: [] };

  // 切片：stem-400/800/1600.*
  for (const w of WIDTH_CANDIDATES) {
    for (const fmt of ["avif", "webp", "jpg", "jpeg", "png"]) {
      const filename = `${stem}-${w}.${fmt === "jpg" ? "jpg" : fmt}`;
      const abs = path.join(dirAbs, filename);
      if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
        const bucket = fmt === "avif" ? "avif" : fmt === "webp" ? "webp" : "jpeg";
        found[bucket].push({ src: webJoin(webBase, filename), w });
      }
    }
  }

  // 原檔（stem.avif/webp/jpg/png）
  for (const fmt of ["avif", "webp", "jpg", "jpeg", "png"]) {
    const filename = `${stem}.${fmt === "jpg" ? "jpg" : fmt}`;
    const abs = path.join(dirAbs, filename);
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      const bucket = fmt === "avif" ? "avif" : fmt === "webp" ? "webp" : "jpeg";
      if (!found[bucket].some(x => x.src.endsWith(filename))) {
        found[bucket].push({ src: webJoin(webBase, filename) });
      }
    }
  }

  // <img src> fallback：優先有 w 的最大；否則任何
  const pickFallback = (arr) =>
    arr.length ? arr.slice().sort((a,b)=>(b.w||0)-(a.w||0))[0].src : null;

  let fallback =
    pickFallback(found.jpeg) ||
    pickFallback(found.webp) ||
    pickFallback(found.avif) ||
    (found.jpeg[0]?.src || found.webp[0]?.src || found.avif[0]?.src);

  if (!fallback) fallback = webJoin(webBase, `${stem}.jpg`);

  return { fallback, sources: found, sizes: DEFAULT_SIZES };
}

/** 以「stem 為單位」建立 images & imagesMeta */
function buildImageListWithMeta(dirAbs, webBase) {
  const stems = listCanonicalStems(dirAbs);
  const images = [];
  const imagesMeta = [];
  for (const stem of stems) {
    const meta = collectVariantsByStem(dirAbs, webBase, stem);
    images.push(meta.fallback);
    imagesMeta.push(meta);
  }
  return { images, imagesMeta };
}

/* ========= 景點 ========= */
function scanCity(cityRoot, cityWebBase) {
  const result = { spots: [] };

  // 子資料夾 = 一個景點
  for (const ent of listDir(cityRoot)) {
    if (!ent.isDirectory()) continue;

    const spotDirAbs = path.join(cityRoot, ent.name);
    const webBase    = webJoin(cityWebBase, ent.name);
    const nameZh     = titleize(ent.name);
    const id         = slugify(nameZh);

    const { images, imagesMeta } = buildImageListWithMeta(spotDirAbs, webBase);
    if (!images.length) continue;

    let spot = {
      id,
      nameEn: hasCJK(nameZh) ? nameZh : nameZh,
      nameZh,
      tags: [],
      rating: null,
      blurb: "",
      images,
      imagesMeta,
    };

    // info.json
    const metaPath = path.join(spotDirAbs, "info.json");
    if (fs.existsSync(metaPath)) {
      try {
        const info = JSON.parse(fs.readFileSync(metaPath, "utf8"));
        spot = { ...spot, ...info, images, imagesMeta };
      } catch {}
    }

    result.spots.push(spot);
  }

  // 根目錄散圖 → 每個 stem 當一個景點
  const stems = listCanonicalStems(cityRoot);
  for (const stem of stems) {
    const meta = collectVariantsByStem(cityRoot, cityWebBase, stem);
    const nameZh = titleize(stem);
    result.spots.push({
      id: slugify(nameZh),
      nameEn: hasCJK(nameZh) ? nameZh : nameZh,
      nameZh,
      tags: [],
      rating: null,
      blurb: "",
      images: [meta.fallback],
      imagesMeta: [meta],
    });
  }

  result.spots.sort((a,b)=>a.nameZh.localeCompare(b.nameZh));
  return result;
}

/* ========= 食物 ========= */
function scanFood(foodRoot, foodWebBase) {
  const foods = [];

  for (const ent of listDir(foodRoot)) {
    if (!ent.isDirectory()) continue;

    const folder = ent.name;
    const dirAbs = path.join(foodRoot, folder);
    const webBase = webJoin(foodWebBase, folder);

    const { images, imagesMeta } = buildImageListWithMeta(dirAbs, webBase);
    if (!images.length) continue;

    const infoPath = path.join(dirAbs, "info.json");
    let base = {
      id: slugify(folder),
      title: titleize(folder),
      note: "",
      rating: null,
      tags: [],
      images,
      imagesMeta,
    };

    if (fs.existsSync(infoPath)) {
      try {
        const info = JSON.parse(fs.readFileSync(infoPath, "utf8"));
        base = { ...base, ...info, images, imagesMeta };
      } catch {}
    }

    foods.push(base);
  }

  foods.sort((a,b)=>(a.title||"").localeCompare(b.title||""));
  return foods;
}

/* ========= Gallery / Friends（也提供 Meta） ========= */
function scanLooseSet(dirAbs, webBase) {
  if (!fs.existsSync(dirAbs) || !fs.statSync(dirAbs).isDirectory()) {
    return { images: [], imagesMeta: [] };
  }
  return buildImageListWithMeta(dirAbs, webBase);
}

/* ========= main ========= */
function main() {
  console.log(`[gen-data] INPUT_DIR = ${INPUT_DIR}`);
  console.log(`[gen-data] OUTPUT_FILE = ${OUTPUT_FILE}`);

  const cityDirs = listDir(INPUT_DIR).filter(
    (ent) => ent.isDirectory() && !ent.name.startsWith("_") && ent.name !== "food"
  );

  const perCity = {};
  for (const ent of cityDirs) {
    const cityKey     = ent.name;
    const cityRoot    = path.join(INPUT_DIR, cityKey);
    const cityWebBase = `./images/${ent.name}`;
    perCity[cityKey]  = scanCity(cityRoot, cityWebBase);
  }

  const toya    = perCity.Toya    || { spots: [] };
  const otaru   = perCity.Otaru   || { spots: [] };
  const sapporo = perCity.Sapporo || { spots: [] };

  const foodRoot  = path.join(INPUT_DIR, "food");
  const foodItems = scanFood(foodRoot, "./images/food");

  // Gallery / Friends：輸出 images + imagesMeta
  const { images: galleryImages, imagesMeta: galleryImagesMeta } =
    scanLooseSet(path.join(INPUT_DIR, "gallery"), "./images/gallery");
  const { images: friendsPhotos, imagesMeta: friendsPhotosMeta } =
    scanLooseSet(path.join(INPUT_DIR, "friends"), "./images/friends");

  const output = `/* Auto-generated by gen-data.js at ${new Date().toISOString()} */
export const CITY_META = ${JSON.stringify(CITY_META, null, 2)};

export const toyaSpots    = ${JSON.stringify(toya.spots, null, 2)};
export const otaruSpots   = ${JSON.stringify(otaru.spots, null, 2)};
export const sapporoSpots = ${JSON.stringify(sapporo.spots, null, 2)};

export const foodItems    = ${JSON.stringify(foodItems, null, 2)};

export const galleryImages     = ${JSON.stringify(galleryImages, null, 2)};
export const galleryImagesMeta = ${JSON.stringify(galleryImagesMeta, null, 2)};
export const friendsPhotos     = ${JSON.stringify(friendsPhotos, null, 2)};
export const friendsPhotosMeta = ${JSON.stringify(friendsPhotosMeta, null, 2)};
`;

  ensureDir(OUTPUT_FILE);
  fs.writeFileSync(OUTPUT_FILE, output, "utf8");
  console.log(`[gen-data] Wrote ${OUTPUT_FILE}`);
}

main();