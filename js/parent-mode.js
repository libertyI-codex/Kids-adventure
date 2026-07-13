(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};

  function bindParentGate(button, onReady) {
    var timer = null;
    var startedAt = 0;
    var progressTimer = null;
    var holdMs = (KA.state.getAppData().settings.parentGate || {}).holdMs || 2000;

    function clear() {
      if (timer) global.clearTimeout(timer);
      if (progressTimer) global.clearInterval(progressTimer);
      timer = null;
      progressTimer = null;
      button.style.setProperty("--hold-progress", "0%");
    }

    function start(event) {
      event.preventDefault();
      clear();
      startedAt = Date.now();
      progressTimer = global.setInterval(function () {
        var ratio = Math.min(1, (Date.now() - startedAt) / holdMs);
        button.style.setProperty("--hold-progress", Math.round(ratio * 100) + "%");
      }, 40);
      timer = global.setTimeout(function () {
        clear();
        onReady();
      }, holdMs);
    }

    button.addEventListener("pointerdown", start);
    button.addEventListener("pointerup", clear);
    button.addEventListener("pointercancel", clear);
    button.addEventListener("pointerleave", clear);
  }

  function updateProfileName(name) {
    KA.state.getAppData().profile.displayName = String(name || "結羽").trim() || "結羽";
    KA.state.saveAppData();
  }

  function saveParentNote(artworkId, note) {
    var artwork = KA.coloring.getArtwork(artworkId);
    if (!artwork) return false;
    artwork.parentNote = String(note || "");
    var record = KA.state.getDailyRecord(artwork.localDate);
    record.parentNotes = record.parentNotes || {};
    record.parentNotes[artworkId] = artwork.parentNote;
    KA.state.saveAppData();
    return true;
  }

  function toggleFavorite(artworkId) {
    var artwork = KA.coloring.getArtwork(artworkId);
    if (!artwork) return false;
    artwork.favorite = !artwork.favorite;
    KA.state.saveAppData();
    return artwork.favorite;
  }

  KA.parentMode = {
    bindParentGate: bindParentGate,
    updateProfileName: updateProfileName,
    saveParentNote: saveParentNote,
    toggleFavorite: toggleFavorite
  };
})(window);
