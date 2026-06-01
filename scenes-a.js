/* ============================================================
   Trust by Design — scenes 1–5
   Each scene: { id, name, title, dur, build(el,c), update(p) }
   update(p) is a pure function of progress p (0..1).
   ============================================================ */
(function () {
  const TBD = window.TBD;
  const { h, seg, ease, clamp, lerp } = TBD;
  const reg = TBD.register;

  /* ---------- helper: set transform/opacity ---------- */
  const tf = (el, x, y, s, extra) =>
    (el.style.transform = `translate(${x}px,${y}px)` + (s != null ? ` scale(${s})` : "") + (extra || ""));

  /* ============================================================
     SCENE 1 — Title & hook
     ============================================================ */
  reg({
    id: "s01", name: "Title", title: "Title & hook", dur: 9,
    build(el, c) {
      el.classList.add("s01");
      const head = h("div", "s01-head");
      head.appendChild(h("div", "eyebrow", c.kicker));
      const hl = h("h1", "scene-line s01-line");
      hl.innerHTML = `<span class="l1">${c.line}</span><span class="l2">${c.line2}</span>`;
      head.appendChild(hl);
      el.appendChild(head);

      const stageEl = h("div", "s01-stage");
      const glyphs = ["screenshot", "selfie", "pdf"];
      const chips = c.artifacts.map((label, i) => {
        const chip = h("div", "artifact a-" + glyphs[i]);
        chip.appendChild(h("div", "art-glyph g-" + glyphs[i]));
        chip.appendChild(h("div", "art-label mono", label));
        stageEl.appendChild(chip);
        return chip;
      });
      const submit = h("div", "s01-submit");
      submit.appendChild(h("span", null, c.submit));
      stageEl.appendChild(submit);
      el.appendChild(stageEl);
      this._r = { chips, submit, hl };
    },
    update(p) {
      const { chips, submit, hl } = this._r;
      // three artifact chips converge into one Submit (relative to stage centre)
      const slots = [[-1.5, 0], [0, 0], [1.5, 0]];
      const startPos = [[-560, -340], [0, -440], [560, 360]];
      const SX = 250, SY = 150;
      chips.forEach((chip, i) => {
        const inT = seg(p, 0.05 + i * 0.07, 0.42 + i * 0.07, ease.outBackSoft);
        const gx = slots[i][0] * SX, gy = slots[i][1] * SY;
        const x = lerp(startPos[i][0], gx, inT);
        const y = lerp(startPos[i][1], gy, inT);
        // collapse toward center
        const col = seg(p, 0.6, 0.78, ease.inOutCubic);
        const cx = lerp(x, 0, col), cy = lerp(y, 0, col);
        const sc = lerp(1, 0.2, col) * lerp(0.6, 1, inT);
        chip.style.transform = `translate(${cx}px,${cy}px) scale(${sc})`;
        chip.style.opacity = (inT * (1 - col)).toFixed(3);
      });
      const sub = seg(p, 0.72, 0.9, ease.outBackSoft);
      submit.style.opacity = clamp(sub * 1.3, 0, 1).toFixed(3);
      submit.style.transform = `translate(-50%,-50%) scale(${lerp(0.4, 1, sub)})`;
      const glow = seg(p, 0.86, 1, ease.outCubic);
      submit.style.setProperty("--glow", glow.toFixed(3));
      // headline rises
      const t1 = seg(p, 0.62, 0.85, ease.outCubic);
      hl.querySelector(".l1").style.opacity = t1.toFixed(3);
      hl.querySelector(".l1").style.transform = `translateY(${lerp(26, 0, t1)}px)`;
      const t2 = seg(p, 0.72, 0.95, ease.outCubic);
      hl.querySelector(".l2").style.opacity = t2.toFixed(3);
      hl.querySelector(".l2").style.transform = `translateY(${lerp(26, 0, t2)}px)`;
    },
  });

  /* ============================================================
     SCENE 2 — What digital forensics means in a webapp
     ============================================================ */
  reg({
    id: "s02", name: "Forensics", title: "What forensics means here", dur: 11,
    build(el, c) {
      el.classList.add("s02");
      el.appendChild(h("div", "eyebrow", c.eyebrow));
      const stage = h("div", "s02-stage");
      const cols = c.cols.map((col) => {
        const cEl = h("div", "fcol");
        cEl.appendChild(h("div", "fcol-k", col.k));
        cEl.appendChild(h("div", "fcol-d", col.d));
        stage.appendChild(cEl);
        return cEl;
      });
      const token = h("div", "s02-token");
      token.appendChild(h("span", "mono", "upload"));
      stage.appendChild(token);
      const chip = h("div", "s02-verdict");
      chip.appendChild(h("span", "chip-dot"));
      chip.appendChild(h("span", "mono", c.verdict));
      stage.appendChild(chip);
      el.appendChild(stage);
      this._r = { cols, token, chip };
    },
    update(p) {
      const { cols, token, chip } = this._r;
      cols.forEach((col, i) => {
        const t = seg(p, 0.05 + i * 0.08, 0.4 + i * 0.08, ease.outCubic);
        col.style.transform = `translateY(${lerp(80, 0, t)}px)`;
        col.style.opacity = t.toFixed(3);
        col.style.setProperty("--h", lerp(0, 1, t).toFixed(3));
      });
      // token travels left->right across the four columns
      const travel = seg(p, 0.45, 0.82, ease.inOutCubic);
      const x = lerp(-680, 680, travel);
      token.style.opacity = clamp(seg(p, 0.42, 0.5) * 1.2 - seg(p, 0.82, 0.9), 0, 1).toFixed(3);
      token.style.transform = `translate(${x}px,0)`;
      // light columns as token passes
      cols.forEach((col, i) => {
        const center = -510 + i * 340;
        const near = 1 - clamp(Math.abs(x - center) / 170, 0, 1);
        col.classList.toggle("hot", near > 0.4 && travel < 0.99);
      });
      // emerge as verdict chip
      const ct = seg(p, 0.84, 1, ease.outBackSoft);
      chip.style.opacity = clamp(ct * 1.3, 0, 1).toFixed(3);
      chip.style.transform = `scale(${lerp(0.5, 1, ct)})`;
    },
  });

  /* ============================================================
     SCENE 3 — Attack 1: edit a screenshot (reveal + count-up)
     ============================================================ */
  reg({
    id: "s03", name: "Attack 1", title: "Attack 1 \u00b7 edit a screenshot", dur: 15,
    build(el, c) {
      el.classList.add("s03");
      const head = h("div", "s03-head");
      head.appendChild(h("div", "eyebrow", c.eyebrow));
      head.appendChild(h("div", "scene-line s03-line", c.line));
      el.appendChild(head);

      const stage = h("div", "s03-stage");
      const phones = h("div", "s03-phones");
      const mk = (src, label, cls) => {
        const ph = h("div", "phone " + cls);
        const im = document.createElement("img");
        im.src = src; im.alt = label;
        ph.appendChild(im);
        ph.appendChild(h("div", "phone-tag mono", label));
        const scan = h("div", "phone-scan");
        ph.appendChild(scan);
        phones.appendChild(ph);
        return { ph, scan };
      };
      const real = mk(c.real, c.realLabel, "real");
      const fake = mk(c.fake, c.fakeLabel, "fake");
      stage.appendChild(phones);

      // delta panel
      const panel = h("div", "s03-deltas");
      const rows = c.deltas.map((d) => {
        const r = h("div", "delta-row");
        r.appendChild(h("div", "delta-label mono", d.label));
        const val = h("div", "delta-val");
        const num = h("span", "countup", d.text ? d.fromT : String(d.from) + (d.unit || ""));
        val.appendChild(num);
        r.appendChild(val);
        panel.appendChild(r);
        return { r, num, d };
      });
      const flag = h("div", "s03-flag");
      flag.appendChild(h("span", "flag-legit mono", c.flag));
      const redflag = h("div", "flag-red");
      redflag.appendChild(h("span", null, "Tampered"));
      panel.appendChild(flag);
      panel.appendChild(redflag);
      stage.appendChild(panel);
      el.appendChild(stage);
      this._r = { real, fake, rows, flag, redflag };
    },
    update(p) {
      const { real, fake, rows, flag, redflag } = this._r;
      const inT = seg(p, 0, 0.22, ease.outCubic);
      real.ph.style.opacity = inT;
      real.ph.style.transform = `translateY(${lerp(30, 0, inT)}px)`;
      const inF = seg(p, 0.08, 0.3, ease.outCubic);
      fake.ph.style.opacity = inF;
      fake.ph.style.transform = `translateY(${lerp(30, 0, inF)}px)`;

      // scan sweeps top->bottom across both phones
      const scanT = seg(p, 0.3, 0.62, ease.inOutCubic);
      [real.scan, fake.scan].forEach((s) => {
        s.style.opacity = (scanT > 0 && scanT < 1 ? 1 : 0).toString();
        s.style.top = (scanT * 100).toFixed(2) + "%";
      });

      // delta rows count up + glitch as scan resolves, staggered
      rows.forEach((row, i) => {
        const a = 0.38 + i * 0.12;
        const t = seg(p, a, a + 0.22, ease.outCubic);
        row.r.style.opacity = clamp(seg(p, a - 0.05, a + 0.05) * 1.2, 0, 1).toFixed(3);
        const d = row.d;
        if (d.text) {
          // text deltas (2s -> 2h): snap with jitter
          row.num.textContent = t > 0.5 ? d.toT : d.fromT;
        } else {
          TBD.countTo(row.num, t, d.from, d.to, { group: true, unit: d.unit });
        }
        // glitch jitter near the change, then snap red
        const settled = t > 0.92;
        row.num.classList.toggle("tampered", settled);
        const jit = t > 0.2 && t < 0.92 ? (i % 2 ? 1.5 : -1.5) * Math.sin(t * 40) : 0;
        row.num.style.transform = `translateX(${jit.toFixed(2)}px)`;
      });

      // legit label then red flag drop
      const lg = seg(p, 0.34, 0.5, ease.outCubic);
      flag.style.opacity = (lg * (1 - seg(p, 0.78, 0.86))).toFixed(3);
      const rf = seg(p, 0.82, 0.96, ease.outBackSoft);
      redflag.style.opacity = clamp(rf * 1.3, 0, 1).toFixed(3);
      redflag.style.transform = `translateY(${lerp(-20, 0, rf)}px) scale(${lerp(0.85, 1, rf)})`;
    },
  });

  /* ============================================================
     SCENE 3b — Attack 1 forensic read (evidence left, points right)
     ============================================================ */
  reg({
    id: "s03b", name: "Attempt 1 · read", title: "Attempt 1 · forensic read", dur: 13,
    build(el, c) {
      el.classList.add("fread", "s03b");
      const head = h("div", "fread-head");
      head.appendChild(h("div", "eyebrow", c.eyebrow));
      head.appendChild(h("div", "scene-line fread-line", c.line));
      el.appendChild(head);

      const stage = h("div", "fread-stage");
      // LEFT — same two phones, held in place from the attack slide
      const phones = h("div", "fread-evidence twin");
      const mk = (src, label, cls) => {
        const ph = h("div", "phone " + cls);
        const im = document.createElement("img");
        im.src = src; im.alt = label;
        ph.appendChild(im);
        ph.appendChild(h("div", "phone-tag mono", label));
        phones.appendChild(ph);
        return ph;
      };
      const real = mk(c.real, c.realLabel, "real");
      const fake = mk(c.fake, c.fakeLabel, "fake");
      stage.appendChild(phones);

      const pts = TBD.makePoints(c);
      stage.appendChild(pts.el);
      el.appendChild(stage);
      this._r = { real, fake, pts };
    },
    update(p) {
      const { real, fake, pts } = this._r;
      const inA = seg(p, 0, 0.18, ease.outCubic);
      [real, fake].forEach((ph, i) => {
        const t = seg(p, i * 0.06, 0.18 + i * 0.06, ease.outCubic);
        ph.style.opacity = t.toFixed(3);
        ph.style.transform = `translateY(${lerp(24, 0, t)}px)`;
      });
      TBD.drivePoints(pts, p, { start: 0.24, stagger: 0.12 });
    },
  });

  /* ============================================================
     SCENE 4 — Verify sources, not screenshots
     ============================================================ */
  reg({
    id: "s04", name: "Fix 1", title: "Verify sources, not screenshots", dur: 12,
    build(el, c) {
      el.classList.add("s04");
      const head = h("div", "s04-head");
      head.appendChild(h("div", "eyebrow", c.eyebrow));
      head.appendChild(h("div", "scene-line s04-line", c.line));
      el.appendChild(head);

      const stage = h("div", "s04-stage");

      // LEFT — the uploaded screenshot, which de-emphasises to a low-trust fallback
      const shot = h("div", "s04-shot");
      shot.appendChild(h("div", "shot-label mono", "uploaded screenshot"));
      const noise = h("div", "shot-noise");
      for (let i = 0; i < 60; i++) noise.appendChild(h("span"));
      shot.appendChild(noise);
      shot.appendChild(h("div", "shot-lowtrust mono", "low-trust fallback"));
      stage.appendChild(shot);

      // RIGHT — the app core acts as a vertical bus; each signed source taps in
      const hub = h("div", "s04-hub");
      const core = h("div", "hub-core");
      core.appendChild(h("span", "mono", "app"));
      hub.appendChild(core);

      const list = h("div", "src-list");
      const branches = [];
      const sources = c.sources.map((s) => {
        const row = h("div", "src-row");
        const branch = h("div", "src-branch");
        const node = h("div", "src-node");
        node.appendChild(h("span", "src-dot"));
        node.appendChild(h("span", "mono", s));
        row.appendChild(branch);
        row.appendChild(node);
        list.appendChild(row);
        branches.push(branch);
        return node;
      });
      hub.appendChild(list);

      const badge = h("div", "s04-badge");
      badge.appendChild(h("span", "chip-dot"));
      badge.appendChild(h("span", null, c.badge));
      hub.appendChild(badge);

      stage.appendChild(hub);
      el.appendChild(stage);
      this._r = { shot, core, sources, branches, badge };
    },
    update(p) {
      const { shot, core, sources, branches, badge } = this._r;
      // screenshot enters, then dims + sinks as it loses primacy
      const inS = seg(p, 0, 0.2, ease.outCubic);
      const fade = seg(p, 0.34, 0.52, ease.inOutCubic);
      shot.style.opacity = clamp(inS - fade * 0.5, 0, 1).toFixed(3);
      shot.style.setProperty("--dis", seg(p, 0.34, 0.6, ease.inCubic).toFixed(3));
      shot.style.transform = `translateY(${lerp(0, 16, fade)}px) scale(${lerp(1, 0.94, fade)})`;
      shot.classList.toggle("dimmed", fade > 0.5);

      // app bus rises in
      const co = seg(p, 0.42, 0.58, ease.outBackSoft);
      core.style.opacity = clamp(co * 1.3, 0, 1).toFixed(3);
      core.style.transform = `scaleY(${lerp(0.86, 1, co)})`;

      // each source taps the bus: connector draws, card slides in
      sources.forEach((node, i) => {
        const a = 0.6 + i * 0.11;
        const t = seg(p, a, a + 0.2, ease.outBackSoft);
        node.style.opacity = clamp(t * 1.2, 0, 1).toFixed(3);
        node.style.transform = `translateX(${lerp(28, 0, t)}px)`;
        branches[i].style.setProperty("--draw", seg(p, a - 0.08, a + 0.12, ease.outCubic).toFixed(3));
      });

      const b = seg(p, 0.88, 0.99, ease.outBackSoft);
      badge.style.opacity = clamp(b * 1.3, 0, 1).toFixed(3);
      badge.style.transform = `scale(${lerp(0.7, 1, b)})`;
    },
  });

  /* ============================================================
     SCENE 5 — Attack 2: AI-generated image + provenance scan
     ============================================================ */
  reg({
    id: "s05", name: "Attack 2", title: "Attack 2 \u00b7 AI-generated image", dur: 13,
    build(el, c) {
      el.classList.add("s05");
      const head = h("div", "s05-head");
      head.appendChild(h("div", "eyebrow", c.eyebrow));
      head.appendChild(h("div", "scene-line s05-line", c.line));
      el.appendChild(head);

      const stage = h("div", "s05-stage");
      const frame = h("div", "s05-frame");
      const im = document.createElement("img");
      im.src = c.img; im.alt = "AI selfie";
      frame.appendChild(im);
      const scan = h("div", "s05-scan");
      frame.appendChild(scan);
      frame.appendChild(h("div", "s05-imglabel mono", c.scanLabel));
      stage.appendChild(frame);

      const panel = h("div", "s05-cc");
      panel.appendChild(h("div", "cc-head mono", "Content Credentials"));
      const checks = ["C2PA manifest", "JUMBF box", "signed claim", "ingredients"];
      const rows = checks.map((t) => {
        const r = h("div", "cc-row mono");
        r.appendChild(h("span", "cc-k", t));
        r.appendChild(h("span", "cc-dot"));
        panel.appendChild(r);
        return r;
      });
      const result = h("div", "cc-result");
      result.appendChild(h("div", "cc-result-main", c.result));
      result.appendChild(h("div", "cc-result-sub mono", c.fallback));
      panel.appendChild(result);
      stage.appendChild(panel);
      el.appendChild(stage);
      this._r = { frame, scan, rows, result };
    },
    update(p) {
      const { frame, scan, rows, result } = this._r;
      const inF = seg(p, 0, 0.22, ease.outCubic);
      frame.style.opacity = inF;
      frame.style.transform = `scale(${lerp(0.96, 1, inF)})`;
      // scan sweep top->bottom
      const sc = seg(p, 0.24, 0.66, ease.inOutCubic);
      scan.style.opacity = (sc > 0 && sc < 1 ? 1 : 0).toString();
      scan.style.top = (sc * 100).toFixed(2) + "%";
      frame.style.setProperty("--scan", sc.toFixed(3));
      rows.forEach((r, i) => {
        const a = 0.3 + i * 0.09;
        const t = seg(p, a, a + 0.16, ease.outCubic);
        r.style.opacity = t.toFixed(3);
        r.classList.toggle("miss", t > 0.9);
      });
      const rt = seg(p, 0.72, 0.9, ease.outBackSoft);
      result.style.opacity = clamp(rt * 1.3, 0, 1).toFixed(3);
      result.style.transform = `translateY(${lerp(16, 0, rt)}px)`;
    },
  });

  /* ============================================================
     SCENE 5b — Attack 2 forensic read (selfie left, points right)
     ============================================================ */
  reg({
    id: "s05b", name: "Attempt 2 · read", title: "Attempt 2 · forensic read", dur: 13,
    build(el, c) {
      el.classList.add("fread", "s05b");
      const head = h("div", "fread-head");
      head.appendChild(h("div", "eyebrow", c.eyebrow));
      head.appendChild(h("div", "scene-line fread-line", c.line));
      el.appendChild(head);

      const stage = h("div", "fread-stage");
      const ev = h("div", "fread-evidence");
      const frame = h("div", "fread-frame");
      const im = document.createElement("img");
      im.src = c.img; im.alt = "AI selfie";
      frame.appendChild(im);
      frame.appendChild(h("div", "fread-imglabel mono", c.imgLabel));
      ev.appendChild(frame);
      stage.appendChild(ev);

      const pts = TBD.makePoints(c);
      stage.appendChild(pts.el);
      el.appendChild(stage);
      this._r = { frame, pts };
    },
    update(p) {
      const { frame, pts } = this._r;
      const inF = seg(p, 0, 0.2, ease.outCubic);
      frame.style.opacity = inF.toFixed(3);
      frame.style.transform = `scale(${lerp(0.96, 1, inF)})`;
      TBD.drivePoints(pts, p, { start: 0.24, stagger: 0.12 });
    },
  });
})();
