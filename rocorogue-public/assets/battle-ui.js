const ACTIONS = [
  { id: "run", label: "逃跑" },
  { id: "bag", label: "背包" },
  { id: "capture", label: "捕捉" },
  { id: "switch", label: "更换" },
  { id: "skill", label: "技能" }
];

const CAPTURE_BALLS = [
  {
    id: "normal",
    label: "普通咕噜球",
    count: 1,
    image: "/assets/battle-ui/capture-ball-normal.png?v=20260526-official",
    detail: "60%概率捕捉；个体值随机1-3条，数值随机",
    colors: ["#4fd3ff", "#206ee9"]
  },
  {
    id: "advanced",
    label: "高级咕噜球",
    count: 1,
    image: "/assets/battle-ui/capture-ball-advanced.png?v=20260526-official",
    detail: "75%概率捕捉；个体值随机1-3条，数值随机",
    colors: ["#f27cff", "#7530d4"]
  },
  {
    id: "filllight",
    label: "补光球",
    count: 1,
    image: "/assets/battle-ui/capture-ball-filllight.png?v=20260526-official",
    detail: "100%概率捕捉；个体值随机1-3条，数值随机",
    colors: ["#7df6ff", "#2c9fd7"]
  },
  {
    id: "king",
    label: "国王球",
    count: 1,
    image: "/assets/battle-ui/capture-ball-king.png?v=20260526-official",
    detail: "100%概率捕捉；个体值随机3条，数值8-10随机",
    colors: ["#ffc64c", "#94602b"]
  },
  {
    id: "prism",
    label: "棱镜球",
    count: 0,
    image: "/assets/battle-ui/capture-ball-prism.png?v=20260526-official",
    detail: "100%概率捕捉；个体值随机3条，数值必定为10，给精灵随机染色",
    colors: ["#ffd25a", "#7a6cff"]
  }
];

const CAPTURE_BALL_COUNT_STORAGE_KEY = "rocorogue.capture-balls";

const BAG_ITEMS = [
  { id: "boss", label: "首领之力", count: 1, image: "/items/boss.png", colors: ["#ffd15a", "#b06b20"] },
  { id: "wish", label: "愿力强化", count: 2, image: "/items/wish.png", colors: ["#86c5ff", "#2d60d6"] },
  { id: "energybottle", label: "能量瓶", count: 1, image: "/items/energybottle.png", colors: ["#b56dff", "#5a32c8"] }
];

const SPECIES_TYPES_URL = "/assets/battle-ui/species-types.json";
const SPECIES_HEADS_URL = "/assets/battle-ui/species-heads.json";
let speciesTypeMap = null;
let speciesTypesLoading = false;
let speciesHeadMap = null;
let speciesHeadsLoading = false;

const TYPE_EFFECTIVENESS = {
  火: { 草: 2, 冰: 2, 虫: 2, 机械: 2, 龙: .5, 地: .5, 水: .5 },
  龙: { 龙: 2, 机械: .5 },
  水: { 火: 2, 地: 2, 机械: 2, 冰: .5, 草: .5, 龙: .5 },
  电: { 水: 2, 翼: 2, 电: .5, 草: .5, 龙: .5, 地: .5 },
  武: { 普通: 2, 冰: 2, 地: 2, 机械: 2, 恶: 2, 毒: .5, 翼: .5, 幻: .5, 虫: .5, 萌: .5, 幽: .5 },
  普通: { 机械: .5, 地: .5, 幽: .5 },
  光: { 恶: 2, 幽: 2, 冰: .5, 草: .5 },
  地: { 火: 2, 电: 2, 毒: 2, 冰: 2, 草: .5, 武: .5 },
  机械: { 冰: 2, 地: 2, 萌: 2, 火: .5, 水: .5, 电: .5, 机械: .5 },
  毒: { 草: 2, 萌: 2, 毒: .5, 地: .5, 机械: .5, 幽: .5 },
  草: { 水: 2, 光: 2, 地: 2, 火: .5, 龙: .5, 毒: .5, 虫: .5, 翼: .5, 机械: .5 },
  恶: { 幽: 2, 毒: 2, 萌: 2, 武: .5, 恶: .5, 光: .5 },
  萌: { 龙: 2, 武: 2, 恶: 2, 火: .5, 毒: .5, 机械: .5 },
  幻: { 武: 2, 毒: 2, 幻: .5, 机械: .5, 光: .5 },
  虫: { 草: 2, 幻: 2, 恶: 2, 火: .5, 武: .5, 毒: .5, 翼: .5, 幽: .5, 机械: .5, 萌: .5 },
  翼: { 草: 2, 武: 2, 虫: 2, 电: .5, 龙: .5, 机械: .5, 地: .5 },
  冰: { 草: 2, 地: 2, 翼: 2, 龙: 2, 火: .5, 冰: .5, 机械: .5 },
  幽: { 幻: 2, 幽: 2, 光: 2, 恶: .5, 普通: .5 }
};

const DEFAULT_MOVES_PATCH_KEY = "rocorogue.default-moves-applied";
const DEFAULT_MOVES_PATCH_VERSION = "v1";
const DEFAULT_DIMO_MOVES = ["光刃", "闪光冲击", "光球", "防御"];

function isEmptyMoveList(moves) {
  return !Array.isArray(moves) || moves.length === 0 || moves.every(move => !move);
}

function patchDefaultDimoMoves() {
  try {
    if (localStorage.getItem(DEFAULT_MOVES_PATCH_KEY) === DEFAULT_MOVES_PATCH_VERSION) return false;

    let changed = false;
    for (const key of ["rocorogue.team.p1", "rocorogue.team.p2"]) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const data = JSON.parse(raw);
      const team = Array.isArray(data) ? data : data?.team;
      if (!Array.isArray(team) || team.length !== 6) continue;

      const isDefaultDimoTeam = team.every(spirit => spirit?.species === "迪莫" && isEmptyMoveList(spirit.moves));
      if (!isDefaultDimoTeam) continue;

      team.forEach(spirit => {
        spirit.moves = DEFAULT_DIMO_MOVES.slice();
      });

      localStorage.setItem(key, JSON.stringify(Array.isArray(data) ? team : data));
      changed = true;
    }

    localStorage.setItem(DEFAULT_MOVES_PATCH_KEY, DEFAULT_MOVES_PATCH_VERSION);
    return changed;
  } catch (error) {
    console.warn("[battle-ui] 默认技能补丁失败：", error);
    return false;
  }
}

const patchedDefaultDimoMoves = patchDefaultDimoMoves();
if (patchedDefaultDimoMoves) {
  queueMicrotask(() => window.dispatchEvent(new Event("hashchange")));
}

function routeName() {
  return (location.hash.slice(1).split("?")[0] || "/team").replace(/^\//, "") || "team";
}

function syncRoute() {
  document.body.dataset.rocoRoute = routeName();
  if (routeName() !== "battle") {
    const view = document.querySelector(".battle-view");
    view?.classList.remove("roco-show-report", "roco-show-switch", "roco-show-capture", "roco-show-bag");
    if (view) {
      delete view.dataset.rocoManualDrawer;
      clearSwitchConfirm(view);
    }
  }
}

function makeActionButton(action) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `roco-action-button roco-action-${action.id}`;
  button.dataset.action = action.id;
  button.title = action.label;

  const frame = document.createElement("span");
  frame.className = "roco-action-icon-wrap";

  const icon = document.createElement("span");
  icon.className = `roco-action-icon ${action.id}`;
  frame.append(icon);

  const label = document.createElement("span");
  label.className = "roco-action-label";
  label.textContent = action.label;

  button.append(frame, label);
  return button;
}

function textIncludes(el, keyword) {
  return el?.textContent?.includes(keyword);
}

function clickFirst(root, selector, predicate = () => true) {
  const node = Array.from(root.querySelectorAll(selector)).find(predicate);
  if (!node || node.disabled) return false;
  node.click();
  return true;
}

function moveName(button) {
  return button.querySelector(".move-name")?.textContent?.trim() || button.textContent?.trim() || "";
}

function isChargeMove(button) {
  return moveName(button) === "聚能";
}

function isHiddenMove(button) {
  const name = moveName(button);
  return name === "聚能" || name === "空技能";
}

function clickChargeMove(view) {
  return clickFirst(view, ".battle-controls .move-btn", button => button.classList.contains("roco-charge-move") || isChargeMove(button));
}

function clearCaptureSelection(view) {
  view.__rocoPendingCaptureBall?.classList.remove("roco-ball-selected");
  view.__rocoPendingCaptureBall = null;
  syncTargeting(view);
}

function selectedBagItemCard(view) {
  return view.querySelector(".roco-item-panel .roco-item-card.roco-item-armed:not(:disabled)");
}

function playerSideId() {
  const state = currentBattleUiState();
  return state?.playerSide === "p2" ? "p2" : "p1";
}

function opponentSideId() {
  return playerSideId() === "p1" ? "p2" : "p1";
}

function sideHasTarget(view, sideId) {
  return !!view.querySelector(`.battle-side.${sideId} .battle-spirit img`);
}

function isTrainerBattle() {
  const state = currentBattleUiState();
  const battle = state?.battle;
  if (!battle) return true;

  const sideIndex = state.playerSide === "p2" ? 1 : 0;
  const foe = battle.sides?.[1 - sideIndex];
  if (!foe) return true;

  if (battle.isWild === true || battle.battleType === "wild" || foe.isWild === true) return false;
  if (battle.isTrainer === true || battle.battleType === "trainer" || foe.trainer === true) return true;
  if (state.mode && state.mode !== "solo") return true;

  return Array.isArray(foe.spirit) && foe.spirit.length > 1;
}

function normalizedCount(value, fallback = 0) {
  const count = Number(value);
  return Number.isFinite(count) ? Math.max(0, Math.floor(count)) : fallback;
}

function captureBallCountsFrom(value) {
  const counts = {};
  const setCount = (key, count) => {
    if (!key) return;
    counts[String(key)] = normalizedCount(count);
  };

  if (Array.isArray(value)) {
    value.forEach(entry => {
      if (!entry || typeof entry !== "object") return;
      const key = entry.id || entry.type || entry.name || entry.label;
      setCount(key, entry.count ?? entry.amount ?? entry.owned);
    });
    return counts;
  }

  if (!value || typeof value !== "object") return counts;
  Object.entries(value).forEach(([key, entry]) => {
    if (entry && typeof entry === "object") {
      setCount(entry.id || entry.type || entry.name || entry.label || key, entry.count ?? entry.amount ?? entry.owned);
      return;
    }
    setCount(key, entry);
  });
  return counts;
}

function storedCaptureBallCounts() {
  try {
    return captureBallCountsFrom(JSON.parse(localStorage.getItem(CAPTURE_BALL_COUNT_STORAGE_KEY) || "null"));
  } catch {
    return {};
  }
}

function captureBallInventoryCounts() {
  const state = currentBattleUiState();
  const battle = state?.battle;
  const sideIndex = state?.playerSide === "p2" ? 1 : 0;
  const side = battle?.sides?.[sideIndex];
  const candidates = [
    state?.captureBalls,
    state?.ballInventory,
    state?.inventory?.captureBalls,
    state?.inventory?.balls,
    battle?.captureBalls,
    battle?.ballInventory,
    battle?.inventory?.captureBalls,
    battle?.inventory?.balls,
    side?.captureBalls,
    side?.ballInventory,
    side?.inventory?.captureBalls,
    side?.inventory?.balls
  ];

  for (const candidate of candidates) {
    const counts = captureBallCountsFrom(candidate);
    if (Object.keys(counts).length) return counts;
  }
  return storedCaptureBallCounts();
}

function captureBallCountForCard(card, counts) {
  const ball = CAPTURE_BALLS.find(item => item.id === card.dataset.ballId);
  const fallback = normalizedCount(card.dataset.defaultCount ?? ball?.count ?? 0);
  const keys = [card.dataset.ballId, card.dataset.ballLabel, ball?.label].filter(Boolean);

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(counts, key)) return normalizedCount(counts[key], fallback);
  }
  return fallback;
}

function syncCapturePanel(view) {
  const blocked = isTrainerBattle();
  const panel = view.querySelector(".roco-ball-panel");
  const action = view.querySelector(".roco-action-capture");
  const counts = captureBallInventoryCounts();

  if (action) {
    action.classList.toggle("roco-action-disabled", blocked);
    action.title = blocked ? "训练家作战时不能捕捉" : "捕捉";
  }

  if (!panel) return;
  if (blocked && view.__rocoPendingCaptureBall) clearCaptureSelection(view);
  if (view.__rocoPendingCaptureBall && captureBallCountForCard(view.__rocoPendingCaptureBall, counts) <= 0) {
    clearCaptureSelection(view);
  }

  panel.querySelectorAll(".roco-ball-card").forEach(card => {
    const count = captureBallCountForCard(card, counts);
    const empty = count <= 0;
    const countNode = card.querySelector(".roco-ball-count");
    if (countNode) countNode.textContent = String(count);

    card.disabled = blocked || empty;
    card.classList.toggle("roco-ball-empty", empty);
    card.title = blocked ? "训练家作战时不能捕捉" : `${card.dataset.ballLabel || card.title} × ${count}`;
  });
}

function syncTargeting(view) {
  view.classList.remove("roco-targeting", "roco-target-ally", "roco-target-foe", "roco-target-item", "roco-target-switch", "roco-target-capture");
  view.querySelectorAll(".battle-side.roco-target-side").forEach(side => side.classList.remove("roco-target-side"));

  let source = "";
  let target = "";

  if (view.classList.contains("roco-show-capture") && view.__rocoPendingCaptureBall && !isTrainerBattle()) {
    source = "capture";
    target = "foe";
  } else if (view.classList.contains("roco-show-switch") && view.__rocoPendingSwitchCard?.isConnected && view.__rocoPendingSwitchCard.classList.contains("switchable")) {
    source = "switch";
    target = "ally";
  } else if (view.classList.contains("roco-show-bag") && selectedBagItemCard(view)) {
    source = "item";
    target = "ally";
  }

  const sideId = target === "foe" ? opponentSideId() : target === "ally" ? playerSideId() : "";
  if (!source || !target || !sideId || !sideHasTarget(view, sideId)) return;

  view.classList.add("roco-targeting", `roco-target-${target}`, `roco-target-${source}`);
  view.querySelector(`.battle-side.${sideId}`)?.classList.add("roco-target-side");
}

function returnToSkillInterface(view) {
  delete view.dataset.rocoManualDrawer;
  view.classList.remove("roco-show-report", "roco-show-switch", "roco-show-capture", "roco-show-bag");
  syncTargeting(view);
}

function wireTargeting(view) {
  if (view.dataset.rocoTargetingWired === "1") return;
  view.dataset.rocoTargetingWired = "1";

  view.addEventListener("click", event => {
    if (!view.classList.contains("roco-targeting")) return;
    const target = event.target.closest(".battle-side.roco-target-side .battle-spirit");
    if (!target) return;

    const isSwitchTarget = view.classList.contains("roco-target-switch");
    const isItemTarget = view.classList.contains("roco-target-item");
    const isCaptureTarget = view.classList.contains("roco-target-capture");

    if (isSwitchTarget && view.__rocoPendingSwitchCard) {
      event.preventDefault();
      event.stopPropagation();
      confirmSwitchSelection(view);
      returnToSkillInterface(view);
      requestAnimationFrame(() => returnToSkillInterface(view));
      return;
    }

    if (isItemTarget && selectedBagItemCard(view)) {
      event.preventDefault();
      event.stopPropagation();
      returnToSkillInterface(view);
      return;
    }

    if (isCaptureTarget && view.__rocoPendingCaptureBall) {
      event.preventDefault();
      event.stopPropagation();
      view.dataset.rocoManualDrawer = "capture";
      view.classList.add("roco-show-capture");
      syncTargeting(view);
    }
  }, true);
}

function toggleDrawer(view, name) {
  const drawerClass = {
    report: "roco-show-report",
    switch: "roco-show-switch",
    capture: "roco-show-capture",
    bag: "roco-show-bag"
  }[name];

  view.classList.remove("roco-show-report", "roco-show-switch", "roco-show-capture", "roco-show-bag");
  delete view.dataset.rocoManualDrawer;
  if (drawerClass) {
    view.classList.add(drawerClass);
    view.dataset.rocoManualDrawer = name;
  }

  if (name !== "switch") clearSwitchConfirm(view);
  if (name !== "capture") clearCaptureSelection(view);
  syncTargeting(view);
}

function makeCaptureBallButton(ball) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "roco-ball-card";
  button.dataset.ballId = ball.id;
  button.dataset.ballLabel = ball.label;
  button.dataset.defaultCount = String(ball.count ?? 0);
  button.title = `${ball.label} × ${ball.count ?? 0}`;
  button.dataset.defaultTitle = button.title;
  button.style.setProperty("--ball-a", ball.colors?.[0] || "#5fd4ff");
  button.style.setProperty("--ball-b", ball.colors?.[1] || "#2766d8");

  const icon = document.createElement("span");
  icon.className = "roco-ball-icon";
  if (ball.image) {
    const image = document.createElement("img");
    image.src = ball.image;
    image.alt = ball.label;
    image.loading = "lazy";
    image.onerror = () => image.remove();
    icon.append(image);
  }

  const fallback = document.createElement("span");
  fallback.className = "roco-ball-placeholder";
  icon.append(fallback);

  const count = document.createElement("span");
  count.className = "roco-ball-count";
  count.textContent = String(ball.count ?? 0);

  button.append(icon, count);
  return button;
}

function ensureCapturePanel(view) {
  if (view.querySelector(".roco-ball-panel")) return;

  const panel = document.createElement("div");
  panel.className = "roco-ball-panel";
  panel.setAttribute("aria-label", "捕捉球");

  const list = document.createElement("div");
  list.className = "roco-ball-list";
  CAPTURE_BALLS.forEach(ball => list.append(makeCaptureBallButton(ball)));

  panel.append(list);
  view.append(panel);
}

function makeBagItemButton(item) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `roco-item-card${item.empty ? " roco-item-empty" : ""}`;
  button.dataset.itemId = item.id;
  button.dataset.defaultLabel = item.label;
  button.dataset.defaultCount = String(item.count ?? "");
  button.title = item.empty ? item.label : `${item.label} × ${item.count}`;
  button.disabled = !!item.empty;
  button.style.setProperty("--item-a", item.colors?.[0] || "#5fd4ff");
  button.style.setProperty("--item-b", item.colors?.[1] || "#2766d8");

  const icon = document.createElement("span");
  icon.className = "roco-item-icon";
  if (item.image) {
    const image = document.createElement("img");
    image.src = item.image;
    image.alt = item.label;
    image.loading = "lazy";
    image.onerror = () => image.remove();
    icon.append(image);
  }

  const fallback = document.createElement("span");
  fallback.className = "roco-item-placeholder";
  icon.append(fallback);

  const count = document.createElement("span");
  count.className = "roco-item-count";
  count.textContent = item.empty ? "" : String(item.count);

  const label = document.createElement("span");
  label.className = "roco-item-label";
  label.textContent = item.label;

  button.append(icon, label, count);
  return button;
}

function ensureBagPanel(view) {
  if (view.querySelector(".roco-item-panel")) return;

  const panel = document.createElement("div");
  panel.className = "roco-item-panel";
  panel.setAttribute("aria-label", "背包道具");

  const list = document.createElement("div");
  list.className = "roco-item-list";
  BAG_ITEMS.forEach(item => list.append(makeBagItemButton(item)));

  panel.append(list);
  view.append(panel);
}

function bagCoreSlot(view, itemId) {
  return view.querySelector(`.battle-controls .item-bar[data-item-slot="${itemId}"]`);
}

function itemCountFromMeta(card, meta) {
  if (meta.includes("已使用")) return "0";
  const ratio = meta.match(/(?:数量|次数)\s*(\d+\s*\/\s*\d+)/);
  if (ratio) return ratio[1].replace(/\s+/g, "");
  const match = meta.match(/(?:数量|次数)\s*(\d+)/);
  return match?.[1] || card.dataset.defaultCount || card.querySelector(".roco-item-count")?.textContent || "";
}

function syncBagPanel(view) {
  const panel = view.querySelector(".roco-item-panel");
  if (!panel) return;

  panel.querySelectorAll(".roco-item-card").forEach(card => {
    const slot = bagCoreSlot(view, card.dataset.itemId);
    const toggle = slot?.querySelector(".item-bar-toggle");
    const meta = slot?.querySelector(".item-bar-meta")?.textContent?.trim() || "";
    const name = slot?.querySelector(".item-bar-name")?.textContent?.trim() || card.dataset.defaultLabel || card.title || "";
    const armed = !!slot?.classList.contains("armed");
    const disabled = !slot || !toggle || toggle.disabled || slot.classList.contains("disabled");

    card.disabled = disabled;
    card.classList.toggle("roco-item-armed", armed);

    const label = card.querySelector(".roco-item-label");
    if (label) label.textContent = name;

    const count = card.querySelector(".roco-item-count");
    if (count) count.textContent = itemCountFromMeta(card, meta);

    card.title = [name, meta, disabled ? toggle?.title : armed ? "已点亮，下次出招/换宠会使用" : "点击点亮本回合使用"].filter(Boolean).join(" · ");
  });
}

function switchCardDisplayName(card) {
  return card.querySelector(".switch-name")?.textContent?.trim() || card.title?.split("　")[0]?.trim() || "该精灵";
}

function clearSwitchConfirm(view) {
  const pending = view.__rocoPendingSwitchCard;
  pending?.classList.remove("roco-switch-selected");
  view.__rocoPendingSwitchCard = null;
  view.classList.remove("roco-switch-confirm-open");

  const panel = view.querySelector(".roco-switch-confirm");
  if (!panel) return;
  panel.hidden = true;
  panel.classList.remove("active");
  panel.querySelector(".roco-switch-confirm-preview")?.replaceChildren();
  const name = panel.querySelector(".roco-switch-confirm-name");
  if (name) name.textContent = "";
  syncTargeting(view);
}

function cancelBossWishForSwitch(view) {
  const state = currentBattleUiState();
  if (!state) return;

  const shouldCancelBoss = !!state.useBossItemThisTurn;
  const shouldCancelWish = !!state.useWishItemThisTurn;
  if (!shouldCancelBoss && !shouldCancelWish) return;

  state.useBossItemThisTurn = false;
  state.useWishItemThisTurn = false;

  for (const id of ["boss", "wish"]) {
    bagCoreSlot(view, id)?.classList.remove("armed");
    view.querySelector(`.roco-item-card[data-item-id="${id}"]`)?.classList.remove("roco-item-armed");
  }
}

function confirmSwitchSelection(view) {
  const card = view.__rocoPendingSwitchCard;
  clearSwitchConfirm(view);
  if (!card?.isConnected || !card.classList.contains("switchable")) return;

  cancelBossWishForSwitch(view);
  view.dataset.rocoSwitchConfirmBypass = "1";
  card.click();
  setTimeout(() => {
    delete view.dataset.rocoSwitchConfirmBypass;
  }, 0);
}

function showSwitchConfirm(view, card) {
  ensureSwitchConfirm(view);
  clearSwitchConfirm(view);

  view.__rocoPendingSwitchCard = card;
  card.classList.add("roco-switch-selected");
  view.classList.add("roco-switch-confirm-open");
  syncTargeting(view);
}

function ensureSwitchConfirm(view) {
  if (view.querySelector(".roco-switch-confirm")) return;

  const panel = document.createElement("div");
  panel.className = "roco-switch-confirm";
  panel.hidden = true;
  panel.innerHTML = `
    <div class="roco-switch-confirm-panel" role="dialog" aria-label="确认更换">
      <div class="roco-switch-confirm-title">确认更换</div>
      <div class="roco-switch-confirm-body">
        <div class="roco-switch-confirm-preview"></div>
        <div class="roco-switch-confirm-copy">换上<span class="roco-switch-confirm-name"></span></div>
      </div>
      <div class="roco-switch-confirm-actions">
        <button type="button" class="roco-switch-confirm-cancel">取消</button>
        <button type="button" class="roco-switch-confirm-ok">确认</button>
      </div>
    </div>
  `;

  panel.addEventListener("click", event => {
    if (event.target.closest(".roco-switch-confirm-cancel")) {
      event.preventDefault();
      clearSwitchConfirm(view);
      return;
    }
    if (event.target.closest(".roco-switch-confirm-ok")) {
      event.preventDefault();
      confirmSwitchSelection(view);
    }
  });

  panel.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      event.preventDefault();
      clearSwitchConfirm(view);
    }
    if (event.key === "Enter") {
      event.preventDefault();
      confirmSwitchSelection(view);
    }
  });

  view.append(panel);
}

function wireSwitchConfirm(view) {
  if (view.dataset.rocoSwitchConfirmWired === "1") return;
  view.dataset.rocoSwitchConfirmWired = "1";

  view.addEventListener("pointerdown", event => {
    const card = event.target.closest(".switch-card.switchable");
    if (!card || !view.querySelector(".switch-panel")?.contains(card)) return;
    view.__rocoSwitchPointer = {
      card,
      time: performance.now()
    };
  }, true);

  view.addEventListener("click", event => {
    const card = event.target.closest(".switch-card.switchable");
    if (!card || !view.querySelector(".switch-panel")?.contains(card)) return;
    if (!view.classList.contains("roco-show-switch")) return;
    if (view.dataset.rocoSwitchConfirmBypass === "1") return;
    if (view.dataset.rocoPickingLead === "1" || isInitialLeadRequest(view)) return;

    const pointer = view.__rocoSwitchPointer;
    if (pointer?.card === card && performance.now() - pointer.time >= 480) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (view.__rocoPendingSwitchCard === card) {
      clearSwitchConfirm(view);
      return;
    }
    showSwitchConfirm(view, card);
  }, true);
}

function syncSwitchConfirm(view) {
  const pending = view.__rocoPendingSwitchCard;
  if (!view.classList.contains("roco-show-switch") || (pending && (!pending.isConnected || !pending.classList.contains("switchable")))) {
    clearSwitchConfirm(view);
  }
}

function wireActions(view) {
  view.querySelector(".roco-command-bar")?.addEventListener("click", event => {
    const button = event.target.closest(".roco-action-button");
    if (!button) return;
    const action = button.dataset.action;
    view.classList.remove("roco-show-report");

    if (action === "run") {
      clearSwitchConfirm(view);
      clearCaptureSelection(view);
      view.classList.remove("roco-show-switch", "roco-show-capture", "roco-show-bag");
      delete view.dataset.rocoManualDrawer;
      clickFirst(view, ".battle-controls button", el => textIncludes(el, "跳过") || textIncludes(el, "逃"));
    } else if (action === "bag") {
      toggleDrawer(view, "bag");
    } else if (action === "capture") {
      toggleDrawer(view, "capture");
    } else if (action === "switch") {
      toggleDrawer(view, "switch");
    } else if (action === "skill") {
      delete view.dataset.rocoManualDrawer;
      view.classList.remove("roco-show-report", "roco-show-switch", "roco-show-capture", "roco-show-bag");
      clearSwitchConfirm(view);
      clearCaptureSelection(view);
      view.querySelector(".battle-controls .move-btn:not(.roco-hidden-move):not(:disabled)")?.focus?.();
    }
  });

  const energy = view.querySelector(".roco-energy-widget");
  if (energy && !energy.dataset.rocoEnergyWired) {
    energy.dataset.rocoEnergyWired = "1";
    energy.addEventListener("click", () => clickChargeMove(view));
    energy.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      clickChargeMove(view);
    });
  }

  const bagPanel = view.querySelector(".roco-item-panel");
  if (bagPanel && !bagPanel.dataset.rocoBagWired) {
    bagPanel.dataset.rocoBagWired = "1";
    bagPanel.addEventListener("click", event => {
      const card = event.target.closest(".roco-item-card");
      if (!card || card.disabled) return;
      const toggle = bagCoreSlot(view, card.dataset.itemId)?.querySelector(".item-bar-toggle");
      if (!toggle || toggle.disabled) return;
      toggle.click();
      syncBagPanel(view);
      syncTargeting(view);
    });
  }

  const ballPanel = view.querySelector(".roco-ball-panel");
  if (ballPanel && !ballPanel.dataset.rocoCaptureWired) {
    ballPanel.dataset.rocoCaptureWired = "1";
    ballPanel.addEventListener("click", event => {
      const card = event.target.closest(".roco-ball-card");
      if (!card || card.disabled || card.classList.contains("roco-ball-empty") || isTrainerBattle()) return;
      if (view.__rocoPendingCaptureBall === card) {
        clearCaptureSelection(view);
        return;
      }

      clearCaptureSelection(view);
      view.__rocoPendingCaptureBall = card;
      card.classList.add("roco-ball-selected");
      syncTargeting(view);
    });
  }
}

function ensureOverlay(view) {
  view.querySelector(".roco-side-shortcuts")?.remove();
  view.querySelector(".roco-battle-message")?.remove();

  if (!view.querySelector(".roco-battle-info")) {
    const info = document.createElement("div");
    info.className = "roco-battle-info";

    const title = document.createElement("div");
    title.className = "roco-battle-info-title";
    title.textContent = "战斗信息";

    const list = document.createElement("div");
    list.className = "roco-battle-info-list";

    info.append(title, list);
    view.append(info);
  }

  if (!view.querySelector(".roco-command-bar")) {
    const bar = document.createElement("div");
    bar.className = "roco-command-bar";
    ACTIONS.forEach(action => bar.append(makeActionButton(action)));
    view.append(bar);
  }

  ensureCapturePanel(view);
  ensureBagPanel(view);
  ensureSwitchConfirm(view);
  wireSwitchConfirm(view);
  wireTargeting(view);

  if (!view.querySelector(".roco-energy-widget")) {
    const widget = document.createElement("div");
    widget.className = "roco-energy-widget";
    widget.tabIndex = 0;
    widget.setAttribute("role", "button");
    widget.title = "聚能";
    widget.innerHTML = '<div class="roco-energy-box">0/0</div><div class="roco-energy-label">聚能</div>';
    view.append(widget);
  }

  if (!view.dataset.rocoWired) {
    view.dataset.rocoWired = "1";
    wireActions(view);
  }
}

function hpText(info) {
  const row = Array.from(info.querySelectorAll(".bar-label")).find(label => {
    const first = label.querySelector("span:first-child");
    return first?.textContent?.trim() === "HP";
  });
  return row?.querySelector("span:last-child")?.textContent?.replace(/\s+/g, "") || "";
}

function hpPercentText(info) {
  const match = hpText(info).match(/^(\d+)\/(\d+)$/);
  if (!match) return hpText(info);
  const current = Number(match[1]);
  const max = Number(match[2]);
  if (!Number.isFinite(current) || !Number.isFinite(max) || max <= 0) return "--%";
  const percent = Math.max(0, Math.min(100, Math.round(current / max * 100)));
  return `${percent}%`;
}

function energyTextFromInfo(info) {
  const row = Array.from(info?.querySelectorAll(".bar-label") || []).find(label => {
    const first = label.querySelector("span:first-child");
    return first?.textContent?.includes("能");
  });
  return row?.querySelector("span:last-child")?.textContent?.replace(/\s+/g, "") || "0/0";
}

function energyCurrentFromInfo(info) {
  return energyTextFromInfo(info).match(/\d+/)?.[0] || "0";
}

function energyText(view) {
  return energyTextFromInfo(view.querySelector(".battle-side.p1 .spirit-info"));
}

function normalizeGender(value) {
  if (!value) return "";
  const gender = value.trim().toLowerCase();
  if (gender === "m" || gender === "male" || gender === "男" || gender === "♂") return "♂";
  if (gender === "f" || gender === "female" || gender === "女" || gender === "♀") return "♀";
  return "";
}

function nameVariants(name) {
  const raw = name?.trim();
  if (!raw) return [];
  const plain = raw.replace(/[（(][^）)]*[）)]/g, "").trim();
  return Array.from(new Set([raw, plain].filter(Boolean)));
}

function parseTeamEntries(text) {
  return (text || "").split(/\n\s*\n/).map(block => {
    const lines = block.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (!lines.length) return null;
    const head = lines[0];
    const match = head.match(/^(.*?)\s*\(([^()]*)\)\s*$/);
    const genderLine = lines.find(line => /^Gender:/i.test(line));
    return {
      name: (match?.[1] || head).trim(),
      species: (match?.[2] || head).trim(),
      gender: normalizeGender(genderLine?.replace(/^Gender:\s*/i, "") || "")
    };
  }).filter(entry => entry && entry.gender);
}

function genderForSide(side, info, sprite) {
  const key = side.classList.contains("p2") ? "rocorogue.team.p2" : "rocorogue.team.p1";
  const candidates = new Set([
    ...nameVariants(info.querySelector(".name")?.textContent),
    ...nameVariants(sprite.alt)
  ]);
  for (const entry of parseTeamEntries(localStorage.getItem(key))) {
    if (nameVariants(entry.name).some(name => candidates.has(name)) || nameVariants(entry.species).some(name => candidates.has(name))) {
      return entry.gender;
    }
  }
  return side.classList.contains("p2") ? "♀" : "♂";
}

function loadSpeciesTypes() {
  if (speciesTypeMap || speciesTypesLoading) return;
  speciesTypesLoading = true;
  fetch(SPECIES_TYPES_URL)
    .then(response => response.ok ? response.json() : {})
    .then(map => {
      speciesTypeMap = map || {};
      scheduleEnhance();
    })
    .catch(() => {
      speciesTypeMap = {};
    });
}

function loadSpeciesHeads() {
  if (speciesHeadMap || speciesHeadsLoading) return;
  speciesHeadsLoading = true;
  fetch(SPECIES_HEADS_URL)
    .then(response => response.ok ? response.json() : {})
    .then(map => {
      speciesHeadMap = map || {};
      scheduleEnhance();
    })
    .catch(() => {
      speciesHeadMap = {};
    });
}

function speciesTypesFor(name) {
  if (!speciesTypeMap) return [];
  for (const candidate of nameVariants(name)) {
    const types = speciesTypeMap[candidate];
    if (Array.isArray(types)) return types;
  }
  return [];
}

function moveStatText(button, index) {
  const stat = button.querySelectorAll(".move-meta .mv-stat")[index];
  return stat?.textContent?.replace(/^[^\d-]+/, "").trim() || "";
}

function displayedPowerText(button) {
  const power = moveStatText(button, 1);
  if (!power) return "";
  return power.match(/-?\d+(?:\.\d+)?/)?.[0] || power;
}

function moveTypeFromButton(button) {
  return button.querySelector(".move-tooltip .type-badge")?.textContent?.trim() || "普通";
}

function moveCategoryFromButton(button) {
  return button.querySelector(".move-tooltip .move-tooltip-cat")?.textContent?.trim() || "";
}

function activeSideTypes(view, selector) {
  const side = view.querySelector(selector);
  if (!side) return [];

  const hudTypes = Array.from(side.querySelectorAll(".roco-hud-type"))
    .map(icon => icon.alt || icon.title)
    .filter(Boolean);
  if (hudTypes.length) return hudTypes;

  const info = side.querySelector(".spirit-info");
  const sprite = side.querySelector(".battle-spirit img");
  const speciesName = sprite?.alt || info?.querySelector(".name")?.textContent || "";
  return speciesTypesFor(speciesName);
}

function typeEffectiveness(moveType, defenderTypes) {
  const row = TYPE_EFFECTIVENESS[moveType] || {};
  const value = defenderTypes.reduce((total, type) => total * (row[type] ?? 1), 1);
  if (value >= 4) return 3;
  if (value <= .25) return .25;
  return value;
}

function currentBattleUiState() {
  const state = window.__rocoBattleUiState;
  return state?.battle && state?.playerSide ? state : null;
}

function offensiveMoveThreat(spirit, defender, battle) {
  if (!spirit || !defender || !battle?.dex) return false;
  const defenderTypes = defender.species?.types || defender.effectiveSpecies?.types || [];
  if (!defenderTypes.length) return false;

  return (spirit.moveSlots || []).some(slot => {
    if (!slot || slot.id === "charge" || slot.id === "empty") return false;
    const move = battle.dex.moves.get(slot.id);
    if (!move?.exists) return false;
    const overrides = typeof move.computeDynamicOverrides === "function"
      ? move.computeDynamicOverrides(spirit, defender)
      : null;
    const category = overrides?.category ?? move.category;
    if (category !== "物攻" && category !== "魔攻") return false;
    const type = overrides?.type ?? move.type ?? "普通";
    return typeEffectiveness(type, defenderTypes) > 1;
  });
}

function typeIsThreatenedByActive(spirit, foe) {
  const spiritTypes = spirit?.species?.types || spirit?.effectiveSpecies?.types || [];
  const foeTypes = foe?.species?.types || foe?.effectiveSpecies?.types || [];
  if (!spiritTypes.length || !foeTypes.length) return false;
  return foeTypes.some(type => typeEffectiveness(type, spiritTypes) > 1);
}

function ensureCardBadge(card, className) {
  const selectorClass = className.trim().split(/\s+/).at(-1);
  let badge = card.querySelector(`:scope > .${selectorClass}`);
  if (!badge) {
    badge = document.createElement("span");
    badge.className = className;
    card.append(badge);
  }
  return badge;
}

function syncSwitchCards(view) {
  const state = currentBattleUiState();
  const cards = Array.from(view.querySelectorAll(".switch-panel .switch-card"));
  if (!state || !cards.length) return;

  const sideIndex = state.playerSide === "p1" ? 0 : 1;
  const side = state.battle.sides?.[sideIndex];
  const foe = state.battle.sides?.[1 - sideIndex]?.activeSpirit;
  if (!side?.spirit?.length) return;

  cards.forEach((card, index) => {
    const spirit = side.spirit[index];
    if (!spirit) return;

    const hpText = `${Math.max(0, spirit.hp)}/${spirit.maxhp}`;
    const energyText = String(Math.max(0, spirit.energy));
    const hpBadge = ensureCardBadge(card, "switch-hp-text");
    const energyBadge = ensureCardBadge(card, "roco-score switch-energy-chip");
    const up = ensureCardBadge(card, "switch-effect switch-effect-up");
    const down = ensureCardBadge(card, "switch-effect switch-effect-down");

    hpBadge.textContent = hpText;
    energyBadge.textContent = energyText;
    card.dataset.rocoPosition = String((spirit.position ?? index) + 1);
    card.dataset.rocoHp = hpText;
    card.dataset.rocoEnergy = String(Math.max(0, spirit.energy));

    const hasOffense = offensiveMoveThreat(spirit, foe, state.battle);
    const isThreatened = typeIsThreatenedByActive(spirit, foe);
    card.classList.toggle("roco-has-counter-move", hasOffense);
    card.classList.toggle("roco-type-threatened", isThreatened);

    up.textContent = "▲";
    up.hidden = !hasOffense;
    up.title = "携带技能克制对方在场精灵";
    down.textContent = "▼";
    down.hidden = !isThreatened;
    down.title = "属性被对方在场精灵克制";
  });
}

function ensureMoveBadge(button, className) {
  let badge = button.querySelector(`:scope > .${className}`);
  if (!badge) {
    badge = document.createElement("span");
    badge.className = className;
    button.append(badge);
  }
  return badge;
}

function updateMoveCardDetails(view, button) {
  const moveType = moveTypeFromButton(button);
  const category = moveCategoryFromButton(button);
  const costText = moveStatText(button, 0) || "0";
  const powerText = displayedPowerText(button);
  const defenderTypes = activeSideTypes(view, ".battle-side.p2");
  const effectiveness = powerText && !/状态|防御/.test(category) ? typeEffectiveness(moveType, defenderTypes) : 1;

  const cost = ensureMoveBadge(button, "roco-move-cost");
  cost.textContent = costText;
  cost.title = `实际耗能 ${costText}`;

  const power = ensureMoveBadge(button, "roco-move-power");
  power.textContent = powerText || "--";
  power.title = powerText ? `显示威力 ${moveStatText(button, 1)}` : "无显示威力";
  power.classList.toggle("empty", !powerText);

  const type = ensureMoveBadge(button, "roco-move-type");
  type.title = `属性 ${moveType}`;
  let icon = type.querySelector("img");
  if (!icon) {
    icon = document.createElement("img");
    icon.loading = "lazy";
    type.append(icon);
  }
  const typeSrc = `/types/${encodeURIComponent(moveType)}.webp`;
  if (icon.getAttribute("src") !== typeSrc) icon.src = typeSrc;
  icon.alt = moveType;
  icon.onerror = () => {
    const fallback = `/types/${encodeURIComponent(moveType)}.png`;
    if (icon.getAttribute("src") !== fallback) icon.src = fallback;
  };

  const effect = ensureMoveBadge(button, "roco-move-effect");
  effect.classList.remove("up", "down");
  if (effectiveness > 1) {
    effect.textContent = "▲";
    effect.title = "克制对方精灵";
    effect.hidden = false;
    effect.classList.add("up");
  } else if (effectiveness < 1) {
    effect.textContent = "▼";
    effect.title = "对方精灵属性抵抗";
    effect.hidden = false;
    effect.classList.add("down");
  } else {
    effect.hidden = true;
    effect.textContent = "";
    effect.title = "";
  }
}

function updateHudTypes(info, speciesName) {
  loadSpeciesTypes();
  let wrap = info.querySelector(".roco-hud-types");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "roco-hud-types";
    info.append(wrap);
  }
  const types = speciesTypesFor(speciesName);
  wrap.hidden = !types.length;
  wrap.replaceChildren(...types.map(type => {
    const img = document.createElement("img");
    img.className = "roco-hud-type";
    img.src = `/types/${encodeURIComponent(type)}.png`;
    img.alt = type;
    img.title = type;
    return img;
  }));
}

function updateHudGender(side, info, sprite) {
  let gender = info.querySelector(".roco-gender");
  if (!gender) {
    gender = document.createElement("span");
    gender.className = "roco-gender";
    info.querySelector(".name")?.after(gender);
  }
  const symbol = genderForSide(side, info, sprite);
  gender.textContent = symbol;
  gender.hidden = !symbol;
  gender.classList.toggle("male", symbol === "♂");
  gender.classList.toggle("female", symbol === "♀");
}

function fileNameFromUrl(url) {
  if (!url) return "";
  try {
    const path = new URL(url, location.href).pathname;
    return decodeURIComponent(path.slice(path.lastIndexOf("/") + 1));
  } catch {
    return decodeURIComponent(String(url).split(/[?#]/)[0].split("/").pop() || "");
  }
}

function headFileFor(info, sprite) {
  loadSpeciesHeads();
  if (!speciesHeadMap) return "";

  const names = speciesHeadMap.names || {};
  const portraitNames = speciesHeadMap.portraits || {};
  const speciesCandidates = [
    sprite.alt,
    info.querySelector(".name")?.textContent
  ];

  for (const species of speciesCandidates) {
    for (const candidate of nameVariants(species)) {
      if (names[candidate]) return names[candidate];
    }
  }

  const portraitFile = fileNameFromUrl(sprite.currentSrc || sprite.src);
  return portraitNames[portraitFile] || portraitNames[portraitFile.replace(/\.webp$/i, ".png")] || "";
}

function hudPortraitSources(info, sprite) {
  const sources = [];
  const headFile = headFileFor(info, sprite);
  if (headFile) {
    const headPath = `/heads/${encodeURIComponent(headFile)}`;
    sources.push(headPath.replace(/\.png$/i, ".webp"), headPath);
  }
  sources.push(sprite.currentSrc || sprite.src);
  return Array.from(new Set(sources.filter(Boolean)));
}

function updateHudPortrait(portrait, sources, alt) {
  const key = sources.join("|");
  portrait.alt = alt || "";
  if (portrait.dataset.rocoSources === key) return;

  portrait.dataset.rocoSources = key;
  portrait.dataset.rocoSourceIndex = "0";
  portrait.onerror = () => {
    const list = (portrait.dataset.rocoSources || "").split("|").filter(Boolean);
    const next = Number(portrait.dataset.rocoSourceIndex || 0) + 1;
    if (next >= list.length) return;
    portrait.dataset.rocoSourceIndex = String(next);
    portrait.src = list[next];
  };
  portrait.src = sources[0] || "";
}

function enhanceHud(view) {
  view.querySelectorAll(".battle-side").forEach(side => {
    const info = side.querySelector(".spirit-info");
    const sprite = side.querySelector(".battle-spirit img");
    if (!info || !sprite) return;

    let portrait = info.querySelector(".roco-hud-portrait");
    if (!portrait) {
      portrait = document.createElement("img");
      portrait.className = "roco-hud-portrait";
      portrait.alt = sprite.alt || "";
      info.prepend(portrait);
    }
    updateHudPortrait(portrait, hudPortraitSources(info, sprite), sprite.alt || "");

    updateHudTypes(info, sprite.alt || info.querySelector(".name")?.textContent?.trim() || "");
    updateHudGender(side, info, sprite);

    const hpBar = info.querySelector(".bar.hp");
    if (hpBar) {
      let hp = hpBar.querySelector(".roco-hp-text");
      if (!hp) {
        hp = document.createElement("span");
        hp.className = "roco-hp-text";
        hpBar.append(hp);
      }
      hp.textContent = side.classList.contains("p2") ? hpPercentText(info) : hpText(info);
    }

    if (!info.querySelector(".roco-score")) {
      const score = document.createElement("span");
      score.className = "roco-score";
      info.append(score);
    }
    const score = info.querySelector(".roco-score");
    score.textContent = energyCurrentFromInfo(info);
    score.title = `当前能量 ${energyTextFromInfo(info)}`;
  });
}

function enhanceMoves(view) {
  view.querySelectorAll(".battle-controls .move-btn").forEach(button => {
    button.classList.toggle("roco-charge-move", isChargeMove(button));
    button.classList.toggle("roco-hidden-move", isHiddenMove(button));
    button.classList.remove("roco-second-col");
    button.style.removeProperty("--roco-move-row");
    button.style.removeProperty("--roco-move-col");
    button.querySelectorAll(".move-meta .mv-stat").forEach(stat => {
      const cleaned = stat.textContent.replace(/^[^\d-]+/, "").trim();
      if (stat.textContent !== cleaned) stat.textContent = cleaned;
    });
    updateMoveCardDetails(view, button);
  });

  view.querySelectorAll(".battle-controls").forEach(controls => {
    let visibleMoves = Array.from(controls.querySelectorAll(".move-btn:not(.roco-hidden-move)"));
    if (visibleMoves.length === 0) {
      const chargeMove = controls.querySelector(".move-btn.roco-charge-move:not(:disabled)");
      chargeMove?.classList.remove("roco-hidden-move");
      visibleMoves = Array.from(controls.querySelectorAll(".move-btn:not(.roco-hidden-move)"));
    }

    const moveCount = visibleMoves.length;
    visibleMoves.forEach((button, index) => {
      button.classList.toggle("roco-second-col", index >= 4);
      button.style.setProperty("--roco-move-row", String((index % 4) + 1));
      button.style.setProperty("--roco-move-col", String(Math.floor(index / 4) + 1));
    });
    controls.classList.toggle("roco-two-col", moveCount > 4);
    controls.classList.toggle("roco-single-col", moveCount <= 4);
  });
}

function formatBattleInfoLine(text) {
  return String(text || "")
    .replace(/\s*[（(][^（）()]*[）)]/g, "")
    .replace(/([^\s])\s*HP\b/g, "$1 HP")
    .replace(/\bHP\s*(\d+)\s*\/\s*(\d+)\b/g, (_match, currentText, maxText) => {
      const current = Number(currentText);
      const max = Number(maxText);
      if (!Number.isFinite(current) || !Number.isFinite(max) || max <= 0) return "HP --%";
      const percent = Math.max(0, Math.min(100, Math.round(current / max * 100)));
      return `HP ${percent}%`;
    })
    .replace(/\s{2,}/g, " ")
    .trim();
}

function updateMessage(view) {
  const target = view.querySelector(".roco-battle-info-list");
  if (!target) return;

  const logLines = Array.from(view.querySelectorAll(".battle-log .log-line"))
    .map(line => ({ text: formatBattleInfoLine(line.textContent?.trim()), kind: Array.from(line.classList).filter(name => name !== "log-line") }))
    .filter(line => line.text);

  const recentLines = logLines.length ? logLines.slice(-4) : [{ text: "战斗开始。", kind: [] }];
  target.replaceChildren();

  for (const line of recentLines) {
    const row = document.createElement("div");
    row.className = ["roco-battle-info-line", ...line.kind].join(" ");
    row.textContent = line.text;
    target.append(row);
  }
}

function updateEnergy(view) {
  const box = view.querySelector(".roco-energy-box");
  if (box) box.textContent = energyText(view);
}

function textOfAll(root, selector) {
  return Array.from(root.querySelectorAll(selector)).map(node => node.textContent || "").join(" ");
}

function isInitialLeadRequest(view) {
  const promptText = `${textOfAll(view, ".battle-controls .placeholder")} ${textOfAll(view, ".switch-hint")}`;
  const noPlayerActive = !!view.querySelector(".battle-side.p1 .placeholder");
  const logText = textOfAll(view, ".battle-log .log-line");
  const noBattleActionLog = !/第\s*\d+\s*回合|派出|使用|受伤|回复|倒下|胜者|平局/.test(logText);
  const canPickLead = !!view.querySelector(".switch-panel .switch-card.switchable");
  return noPlayerActive && noBattleActionLog && canPickLead && /请从右侧|选一只|必须换宠/.test(promptText);
}

function autoPickInitialLead(view) {
  const shouldPick = isInitialLeadRequest(view);
  view.classList.toggle("roco-auto-lead-pending", shouldPick);
  if (!shouldPick || view.dataset.rocoPickingLead === "1") return false;

  const firstLead = view.querySelector(".switch-panel .switch-card.switchable");
  if (!firstLead) return false;

  view.dataset.rocoPickingLead = "1";
  firstLead.click();
  requestAnimationFrame(() => {
    delete view.dataset.rocoPickingLead;
    view.classList.remove("roco-auto-lead-pending");
    scheduleEnhance();
  });
  return true;
}

function autoSwitchDrawer(view) {
  if (isInitialLeadRequest(view)) {
    view.classList.remove("roco-show-switch");
    return;
  }

  const hintText = Array.from(view.querySelectorAll(".switch-hint")).map(node => node.textContent || "").join(" ");
  const needsSwitch = /必须|选一只|替补/.test(hintText);
  if (needsSwitch) {
    view.classList.remove("roco-show-capture", "roco-show-bag");
    view.classList.add("roco-show-switch");
  } else if (view.dataset.rocoManualDrawer !== "switch") {
    view.classList.remove("roco-show-switch");
  }
}

const SWITCH_TUNER_STORAGE_KEY = "rocorogue.switch-card-tuning";
const SWITCH_TUNER_ENABLED_KEY = "rocorogue.switch-card-tuner-enabled";
const SWITCH_TUNER_HIDDEN_KEY = "rocorogue.switch-card-tuner-hidden";

const SWITCH_TUNER_DEFAULTS = {
  panelLeft: 98,
  panelTop: 263,
  cardSize: 108,
  rowGap: 24,
  gridPadTop: 28,
  gridPadLeft: 52,
  panelExtraRight: 14,
  indexLeft: -52,
  indexTop: 38,
  indexSize: 34,
  indexFont: 22,
  artLeft: 14,
  artTop: 8,
  artSize: 75,
  artScale: 1.26,
  typeLeft: -5,
  typeTop: -1,
  typeSize: 27,
  energyLeft: 3,
  energyTop: 83,
  energyGap: 3,
  energyFont: 18,
  starSize: 13,
  hpLeft: 47,
  hpWidth: 55,
  hpTop: 84,
  barHeight: 15,
  effectRight: 1,
  effectTop: 0,
  effectDownRight: 1,
  effectSize: 20
};

const SWITCH_TUNER_CONTROLS = [
  ["panelLeft", "panel x", 0, 240, 1],
  ["panelTop", "panel y", 120, 360, 1],
  ["cardSize", "card size", 76, 132, 1],
  ["rowGap", "row gap", 0, 24, 1],
  ["gridPadTop", "grid top", 0, 28, 1],
  ["gridPadLeft", "grid left", 24, 80, 1],
  ["indexLeft", "index x", -80, -20, 1],
  ["indexTop", "index y", 0, 80, 1],
  ["indexSize", "index size", 20, 44, 1],
  ["artLeft", "art x", -8, 32, 1],
  ["artTop", "art y", -8, 20, 1],
  ["artSize", "art size", 54, 98, 1],
  ["artScale", "art scale", .9, 1.7, .01],
  ["typeLeft", "type x", -12, 40, 1],
  ["typeTop", "type y", -20, 78, 1],
  ["typeSize", "type size", 16, 42, 1],
  ["energyLeft", "energy x", 0, 56, 1],
  ["energyTop", "energy y", 70, 102, 1],
  ["energyFont", "energy font", 10, 24, 1],
  ["starSize", "star size", 8, 20, 1],
  ["energyGap", "star gap", 0, 10, 1],
  ["hpLeft", "hp x", 34, 82, 1],
  ["hpWidth", "hp width", 32, 72, 1],
  ["hpTop", "hp y", 70, 102, 1],
  ["barHeight", "hp height", 8, 22, 1],
  ["effectRight", "arrow x", -18, 8, 1],
  ["effectTop", "arrow y", -18, 8, 1],
  ["effectDownRight", "red arrow x", -2, 34, 1],
  ["effectSize", "arrow size", 14, 32, 1]
].map(([key, label, min, max, step]) => ({ key, label, min, max, step }));

let switchTunerPanel = null;
let switchTunerStyle = null;
let switchTunerHighlightLayer = null;

function switchTunerEnabled() {
  if (sessionStorage.getItem(SWITCH_TUNER_HIDDEN_KEY) === "1") return false;

  const search = new URLSearchParams(location.search);
  const hashQuery = location.hash.includes("?") ? location.hash.slice(location.hash.indexOf("?") + 1) : "";
  const hashParams = new URLSearchParams(hashQuery);
  return search.has("switchTuner")
    || search.get("rocoSwitchTuner") === "1"
    || hashParams.has("switchTuner")
    || hashParams.get("rocoSwitchTuner") === "1"
    || localStorage.getItem(SWITCH_TUNER_ENABLED_KEY) === "1";
}

function readSwitchTuning() {
  try {
    const stored = JSON.parse(localStorage.getItem(SWITCH_TUNER_STORAGE_KEY) || "{}");
    return { ...SWITCH_TUNER_DEFAULTS, ...(stored.values || stored) };
  } catch {
    return { ...SWITCH_TUNER_DEFAULTS };
  }
}

function persistSwitchTuning(values) {
  localStorage.setItem(SWITCH_TUNER_STORAGE_KEY, JSON.stringify({ values }));
}

function switchTuningPayload(values) {
  return {
    version: 1,
    name: "roco-switch-card-tuning",
    updatedAt: new Date().toISOString(),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1
    },
    values: Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, Number(value)])
    )
  };
}

function numberValue(values, key) {
  const fallback = SWITCH_TUNER_DEFAULTS[key];
  const value = Number(values[key]);
  return Number.isFinite(value) ? value : fallback;
}

function applySwitchTuning(values = readSwitchTuning()) {
  if (!switchTunerStyle) {
    switchTunerStyle = document.createElement("style");
    switchTunerStyle.id = "roco-switch-tuner-style";
    document.head.append(switchTunerStyle);
  }

  const v = key => numberValue(values, key);
  switchTunerStyle.textContent = `
body[data-roco-route="battle"] .battle-view.roco-show-switch .battle-side-panel {
  --roco-switch-card-size: ${v("cardSize")}px;
  --roco-switch-art-size: ${v("artSize")}px;
  --roco-switch-label-height: ${v("barHeight")}px;
  left: ${v("panelLeft")}px;
  top: ${v("panelTop")}px;
  width: calc(${v("gridPadLeft")}px + ${v("cardSize")}px + ${v("panelExtraRight")}px);
}
body[data-roco-route="battle"] .battle-view.roco-show-switch .switch-grid {
  grid-template-columns: ${v("cardSize")}px;
  grid-auto-rows: ${v("cardSize")}px;
  row-gap: ${v("rowGap")}px;
  padding-top: ${v("gridPadTop")}px;
  padding-left: ${v("gridPadLeft")}px;
}
body[data-roco-route="battle"] .battle-view.roco-show-switch .switch-card {
  width: ${v("cardSize")}px;
  height: ${v("cardSize")}px;
  min-height: ${v("cardSize")}px;
}
body[data-roco-route="battle"] .battle-view.roco-show-switch .switch-card:before {
  left: ${v("indexLeft")}px;
  top: ${v("indexTop")}px;
  width: ${v("indexSize")}px;
  height: ${v("indexSize")}px;
  font-size: ${v("indexFont")}px;
}
body[data-roco-route="battle"] .battle-view.roco-show-switch .switch-art {
  left: ${v("artLeft")}px;
  top: ${v("artTop")}px;
  width: ${v("artSize")}px;
  height: ${v("artSize")}px;
}
body[data-roco-route="battle"] .battle-view.roco-show-switch .switch-art img {
  transform: scale(${v("artScale")});
}
body[data-roco-route="battle"] .battle-view.roco-show-switch .switch-types {
  left: ${v("typeLeft")}px;
  top: ${v("typeTop")}px;
}
body[data-roco-route="battle"] .battle-view.roco-show-switch .switch-type-icon {
  width: ${v("typeSize")}px;
  height: ${v("typeSize")}px;
}
body[data-roco-route="battle"] .battle-view.roco-show-switch .switch-energy-chip {
  left: ${v("energyLeft")}px;
  top: ${v("energyTop")}px;
  gap: ${v("energyGap")}px;
  height: ${v("barHeight")}px;
  font-size: ${v("energyFont")}px;
  line-height: ${v("barHeight")}px;
}
body[data-roco-route="battle"] .battle-view.roco-show-switch .switch-energy-chip:before {
  flex: 0 0 ${v("starSize")}px;
  width: ${v("starSize")}px;
  height: ${v("starSize")}px;
}
body[data-roco-route="battle"] .battle-view.roco-show-switch .switch-info {
  left: ${v("hpLeft")}px;
  right: auto;
  top: ${v("hpTop")}px;
  width: ${v("hpWidth")}px;
}
body[data-roco-route="battle"] .battle-view.roco-show-switch .switch-info .bar {
  width: 100%;
  height: ${v("barHeight")}px;
}
body[data-roco-route="battle"] .battle-view.roco-show-switch .switch-effect {
  right: ${v("effectRight")}px;
  top: ${v("effectTop")}px;
  width: ${v("effectSize")}px;
  height: ${v("effectSize")}px;
  font-size: ${Math.max(10, v("effectSize") - 8)}px;
}
body[data-roco-route="battle"] .battle-view.roco-show-switch .switch-effect-down {
  right: ${v("effectDownRight")}px;
}`;
}

function downloadSwitchTuning(payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2) + "\n"], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "switch-card-tuning.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function saveSwitchTuning(values) {
  const payload = switchTuningPayload(values);
  try {
    const response = await fetch("/__roco_switch_tuning", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload, null, 2)
    });
    if (response.ok) return await response.json();
  } catch {}

  downloadSwitchTuning(payload);
  return { ok: true, path: "switch-card-tuning.json" };
}

function clearSwitchTunerHighlight() {
  switchTunerHighlightLayer?.replaceChildren();
}

function ensureSwitchTunerHighlightLayer() {
  if (switchTunerHighlightLayer?.isConnected) return switchTunerHighlightLayer;

  switchTunerHighlightLayer = document.createElement("div");
  switchTunerHighlightLayer.className = "roco-switch-tuner-highlight-layer";
  document.body.append(switchTunerHighlightLayer);
  return switchTunerHighlightLayer;
}

function addSwitchTunerHighlight(rect, label = "") {
  if (!rect || rect.width <= 0 || rect.height <= 0) return;

  const layer = ensureSwitchTunerHighlightLayer();
  const marker = document.createElement("div");
  marker.className = "roco-switch-tuner-highlight";
  marker.style.left = `${Math.round(rect.left)}px`;
  marker.style.top = `${Math.round(rect.top)}px`;
  marker.style.width = `${Math.round(rect.width)}px`;
  marker.style.height = `${Math.round(rect.height)}px`;
  if (label) marker.dataset.label = label;
  layer.append(marker);
}

function switchTunerTargetRect(key, values, view) {
  const card = view.querySelector(".switch-card:not(.active)") || view.querySelector(".switch-card");
  const cardRect = card?.getBoundingClientRect();
  const v = name => numberValue(values, name);
  const bySelector = selector => view.querySelector(selector)?.getBoundingClientRect();
  const byCardSelector = selector => card?.querySelector(selector)?.getBoundingClientRect();

  if (key.startsWith("panel")) return bySelector(".battle-side-panel");
  if (key.startsWith("grid") || key === "rowGap") return bySelector(".switch-grid");
  if (key === "cardSize" || key === "panelExtraRight") return cardRect;
  if (key.startsWith("index") && cardRect) {
    return {
      left: cardRect.left + v("indexLeft"),
      top: cardRect.top + v("indexTop"),
      width: v("indexSize"),
      height: v("indexSize")
    };
  }
  if (key.startsWith("art")) return byCardSelector(".switch-art img") || byCardSelector(".switch-art");
  if (key.startsWith("type")) return byCardSelector(".switch-type-icon") || byCardSelector(".switch-types");
  if (key.startsWith("energy")) return byCardSelector(".switch-energy-chip");
  if (key.startsWith("star")) {
    const energyRect = byCardSelector(".switch-energy-chip");
    if (!energyRect) return null;
    const size = v("starSize");
    return {
      left: energyRect.left,
      top: energyRect.top + (energyRect.height - size) / 2,
      width: size,
      height: size
    };
  }
  if (key.startsWith("hp") || key === "barHeight") return byCardSelector(".switch-info .bar");
  if ((key.startsWith("effect") || key.startsWith("arrow")) && cardRect) {
    const size = v("effectSize");
    const right = key === "effectDownRight" ? v("effectDownRight") : v("effectRight");
    return {
      left: cardRect.right - right - size,
      top: cardRect.top + v("effectTop"),
      width: size,
      height: size
    };
  }

  return cardRect;
}

function highlightSwitchTunerTarget(key, values = readSwitchTuning()) {
  const view = document.querySelector(".battle-view");
  if (!view) return;
  if (!view.classList.contains("roco-show-switch")) openSwitchDrawerForTuning(view);

  clearSwitchTunerHighlight();
  const rect = switchTunerTargetRect(key, values, view);
  const control = SWITCH_TUNER_CONTROLS.find(item => item.key === key);
  addSwitchTunerHighlight(rect, control?.label || key);
}

function ensureSwitchTuner(view) {
  if (!switchTunerEnabled()) {
    switchTunerPanel?.remove();
    switchTunerPanel = null;
    clearSwitchTunerHighlight();
    return;
  }

  const values = readSwitchTuning();
  applySwitchTuning(values);
  if (switchTunerPanel?.isConnected) return;

  const panel = document.createElement("section");
  panel.className = "roco-switch-tuner";
  const title = document.createElement("div");
  title.className = "roco-switch-tuner-title";
  title.textContent = "Switch card tuner";

  const controls = document.createElement("div");
  controls.className = "roco-switch-tuner-controls";
  const inputs = new Map();
  let activeKey = null;

  const syncInputs = key => {
    const pair = inputs.get(key);
    if (!pair) return;
    pair.range.value = String(values[key]);
    pair.number.value = String(values[key]);
  };

  const setValue = (key, rawValue) => {
    const control = SWITCH_TUNER_CONTROLS.find(item => item.key === key);
    const next = Number(rawValue);
    if (!control || !Number.isFinite(next)) return;
    values[key] = Math.min(control.max, Math.max(control.min, next));
    syncInputs(key);
    persistSwitchTuning(values);
    applySwitchTuning(values);
    highlightSwitchTunerTarget(key, values);
  };

  const activateRow = (row, key) => {
    activeKey = key;
    for (const node of controls.querySelectorAll(".roco-switch-tuner-row.active")) {
      node.classList.remove("active");
    }
    row.classList.add("active");
    highlightSwitchTunerTarget(key, values);
  };

  for (const control of SWITCH_TUNER_CONTROLS) {
    const row = document.createElement("div");
    row.className = "roco-switch-tuner-row";

    const name = document.createElement("span");
    name.textContent = control.label;

    const range = document.createElement("input");
    range.type = "range";
    range.min = String(control.min);
    range.max = String(control.max);
    range.step = String(control.step);
    range.value = String(values[control.key]);
    range.addEventListener("input", () => setValue(control.key, range.value));

    const number = document.createElement("input");
    number.type = "number";
    number.min = String(control.min);
    number.max = String(control.max);
    number.step = String(control.step);
    number.value = String(values[control.key]);
    number.addEventListener("input", () => setValue(control.key, number.value));

    const resetOne = document.createElement("button");
    resetOne.type = "button";
    resetOne.className = "roco-switch-tuner-reset";
    resetOne.textContent = "reset";
    resetOne.title = `reset ${control.label}`;
    resetOne.addEventListener("click", () => {
      setValue(control.key, SWITCH_TUNER_DEFAULTS[control.key]);
      status.textContent = `reset: ${control.label}`;
    });

    row.addEventListener("pointerenter", () => activateRow(row, control.key));
    row.addEventListener("focusin", () => activateRow(row, control.key));

    inputs.set(control.key, { range, number });
    row.append(name, range, number, resetOne);
    controls.append(row);
  }

  const actions = document.createElement("div");
  actions.className = "roco-switch-tuner-actions";

  const status = document.createElement("div");
  status.className = "roco-switch-tuner-status";

  const openSwitch = document.createElement("button");
  openSwitch.type = "button";
  openSwitch.textContent = "open switch";
  openSwitch.addEventListener("click", () => {
    openSwitchDrawerForTuning(view);
  });

  const reset = document.createElement("button");
  reset.type = "button";
  reset.textContent = "reset";
  reset.addEventListener("click", () => {
    Object.assign(values, SWITCH_TUNER_DEFAULTS);
    for (const key of Object.keys(values)) syncInputs(key);
    persistSwitchTuning(values);
    applySwitchTuning(values);
    if (activeKey) highlightSwitchTunerTarget(activeKey, values);
    status.textContent = "reset";
  });

  const save = document.createElement("button");
  save.type = "button";
  save.textContent = "save json";
  save.addEventListener("click", async () => {
    persistSwitchTuning(values);
    const result = await saveSwitchTuning(values);
    status.textContent = `saved: ${result.path}`;
  });

  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "hide";
  close.addEventListener("click", () => {
    window.rocoSwitchTuner.close();
  });

  actions.append(openSwitch, reset, save, close);
  panel.append(title, controls, actions, status);
  document.body.append(panel);
  switchTunerPanel = panel;
}

window.rocoSwitchTuner = {
  open() {
    sessionStorage.removeItem(SWITCH_TUNER_HIDDEN_KEY);
    localStorage.setItem(SWITCH_TUNER_ENABLED_KEY, "1");
    scheduleEnhance();
  },
  close() {
    sessionStorage.setItem(SWITCH_TUNER_HIDDEN_KEY, "1");
    localStorage.removeItem(SWITCH_TUNER_ENABLED_KEY);
    switchTunerPanel?.remove();
    switchTunerPanel = null;
  },
  toggle() {
    if (switchTunerEnabled()) {
      this.close();
    } else {
      this.open();
    }
  },
  openSwitch() {
    const view = document.querySelector(".battle-view");
    if (view) openSwitchDrawerForTuning(view);
  },
  toggleSwitch() {
    const view = document.querySelector(".battle-view");
    if (view) toggleSwitchDrawerForTuning(view);
  },
  values: readSwitchTuning,
  apply(values) {
    const next = { ...readSwitchTuning(), ...values };
    persistSwitchTuning(next);
    applySwitchTuning(next);
  },
  save() {
    return saveSwitchTuning(readSwitchTuning());
  }
};

function openSwitchDrawerForTuning(view) {
  view.dataset.rocoManualDrawer = "switch";
  view.classList.remove("roco-show-report", "roco-show-capture", "roco-show-bag");
  view.classList.add("roco-show-switch");
  syncSwitchCards(view);
  syncSwitchConfirm(view);
}

function closeSwitchDrawerForTuning(view) {
  delete view.dataset.rocoManualDrawer;
  clearSwitchConfirm(view);
  view.classList.remove("roco-show-switch");
}

function toggleSwitchDrawerForTuning(view) {
  if (view.classList.contains("roco-show-switch") && view.dataset.rocoManualDrawer === "switch") {
    closeSwitchDrawerForTuning(view);
    return;
  }
  openSwitchDrawerForTuning(view);
}

function handleSwitchTunerShortcut(event) {
  if (event.defaultPrevented || event.repeat || routeName() !== "battle") return;

  if (event.key === "F8") {
    event.preventDefault();
    window.rocoSwitchTuner.toggle();
    return;
  }

  if (event.key === "F9") {
    const view = document.querySelector(".battle-view");
    if (!view) return;
    event.preventDefault();
    toggleSwitchDrawerForTuning(view);
  }
}

function enhanceBattle() {
  if (routeName() !== "battle") return;
  const view = document.querySelector(".battle-view");
  if (!view) return;
  ensureOverlay(view);
  if (autoPickInitialLead(view)) return;
  enhanceHud(view);
  enhanceMoves(view);
  syncSwitchCards(view);
  updateMessage(view);
  updateEnergy(view);
  syncBagPanel(view);
  syncCapturePanel(view);
  autoSwitchDrawer(view);
  syncSwitchConfirm(view);
  syncTargeting(view);
  ensureSwitchTuner(view);
}

let scheduled = false;
function scheduleEnhance() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    syncRoute();
    enhanceBattle();
  });
}

syncRoute();
scheduleEnhance();
window.addEventListener("hashchange", scheduleEnhance);
window.addEventListener("keydown", handleSwitchTunerShortcut);

new MutationObserver(scheduleEnhance).observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true
});
