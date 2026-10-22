import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const core = require("../app-core.js");
global.window = {};
require("../roadmap.js");
const roadmap = global.window.ROADMAP;
const roadmapCatalog = core.buildTaskCatalog(roadmap);

assert.equal(core.SCHEMA_VERSION, 4);
assert.deepEqual(roadmap.phases.map((phase) => phase.title), [
  "Wybór zadania",
  "Test w praktyce",
  "Wprowadzenie do pracy",
  "Utrzymanie i rozwój"
]);
assert.equal(roadmapCatalog.actionIds.length, 20);
assert.equal(roadmapCatalog.gateIds.length, 12);
assert.deepEqual(roadmap.phases.map((phase) => roadmapCatalog.phaseMap.get(phase.id).actionIds.length), [5, 5, 5, 5]);
assert.ok(roadmapCatalog.actionIds.every((id) => id.startsWith("sme.")));
assert.ok(roadmapCatalog.actionIds.every((id) => !/^fundament|^pilotaz|^wdrozenie|^integracja/.test(id)));
assert.ok(roadmap.phases.every((phase) => phase.stages.every((stage) => stage.items.every((item) => item.actions.every((action) => typeof action.id === "string" && action.id.length > 0)))));
assert.ok(roadmap.phases.every((phase) => phase.gate.checks.every((check) => typeof check.id === "string" && check.id.length > 0)));
assert.ok(roadmapCatalog.actionIds.every((id) => !/^((Wyznacz|Ustal|Wybierz|Określ|Przygotuj|Sprawdź|Oceń|Opracuj|Przedstaw|Zbierz|Zaktualizuj|Połącz|Rozważ|Podejmij|Zapisz|Wprowadź|Zdefiniuj|Zamów|Załóż|Przeanalizuj|Zacznij|Przejdź|Mierz|Prowadź|Włącz|Dodaj|Uruchom|Rozdaj|Podpisz|Skonfiguruj|Zrób|Wersjonuj|Zamroź|Dokumentuj|Poprawiaj|Śledź|Wdrażaj|Sformalizuj|Wzmocnij|Organizuj|Twórz|Wskaż)\b)/i.test(roadmapCatalog.tasks.get(id).text)));
assert.ok(roadmapCatalog.actionIds.every((id) => roadmapCatalog.tasks.get(id).optional === false));
assert.match(roadmapCatalog.tasks.get("sme.choice.action.002").text, /^Wyznaczenie/);
assert.match(roadmapCatalog.tasks.get("sme.test.action.004").text, /^Porównanie/);
assert.match(roadmapCatalog.tasks.get("sme.keep.action.004").text, /^Ustalenie/);
assert.match(roadmapCatalog.tasks.get("sme.keep.action.005").text, /^Podjęcie/);

const editedRoadmap = structuredClone(roadmap);
editedRoadmap.phases[0].stages[0].items[0].actions[0].text = "Zmienione brzmienie zachowuje tożsamość działania.";
assert.equal(core.buildTaskCatalog(editedRoadmap).actionIds[0], roadmapCatalog.actionIds[0]);

const fixture = {
  phases: [
    {
      id: "foundation",
      stages: [{
        title: "Ustalenia",
        items: [{
          id: "owner",
          title: "Odpowiedzialność",
          actions: [
            { id: "foundation.owner.1", text: "Wyznaczenie osoby." },
            { id: "foundation.owner.2", text: "Ustalenie zakresu." }
          ]
        }]
      }],
      gate: { checks: [{ id: "foundation.gate.1", text: "Warunek jest spełniony." }] }
    }
  ]
};

const catalog = core.buildTaskCatalog(fixture);
assert.deepEqual(catalog.actionIds, ["foundation.owner.1", "foundation.owner.2"]);
assert.deepEqual(catalog.gateIds, ["foundation.gate.1"]);

const counts = core.countProgress(fixture, {
  "foundation.owner.1": 1,
  "foundation.gate.1": 1
});
assert.deepEqual(counts, {
  actionsDone: 1,
  actionsTotal: 2,
  gatesDone: 1,
  gatesTotal: 1,
  totalDone: 2,
  total: 3,
  actionPercent: 50
});
assert.equal(core.countProgress(fixture, { "foundation.owner.1": 1 }, { "foundation.owner.2": "poza zakresem" }).actionsTotal, 1);
assert.equal(core.countProgress(fixture, { "foundation.owner.1": 1 }, { "foundation.owner.2": "poza zakresem" }).actionPercent, 100);

const legacy = core.migrateLegacyProgress({
  "foundation/0/0/0": 1,
  "foundation/gate/0": 1,
  "old/unknown": 1
}, fixture);
assert.deepEqual(legacy.done, {
  "foundation.owner.1": 1,
  "foundation.gate.1": 1
});
assert.deepEqual(legacy.unknown, ["old/unknown"]);

const plan = core.createDefaultPlan(fixture);
assert.deepEqual(plan.project, {
  task: "",
  owner: "",
  improvement: "",
  successCriterion: "",
  nextStep: "",
  context: [],
  phaseOverride: "",
  notes: "",
  evidence: ""
});
plan.project.task = "Odpowiedzi na pytania klientów";
plan.project.owner = "Ala";
plan.project.improvement = "Skrócenie czasu pierwszej odpowiedzi";
plan.project.successCriterion = "Mediana poniżej 4 godzin bez wzrostu liczby poprawek";
plan.project.nextStep = "Przygotowanie 20 reprezentatywnych przykładów";
plan.project.context = ["personalData", "externalOutput"];
plan.done["foundation.owner.1"] = 1;
plan.taskMeta["foundation.owner.1"] = {
  owner: "Ala",
  due: "2026-11-01",
  notes: "Osoba i zakres ustalone",
  evidence: "https://example.test/mandate"
};
plan.decisions.foundation = {
  status: "retest",
  person: "Ala",
  date: "2026-10-22",
  evidence: "https://example.test/retest",
  basis: core.decisionBasis(fixture, plan.done, "foundation", plan.na, plan.project),
  phaseId: "foundation"
};

const exported = core.exportPlan(plan, fixture);
const imported = core.validatePlan(JSON.parse(exported), fixture);
assert.equal(imported.ok, true);
assert.equal(imported.plan.project.task, "Odpowiedzi na pytania klientów");
assert.equal(imported.plan.project.improvement, "Skrócenie czasu pierwszej odpowiedzi");
assert.equal(imported.plan.project.successCriterion, "Mediana poniżej 4 godzin bez wzrostu liczby poprawek");
assert.equal(imported.plan.project.nextStep, "Przygotowanie 20 reprezentatywnych przykładów");
assert.deepEqual(imported.plan.project.context, ["personalData", "externalOutput"]);
assert.equal(imported.plan.taskMeta["foundation.owner.1"].owner, "Ala");

const oldEnterprisePlan = core.validatePlan({
  schemaVersion: 3,
  app: "ai-plan",
  project: { name: "Stary plan enterprise" },
  done: { "foundation.owner.1": 1 }
}, fixture);
assert.equal(oldEnterprisePlan.ok, false);
assert.match(oldEnterprisePlan.errors.join(" "), /poprzed|MŚP|wersj/i);

const unknownImport = core.validatePlan({
  schemaVersion: 4,
  done: { "foundation.owner.1": 1, "evil.task": 1 }
}, fixture);
assert.equal(unknownImport.ok, false);
assert.deepEqual(unknownImport.unknown, ["evil.task"]);
const unknownField = core.validatePlan({ schemaVersion: 4, payload: "unexpected" }, fixture);
assert.equal(unknownField.ok, false);
assert.match(unknownField.errors.join(" "), /Nieobsługiwane/);

const invalidDoneString = core.validatePlan({
  schemaVersion: 4,
  done: { "foundation.owner.1": "false" }
}, fixture);
assert.equal(invalidDoneString.ok, false);
assert.match(invalidDoneString.errors.join(" "), /true|1|done/i);
const invalidDoneObject = core.validatePlan({ schemaVersion: 4, done: { "foundation.owner.1": {} } }, fixture);
assert.equal(invalidDoneObject.ok, false);

const bounded = core.validatePlan({ schemaVersion: 4, project: { task: "x".repeat(5000) } }, fixture);
assert.equal(bounded.ok, false);
assert.match(bounded.errors.join(" "), /dług|length|znak/i);
const badUrl = core.validatePlan({ schemaVersion: 4, project: { evidence: "javascript:alert(1)" } }, fixture);
assert.equal(badUrl.ok, false);
assert.match(badUrl.errors.join(" "), /http|adres/i);
const invalidContext = core.validatePlan({ schemaVersion: 4, project: { context: ["personalData", "not-a-context"] } }, fixture);
assert.equal(invalidContext.ok, false);
assert.match(invalidContext.errors.join(" "), /context|kontekst/i);

const invalidApproval = core.validatePlan({
  schemaVersion: 4,
  decisions: { foundation: { status: "continue", person: "", date: "", evidence: "" } }
}, fixture);
assert.equal(invalidApproval.ok, false);
assert.match(invalidApproval.errors.join(" "), /decyz|bramk|podstaw/i);
assert.equal(invalidApproval.plan.decisions.foundation.status, "none");

const invalidNaReason = core.validatePlan({ schemaVersion: 4, na: { "foundation.owner.1": 1 } }, fixture);
assert.equal(invalidNaReason.ok, false);
assert.match(invalidNaReason.errors.join(" "), /N\/A|powó|reason/i);
const invalidGateNa = core.validatePlan({ schemaVersion: 4, na: { "foundation.gate.1": "nie dotyczy" } }, fixture);
assert.equal(invalidGateNa.ok, false);
assert.match(invalidGateNa.errors.join(" "), /decyz|N\/A/i);
const conflictingState = core.validatePlan({
  schemaVersion: 4,
  done: { "foundation.owner.1": 1 },
  na: { "foundation.owner.1": "poza zakresem" }
}, fixture);
assert.equal(conflictingState.ok, false);
assert.match(conflictingState.errors.join(" "), /done|N\/A|jednocześnie/i);

const impossibleDate = core.validatePlan({ schemaVersion: 4, taskMeta: { "foundation.owner.1": { due: "2026-02-31" } } }, fixture);
assert.equal(impossibleDate.ok, false);
assert.match(impossibleDate.errors.join(" "), /data/i);
const invalidPointers = core.validatePlan({
  schemaVersion: 4,
  lastTaskId: "evil.task",
  lastPhaseId: "evil.phase",
  project: { evidence: "javascript:alert(1)" },
  taskMeta: { "foundation.owner.1": { due: "2026-02-31", evidence: "javascript:bad" } }
}, fixture);
assert.equal(invalidPointers.ok, false);
assert.equal(invalidPointers.plan.lastTaskId, "");
assert.equal(invalidPointers.plan.lastPhaseId, "foundation");
assert.equal(invalidPointers.plan.project.evidence, "");
assert.equal(invalidPointers.plan.taskMeta["foundation.owner.1"].due, "");
assert.equal(invalidPointers.plan.taskMeta["foundation.owner.1"].evidence, "");

const stableFixture = structuredClone(fixture);
stableFixture.phases[0].gate.checks = [
  { id: "foundation.gate.data", text: "Dane są gotowe." },
  { id: "foundation.gate.owner", text: "Osoba jest wyznaczona." }
];
const stableBefore = core.buildTaskCatalog(stableFixture);
const stableAfterFixture = structuredClone(stableFixture);
stableAfterFixture.phases[0].stages[0].items[0].actions.unshift({ id: "foundation.owner.new", text: "Ustalenie nowego warunku." });
stableAfterFixture.phases[0].gate.checks.unshift({ id: "foundation.gate.new", text: "Nowy warunek." });
const stableAfter = core.buildTaskCatalog(stableAfterFixture);
assert.equal(stableAfter.actionIds[1], stableBefore.actionIds[0]);
assert.equal(stableAfter.gateIds[1], stableBefore.gateIds[0]);
const duplicateFixture = structuredClone(fixture);
duplicateFixture.phases[0].stages[0].items[0].actions[1].id = "foundation.owner.1";
assert.throws(() => core.buildTaskCatalog(duplicateFixture), /powielone|duplicate|ID/i);

assert.equal(core.decisionIsStale(
  plan.decisions.foundation,
  fixture,
  { "foundation.owner.1": 1 },
  plan.na,
  plan.project
), false);
assert.equal(core.decisionIsStale(
  plan.decisions.foundation,
  fixture,
  { "foundation.owner.1": 1, "foundation.gate.1": 1 },
  plan.na,
  plan.project
), true);
assert.equal(core.decisionIsStale(
  { ...plan.decisions.foundation, basis: "" },
  fixture,
  { "foundation.owner.1": 1 },
  {}
), true);
const contextualBasis = core.decisionBasis(fixture, plan.done, "foundation", plan.na, plan.project);
const contextualDecision = { ...plan.decisions.foundation, basis: contextualBasis };
assert.equal(core.decisionIsStale(contextualDecision, fixture, plan.done, plan.na, plan.project), false);
assert.equal(core.decisionIsStale(contextualDecision, fixture, plan.done, plan.na, { ...plan.project, context: ["integration"] }), true);
assert.equal(core.decisionIsStale(contextualDecision, fixture, plan.done, plan.na, { ...plan.project, task: "Nowe zadanie" }), true);
assert.equal(core.decisionIsStale(contextualDecision, fixture, plan.done, plan.na, { ...plan.project, successCriterion: "Nowe kryterium" }), true);

console.log("app-core: SME focused tests passed");
