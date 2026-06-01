/* Tweaks app — controls the deck's accent signal color and playback pace.
   Mounts an independent React root for the panel only; the deck itself
   is vanilla JS and reads the CSS var / TBD.setPace. */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "signal": "#e5484d",
  "pace": 2
}/*EDITMODE-END*/;

function TweaksApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    document.documentElement.style.setProperty("--signal", t.signal);
  }, [t.signal]);
  React.useEffect(() => {
    if (window.TBD) window.TBD.setPace(t.pace);
  }, [t.pace]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Signal color" />
      <TweakColor
        label="Accent"
        value={t.signal}
        options={["#e5484d", "#d6541f", "#b13bd6", "#2f74e0", "#1f8a5b"]}
        onChange={(v) => setTweak("signal", v)}
      />
      <TweakSection label="Playback" />
      <TweakSlider
        label="Pace"
        value={t.pace}
        min={0.5}
        max={2}
        step={0.1}
        unit="×"
        onChange={(v) => setTweak("pace", v)}
      />
    </TweaksPanel>
  );
}

(function mountTweaks() {
  const el = document.getElementById("tweaks-root");
  ReactDOM.createRoot(el).render(<TweaksApp />);
})();
