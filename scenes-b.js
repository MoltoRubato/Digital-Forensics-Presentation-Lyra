/* ============================================================
   Trust by Design — scenes 6–10
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
        const a = 0.05 + i * 0.09;
        const t = seg(p, a, a + 0.24, ease.outBackSoft);
        card.style.opacity = clamp(t * 1.2, 0, 1).toFixed(3);
        card.style.transform = `translateY(${lerp(60, 0, t)}px) scale(${lerp(0.95, 1, t)})`;
      });
      TBD.driveVerdict(v, p, { start: 0.34, stagger: 0.1, stampAt: 0.78 });
    },
  });

  /* ============================================================
     SCENE 7 — Attack 3: cloned voice / synthetic video
     ============================================================ */
  reg({
    id: "s07", name: "Attack 3", title: "Attack 3 \u00b7 synthetic interaction", dur: 13,
    build(el, c) {
      el.classList.add("s07");
      const head = h("div", "s07-head");
      head.appendChild(h("div", "eyebrow", c.eyebrow));
      head.appendChild(h("div", "scene-line s07-line", c.line));
      el.appendChild(head);

      const stage = h("div", "s07-stage");
      const wave = h("div", "s07-wave");
      const bars = [];
      const N = 64;
      for (let i = 0; i < N; i++) {
        const b = h("span");
        wave.appendChild(b);
        bars.push(b);
      }
      const wlabel = h("div", "wave-label mono", c.waveLabel);
      const wrap = h("div", "s07-wavewrap");
      wrap.appendChild(wave);
      wrap.appendChild(wlabel);
      stage.appendChild(wrap);

      // lip-sync row
      const sync = h("div", "s07-sync");
      const face = h("div", "sync-face");
      face.appendChild(h("div", "sync-mouth"));
      const audioMark = h("div", "sync-mark audio");
      audioMark.appendChild(h("span", "mono", "audio"));
      const mouthMark = h("div", "sync-mark mouth");
      mouthMark.appendChild(h("span", "mono", "lips"));
      const driftLine = h("div", "sync-drift");
      sync.appendChild(face);
      sync.appendChild(driftLine);
      sync.appendChild(audioMark);
      sync.appendChild(mouthMark);
      sync.appendChild(h("div", "sync-label mono", c.syncLabel));
      stage.appendChild(sync);

      const tag = h("div", "s07-tag", c.tag);
      stage.appendChild(tag);
      el.appendChild(stage);
      this._r = { bars, wave, wlabel, fakeLabel: c.fakeLabel, audioMark, mouthMark, driftLine, tag };
    },
    update(p) {
      const { bars, wave, wlabel, fakeLabel, audioMark, mouthMark, driftLine, tag } = this._r;
      const N = bars.length;
      const draw = seg(p, 0.0, 0.3, ease.outCubic);
      const morph = seg(p, 0.34, 0.62, ease.inOutCubic);
      bars.forEach((b, i) => {
        // deterministic pseudo-wave from sine combos (no random)
        const realH = 0.3 + 0.7 * Math.abs(Math.sin(i * 0.5) * Math.cos(i * 0.17));
        const fakeH = 0.2 + 0.8 * Math.abs(Math.sin(i * 1.3 + 1) * Math.sin(i * 0.4));
        const drawn = clamp((draw * N - i) / 3, 0, 1);
        const hgt = lerp(realH, fakeH, morph) * drawn;
        b.style.height = (hgt * 100).toFixed(1) + "%";
        b.style.opacity = drawn.toFixed(3);
      });
      wave.classList.toggle("synthetic", morph > 0.5);
      wlabel.textContent = morph > 0.5 ? fakeLabel : this._r.wlabel.dataset.real || "captured audio";
      // lip-sync drift
      const driftT = seg(p, 0.42, 0.8, ease.inOutCubic);
      audioMark.style.transform = `translateX(${lerp(0, -90, driftT)}px)`;
      mouthMark.style.transform = `translateX(${lerp(0, 90, driftT)}px)`;
      driftLine.style.setProperty("--drift", driftT.toFixed(3));
      driftLine.style.opacity = driftT.toFixed(3);
      const tg = seg(p, 0.8, 0.95, ease.outBackSoft);
      tag.style.opacity = clamp(tg * 1.3, 0, 1).toFixed(3);
      tag.style.transform = `translateY(${lerp(16, 0, tg)}px)`;
    },
  });

  /* ============================================================
     SCENE 8 — Capture channel beats media file (decision tree)
     ============================================================ */
  reg({
    id: "s08", name: "Fix 3", title: "Capture beats upload", dur: 12,
    build(el, c) {
      el.classList.add("s08");
      const head = h("div", "s08-head");
      head.appendChild(h("div", "eyebrow", c.eyebrow));
      head.appendChild(h("div", "scene-line s08-line", c.line));
      el.appendChild(head);

      const stage = h("div", "s08-stage");
      const root = h("div", "tree-root mono", "live / semi-live flow");
      stage.appendChild(root);
      const branches = h("div", "tree-branches");
      const mk = (data, kind) => {
        const br = h("div", "branch " + kind);
        const ln = h("div", "branch-line");
        const node = h("div", "branch-node");
        node.appendChild(h("div", "branch-k", data.k));
        node.appendChild(h("div", "branch-d mono", data.d));
        const risk = h("div", "branch-risk mono", data.risk);
        br.appendChild(ln);
        br.appendChild(node);
        br.appendChild(risk);
        branches.appendChild(br);
        return { br, ln, node, risk };
      };
      const bad = mk(c.bad, "bad");
      const good = mk(c.good, "good");
      stage.appendChild(branches);
      el.appendChild(stage);
      this._r = { root, bad, good };
    },
    update(p) {
      const { root, bad, good } = this._r;
      const r = seg(p, 0, 0.22, ease.outCubic);
      root.style.opacity = r;
      root.style.transform = `translateY(${lerp(-20, 0, r)}px)`;
      const drive = (b, a) => {
        const t = seg(p, a, a + 0.26, ease.outCubic);
        b.ln.style.setProperty("--draw", t.toFixed(3));
        const n = seg(p, a + 0.12, a + 0.34, ease.outBackSoft);
        b.node.style.opacity = clamp(n * 1.2, 0, 1).toFixed(3);
        b.node.style.transform = `translateY(${lerp(24, 0, n)}px) scale(${lerp(0.92, 1, n)})`;
        const glow = seg(p, a + 0.3, a + 0.55, ease.outCubic);
        b.br.style.setProperty("--glow", glow.toFixed(3));
        const rk = seg(p, a + 0.4, a + 0.6, ease.outCubic);
        b.risk.style.opacity = rk.toFixed(3);
      };
      drive(bad, 0.28);
      drive(good, 0.42);
    },
  });

  /* ============================================================
     SCENE 9 — Attack 4: suspicious PDF
     ============================================================ */
  reg({
    id: "s09", name: "Attack 4", title: "Attack 4 \u00b7 the official-looking PDF", dur: 13,
    build(el, c) {
      el.classList.add("s09");
      const head = h("div", "s09-head");
      head.appendChild(h("div", "eyebrow", c.eyebrow));
      head.appendChild(h("div", "scene-line s09-line", c.line));
      el.appendChild(head);

      const stage = h("div", "s09-stage");
      const doc = h("div", "s09-doc");
      const sheet = h("div", "doc-sheet");
      for (let i = 0; i < 6; i++) sheet.appendChild(h("div", "doc-line" + (i === 0 ? " head" : "")));
      const stamp = h("div", "doc-stamp", c.stamp);
      doc.appendChild(sheet);
      doc.appendChild(stamp);
      stage.appendChild(doc);

      const under = h("div", "s09-under");
      under.appendChild(h("div", "under-tag mono", c.reveal));
      const metaWrap = h("div", "under-meta");
      const metas = c.meta.map((m) => {
        const r = h("div", "meta-row mono", m);
        metaWrap.appendChild(r);
        return r;
      });
      under.appendChild(metaWrap);
      stage.appendChild(under);
      el.appendChild(stage);
      this._r = { doc, sheet, stamp, under, metas };
    },
    update(p) {
      const { doc, stamp, under, metas } = this._r;
      const inD = seg(p, 0, 0.24, ease.outBackSoft);
      doc.style.opacity = clamp(inD * 1.2, 0, 1).toFixed(3);
      doc.style.transform = `translateX(${lerp(120, 0, inD)}px)`;
      // stamp peels back
      const peel = seg(p, 0.34, 0.62, ease.inOutCubic);
      stamp.style.setProperty("--peel", peel.toFixed(3));
      stamp.style.transform = `rotate(${lerp(-8, -40, peel)}deg) translate(${lerp(0, 90, peel)}px,${lerp(0, -60, peel)}px) scale(${lerp(1, 0.7, peel)})`;
      stamp.style.opacity = (1 - peel * 0.85).toFixed(3);
      doc.style.setProperty("--raster", seg(p, 0.4, 0.62).toFixed(3));
      // metadata exposes
      const uo = seg(p, 0.5, 0.66, ease.outCubic);
      under.style.opacity = uo.toFixed(3);
      under.style.transform = `translateY(${lerp(20, 0, uo)}px)`;
      metas.forEach((r, i) => {
        const a = 0.6 + i * 0.08;
        const t = seg(p, a, a + 0.16, ease.outCubic);
        r.style.opacity = t.toFixed(3);
        r.style.transform = `translateX(${lerp(16, 0, t)}px)`;
      });
    },
  });

  /* ============================================================
     SCENE 10 — Preserve bytes, chain, uncertainty (chain assembles)
     ============================================================ */
  reg({
    id: "s10", name: "Fix 4", title: "Preserve the chain", dur: 13,
    build(el, c) {
      el.classList.add("s10");
      const head = h("div", "s10-head");
      head.appendChild(h("div", "eyebrow", c.eyebrow));
      head.appendChild(h("div", "scene-line s10-line", c.line));
      el.appendChild(head);

      const stage = h("div", "s10-stage");
      const chain = h("div", "s10-chain");
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
      // links and connectors interleaved; animate in order
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
