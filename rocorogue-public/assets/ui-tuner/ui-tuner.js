(() => {
  const config = window.__ROCO_UI_TUNER__;
  if (!config?.enabled) return;

  const STORAGE_KEY = "roco.uiTuner.layout.v1";
  const DEFAULT_TRANSFORM = Object.freeze({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    origin: "center center",
  });
  const BUILT_SOURCE = Object.freeze({
    file: "rocorogue-public/assets/index-xu9RZIac.js",
    styleFile: "rocorogue-public/assets/index-Oin_zZIo.css",
  });

  const restoredLayout = loadStoredLayout();
  const restoredItems = restoredLayout?.items && typeof restoredLayout.items === "object"
    ? restoredLayout.items
    : {};

  const liveItems = new Map();
  const itemState = new Map();
  let active = false;
  let selectedId = null;
  let hoverId = null;
  let dragState = null;
  let overlayFrame = 0;
  let toastTimer = 0;
  let undoStack = [];
  let redoStack = [];

  const layer = document.createElement("div");
  layer.className = "roco-ui-tuner-layer";
  layer.setAttribute("aria-hidden", "true");

  const hoverBox = document.createElement("div");
  hoverBox.className = "roco-ui-tuner-hover";

  const selectedBox = document.createElement("div");
  selectedBox.className = "roco-ui-tuner-selected";

  const tip = document.createElement("div");
  tip.className = "roco-ui-tuner-tip";

  const toastEl = document.createElement("div");
  toastEl.className = "roco-ui-tuner-toast";

  layer.append(hoverBox, selectedBox, tip, toastEl);

  function init() {
    document.body.append(layer);
    scanUiElements();

    const observer = new MutationObserver(() => {
      scanUiElements();
      scheduleOverlay();
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-ui-id", "class"],
    });

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("pointerup", onPointerEnd, true);
    document.addEventListener("pointercancel", onPointerEnd, true);
    document.addEventListener("wheel", onWheel, { capture: true, passive: false });
    window.addEventListener("resize", scheduleOverlay);
    window.addEventListener("scroll", scheduleOverlay, true);
  }

  function loadStoredLayout() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function finiteNumber(value, fallback) {
    const next = Number(value);
    return Number.isFinite(next) ? next : fallback;
  }

  function round(value) {
    return Math.round(finiteNumber(value, 0) * 1000) / 1000;
  }

  function normalizeTransform(input = {}) {
    return {
      x: round(input.x ?? DEFAULT_TRANSFORM.x),
      y: round(input.y ?? DEFAULT_TRANSFORM.y),
      scaleX: Math.max(0.05, round(input.scaleX ?? DEFAULT_TRANSFORM.scaleX)),
      scaleY: Math.max(0.05, round(input.scaleY ?? DEFAULT_TRANSFORM.scaleY)),
      origin: typeof input.origin === "string" && input.origin.trim()
        ? input.origin
        : DEFAULT_TRANSFORM.origin,
    };
  }

  function normalizeDeleted(input) {
    return input === true;
  }

  function cloneTransform(transform) {
    return normalizeTransform(transform);
  }

  function cloneItemState(state) {
    return {
      transform: cloneTransform(state?.transform),
      deleted: normalizeDeleted(state?.deleted),
    };
  }

  function rectToObject(rect) {
    return {
      x: round(rect.x),
      y: round(rect.y),
      width: round(rect.width),
      height: round(rect.height),
    };
  }

  function sourceHintFor(element) {
    return {
      file: element.dataset.uiSourceFile || null,
      component: element.dataset.uiSourceComponent || null,
      styleFile: element.dataset.uiSourceStyleFile || null,
    };
  }

  function markElement(element, meta) {
    if (!element || element.dataset.uiId) return;
    element.dataset.uiId = meta.id;
    element.dataset.uiLabel = meta.label || meta.id;
    element.dataset.uiSourceFile = meta.file || BUILT_SOURCE.file;
    element.dataset.uiSourceComponent = meta.component || "unknown";
    element.dataset.uiSourceStyleFile = meta.styleFile || BUILT_SOURCE.styleFile;
    element.dataset.uiSource = `${element.dataset.uiSourceFile}:${element.dataset.uiSourceComponent}`;
  }

  function markFirst(selector, meta) {
    markElement(document.querySelector(selector), meta);
  }

  function markIndexed(selector, idPrefix, labelPrefix, component, options = {}) {
    document.querySelectorAll(selector).forEach((element, index) => {
      markElement(element, {
        id: `${idPrefix}.${index}`,
        label: `${labelPrefix} ${index + 1}`,
        component,
        file: options.file,
        styleFile: options.styleFile,
      });
    });
  }

  function markRouteElements() {
    markFirst(".topbar", {
      id: "nav.topBar",
      label: "顶部导航栏",
      file: "rocorogue-public/index.html",
      component: "topbar",
      styleFile: BUILT_SOURCE.styleFile,
    });
    markFirst(".brand", {
      id: "nav.brand",
      label: "品牌区",
      file: "rocorogue-public/index.html",
      component: "brand",
      styleFile: BUILT_SOURCE.styleFile,
    });
    markFirst("#tabs", {
      id: "nav.tabs",
      label: "顶部标签组",
      file: "rocorogue-public/index.html",
      component: "tabs",
      styleFile: BUILT_SOURCE.styleFile,
    });
    markFirst("#app", {
      id: "app.root",
      label: "应用根容器",
      file: "rocorogue-public/index.html",
      component: "app",
      styleFile: BUILT_SOURCE.styleFile,
    });

    markFirst(".dex-grid", { id: "dex.root", label: "图鉴页面", component: "lg" });
    markFirst(".dex-list-panel", { id: "dex.listPanel", label: "图鉴列表面板", component: "lg" });
    markFirst(".dex-detail-panel", { id: "dex.detailPanel", label: "图鉴详情面板", component: "lg" });
    markFirst(".spec-head", { id: "dex.detailHeader", label: "图鉴详情头部", component: "lg" });
    markFirst(".spec-art", { id: "dex.detailAvatar", label: "图鉴精灵形象", component: "lg" });

    markFirst(".team-layout", { id: "team.root", label: "队伍编辑页面", component: "Se" });
    markIndexed(".team-slot", "team.slot", "队伍槽位", "Se");
    markIndexed(".slot-stats-panel", "team.slotStatsPanel", "队伍数值面板", "Se");

    markFirst(".battle-view", {
      id: "battle.root",
      label: "战斗页面",
      component: "Zu",
      styleFile: "rocorogue-public/assets/battle-ui.css",
    });
    markFirst(".battle-field", {
      id: "battle.field",
      label: "战斗场地",
      component: "Zu",
      styleFile: "rocorogue-public/assets/battle-ui.css",
    });
    markFirst(".battle-side-panel", {
      id: "battle.sidePanel",
      label: "战斗侧栏",
      component: "Zu",
      styleFile: "rocorogue-public/assets/battle-ui.css",
    });
    markFirst(".battle-log", {
      id: "battle.log",
      label: "战斗日志",
      component: "Zu",
      styleFile: "rocorogue-public/assets/battle-ui.css",
    });
    markFirst(".switch-panel", {
      id: "battle.switchPanel",
      label: "替换精灵面板",
      component: "qu",
      styleFile: "rocorogue-public/assets/battle-ui.css",
    });
    markIndexed(".switch-card", "battle.switchCard", "替换精灵卡片", "qu", {
      styleFile: "rocorogue-public/assets/battle-ui.css",
    });
    markIndexed(".move-btn", "battle.moveButton", "技能按钮", "Du", {
      styleFile: "rocorogue-public/assets/battle-ui.css",
    });

    markFirst(".modal-overlay", { id: "modal.overlay", label: "弹窗遮罩", component: "modal" });
    markFirst(".modal-card", { id: "modal.card", label: "弹窗卡片", component: "modal" });
    markIndexed(".modal-actions button", "modal.action", "弹窗按钮", "modal");
  }

  function scanUiElements() {
    markRouteElements();

    for (const [id, item] of liveItems) {
      if (!item.element.isConnected) liveItems.delete(id);
    }

    document.querySelectorAll("[data-ui-id]").forEach((element) => {
      if (element.closest(".roco-ui-tuner-layer")) return;
      registerElement(element);
    });

    if (selectedId && !liveItems.has(selectedId)) selectedId = null;
    if (hoverId && !liveItems.has(hoverId)) hoverId = null;
  }

  function registerElement(element) {
    const id = String(element.dataset.uiId || "").trim();
    if (!id) return;

    if (!Object.prototype.hasOwnProperty.call(element.dataset, "uiTunerBaseTransform")) {
      element.dataset.uiTunerBaseTransform = element.style.transform || "";
    }
    if (!Object.prototype.hasOwnProperty.call(element.dataset, "uiTunerBaseVisibility")) {
      element.dataset.uiTunerBaseVisibility = element.style.visibility || "";
    }

    const rect = element.getBoundingClientRect();
    liveItems.set(id, { id, element });

    const restored = restoredItems[id];
    if (!itemState.has(id)) {
      itemState.set(id, {
        transform: normalizeTransform(restored?.transform),
        deleted: normalizeDeleted(restored?.deleted),
        boundsBefore: rectToObject(rect),
      });
    } else {
      const state = itemState.get(id);
      if ((!state.boundsBefore?.width || !state.boundsBefore?.height) && rect.width && rect.height) {
        state.boundsBefore = rectToObject(rect);
      }
    }

    applyTransform(id);
  }

  function transformFor(id) {
    if (!itemState.has(id)) {
      itemState.set(id, {
        transform: cloneTransform(DEFAULT_TRANSFORM),
        deleted: false,
        boundsBefore: { x: 0, y: 0, width: 0, height: 0 },
      });
    }
    return itemState.get(id).transform;
  }

  function applyTransform(id) {
    const item = liveItems.get(id);
    if (!item) return;

    const transform = transformFor(id);
    const baseTransform = item.element.dataset.uiTunerBaseTransform || "";
    const state = itemState.get(id);
    const previewTransform = `translate(${round(transform.x)}px, ${round(transform.y)}px) scale(${round(transform.scaleX)}, ${round(transform.scaleY)})`;
    item.element.style.transformOrigin = transform.origin;
    item.element.style.transform = [baseTransform, previewTransform].filter(Boolean).join(" ");
    item.element.style.visibility = state?.deleted
      ? "hidden"
      : (item.element.dataset.uiTunerBaseVisibility || "");
  }

  function applyAllTransforms() {
    for (const id of liveItems.keys()) applyTransform(id);
    scheduleOverlay();
  }

  function visibleAtPoint(element, x, y) {
    if (!element?.isConnected || element.closest(".roco-ui-tuner-layer")) return false;

    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return false;

    const style = getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity || 1) !== 0;
  }

  function elementDepth(element) {
    let depth = 0;
    for (let node = element; node && node !== document.documentElement; node = node.parentElement) {
      depth += 1;
    }
    return depth;
  }

  function geometryTargetFromPoint(x, y) {
    const elements = Array.from(document.querySelectorAll("[data-ui-id]"));
    const candidates = [];

    elements.forEach((element, order) => {
      if (!(element instanceof Element) || !visibleAtPoint(element, x, y)) return;
      const rect = element.getBoundingClientRect();
      candidates.push({
        element,
        area: rect.width * rect.height,
        depth: elementDepth(element),
        order,
      });
    });

    candidates.sort((left, right) => {
      if (left.area !== right.area) return left.area - right.area;
      if (left.depth !== right.depth) return right.depth - left.depth;
      return right.order - left.order;
    });

    return candidates[0]?.element || null;
  }

  function targetFromPoint(x, y) {
    const geometryTarget = geometryTargetFromPoint(x, y);
    if (geometryTarget) return geometryTarget;

    const stack = document.elementsFromPoint(x, y);
    for (const element of stack) {
      if (!(element instanceof Element)) continue;
      if (element.closest(".roco-ui-tuner-layer")) continue;
      const target = element.closest("[data-ui-id]");
      if (target && document.documentElement.contains(target)) return target;
    }
    return null;
  }

  function pointInsideElement(element, x, y) {
    const rect = element.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function selectId(id) {
    selectedId = id && liveItems.has(id) ? id : null;
    scheduleOverlay();
  }

  function setHoverId(id) {
    const next = id && liveItems.has(id) ? id : null;
    if (next === hoverId) return;
    hoverId = next;
    scheduleOverlay();
  }

  function toggleActive() {
    active = !active;
    document.body.dataset.rocoUiTunerActive = active ? "true" : "false";
    if (!active) {
      hoverId = null;
      dragState = null;
    }
    showToast(active ? "调节开启" : "调节关闭");
    scheduleOverlay();
  }

  function onPointerDown(event) {
    if (!active || event.button !== 0) return;

    scanUiElements();
    const target = targetFromPoint(event.clientX, event.clientY);
    event.preventDefault();
    event.stopPropagation();

    if (!target) {
      selectId(null);
      return;
    }

    const id = target.dataset.uiId;
    selectId(id);

    const scale = screenScaleFor(target, id);
    dragState = {
      id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startTransform: cloneTransform(transformFor(id)),
      screenScaleX: scale.x,
      screenScaleY: scale.y,
      moved: false,
    };
  }

  function onPointerMove(event) {
    if (!active) return;

    if (!dragState) {
      const target = targetFromPoint(event.clientX, event.clientY);
      setHoverId(target?.dataset.uiId || null);
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const dx = (event.clientX - dragState.startClientX) / dragState.screenScaleX;
    const dy = (event.clientY - dragState.startClientY) / dragState.screenScaleY;
    if (!dragState.moved && (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01)) {
      recordHistory();
      dragState.moved = true;
    }

    const transform = transformFor(dragState.id);
    transform.x = round(dragState.startTransform.x + dx);
    transform.y = round(dragState.startTransform.y + dy);
    applyTransform(dragState.id);
    scheduleOverlay();
  }

  function onPointerEnd(event) {
    if (!dragState) return;
    event.preventDefault();
    event.stopPropagation();
    dragState = null;
  }

  function onWheel(event) {
    if (!active || !selectedId) return;

    const selected = liveItems.get(selectedId)?.element;
    if (!selected || !pointInsideElement(selected, event.clientX, event.clientY)) return;

    event.preventDefault();
    event.stopPropagation();

    recordHistory();
    const direction = event.deltaY < 0 ? 1 : -1;
    scaleSelected(direction, event);
  }

  function onKeyDown(event) {
    const key = event.key.toLowerCase();

    if (event.ctrlKey && event.shiftKey && key === "u") {
      event.preventDefault();
      event.stopPropagation();
      toggleActive();
      return;
    }

    if (!active) return;

    if (event.ctrlKey && key === "s") {
      event.preventDefault();
      event.stopPropagation();
      void saveDraft();
      return;
    }

    if (event.ctrlKey && key === "e") {
      event.preventDefault();
      event.stopPropagation();
      exportLayout();
      return;
    }

    if (event.ctrlKey && event.shiftKey && key === "z") {
      event.preventDefault();
      event.stopPropagation();
      redo();
      return;
    }

    if (event.ctrlKey && key === "z") {
      event.preventDefault();
      event.stopPropagation();
      undo();
      return;
    }

    if (event.ctrlKey && key === "y") {
      event.preventDefault();
      event.stopPropagation();
      redo();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      selectId(null);
      return;
    }

    if (event.key === "Delete" || event.key === "Backspace") {
      if (!selectedId || event.ctrlKey || event.metaKey || event.altKey) return;
      event.preventDefault();
      event.stopPropagation();
      deleteSelected();
      return;
    }

    if (event.key.startsWith("Arrow")) {
      if (!selectedId) return;
      event.preventDefault();
      event.stopPropagation();
      nudgeSelected(event.key, event);
      return;
    }

    if (event.code === "BracketLeft" || event.code === "BracketRight") {
      if (!selectedId) return;
      event.preventDefault();
      event.stopPropagation();
      recordHistory();
      scaleSelected(event.code === "BracketRight" ? 1 : -1, event);
    }
  }

  function keyboardStep(event) {
    if (event.altKey) return 0.25;
    if (event.shiftKey) return 10;
    return 1;
  }

  function scaleStep(event) {
    if (event.altKey) return 0.001;
    if (event.shiftKey) return 0.05;
    return 0.01;
  }

  function nudgeSelected(key, event) {
    const transform = transformFor(selectedId);
    const step = keyboardStep(event);
    recordHistory();

    if (key === "ArrowLeft") transform.x = round(transform.x - step);
    if (key === "ArrowRight") transform.x = round(transform.x + step);
    if (key === "ArrowUp") transform.y = round(transform.y - step);
    if (key === "ArrowDown") transform.y = round(transform.y + step);

    applyTransform(selectedId);
    scheduleOverlay();
  }

  function scaleSelected(direction, event) {
    if (!selectedId) return;

    const transform = transformFor(selectedId);
    const factor = 1 + direction * scaleStep(event);
    transform.scaleX = Math.max(0.05, round(transform.scaleX * factor));
    transform.scaleY = Math.max(0.05, round(transform.scaleY * factor));

    applyTransform(selectedId);
    scheduleOverlay();
  }

  function deleteSelected() {
    if (!selectedId) return;

    recordHistory();
    const id = selectedId;
    const state = itemState.get(id);
    if (!state) return;

    state.deleted = true;
    applyTransform(id);
    if (hoverId === id) hoverId = null;
    selectId(null);
    showToast("已删除");
  }

  function screenScaleFor(element, id) {
    const transform = transformFor(id);
    const rect = element.getBoundingClientRect();
    const width = element.offsetWidth || rect.width || 1;
    const height = element.offsetHeight || rect.height || 1;
    const scaleX = Math.abs(rect.width / (width * transform.scaleX)) || 1;
    const scaleY = Math.abs(rect.height / (height * transform.scaleY)) || 1;
    return {
      x: scaleX || 1,
      y: scaleY || 1,
    };
  }

  function snapshot() {
    const data = {};
    for (const [id, state] of itemState) {
      data[id] = cloneItemState(state);
    }
    return data;
  }

  function restoreSnapshot(data) {
    for (const [id, value] of Object.entries(data)) {
      const state = itemState.get(id) || {
        transform: cloneTransform(DEFAULT_TRANSFORM),
        deleted: false,
        boundsBefore: { x: 0, y: 0, width: 0, height: 0 },
      };
      if (value && typeof value === "object" && "transform" in value) {
        state.transform = normalizeTransform(value.transform);
        state.deleted = normalizeDeleted(value.deleted);
      } else {
        state.transform = normalizeTransform(value);
        state.deleted = false;
      }
      itemState.set(id, state);
    }
    applyAllTransforms();
  }

  function recordHistory() {
    undoStack.push(snapshot());
    if (undoStack.length > 100) undoStack.shift();
    redoStack = [];
  }

  function undo() {
    if (!undoStack.length) return;
    redoStack.push(snapshot());
    restoreSnapshot(undoStack.pop());
    showToast("已撤销");
  }

  function redo() {
    if (!redoStack.length) return;
    undoStack.push(snapshot());
    restoreSnapshot(redoStack.pop());
    showToast("已重做");
  }

  function cssAttrValue(value) {
    return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  }

  function currentDesignSize() {
    const stage = document.querySelector(".pet-box-stage");
    if (!stage) return null;

    const width = finiteNumber(stage.dataset.designWidth || stage.style.width.replace("px", ""), 0);
    const height = finiteNumber(stage.dataset.designHeight || stage.style.height.replace("px", ""), 0);
    if (!width || !height) return null;
    return { width, height };
  }

  function buildLayout() {
    scanUiElements();

    const designSize = currentDesignSize();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
    };
    if (designSize) {
      viewport.designWidth = designSize.width;
      viewport.designHeight = designSize.height;
    }

    const layoutItems = {};
    const ids = Array.from(liveItems.keys()).sort((left, right) => left.localeCompare(right));

    for (const id of ids) {
      const item = liveItems.get(id);
      if (!item?.element?.isConnected) continue;

      const state = itemState.get(id) || {
        transform: cloneTransform(DEFAULT_TRANSFORM),
        deleted: false,
        boundsBefore: rectToObject(item.element.getBoundingClientRect()),
      };
      const boundsAfter = rectToObject(item.element.getBoundingClientRect());

      layoutItems[id] = {
        id,
        label: item.element.dataset.uiLabel || id,
        selector: `[data-ui-id='${cssAttrValue(id)}']`,
        sourceHint: sourceHintFor(item.element),
        transform: cloneTransform(state.transform),
        deleted: normalizeDeleted(state.deleted),
        boundsBefore: state.boundsBefore || boundsAfter,
        boundsAfter,
      };
    }

    return {
      version: 1,
      app: "RocoRogue",
      mode: "ui-tuner",
      createdAt: new Date().toISOString(),
      route: `${location.pathname}${location.search}${location.hash}`,
      viewport,
      base: {
        gitCommit: config.base?.gitCommit || null,
        branch: config.base?.branch || null,
      },
      items: layoutItems,
    };
  }

  async function saveDraft() {
    const layout = buildLayout();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));

    try {
      const response = await fetch(config.saveEndpoint || "/__ui_tuner/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(layout),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      showToast("已保存");
    } catch {
      showToast("已保存到浏览器");
    }
  }

  function exportLayout() {
    const layout = buildLayout();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));

    const blob = new Blob([`${JSON.stringify(layout, null, 2)}\n`], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "roco-ui-layout-export.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("已导出");
  }

  function positionOverlayBox(box, element) {
    if (!element?.isConnected) {
      box.style.display = "none";
      return null;
    }

    const rect = element.getBoundingClientRect();
    box.style.display = "block";
    box.style.width = `${Math.max(0, rect.width)}px`;
    box.style.height = `${Math.max(0, rect.height)}px`;
    box.style.transform = `translate(${round(rect.left)}px, ${round(rect.top)}px)`;
    return rect;
  }

  function updateOverlay() {
    overlayFrame = 0;

    if (!active) {
      hoverBox.style.display = "none";
      selectedBox.style.display = "none";
      tip.style.display = "none";
      return;
    }

    const selected = selectedId ? liveItems.get(selectedId)?.element : null;
    const hovered = hoverId && hoverId !== selectedId ? liveItems.get(hoverId)?.element : null;

    positionOverlayBox(hoverBox, hovered);
    const selectedRect = positionOverlayBox(selectedBox, selected);

    const hintId = selectedId || hoverId;
    const hintElement = hintId ? liveItems.get(hintId)?.element : null;
    const hintRect = selectedRect || (hintElement ? hintElement.getBoundingClientRect() : null);

    if (!hintId || !hintRect) {
      tip.style.display = "none";
      return;
    }

    tip.textContent = hintId;
    tip.style.display = "block";
    const left = Math.min(window.innerWidth - 12, Math.max(8, hintRect.left));
    const top = Math.min(window.innerHeight - 24, Math.max(8, hintRect.top - 20));
    tip.style.transform = `translate(${round(left)}px, ${round(top)}px)`;
  }

  function scheduleOverlay() {
    if (overlayFrame) return;
    overlayFrame = requestAnimationFrame(updateOverlay);
  }

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("is-visible");
    }, 1200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
