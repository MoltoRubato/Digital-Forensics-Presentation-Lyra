/* ============================================================
   Trust by Design — CONTENT layer  (v2 · 13 slides)
   All copy, numbers and asset references live here, separated
   from styling (CSS) and motion (scene modules). Edit text and
   data here without touching animation code.
   ============================================================ */
window.CONTENT = {
  s01: {
    kicker: "In 2026, seeing is not verifying.",
    line: "Three ways to fake a proof.",
    line2: "And how a system should catch each one.",
    artifacts: ["edited screenshot", "AI selfie", "suspicious PDF"],
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
    verdict: "Signal, not verdict",
  },
  s03: {
    eyebrow: "Attempt 1 · edited screenshot",
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
    line: "Don’t verify screenshots. Verify sources.",
    sources: ["Strava API", "Health Connect", "Apple HealthKit"],
    badge: "Signed record",
    note: "A screenshot is a file the user controls. A source record is data the platform controls.",
  },
  s05: {
    eyebrow: "Attempt 2 · AI-generated image",
    line: "The proof photo was never taken.",
    img: "assets/selfie.jpg",
    scanLabel: "Provenance scan",
    result: "No Content Credentials found",
    fallback: "no credential is not proof of real · fall back to other checks",
  },
  s06: {
    eyebrow: "How the app should handle AI-generated images",
    line: "Accumulate evidence, don’t trust one score.",
    stack: ["Provenance", "Metadata", "Perceptual hash", "Artifact heuristics", "Detector", "Business rule"],
    fields: [
      { k: "Provenance", v: "none" },
      { k: "OCR", v: "consistent" },
      { k: "Metadata", v: "2 flags" },
      { k: "Detector", v: "0.81" },
    ],
    verdict: "Suspicious",
  },
  s07: {
    eyebrow: "Bonus · provenance & detection vendors",
    line: "Useful signals. Each one ecosystem-locked.",
    vendors: [
      { k: "OpenAI", d: "C2PA on image & Sora output, plus a public Verify web tool.", state: "OpenAI-origin only", tone: "locked" },
      { k: "Google", d: "SynthID watermark in Imagen / Gemini, plus a SynthID Detector.", state: "Google infra only", tone: "locked" },
      { k: "Anthropic", d: "Claude is text & code. No image-provenance product to wire in.", state: "n/a, and that’s fine", tone: "calm" },
    ],
    takeaway: "Extra signals for the stack. Never the answer.",
  },
  s08: {
    eyebrow: "Attempt 3 · tampered document",
    sublabel: "not Lyra Active, but the one that matters most",
    line: "It looks official.",
    stamp: "OFFICIAL",
    structHead: "a structured file, not a flat raster",
    layers: ["rev 1 · original", "rev 2 · edit", "rev 3 · appended after signing"],
    reads: [
      { k: "xref / revisions", v: "3 layers" },
      { k: "CreateDate vs ModDate", v: "differ", flag: true },
      { k: "Producer", v: "unknown tool", flag: true },
      { k: "Signature coverage", v: "content appended", flag: true },
      { k: "Image object", v: "replaced", flag: true },
    ],
    outputs: ["intact", "modified", "cannot verify"],
    verdict: "modified",
  },
  s09: {
    eyebrow: "Handling documents & higher-stakes evidence",
    line: "Preserve bytes. Preserve structure. Preserve uncertainty.",
    chain: ["Original bytes", "SHA-256", "Structure snapshot", "OCR JSON", "Immutable audit record"],
  },
  s10: {
    eyebrow: "The production architecture I’d actually ship",
    line: "Cheap inspection first. Models last. Policy decides.",
    stages: [
      { k: "Ingest", s: "original bytes" },
      { k: "Immutable store", s: "write-once" },
      { k: "Provenance", s: "C2PA validate" },
      { k: "Metadata / OCR", s: "image | document" },
      { k: "Model scoring", s: "by modality" },
      { k: "Policy engine", s: "merge · decide" },
      { k: "Analyst review", s: "verdict + uncertainty" },
    ],
    token: "submission",
    verdict: "Needs review",
  },
  s11: {
    eyebrow: "Current toolbox for engineers",
    line: "Cheap inspection first, by layer.",
    cells: [
      { k: "Browser", d: "CAI browser libs", t: "read C2PA" },
      { k: "Node", d: "Sharp · ffprobe", t: "header / container" },
      { k: "Node", d: "c2pa-node v2", t: "manifests" },
      { k: "Python", d: "c2pa-python", t: "validate + sign" },
      { k: "Metadata", d: "ExifTool 13.59", t: "the scalpel" },
      { k: "OCR", d: "Cloud Vision · Doc AI", t: "text + docs" },
      { k: "PDF", d: "pikepdf · qpdf", t: "structure + repair" },
      { k: "PDF", d: "pdfid · pdf-parser", t: "object triage" },
      { k: "Source", d: "Strava · Health", t: "first-party" },
      { k: "Mobile", d: "Play Integrity", t: "device trust" },
      { k: "Provenance", d: "OpenAI Verify", t: "ecosystem-locked" },
      { k: "Provenance", d: "SynthID Detector", t: "triage only" },
    ],
  },
  s12: {
    eyebrow: "Six rules to remember",
    rules: [
      "Records over screenshots",
      "Capture over upload",
      "Provenance over appearance",
      "Structure over surface",
      "Evidence stacks over single scores",
      "Uncertainty labels over fake certainty",
    ],
  },
  s13: {
    eyebrow: "Mini-workshop & close",
    line: "If you owned this flow, where would you move trust upstream?",
    chips: ["What’s the claim?", "What’s the source of truth?", "How do we collect evidence closer to the source?"],
    close: "Make trust expensive to fake, and cheap to verify.",
  },
};
