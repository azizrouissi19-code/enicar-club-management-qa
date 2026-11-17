// Données et outils partagés par la vue d'équipe (index.html) et l'espace chef d'équipe (chef.html).
// Source : donnees.js (versionné). Les modifications du chef sont gardées dans le navigateur
// jusqu'à l'export d'un nouveau donnees.js, à commiter pour les partager.
(function () {
  const KEY = "suivi-hebdo-v4"; // v3 : planning sans indicateurs de résultats de tests
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const fichier = clone(window.SUIVI || {});

  function normalise(d) {
    d.semaines = d.semaines || [];
    d.taches = d.taches || [];
    d.equipe = d.equipe || [];
    d.semaines.forEach((s) => { s.objectifs = s.objectifs || []; });
    d.taches.forEach((t, i) => {
      if (!t.id) t.id = "t" + i.toString(36) + Math.random().toString(36).slice(2, 7);
      t.priorite = t.priorite || "Normale";
      if (t.echeance === undefined) t.echeance = "";
    });
    return d;
  }

  let local = null;
  try { const s = localStorage.getItem(KEY); if (s) local = JSON.parse(s); } catch (e) { /* stockage indisponible */ }

  const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  const parse = (iso) => { const [y, m, d] = String(iso).split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const iso = (date) => date.toISOString().slice(0, 10);

  const S = (window.Suivi = {
    data: normalise(local || clone(fichier)),
    modifie: !!local,

    save() {
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { /* ignoré */ }
      this.modifie = true;
    },
    reset() {
      try { localStorage.removeItem(KEY); } catch (e) { /* ignoré */ }
      this.data = normalise(clone(fichier));
      this.modifie = false;
    },
    exporter() {
      const text = "// Données du suivi hebdomadaire. Fichier produit par l'espace chef d'équipe (chef.html) : commitez-le pour partager.\nwindow.SUIVI = " + JSON.stringify(this.data, null, 2) + ";\n";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
      a.download = "donnees.js";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    },

    weeks() { return this.data.semaines.map((s) => s.semaine).sort(); },
    week(w) { return this.data.semaines.find((s) => s.semaine === w); },
    tasksOf(w) { return this.data.taches.filter((t) => t.semaine === w); },
    membres() {
      const noms = [...this.data.equipe];
      for (const t of this.data.taches) if (t.membre && !noms.includes(t.membre)) noms.push(t.membre);
      return noms;
    },

    /** Avancement cumulé : tâches terminées jusqu'à chaque semaine / toutes les tâches planifiées */
    progress() {
      const total = this.data.taches.length;
      let prev = null;
      return this.weeks().map((semaine) => {
        const done = this.data.taches.filter((t) => t.semaine <= semaine && t.statut === "Terminée").length;
        const pct = total ? Math.round((done / total) * 100) : 0;
        const delta = prev === null ? null : pct - prev;
        prev = pct;
        return { semaine, done, total, pct, delta };
      });
    },

    nextWeekLabel(label) {
      const m = /^(\d{4})-S(\d{2})$/.exec(label || "");
      if (!m) return "";
      let y = +m[1], w = +m[2] + 1;
      if (w > 52) { y += 1; w = 1; }
      return `${y}-S${String(w).padStart(2, "0")}`;
    },
    addDays(isoDate, n) { const d = parse(isoDate); d.setUTCDate(d.getUTCDate() + n); return iso(d); },
    today() { const d = new Date(); return iso(new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))); },
    fmtDate(isoDate) { if (!isoDate) return ""; const d = parse(isoDate); return `${d.getUTCDate()} ${MOIS[d.getUTCMonth()]}`; },
    weekRange(s) {
      if (!s || !s.date_debut) return "";
      const a = parse(s.date_debut), b = parse(this.addDays(s.date_debut, 6));
      return `du ${a.getUTCDate()}${a.getUTCMonth() === b.getUTCMonth() ? "" : " " + MOIS[a.getUTCMonth()]} au ${b.getUTCDate()} ${MOIS[b.getUTCMonth()]} ${b.getUTCFullYear()}`;
    },
    enRetard(t) { return !!t.echeance && t.statut !== "Terminée" && t.echeance < this.today(); },
    tone(statut) {
      if (/temps|termin|atteint/i.test(statut)) return "ok";
      if (/retard|cours/i.test(statut)) return "warn";
      if (/bloqu/i.test(statut)) return "bad";
      return "";
    },
    initiales(nom) { return String(nom).split(/\s+/).filter((w) => /^[A-ZÀ-Ý]/.test(w)).map((w) => w[0]).slice(0, 2).join("") || "?"; },
    h(tag, attrs = {}, ...children) {
      const n = document.createElement(tag);
      for (const [k, v] of Object.entries(attrs)) {
        if (v === undefined || v === null || v === false) continue;
        if (k === "class") n.className = v;
        else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
        else n.setAttribute(k, v === true ? "" : v);
      }
      for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) n.append(c);
      return n;
    },
  });

  // Une modification faite dans un autre onglet (l'espace chef) met à jour cette page
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    try { S.data = normalise(e.newValue ? JSON.parse(e.newValue) : clone(fichier)); S.modifie = !!e.newValue; } catch (err) { return; }
    window.dispatchEvent(new Event("suivi:change"));
  });
})();
