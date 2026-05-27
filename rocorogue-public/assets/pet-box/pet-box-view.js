import { PET_BOX_ASSETS } from "./pet-box-assets.js?v=20260528-pet-box-99";
import { PET_BOX_LAYOUT } from "./pet-box-layout.js?v=20260528-pet-box-98";
import { PET_BOX_MOCK_PETS } from "./pet-box-mock-pets.js?v=20260528-pet-box-98";
import { requiredPetExpForNextLevel } from "./pet-level-exp-spec.js?v=20260528-pet-box-01";

const PET_BOX_ROUTE = "/mechanics";
const PET_BOX_VIEW_PARAM = "pet-box";
const PET_BOX_DEFAULT_PAGE = 1;
const PET_BOX_PLACEHOLDER_PET_COUNT = 0;
const PET_BOX_PETS_KEY = "rocorogue.pet-box.pets";
const PET_BOX_PETS_VERSION = 9;
const PET_BOX_MAX_LEVEL = 60;
const PET_BOX_MAX_TALENT = 10;
const PET_BOX_MAX_AWAKENING = 5;
const PET_BOX_MAX_STAR_LEVEL = 5;
const PET_BOX_STARTER_LEVEL = 5;
const PET_BOX_STARTER_AWAKENING = 0;
const PET_BOX_RANDOM_IV_MIN_COUNT = 1;
const PET_BOX_RANDOM_IV_MAX_COUNT = 3;
const PET_BOX_RADAR_RADIUS = 125;
const PET_BOX_TALENT_BAR_MAX = 500;
const PET_BOX_COMMON_FRAME_BLACK = "/assets/ui/common/common_frame_black.png";
const PET_BOX_COMMON_FRAME_YELLOW = "/assets/ui/common/common_frame_yellow.png";
const PET_BOX_TYPE_BADGE_FRAME_WIDTH = 102;
const PET_BOX_TYPE_ICON_SCALE = 1.15;
const PET_BOX_STAT_ICON_SCALE = 1.25;
const PET_BOX_ENGINE_STAT_KEYS = Object.freeze(["hp", "atk", "def", "spa", "spd", "spe"]);
const PET_BOX_RADAR_STAT_ORDER = Object.freeze(["hp", "spa", "spd", "spe", "def", "atk"]);
const PET_BOX_TALENT_STAT_ORDER = Object.freeze(["hp", "atk", "spa", "def", "spd", "spe"]);
const PET_BOX_STARTER_SPECIES = Object.freeze(["迪莫", "火花", "水蓝蓝", "喵喵", "罗隐", "画间沉铁兽"]);
const PET_BOX_DETAIL_STAT_KEYS = Object.freeze({
  hp: "hp",
  attack: "atk",
  magicAttack: "spa",
  defense: "def",
  speed: "spe",
  magicDefense: "spd",
});
const PET_BOX_STAT_ALIASES = Object.freeze({
  hp: "hp",
  HP: "hp",
  生命: "hp",
  attack: "atk",
  atk: "atk",
  Atk: "atk",
  物攻: "atk",
  defense: "def",
  def: "def",
  Def: "def",
  物防: "def",
  magicAttack: "spa",
  spa: "spa",
  SpA: "spa",
  魔攻: "spa",
  magicDefense: "spd",
  spd: "spd",
  SpD: "spd",
  魔防: "spd",
  speed: "spe",
  spe: "spe",
  Spe: "spe",
  速度: "spe",
});
const PET_BOX_STAT_LABELS = Object.freeze({
  hp: "生命",
  atk: "物攻",
  def: "物防",
  spa: "魔攻",
  spd: "魔防",
  spe: "速度",
});
const PET_BOX_STAT_ICON_KEYS = Object.freeze({
  hp: "hp",
  atk: "attack",
  def: "defense",
  spa: "magicAttack",
  spd: "magicDefense",
  spe: "speed",
});
const PET_BOX_NATURE_EFFECTS = Object.freeze({
  沉默: { up: "hp", down: "atk" },
  平和: { up: "hp", down: "spa" },
  忧郁: { up: "hp", down: "def" },
  粗心: { up: "hp", down: "spd" },
  踏实: { up: "hp", down: "spe" },
  逞强: { up: "atk", down: "hp" },
  大胆: { up: "atk", down: "def" },
  固执: { up: "atk", down: "spa" },
  调皮: { up: "atk", down: "spd" },
  勇敢: { up: "atk", down: "spe" },
  理性: { up: "spa", down: "hp" },
  聪明: { up: "spa", down: "atk" },
  专注: { up: "spa", down: "def" },
  偏执: { up: "spa", down: "spd" },
  冷静: { up: "spa", down: "spe" },
  热情: { up: "spe", down: "hp" },
  胆小: { up: "spe", down: "atk" },
  开朗: { up: "spe", down: "spa" },
  急躁: { up: "spe", down: "def" },
  莽撞: { up: "spe", down: "spd" },
  坦率: { up: "def", down: "hp" },
  稳重: { up: "def", down: "atk" },
  天真: { up: "def", down: "spa" },
  悠闲: { up: "def", down: "spe" },
  懒散: { up: "def", down: "spd" },
  警惕: { up: "spd", down: "atk" },
  害羞: { up: "spd", down: "spa" },
  温顺: { up: "spd", down: "def" },
  慎重: { up: "spd", down: "spe" },
  焦虑: { up: "spd", down: "hp" },
});

let activeStage = null;
let activeRoot = null;
let titleBeforePetBox = document.title;
let abilityIconMap = null;
let abilityInfoMap = null;
let speciesAvatarMap = null;
let speciesStatsMap = null;
let speciesAbilityMap = null;
let abilityIconMapLoadPromise = null;
let activeNatureModalCleanup = null;

const missingAbilityIconWarnings = new Set();

const PET_BOX_SOURCE = Object.freeze({
  file: "rocorogue-public/assets/pet-box/pet-box-view.js",
  component: "renderPetBox",
  styleFile: "rocorogue-public/assets/pet-box/pet-box.css",
});

function tagUi(element, meta) {
  if (!element || !meta?.id) return element;

  element.dataset.uiId = meta.id;
  element.dataset.uiLabel = meta.label || meta.id;
  element.dataset.uiSourceFile = meta.file || PET_BOX_SOURCE.file;
  element.dataset.uiSourceComponent = meta.component || PET_BOX_SOURCE.component;
  element.dataset.uiSourceStyleFile = meta.styleFile || PET_BOX_SOURCE.styleFile;
  element.dataset.uiSource = `${element.dataset.uiSourceFile}:${element.dataset.uiSourceComponent}`;
  return element;
}

function parseHash() {
  const raw = location.hash.slice(1) || PET_BOX_ROUTE;
  const [path, query = ""] = raw.split("?");
  return { path, params: new URLSearchParams(query) };
}

function isPetBoxRoute() {
  const { path, params } = parseHash();
  return path === PET_BOX_ROUTE && params.get("view") === PET_BOX_VIEW_PARAM;
}

function pageCapacity() {
  const { columns, rows } = PET_BOX_LAYOUT.grid;
  return columns * rows;
}

function unlockedPageCount(petCount = PET_BOX_PLACEHOLDER_PET_COUNT) {
  return petCount >= pageCapacity() ? 2 : 1;
}

function resolvePageState(petCount = PET_BOX_PLACEHOLDER_PET_COUNT) {
  const unlockedPages = unlockedPageCount(petCount);
  return {
    currentPage: Math.min(PET_BOX_DEFAULT_PAGE, unlockedPages),
    unlockedPages,
  };
}

function pageIconAsset(page) {
  return page >= 2 ? PET_BOX_ASSETS.boxLabelPage2 : PET_BOX_ASSETS.boxLabelPage1;
}

function indexBundleUrl() {
  const bundle = Array.from(document.scripts).find((script) => /\/assets\/index-[^/]+\.js(?:\?|$)/.test(script.src));
  return bundle?.src || "/assets/index-xu9RZIac.js";
}

function extractAbilityIconMap(bundleText) {
  const start = bundleText.indexOf("_i={");
  const end = start >= 0 ? bundleText.indexOf("},ki=[", start) : -1;
  if (start < 0 || end < 0) return {};

  const source = bundleText.slice(start + 4, end + 1);
  const map = {};
  const entryPattern = /(?:"([^"]+)"|([^,{}:]+)):"([^"]+\.png)"/g;
  for (const match of source.matchAll(entryPattern)) {
    const name = (match[1] || match[2] || "").trim();
    const file = match[3];
    if (name && file) map[name] = file;
  }
  return map;
}

function extractAbilityInfoMap(bundleText) {
  const start = bundleText.indexOf("const Ct={");
  const end = start >= 0 ? bundleText.indexOf("},_i={", start) : -1;
  if (start < 0 || end < 0) return {};

  const source = bundleText.slice(start, end);
  const map = {};
  const entryPattern = /(?:(?:"([^"]+)"|([^,{}:]+))):\{name:"([^"]+)",desc:"((?:\\"|[^"])*)"/g;
  for (const match of source.matchAll(entryPattern)) {
    const name = (match[3] || match[1] || match[2] || "").trim();
    const desc = (match[4] || "").replace(/\\"/g, '"').trim();
    if (name && desc) map[name] = { name, desc };
  }
  return map;
}

function extractSpeciesAvatarMap(bundleText) {
  const map = {};
  const entryPattern = /(?:"([^"]+)"|([^,{}:]+)):\{h:"([^"]+)",p:"([^"]+)"\}/g;
  for (const match of bundleText.matchAll(entryPattern)) {
    const name = (match[1] || match[2] || "").trim();
    const head = match[3];
    const portrait = match[4];
    if (name && head) map[name] = { head, portrait };
  }
  return map;
}

function extractSpeciesStatsMap(bundleText) {
  const map = {};
  const entryPattern = /(?:"([^"]+)"|([^,{}:]+)):\{num:\d+,name:"([^"]+)",types:\[[^\]]*?\],baseStats:\{hp:(\d+),atk:(\d+),def:(\d+),spa:(\d+),spd:(\d+),spe:(\d+)\}/g;
  for (const match of bundleText.matchAll(entryPattern)) {
    const key = (match[1] || match[2] || match[3] || "").trim();
    const name = (match[3] || key).trim();
    const stats = {
      hp: Number(match[4]),
      atk: Number(match[5]),
      def: Number(match[6]),
      spa: Number(match[7]),
      spd: Number(match[8]),
      spe: Number(match[9]),
    };
    if (name) map[name] = stats;
    if (key && key !== name) map[key] = stats;
  }
  return map;
}

function extractSpeciesAbilityMap(bundleText) {
  const map = {};
  const entryPattern =
    /(?:"([^"]+)"|([^,{}:]+)):\{num:\d+,name:"([^"]+)",types:\[[^\]]*?\],baseStats:\{[^}]+\},abilities:\{0:"([^"]+)"/g;
  for (const match of bundleText.matchAll(entryPattern)) {
    const key = (match[1] || match[2] || match[3] || "").trim();
    const name = (match[3] || key).trim();
    const ability = (match[4] || "").trim();
    if (name && ability) map[name] = ability;
    if (key && key !== name && ability) map[key] = ability;
  }
  return map;
}

function loadAbilityIconMap() {
  if (abilityIconMap) return Promise.resolve(abilityIconMap);
  if (!abilityIconMapLoadPromise) {
    abilityIconMapLoadPromise = fetch(indexBundleUrl(), { cache: "no-store" })
      .then((response) => (response.ok ? response.text() : ""))
      .then((bundleText) => {
        abilityIconMap = extractAbilityIconMap(bundleText);
        abilityInfoMap = extractAbilityInfoMap(bundleText);
        speciesAvatarMap = extractSpeciesAvatarMap(bundleText);
        speciesStatsMap = extractSpeciesStatsMap(bundleText);
        speciesAbilityMap = extractSpeciesAbilityMap(bundleText);
        return abilityIconMap;
      })
      .catch((error) => {
        console.warn("[pet-box] 读取真实特性图标映射失败", error);
        abilityIconMap = {};
        abilityInfoMap = {};
        speciesAvatarMap = {};
        speciesStatsMap = {};
        speciesAbilityMap = {};
        return abilityIconMap;
      });
  }
  return abilityIconMapLoadPromise;
}

function loadAbilityInfoMap() {
  if (abilityInfoMap) return Promise.resolve(abilityInfoMap);
  return loadAbilityIconMap().then(() => abilityInfoMap || {});
}

function warnMissingAbilityIcon(abilityName) {
  if (!abilityName || missingAbilityIconWarnings.has(abilityName)) return;
  missingAbilityIconWarnings.add(abilityName);
  console.warn(`[pet-box] 缺少真实特性图标: ${abilityName}`);
}

function abilityIconAsset(abilityName) {
  const name = String(abilityName || "").trim();
  if (!name || !abilityIconMap) return "";

  const iconFile = abilityIconMap[name];
  if (!iconFile) {
    warnMissingAbilityIcon(name);
    return "";
  }
  return `/assets/abilities/${iconFile}`;
}

function abilityDescription(abilityName) {
  const name = String(abilityName || "").trim();
  if (!name || !abilityInfoMap) return "";
  return abilityInfoMap[name]?.desc || "";
}

function speciesHeadAsset(speciesName) {
  const name = String(speciesName || "").trim();
  if (!name || !speciesAvatarMap) return "";

  const avatar = speciesAvatarMap[name];
  return avatar?.head ? `/assets/heads/${avatar.head}` : "";
}

function speciesAbilityName(speciesName) {
  const name = String(speciesName || "").trim();
  if (!name || !speciesAbilityMap) return "";
  return speciesAbilityMap[name] || "";
}

function randomInt(maxExclusive) {
  const max = Math.max(0, Math.floor(maxExclusive));
  if (max <= 0) return 0;

  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.getRandomValues) {
    const buffer = new Uint32Array(1);
    cryptoApi.getRandomValues(buffer);
    return buffer[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function randomIvCount() {
  return PET_BOX_RANDOM_IV_MIN_COUNT + randomInt(PET_BOX_RANDOM_IV_MAX_COUNT - PET_BOX_RANDOM_IV_MIN_COUNT + 1);
}

function randomIvStats(count = randomIvCount()) {
  const pool = [...PET_BOX_ENGINE_STAT_KEYS];
  const selected = [];
  while (pool.length && selected.length < count) {
    const [statKey] = pool.splice(randomInt(pool.length), 1);
    selected.push(statKey);
  }
  return selected;
}

function randomIvTiers(ivs) {
  const tiers = {};
  for (const statKey of ivs) {
    tiers[statKey] = 7 + randomInt(4);
  }
  return tiers;
}

function randomNatureName() {
  const natures = Object.keys(PET_BOX_NATURE_EFFECTS);
  return natures[randomInt(natures.length)] || "中立";
}

function randomGenderValue() {
  return randomInt(2) === 0 ? "male" : "female";
}

function createStarterPetBoxPets() {
  return PET_BOX_STARTER_SPECIES.map((species, index) => {
    const ivs = randomIvStats();
    const isHuajianChentieshou = species === "画间沉铁兽";
    const starterIvs = isHuajianChentieshou ? ["hp", "spe", "atk"] : ivs;
    const starterIvTiers = isHuajianChentieshou ? { hp: 10, spe: 10, atk: 10 } : randomIvTiers(starterIvs);
    return {
      id: `starter-${index + 1}`,
      species,
      level: isHuajianChentieshou ? PET_BOX_MAX_LEVEL : PET_BOX_STARTER_LEVEL,
      maxLevel: PET_BOX_MAX_LEVEL,
      awakening: isHuajianChentieshou ? PET_BOX_MAX_AWAKENING : PET_BOX_STARTER_AWAKENING,
      starLevel: isHuajianChentieshou ? PET_BOX_MAX_AWAKENING : PET_BOX_STARTER_AWAKENING,
      growthStars: 0,
      nature: isHuajianChentieshou ? "固执" : randomNatureName(),
      ivs: starterIvs,
      ivTiers: starterIvTiers,
      gender: randomGenderValue(),
      moves: [],
      bloodline: "首领",
    };
  });
}

function normalizeStoredPetBoxPets(value) {
  const pets = Array.isArray(value) ? value : Array.isArray(value?.pets) ? value.pets : Array.isArray(value?.team) ? value.team : null;
  return Array.isArray(pets) ? pets.slice(0, PET_BOX_STARTER_SPECIES.length) : null;
}

function hasStarterPetBoxSpecies(pets) {
  if (!Array.isArray(pets) || pets.length < PET_BOX_STARTER_SPECIES.length) return false;
  return PET_BOX_STARTER_SPECIES.every((species, index) => {
    const pet = pets[index] || {};
    const storedSpecies = String(pet.species ?? pet.speciesName ?? pet.name ?? "").trim();
    return storedSpecies === species;
  });
}

function hasValidStarterIvData(pets) {
  if (!Array.isArray(pets) || pets.length < PET_BOX_STARTER_SPECIES.length) return false;
  return PET_BOX_STARTER_SPECIES.every((_, index) => {
    const pet = pets[index] || {};
    const ivs = [...normalizeIvList(pet.ivs)];
    if (ivs.length < PET_BOX_RANDOM_IV_MIN_COUNT || ivs.length > PET_BOX_RANDOM_IV_MAX_COUNT) return false;
    const tiers = normalizeIvTiers(pet.ivTiers);
    return ivs.every((statKey) => {
      const tier = normalizeNumber(tiers[statKey], PET_BOX_MAX_TALENT);
      return tier >= 7 && tier <= PET_BOX_MAX_TALENT;
    });
  });
}

function persistPetBoxPets(pets) {
  try {
    localStorage.setItem(PET_BOX_PETS_KEY, JSON.stringify({ version: PET_BOX_PETS_VERSION, pets }));
  } catch {
    // Rendering can continue without persistence when storage is unavailable.
  }
}

function readStoredPetBoxPets() {
  try {
    const raw = localStorage.getItem(PET_BOX_PETS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const pets = normalizeStoredPetBoxPets(parsed);
      if (parsed?.version === PET_BOX_PETS_VERSION && hasStarterPetBoxSpecies(pets) && hasValidStarterIvData(pets)) return pets;
    }

    const starters = createStarterPetBoxPets();
    persistPetBoxPets(starters);
    return starters;
  } catch {
    const starters = createStarterPetBoxPets();
    persistPetBoxPets(starters);
    return starters;
  }
}

function normalizeGender(value) {
  if (!value) return null;
  const gender = String(value).trim().toLowerCase();
  if (["m", "male", "man", "boy", "男", "雄", "雄性", "公", "♂"].includes(gender)) {
    return {
      label: "雄",
      iconAsset: PET_BOX_ASSETS.genderMale,
    };
  }
  if (["f", "female", "woman", "girl", "女", "雌", "雌性", "母", "♀"].includes(gender)) {
    return {
      label: "雌",
      iconAsset: PET_BOX_ASSETS.genderFemale,
    };
  }
  return null;
}

function normalizeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clampRounded(value, min, max, fallback = min) {
  const number = Number(value);
  const rounded = Number.isFinite(number) ? Math.round(number) : fallback;
  return Math.max(min, Math.min(max, rounded));
}

function resolvePetExpForLevel(pet, storedPet, level) {
  const expMax = requiredPetExpForNextLevel(level);
  const rawExp =
    storedPet?.exp ??
    storedPet?.currentExp ??
    storedPet?.experience ??
    storedPet?.["\u7ecf\u9a8c"] ??
    storedPet?.["\u5f53\u524d\u7ecf\u9a8c"] ??
    pet?.exp ??
    0;
  const exp = Math.max(0, Math.round(normalizeNumber(rawExp, 0)));
  return {
    exp: expMax > 0 ? Math.min(exp, expMax) : 0,
    expMax,
  };
}

function awakeningStarLevel(awakening, starLevel = awakening) {
  const normalizedAwakening = clampRounded(awakening, 0, PET_BOX_MAX_AWAKENING, 0);
  const normalizedStarLevel = clampRounded(starLevel, 0, PET_BOX_MAX_STAR_LEVEL, normalizedAwakening);
  return Math.max(normalizedAwakening, normalizedStarLevel);
}

function gameRound(value) {
  const floor = Math.floor(value);
  return value - floor > 0.5 ? floor + 1 : floor;
}

function normalizeEngineStats(stats) {
  if (!stats || typeof stats !== "object") return null;
  const normalized = {};
  for (const key of PET_BOX_ENGINE_STAT_KEYS) {
    const value = normalizeNumber(stats[key], NaN);
    if (!Number.isFinite(value)) return null;
    normalized[key] = value;
  }
  return normalized;
}

function engineStatsFromDetailStats(stats) {
  if (!stats || typeof stats !== "object") return null;
  const normalized = {
    hp: normalizeNumber(stats.hp, NaN),
    atk: normalizeNumber(stats.attack, NaN),
    def: normalizeNumber(stats.defense, NaN),
    spa: normalizeNumber(stats.magicAttack, NaN),
    spd: normalizeNumber(stats.magicDefense, NaN),
    spe: normalizeNumber(stats.speed, NaN),
  };
  return Object.values(normalized).every(Number.isFinite) ? normalized : null;
}

function detailStatsFromEngineStats(stats) {
  if (!stats) return null;
  return {
    hp: stats.hp,
    attack: stats.atk,
    magicAttack: stats.spa,
    defense: stats.def,
    speed: stats.spe,
    magicDefense: stats.spd,
  };
}

function normalizeStatKey(statKey) {
  const key = String(statKey || "").trim();
  if (!key) return null;
  return PET_BOX_STAT_ALIASES[key] || PET_BOX_STAT_ALIASES[key.toLowerCase()] || null;
}

function normalizeIvList(ivs) {
  if (!Array.isArray(ivs)) return new Set();
  return new Set(ivs.map(normalizeStatKey).filter(Boolean));
}

function normalizeIvTiers(ivTiers) {
  const normalized = {};
  if (!ivTiers || typeof ivTiers !== "object") return normalized;
  for (const [rawKey, rawValue] of Object.entries(ivTiers)) {
    const statKey = normalizeStatKey(rawKey);
    if (statKey) normalized[statKey] = rawValue;
  }
  return normalized;
}

function talentTitleFor(natureName, ivs) {
  const ivSet = normalizeIvList(ivs);
  const ivCount = ivSet.size;
  if (ivCount <= 1) return "一般般的天分";
  if (ivCount === 2) return "还不错的天分";

  const natureUpStat = PET_BOX_NATURE_EFFECTS[natureName]?.up;
  return natureUpStat && ivSet.has(natureUpStat) ? "了不起的天分" : "相当好的天分";
}

function talentLabelBgFor(talentTitle) {
  if (talentTitle === "一般般的天分" || talentTitle === "还不错的天分") {
    return PET_BOX_ASSETS.detailTalentLabelBgBasic;
  }
  if (talentTitle === "相当好的天分") return PET_BOX_ASSETS.detailTalentLabelBgQuiteGood;
  return PET_BOX_ASSETS.detailTalentLabelBg;
}

function talentLabelBgRectFor(talentTitle, rect) {
  if (talentTitle !== "了不起的天分") return rect;
  const w = 200;
  const h = 70;
  return {
    x: rect.x - (210 - rect.w) / 2 + 10,
    y: rect.y - (h - rect.h) / 2,
    w,
    h,
  };
}

function talentTextRectFor(talentTitle, rect) {
  return talentTitle === "了不起的天分" ? { ...rect, x: rect.x - 4 } : rect;
}

function talentQuestionRectFor(talentTitle, rect) {
  return talentTitle === "了不起的天分" ? { ...rect, x: rect.x + 1 } : rect;
}

function actualNatureMultiplier(natureName, statKey, starLevel = 0) {
  const effect = PET_BOX_NATURE_EFFECTS[natureName];
  if (!effect) return 1;
  if (effect.up === statKey) {
    const normalizedStarLevel = Math.min(Math.max(0, Math.round(normalizeNumber(starLevel, 0))), PET_BOX_MAX_STAR_LEVEL);
    return 1.1 + 0.02 * normalizedStarLevel;
  }
  if (effect.down === statKey) return 0.9;
  return 1;
}

function calculateActualStats(baseStats, options = {}) {
  if (!baseStats) return null;
  const level = Math.max(1, Math.round(normalizeNumber(options.level, PET_BOX_MAX_LEVEL)));
  const awakening = clampRounded(options.awakening, 0, PET_BOX_MAX_AWAKENING, 0);
  const starLevel = awakeningStarLevel(awakening, options.starLevel);
  const growthStars = Math.max(0, Math.round(normalizeNumber(options.growthStars, 0)));
  const ivs = normalizeIvList(options.ivs);
  const ivTiers = normalizeIvTiers(options.ivTiers);
  const stats = {};

  for (const statKey of PET_BOX_ENGINE_STAT_KEYS) {
    const base = normalizeNumber(baseStats[statKey], 0);
    const talent = ivs.has(statKey) ? clampRounded(ivTiers[statKey], 7, PET_BOX_MAX_TALENT, PET_BOX_MAX_TALENT) : 0;
    const effectiveBase = base + 0.5 * talent * (1 + awakening);
    const natureMultiplier = actualNatureMultiplier(options.natureName, statKey, starLevel);
    const raw =
      statKey === "hp"
        ? natureMultiplier * (effectiveBase * ((2 * level + 50) / 100) + level + 10) + 2 * growthStars + 20 * starLevel
        : natureMultiplier * (effectiveBase * ((level + 50) / 100) + 10) + growthStars + 10 * starLevel;
    stats[statKey] = Math.max(1, gameRound(raw));
  }

  return stats;
}

function fullPositiveNatureMultiplier(starLevel = PET_BOX_MAX_STAR_LEVEL) {
  const level = clampRounded(starLevel, 0, PET_BOX_MAX_STAR_LEVEL, PET_BOX_MAX_STAR_LEVEL);
  return 1.1 + 0.02 * level;
}

function calculateRadarCapStats(baseStats, options = {}) {
  const level = clampRounded(options.level, 1, PET_BOX_MAX_LEVEL, PET_BOX_MAX_LEVEL);
  const awakening = clampRounded(options.awakening, 0, PET_BOX_MAX_AWAKENING, PET_BOX_MAX_AWAKENING);
  const starLevel = awakeningStarLevel(awakening, options.starLevel);
  const growthStars = Math.max(0, Math.round(normalizeNumber(options.growthStars, 0)));
  const natureMultiplier = fullPositiveNatureMultiplier(starLevel);
  const stats = {};

  for (const statKey of PET_BOX_ENGINE_STAT_KEYS) {
    const base = normalizeNumber(baseStats?.[statKey], 0);
    const talentValue = PET_BOX_MAX_TALENT * (1 + awakening);
    const effectiveBase = base + 0.5 * talentValue;
    const raw =
      statKey === "hp"
        ? natureMultiplier * (effectiveBase * ((2 * level + 50) / 100) + level + 10) + 2 * growthStars + 20 * starLevel
        : natureMultiplier * (effectiveBase * ((level + 50) / 100) + 10) + growthStars + 10 * starLevel;
    stats[statKey] = Math.max(1, gameRound(raw));
  }

  return stats;
}

function mergeStoredPetData(pet, storedPet) {
  if (!storedPet) {
    const speciesName = String(pet.speciesName ?? pet.name ?? "").trim();
    const baseStats = speciesStatsMap?.[speciesName] || engineStatsFromDetailStats(pet.stats);
    const realHeadAsset = speciesHeadAsset(speciesName);
    const actualStats = engineStatsFromDetailStats(pet.stats);
    const natureName = pet.natureName || "";
    const ivs = pet.ivs || [];
    const expInfo = resolvePetExpForLevel(pet, null, pet.level);
    return {
      ...pet,
      speciesName,
      ...expInfo,
      avatarAsset: realHeadAsset || "",
      gender: "",
      genderIconAsset: "",
      traitName: "",
      traitIconAsset: "",
      traitDescription: "",
      natureName,
      talentTitle: talentTitleFor(natureName, ivs) || pet.talentTitle,
      baseStats,
      actualStats,
      radarCapStats: calculateRadarCapStats(baseStats, {
        level: pet.maxLevel || PET_BOX_MAX_LEVEL,
      }),
    };
  }

  const speciesName = String(storedPet.species ?? storedPet.speciesName ?? storedPet.name ?? storedPet["精灵"] ?? pet.name).trim() || pet.name;
  const displayName = String(storedPet.name ?? storedPet.nickname ?? storedPet.species ?? pet.name).trim() || pet.name;
  const gender = normalizeGender(storedPet.gender ?? storedPet.sex ?? storedPet["性别"]);
  const abilityName =
    String(storedPet.ability ?? storedPet.traitName ?? storedPet["特性"] ?? "").trim() ||
    speciesAbilityName(speciesName) ||
    pet.traitName ||
    "";
  const natureName = String(storedPet.nature ?? storedPet.natureName ?? storedPet["性格"] ?? "中立").trim() || "中立";
  const level = normalizeNumber(storedPet.level ?? pet.level, pet.level || PET_BOX_MAX_LEVEL);
  const expInfo = resolvePetExpForLevel(pet, storedPet, level);
  const awakening = normalizeNumber(storedPet.awakening ?? storedPet.awaken ?? storedPet["觉醒"] ?? pet.awakening, pet.awakening || 0);
  const starLevel = awakeningStarLevel(
    awakening,
    storedPet.starLevel ?? storedPet.star ?? storedPet.stars ?? pet.starLevel ?? awakening,
  );
  const growthStars = normalizeNumber(storedPet.growthStars ?? storedPet.growth ?? storedPet["成长"] ?? pet.growthStars, pet.growthStars || 0);
  const maxLevel = normalizeNumber(storedPet.maxLevel ?? storedPet.max ?? pet.maxLevel, pet.maxLevel || PET_BOX_MAX_LEVEL);
  const ivs = [...normalizeIvList(storedPet.ivs)];
  const ivTiers = normalizeIvTiers(storedPet.ivTiers);
  const talentTitle = talentTitleFor(natureName, ivs);
  const baseStats = normalizeEngineStats(storedPet.baseStats) || speciesStatsMap?.[speciesName] || engineStatsFromDetailStats(pet.stats);
  const calculatedActualStats = calculateActualStats(baseStats, {
    level,
    natureName,
    ivs,
    ivTiers,
    awakening,
    starLevel,
    growthStars,
  });
  const actualStats =
    normalizeEngineStats(storedPet.storedStats) ||
    normalizeEngineStats(storedPet.actualStats) ||
    calculatedActualStats ||
    normalizeEngineStats(storedPet.stats) ||
    engineStatsFromDetailStats(storedPet.stats) ||
    engineStatsFromDetailStats(pet.stats);
  const realHeadAsset = speciesHeadAsset(speciesName);
  const radarCapStats = calculateRadarCapStats(baseStats, {
    level: maxLevel,
    awakening: PET_BOX_MAX_AWAKENING,
    starLevel: PET_BOX_MAX_STAR_LEVEL,
    growthStars,
  });
  return {
    ...pet,
    name: displayName,
    speciesName,
    baseStats,
    actualStats,
    stats: detailStatsFromEngineStats(actualStats) || pet.stats,
    level,
    ...expInfo,
    awakening,
    growthStars,
    maxLevel,
    avatarAsset: realHeadAsset || "",
    gender: gender?.label || "",
    genderIconAsset: gender?.iconAsset || "",
    traitName: abilityName,
    traitIconAsset: abilityIconAsset(abilityName),
    traitDescription: abilityDescription(abilityName),
    natureName,
    talentTitle,
    starLevel,
    ivs,
    ivTiers,
    radarCapStats,
  };
}

function petForSlot(slotIndex, storedPets) {
  const pet = PET_BOX_MOCK_PETS[slotIndex] || null;
  if (!pet) return null;
  return mergeStoredPetData(pet, storedPets[slotIndex]);
}

function setPosition(element, rect) {
  Object.assign(element.style, {
    left: `${rect.x}px`,
    top: `${rect.y}px`,
    width: `${rect.w}px`,
    height: `${rect.h}px`,
  });
}

function rectRelativeTo(rect, parentRect) {
  return {
    x: rect.x - parentRect.x,
    y: rect.y - parentRect.y,
    w: rect.w,
    h: rect.h,
  };
}

function scaleRectFromCenter(rect, scale) {
  const w = rect.w * scale;
  const h = rect.h * scale;
  return {
    x: rect.x + (rect.w - w) / 2,
    y: rect.y + (rect.h - h) / 2,
    w,
    h,
  };
}

function addImage(parent, src, rect, className = "", alt = "", uiMeta = null) {
  const image = document.createElement("img");
  image.src = src;
  image.alt = alt;
  image.draggable = false;
  image.className = ["pet-box-ui-image", className].filter(Boolean).join(" ");
  setPosition(image, rect);
  tagUi(image, uiMeta);
  parent.append(image);
  return image;
}

function addClickableImage(parent, src, rect, label, onClick, uiMeta = null) {
  const image = addImage(parent, src, rect, "pet-box-clickable", label, uiMeta);
  image.role = "button";
  image.tabIndex = 0;
  image.setAttribute("aria-label", label);
  if (onClick) {
    image.addEventListener("click", onClick);
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick(event);
      }
    });
  }
  return image;
}

function addGroup(parent, rect, className = "", uiMeta = null) {
  const group = document.createElement("div");
  group.className = ["pet-box-ui-group", className].filter(Boolean).join(" ");
  setPosition(group, rect);
  tagUi(group, uiMeta);
  parent.append(group);
  return group;
}

function addText(parent, rect, text, className = "", uiMeta = null) {
  const node = document.createElement("div");
  node.className = ["pet-box-detail-text", className].filter(Boolean).join(" ");
  node.textContent = text;
  node.dataset.value = String(text);
  setPosition(node, rect);
  tagUi(node, uiMeta);
  parent.append(node);
  return node;
}

function measureTextWidth(node) {
  const probe = document.createElement("span");
  probe.className = node.className;
  probe.textContent = node.textContent || "";
  Object.assign(probe.style, {
    position: "absolute",
    left: "-10000px",
    top: "-10000px",
    width: "auto",
    height: "auto",
    visibility: "hidden",
    display: "inline-block",
    overflow: "visible",
    whiteSpace: "nowrap",
  });
  node.parentElement?.append(probe);
  const width = probe.offsetWidth || probe.scrollWidth || 0;
  probe.remove();
  return width;
}

function rectAfterText(node, textRect, iconRect, gap = 8) {
  const textWidth = measureTextWidth(node);
  const maxX = textRect.x + textRect.w - iconRect.w;
  return {
    ...iconRect,
    x: Math.min(textRect.x + Math.ceil(textWidth) + gap, maxX),
  };
}

function genderIconRectAfterText(node, textRect, iconRect) {
  const scale = 0.5;
  const w = iconRect.w * scale;
  const h = iconRect.h * scale;
  const textWidth = measureTextWidth(node);
  const maxX = textRect.x + textRect.w - w;
  return {
    ...iconRect,
    x: Math.min(textRect.x + Math.ceil(textWidth) + 8, maxX),
    y: textRect.y + textRect.h - h,
    w,
    h,
  };
}

function addSvgNode(parent, tagName, attributes = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  for (const [key, value] of Object.entries(attributes)) {
    if (value != null) node.setAttribute(key, String(value));
  }
  parent.append(node);
  return node;
}

function formatRatioText(current, max) {
  return `${current}/${max}`;
}

function levelFrameRect(levelRect) {
  return {
    x: levelRect.x + 6,
    y: levelRect.y - 9,
    w: 156,
    h: 54,
  };
}

function levelBadgeGroupRect(levelRect) {
  const frame = levelFrameRect(levelRect);
  return {
    x: frame.x,
    y: frame.y,
    w: frame.w,
    h: frame.h,
  };
}

function addLevelRatioText(parent, rect, current, max, uiMeta = null) {
  const node = addText(parent, { ...rect, x: rect.x + 18, w: 122 }, "", "pet-box-detail-level", uiMeta);
  node.append(
    Object.assign(document.createElement("span"), {
      className: "pet-box-detail-level-current",
      textContent: String(current),
    }),
    Object.assign(document.createElement("span"), {
      className: "pet-box-detail-level-max",
      textContent: `/${max}`,
    })
  );
  return node;
}

function setDetailAction(detailLayer, action, pet = null) {
  detailLayer.dataset.lastAction = action;
  if (action === "ivHelp" && pet) {
    renderTalentPopup(detailLayer, pet);
  }
}

function clearNaturePopup(detailLayer) {
  detailLayer.querySelector('[data-ui-id="bag.detail.nature.popup"]')?.remove();
  closeActiveDetailModal();
}

function closeActiveDetailModal() {
  if (activeNatureModalCleanup) {
    activeNatureModalCleanup();
    activeNatureModalCleanup = null;
  } else {
    document.querySelector('[data-ui-id="bag.detail.nature.modalOverlay"]')?.remove();
    document.querySelector('[data-ui-id="bag.detail.trait.modalOverlay"]')?.remove();
    document.querySelector('[data-ui-id="bag.detail.talent.modalOverlay"]')?.remove();
  }
}

function statIconAsset(statKey) {
  return PET_BOX_ASSETS.statIcons[PET_BOX_STAT_ICON_KEYS[statKey]] || "";
}

function natureUpMultiplier(starLevel = 0) {
  const normalizedStarLevel = Math.min(Math.max(0, Math.round(normalizeNumber(starLevel))), 5);
  return 1.1 + 0.02 * normalizedStarLevel;
}

function natureEffectPercentText(pet, kind) {
  const effect = PET_BOX_NATURE_EFFECTS[pet.natureName];
  if (!effect) return "0%";
  if (kind === "up") return `+${Math.round((natureUpMultiplier(pet.starLevel) - 1) * 100)}%`;
  return "-10%";
}

function addNatureModalElement(parent, tagName, className, uiMeta) {
  const element = document.createElement(tagName);
  element.className = className;
  tagUi(element, uiMeta);
  parent.append(element);
  return element;
}

function addNatureModalText(parent, text, className, uiMeta) {
  const element = addNatureModalElement(parent, "div", className, uiMeta);
  element.textContent = text;
  element.dataset.value = String(text);
  return element;
}

function addNatureModalImage(parent, src, className, alt, uiMeta) {
  const image = addNatureModalElement(parent, "img", className, uiMeta);
  if (src) {
    image.src = src;
  } else {
    image.hidden = true;
  }
  image.alt = alt;
  image.draggable = false;
  return image;
}

function natureEffectText(natureName) {
  if (!natureName || natureName === "中立") return "六维无加成或减少";

  const effect = PET_BOX_NATURE_EFFECTS[natureName];
  if (!effect) return "未找到该性格的六维修正数据";

  return `+${PET_BOX_STAT_LABELS[effect.up] || effect.up} / -${PET_BOX_STAT_LABELS[effect.down] || effect.down}`;
}

function petTalentTier(pet, statKey) {
  const ivs = normalizeIvList(pet.ivs);
  if (!ivs.has(statKey)) return 0;
  const tiers = normalizeIvTiers(pet.ivTiers);
  return clampRounded(tiers[statKey], 7, PET_BOX_MAX_TALENT, PET_BOX_MAX_TALENT);
}

function petTalentBonus(pet, statKey) {
  const tier = petTalentTier(pet, statKey);
  if (!tier) return 0;
  const awakening = clampRounded(pet.awakening, 0, PET_BOX_MAX_AWAKENING, 0);
  return tier * (awakening + 1);
}

function renderTalentPopup(detailLayer, pet) {
  clearNaturePopup(detailLayer);

  const overlay = addNatureModalElement(document.body, "div", "pet-box-nature-modal-overlay", {
    id: "bag.detail.talent.modalOverlay",
    label: "天分说明遮罩",
    component: "renderPetDetail",
  });
  const modal = addNatureModalElement(overlay, "section", "pet-box-nature-modal pet-box-talent-modal", {
    id: "bag.detail.talent.modal",
    label: "天分说明弹窗",
    component: "renderPetDetail",
  });
  modal.tabIndex = -1;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "天分说明");

  const closeModal = () => {
    overlay.remove();
    document.removeEventListener("keydown", closeOnEscape);
    if (activeNatureModalCleanup === closeModal) activeNatureModalCleanup = null;
  };
  const closeOnEscape = (event) => {
    if (event.key === "Escape") closeModal();
  };
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeModal();
  });
  document.addEventListener("keydown", closeOnEscape);
  activeNatureModalCleanup = closeModal;

  const header = addNatureModalElement(modal, "div", "pet-box-nature-modal-header pet-box-talent-modal-header", {
    id: "bag.detail.talent.modal.header",
    label: "天分说明标题区",
    component: "renderPetDetail",
  });
  addNatureModalText(header, pet.talentTitle || "天分", "pet-box-nature-modal-title", {
    id: "bag.detail.talent.modal.title",
    label: "具体天分",
    component: "renderPetDetail",
  });
  addNatureModalImage(header, pet.avatarAsset, "pet-box-trait-modal-avatar", pet.name, {
    id: "bag.detail.talent.modal.avatar",
    label: "精灵头像",
    component: "renderPetDetail",
  });

  const body = addNatureModalElement(modal, "div", "pet-box-talent-modal-body", {
    id: "bag.detail.talent.modal.body",
    label: "天分说明内容",
    component: "renderPetDetail",
  });
  body.dataset.barMax = String(PET_BOX_TALENT_BAR_MAX);
  const natureEffect = PET_BOX_NATURE_EFFECTS[pet.natureName] || null;

  for (const statKey of PET_BOX_TALENT_STAT_ORDER) {
    const statLabel = PET_BOX_STAT_LABELS[statKey] || statKey;
    const baseValue = Math.max(0, Math.round(normalizeNumber(pet.baseStats?.[statKey], 0)));
    const bonusValue = petTalentBonus(pet, statKey);
    const baseWidth = Math.min(100, (baseValue / PET_BOX_TALENT_BAR_MAX) * 100);
    const bonusWidth = Math.min(100 - baseWidth, (bonusValue / PET_BOX_TALENT_BAR_MAX) * 100);
    const row = addNatureModalElement(body, "div", "pet-box-talent-modal-row", {
      id: `bag.detail.talent.modal.stat.${statKey}`,
      label: `${statLabel}资质`,
      component: "renderPetDetail",
    });
    row.dataset.statKey = statKey;
    row.dataset.baseValue = String(baseValue);
    row.dataset.bonusValue = String(bonusValue);
    row.dataset.barMax = String(PET_BOX_TALENT_BAR_MAX);

    addNatureModalImage(row, statIconAsset(statKey), "pet-box-talent-modal-stat-icon", statLabel, {
      id: `bag.detail.talent.modal.stat.${statKey}.icon`,
      label: `${statLabel}图标`,
      component: "renderPetDetail",
    });
    addNatureModalText(row, `${statLabel}资质`, "pet-box-talent-modal-stat-label", {
      id: `bag.detail.talent.modal.stat.${statKey}.label`,
      label: `${statLabel}资质文本`,
      component: "renderPetDetail",
    });
    const natureDirection = natureEffect?.up === statKey ? "up" : natureEffect?.down === statKey ? "down" : "";
    const natureArrow = addNatureModalElement(row, "span", `pet-box-talent-modal-nature-arrow ${natureDirection || "neutral"}`, {
      id: `bag.detail.talent.modal.stat.${statKey}.natureArrow`,
      label: natureDirection === "up" ? "正面性格向上箭头" : natureDirection === "down" ? "负面性格向下箭头" : "性格无影响占位",
      component: "renderPetDetail",
    });
    natureArrow.dataset.statKey = statKey;
    natureArrow.dataset.nature = pet.natureName || "";
    natureArrow.dataset.natureDirection = natureDirection;

    const bar = addNatureModalElement(row, "div", "pet-box-talent-modal-bar", {
      id: `bag.detail.talent.modal.stat.${statKey}.bar`,
      label: `${statLabel}资质条形图`,
      component: "renderPetDetail",
    });
    bar.dataset.maxValue = String(PET_BOX_TALENT_BAR_MAX);
    const baseSegment = addNatureModalElement(bar, "span", "pet-box-talent-modal-bar-base", {
      id: `bag.detail.talent.modal.stat.${statKey}.bar.base`,
      label: `${statLabel}种族资质条`,
      component: "renderPetDetail",
    });
    baseSegment.style.width = `${baseWidth}%`;
    const bonusSegment = addNatureModalElement(bar, "span", "pet-box-talent-modal-bar-bonus", {
      id: `bag.detail.talent.modal.stat.${statKey}.bar.bonus`,
      label: `${statLabel}个体资质加成条`,
      component: "renderPetDetail",
    });
    bonusSegment.style.width = `${bonusWidth}%`;

    const value = addNatureModalElement(row, "div", "pet-box-talent-modal-value", {
      id: `bag.detail.talent.modal.stat.${statKey}.value`,
      label: `${statLabel}资质数值`,
      component: "renderPetDetail",
    });
    addNatureModalText(value, String(baseValue), "pet-box-talent-modal-base-value", {
      id: `bag.detail.talent.modal.stat.${statKey}.baseValue`,
      label: `${statLabel}实际种族资质`,
      component: "renderPetDetail",
    });
    if (bonusValue > 0) {
      addNatureModalText(value, `+${bonusValue}`, "pet-box-talent-modal-bonus-value", {
        id: `bag.detail.talent.modal.stat.${statKey}.bonusValue`,
        label: `${statLabel}个体资质加成`,
        component: "renderPetDetail",
      });
    }
  }

  modal.dataset.petId = pet.id || "";
  modal.dataset.talentTitle = pet.talentTitle || "";
  window.setTimeout(() => modal.focus(), 0);
}

function renderNaturePopup(detailLayer, pet) {
  clearNaturePopup(detailLayer);

  const effect = PET_BOX_NATURE_EFFECTS[pet.natureName];
  const overlay = addNatureModalElement(document.body, "div", "pet-box-nature-modal-overlay", {
    id: "bag.detail.nature.modalOverlay",
    label: "性格影响遮罩",
    component: "renderPetDetail",
  });
  const modal = addNatureModalElement(overlay, "section", "pet-box-nature-modal", {
    id: "bag.detail.nature.modal",
    label: "性格影响弹窗",
    component: "renderPetDetail",
  });
  modal.tabIndex = -1;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "性格影响");

  const closeModal = () => {
    overlay.remove();
    document.removeEventListener("keydown", closeOnEscape);
    if (activeNatureModalCleanup === closeModal) activeNatureModalCleanup = null;
  };
  const closeOnEscape = (event) => {
    if (event.key === "Escape") closeModal();
  };
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeModal();
  });
  document.addEventListener("keydown", closeOnEscape);
  activeNatureModalCleanup = closeModal;

  const header = addNatureModalElement(modal, "div", "pet-box-nature-modal-header", {
    id: "bag.detail.nature.modal.header",
    label: "性格影响标题区",
    component: "renderPetDetail",
  });
  addNatureModalText(header, "性格影响", "pet-box-nature-modal-title", {
    id: "bag.detail.nature.modal.title",
    label: "性格影响标题",
    component: "renderPetDetail",
  });

  const identity = addNatureModalElement(header, "div", "pet-box-nature-modal-identity", {
    id: "bag.detail.nature.modal.identity",
    label: "精灵性格信息",
    component: "renderPetDetail",
  });
  addNatureModalImage(identity, pet.avatarAsset, "pet-box-nature-modal-avatar", pet.name, {
    id: "bag.detail.nature.modal.avatar",
    label: "精灵头像",
    component: "renderPetDetail",
  });
  addNatureModalText(identity, pet.natureName || "未知性格", "pet-box-nature-modal-nature", {
    id: "bag.detail.nature.modal.nature",
    label: "精灵性格",
    component: "renderPetDetail",
  });

  const body = addNatureModalElement(modal, "div", "pet-box-nature-modal-body", {
    id: "bag.detail.nature.modal.body",
    label: "性格影响内容",
    component: "renderPetDetail",
  });

  const renderEffectColumn = (kind) => {
    const statKey = kind === "up" ? effect?.up : effect?.down;
    const statLabel = statKey ? PET_BOX_STAT_LABELS[statKey] || statKey : kind === "up" ? "无加成" : "无减少";
    const classSuffix = kind === "up" ? "up" : "down";
    const column = addNatureModalElement(body, "div", `pet-box-nature-modal-effect ${classSuffix}`, {
      id: `bag.detail.nature.modal.${classSuffix}`,
      label: kind === "up" ? "正向性格影响" : "负面性格影响",
      component: "renderPetDetail",
    });
    const topRow = addNatureModalElement(column, "div", "pet-box-nature-modal-effect-top", {
      id: `bag.detail.nature.modal.${classSuffix}.top`,
      label: kind === "up" ? "正向性格属性" : "负面性格属性",
      component: "renderPetDetail",
    });
    const iconSrc = statKey ? statIconAsset(statKey) : "";
    if (iconSrc) {
      addNatureModalImage(topRow, iconSrc, "pet-box-nature-modal-stat-icon", statLabel, {
        id: `bag.detail.nature.modal.${classSuffix}.icon`,
        label: kind === "up" ? "正向性格图标" : "负面性格图标",
        component: "renderPetDetail",
      });
    }
    addNatureModalText(topRow, statLabel, "pet-box-nature-modal-stat-label", {
      id: `bag.detail.nature.modal.${classSuffix}.text`,
      label: kind === "up" ? "正向性格文本" : "负面性格文本",
      component: "renderPetDetail",
    });
    const valueRow = addNatureModalElement(column, "div", "pet-box-nature-modal-effect-value-row", {
      id: `bag.detail.nature.modal.${classSuffix}.valueRow`,
      label: kind === "up" ? "正向性格数值行" : "负面性格数值行",
      component: "renderPetDetail",
    });
    addNatureModalText(valueRow, natureEffectPercentText(pet, kind), "pet-box-nature-modal-effect-value", {
      id: `bag.detail.nature.modal.${classSuffix}.value`,
      label: kind === "up" ? "正向性格具体加成" : "负面性格具体减少",
      component: "renderPetDetail",
    });
    addNatureModalElement(valueRow, "span", `pet-box-nature-modal-arrow ${classSuffix}`, {
      id: `bag.detail.nature.modal.${classSuffix}.arrow`,
      label: kind === "up" ? "绿色向上箭头" : "红色向下箭头",
      component: "renderPetDetail",
    });
    column.dataset.stat = statKey || "";
    column.dataset.percent = natureEffectPercentText(pet, kind);
  };

  renderEffectColumn("up");
  renderEffectColumn("down");
  window.setTimeout(() => modal.focus(), 0);
}

function addNaturePill(detailLayer, pet) {
  const detail = PET_BOX_LAYOUT.detail;
  const openNaturePopup = () => renderNaturePopup(detailLayer, pet);
  const pillBgRect = detail.naturePillBg || detail.naturePill;
  const scaledPillWidth = 170;
  const scaledPillHeight = pillBgRect.h * 1.2;
  const scaledPillRect = {
    x: pillBgRect.x + (pillBgRect.w - scaledPillWidth) / 2 - 40,
    y: pillBgRect.y + (pillBgRect.h - scaledPillHeight) / 2,
    w: scaledPillWidth,
    h: scaledPillHeight,
  };
  const pillBg = addClickableImage(detailLayer, PET_BOX_ASSETS.commonFrameBlack, scaledPillRect, pet.natureName || "性格", openNaturePopup, {
    id: "bag.detail.nature.pillBg",
    label: "精灵性格底",
    component: "renderPetDetail",
  });
  pillBg.classList.add("pet-box-nature-pill-frame");
  pillBg.dataset.nature = pet.natureName || "";
  pillBg.title = natureEffectText(pet.natureName);

  const pillText = addText(detailLayer, scaledPillRect, pet.natureName || "", "pet-box-detail-pill-text center pet-box-nature-pill-text", {
    id: "bag.detail.nature.name",
    label: "精灵性格",
    component: "renderPetDetail",
  });
  pillText.dataset.nature = pet.natureName || "";
  pillText.title = natureEffectText(pet.natureName);
  pillText.addEventListener("click", openNaturePopup);
  return pillBg;
}

function renderTraitPopup(detailLayer, pet) {
  clearNaturePopup(detailLayer);

  const traitDescription = pet.traitDescription || abilityDescription(pet.traitName) || "未找到该特性的描述数据。";
  const overlay = addNatureModalElement(document.body, "div", "pet-box-nature-modal-overlay", {
    id: "bag.detail.trait.modalOverlay",
    label: "特性说明遮罩",
    component: "renderPetDetail",
  });
  const modal = addNatureModalElement(overlay, "section", "pet-box-nature-modal pet-box-trait-modal", {
    id: "bag.detail.trait.modal",
    label: "特性说明弹窗",
    component: "renderPetDetail",
  });
  modal.tabIndex = -1;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "特性");

  const closeModal = () => {
    overlay.remove();
    document.removeEventListener("keydown", closeOnEscape);
    if (activeNatureModalCleanup === closeModal) activeNatureModalCleanup = null;
  };
  const closeOnEscape = (event) => {
    if (event.key === "Escape") closeModal();
  };
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeModal();
  });
  document.addEventListener("keydown", closeOnEscape);
  activeNatureModalCleanup = closeModal;

  const header = addNatureModalElement(modal, "div", "pet-box-nature-modal-header pet-box-trait-modal-header", {
    id: "bag.detail.trait.modal.header",
    label: "特性弹窗标题区",
    component: "renderPetDetail",
  });
  addNatureModalText(header, "特性", "pet-box-nature-modal-title", {
    id: "bag.detail.trait.modal.title",
    label: "特性弹窗标题",
    component: "renderPetDetail",
  });
  addNatureModalImage(header, pet.avatarAsset, "pet-box-trait-modal-avatar", pet.name, {
    id: "bag.detail.trait.modal.avatar",
    label: "精灵头像",
    component: "renderPetDetail",
  });

  const body = addNatureModalElement(modal, "div", "pet-box-trait-modal-body", {
    id: "bag.detail.trait.modal.body",
    label: "特性弹窗内容",
    component: "renderPetDetail",
  });
  addNatureModalImage(body, pet.traitIconAsset, "pet-box-trait-modal-icon", pet.traitName, {
    id: "bag.detail.trait.modal.icon",
    label: "特性图标",
    component: "renderPetDetail",
  });
  const copy = addNatureModalElement(body, "div", "pet-box-trait-modal-copy", {
    id: "bag.detail.trait.modal.copy",
    label: "特性文字内容",
    component: "renderPetDetail",
  });
  addNatureModalText(copy, pet.traitName || "未知特性", "pet-box-trait-modal-name", {
    id: "bag.detail.trait.modal.name",
    label: "特性名称",
    component: "renderPetDetail",
  });
  addNatureModalText(copy, traitDescription, "pet-box-trait-modal-desc", {
    id: "bag.detail.trait.modal.desc",
    label: "特性描述",
    component: "renderPetDetail",
  });
  modal.dataset.ability = pet.traitName || "";
  modal.dataset.description = traitDescription;
  window.setTimeout(() => modal.focus(), 0);
}

function isDeletedItem(uiId) {
  return PET_BOX_LAYOUT.deletedItems?.includes(uiId) === true;
}

function hasVisibleDetailTopActions() {
  return ["bag.detail.action.share", "bag.detail.action.book", "bag.detail.action.back"].some((id) => !isDeletedItem(id));
}

function updateScale() {
  if (!activeStage || !activeRoot) return;

  const { designWidth, designHeight } = PET_BOX_LAYOUT;
  const viewport = activeRoot.getBoundingClientRect();
  const viewportWidth = viewport.width || window.innerWidth;
  const viewportHeight = viewport.height || window.innerHeight;
  const scale = Math.min(viewportWidth / designWidth, viewportHeight / designHeight);
  const left = Math.round((viewportWidth - designWidth * scale) / 2);
  const top = Math.round((viewportHeight - designHeight * scale) / 2);

  activeStage.style.transform = `translate(${left}px, ${top}px) scale(${scale})`;
}

function renderSideTabs(stage) {
  const { x, firstY, size, gapY, count } = PET_BOX_LAYOUT.sideTabs;
  for (let index = 0; index < count; index += 1) {
    const src = index === 0 ? PET_BOX_ASSETS.tabPetActive : PET_BOX_ASSETS.tabPetNormal;
    addImage(
      stage,
      src,
      {
        x,
        y: firstY + index * (size + gapY),
        w: size,
        h: size,
      },
      "",
      index === 0 ? "当前精灵分类" : "精灵分类",
      {
        id: `bag.leftCategoryBar.tab.${index}`,
        label: index === 0 ? "当前精灵分类标签" : `精灵分类标签 ${index + 1}`,
        component: "renderSideTabs",
      }
    );
  }
}

function renderPetGrid(stage, onSelectPet, storedPets) {
  const { x, y, columns, rows, slotSize, gapX, gapY } = PET_BOX_LAYOUT.grid;
  const gridGroup = document.createElement("div");
  const gridWidth = columns * slotSize + (columns - 1) * gapX;
  const gridHeight = rows * slotSize + (rows - 1) * gapY;
  const selectedOverlays = [];
  gridGroup.className = "pet-box-ui-group pet-box-pet-grid";
  setPosition(gridGroup, { x, y, w: gridWidth, h: gridHeight });
  tagUi(gridGroup, {
    id: "bag.petGrid",
    label: "精灵背包宠物格",
    component: "renderPetGrid",
  });
  stage.append(gridGroup);

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const slotIndex = row * columns + column;
      const pet = petForSlot(slotIndex, storedPets);
      const rect = {
        x: column * (slotSize + gapX),
        y: row * (slotSize + gapY),
        w: slotSize,
        h: slotSize,
      };
        if (pet) {
          addImage(gridGroup, PET_BOX_ASSETS.slotEmpty, rect, "pet-box-pet-slot-base", "精灵槽位底图", {
            id: `bag.petCard.${slotIndex}.base`,
            label: "精灵槽位底图",
            component: "renderPetGrid",
          });
          const overlay = addGroup(gridGroup, rect, "pet-box-selected-slot", {
            id: `bag.petCard.${slotIndex}.selected`,
            label: "选中精灵底圈",
            component: "renderPetGrid",
          });
          overlay.dataset.petId = pet.id;
          overlay.style.opacity = "0";
          selectedOverlays.push(overlay);
          const petCard = addClickableImage(gridGroup, pet.avatarAsset || PET_BOX_ASSETS.slotEmpty, rect, pet.name, () => onSelectPet(pet), {
            id: `bag.petCard.${slotIndex}`,
          label: pet.name,
          component: "renderPetGrid",
        });
        petCard.classList.add("pet-box-pet-card");
        addText(
          gridGroup,
          { x: rect.x + 62, y: rect.y + 61, w: 28, h: 22 },
          pet.level,
          "pet-box-pet-level-badge center",
          {
            id: `bag.petCard.${slotIndex}.level`,
            label: "精灵等级",
            component: "renderPetGrid",
          }
        );
      } else {
        addImage(gridGroup, PET_BOX_ASSETS.slotEmpty, rect, "", "空精灵槽位", {
          id: `bag.petCard.${slotIndex}`,
          label: `空精灵槽位 ${slotIndex + 1}`,
          component: "renderPetGrid",
        });
      }
    }
  }
  return selectedOverlays;
}

function renderDetailStars(detailLayer, pet) {
  const { x, y, size, gapX } = PET_BOX_LAYOUT.detail.stars;
  const awakening = clampRounded(pet.awakening, 0, PET_BOX_MAX_AWAKENING, 0);
  for (let index = 0; index < PET_BOX_MAX_AWAKENING; index += 1) {
    const starId = `bag.detail.star.${index}`;
    if (isDeletedItem(starId)) continue;
    const isAwakened = index < awakening;
    const star = addImage(
      detailLayer,
      isAwakened ? PET_BOX_ASSETS.detailStarOn : PET_BOX_ASSETS.detailStarOff,
      { x: x + index * gapX, y, w: size, h: size },
      "",
      isAwakened ? "已点亮觉醒星级" : "未点亮觉醒星级",
      {
        id: starId,
        label: `觉醒等级 ${index + 1}`,
        component: "renderPetDetail",
      }
    );
    star.dataset.awakening = String(awakening);
    star.dataset.awakeningIndex = String(index + 1);
    star.dataset.valueKind = "awakening";
  }
}

function badgeFrameRect(rect) {
  const { h, iconSize, labelX, labelW } = rect;
  const iconX = rect.iconX ?? 0;
  const iconY = rect.iconY ?? Math.round((h - iconSize) / 2);
  const labelY = rect.labelY ?? 0;
  const left = Math.min(iconX, labelX) - 2;
  const top = Math.min(iconY, labelY) - 2;
  const bottom = Math.max(iconY + iconSize, labelY + h) + 2;
  return { x: left, y: top, w: PET_BOX_TYPE_BADGE_FRAME_WIDTH, h: bottom - top };
}

function addBadgeFrame(parent, rect, id, label) {
  return addImage(parent, PET_BOX_ASSETS.commonFrameBlack || PET_BOX_COMMON_FRAME_BLACK, badgeFrameRect(rect), "pet-box-common-frame", "", {
    id,
    label,
    component: "renderPetDetail",
  });
}

function addIconTextBadge(parent, rect, badge, idPrefix, labelPrefix) {
  const { x, y, w, h, iconSize, labelX, labelW } = rect;
  const iconX = rect.iconX ?? 0;
  const iconY = rect.iconY ?? Math.round((h - iconSize) / 2);
  const scaledIconSize = Math.round(iconSize * PET_BOX_TYPE_ICON_SCALE);
  const scaledIconX = iconX - Math.round((scaledIconSize - iconSize) / 2);
  const scaledIconY = iconY - Math.round((scaledIconSize - iconSize) / 2);
  const labelY = rect.labelY ?? 0;
  const badgeGroup = addGroup(
    parent,
    { x, y, w, h },
    "pet-box-detail-type-badge",
    {
      id: idPrefix,
      label: `${labelPrefix}${badge.label}`,
      component: "renderPetDetail",
    }
  );
  addBadgeFrame(badgeGroup, rect, `${idPrefix}.frame`, `${labelPrefix}${badge.label}搴曟`);
  addImage(
    badgeGroup,
    badge.iconAsset,
    { x: scaledIconX, y: scaledIconY, w: scaledIconSize, h: scaledIconSize },
    "",
    `${badge.label}图标`,
    {
      id: `${idPrefix}.icon`,
      label: `${labelPrefix}${badge.label}图标`,
      component: "renderPetDetail",
    }
  );
  addText(badgeGroup, { x: labelX, y: labelY, w: labelW, h }, badge.label, "pet-box-detail-type-text", {
    id: `${idPrefix}.label`,
    label: `${labelPrefix}${badge.label}名称`,
    component: "renderPetDetail",
  });
  return badgeGroup;
}

function renderDetailTypeBadges(detailLayer, pet) {
  const { primary, secondary, bloodline } = PET_BOX_LAYOUT.detail.typeBadges;
  pet.types.forEach((badge, index) => {
    const rect = pet.types.length === 1 ? secondary : index === 0 ? primary : secondary;
    if (!rect) return;
    addIconTextBadge(detailLayer, rect, badge, `bag.detail.type.${index + 1}`, `属性${index + 1}`);
  });

  if (pet.bloodlineType) {
    const bloodlineRect = { ...bloodline, y: secondary.y + 58 };
    const bloodlineIconX = bloodlineRect.iconX ?? 0;
    const bloodlineIconY = bloodlineRect.iconY ?? Math.round((bloodlineRect.h - bloodlineRect.iconSize) / 2);
    const bloodlineLabelY = bloodlineRect.labelY ?? 0;
    const badgeGroup = addGroup(
      detailLayer,
      { x: bloodlineRect.x, y: bloodlineRect.y, w: bloodlineRect.w, h: bloodlineRect.h },
      "pet-box-detail-bloodline-badge",
      {
        id: "bag.detail.bloodline",
        label: "血脉属性",
        component: "renderPetDetail",
      }
    );
    addBadgeFrame(badgeGroup, bloodlineRect, "bag.detail.bloodline.frame", "琛€鑴夊睘鎬у簳妗?");
    addImage(
      badgeGroup,
      pet.bloodlineType.iconAsset,
      {
        x: bloodlineIconX - Math.round((Math.round(bloodlineRect.iconSize * PET_BOX_TYPE_ICON_SCALE) - bloodlineRect.iconSize) / 2),
        y: bloodlineIconY - Math.round((Math.round(bloodlineRect.iconSize * PET_BOX_TYPE_ICON_SCALE) - bloodlineRect.iconSize) / 2),
        w: Math.round(bloodlineRect.iconSize * PET_BOX_TYPE_ICON_SCALE),
        h: Math.round(bloodlineRect.iconSize * PET_BOX_TYPE_ICON_SCALE),
      },
      "",
      `${pet.bloodlineType.label}血脉图标`,
      {
        id: "bag.detail.bloodline.icon",
        label: "血脉属性图标",
        component: "renderPetDetail",
      }
    );
    addText(badgeGroup, { x: bloodlineRect.labelX, y: bloodlineLabelY, w: bloodlineRect.labelW, h: bloodlineRect.h }, pet.bloodlineType.label, "pet-box-detail-type-text", {
      id: "bag.detail.bloodline.label",
      label: "血脉属性名称",
      component: "renderPetDetail",
    });
  }
}

function renderDetailExp(detailLayer, pet) {
  const expRatio = Math.max(0, Math.min(1, pet.exp / Math.max(1, pet.expMax)));
  const expBar = PET_BOX_LAYOUT.detail.expBar;
  addImage(detailLayer, PET_BOX_ASSETS.detailExpBarBg, expBar, "", "经验条底", {
    id: "bag.detail.expBar.bg",
    label: "经验条底",
    component: "renderPetDetail",
  });

  const clipWidth = Math.round(expBar.w * expRatio);
  if (clipWidth > 0) {
    const clip = addGroup(
      detailLayer,
      { x: expBar.x, y: expBar.y, w: clipWidth, h: expBar.h },
      "pet-box-progress-clip",
      {
        id: "bag.detail.expBar.fillClip",
        label: "经验条填充裁切",
        component: "renderPetDetail",
      }
    );
    clip.dataset.exp = String(pet.exp);
    clip.dataset.expMax = String(pet.expMax);
    clip.dataset.expRatio = String(expRatio);
    addImage(clip, PET_BOX_ASSETS.detailExpBarFill, { x: 0, y: 0, w: expBar.w, h: expBar.h }, "", "经验条填充", {
      id: "bag.detail.expBar.fill",
      label: "经验条填充",
      component: "renderPetDetail",
    });
  }
}

function renderDetailLevelExp(detailLayer, pet) {
  const detail = PET_BOX_LAYOUT.detail;
  renderDetailExp(detailLayer, pet);

  const levelBadgeRect = levelBadgeGroupRect(detail.levelText);
  const levelBadge = addGroup(detailLayer, levelBadgeRect, "pet-box-rotate-ccw-5 pet-box-level-badge-group", {
    id: "bag.detail.level.group",
    label: "等级牌",
    component: "renderPetDetail",
  });
  addImage(levelBadge, PET_BOX_ASSETS.commonFrameYellow || PET_BOX_COMMON_FRAME_YELLOW, rectRelativeTo(levelFrameRect(detail.levelText), levelBadgeRect), "pet-box-level-frame", "", {
    id: "bag.detail.level.frame",
    label: "等级底框",
    component: "renderPetDetail",
  });
  const levelText = addLevelRatioText(levelBadge, rectRelativeTo(detail.levelText, levelBadgeRect), pet.level, pet.maxLevel, {
    id: "bag.detail.level",
    label: "等级",
    component: "renderPetDetail",
  });
  levelText.dataset.level = String(pet.level);
  levelText.dataset.maxLevel = String(pet.maxLevel);

  const expText = addText(detailLayer, detail.expText, formatRatioText(pet.exp, pet.expMax), "pet-box-detail-exp", {
    id: "bag.detail.expText",
    label: "经验数值",
    component: "renderPetDetail",
  });
  expText.dataset.exp = String(pet.exp);
  expText.dataset.expMax = String(pet.expMax);
}

function statValueFrameRect(rects) {
  const left = Math.min(rects.icon.x, rects.value.x) - 10;
  const top = Math.min(rects.icon.y, rects.value.y) - 4;
  const right = Math.max(rects.icon.x + rects.icon.w, rects.value.x + rects.value.w) + 8;
  const bottom = Math.max(rects.icon.y + rects.icon.h, rects.value.y + rects.value.h) + 4;
  return { x: left, y: top, w: right - left, h: bottom - top };
}

function natureArrowRect(rects) {
  const frame = statValueFrameRect(rects);
  return {
    x: frame.x + frame.w - 16,
    y: rects.value.y - 11,
    w: 18,
    h: 26,
  };
}

function renderDetailStats(detailLayer, pet) {
  const boostedIvStats = normalizeIvList(pet.ivs);
  const natureEffect = PET_BOX_NATURE_EFFECTS[pet.natureName] || null;
  Object.entries(PET_BOX_LAYOUT.detail.stats).forEach(([key, rects]) => {
    addImage(detailLayer, PET_BOX_ASSETS.commonFrameBlack || PET_BOX_COMMON_FRAME_BLACK, statValueFrameRect(rects), "pet-box-common-frame pet-box-stat-value-frame", "", {
      id: `bag.detail.stat.${key}.frame`,
      label: "六维属性数值底框",
      component: "renderPetDetail",
    });
    addImage(detailLayer, PET_BOX_ASSETS.statIcons[key], scaleRectFromCenter(rects.icon, PET_BOX_STAT_ICON_SCALE), "", "属性图标", {
      id: `bag.detail.stat.${key}.icon`,
      label: "六维属性图标",
      component: "renderPetDetail",
    });
    const engineKey = PET_BOX_DETAIL_STAT_KEYS[key];
    const value = engineKey ? pet.actualStats?.[engineKey] : pet.stats[key];
    const statValue = addText(detailLayer, rects.value, value ?? pet.stats[key] ?? "", "pet-box-detail-stat-value", {
      id: `bag.detail.stat.${key}.value`,
      label: "六维属性数值",
      component: "renderPetDetail",
    });
    if (engineKey && boostedIvStats.has(engineKey)) {
      statValue.classList.add("is-iv-boosted");
    }
    if (engineKey) {
      statValue.dataset.statKey = engineKey;
      statValue.dataset.valueKind = "actual";
      statValue.dataset.capValue = String(pet.radarCapStats?.[engineKey] ?? "");
      const natureDirection = natureEffect?.up === engineKey ? "up" : natureEffect?.down === engineKey ? "down" : "";
      if (natureDirection) {
        const natureArrow = addGroup(detailLayer, natureArrowRect(rects), `pet-box-detail-nature-arrow ${natureDirection}`, {
          id: `bag.detail.stat.${key}.natureArrow`,
          label: natureDirection === "up" ? "正面性格向上箭头" : "负面性格向下箭头",
          component: "renderPetDetail",
        });
        natureArrow.dataset.statKey = engineKey;
        natureArrow.dataset.nature = pet.natureName || "";
        natureArrow.dataset.natureDirection = natureDirection;
      }
    }
  });
}

function renderDetailRadarFill(detailLayer, pet) {
  const caps = pet.radarCapStats;
  const actualStats = pet.actualStats;
  if (!caps || !actualStats) {
    addImage(detailLayer, pet.radarFillAsset, PET_BOX_LAYOUT.detail.radarFill, "", "天赋雷达填充", {
      id: "bag.detail.radar.fill",
      label: "天赋雷达填充",
      component: "renderPetDetail",
    });
    return;
  }

  const rect = PET_BOX_LAYOUT.detail.radarFill;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("pet-box-radar-svg");
  svg.setAttribute("viewBox", `0 0 ${rect.w} ${rect.h}`);
  svg.setAttribute("aria-hidden", "true");
  setPosition(svg, rect);
  tagUi(svg, {
    id: "bag.detail.radar.fill",
    label: "天赋雷达填充",
    component: "renderPetDetail",
  });
  svg.dataset.valueKind = "actual-to-cap";
  svg.dataset.statOrder = PET_BOX_RADAR_STAT_ORDER.join(",");
  for (const statKey of PET_BOX_RADAR_STAT_ORDER) {
    svg.dataset[`${statKey}Cap`] = String(caps[statKey] ?? "");
    svg.dataset[`${statKey}Actual`] = String(actualStats[statKey] ?? "");
  }

  const centerX = rect.w / 2;
  const centerY = rect.h / 2;
  const radius = Math.min(rect.w, rect.h) * (PET_BOX_RADAR_RADIUS / 330);
  const outerPoints = PET_BOX_RADAR_STAT_ORDER.map((_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / PET_BOX_RADAR_STAT_ORDER.length;
    return `${centerX + Math.cos(angle) * radius},${centerY + Math.sin(angle) * radius}`;
  }).join(" ");
  const fillPoints = PET_BOX_RADAR_STAT_ORDER.map((statKey, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / PET_BOX_RADAR_STAT_ORDER.length;
    const ratio = Math.max(0, Math.min(1, (actualStats[statKey] || 0) / Math.max(caps[statKey] || 1, 1)));
    const distance = radius * ratio;
    return `${centerX + Math.cos(angle) * distance},${centerY + Math.sin(angle) * distance}`;
  }).join(" ");

  addSvgNode(svg, "polygon", { class: "pet-box-radar-max-outline", points: outerPoints });
  addSvgNode(svg, "polygon", { class: "pet-box-radar-fill-shape", points: fillPoints });
  detailLayer.append(svg);
}

function renderTraitIcon(detailLayer, pet) {
  if (!pet.traitName || !pet.traitIconAsset) {
    if (pet.traitName && abilityIconMap) warnMissingAbilityIcon(pet.traitName);
    return;
  }

  const detail = PET_BOX_LAYOUT.detail;
  const title = pet.traitDescription || abilityDescription(pet.traitName) || pet.traitName;
  const traitCard = addGroup(detailLayer, detail.traitCard, "pet-box-trait-card pet-box-clickable", {
    id: "bag.detail.trait",
    label: "精灵特性",
    component: "renderPetDetail",
  });
  traitCard.role = "button";
  traitCard.tabIndex = 0;
  traitCard.setAttribute("aria-label", pet.traitName);
  traitCard.dataset.ability = pet.traitName;
  traitCard.title = title;

  const openTraitPopup = () => {
    renderTraitPopup(detailLayer, pet);
  };
  traitCard.addEventListener("click", openTraitPopup);
  traitCard.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openTraitPopup();
    }
  });

  addImage(traitCard, PET_BOX_ASSETS.commonFrameYellow || PET_BOX_COMMON_FRAME_YELLOW, detail.traitTitleFrame, "pet-box-trait-title-frame", "", {
    id: "bag.detail.trait.titleFrame",
    label: "特性标题底框",
    component: "renderPetDetail",
  });
  addText(traitCard, detail.traitTitleText, "特性", "pet-box-trait-title-text center", {
    id: "bag.detail.trait.title",
    label: "特性标题",
    component: "renderPetDetail",
  });

  const iconClip = addGroup(traitCard, detail.traitIcon, "pet-box-trait-icon-clip", {
    id: "bag.detail.trait.iconClip",
    label: "特性圆形裁剪",
    component: "renderPetDetail",
  });
  const traitIcon = addImage(iconClip, pet.traitIconAsset, { x: 0, y: 0, w: detail.traitIcon.w, h: detail.traitIcon.h }, "pet-box-trait-icon-image", pet.traitName, {
    id: "bag.detail.trait.icon",
    label: "精灵特性图标",
    component: "renderPetDetail",
  });
  traitIcon.dataset.ability = pet.traitName;
  traitIcon.title = title;
  traitIcon.addEventListener("error", () => {
    warnMissingAbilityIcon(pet.traitName);
    traitCard.remove();
  });

  addText(traitCard, detail.traitNameText, pet.traitName, "pet-box-trait-name-text center", {
    id: "bag.detail.trait.name",
    label: "特性名称",
    component: "renderPetDetail",
  });
}

function addDetailActionButton(detailLayer, rect, text, action, uiMeta) {
  const button = addGroup(detailLayer, rect, "pet-box-detail-action-button pet-box-clickable", uiMeta);
  button.role = "button";
  button.tabIndex = 0;
  button.setAttribute("aria-label", text);
  button.addEventListener("click", () => setDetailAction(detailLayer, action));
  button.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setDetailAction(detailLayer, action);
    }
  });
  addImage(button, PET_BOX_ASSETS.detailPillBg, { x: 0, y: 0, w: rect.w, h: rect.h }, "pet-box-detail-action-bg", "", {
    ...uiMeta,
    id: `${uiMeta.id}.bg`,
    label: `${uiMeta.label}底图`,
  });
  addText(button, { x: 0, y: 0, w: rect.w, h: rect.h }, text, "pet-box-detail-action-text center", {
    ...uiMeta,
    id: `${uiMeta.id}.text`,
    label: `${uiMeta.label}文字`,
  });
  return button;
}

function renderPetDetail(detailLayer, pet) {
  const detail = PET_BOX_LAYOUT.detail;

  addImage(detailLayer, PET_BOX_ASSETS.detailPanelBg, detail.panelBg, "pet-box-detail-panel-bg", "详情面板背景", {
    id: "bag.detail.panelBg",
    label: "详情面板背景",
    component: "renderPetDetail",
  });
  if (!isDeletedItem("bag.detail.action.share")) {
    addClickableImage(detailLayer, PET_BOX_ASSETS.detailBtnShare, detail.topButtons.share, "分享", () => setDetailAction(detailLayer, "share"), {
      id: "bag.detail.action.share",
      label: "分享按钮",
      component: "renderPetDetail",
    });
  }
  if (!isDeletedItem("bag.detail.action.book")) {
    addClickableImage(detailLayer, PET_BOX_ASSETS.detailBtnBook, detail.topButtons.book, "图鉴", () => setDetailAction(detailLayer, "book"), {
      id: "bag.detail.action.book",
      label: "图鉴按钮",
      component: "renderPetDetail",
    });
  }
  if (!isDeletedItem("bag.detail.action.back")) {
    addClickableImage(detailLayer, PET_BOX_ASSETS.detailBtnBack, detail.topButtons.back, "返回", () => setDetailAction(detailLayer, "back"), {
      id: "bag.detail.action.back",
      label: "返回按钮",
      component: "renderPetDetail",
    });
  }

  if (pet.avatarAsset && !isDeletedItem("bag.detail.avatar")) {
    addImage(detailLayer, pet.avatarAsset, detail.avatar, "", pet.name, {
      id: "bag.detail.avatar",
      label: "精灵头像",
      component: "renderPetDetail",
    });
  }
  if (!isDeletedItem("bag.detail.elementIcon")) {
    addImage(detailLayer, pet.elementIconAsset, detail.elementIcon, "", "精灵属性", {
      id: "bag.detail.elementIcon",
      label: "精灵属性图标",
      component: "renderPetDetail",
    });
  }
  const nameText = addText(detailLayer, detail.name, pet.name, "pet-box-detail-name", {
    id: "bag.detail.name",
    label: "精灵名称",
    component: "renderPetDetail",
  });
  if (pet.genderIconAsset) {
    addImage(detailLayer, pet.genderIconAsset, genderIconRectAfterText(nameText, detail.name, detail.genderIcon), "", pet.gender, {
      id: "bag.detail.gender",
      label: "精灵性别",
      component: "renderPetDetail",
    });
  }
  renderDetailStars(detailLayer, pet);
  renderDetailTypeBadges(detailLayer, pet);

  if (!isDeletedItem("bag.detail.sidePaw")) {
    addImage(detailLayer, PET_BOX_ASSETS.detailSidePaw, detail.sidePaw, "", "精灵信息入口", {
      id: "bag.detail.sidePaw",
      label: "侧边精灵信息入口",
      component: "renderPetDetail",
    });
  }
  if (!isDeletedItem("bag.detail.action.collapse")) {
    addClickableImage(detailLayer, PET_BOX_ASSETS.detailBtnCollapse, detail.collapseButton, "收起", () => setDetailAction(detailLayer, "collapse"), {
      id: "bag.detail.action.collapse",
      label: "收起按钮",
      component: "renderPetDetail",
    });
  }

  renderDetailLevelExp(detailLayer, pet);

  const talentButton = addGroup(detailLayer, { ...detail.talentLabelBg, y: detail.talentLabelBg.y + 30 }, "pet-box-rotate-ccw-5 pet-box-talent-button", {
    id: "bag.detail.ivButton",
    label: "个体值说明按钮",
    component: "renderPetDetail",
  });
  talentButton.role = "button";
  talentButton.tabIndex = 0;
  talentButton.setAttribute("aria-label", "个体值说明");
  talentButton.addEventListener("click", () => setDetailAction(detailLayer, "ivHelp", pet));
  const releaseTalentButton = () => talentButton.classList.remove("is-pressed");
  talentButton.addEventListener("pointerdown", () => talentButton.classList.add("is-pressed"));
  talentButton.addEventListener("pointerup", releaseTalentButton);
  talentButton.addEventListener("pointerleave", releaseTalentButton);
  talentButton.addEventListener("pointercancel", releaseTalentButton);
  talentButton.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setDetailAction(detailLayer, "ivHelp", pet);
    }
  });

  addImage(talentButton, talentLabelBgFor(pet.talentTitle), talentLabelBgRectFor(pet.talentTitle, rectRelativeTo(detail.talentLabelBg, detail.talentLabelBg)), "", "个体值按钮底", {
    id: "bag.detail.ivButton.bg",
    label: "个体值按钮底",
    component: "renderPetDetail",
  });
  addText(talentButton, talentTextRectFor(pet.talentTitle, rectRelativeTo(detail.talentText, detail.talentLabelBg)), pet.talentTitle, "pet-box-detail-talent", {
    id: "bag.detail.ivButton.text",
    label: "个体值按钮文字",
    component: "renderPetDetail",
  });
  addImage(talentButton, PET_BOX_ASSETS.detailQuestionIcon, talentQuestionRectFor(pet.talentTitle, scaleRectFromCenter(rectRelativeTo(detail.talentQuestion, detail.talentLabelBg), 0.8)), "", "个体值说明", {
    id: "bag.detail.ivButton.help",
    label: "个体值说明",
    component: "renderPetDetail",
  });
  addImage(detailLayer, PET_BOX_ASSETS.detailRadarBase, detail.radarBase, "", "天赋雷达底盘", {
    id: "bag.detail.radar.base",
    label: "天赋雷达底盘",
    component: "renderPetDetail",
  });
  renderDetailRadarFill(detailLayer, pet);
  renderDetailStats(detailLayer, pet);

  renderTraitIcon(detailLayer, pet);
  if (pet.natureName) {
    addNaturePill(detailLayer, pet);
  }
  addDetailActionButton(detailLayer, detail.feedButton, "精灵喂养", "feed", {
    id: "bag.detail.action.feed",
    label: "精灵喂养按钮",
    component: "renderPetDetail",
  });
  addDetailActionButton(detailLayer, detail.growthButton, "精灵成长", "growth", {
    id: "bag.detail.action.growth",
    label: "精灵成长按钮",
    component: "renderPetDetail",
  });
}

function renderPetBox(app) {
  app.innerHTML = "";
  app.className = "app pet-box-app";
  document.body.classList.add("pet-box-active");
  document.title = "精灵背包";

  const root = document.createElement("section");
  root.className = "pet-box-root";
  root.setAttribute("aria-label", "精灵背包");
  tagUi(root, {
    id: "bag.root",
    label: "精灵背包根容器",
    component: "renderPetBox",
  });

  const backdrop = document.createElement("img");
  backdrop.src = PET_BOX_ASSETS.bg;
  backdrop.alt = "";
  backdrop.draggable = false;
  backdrop.className = "pet-box-backdrop";
  tagUi(backdrop, {
    id: "bag.backdrop",
    label: "精灵背包背景遮罩",
    component: "renderPetBox",
  });

  const stage = document.createElement("div");
  stage.className = "pet-box-stage";
  stage.style.width = `${PET_BOX_LAYOUT.designWidth}px`;
  stage.style.height = `${PET_BOX_LAYOUT.designHeight}px`;
  stage.dataset.designWidth = String(PET_BOX_LAYOUT.designWidth);
  stage.dataset.designHeight = String(PET_BOX_LAYOUT.designHeight);
  const storedPets = readStoredPetBoxPets();
  const pageState = resolvePageState();
  let currentPage = pageState.currentPage;
  stage.dataset.currentPage = String(currentPage);
  stage.dataset.unlockedPages = String(pageState.unlockedPages);

  addImage(stage, PET_BOX_ASSETS.bg, PET_BOX_LAYOUT.bg, "pet-box-background", "精灵背包背景", {
    id: "bag.background",
    label: "精灵背包主背景",
    component: "renderPetBox",
  });
  addImage(stage, PET_BOX_ASSETS.sidePanel, PET_BOX_LAYOUT.sidePanel, "", "分类栏", {
    id: "bag.leftCategoryBar",
    label: "左侧分类栏",
    component: "renderPetBox",
  });
  renderSideTabs(stage);

  const detailLayer = addGroup(stage, PET_BOX_LAYOUT.detailPanel, "pet-box-detail-layer", {
    id: "bag.detailPanel",
    label: "精灵背包详情面板",
    component: "renderPetBox",
  });
  let closeButtonImage = null;
  let selectedPetId = null;
  let selectedOverlays = [];
  const setCloseButtonVisible = (visible) => {
    if (!closeButtonImage) return;
    closeButtonImage.style.opacity = visible ? "1" : "0";
    closeButtonImage.style.pointerEvents = visible ? "auto" : "none";
  };
  const syncSelectedSlot = () => {
    for (const overlay of selectedOverlays) {
      overlay.style.opacity = overlay.dataset.petId === selectedPetId ? "1" : "0";
    }
  };
  const showEmptyDetail = () => {
    detailLayer.replaceChildren();
    delete detailLayer.dataset.petId;
    setCloseButtonVisible(true);
    addImage(
      detailLayer,
      PET_BOX_ASSETS.emptyInfo,
      rectRelativeTo(PET_BOX_LAYOUT.emptyInfo, PET_BOX_LAYOUT.detailPanel),
      "pet-box-detail-image",
      "暂无精灵信息"
    );
  };
  const showPetDetail = (pet) => {
    selectedPetId = pet.id;
    detailLayer.replaceChildren();
    detailLayer.dataset.petId = pet.id;
    setCloseButtonVisible(!hasVisibleDetailTopActions());
    renderPetDetail(detailLayer, pet);
    syncSelectedSlot();
  };

  selectedOverlays = renderPetGrid(stage, showPetDetail, storedPets);
  showEmptyDetail();

  addImage(stage, PET_BOX_ASSETS.boxSelectorPanel, PET_BOX_LAYOUT.bottomSelector, "", "精灵盒子", {
    id: "bag.bottomBoxSelector",
    label: "底部盒子选择器",
    component: "renderPetBox",
  });
  const pageIcon = addImage(stage, pageIconAsset(currentPage), PET_BOX_LAYOUT.selectorPetIcon, "", "当前页", {
    id: "bag.bottomBoxSelector.pageIcon",
    label: "当前盒子页图标",
    component: "renderPetBox",
  });
  const syncPageIcon = () => {
    stage.dataset.currentPage = String(currentPage);
    pageIcon.src = pageIconAsset(currentPage);
  };
  addClickableImage(stage, PET_BOX_ASSETS.arrowLeft, PET_BOX_LAYOUT.selectorArrowLeft, "上一页", () => {
    if (currentPage <= 1) return;
    currentPage -= 1;
    syncPageIcon();
  }, {
    id: "bag.bottomBoxSelector.prev",
    label: "上一页按钮",
    component: "renderPetBox",
  });
  addClickableImage(stage, PET_BOX_ASSETS.arrowRight, PET_BOX_LAYOUT.selectorArrowRight, "下一页", () => {
    if (currentPage >= pageState.unlockedPages) return;
    currentPage += 1;
    syncPageIcon();
  }, {
    id: "bag.bottomBoxSelector.next",
    label: "下一页按钮",
    component: "renderPetBox",
  });
  addImage(stage, PET_BOX_ASSETS.boxLabelTitle, PET_BOX_LAYOUT.selectorLabelTitle, "", "精灵盒子", {
    id: "bag.bottomBoxSelector.title",
    label: "盒子选择器标题",
    component: "renderPetBox",
  });

  addClickableImage(stage, PET_BOX_ASSETS.btnFilter, PET_BOX_LAYOUT.filterButton, "筛选", null, {
    id: "bag.filterButton",
    label: "筛选按钮",
    component: "renderPetBox",
  });
  if (!isDeletedItem("bag.closeButton")) {
    closeButtonImage = addClickableImage(stage, PET_BOX_ASSETS.btnClose, PET_BOX_LAYOUT.closeButton, "关闭", () => {
      location.hash = "#/team";
    }, {
      id: "bag.closeButton",
      label: "关闭按钮",
      component: "renderPetBox",
    });
  }

  root.append(backdrop, stage);
  app.append(root);

  activeRoot = root;
  activeStage = stage;
  updateScale();

  if (!abilityIconMap) {
    loadAbilityIconMap().then(() => {
      if (activeRoot === root && activeStage === stage && isPetBoxRoute()) {
        renderPetBox(app);
      }
    });
  }
}

function cleanupPetBox(app) {
  activeRoot = null;
  activeStage = null;
  document.body.classList.remove("pet-box-active");
  if (document.title === "精灵背包") document.title = titleBeforePetBox;
  if (app?.classList.contains("pet-box-app")) app.className = "app";
}

function syncPetBoxTab(active) {
  const tabs = document.querySelectorAll("#tabs .tab");
  for (const tab of tabs) {
    const isPetBoxTab = tab.dataset.petBoxTab === "true";
    if (active) {
      tab.classList.toggle("active", isPetBoxTab);
    } else if (isPetBoxTab) {
      tab.classList.remove("active");
    }
  }
}

function syncPetBoxRoute() {
  const app = document.getElementById("app");
  const active = isPetBoxRoute();

  syncPetBoxTab(active);

  if (!app) return;
  if (active) {
    renderPetBox(app);
    return;
  }

  cleanupPetBox(app);
}

window.addEventListener("resize", updateScale);
window.addEventListener("hashchange", syncPetBoxRoute);
queueMicrotask(syncPetBoxRoute);
