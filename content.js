/* ============================================================
   Trust by Design — CONTENT layer
   All copy, numbers and asset references live here, separated
   from styling (CSS) and motion (scene modules). Edit text and
   data here without touching animation code.
   ============================================================ */
window.CONTENT = {
  s01: {
    kicker: "In 2026, seeing is not verifying.",
    line: "I tried to cheat the system four times.",
    line2: "Here\u2019s how a modern webapp should catch me.",
    artifacts: ["edited screenshot", "AI selfie", "cloned voice", "suspicious PDF"],
    submit: "Submit",
  },
  s02: {
    eyebrow: "What digital forensics means in a webapp",
    cols: [
      { k: "Provenance", d: "Where did it come from? Is its history signed?" },
      { k: "Metadata", d: "What does the file say about itself?" },
      { k: "Structure", d: "Does it match the format & workflow it claims?" },
      { k: "Model signals", d: "Does a detector see synthetic patterns?" },
    ],
    verdict: "Trust signal extracted",
  },
  s03: {
    eyebrow: "Attack 1 \u00b7 I edit a screenshot",
    line: "Change the number, keep the vibe.",
    real: "assets/card-real.png",
    fake: "assets/card-fake.png",
    realLabel: "Genuine record",
    fakeLabel: "Tampered upload",
    deltas: [
      { label: "Duration", from: 2, to: 2, fromU: "s", toU: "h", text: true, fromT: "2s", toT: "2h" },
      { label: "Best set", from: 10, to: 200, unit: " kg" },
      { label: "Total volume", from: 900, to: 18000, unit: " kg" },
    ],
    flag: "still looks legit",
  },
  s04: {
    eyebrow: "What actually catches screenshot fraud",
    line: "Don\u2019t verify screenshots. Verify sources.",
    sources: ["Strava API", "Health Connect", "Apple HealthKit"],
    badge: "Signed record",
    note: "Screenshots become a low-trust fallback \u2014 not the evidence path.",
  },
  s05: {
    eyebrow: "Attack 2 \u00b7 I submit an AI-generated image",
    line: "The proof photo was never taken.",
    img: "assets/selfie.jpg",
    scanLabel: "Provenance scan",
    result: "No Content Credentials found",
    fallback: "\u2192 fall back to other checks",
  },
  s06: {
    eyebrow: "How the app should handle AI-generated images",
    line: "Accumulate evidence \u2014 don\u2019t trust one score.",
    stack: ["Provenance", "Metadata", "Artifact heuristics", "Detector", "Business rule"],
    fields: [
      { k: "Provenance", v: "none" },
      { k: "OCR", v: "consistent" },
      { k: "Metadata", v: "2 flags" },
      { k: "Detector", v: "0.81" },
    ],
    verdict: "Suspicious",
  },
  s07: {
    eyebrow: "Attack 3 \u00b7 cloned voice / synthetic video",
    line: "Real-time impersonation.",
    tag: "Fake interaction, not just fake content.",
    waveLabel: "captured audio",
    fakeLabel: "synthetic",
    syncLabel: "lip-sync drift",
  },
  s08: {
    eyebrow: "What catches audio & live deepfake fraud",
    line: "Capture channel beats media file.",
    bad: { k: "Arbitrary upload", d: "any file, any origin", risk: "high risk" },
    good: { k: "In-app capture", d: "+ integrity check + liveness", risk: "lower risk" },
  },
  s09: {
    eyebrow: "Attack 4 \u00b7 a suspicious PDF",
    line: "It looks official.",
    stamp: "OFFICIAL",
    reveal: "rasterised screenshot-of-a-PDF",
    meta: ["producer: \u2014", "xmp: stripped", "fonts: none embedded", "image-only page"],
  },
  s10: {
    eyebrow: "Handling documents & higher-stakes evidence",
    line: "Preserve bytes. Preserve chain. Preserve uncertainty.",
    chain: ["Original file", "SHA-256", "OCR JSON", "Review decision", "Immutable audit record"],
  },
  s11: {
    eyebrow: "The production architecture I\u2019d actually ship",
    line: "Cheap inspection first. Models last. Policy decides.",
    stages: [
      { k: "Ingest", s: "original bytes" },
      { k: "Immutable store", s: "write-once" },
      { k: "Provenance", s: "C2PA validate" },
      { k: "Metadata / OCR", s: "cheap signals" },
      { k: "Model scoring", s: "by modality" },
      { k: "Policy engine", s: "merge \u00b7 decide" },
      { k: "Analyst review", s: "verdict + uncertainty" },
    ],
    token: "submission",
    verdict: "Needs review",
  },
  s12: {
    eyebrow: "Current toolbox for engineers",
    line: "Cheap inspection first, by layer.",
    cells: [
      { k: "Browser", d: "CAI browser libs", t: "read C2PA" },
      { k: "Node", d: "Sharp \u00b7 ffprobe", t: "header / container" },
      { k: "Node", d: "c2pa-node v2", t: "manifests" },
      { k: "Python", d: "c2pa-python", t: "validate + sign" },
      { k: "Metadata", d: "ExifTool 13.59", t: "the scalpel" },
      { k: "OCR", d: "Cloud Vision", t: "text + docs" },
      { k: "Source", d: "Strava \u00b7 Health", t: "first-party" },
      { k: "Mobile", d: "Play Integrity", t: "device trust" },
      { k: "Enterprise", d: "RealityDefender", t: "triage scores" },
    ],
  },
  s13: {
    eyebrow: "Six rules to remember",
    rules: [
      "Records over screenshots",
      "Capture over upload",
      "Provenance over appearance",
      "Evidence stacks over single scores",
      "Immutable storage over overwritten files",
      "Uncertainty labels over fake certainty",
    ],
  },
  s14: {
    eyebrow: "Mini-workshop & close",
    line: "If you owned this flow, where would you move trust upstream?",
    chips: ["What\u2019s the claim?", "What\u2019s the source of truth?", "How do we collect evidence closer to the source?"],
    close: "Make trust expensive to fake \u2014 and cheap to verify.",
  },
};
