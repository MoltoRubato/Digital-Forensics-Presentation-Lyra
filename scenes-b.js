/* ============================================================
   Trust by Design — scenes 6–9  (v2)
   6 = handle AI image · 7 = vendor bonus · 8 = tampered document · 9 = preserve
   ============================================================ */
(function () {
  const TBD = window.TBD;
  const { h, seg, ease, clamp, lerp } = TBD;
  const reg = TBD.register;

  /* ============================================================
     SCENE 6 — Handling AI images: evidence stack + verdict
     ============================================================ */
  reg({
    id: "s06", name: "Fix 2", title: "Accumulate evidence", dur: 13,
    build(el, c) {
      el.classList.add("s06");
      const head = h("div", "s06-head");
      head.appendChild(h("div", "eyebrow", c.eyebrow));
      head.appendChild(h("div", "scene-line s06-line", c.line));
      el.appendChild(head);

      const stage = h("div", "s06-stage");
      const stackWrap = h("div", "s06-stack");
      const cards = c.stack.map((t, i) => {
        const card = h("div", "ev-card");
        card.appendChild(h("span", "ev-idx mono", String(i + 1).padStart(2, "0")));
        card.appendChild(h("span", "ev-k", t));
        stackWrap.appendChild(card);
        return card;
      });
      stage.appendChild(stackWrap);

      const v = TBD.makeVerdict({ head: "Verdict", fields: c.fields, verdict: c.verdict });
      stage.appendChild(v.el);
      el.appendChild(stage);
      this._r = { cards, v };
    },
    update(p) {
      const { cards, v } = this._r;
      cards.forEach((card, i) => {
        const a = 0.04 + i * 0.075;
        const t = seg(p, a, a + 0.24, ease.outBackSoft);
        card.style.opacity = clamp(t * 1.2, 0, 1).toFixed(3);
        card.style.transform = `translateY(${lerp(60, 0, t)}px) scale(${lerp(0.95, 1, t)})`;
      });
      TBD.driveVerdict(v, p, { start: 0.4, stagger: 0.09, stampAt: 0.82 });
    },
  });

  /* ============================================================
     SCENE 7 — Bonus: provenance & detection vendors
     Three vendor cards flip in; the Anthropic card resolves to a
     calm "n/a". Reuses the verdict-card / evidence motif.
     ============================================================ */
  reg({
    id: "s07", name: "Vendors", title: "Provenance vendors", dur: 14,
    build(el, c) {
      el.classList.add("s07");
      const head = h("div", "s07-head");
      head.appendChild(h("div", "eyebrow", c.eyebrow));
      head.appendChild(h("div", "scene-line s07-line", c.line));
      el.appendChild(head);

      const stage = h("div", "s07-stage");
      const grid = h("div", "s07-grid");
      const cards = c.vendors.map((vd) => {
        const cell = h("div", "vendor-cell");
        const inner = h("div", "vendor-inner " + (vd.tone === "calm" ? "calm" : "locked"));
        inner.appendChild(h("div", "vendor-k", vd.k));
        inner.appendChild(h("div", "vendor-d", vd.d));
        const tag = h("div", "vendor-tag mono");
        tag.appendChild(h("span", "vendor-dot"));
        tag.appendChild(h("span", null, vd.state));
        inner.appendChild(tag);
        cell.appendChild(inner);
        grid.appendChild(cell);
        return { cell, inner, tag };
      });
      stage.appendChild(grid);

      const take = h("div", "s07-take");
      take.appendChild(h("span", "take-rule"));
      take.appendChild(h("span", null, c.takeaway));
      stage.appendChild(take);
      el.appendChild(stage);
      this._r = { cards, take };
    },
    update(p) {
      const { cards, take } = this._r;
      cards.forEach((card, i) => {
        const a = 0.06 + i * 0.16;
        // 3D flip-in
        const t = seg(p, a, a + 0.34, ease.outCubic);
        const rot = lerp(84, 0, t);
        card.inner.style.transform = `perspective(1100px) rotateY(${rot}deg)`;
        card.cell.style.opacity = clamp(t * 1.6, 0, 1).toFixed(3);
        // tag settles slightly after the card lands
        const tg = seg(p, a + 0.26, a + 0.42, ease.outCubic);
        card.tag.style.opacity = tg.toFixed(3);
      });
      const tk = seg(p, 0.78, 0.96, ease.outCubic);
      take.style.opacity = tk.toFixed(3);
      take.style.transform = `translateY(${lerp(18, 0, tk)}px)`;
    },
  });

  /* ============================================================
     SCENE 8 — Attempt 3: tampered document (structured file)
     The OFFICIAL stamp peels back to reveal the PDF object tree /
     stacked revision layers — a structured file with a history,
     so tampering is read directly, not inferred.
     ============================================================ */
  reg({
    id: "s08", name: "Attempt 3", title: "Attempt 3 · tampered document", dur: 15,
    build(el, c) {
      el.classList.add("s08");
      const head = h("div", "s08-head");
      head.appendChild(h("div", "eyebrow", c.eyebrow));
      head.appendChild(h("div", "scene-line s08-line", c.line));
      head.appendChild(h("div", "s08-sub mono", c.sublabel));
      el.appendChild(head);

      const stage = h("div", "s08-stage");

      // LEFT — the document, whose stamp peels to expose stacked revision layers
      const doc = h("div", "s08-doc");
      const layers = c.layers.map((t, i) => {
        const ly = h("div", "rev-layer");
        ly.appendChild(h("span", "rev-idx mono", String(i + 1).padStart(2, "0")));
        ly.appendChild(h("span", "rev-k mono", t));
        doc.appendChild(ly);
        return ly;
      });
      const sheet = h("div", "doc-sheet");
      for (let i = 0; i < 5; i++) sheet.appendChild(h("div", "doc-line" + (i === 0 ? " head" : "")));
      const stamp = h("div", "doc-stamp", c.stamp);
      doc.appendChild(sheet);
      doc.appendChild(stamp);
      doc.appendChild(h("div", "struct-head mono", c.structHead));
      stage.appendChild(doc);

      // RIGHT — what you read directly from the structure
      const panel = h("div", "s08-reads");
      panel.appendChild(h("div", "reads-head mono", "read directly from structure"));
      const rows = c.reads.map((rd) => {
        const r = h("div", "read-row" + (rd.flag ? " flag" : ""));
        r.appendChild(h("span", "read-k mono", rd.k));
        r.appendChild(h("span", "read-v mono", rd.v));
        panel.appendChild(r);
        return r;
      });
      // three-state output chips
      const out = h("div", "s08-out");
      const chips = c.outputs.map((o, i) => {
        const chip = h("div", "out-chip" + (o === c.verdict ? " active" : ""));
        chip.appendChild(h("span", null, o));
        out.appendChild(chip);
        return chip;
      });
      panel.appendChild(out);
      stage.appendChild(panel);
      el.appendChild(stage);
      this._r = { doc, sheet, stamp, layers, panel, rows, chips };
    },
    update(p) {
      const { doc, sheet, stamp, layers, panel, rows, chips } = this._r;
      const inD = seg(p, 0, 0.22, ease.outBackSoft);
      doc.style.opacity = clamp(inD * 1.2, 0, 1).toFixed(3);
      doc.style.transform = `translateX(${lerp(80, 0, inD)}px)`;

      // stamp peels back
      const peel = seg(p, 0.28, 0.52, ease.inOutCubic);
      stamp.style.transform = `rotate(${lerp(-8, -42, peel)}deg) translate(${lerp(0, 96, peel)}px,${lerp(0, -64, peel)}px) scale(${lerp(1, 0.7, peel)})`;
      stamp.style.opacity = (1 - peel * 0.85).toFixed(3);

      // flat sheet fades as the structured revision layers fan out beneath it
      const expose = seg(p, 0.36, 0.58, ease.inOutCubic);
      sheet.style.opacity = (1 - expose * 0.85).toFixed(3);
      doc.style.setProperty("--expose", expose.toFixed(3));
      layers.forEach((ly, i) => {
        const a = 0.42 + i * 0.08;
        const t = seg(p, a, a + 0.2, ease.outBackSoft);
        ly.style.opacity = clamp(t * 1.2, 0, 1).toFixed(3);
        ly.style.transform = `translateY(${lerp(26, 0, t)}px) scale(${lerp(0.94, 1, t)})`;
        ly.classList.toggle("appended", i === layers.length - 1 && t > 0.9);
      });

      // reads expose, flagged rows snap red
      const po = seg(p, 0.5, 0.64, ease.outCubic);
      panel.style.opacity = po.toFixed(3);
      panel.style.transform = `translateY(${lerp(20, 0, po)}px)`;
      rows.forEach((r, i) => {
        const a = 0.56 + i * 0.06;
        const t = seg(p, a, a + 0.16, ease.outCubic);
        r.style.opacity = t.toFixed(3);
        r.style.transform = `translateX(${lerp(16, 0, t)}px)`;
        r.classList.toggle("on", t > 0.9);
      });

      // three-state output: the verdict chip lights last
      chips.forEach((chip) => {
        const ct = seg(p, 0.88, 0.99, ease.outBackSoft);
        if (chip.classList.contains("active")) {
          chip.style.opacity = clamp(ct * 1.3, 0, 1).toFixed(3);
          chip.style.transform = `scale(${lerp(0.86, 1, ct)})`;
        } else {
          chip.style.opacity = (0.4 * seg(p, 0.82, 0.92)).toFixed(3);
        }
      });
    },
  });

  /* ============================================================
     SCENE 8b — Attempt 3 forensic read (document left, points right)
     ============================================================ */
  reg({
    id: "s08b", name: "Attempt 3 · read", title: "Attempt 3 · forensic read", dur: 14,
    build(el, c) {
      el.classList.add("fread", "s08b");
      const head = h("div", "fread-head");
      head.appendChild(h("div", "eyebrow", c.eyebrow));
      head.appendChild(h("div", "scene-line fread-line", c.line));
      el.appendChild(head);

      const stage = h("div", "fread-stage");
      const ev = h("div", "fread-evidence");
      // same stamped document mockup, held in place from the attack slide
      const doc = h("div", "fread-doc");
      const sheet = h("div", "doc-sheet");
      for (let i = 0; i < 5; i++) sheet.appendChild(h("div", "doc-line" + (i === 0 ? " head" : "")));
      const stamp = h("div", "doc-stamp", c.stamp);
      doc.appendChild(sheet);
      doc.appendChild(stamp);
      ev.appendChild(doc);
      stage.appendChild(ev);

      const pts = TBD.makePoints(c);
      stage.appendChild(pts.el);
      el.appendChild(stage);
      this._r = { doc, pts };
    },
    update(p) {
      const { doc, pts } = this._r;
      const inD = seg(p, 0, 0.2, ease.outCubic);
      doc.style.opacity = clamp(inD * 1.2, 0, 1).toFixed(3);
      doc.style.transform = `translateY(${lerp(22, 0, inD)}px)`;
      TBD.drivePoints(pts, p, { start: 0.24, stagger: 0.11 });
    },
  });

  /* ============================================================
     SCENE 9 — Preserve bytes, structure, uncertainty (chain assembles)
     ============================================================ */
  reg({
    id: "s09", name: "Fix 3", title: "Preserve the chain", dur: 13,
    build(el, c) {
      el.classList.add("s09");
      const head = h("div", "s09-head");
      head.appendChild(h("div", "eyebrow", c.eyebrow));
      head.appendChild(h("div", "scene-line s09-line", c.line));
      el.appendChild(head);

      const stage = h("div", "s09-stage");
      const chain = h("div", "s09-chain");
      const links = [];
      c.chain.forEach((t, i) => {
        if (i > 0) {
          const con = h("div", "chain-con");
          con.appendChild(h("div", "chain-lock"));
          chain.appendChild(con);
          links.push({ con, lock: con.querySelector(".chain-lock") });
        }
        const link = h("div", "chain-link");
        link.appendChild(h("span", "link-idx mono", String(i + 1).padStart(2, "0")));
        link.appendChild(h("span", "link-k", t));
        chain.appendChild(link);
        links.push({ link });
      });
      stage.appendChild(chain);
      el.appendChild(stage);
      this._r = { links };
    },
    update(p) {
      const { links } = this._r;
      let order = 0;
      const total = links.length;
      links.forEach((node) => {
        const a = 0.04 + order * (0.72 / total);
        if (node.link) {
          const t = seg(p, a, a + 0.2, ease.outBackSoft);
          node.link.style.opacity = clamp(t * 1.2, 0, 1).toFixed(3);
          node.link.style.transform = `translateY(${lerp(28, 0, t)}px) scale(${lerp(0.9, 1, t)})`;
        } else {
          const t = seg(p, a, a + 0.16, ease.outCubic);
          node.con.style.setProperty("--draw", t.toFixed(3));
          const lk = seg(p, a + 0.08, a + 0.2, ease.outBackSoft);
          node.lock.style.opacity = clamp(lk * 1.3, 0, 1).toFixed(3);
          node.lock.style.transform = `scale(${lerp(0.4, 1, lk)})`;
        }
        order++;
      });
    },
  });
})();
