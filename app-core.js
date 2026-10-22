/* Core data contract for the local AI Plan workspace.
 * The file is deliberately a classic script so index.html also works from file://.
 * It exports the same small API through CommonJS for deterministic tests.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.AI_PLAN_CORE = api;
})(typeof window === "undefined" ? globalThis : window, function () {
  "use strict";

  const SCHEMA_VERSION = 4;
  const MAX_TEXT = 2000;
  const MAX_PROJECT_TASK = 180;
  const MAX_PROJECT_OWNER = 160;
  const MAX_PROJECT_IMPROVEMENT = 1200;
  const MAX_PROJECT_SUCCESS = 1600;
  const MAX_PROJECT_NEXT_STEP = 1200;
  const MAX_NOTES = 12000;
  const MAX_TASK_META = 3000;
  const MAX_QUARANTINE = 100;
  const MAX_NA_REASON = 500;
  const DECISION_STATUSES = new Set(["none", "continue", "retest", "stop"]);
  const CONTEXT_VALUES = new Set(["personalData", "externalOutput", "multipleTeams", "integration", "sensitiveDecision"]);

  function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function text(value, fallback = "") {
    return typeof value === "string" ? value : fallback;
  }

  function slug(value) {
    return text(value)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64) || "item";
  }

  function explicitId(value) {
    return isObject(value) && text(value.id).trim() ? text(value.id).trim() : "";
  }

  function normaliseTask(phase, stage, item, action) {
    const value = isObject(action) ? action : { text: action };
    const id = explicitId(action);
    if (!id) throw new Error(`Brak stabilnego ID działania w fazie ${phase.id}`);
    const taskText = text(value.text, text(action));
    return {
      id,
      text: taskText,
      optional: value.optional === true || /^opcjonalnie\b/i.test(taskText),
      hint: text(value.hint),
      output: text(value.output),
      group: text(item && item.title, "Działania"),
      stage: text(stage && stage.title, ""),
      phaseTitle: text(phase && phase.title, "")
    };
  }

  function buildTaskCatalog(data) {
    const actionIds = [];
    const gateIds = [];
    const tasks = new Map();
    const legacyToStable = new Map();
    const phaseMap = new Map();
    const phases = Array.isArray(data && data.phases) ? data.phases : [];
    const aliases = isObject(data && data.legacyAliases) ? data.legacyAliases : {};
    const hints = isObject(data && data.taskHints) ? data.taskHints : {};

    phases.forEach((phase) => {
      const phaseActions = [];
      const phaseGates = [];
      (phase.stages || []).forEach((stage, stageIndex) => {
        (stage.items || []).forEach((item, itemIndex) => {
          (item.actions || []).forEach((action, actionIndex) => {
            const task = normaliseTask(phase, stage, item, action);
            const legacyId = `${phase.id}/${stageIndex}/${itemIndex}/${actionIndex}`;
            if (tasks.has(task.id)) throw new Error(`Powielone stabilne ID zadania: ${task.id}`);
            actionIds.push(task.id);
            phaseActions.push(task.id);
            tasks.set(task.id, { ...task, hint: task.hint || text(hints[task.id]), kind: "action", phaseId: phase.id, legacyId });
            legacyToStable.set(legacyId, task.id);
          });
        });
      });
      ((phase.gate && phase.gate.checks) || []).forEach((check) => {
        const value = isObject(check) ? check : { text: check };
        const id = explicitId(check);
        if (!id) throw new Error(`Brak stabilnego ID warunku decyzji w fazie ${phase.id}`);
        const task = {
          id,
          text: text(value.text, text(check)),
          optional: false,
          hint: text(value.hint) || text(hints[id]),
          output: text(value.output),
          group: "Warunki decyzji",
          stage: "Warunki decyzji",
          phaseTitle: text(phase && phase.title, "")
        };
        const checkIndex = phaseGates.length;
        const legacyId = `${phase.id}/gate/${checkIndex}`;
        if (tasks.has(id)) throw new Error(`Powielone stabilne ID zadania: ${id}`);
        gateIds.push(id);
        phaseGates.push(id);
        tasks.set(id, { ...task, kind: "gate", phaseId: phase.id, legacyId });
        legacyToStable.set(legacyId, id);
      });
      phaseMap.set(phase.id, { actionIds: phaseActions, gateIds: phaseGates });
    });

    Object.keys(aliases).forEach((legacyId) => {
      const stableId = text(aliases[legacyId]).trim();
      if (stableId && tasks.has(stableId)) legacyToStable.set(legacyId, stableId);
    });

    return {
      actionIds,
      gateIds,
      allIds: actionIds.concat(gateIds),
      knownIds: new Set(actionIds.concat(gateIds)),
      tasks,
      legacyToStable,
      phaseMap
    };
  }

  function countProgress(data, done, na) {
    const catalog = buildTaskCatalog(data);
    const selected = isObject(done) ? done : {};
    const excluded = isObject(na) ? na : {};
    const applicableActions = catalog.actionIds.filter((id) => !excluded[id]);
    const actionsDone = applicableActions.filter((id) => selected[id]).length;
    const gatesDone = catalog.gateIds.filter((id) => selected[id]).length;
    const actionsTotal = applicableActions.length;
    const gatesTotal = catalog.gateIds.length;
    return {
      actionsDone,
      actionsTotal,
      gatesDone,
      gatesTotal,
      totalDone: actionsDone + gatesDone,
      total: actionsTotal + gatesTotal,
      actionPercent: actionsTotal ? Math.round(actionsDone / actionsTotal * 100) : 0
    };
  }

  function migrateLegacyProgress(value, data) {
    const catalog = buildTaskCatalog(data);
    const source = isObject(value && value.done) ? value.done : (isObject(value) ? value : {});
    const done = {};
    const unknown = [];
    Object.keys(source).forEach((key) => {
      if (!source[key]) return;
      const id = catalog.knownIds.has(key) ? key : catalog.legacyToStable.get(key);
      if (id) done[id] = 1;
      else unknown.push(key);
    });
    return { done, unknown };
  }

  function bounded(value, max, label, errors) {
    if (typeof value !== "string") return "";
    if (value.length > max) errors.push(`${label}: zbyt długi tekst (maks. ${max} znaków)`);
    return value.slice(0, max);
  }

  function validDate(value) {
    if (value === "") return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parts = value.split("-").map(Number);
    const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    return date.getUTCFullYear() === parts[0]
      && date.getUTCMonth() === parts[1] - 1
      && date.getUTCDate() === parts[2];
  }

  function validUrl(value) {
    if (!value) return true;
    try {
      const url = new URL(value);
      return ["http:", "https:", "mailto:"].includes(url.protocol);
    } catch (error) {
      return false;
    }
  }

  function cleanDone(value, catalog, label, errors, unknown) {
    const output = {};
    if (value === undefined) return output;
    if (!isObject(value)) {
      errors.push(`${label}: oczekiwano obiektu`);
      return output;
    }
    Object.keys(value).forEach((id) => {
      if (!catalog.knownIds.has(id)) {
        unknown.push(id);
        return;
      }
      if (value[id] === true || value[id] === 1) output[id] = 1;
      else errors.push(`${label}.${id}: oczekiwano wartości true lub 1`);
    });
    return output;
  }

  function cleanNa(value, catalog, errors, unknown) {
    const output = {};
    if (value === undefined) return output;
    if (!isObject(value)) {
      errors.push("na: oczekiwano obiektu");
      return output;
    }
    Object.keys(value).forEach((id) => {
      if (!catalog.knownIds.has(id)) {
        unknown.push(id);
        return;
      }
      const task = catalog.tasks.get(id);
      if (!task || task.kind !== "action") {
        errors.push(`na.${id}: warunki decyzji nie mogą być oznaczone jako N/A`);
        return;
      }
      const reason = bounded(value[id], MAX_NA_REASON, `na.${id}`, errors).trim();
      if (!reason) {
        errors.push(`na.${id}: wymagany jest niepusty powód`);
        return;
      }
      output[id] = reason;
    });
    return output;
  }

  function cleanTaskMeta(value, catalog, errors, unknown) {
    const output = {};
    if (value === undefined) return output;
    if (!isObject(value)) {
      errors.push("taskMeta: oczekiwano obiektu");
      return output;
    }
    Object.keys(value).forEach((id) => {
      if (!catalog.knownIds.has(id)) {
        unknown.push(id);
        return;
      }
      const item = isObject(value[id]) ? value[id] : {};
      if (!isObject(value[id])) errors.push(`taskMeta.${id}: oczekiwano obiektu`);
      let due = text(item.due);
      let evidence = bounded(item.evidence, 1000, `taskMeta.${id}.evidence`, errors);
      if (!validDate(due)) {
        errors.push(`taskMeta.${id}.due: niepoprawna data`);
        due = "";
      }
      if (!validUrl(evidence)) {
        errors.push(`taskMeta.${id}.evidence: dozwolone są tylko http, https lub mailto`);
        evidence = "";
      }
      output[id] = {
        owner: bounded(item.owner, 160, `taskMeta.${id}.owner`, errors),
        due,
        notes: bounded(item.notes, MAX_TASK_META, `taskMeta.${id}.notes`, errors),
        evidence
      };
    });
    return output;
  }

  function cleanContext(value, errors) {
    if (value === undefined) return [];
    if (!Array.isArray(value)) {
      errors.push("project.context: oczekiwano tablicy");
      return [];
    }
    const output = [];
    value.forEach((item) => {
      const context = text(item).trim();
      if (!CONTEXT_VALUES.has(context)) {
        errors.push(`project.context: nieznany kontekst ${context || "(pusty)"}`);
        return;
      }
      if (!output.includes(context)) output.push(context);
    });
    return output;
  }

  function cleanDecisions(value, data, done, na, project, errors) {
    const output = {};
    if (value === undefined) return output;
    if (!isObject(value)) {
      errors.push("decisions: oczekiwano obiektu");
      return output;
    }
    const catalog = buildTaskCatalog(data);
    const phaseIds = new Set((data.phases || []).map((phase) => phase.id));
    Object.keys(value).forEach((phaseId) => {
      if (!phaseIds.has(phaseId)) {
        errors.push(`decisions.${phaseId}: nieznana faza`);
        return;
      }
      const decision = isObject(value[phaseId]) ? value[phaseId] : {};
      if (!isObject(value[phaseId])) errors.push(`decisions.${phaseId}: oczekiwano obiektu`);
      const status = text(decision.status, "none");
      const safeStatus = DECISION_STATUSES.has(status) ? status : "none";
      if (!DECISION_STATUSES.has(status)) errors.push(`decisions.${phaseId}.status: niepoprawny wybór`);
      const person = bounded(decision.person, 160, `decisions.${phaseId}.person`, errors).trim();
      const date = text(decision.date);
      const evidence = bounded(decision.evidence, 1000, `decisions.${phaseId}.evidence`, errors).trim();
      const notes = bounded(decision.notes, 2000, `decisions.${phaseId}.notes`, errors);
      const basis = text(decision.basis).slice(0, 80);
      const dateValid = validDate(date);
      const evidenceValid = validUrl(evidence);
      if (!dateValid) errors.push(`decisions.${phaseId}.date: niepoprawna data`);
      if (!evidenceValid) errors.push(`decisions.${phaseId}.evidence: niedozwolony adres`);
      const phase = catalog.phaseMap.get(phaseId);
      const gatesReady = Boolean(phase && phase.gateIds.length && phase.gateIds.every((id) => done[id] && !na[id]));
      const expectedBasis = decisionBasis(data, done, phaseId, na, project);
      let decisionValid = dateValid && evidenceValid;
      if (safeStatus !== "none") {
        if (!person || !date || !evidence) { errors.push(`decisions.${phaseId}: decyzja wymaga osoby, daty i dowodu`); decisionValid = false; }
        if (safeStatus === "continue" && !gatesReady) { errors.push(`decisions.${phaseId}: kontynuacja wymaga potwierdzonych warunków decyzji`); decisionValid = false; }
        if (!basis || basis !== expectedBasis) { errors.push(`decisions.${phaseId}: brak aktualnej podstawy decyzji`); decisionValid = false; }
      }
      const outputStatus = safeStatus !== "none" && decisionValid ? safeStatus : "none";
      output[phaseId] = {
        status: outputStatus,
        person,
        date: dateValid ? date : "",
        evidence: evidenceValid ? evidence : "",
        notes,
        basis: outputStatus === "none" ? "" : basis,
        phaseId
      };
    });
    return output;
  }

  function createDefaultPlan(data) {
    const firstPhase = data && data.phases && data.phases[0];
    return {
      schemaVersion: SCHEMA_VERSION,
      project: {
        task: "",
        owner: "",
        improvement: "",
        successCriterion: "",
        nextStep: "",
        context: [],
        phaseOverride: "",
        notes: "",
        evidence: ""
      },
      done: {},
      taskMeta: {},
      na: {},
      decisions: {},
      lastTaskId: "",
      lastPhaseId: firstPhase ? firstPhase.id : "",
      undoSnapshot: null,
      quarantine: [],
      updatedAt: ""
    };
  }

  function validatePlan(raw, data) {
    const errors = [];
    const unknown = [];
    if (!isObject(raw)) return { ok: false, errors: ["Plan musi być obiektem JSON"], unknown, plan: null };
    const supportedFields = new Set(["schemaVersion", "app", "exportedAt", "project", "done", "taskMeta", "na", "decisions", "lastTaskId", "lastPhaseId", "undoSnapshot", "quarantine", "updatedAt"]);
    Object.keys(raw).forEach((key) => {
      if (!supportedFields.has(key)) errors.push(`Nieobsługiwane pole: ${key}`);
    });
    if (raw.schemaVersion !== SCHEMA_VERSION) {
      if (Number(raw.schemaVersion) < SCHEMA_VERSION) errors.push("To jest zapis poprzedniego, rozbudowanego planu i nie może zostać wczytany do planu dla MŚP");
      else errors.push(`Nieobsługiwana wersja planu: ${raw.schemaVersion}`);
    }
    let catalog;
    try {
      catalog = buildTaskCatalog(data);
    } catch (error) {
      return { ok: false, errors: [error.message || "Niepoprawny katalog roadmapy"], unknown, plan: null };
    }
    const plan = createDefaultPlan(data);
    const project = raw.project === undefined ? {} : (isObject(raw.project) ? raw.project : {});
    if (raw.project !== undefined && !isObject(raw.project)) errors.push("project: oczekiwano obiektu");
    plan.project = {
      task: bounded(project.task, MAX_PROJECT_TASK, "project.task", errors),
      owner: bounded(project.owner, MAX_PROJECT_OWNER, "project.owner", errors),
      improvement: bounded(project.improvement, MAX_PROJECT_IMPROVEMENT, "project.improvement", errors),
      successCriterion: bounded(project.successCriterion, MAX_PROJECT_SUCCESS, "project.successCriterion", errors),
      nextStep: bounded(project.nextStep, MAX_PROJECT_NEXT_STEP, "project.nextStep", errors),
      context: cleanContext(project.context, errors),
      phaseOverride: text(project.phaseOverride),
      notes: bounded(project.notes, MAX_NOTES, "project.notes", errors),
      evidence: bounded(project.evidence, 1000, "project.evidence", errors)
    };
    const phaseIds = new Set((data.phases || []).map((phase) => phase.id));
    if (plan.project.phaseOverride && !phaseIds.has(plan.project.phaseOverride)) {
      errors.push("project.phaseOverride: nieznana faza");
      plan.project.phaseOverride = "";
    }
    if (!validUrl(plan.project.evidence)) {
      errors.push("project.evidence: dozwolone są tylko http, https lub mailto");
      plan.project.evidence = "";
    }
    plan.done = cleanDone(raw.done, catalog, "done", errors, unknown);
    plan.na = cleanNa(raw.na, catalog, errors, unknown);
    Object.keys(plan.na).forEach((id) => {
      if (plan.done[id]) {
        delete plan.done[id];
        errors.push(`done i N/A nie mogą występować jednocześnie dla ${id}`);
      }
    });
    plan.taskMeta = cleanTaskMeta(raw.taskMeta, catalog, errors, unknown);
    plan.decisions = cleanDecisions(raw.decisions, data, plan.done, plan.na, plan.project, errors);
    plan.lastTaskId = text(raw.lastTaskId);
    if (plan.lastTaskId && !catalog.knownIds.has(plan.lastTaskId)) {
      unknown.push(plan.lastTaskId);
      plan.lastTaskId = "";
    }
    const fallbackPhase = plan.project.phaseOverride || plan.lastPhaseId || (data.phases && data.phases[0] && data.phases[0].id) || "";
    plan.lastPhaseId = text(raw.lastPhaseId, fallbackPhase);
    if (!plan.lastPhaseId || !phaseIds.has(plan.lastPhaseId)) {
      if (plan.lastPhaseId) errors.push("lastPhaseId: nieznana faza");
      plan.lastPhaseId = plan.project.phaseOverride || (data.phases && data.phases[0] && data.phases[0].id) || "";
    }
    plan.updatedAt = text(raw.updatedAt).slice(0, 64);
    if (raw.quarantine !== undefined && !Array.isArray(raw.quarantine)) errors.push("quarantine: oczekiwano tablicy");
    plan.quarantine = Array.isArray(raw.quarantine)
      ? raw.quarantine.slice(0, MAX_QUARANTINE).map((item) => bounded(text(item), 500, "quarantine", errors)).filter(Boolean)
      : [];
    if (raw.undoSnapshot !== undefined && raw.undoSnapshot !== null) {
      const snapshot = validatePlan(raw.undoSnapshot, data);
      if (snapshot.ok && snapshot.plan) plan.undoSnapshot = snapshot.plan;
      else {
        errors.push("undoSnapshot: niepoprawny zapis");
        plan.undoSnapshot = null;
      }
    }
    plan.schemaVersion = SCHEMA_VERSION;
    return { ok: errors.length === 0 && unknown.length === 0, errors, unknown, plan };
  }

  function exportPlan(plan, data) {
    const checked = validatePlan({ ...plan, schemaVersion: SCHEMA_VERSION }, data);
    if (!checked.ok) throw new Error(checked.errors.concat(checked.unknown.map((id) => `Nieznane ID: ${id}`)).join("; "));
    return JSON.stringify({
      ...checked.plan,
      schemaVersion: SCHEMA_VERSION,
      app: "ai-plan",
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  function decisionBasis(data, done, phaseId, na, project) {
    const catalog = buildTaskCatalog(data);
    const phase = catalog.phaseMap.get(phaseId);
    if (!phase) return "";
    const ids = phase.actionIds.concat(phase.gateIds);
    const projectBasis = project ? JSON.stringify({
      task: text(project.task),
      owner: text(project.owner),
      improvement: text(project.improvement),
      successCriterion: text(project.successCriterion),
      nextStep: text(project.nextStep),
      context: Array.isArray(project.context) ? project.context.slice().sort() : [],
      phaseOverride: text(project.phaseOverride)
    }) : "";
    return digest(`${ids.map((id) => `${id}:${done && done[id] ? 1 : 0}:${na && na[id] ? 1 : 0}`).join("|")}::${projectBasis}`);
  }

  function digest(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function decisionIsStale(decision, data, done, na, project) {
    if (!decision || decision.status === "none") return false;
    if (!decision.basis) return true;
    const phases = data.phases || [];
    const phase = phases.find((item) => decision.phaseId === item.id);
    if (phase) return decision.basis !== decisionBasis(data, done, phase.id, na, project);
    return !phases.some((item) => decision.basis === decisionBasis(data, done, item.id, na, project));
  }

  return {
    SCHEMA_VERSION,
    MAX_TEXT,
    buildTaskCatalog,
    countProgress,
    createDefaultPlan,
    decisionBasis,
    decisionIsStale,
    digest,
    exportPlan,
    migrateLegacyProgress,
    slug,
    validatePlan,
    validDate
  };
});

