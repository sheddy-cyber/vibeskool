/* Derives everything the dashboard shows from two real sources:
   the paths API (modules + ordered lessons) and the progress API
   (completed lesson ids with timestamps). No invented numbers. */

const DAY = 24 * 60 * 60 * 1000;

/** "M2: Front-End" -> 2, "M2a" -> 2, anything else -> null */
export function moduleNumber(part) {
  const m = /^M(\d+)/i.exec(String(part || "").trim());
  return m ? Number(m[1]) : null;
}

/** "M2: Front-End" -> "Front-End" */
export function shortModuleName(part) {
  const s = String(part || "");
  const i = s.indexOf(":");
  return (i >= 0 ? s.slice(i + 1) : s).trim();
}

/** "9 min" -> 9 */
export function minutes(duration) {
  const n = parseInt(String(duration || ""), 10);
  return Number.isFinite(n) ? n : null;
}

/** Splits "Title — subtitle" into its two halves. */
export function splitTitle(title) {
  const full = String(title || "");
  const parts = full.split(/\s+[—–-]\s+/);
  // "CSS — flexbox, grid…" reads better whole; only split long, two-part titles.
  if (parts.length < 2 || parts[0].length < 14) return { main: full, sub: null };
  return { main: parts[0], sub: parts.slice(1).join(" — ") };
}

export function buildPathModel(path, completedIds = new Set(), passedModules = new Set()) {
  if (!path) return null;
  const lessons = (path.lessons_data || []).map((l, i) => ({
    ...l,
    order: i,
    done: completedIds.has(l.id),
    moduleIndex: moduleNumber(l.part),
  }));

  const defs = Array.isArray(path.modules) ? path.modules : [];
  const byIndex = new Map();
  lessons.forEach((l) => {
    const key = l.moduleIndex ?? -1;
    if (!byIndex.has(key)) byIndex.set(key, []);
    byIndex.get(key).push(l);
  });

  const indices = [...new Set([...defs.map((_, i) => i), ...byIndex.keys()])]
    .filter((i) => i >= 0)
    .sort((a, b) => a - b);

  const modules = indices.map((i) => {
    const def = defs[i] || {};
    const ls = byIndex.get(i) || [];
    const done = ls.filter((l) => l.done).length;
    const id = def.id || `m${i}`;
    return {
      id,
      index: i,
      title: def.title || shortModuleName(ls[0]?.part) || `Module ${i + 1}`,
      short: shortModuleName(ls[0]?.part) || def.title || `Module ${i + 1}`,
      goal: def.goal || null,
      lessons: ls,
      total: ls.length,
      done,
      passed: passedModules.has(id),
    };
  });

  const next = lessons.find((l) => !l.done) || null;
  const nextModule = next ? modules.find((m) => m.index === next.moduleIndex) : null;

  modules.forEach((m) => {
    if (m.total > 0 && m.done === m.total) m.state = "done";
    else if (nextModule && m.index === nextModule.index) m.state = "current";
    else if (m.done > 0) m.state = "started";
    else m.state = "upcoming";
  });

  const doneCount = lessons.filter((l) => l.done).length;
  const remainingMinutes = lessons
    .filter((l) => !l.done)
    .reduce((sum, l) => sum + (minutes(l.duration) || 0), 0);

  return {
    id: path.id,
    name: path.name || path.title,
    description: path.description,
    lessons,
    modules,
    total: lessons.length,
    doneCount,
    remainingMinutes,
    next,
    nextModule,
    nextIndexInModule: next && nextModule ? nextModule.lessons.findIndex((l) => l.id === next.id) : -1,
    upcoming: next ? lessons.filter((l) => !l.done && l.order > next.order).slice(0, 4) : [],
    finished: lessons.length > 0 && !next,
  };
}

/** The path the learner is actively working on: most recent completion wins,
    otherwise the first path that has lessons. */
export function pickActivePath(paths = [], completions = []) {
  const withLessons = paths.filter((p) => (p.lessons_data || []).length > 0);
  for (let i = completions.length - 1; i >= 0; i -= 1) {
    const hit = withLessons.find((p) => p.id === completions[i].pathId);
    if (hit) return hit;
  }
  return withLessons[0] || paths[0] || null;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function activity(completions = [], now = new Date()) {
  const today0 = startOfDay(now).getTime();
  const counts = new Map();
  completions.forEach((c) => {
    if (!c.completedAt) return;
    const k = startOfDay(c.completedAt).getTime();
    counts.set(k, (counts.get(k) || 0) + 1);
  });

  // Monday-first week containing today
  const dow = (new Date(today0).getDay() + 6) % 7;
  const monday = today0 - dow * DAY;
  const week = Array.from({ length: 7 }, (_, i) => {
    const t = monday + i * DAY;
    return {
      key: t,
      label: new Date(t).toLocaleDateString(undefined, { weekday: "narrow" }),
      long: new Date(t).toLocaleDateString(undefined, { weekday: "long" }),
      count: counts.get(t) || 0,
      isToday: t === today0,
      isFuture: t > today0,
    };
  });

  return {
    today: counts.get(today0) || 0,
    week,
    weekTotal: week.reduce((s, d) => s + d.count, 0),
    recent: completions
      .filter((c) => c.completedAt)
      .slice(-4)
      .reverse(),
  };
}

export function relativeTime(date, now = new Date()) {
  const t = new Date(date).getTime();
  if (!Number.isFinite(t)) return "";
  const diff = Math.max(0, now.getTime() - t);
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(diff / DAY);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 5) return "Working late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** One plain sentence about where the learner stands. */
export function summarySentence(model, act, streak) {
  if (!model || model.total === 0) return "Your lessons will appear here as soon as a path opens.";
  if (model.finished) return `You've finished every lesson in ${model.name}. The capstone is yours to ship.`;
  const mins = minutes(model.next.duration);
  const time = mins ? ` takes about ${mins} minutes.` : " is ready when you are.";
  const parts = model.doneCount === 0
    ? [`Start with the first lesson. It${time}`]
    : [`You're ${model.doneCount} of ${model.total} lessons into ${model.name}. The next one${time}`];
  if (streak > 1 && act.today === 0) parts.push(`One lesson today keeps your ${streak}-day streak going.`);
  return parts.join(" ");
}
