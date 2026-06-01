/* ============================================================
   Trust by Design — reusable components
   Trust-Pipeline HUD, Verdict card, count-up helper.
   Built once, reused across scenes.
   ============================================================ */
(function () {
  const TBD = window.TBD;
  const { seg, ease, clamp, lerp } = TBD;

  /* ---------- el helper ---------- */
  function h(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  TBD.h = h;

  /* ============================================================
     Trust-Pipeline HUD
     ============================================================ */
  const STAGES = ["Ingest", "Store", "Provenance", "Metadata", "Model", "Policy", "Review"];
  // active stages per scene index (0-based). Catches build cumulatively.
  // v2 indices: 2 attack1 · 3 attack1-read · 4 fix1 · 5 attack2 · 6 attack2-read ·
  //             7 fix2 · 8 vendors · 9 document · 10 document-read · 11 preserve
  const ACTIVE = {
    2: [0],          // edited screenshot caught at ingest/metadata
    3: [3],          // attack1 forensic read -> metadata signals
    4: [2, 4],       // verify sources -> provenance + model
    5: [2, 3, 4, 5], // AI image scan lights the cheap+provenance+policy path
    6: [2],          // attack2 forensic read -> provenance
    7: [4],          // evidence stack -> model scoring
    8: [2, 4],       // vendor signals feed provenance + model
    9: [3, 6],       // document structure -> metadata + review
    10: [3],         // document forensic read -> structure / metadata
    11: [1, 6],      // preserve -> immutable store + review
  };
  const VISIBLE = new Set([2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

  const HUD = (TBD.HUD = {
    el: null, nodes: [], links: [], labels: [], stagesEl: [],
    active: [], visible: false,
    init(el) {
      this.el = el;
      el.innerHTML = "";
      el.appendChild(h("div", "hud-title", "Trust Pipeline"));
      const rail = h("div", "hud-rail");
      STAGES.forEach((name, i) => {
        if (i > 0) {
          const link = h("div", "hud-link");
          rail.appendChild(link);
          this.links.push(link);
        }
        const st = h("div", "hud-stage");
        const node = h("div", "hud-node");
        node.appendChild(h("div", "flare"));
        const label = h("div", "hud-label", name);
        st.appendChild(node);
        st.appendChild(label);
        rail.appendChild(st);
        this.stagesEl.push(st);
        this.nodes.push(node.querySelector(".flare"));
        this.labels.push(label);
      });
      el.appendChild(rail);
    },
    config(scene, idx) {
      this.visible = VISIBLE.has(idx);
      this.el.classList.toggle("show", this.visible);
      this.active = ACTIVE[idx] || [];
      // cumulative lit history
      const lit = new Set();
      for (let i = 0; i <= idx; i++) (ACTIVE[i] || []).forEach((x) => lit.add(x));
      this.stagesEl.forEach((st, i) => {
        st.classList.toggle("lit", lit.has(i));
        st.classList.toggle("active", this.active.includes(i));
      });
    },
    update(p) {
      if (!this.visible) return;
      // flares grow + gently breathe on active stages
      const grow = seg(p, 0.12, 0.5, ease.outCubic);
      const breathe = 0.85 + 0.15 * Math.sin(seg(p, 0.5, 1) * Math.PI * 2);
      this.active.forEach((i) => {
        const f = this.nodes[i];
        f.style.opacity = (0.5 * grow).toFixed(3);
        f.style.transform = "scale(" + (0.6 + 0.7 * grow * breathe).toFixed(3) + ")";
      });
    },
  });

  /* ============================================================
     Verdict card (reusable)
     state: Verified | Suspicious | Unknown | Needs review
     ============================================================ */
  TBD.makeVerdict = function (content) {
    const el = h("div", "verdict");
    el.appendChild(h("div", "verdict-head", content.head || "Verdict"));
    const rows = (content.fields || []).map((f) => {
      const r = h("div", "verdict-row");
      r.appendChild(h("span", "vk", f.k));
      r.appendChild(h("span", "vv", f.v));
      el.appendChild(r);
      return r;
    });
    const stateClass = "v-state-" + (content.verdict || "Unknown").replace(/\s+/g, "-");
    const stamp = h("div", "verdict-stamp " + stateClass);
    stamp.appendChild(h("span", "chip"));
    stamp.appendChild(h("span", "vlabel", content.verdict || "Unknown"));
    el.appendChild(stamp);
    return { el, rows, stamp };
  };

  // drive the verdict reveal from local progress 0..1
  TBD.driveVerdict = function (refs, p, opts) {
    opts = opts || {};
    const start = opts.start != null ? opts.start : 0.1;
    const stagger = opts.stagger != null ? opts.stagger : 0.12;
    const stampAt = opts.stampAt != null ? opts.stampAt : 0.7;
    refs.rows.forEach((r, i) => {
      const t = seg(p, start + i * stagger, start + i * stagger + 0.22, ease.outCubic);
      r.style.opacity = t.toFixed(3);
      r.style.transform = "translateX(" + lerp(14, 0, t).toFixed(2) + "px)";
    });
    const st = seg(p, stampAt, stampAt + 0.18, ease.outBackSoft);
    refs.stamp.style.opacity = clamp(st * 1.4, 0, 1).toFixed(3);
    refs.stamp.style.transform = "scale(" + lerp(0.82, 1, st).toFixed(3) + ")";
  };

  /* ============================================================
     forensic-read points list — reusable evidence dot points
     Builds a titled list of {k,d} rows; drivePoints staggers them.
     ============================================================ */
  TBD.makePoints = function (content) {
    const el = h("div", "fr-points");
    // optional sub-head (omit when the scene already shows the line as its headline)
    if (content.pointsHead) el.appendChild(h("div", "fr-head", content.pointsHead));
    const rows = (content.points || []).map((pt) => {
      const r = h("div", "fr-row");
      r.appendChild(h("span", "fr-mark"));
      const body = h("div", "fr-body");
      body.appendChild(h("div", "fr-k", pt.k));
      body.appendChild(h("div", "fr-d mono", pt.d));
      r.appendChild(body);
      el.appendChild(r);
      return r;
    });
    return { el, rows, head: el.querySelector(".fr-head") };
  };

  TBD.drivePoints = function (refs, p, opts) {
    opts = opts || {};
    const start = opts.start != null ? opts.start : 0.18;
    const stagger = opts.stagger != null ? opts.stagger : 0.11;
    if (refs.head) {
      const t = seg(p, start - 0.12, start, ease.outCubic);
      refs.head.style.opacity = t.toFixed(3);
      refs.head.style.transform = "translateY(" + lerp(16, 0, t).toFixed(2) + "px)";
    }
    refs.rows.forEach((r, i) => {
      const a = start + i * stagger;
      const t = seg(p, a, a + 0.2, ease.outCubic);
      r.style.opacity = t.toFixed(3);
      r.style.transform = "translateX(" + lerp(22, 0, t).toFixed(2) + "px)";
      r.classList.toggle("on", t > 0.85);
    });
  };

  /* ============================================================
     count-up helper — pure function of progress
     formats integers with thousands separators
     ============================================================ */
  TBD.countTo = function (elNode, p, from, to, opts) {
    opts = opts || {};
    const t = ease.outCubic(clamp(p, 0, 1));
    let v = lerp(from, to, t);
    v = Math.round(v);
    let s = opts.group ? v.toLocaleString("en-US") : String(v);
    elNode.textContent = (opts.prefix || "") + s + (opts.unit || "");
  };
})();
