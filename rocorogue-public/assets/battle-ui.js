const ACTIONS = [
  { id: "run", label: "逃跑" },
  { id: "bag", label: "背包" },
  { id: "capture", label: "捕捉" },
  { id: "switch", label: "更换" },
  { id: "skill", label: "技能" }
];

const CAPTURE_BALLS = [
  { id: "frost", label: "冰晶球", count: 924, image: null, colors: ["#4fd3ff", "#206ee9"] },
  { id: "arcane", label: "秘法球", count: 1646, image: null, colors: ["#f27cff", "#7530d4"] },
  { id: "flora", label: "花叶球", count: 1751, image: null, colors: ["#67e76c", "#159b47"] },
  { id: "aqua", label: "水纹球", count: 36, image: null, colors: ["#7df6ff", "#2c9fd7"] },
  { id: "prism", label: "棱星彩球", count: 90, image: null, colors: ["#ffd25a", "#7a6cff"] },
  { id: "sun", label: "日冕球", count: 98, image: null, colors: ["#ffc64c", "#94602b"] },
  { id: "shadow", label: "幽影球", count: 64, image: null, colors: ["#5650d8", "#1e2557"] },
  { id: "ember", label: "焰心球", count: 122, image: null, colors: ["#ff8a3a", "#d63b27"] }
];

const BAG_ITEMS = [
  { id: "potion", label: "回复药剂", count: 5, image: null, colors: ["#4fe8ff", "#177cc7"] },
  { id: "energy", label: "能量药剂", count: 3, image: null, colors: ["#b56dff", "#5a32c8"] },
  { id: "guard", label: "护盾药剂", count: 2, image: null, colors: ["#78ed92", "#1f9a57"] },
  { id: "cleanse", label: "净化药剂", count: 4, image: null, colors: ["#ffe071", "#d28a22"] },
  { id: "focus", label: "专注药剂", count: 1, image: null, colors: ["#86c5ff", "#2d60d6"] },
  { id: "empty", label: "空槽位", count: 0, image: null, colors: ["#6e737d", "#2f333a"], empty: true }
];

const SPECIES_TYPES_URL = "/assets/battle-ui/species-types.json";
const SPECIES_HEADS_URL = "/assets/battle-ui/species-heads.json";
let speciesTypeMap = null;
let speciesTypesLoading = false;
let speciesHeadMap = null;
let speciesHeadsLoading = false;

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

function toggleDrawer(view, name) {
  const report = name === "report";
  const switcher = name === "switch";
  const capture = name === "capture";
  const bag = name === "bag";
  const nextReport = report && !view.classList.contains("roco-show-report");
  const nextSwitch = switcher && !view.classList.contains("roco-show-switch");
  const nextCapture = capture && !view.classList.contains("roco-show-capture");
  const nextBag = bag && !view.classList.contains("roco-show-bag");
  view.classList.remove("roco-show-report", "roco-show-switch", "roco-show-capture", "roco-show-bag");
  delete view.dataset.rocoManualDrawer;
  if (nextReport) view.classList.add("roco-show-report");
  if (nextSwitch) view.classList.add("roco-show-switch");
  if (nextCapture) view.classList.add("roco-show-capture");
  if (nextBag) view.classList.add("roco-show-bag");
  if (nextReport) view.dataset.rocoManualDrawer = "report";
  if (nextSwitch) view.dataset.rocoManualDrawer = "switch";
  if (nextCapture) view.dataset.rocoManualDrawer = "capture";
  if (nextBag) view.dataset.rocoManualDrawer = "bag";
  if (!nextSwitch) clearSwitchConfirm(view);
}

function makeCaptureBallButton(ball) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "roco-ball-card";
  button.dataset.ballId = ball.id;
  button.title = `${ball.label} × ${ball.count}`;
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
  count.textContent = String(ball.count);

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

  button.append(icon, count);
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
}

function confirmSwitchSelection(view) {
  const card = view.__rocoPendingSwitchCard;
  clearSwitchConfirm(view);
  if (!card?.isConnected || !card.classList.contains("switchable")) return;

  view.dataset.rocoSwitchConfirmBypass = "1";
  card.click();
  setTimeout(() => {
    delete view.dataset.rocoSwitchConfirmBypass;
  }, 0);
}

function showSwitchConfirm(view, card) {
  ensureSwitchConfirm(view);
  clearSwitchConfirm(view);

  const panel = view.querySelector(".roco-switch-confirm");
  if (!panel) return;

  const preview = panel.querySelector(".roco-switch-confirm-preview");
  const clone = card.cloneNode(true);
  clone.classList.remove("switchable", "roco-switch-selected");
  clone.classList.add("roco-switch-confirm-card");
  clone.removeAttribute("title");
  clone.querySelectorAll("[id]").forEach(node => node.removeAttribute("id"));
  preview.replaceChildren(clone);

  const name = switchCardDisplayName(card);
  panel.querySelector(".roco-switch-confirm-name").textContent = name;
  view.__rocoPendingSwitchCard = card;
  card.classList.add("roco-switch-selected");
  view.classList.add("roco-switch-confirm-open");
  panel.hidden = false;
  panel.classList.add("active");
  panel.querySelector(".roco-switch-confirm-ok")?.focus?.();
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
    if (action === "run") {
      clearSwitchConfirm(view);
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
}

function ensureOverlay(view) {
  view.querySelector(".roco-side-shortcuts")?.remove();

  if (!view.querySelector(".roco-battle-message")) {
    const msg = document.createElement("div");
    msg.className = "roco-battle-message";
    view.append(msg);
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
      hp.textContent = hpText(info);
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
  });

  view.querySelectorAll(".battle-controls").forEach(controls => {
    const visibleMoves = Array.from(controls.querySelectorAll(".move-btn:not(.roco-hidden-move)"));
    const moveCount = visibleMoves.length;
    visibleMoves.forEach((button, index) => button.classList.toggle("roco-second-col", index >= 4));
    controls.classList.toggle("roco-two-col", moveCount > 4);
    controls.classList.toggle("roco-single-col", moveCount <= 4);
  });

  view.querySelectorAll(".move-btn .move-meta .mv-stat").forEach(stat => {
    stat.textContent = stat.textContent.replace(/^[^\d-]+/, "").trim();
  });
}

function updateMessage(view) {
  const target = view.querySelector(".roco-battle-message");
  if (!target) return;
  const enemy = view.querySelector(".battle-side.p2 .spirit-info .name")?.textContent?.trim();
  const lastLine = Array.from(view.querySelectorAll(".battle-log .log-line")).at(-1)?.textContent?.trim();
  target.textContent = enemy ? `${enemy}正对着你。` : (lastLine || "战斗开始。");
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

function enhanceBattle() {
  if (routeName() !== "battle") return;
  const view = document.querySelector(".battle-view");
  if (!view) return;
  ensureOverlay(view);
  if (autoPickInitialLead(view)) return;
  enhanceHud(view);
  enhanceMoves(view);
  updateMessage(view);
  updateEnergy(view);
  autoSwitchDrawer(view);
  syncSwitchConfirm(view);
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

new MutationObserver(scheduleEnhance).observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true
});
