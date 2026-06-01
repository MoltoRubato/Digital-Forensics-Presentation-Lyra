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
  const ACTIVE = {
    2: [3], 3: [0], 4: [2, 4], 5: [2, 3, 4, 5],
    6: [4], 7: [0, 5], 8: [1, 3], 9: [1, 6],
  };
  const VISIBLE = new Set([2, 3, 4, 5, 6, 7, 8, 9]);

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
