/* ============================================================
   Trust by Design — scenes 10–13  (v2 · 10 = hero)
   ============================================================ */
(function () {
  const TBD = window.TBD;
  const { h, seg, ease, clamp, lerp, pulse } = TBD;
  const reg = TBD.register;

  /* ============================================================
     SCENE 10 — HERO: production architecture (7-box pipeline)
     The cheap-inspection stage (Metadata / OCR) forks by media
     type — image path vs document path — before any model runs.
     ============================================================ */
  reg({
    id: "s10", name: "Architecture", title: "The architecture I’d ship", dur: 19,
    build(el, c) {
      el.classList.add("s10");
      const head = h("div", "s10-head");
      head.appendChild(h("div", "eyebrow", c.eyebrow));
      head.appendChild(h("div", "scene-line s10-line", c.line));
      el.appendChild(head);

      const stage = h("div", "s10-stage");
      const rail = h("div", "s10-rail");
      const boxes = [];
      c.stages.forEach((st, i) => {
        if (i > 0) {
          const con = h("div", "arch-con");
          rail.appendChild(con);
        }
        const box = h("div", "arch-box" + (i === 4 ? " expensive" : "") + (i === 5 ? " policy" : "") + (i === 3 ? " fork" : ""));
        box.appendChild(h("span", "arch-idx mono", String(i + 1).padStart(2, "0")));
        box.appendChild(h("span", "arch-k", st.k));
        box.appendChild(h("span", "arch-s mono", st.s));
        // media-type fork tags on the cheap-inspection stage (idx 3)
        if (i === 3) {
          const fork = h("div", "arch-fork mono");
          fork.appendChild(h("span", "fork-img", "image"));
          fork.appendChild(h("span", "fork-doc", "document"));
          box.appendChild(fork);
          box._fork = fork;
        }
        // small dropped artifact for some stages
        const drop = h("div", "arch-drop mono");
        const dropText = { 1: "sha-256", 4: "0.81" }[i];
        if (dropText) { drop.textContent = dropText; box.appendChild(drop); box._drop = drop; }
        rail.appendChild(box);
        boxes.push(box);
      });
      const token = h("div", "s10-token mono");
      token.appendChild(h("span", null, c.token));
      rail.appendChild(token);
      stage.appendChild(rail);

      const v = TBD.makeVerdict({
        head: "Reviewer verdict",
        fields: [
          { k: "provenance", v: "none" },
          { k: "structure", v: "2 flags" },
          { k: "model score", v: "0.81" },
        ],
        verdict: c.verdict,
      });
      v.el.classList.add("s10-verdict");
      stage.appendChild(v.el);
      el.appendChild(stage);

      const cons = [...rail.querySelectorAll(".arch-con")];
      this._r = { boxes, cons, token, v, centers: null };
    },
    _measure() {
      const { boxes, token } = this._r;
      this._r.centers = boxes.map((b) => b.offsetLeft + b.offsetWidth / 2);
      this._r.tokenW = token.offsetWidth;
    },
    update(p) {
      const r = this._r;
      const { boxes, cons, token, v } = r;
      if (!r.centers) this._measure();

      // 1) boxes assemble left->right with overshoot
      boxes.forEach((box, i) => {
        const a = 0.02 + i * 0.05;
        const t = seg(p, a, a + 0.26, ease.outBackSoft);
        box.style.opacity = clamp(t * 1.25, 0, 1).toFixed(3);
        box.style.transform = `translateY(${lerp(70, 0, t)}px) scale(${lerp(0.9, 1, t)})`;
      });
      cons.forEach((con, i) => {
        const a = 0.06 + i * 0.05;
        con.style.setProperty("--draw", seg(p, a, a + 0.16, ease.outCubic).toFixed(3));
      });

      // 2) token travels the rail
      const travel = seg(p, 0.42, 0.86, ease.inOutCubic);
      const fi = travel * (boxes.length - 1);
      const idx = Math.floor(fi);
      const frac = fi - idx;
      const c0 = r.centers[idx];
      const c1 = r.centers[Math.min(idx + 1, boxes.length - 1)];
      const tx = lerp(c0, c1, ease.inOutCubic(frac));
      token.style.opacity = clamp(seg(p, 0.4, 0.46) * 1.3 - seg(p, 0.88, 0.95), 0, 1).toFixed(3);
      token.style.left = (tx - r.tokenW / 2) + "px";

      // light boxes as token arrives; pulse the policy engine
      boxes.forEach((box, i) => {
        const arrived = fi >= i - 0.35 && travel < 0.999;
        box.classList.toggle("hot", arrived);
        box.classList.toggle("done", fi > i + 0.4);
        if (box._drop) {
          const dt = clamp((fi - i) * 1.5, 0, 1);
          box._drop.style.opacity = dt.toFixed(3);
          box._drop.style.transform = `translateY(${lerp(-6, 0, dt)}px)`;
        }
        // the media-type fork reveals as the token reaches the cheap-inspection stage
        if (box._fork) {
          const ft = clamp((fi - (i - 0.6)) * 1.3, 0, 1);
          box._fork.style.opacity = ft.toFixed(3);
          box._fork.style.setProperty("--fork", ft.toFixed(3));
        }
      });
      // policy engine (idx 5) heartbeat at decision point
      const polBox = boxes[5];
      const near = 1 - clamp(Math.abs(fi - 5) / 0.9, 0, 1);
      const beat = near * (0.6 + 0.4 * Math.sin(seg(p, 0.62, 0.86) * Math.PI * 4));
      polBox.style.setProperty("--beat", beat.toFixed(3));

      // 3) verdict stamps at analyst review
      TBD.driveVerdict(v, p, { start: 0.78, stagger: 0.05, stampAt: 0.9 });
      const vo = seg(p, 0.76, 0.86, ease.outCubic);
      v.el.style.opacity = vo.toFixed(3);
      v.el.style.transform = `translateY(${lerp(20, 0, vo)}px)`;
    },
  });

  /* ============================================================
     SCENE 11 — Toolbox matrix (3D card flips · 4×3)
     ============================================================ */
  reg({
    id: "s11", name: "Toolbox", title: "Current toolbox", dur: 12,
    build(el, c) {
      el.classList.add("s11");
      const head = h("div", "s11-head");
      head.appendChild(h("div", "eyebrow", c.eyebrow));
      head.appendChild(h("div", "scene-line s11-line", c.line));
      el.appendChild(head);
      const grid = h("div", "s11-grid");
      const cells = c.cells.map((cell) => {
        const cl = h("div", "tool-cell");
        const inner = h("div", "tool-inner");
        inner.appendChild(h("div", "tool-k", cell.k));
        inner.appendChild(h("div", "tool-d mono", cell.d));
        inner.appendChild(h("div", "tool-t mono", cell.t));
        cl.appendChild(inner);
        grid.appendChild(cl);
        return { cl, inner };
      });
      el.appendChild(grid);
      this._r = { cells };
    },
    update(p) {
      const { cells } = this._r;
      const COLS = 4;
      cells.forEach((cell, i) => {
        const rowcol = Math.floor(i / COLS) + (i % COLS);
        const a = 0.04 + rowcol * 0.07;
        const t = seg(p, a, a + 0.3, ease.outCubic);
        const rot = lerp(82, 0, t);
        cell.inner.style.transform = `perspective(900px) rotateY(${rot}deg)`;
        cell.cl.style.opacity = clamp(t * 1.6, 0, 1).toFixed(3);
      });
    },
  });

  /* ============================================================
     SCENE 12 — Six rules (kinetic typography)
     ============================================================ */
  reg({
    id: "s12", name: "Six rules", title: "Six rules to remember", dur: 16,
    build(el, c) {
      el.classList.add("s12");
      el.appendChild(h("div", "eyebrow s12-eyebrow", c.eyebrow));
      const stage = h("div", "s12-stage");
      const rules = c.rules.map((t, i) => {
        const r = h("div", "rule");
        r.appendChild(h("span", "rule-idx mono", String(i + 1).padStart(2, "0")));
        r.appendChild(h("span", "rule-t", t));
        stage.appendChild(r);
        return r;
      });
      el.appendChild(stage);
      this._r = { rules };
    },
    update(p) {
      const { rules } = this._r;
      const N = rules.length;
      const span = 0.13;
      const slotH = 118;
      const baseY = -((N - 1) / 2) * slotH;
      rules.forEach((r, i) => {
        const a = 0.03 + i * span;
        const appear = seg(p, a, a + 0.05, ease.outCubic);
        const park = seg(p, a + 0.07, a + 0.16, ease.inOutCubic);
        const slotY = baseY + i * slotH;
        const y = lerp(0, slotY, park);
        const sc = lerp(1, 0.46, park);
        r.style.opacity = appear.toFixed(3);
        r.style.transform = `translate(-50%,-50%) translateY(${y}px) scale(${sc})`;
        const isSpot = appear > 0.4 && park < 0.5;
        r.classList.toggle("spot", isSpot);
        r.classList.toggle("parked", park > 0.5);
        r.style.zIndex = isSpot ? 10 : 1;
      });
      const glow = seg(p, 0.88, 1, ease.outCubic);
      this._r.rules.forEach((r) => r.style.setProperty("--glow", glow.toFixed(3)));
    },
  });

  /* ============================================================
     SCENE 13 — Mini-workshop & close
     ============================================================ */
  reg({
    id: "s13", name: "Close", title: "Workshop & close", dur: 13,
    build(el, c) {
      el.classList.add("s13");
      el.appendChild(h("div", "eyebrow", c.eyebrow));
      const q = h("div", "scene-line s13-q", c.line);
      el.appendChild(q);
      const chips = h("div", "s13-chips");
      const chipEls = c.chips.map((t) => {
        const ch = h("div", "s13-chip");
        ch.appendChild(h("span", "chip-num mono", ""));
        ch.appendChild(h("span", null, t));
        chips.appendChild(ch);
        return ch;
      });
      chipEls.forEach((ch, i) => (ch.querySelector(".chip-num").textContent = "0" + (i + 1)));
      el.appendChild(chips);
      const close = h("div", "s13-close", c.close);
      el.appendChild(close);
      this._r = { q, chipEls, close };
    },
    update(p) {
      const { q, chipEls, close } = this._r;
      const qt = seg(p, 0, 0.24, ease.outCubic);
      q.style.opacity = qt.toFixed(3);
      q.style.transform = `translateY(${lerp(24, 0, qt)}px)`;
      chipEls.forEach((ch, i) => {
        const a = 0.3 + i * 0.12;
        const t = seg(p, a, a + 0.2, ease.outBackSoft);
        ch.style.opacity = clamp(t * 1.3, 0, 1).toFixed(3);
        ch.style.transform = `translateY(${lerp(26, 0, t)}px) scale(${lerp(0.9, 1, t)})`;
      });
      const ct = seg(p, 0.72, 0.94, ease.outCubic);
      close.style.opacity = ct.toFixed(3);
      close.style.transform = `translateY(${lerp(22, 0, ct)}px)`;
      close.style.setProperty("--glow", seg(p, 0.86, 1, ease.outCubic).toFixed(3));
    },
  });
})();
