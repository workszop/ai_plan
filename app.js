(function () {
  "use strict";

  // ─── Constants ───
  const CORE = window.AI_PLAN_CORE;
  const DATA = window.ROADMAP;
  const STORAGE_KEY = "aiPlan.plan.sme.v1";
  const LEGACY_KEYS = ["aiPlan.plan.v3", "aiPlan.progress.v2"];
  const MODE_KEY = "aiPlan.viewMode";
  const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FONT_WAIT_MS = 1500;
  const BRAND_FONTS = ["400 1em Manrope", "700 1em Manrope", "800 1em Manrope", "400 1em \"Geist Mono\""];
  const MAX_IMPORT_BYTES = 1024 * 1024;
  const PHASE_COLOURS = 4;
  const RAIL_BEFORE = [{ id: "jak", label: "Jak korzystać" }, { id: "przeglad", label: "Przegląd" }];
  const RAIL_AFTER = [{ id: "wsparcie", label: "Rytm przeglądów" }, { id: "regulacje", label: "Regulacje" }, { id: "wyzwania", label: "Przeszkody" }, { id: "mierniki", label: "Mierniki" }, { id: "przyklad", label: "Przykład i słownik" }];
  const CONTEXT_LABELS = {
    personalData: "Dane osobowe lub poufne",
    externalOutput: "Wynik dla klienta lub na zewnątrz",
    multipleTeams: "Kilka zespołów korzysta z rutyny",
    integration: "Połączenie z innym systemem",
    sensitiveDecision: "Wpływ na ludzi, pieniądze lub dostęp do usług"
  };
  let CATALOG = null;
  let catalogError = "";
  try { CATALOG = CORE && DATA ? CORE.buildTaskCatalog(DATA) : null; } catch (error) { catalogError = error && error.message ? error.message : "Niepoprawny katalog zadań"; }

  // ─── State ───
  const state = {
    plan: DATA && CORE ? CORE.createDefaultPlan(DATA) : null,
    mode: "guide",
    selectedPhase: "",
    remainingOnly: false,
    dirty: false,
    storageState: "saved",
    storageError: "",
    legacyBackups: Object.create(null),
    quarantined: [],
    validationErrors: [],
    activeDialog: null,
    dialogOpener: null,
    currentTaskId: "",
    revision: 0,
    toastTimer: 0,
    saveTimer: 0
  };

  // ─── DOM refs ───
  const $ = (selector) => document.querySelector(selector);
  const phasesEl = $("#phases");
  const stepperEl = $("#stepper");
  const navProgress = $("#navProgress");
  const railListEl = $("#railList");
  const progressMeta = $("#progressMeta");
  const liveEl = $("#live");
  const toastEl = $("#toast");
  const toastTextEl = $("#toastText");
  const undoButton = $("#btnUndo");
  const helpEl = $("#help");
  const resetEl = $("#resetDialog");
  const taskEl = $("#taskDialog");

  // ─── Helpers ───
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>\"]/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;"
    }[character]));
  }

  function pad(value) { return String(value).padStart(2, "0"); }

  // Phase colour tokens (palette.css roles in index.html); cycles when there are more phases than colours.
  function phaseStyle(num) {
    const slot = ((Number(num) - 1) % PHASE_COLOURS) + 1;
    return `--ph: var(--color-${slot}); --ph-tint: var(--tint-${slot}); --ph-on-ink: var(--on-ink-${slot})`;
  }

  function railSections() {
    return RAIL_BEFORE.concat(DATA.phases.map((phase) => ({ id: `faza-${phase.num}`, label: phase.title, phase: phase.num })), RAIL_AFTER);
  }

  function taskIdFor(phase, stageIndex, itemIndex, actionIndex) {
    const item = phase.stages[stageIndex].items[itemIndex];
    const found = CATALOG.tasks;
    for (const task of found.values()) {
      if (task.phaseId === phase.id && task.legacyId === `${phase.id}/${stageIndex}/${itemIndex}/${actionIndex}`) return task.id;
    }
    return "";
  }

  function phaseInfo(phaseId) {
    return DATA.phases.find((phase) => phase.id === phaseId) || DATA.phases[0];
  }

  function phaseTaskIds(phaseId) {
    const value = CATALOG.phaseMap.get(phaseId);
    return value ? value.actionIds.concat(value.gateIds) : [];
  }

  function actionIds(phaseId) {
    const value = CATALOG.phaseMap.get(phaseId);
    return value ? value.actionIds : [];
  }

  function gateIds(phaseId) {
    const value = CATALOG.phaseMap.get(phaseId);
    return value ? value.gateIds : [];
  }

  function taskMeta(id) {
    return state.plan.taskMeta[id] || { owner: "", due: "", notes: "", evidence: "" };
  }

  function taskDone(id) { return Boolean(state.plan.done[id]); }
  function taskNa(id) { return Boolean(state.plan.na[id]); }

  function applicableActionIds(phaseId) {
    return actionIds(phaseId).filter((id) => !taskNa(id));
  }

  function countPhase(phaseId) {
    const actions = actionIds(phaseId);
    const applicable = applicableActionIds(phaseId);
    const gates = gateIds(phaseId);
    const actionsDone = applicable.filter((id) => taskDone(id)).length;
    const gatesDone = gates.filter((id) => taskDone(id)).length;
    return {
      actionsDone,
      actionsTotal: applicable.length,
      actionsAll: actions.length,
      na: actions.filter((id) => taskNa(id)).length,
      gatesDone,
      gatesTotal: gates.length,
      actionPercent: applicable.length ? Math.round(actionsDone / applicable.length * 100) : 0
    };
  }

  function countAll() {
    return DATA.phases.reduce((total, phase) => {
      const count = countPhase(phase.id);
      total.actionsDone += count.actionsDone;
      total.actionsTotal += count.actionsTotal;
      total.actionsAll += count.actionsAll;
      total.na += count.na;
      total.gatesDone += count.gatesDone;
      total.gatesTotal += count.gatesTotal;
      return total;
    }, { actionsDone: 0, actionsTotal: 0, actionsAll: 0, na: 0, gatesDone: 0, gatesTotal: 0 });
  }

  function spans(length) {
    if (length === 1) return [6];
    if (length % 3 === 0) return Array(length).fill(2);
    if (length % 2 === 0) return Array(length).fill(3);
    return Array(length - 2).fill(2).concat([3, 3]);
  }

  function taskHtml(id, task, kind = "action") {
    const optional = task.optional ? `<span class="task-optional">Opcjonalne</span>` : "";
    const checked = taskDone(id) ? " checked" : "";
    return `<li><label class="task"><input type="checkbox" data-task="${esc(id)}" data-kind="${kind}"${checked}><span>${esc(task.text)}${optional}</span></label></li>`;
  }

  function safeUrl(value) {
    try {
      const url = new URL(value, window.location.href);
      return /^https?:$|^mailto:$/.test(url.protocol) ? url.href : "#";
    } catch (error) { return "#"; }
  }

  function readStorage(key) {
    try { return { ok: true, value: localStorage.getItem(key) }; }
    catch (error) { return { ok: false, error: error && error.message ? error.message : "storage unavailable" }; }
  }

  function readLegacyBackups() {
    const backups = Object.create(null);
    LEGACY_KEYS.forEach((key) => {
      const stored = readStorage(key);
      if (stored.ok && stored.value) backups[key] = stored.value;
    });
    return backups;
  }

  function hasLegacyBackups() {
    return Object.keys(state.legacyBackups).length > 0;
  }

  function downloadLegacyBackups() {
    if (!hasLegacyBackups()) { toast("Nie znaleziono starego zapisu planu"); return; }
    const payload = JSON.stringify({
      exportedAt: new Date().toISOString(),
      note: "Oryginalne dane poprzedniego, rozbudowanego planu. Nie są migracją do planu dla MŚP.",
      backups: state.legacyBackups
    }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ai-plan-legacy-backups-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    toast("Pobrano oryginalną kopię starego planu");
  }

  function hasQuarantineNotice() {
    return state.quarantined.length > 0 || state.validationErrors.length > 0;
  }

  function quarantineMessage() {
    const count = state.quarantined.length;
    const errors = state.validationErrors.length;
    if (count && errors) return `Odczyt częściowy: ${count} wpisów w kwarantannie, ${errors} błędów kontraktu. Potwierdź po sprawdzeniu lub pobierz kopię.`;
    if (count) return `Część danych pozostała w kwarantannie (${count}). Potwierdź po sprawdzeniu lub pobierz kopię.`;
    return `Plan wymaga sprawdzenia (${errors} błędów kontraktu). Pobierz kopię albo popraw dane.`;
  }

  function setSaveStatus(status, message) {
    state.storageState = status;
    state.storageError = message || "";
    document.querySelectorAll("[data-save-label]").forEach((element) => {
      element.textContent = message || ({ saved: "Zapis lokalny gotowy", unsaved: "Niezapisane zmiany – pobierz kopię", error: "Nie udało się zapisać – pobierz kopię", corrupt: "Odczyt przerwany – użyj kopii" }[status] || "Stan zapisu nieznany");
    });
    document.querySelectorAll("[data-retry-save]").forEach((element) => { element.hidden = status === "saved"; });
    document.querySelectorAll("[data-ack-quarantine]").forEach((element) => { element.hidden = status !== "corrupt" || !hasQuarantineNotice(); });
    document.querySelectorAll(".save-status").forEach((element) => element.dataset.state = status);
    const liveMessage = status === "saved" ? "Plan zapisany lokalnie." : `Uwaga: ${message || "plan nie został zapisany"}.`;
    if (status !== "saved") liveEl.textContent = liveMessage;
  }

  function clearUndoSnapshot() {
    if (!state.plan || !state.plan.undoSnapshot) return;
    state.plan.undoSnapshot = null;
    if (undoButton) {
      undoButton.hidden = true;
      undoButton.setAttribute("aria-hidden", "true");
    }
  }

  function invalidateDecisionForPhase(phaseId) {
    const decision = state.plan && state.plan.decisions && state.plan.decisions[phaseId];
    if (!decision || decision.status === "none") return false;
    state.plan.decisions[phaseId] = { ...decision, status: "none", basis: "" };
    return true;
  }

  function invalidateDecisionForTask(taskId) {
    const task = CATALOG && CATALOG.tasks.get(taskId);
    return task ? invalidateDecisionForPhase(task.phaseId) : false;
  }

  function invalidateProjectDecisions() {
    let invalidated = false;
    DATA.phases.forEach((phase) => {
      invalidated = invalidateDecisionForPhase(phase.id) || invalidated;
    });
    if (invalidated) {
      renderPrintSnapshot();
    }
    return invalidated;
  }

  function hasUnsavedChanges() {
    return Boolean(state.dirty);
  }

  function refreshSaveStatus() {
    if (hasQuarantineNotice()) {
      setSaveStatus("corrupt", quarantineMessage());
    } else if (state.dirty) {
      setSaveStatus("unsaved", "Niezapisane zmiany – pobierz kopię");
    } else {
      setSaveStatus("saved", "Zapis lokalny gotowy");
    }
  }

  function touchPlan(options = {}) {
    if (!options.keepUndo) clearUndoSnapshot();
    state.revision += 1;
    state.plan.updatedAt = new Date().toISOString();
    state.dirty = true;
    setSaveStatus(hasQuarantineNotice() ? "corrupt" : "unsaved", hasQuarantineNotice() ? quarantineMessage() : "");
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(() => { persistPlan(); if (state.mode === "plan") renderPlan(); }, 650);
  }

  function persistPlan() {
    if (!state.plan) return false;
    const checked = CORE.validatePlan(state.plan, DATA);
    if (!checked.ok || state.validationErrors.length) {
      if (checked.plan) state.plan = checked.plan;
      state.validationErrors = state.validationErrors.length ? state.validationErrors : checked.errors.slice();
      state.quarantined = Array.from(new Set(state.quarantined.concat(checked.unknown))).slice(0, 100);
      state.plan.quarantine = state.quarantined.slice();
      state.dirty = true;
      setSaveStatus("corrupt", quarantineMessage());
      return false;
    }
    state.plan = checked.plan;
    state.plan.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.plan));
      state.dirty = false;
      refreshSaveStatus();
      return true;
    } catch (error) {
      state.dirty = true;
      setSaveStatus("error", "Nie udało się zapisać postępu. Nie zamykaj tej karty.");
      return false;
    }
  }

  function saveAndRender(announce = true) {
    persistPlan();
    renderProgress(announce);
    renderPlan();
    renderPrintSnapshot();
  }

  function loadInitialPlan() {
    state.legacyBackups = readLegacyBackups();
    const stored = readStorage(STORAGE_KEY);
    if (!stored.ok) {
      setSaveStatus("error", "Pamięć przeglądarki jest niedostępna. Nie zamykaj tej karty.");
      return;
    }
    if (stored.value) {
      try {
        const parsed = JSON.parse(stored.value);
        const checked = CORE.validatePlan(parsed, DATA);
        if (checked.ok) {
          state.plan = checked.plan;
          state.quarantined = checked.plan.quarantine.slice();
          state.validationErrors = [];
          if (hasQuarantineNotice()) setSaveStatus("corrupt", quarantineMessage());
          return;
        }
        state.plan = checked.plan || CORE.createDefaultPlan(DATA);
        state.validationErrors = checked.errors.slice(0, 100);
        state.quarantined = Array.from(new Set((checked.plan && checked.plan.quarantine || []).concat(checked.unknown))).slice(0, 100);
        state.plan.quarantine = state.quarantined.slice();
        setSaveStatus("corrupt", quarantineMessage());
        return;
      } catch (error) {
        state.validationErrors = ["Niepoprawny JSON w pamięci przeglądarki"];
        state.quarantined = ["Niepoprawny JSON w pamięci przeglądarki"];
        state.plan = CORE.createDefaultPlan(DATA);
        state.plan.quarantine = state.quarantined.slice();
        setSaveStatus("corrupt", quarantineMessage());
        return;
      }
    }
    // Stare dane są celowo tylko sygnalizowane i pobierane. Ich zadania nie
    // mają tej samej semantyki co nowy plan SME, więc nie wykonujemy migracji.
  }

  function toast(message, undo = false) {
    if (!toastEl) return;
    if (toastTextEl) toastTextEl.textContent = message;
    else toastEl.textContent = message;
    if (undoButton) {
      undoButton.hidden = !undo;
      undoButton.setAttribute("aria-hidden", undo ? "false" : "true");
    }
    toastEl.classList.add("show");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => toastEl.classList.remove("show"), undo ? 7000 : 2600);
  }

  function icons() { if (window.lucide) window.lucide.createIcons(); }

  function openDialog(element, opener) {
    state.activeDialog = element;
    state.dialogOpener = opener || document.activeElement;
    element.hidden = false;
    element.setAttribute("open", "");
    document.querySelectorAll("body > *:not(.help):not(script)").forEach((node) => { node.inert = true; });
    const focusable = element.querySelector("button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex='-1'])");
    if (focusable) focusable.focus();
  }

  function closeDialog(element = state.activeDialog) {
    if (!element) return;
    element.removeAttribute("open");
    element.hidden = true;
    document.querySelectorAll("body > *:not(.help):not(script)").forEach((node) => { node.inert = false; });
    const opener = state.dialogOpener;
    state.activeDialog = null;
    state.dialogOpener = null;
    if (opener && typeof opener.focus === "function") opener.focus();
  }

  function trapDialog(event) {
    if (!state.activeDialog || event.key !== "Tab") return;
    const focusable = Array.from(state.activeDialog.querySelectorAll("button:not([disabled]), input, textarea, select, [href], [tabindex]:not([tabindex='-1'])")).filter((node) => !node.hidden);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function askDiscard(message) {
    if (!hasUnsavedChanges()) return true;
    return window.confirm(message || "Masz niezapisane zmiany. Kontynuować i je odrzucić?");
  }

  // ─── Render: guide ───
  function renderStepper() {
    const steps = DATA.phases.map((phase) => {
      const count = countPhase(phase.id);
      return `<a class="step" href="#faza-${phase.num}" data-step="${esc(phase.id)}" style="${phaseStyle(phase.num)}">
        <div class="step-num"><span>Faza ${phase.num}</span><i data-lucide="${esc(phase.icon)}" class="icon"></i></div>
        <h3>${esc(phase.title)}</h3>
        <div class="step-meta"><span data-step-count>${count.actionsDone}/${count.actionsTotal} działań · ${count.gatesDone}/${count.gatesTotal} warunków decyzji</span></div>
        <div class="step-bar"><i data-step-bar></i></div>
      </a>`;
    }).join("");
    const ongoing = `<a class="step step-ongoing" href="#wsparcie"><div class="step-num"><span>Dalej</span><i data-lucide="infinity" class="icon"></i></div><h3>${esc(DATA.ongoing.title)}</h3><div class="step-meta">stały rytm</div></a>`;
    stepperEl.innerHTML = steps + ongoing;
  }

  function renderPhase(phase, index) {
    const alt = index % 2 === 0 ? "" : " section-alt";
    const next = DATA.phases[index + 1];
    const nextHref = next ? `#faza-${next.num}` : "#wsparcie";
    const nextLabel = next ? `Podejrzyj fazę ${next.num}, ${next.title}` : "Podejrzyj bieżące wsparcie";
    let actionOffset = 0;
    const outcomes = phase.outcomes.map((outcome) => `<span class="chip"><i data-lucide="file-text" class="icon"></i>${esc(outcome)}</span>`).join("");
    const stages = phase.stages.map((stage, stageIndex) => {
      const widths = spans(stage.items.length);
      const cells = stage.items.map((item, itemIndex) => {
        const cellsTasks = (item.actions || []).map((action, actionIndex) => {
          const id = taskIdFor(phase, stageIndex, itemIndex, actionIndex);
          const task = CATALOG.tasks.get(id) || { text: typeof action === "string" ? action : action.text, optional: false };
          return taskHtml(id, task, "action");
        }).join("");
        actionOffset += item.actions.length;
        return `<div class="cell cell-${widths[itemIndex]} reveal" data-item>
          <div class="cell-tag">${phase.num}.${stageIndex + 1}.${itemIndex + 1}<i data-lucide="${esc(phase.icon)}" class="icon"></i></div>
          <h3>${esc(item.title)}</h3><ul class="task-list">${cellsTasks}</ul>
        </div>`;
      }).join("");
      return `<div class="stage reveal" data-stage="${phase.num}.${stageIndex + 1}"><div class="stage-node" aria-hidden="true">${phase.num}.${stageIndex + 1}</div><div class="stage-body"><h3 class="stage-title"><span class="stage-num">ETAP ${phase.num}.${stageIndex + 1}</span>${esc(stage.title)}</h3><div class="bento">${cells}</div></div></div>`;
    }).join("");
    const checks = (CATALOG.phaseMap.get(phase.id) || { gateIds: [] }).gateIds.map((id) => taskHtml(id, CATALOG.tasks.get(id), "gate")).join("");
    return `<section class="section phase${alt}" id="faza-${phase.num}" data-phase="${esc(phase.id)}" data-done="0" data-total="0" style="${phaseStyle(phase.num)}">
      <div class="wrap"><div class="phase-head reveal"><div class="phase-num" aria-hidden="true">${pad(phase.num)}</div><div><div class="eyebrow">Faza ${phase.num} · ${esc(phase.duration)}</div><h2 class="h-section">${esc(phase.title)}</h2><p class="phase-goal">${esc(phase.goal)}</p></div><div class="phase-stat"><div class="num" data-phase-num>0%</div><div class="lbl" data-phase-lbl>0 / 0 działań · warunki decyzji 0 / 0</div><div class="bar"><i data-phase-bar></i></div></div></div>
      <div class="bento"><div class="cell cell-6 outcomes reveal"><details class="output-disclosure"><summary>Na koniec fazy masz (${phase.outcomes.length} rezultatów)</summary><div class="outcome-chips">${outcomes}</div></details></div></div>
      <div class="stages">${stages}</div>
      <div class="bento"><div class="cell cell-6 gate reveal" data-gate><div class="gate-grid">
        <div class="gate-text"><div class="cell-tag">Warunki decyzji<i data-lucide="door-open" class="icon"></i></div><h3>${esc(phase.gate.title)}</h3><p>Lista kontrolna przed kolejnym krokiem. Potwierdzenie warunków nie zwiększa licznika działań i nie wymaga osobnego formularza.</p></div>
        <ul class="task-list gate-checks">${checks}</ul>
        <div class="gate-status" data-gate-status>0 / 0 warunków potwierdzonych</div>
        <div class="gate-done">Warunki decyzji potwierdzone</div>
        <div class="gate-next"><a class="pill pill-solid" href="${nextHref}">${esc(nextLabel)}<i data-lucide="arrow-right" class="icon"></i></a></div>
      </div></div></div>
      </div></section>`;
  }

  function renderOngoing() {
    $("#ongoingTitle").innerHTML = `${esc(DATA.ongoing.title)} w <span class="h-pink">czterech rytmach</span>`;
    $("#ongoingLead").textContent = DATA.ongoing.lead;
    const widths = spans(DATA.ongoing.cadences.length);
    $("#ongoingGrid").innerHTML = DATA.ongoing.cadences.map((cadence, index) => `<div class="cell cell-${widths[index]} reveal"><div class="cell-tag">${esc(cadence.period)}<i data-lucide="${esc(cadence.icon)}" class="icon"></i></div><ul>${cadence.actions.map((action) => `<li>${esc(action)}</li>`).join("")}</ul></div>`).join("");
  }

  function renderRegulation() {
    const regulation = DATA.regulation;
    $("#regTitle").innerHTML = `${esc(regulation.title)}: co już <span class="h-pink">obowiązuje</span>`;
    $("#regLead").textContent = regulation.lead;
    const now = regulation.now || {};
    $("#legalNow").innerHTML = `<h3>${esc(now.title || "Co dotyczy Twojego zadania teraz?")}</h3><p>${esc(now.lead || "Gdy znasz zakres i swoją rolę, łatwiej dobrać obowiązki i zabezpieczenia.")}</p><div class="legal-now-grid">${(now.items || []).map((item) => `<article><h4>${esc(item.scope)}</h4><p><strong>Rola i działanie:</strong> ${esc(item.action)}<br><strong>Źródło:</strong> <a href="${safeUrl(item.source)}" target="_blank" rel="noopener">${esc(item.sourceLabel || item.source)}</a><br><strong>Przegląd:</strong> ${esc(item.reviewed || "nie podano")}</p></article>`).join("")}</div><p class="legal-note">${esc(now.note || "To wskazówka do wstępnej oceny, a nie porada prawna. Sama data obowiązywania nie potwierdza, że spełniasz wszystkie wymogi.")}</p>`;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const events = regulation.events.slice().sort((a, b) => a.date.localeCompare(b.date));
    $("#timeline").innerHTML = events.map((event) => {
      const date = new Date(`${event.date}T00:00:00`);
      const diff = Math.round((date - today) / 86400000);
      const status = diff <= 0 ? { key: "past", label: "data minęła, sprawdź aktualne brzmienie" } : diff <= 120 ? { key: "next", label: `za ${diff} dni` } : { key: "future", label: "nadchodzi" };
      return `<li class="tl-item" data-status="${status.key}" data-date="${event.date}"><div><div class="tl-date">${esc(event.date)}</div><span class="tl-status">${esc(status.label)}</span></div><div><h3>${esc(event.title)}</h3><p>${esc(event.desc)}</p></div></li>`;
    }).join("");
    $("#regSources").innerHTML = "Źródła (przegląd 2026-10-22): " + regulation.sources.map((source) => `<a href="${safeUrl(source.url)}" target="_blank" rel="noopener">${esc(source.label)}</a>`).join("");
  }

  function renderChallenges() {
    const challenges = DATA.challenges;
    $("#chTitle").innerHTML = `${esc(challenges.title)} i <span class="h-pink">gotowe odpowiedzi</span>`;
    $("#chLead").textContent = challenges.lead;
    const widths = spans(challenges.items.length);
    $("#chGrid").innerHTML = challenges.items.map((item, index) => `<div class="cell cell-${widths[index]} reveal"><div class="cell-tag">Wyzwanie<i data-lucide="${esc(item.icon)}" class="icon"></i></div><h3>${esc(item.title)}</h3><p>${esc(item.problem)}</p><div class="cell-note"><strong>Rozwiązanie:</strong> ${esc(item.fix)}</div></div>`).join("");
  }

  function renderMetrics() {
    const metrics = DATA.metrics;
    $("#mTitle").innerHTML = `${esc(metrics.title)} w <span class="h-pink">katalogu grup</span>`;
    $("#mLead").textContent = metrics.lead;
    const widths = spans(metrics.groups.length);
    $("#mGrid").innerHTML = metrics.groups.map((group, index) => `<div class="cell cell-${widths[index]} reveal"><div class="cell-tag">${esc(group.title)}<i data-lucide="${esc(group.icon)}" class="icon"></i></div><ul>${group.items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></div>`).join("");
  }

  function renderContentAdditions() {
    const example = DATA.workedExample || {};
    $("#workedExample").innerHTML = `<p><strong>${esc(example.title || "Przykład: odpowiedzi na pytania klientów")}</strong> ${esc(example.lead || "")}</p><div class="worked-example-grid">${(example.phases || []).map((phase) => `<article><h4>${esc(phase.title)}</h4><p>${esc(phase.output)}<br><strong>Próg:</strong> ${esc(phase.threshold)}</p></article>`).join("")}</div>`;
    $("#glossary").innerHTML = (DATA.glossary || []).map((entry) => `<div><dt>${esc(entry.term)}</dt><dd>${esc(entry.definition)}</dd></div>`).join("");
  }

  function renderLegacyNotice() {
    const notice = $("#legacyNotice");
    if (!notice) return;
    if (!hasLegacyBackups()) {
      notice.hidden = true;
      notice.innerHTML = "";
      return;
    }
    const keys = Object.keys(state.legacyBackups);
    notice.hidden = false;
    notice.innerHTML = `<strong>Wykryto dane poprzedniego, rozbudowanego planu.</strong> Oryginalny zapis pozostaje nietknięty i nie oznacza wykonania żadnego zadania w planie dla MŚP. Zanim ręcznie przepiszesz wybrane informacje, pobierz kopię. <span class="legacy-keys">Źródła: ${esc(keys.join(", "))}</span> <button class="pill pill-ghost" type="button" id="btnLegacyDownload">Pobierz oryginalne kopie</button>`;
    $("#btnLegacyDownload").addEventListener("click", downloadLegacyBackups);
  }

  function renderContextGuidance() {
    const panel = $("#contextGuidance");
    if (!panel || !DATA.safety) return;
    const active = new Set((state.plan.project.context || []).filter((key) => CONTEXT_LABELS[key]));
    const basics = DATA.safety.layers.find((layer) => layer.id === "basics");
    const conditional = DATA.safety.layers.find((layer) => layer.id === "conditional");
    const specialist = DATA.safety.layers.find((layer) => layer.id === "specialist");
    const selectedItems = (conditional && conditional.items || []).filter((item) => active.has(item.context));
    const needsSpecialist = active.has("personalData") || active.has("externalOutput") || active.has("sensitiveDecision");
    const layerHtml = (layer, items, extra = "") => `<section data-context-guidance data-layer="${esc(layer.id)}"><h4>${esc(layer.title)}</h4>${extra ? `<p>${esc(extra)}</p>` : ""}<ul>${items.map((item) => `<li>${esc(typeof item === "string" ? item : item.text)}</li>`).join("")}</ul></section>`;
    const conditionalHtml = selectedItems.length ? layerHtml(conditional, selectedItems, "Wybrane konteksty kierują do tych dodatkowych ustaleń.") : layerHtml(conditional, [], "Nie zaznaczono kontekstu. Dodatkowe ustalenia pojawią się po zaznaczeniu sytuacji, której dotyczy zadanie.");
    const specialistHtml = needsSpecialist ? layerHtml(specialist, specialist.items, "Ten zakres może wymagać oceny specjalisty.") : "";
    panel.dataset.activeContexts = Array.from(active).join(",");
    panel.innerHTML = `<p class="safety-lead">${esc(DATA.safety.lead)}</p><div class="safety-grid">${layerHtml(basics, basics.items)}${conditionalHtml}${specialistHtml}</div>`;
  }

  function renderRail() {
    const sections = railSections();
    railListEl.innerHTML = sections.map((section, index) => `<li><a href="#${esc(section.id)}" data-rail="${esc(section.id)}"${section.phase ? ` data-rail-phase="${section.phase}" style="${phaseStyle(section.phase)}"` : ""}><span class="rail-n">${pad(index + 1)}</span><span>${esc(section.label)}</span></a></li>`).join("");
    sections.forEach((section, index) => {
      const head = document.querySelector(`#${section.id} .section-head`);
      if (head) head.dataset.num = pad(index + 1);
    });
  }

  function renderProgress(announce) {
    const all = countAll();
    DATA.phases.forEach((phase) => {
      const count = countPhase(phase.id);
      const section = document.querySelector(`[data-phase="${phase.id}"]`);
      if (!section) return;
      section.dataset.done = count.actionsDone;
      section.dataset.total = count.actionsTotal;
      section.dataset.gatesDone = count.gatesDone;
      section.dataset.gatesTotal = count.gatesTotal;
      section.querySelector("[data-phase-num]").textContent = `${count.actionPercent}%`;
      section.querySelector("[data-phase-lbl]").textContent = `${count.actionsDone} / ${count.actionsTotal} działań · warunki decyzji ${count.gatesDone} / ${count.gatesTotal}`;
      section.querySelector("[data-phase-bar]").style.width = `${count.actionPercent}%`;
      const gate = section.querySelector("[data-gate]");
      if (gate) {
        gate.dataset.done = count.gatesTotal > 0 && count.gatesDone === count.gatesTotal ? "true" : "false";
        const gateStatus = gate.querySelector("[data-gate-status]");
        if (gateStatus) gateStatus.textContent = `${count.gatesDone} / ${count.gatesTotal} warunków potwierdzonych`;
      }
      const step = stepperEl.querySelector(`[data-step="${phase.id}"]`);
      if (step) {
        step.querySelector("[data-step-count]").textContent = `${count.actionsDone}/${count.actionsTotal} działań · ${count.gatesDone}/${count.gatesTotal} warunków decyzji`;
        step.querySelector("[data-step-bar]").style.width = `${count.actionPercent}%`;
      }
      section.querySelectorAll("[data-item]").forEach((cell) => { cell.dataset.done = Array.from(cell.querySelectorAll("input[data-kind='action']")).every((box) => box.checked || taskNa(box.dataset.task)) ? "true" : "false"; });
    });
    const actionPercent = all.actionsTotal ? Math.round(all.actionsDone / all.actionsTotal * 100) : 0;
    navProgress.style.width = `${actionPercent}%`;
    progressMeta.textContent = `${all.actionsDone} / ${all.actionsTotal} działań · ${all.gatesDone} / ${all.gatesTotal} warunków decyzji${all.na ? ` · ${all.na} N/A` : ""}`;
    document.body.dataset.progress = actionPercent;
    document.body.dataset.done = all.actionsDone;
    document.body.dataset.total = all.actionsTotal;
    document.body.dataset.gatesDone = all.gatesDone;
    document.body.dataset.gatesTotal = all.gatesTotal;
    if (announce) liveEl.textContent = `Postęp: ${all.actionsDone} z ${all.actionsTotal} działań i ${all.gatesDone} z ${all.gatesTotal} warunków decyzji.`;
  }

  function printValue(value) {
    return esc(value == null || String(value) === "" ? "Nie podano" : value);
  }

  function printField(label, value, block = false) {
    if (value == null || String(value).trim() === "") return "";
    if (block) return `<div class="print-field-block"><p><strong>${esc(label)}:</strong></p><pre>${esc(value)}</pre></div>`;
    return `<p><strong>${esc(label)}:</strong> ${esc(value)}</p>`;
  }

  function renderPrintSnapshot() {
    const snapshot = $("#printSnapshot");
    if (!snapshot || !state.plan || !CATALOG) return;
    const counts = countAll();
    const currentPhase = phaseInfo(selectedPhase());
    const project = state.plan.project;
    const phases = DATA.phases.map((phase) => {
      const phaseCount = countPhase(phase.id);
      const tasks = phaseTaskIds(phase.id).map((id) => {
        const task = CATALOG.tasks.get(id);
        const meta = taskMeta(id);
        const na = taskNa(id);
        const status = na ? "N/A" : taskDone(id) ? "Wykonane" : "Pozostało";
        const group = task.group || (task.kind === "gate" ? "Warunki decyzji" : "Działania");
        const kind = task.kind === "gate" ? "Warunek decyzji" : task.optional ? "Opcjonalne działanie" : "Działanie";
        const hint = task.output || task.hint || (task.kind === "gate" ? "Wynik lub dokumentacja warunku decyzji." : "Wynik lub przykład zapisany przy zadaniu.");
        return "<article class=\"print-task\" data-print-task=\"" + esc(id) + "\"><h4>" + esc(group) + "</h4><p class=\"print-task-title\"><strong>" + esc(kind) + "</strong> – " + esc(task.text) + "</p><p><strong>Status:</strong> " + esc(status) + (na ? "; powód N/A: " + printValue(state.plan.na[id]) : "") + "</p><p><strong>" + (task.kind === "gate" ? "Oczekiwana dokumentacja:" : "Wynik lub przykład:") + "</strong> " + printValue(hint) + "</p><div class=\"print-task-fields\">" + printField("Właściciel", meta.owner) + printField("Termin", meta.due) + printField("Notatka", meta.notes, true) + printField(task.kind === "gate" ? "Dokumentacja / link" : "Wynik lub przykład / link", meta.evidence, true) + "</div></article>";
      }).join("");
      return "<section class=\"print-phase\" data-print-phase=\"" + esc(phase.id) + "\"><h2>Faza " + esc(phase.num) + ": " + esc(phase.title) + (selectedPhase() === phase.id ? " – bieżący widok" : "") + "</h2><p class=\"print-phase-meta\">" + phaseCount.actionsDone + " / " + phaseCount.actionsTotal + " działań, " + phaseCount.gatesDone + " / " + phaseCount.gatesTotal + " warunków decyzji, " + phaseCount.na + " N/A</p><div class=\"print-task-list\">" + tasks + "</div></section>";
    }).join("");
    snapshot.innerHTML = "<div class=\"print-cover\"><div class=\"eyebrow\">AI Plan dla MŚP · wydruk roboczy</div><h1>Kopia planu – wszystkie fazy</h1><p>Zakres wydruku: pełny lokalny plan jednego zadania, wszystkie cztery fazy, działania i listy warunków. Bieżący widok: " + esc(currentPhase.title) + ". Wygenerowano: " + esc(new Date().toLocaleString("pl-PL")) + ".</p></div><section class=\"print-project\"><h2>Dane zadania i stan planu</h2>" + printField("Zadanie", project.task) + printField("Osoba odpowiedzialna", project.owner) + printField("Pożądana poprawa", project.improvement, true) + printField("Kryterium sukcesu", project.successCriterion, true) + printField("Następny krok", project.nextStep, true) + printField("Kontekst", (project.context || []).map((key) => CONTEXT_LABELS[key] || key).join(", ")) + printField("Faza bieżąca", project.phaseOverride || "Automatyczna faza ostatniego zadania") + "<p><strong>Postęp działań:</strong> " + counts.actionsDone + " / " + counts.actionsTotal + "; <strong>warunki decyzji:</strong> " + counts.gatesDone + " / " + counts.gatesTotal + "; <strong>N/A:</strong> " + counts.na + "</p>" + printField("Notatka planu", project.notes, true) + printField("Wynik lub przykład planu", project.evidence, true) + printField("Kwarantanna", state.quarantined.join("; ")) + printField("Błędy kontraktu", state.validationErrors.join("; ")) + "</section>" + phases;
    snapshot.dataset.scope = "all-phases";
    snapshot.dataset.currentPhase = currentPhase.id;
  }

  function renderAll() {
    renderStepper();
    phasesEl.innerHTML = DATA.phases.map(renderPhase).join("");
    renderOngoing(); renderRegulation(); renderChallenges(); renderMetrics(); renderContentAdditions();
    const counts = countAll();
    $("#heroMeta").textContent = `${DATA.phases.length} fazy · ${counts.actionsAll} działań + ${counts.gatesTotal} warunków decyzji · aktualizacja ${DATA.meta.updated}`;
    renderProgress(false); renderPlan(); renderPrintSnapshot(); icons();
  }

  // ─── Render: local working view ───
  function firstRemainingTask(phaseId) {
    return phaseTaskIds(phaseId).find((id) => !taskDone(id) && !taskNa(id)) || "";
  }

  function selectedPhase() {
    return state.selectedPhase || state.plan.project.phaseOverride || state.plan.lastPhaseId || DATA.phases[0].id;
  }

  function renderPhaseNav() {
    const nav = $("#planPhaseNav");
    nav.innerHTML = `<h3>Faza</h3>` + DATA.phases.map((phase) => {
      const count = countPhase(phase.id);
      return `<button type="button" data-plan-phase="${esc(phase.id)}" class="${selectedPhase() === phase.id ? "is-active" : ""}">${esc(phase.title)}<small>${count.actionsDone}/${count.actionsTotal} działań · ${count.gatesDone}/${count.gatesTotal} warunków decyzji</small></button>`;
    }).join("");
  }

  function renderResume() {
    const fallbackPhase = selectedPhase();
    const lastId = CATALOG.knownIds.has(state.plan.lastTaskId) && !taskDone(state.plan.lastTaskId) && !taskNa(state.plan.lastTaskId) ? state.plan.lastTaskId : firstRemainingTask(fallbackPhase);
    const task = lastId ? CATALOG.tasks.get(lastId) : null;
    const phase = task ? phaseInfo(task.phaseId) : phaseInfo(fallbackPhase);
    const resume = $("#resumeCard");
    if (!task) {
      resume.innerHTML = `<h3>Plan ma zapisany stan</h3><p>Nie ma jeszcze ostatniego zadania. Wybierz fazę i zacznij od pierwszego działania.</p>`;
      return;
    }
    resume.innerHTML = `<h3>Kontynuuj: ${esc(phase.title)}</h3><p>${esc(task.text)}</p><button class="pill pill-solid" type="button" data-resume-task="${esc(task.id)}">Otwórz zadanie</button>`;
  }

  function renderPlan() {
    if (!state.plan) return;
    const phase = phaseInfo(selectedPhase());
    const phaseIdsHere = phaseTaskIds(phase.id);
    const ids = state.remainingOnly ? phaseIdsHere.filter((id) => !taskDone(id) && !taskNa(id)) : phaseIdsHere;
    renderPhaseNav(); renderResume();
    const paths = DATA.pathOptions || {};
    $("#pathOptions").innerHTML = `<article><h3>Minimum</h3><ul>${(paths.minimum || []).map((item) => `<li>${esc(item)}</li>`).join("")}</ul></article><article><h3>Rozszerzenie</h3><ul>${(paths.extended || []).map((item) => `<li>${esc(item)}</li>`).join("")}</ul></article>`;
    $("#phaseOverride").innerHTML = DATA.phases.map((item) => `<option value="${esc(item.id)}">${esc(item.num)}. ${esc(item.title)}</option>`).join("");
    $("#phaseOverride").value = state.plan.project.phaseOverride || phase.id;
    $("#projectTask").value = state.plan.project.task;
    $("#projectOwner").value = state.plan.project.owner;
    $("#projectImprovement").value = state.plan.project.improvement;
    $("#projectSuccess").value = state.plan.project.successCriterion;
    $("#projectNextStep").value = state.plan.project.nextStep;
    $("#projectNotes").value = state.plan.project.notes;
    $("#projectEvidence").value = state.plan.project.evidence;
    document.querySelectorAll("input[data-context]").forEach((input) => { input.checked = state.plan.project.context.includes(input.dataset.context); });
    renderLegacyNotice();
    renderContextGuidance();
    $("#btnRemaining").setAttribute("aria-pressed", state.remainingOnly ? "true" : "false");
    $("#btnRemaining").classList.toggle("is-active", state.remainingOnly);
    const phaseCount = countPhase(phase.id);
    const remainingActions = applicableActionIds(phase.id).filter((id) => !taskDone(id)).length;
    const remainingGates = gateIds(phase.id).filter((id) => !taskDone(id)).length;
    $("#planMeta").textContent = `${remainingActions} działań pozostało · ${remainingGates} warunków decyzji pozostało w fazie ${phase.num}${phaseCount.na ? ` · ${phaseCount.na} N/A` : ""}`;
    $("#planTasks").innerHTML = ids.length ? ids.map((id) => {
      const task = CATALOG.tasks.get(id);
      const meta = taskMeta(id);
      const done = taskDone(id);
      const na = taskNa(id);
      const details = [meta.owner && `właściciel: ${meta.owner}`, meta.due && `termin: ${meta.due}`, meta.evidence && `wynik lub przykład: ${meta.evidence}`].filter(Boolean).join(" · ");
      const evidenceHint = task.output || task.hint || (task.kind === "gate" ? "Wynik lub dokumentacja warunku decyzji." : "Wynik lub przykład zapisany przy zadaniu.");
      const groupTitle = task.group || (task.kind === "gate" ? "Warunki decyzji" : "Działania");
      const kindLabel = task.kind === "gate" ? "Warunek decyzji" : task.optional ? "Opcjonalne działanie" : "Działanie";
      return `<article class="plan-task-card" data-task-card="${esc(id)}" data-kind="${task.kind}" data-done="${done ? "true" : "false"}"><div class="task-line"><input type="checkbox" data-task="${esc(id)}" data-kind="${esc(task.kind)}"${done ? " checked" : ""}${na ? " disabled" : ""} aria-label="${esc(task.text)}"><div><div class="task-card-kind">${esc(kindLabel)}</div><h3>${esc(groupTitle)}</h3><p>${esc(task.text)}</p></div></div><div class="task-card-meta">${esc(evidenceHint)}</div>${na ? `<div class="task-card-meta">N/A: ${esc(state.plan.na[id])}</div>` : ""}${details ? `<div class="task-card-meta">${esc(details)}</div>` : ""}${meta.notes ? `<div class="task-card-meta task-card-notes">Notatka: ${esc(meta.notes)}</div>` : ""}<div class="task-card-actions"><button class="pill pill-ghost" type="button" data-task-details="${esc(id)}">Szczegóły</button>${task.kind === "action" ? `<button class="pill pill-ghost" type="button" data-task-na="${esc(id)}">${na ? "Usuń N/A" : "Nie dotyczy"}</button>` : ""}</div></article>`;
    }).join("") : `<div class="resume-card"><h3>Brak zadań do pokazania</h3><p>W tej fazie wszystko jest odhaczone albo oznaczone jako N/A. Możesz wybrać inną fazę.</p></div>`;
  }

  function setMode(mode, options = {}) {
    state.mode = mode;
    try { localStorage.setItem(MODE_KEY, mode); } catch (error) { /* view preference is optional */ }
    document.body.dataset.mode = mode;
    const workbench = $("#plan");
    workbench.hidden = mode !== "plan";
    $("#btnGuideMode").classList.toggle("is-active", mode === "guide");
    $("#btnPlanMode").classList.toggle("is-active", mode === "plan");
    $("#btnGuideMode").setAttribute("aria-pressed", mode === "guide" ? "true" : "false");
    $("#btnPlanMode").setAttribute("aria-pressed", mode === "plan" ? "true" : "false");
    if (mode === "plan") {
      renderPlan();
      if (options.focus) {
        requestAnimationFrame(() => {
          workbench.scrollIntoView({ behavior: REDUCED_MOTION ? "auto" : "smooth", block: "start" });
          const resume = $("#resumeCard");
          if (resume) { resume.setAttribute("tabindex", "-1"); resume.focus({ preventScroll: true }); }
        });
      }
    }
  }

  // ─── Behaviour: dots, reveal, nav ───
  function initDots(canvas) {
    const context = canvas.getContext("2d");
    const dots = [];
    function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
    resize(); window.addEventListener("resize", resize);
    for (let index = 0; index < 70; index += 1) dots.push({ x: Math.random(), y: Math.random(), r: 1 + Math.random() * 2.2, vx: (Math.random() - 0.5) * 0.0004, vy: (Math.random() - 0.5) * 0.0004, o: 0.12 + Math.random() * 0.5 });
    function frame() {
      context.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach((dot) => { dot.x = (dot.x + dot.vx + 1) % 1; dot.y = (dot.y + dot.vy + 1) % 1; context.beginPath(); context.arc(dot.x * canvas.width, dot.y * canvas.height, dot.r, 0, Math.PI * 2); context.fillStyle = `rgba(210, 7, 87, ${dot.o})`; context.fill(); });
      if (!REDUCED_MOTION) requestAnimationFrame(frame);
    }
    frame();
  }

  function initReveal() {
    const elements = document.querySelectorAll(".reveal");
    if (REDUCED_MOTION || !("IntersectionObserver" in window)) { elements.forEach((element) => element.classList.add("visible")); return; }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); } }), { threshold: 0.08 });
    elements.forEach((element) => observer.observe(element));
  }

  function initMobileNav() {
    const button = $(".nav-burger"); const links = $(".nav-links");
    function close() { links.classList.remove("open"); button.setAttribute("aria-expanded", "false"); }
    button.addEventListener("click", () => { const open = links.classList.toggle("open"); button.setAttribute("aria-expanded", open ? "true" : "false"); });
    links.addEventListener("click", (event) => { if (event.target.closest("a")) close(); });
  }

  function initActiveNav() {
    const links = Array.from(document.querySelectorAll(".nav-links a:not(.nav-cta)"));
    const targets = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (!entry.isIntersecting) return; const id = `#${entry.target.id}`; links.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === id || (id.startsWith("#faza-") && link.getAttribute("href") === "#faza-1"))); }), { rootMargin: "-40% 0px -55% 0px" });
    targets.forEach((target) => observer.observe(target)); document.querySelectorAll(".phase").forEach((target) => observer.observe(target));
    const railLinks = Array.from(railListEl.querySelectorAll("a[data-rail]"));
    const railObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      document.body.dataset.activeSection = entry.target.id;
      railLinks.forEach((link) => {
        const active = link.dataset.rail === entry.target.id;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "true"); else link.removeAttribute("aria-current");
      });
    }), { rootMargin: "-40% 0px -55% 0px" });
    railLinks.forEach((link) => { const target = document.getElementById(link.dataset.rail); if (target) railObserver.observe(target); });
  }

  // ─── Listeners ───
  function onTaskChange(box) {
    const id = box.dataset.task;
    if (box.checked) { state.plan.done[id] = 1; delete state.plan.na[id]; } else delete state.plan.done[id];
    state.plan.lastTaskId = id;
    const task = CATALOG.tasks.get(id); if (task) state.plan.lastPhaseId = task.phaseId;
    const invalidated = invalidateDecisionForTask(id);
    touchPlan(); saveAndRender(true);
    if (invalidated) toast("Zmieniono warunek, więc wcześniejsza decyzja nie jest już aktualna.");
  }

  function openTaskEditor(id, opener) {
    const task = CATALOG.tasks.get(id); if (!task) return;
    state.currentTaskId = id;
    const meta = taskMeta(id);
    $("#taskDialogTitle").textContent = task.kind === "gate" ? "Szczegóły warunku decyzji" : "Szczegóły działania";
    $("#taskDialogText").textContent = task.text;
    $("#taskOwner").value = meta.owner;
    $("#taskDue").value = meta.due;
    $("#taskNotes").value = meta.notes;
    $("#taskEvidence").value = meta.evidence;
    $("#taskEvidenceLabel").textContent = task.kind === "gate" ? "Dokumentacja / link" : "Wynik lub przykład / link";
    $("#taskNaReason").value = state.plan.na[id] || "";
    $("#taskNaRow").hidden = task.kind !== "action";
    openDialog(taskEl, opener);
  }

  function saveTaskEditor(event) {
    event.preventDefault();
    const id = state.currentTaskId; if (!id) return;
    state.plan.taskMeta[id] = { owner: $("#taskOwner").value, due: $("#taskDue").value, notes: $("#taskNotes").value, evidence: $("#taskEvidence").value };
    const previousNa = state.plan.na[id] || "";
    const naReason = $("#taskNaReason").value.trim();
    if (naReason && CATALOG.tasks.get(id).kind === "action") { state.plan.na[id] = naReason; delete state.plan.done[id]; }
    else if (!naReason) delete state.plan.na[id];
    const invalidated = previousNa !== naReason && invalidateDecisionForTask(id);
    touchPlan(); const saved = persistPlan();
    closeDialog(taskEl); renderProgress(true); renderPlan(); renderPrintSnapshot();
    toast(saved ? (invalidated ? "Zapisano zmianę i unieważniono poprzednią decyzję" : "Zapisano szczegóły zadania") : "Szczegóły są tylko w pamięci. Pobierz kopię.");
  }

  function resetPlan() {
    if (!state.plan) return;
    const before = JSON.parse(JSON.stringify(state.plan));
    before.undoSnapshot = null;

    state.plan = CORE.createDefaultPlan(DATA);
    state.selectedPhase = "";
    state.plan.undoSnapshot = before;
    touchPlan({ keepUndo: true }); const saved = persistPlan();
    renderAll(); setMode(state.mode);
    toast(saved ? "Plan wyczyszczony. Możesz cofnąć tę zmianę." : "Plan wyczyszczony tylko w pamięci. Pobierz kopię.", true);
  }

  function undoReset() {
    if (!state.plan || !state.plan.undoSnapshot) return;
    const snapshot = JSON.parse(JSON.stringify(state.plan.undoSnapshot));
    snapshot.undoSnapshot = null;

    state.plan = snapshot;
    touchPlan(); const saved = persistPlan();
    renderAll(); setMode(state.mode); toast(saved ? "Przywrócono plan sprzed czyszczenia" : "Przywrócono plan tylko w pamięci. Pobierz kopię.");
  }

  function exportBackup() {
    try {
      const content = CORE.exportPlan(state.plan, DATA);
      const blob = new Blob([content], { type: "application/json" });
      const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `ai-plan-${new Date().toISOString().slice(0, 10)}.json`; link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000); toast("Pobrano kopię planu");
    } catch (error) { toast("Nie udało się przygotować kopii. Sprawdź diagnostykę."); }
  }

  function importBackup(file) {
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) { toast("Plik jest za duży (maks. 1 MB)"); return; }
    if (!askDiscard("Masz niezapisane zmiany. Wczytać kopię i je zastąpić?")) return;
    const importRevision = state.revision;
    const reader = new FileReader();
    reader.onerror = () => toast("Nie udało się odczytać pliku");
    reader.onload = () => {
      if (state.revision !== importRevision) {
        toast("Wczytywanie kopii anulowane: plan zmienił się podczas odczytu.");
        return;
      }
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed && typeof parsed === "object" && Number(parsed.schemaVersion) < CORE.SCHEMA_VERSION) {
          toast("Kopia starego planu (v2/v3) nie pasuje do planu dla MŚP. Dane bieżącego planu nie zostały zmienione.");
          return;
        }
        const checked = CORE.validatePlan(parsed, DATA);
        if (!checked.ok) { toast(`Kopia odrzucona: ${checked.errors.concat(checked.unknown.map((id) => `nieznane ID ${id}`)).slice(0, 2).join("; ")}`); return; }
        state.revision += 1;

        state.plan = checked.plan; state.dirty = false; state.quarantined = checked.plan.quarantine.slice(); state.validationErrors = [];
        const saved = persistPlan();
        renderAll(); setMode(state.mode);
        toast(saved ? (hasQuarantineNotice() ? "Wczytano kopię planu z zachowaną kwarantanną" : "Wczytano kopię planu") : "Wczytano kopię tylko w pamięci. Pobierz ją ponownie lub spróbuj zapisać.");
      } catch (error) { toast("Kopia odrzucona: niepoprawny JSON"); }
    };
    reader.readAsText(file);
  }

  function runDiagnostics() {
    const result = window.ROADMAP_CHECK();
    $("#diagnosticsText").textContent = JSON.stringify(result, null, 2);
    return result;
  }

  function hasPlanData() {
    if (!state.plan) return false;
    const project = state.plan.project || {};
    return Boolean(project.task || project.owner || project.improvement || project.successCriterion || project.nextStep || (project.context && project.context.length) || project.phaseOverride || project.notes || project.evidence)
      || Object.keys(state.plan.done || {}).length > 0
      || Object.keys(state.plan.taskMeta || {}).length > 0
      || Object.keys(state.plan.na || {}).length > 0
      || Object.keys(state.plan.decisions || {}).length > 0
      || Boolean(state.plan.lastTaskId)
      || Boolean(state.plan.lastPhaseId && state.plan.lastPhaseId !== DATA.phases[0].id)
      || Boolean(state.plan.undoSnapshot)
      || state.plan.quarantine.length > 0
      || state.quarantined.length > 0
      || state.validationErrors.length > 0;
  }

  function acknowledgeQuarantine() {
    state.quarantined = [];
    state.validationErrors = [];
    state.plan.quarantine = [];
    state.revision += 1;
    state.dirty = true;
    const saved = persistPlan();
    renderAll();
    setMode(state.mode);
    toast(saved ? "Kwarantanna potwierdzona, plan zapisany" : "Kwarantanna usunięta tylko w pamięci. Pobierz kopię.");
  }

  function bindListeners() {
    document.addEventListener("change", (event) => {
      const box = event.target.closest("input[data-task]");
      if (box && !box.disabled) onTaskChange(box);
    });
    document.addEventListener("click", (event) => {
      const anchor = event.target.closest("a[href^='#']");
      if (anchor && !anchor.closest("#plan")) {
        const href = anchor.getAttribute("href");
        if (href === "#plan") {
          event.preventDefault();
          setMode("plan", { focus: true });
          if (anchor.dataset.startPlan === "idea") {
            requestAnimationFrame(() => { const task = $("#projectTask"); if (task) task.focus(); });
          }
          return;
        }
        if (state.mode === "plan") {
          const target = document.querySelector(href);
          if (target) {
            event.preventDefault();
            setMode("guide");
            requestAnimationFrame(() => target.scrollIntoView({ behavior: REDUCED_MOTION ? "auto" : "smooth", block: "start" }));
            return;
          }
        }
      }
      if (event.target.closest("[data-ack-quarantine]")) { acknowledgeQuarantine(); return; }
      const details = event.target.closest("[data-task-details]"); if (details) { openTaskEditor(details.dataset.taskDetails, details); return; }
      const na = event.target.closest("[data-task-na]"); if (na) { if (state.plan.na[na.dataset.taskNa]) { const invalidated = invalidateDecisionForTask(na.dataset.taskNa); delete state.plan.na[na.dataset.taskNa]; touchPlan(); const saved = persistPlan(); renderProgress(true); renderPlan(); renderPrintSnapshot(); toast(saved ? (invalidated ? "Usunięto N/A i unieważniono poprzednią decyzję" : "Usunięto oznaczenie N/A") : "Usunięto N/A tylko w pamięci. Pobierz kopię."); } else openTaskEditor(na.dataset.taskNa, na); return; }
      const phaseButton = event.target.closest("[data-plan-phase]"); if (phaseButton) { state.selectedPhase = phaseButton.dataset.planPhase; renderPlan(); return; }
      const resume = event.target.closest("[data-resume-task]"); if (resume) { const task = CATALOG.tasks.get(resume.dataset.resumeTask); if (task) { state.selectedPhase = task.phaseId; renderPlan(); const card = document.querySelector(`[data-task-card="${CSS.escape(task.id)}"]`); if (card) card.scrollIntoView({ behavior: REDUCED_MOTION ? "auto" : "smooth", block: "center" }); } return; }
    });
    $("#projectForm").addEventListener("input", (event) => {
      const field = event.target;
      if (field.id === "projectTask") state.plan.project.task = field.value;
      if (field.id === "projectOwner") state.plan.project.owner = field.value;
      if (field.id === "projectImprovement") state.plan.project.improvement = field.value;
      if (field.id === "projectSuccess") state.plan.project.successCriterion = field.value;
      if (field.id === "projectNextStep") state.plan.project.nextStep = field.value;
      if (field.id === "projectNotes") state.plan.project.notes = field.value;
      if (field.id === "projectEvidence") state.plan.project.evidence = field.value;
      invalidateProjectDecisions();
      touchPlan();
    });
    $("#projectForm").addEventListener("change", (event) => {
      const field = event.target;
      if (!field.matches("input[data-context]")) return;
      const contexts = new Set(state.plan.project.context || []);
      if (field.checked) contexts.add(field.dataset.context);
      else contexts.delete(field.dataset.context);
      state.plan.project.context = Array.from(contexts);
      invalidateProjectDecisions();
      touchPlan();
      renderContextGuidance();
      renderPrintSnapshot();
    });
    $("#phaseOverride").addEventListener("change", (event) => { state.plan.project.phaseOverride = event.target.value; state.plan.lastPhaseId = event.target.value; state.selectedPhase = event.target.value; invalidateProjectDecisions(); touchPlan(); persistPlan(); renderPlan(); });
    $("#btnRemaining").addEventListener("click", () => { state.remainingOnly = !state.remainingOnly; renderPlan(); });
    $("#btnPlanAll").addEventListener("click", () => { state.remainingOnly = false; renderPlan(); });
    $("#btnGuideMode").addEventListener("click", () => setMode("guide"));
    $("#btnPlanMode").addEventListener("click", () => setMode("plan", { focus: true }));
    $("#btnReset").addEventListener("click", () => { if (!hasPlanData()) { toast("Plan jest już pusty"); return; } openDialog(resetEl, $("#btnReset")); });
    $("#btnResetCancel").addEventListener("click", () => closeDialog(resetEl));
    $("#btnResetConfirm").addEventListener("click", () => { closeDialog(resetEl); resetPlan(); });
    $("#btnUndo").addEventListener("click", undoReset);
    $("#btnExport").addEventListener("click", exportBackup);
    $("#btnImport").addEventListener("click", () => $("#importFile").click());
    $("#importFile").addEventListener("change", (event) => { importBackup(event.target.files[0]); event.target.value = ""; });
    $("#btnTaskCancel").addEventListener("click", () => closeDialog(taskEl));
    $("#taskEditor").addEventListener("submit", saveTaskEditor);
    $("#btnHelp").addEventListener("click", () => openDialog(helpEl, $("#btnHelp")));
    $("#btnHelpClose").addEventListener("click", () => closeDialog(helpEl));
    helpEl.addEventListener("click", (event) => { if (event.target === helpEl) closeDialog(helpEl); });
    resetEl.addEventListener("click", (event) => { if (event.target === resetEl) closeDialog(resetEl); });
    taskEl.addEventListener("click", (event) => { if (event.target === taskEl) closeDialog(taskEl); });
    $("#btnPrint").addEventListener("click", () => { renderPrintSnapshot(); window.print(); });
    $("#btnDiagnostics").addEventListener("click", runDiagnostics);
    $("#saveStatus").addEventListener("click", (event) => { if (event.target.closest("[data-ack-quarantine]")) return; if (state.storageState !== "saved") { if (persistPlan()) toast("Ponowiono zapis lokalny"); else exportBackup(); } });
    $("#planSaveStatus").addEventListener("click", (event) => { if (event.target.closest("[data-ack-quarantine]")) return; if (state.storageState !== "saved") { if (persistPlan()) toast("Ponowiono zapis lokalny"); else exportBackup(); } });
    document.querySelectorAll("[data-retry-save]").forEach((button) => button.addEventListener("click", (event) => { event.stopPropagation(); if (persistPlan()) toast("Ponowiono zapis lokalny"); else exportBackup(); }));
    window.addEventListener("beforeprint", renderPrintSnapshot);
    window.addEventListener("afterprint", () => { if (state.mode === "plan") renderPlan(); });
    document.addEventListener("keydown", (event) => {
      if (state.activeDialog) { if (event.key === "Escape") { closeDialog(); return; } trapDialog(event); return; }
      if (event.target.matches("input, textarea, select") || event.ctrlKey || event.metaKey || event.altKey) return;
      const go = (selector) => { const target = document.querySelector(selector); if (target) target.scrollIntoView({ behavior: REDUCED_MOTION ? "auto" : "smooth" }); };
      if (event.key >= "1" && event.key <= "4") go(`#faza-${event.key}`); else if (event.key === "0") go("#top"); else if (event.key === "p" || event.key === "P") go("#przeglad"); else if (event.key === "r" || event.key === "R") go("#regulacje"); else if (event.key === "?") openDialog(helpEl, $("#btnHelp"));
    });
  }

  // ─── Probe (DOM contract) ───
  window.ROADMAP_CHECK = function () {
    if (!CATALOG) return { phases: DATA && DATA.phases ? DATA.phases.length : 0, tasks: 0, gates: 0, storageState: "error", quarantined: 0, validationErrors: 1, mode: state.mode, currentPhase: "", remainingActions: 0, remainingGates: 0, errors: [catalogError || "Brak katalogu zadań"] };
    const errors = [];
    document.querySelectorAll(".bento").forEach((grid, index) => {
      const sum = Array.from(grid.children).reduce((total, child) => total + Number((child.className.match(/cell-(\d)/) || [0, 0])[1]), 0);
      if (sum % 6 !== 0) errors.push(`bento ${index}: spans sum ${sum}`);
    });
    const boxes = document.querySelectorAll("input[data-task]").length;
    if (boxes < CATALOG.allIds.length) errors.push(`checkboxes ${boxes} < known tasks ${CATALOG.allIds.length}`);
    if (/\u2014/.test(document.body.innerText)) errors.push("em-dash in text");
    const dates = Array.from(document.querySelectorAll(".tl-item")).map((item) => item.dataset.date);
    if (dates.join() !== dates.slice().sort().join()) errors.push("timeline unsorted");
    if (!document.documentElement.classList.contains("app-ready")) errors.push("app not ready");
    const counts = countAll();
    if (Number(document.body.dataset.total) !== counts.actionsTotal) errors.push("action denominator mismatch");
    const current = countPhase(selectedPhase());
    const remainingActions = applicableActionIds(selectedPhase()).filter((id) => !taskDone(id)).length;
    const remainingGates = gateIds(selectedPhase()).filter((id) => !taskDone(id)).length;
    if (document.body.dataset.mode !== state.mode) errors.push("mode contract mismatch");
    if (Number(document.body.dataset.gatesTotal) !== counts.gatesTotal) errors.push("gate denominator mismatch");
    const railLinks = Array.from(document.querySelectorAll("#railList a[data-rail]"));
    if (railLinks.length !== railSections().length) errors.push(`rail links ${railLinks.length} != sections ${railSections().length}`);
    railLinks.forEach((link) => { if (!document.getElementById(link.dataset.rail)) errors.push(`rail target #${link.dataset.rail} missing`); });
    return { phases: DATA.phases.length, tasks: CATALOG.actionIds.length, gates: CATALOG.gateIds.length, done: counts.actionsDone, progress: counts.actionsTotal ? Math.round(counts.actionsDone / counts.actionsTotal * 100) : 0, gatesDone: counts.gatesDone, storageState: state.storageState, quarantined: state.quarantined.length, validationErrors: state.validationErrors.length, mode: state.mode, currentPhase: current ? selectedPhase() : "", remainingActions, remainingGates, railLinks: railLinks.length, activeSection: document.body.dataset.activeSection || "", errors };
  };

  // ─── Init ───
  if (!DATA || !CORE || !CATALOG) { document.body.innerHTML = `<p style='padding:40px;font-family:monospace'>${esc(catalogError || "Brak pliku roadmap.js lub app-core.js")}</p>`; document.documentElement.classList.add("app-ready"); return; }
  loadInitialPlan();
  try { state.mode = localStorage.getItem(MODE_KEY) === "plan" ? "plan" : "guide"; } catch (error) { state.mode = "guide"; }
  renderAll(); renderRail(); bindListeners(); setMode(state.mode, { focus: state.mode === "plan" });
  document.querySelectorAll("canvas[data-dots]").forEach(initDots); initReveal(); initMobileNav(); initActiveNav();
  Promise.race([Promise.all(BRAND_FONTS.map((font) => document.fonts.load(font).catch(() => null))), new Promise((resolve) => setTimeout(resolve, FONT_WAIT_MS))]).then(() => document.documentElement.classList.add("app-ready"));
})();
