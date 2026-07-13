(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};

  var SLOT_GROUPS = {
    blue: [
      { zone: "water_side", x: 22, y: 72 },
      { zone: "sky_side", x: 75, y: 32 },
      { zone: "water_side", x: 34, y: 78 }
    ],
    green: [
      { zone: "tree_side", x: 30, y: 52 },
      { zone: "grass_side", x: 60, y: 76 },
      { zone: "tree_side", x: 78, y: 55 }
    ],
    pink: [
      { zone: "flower_side", x: 72, y: 70 },
      { zone: "flower_side", x: 58, y: 64 },
      { zone: "flower_side", x: 84, y: 74 }
    ],
    red: [
      { zone: "flower_side", x: 70, y: 68 },
      { zone: "flower_side", x: 55, y: 72 },
      { zone: "bright_side", x: 48, y: 58 }
    ],
    yellow: [
      { zone: "bright_side", x: 46, y: 47 },
      { zone: "bright_side", x: 64, y: 42 },
      { zone: "grass_side", x: 42, y: 76 }
    ],
    orange: [
      { zone: "bright_side", x: 50, y: 52 },
      { zone: "grass_side", x: 38, y: 72 },
      { zone: "flower_side", x: 82, y: 68 }
    ],
    other: [
      { zone: "open_side", x: 50, y: 66 },
      { zone: "open_side", x: 66, y: 56 },
      { zone: "open_side", x: 36, y: 62 }
    ]
  };

  function hashString(value) {
    var hash = 0;
    var str = String(value || "");
    for (var i = 0; i < str.length; i += 1) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function world() {
    return KA.state.getAppData().worlds.world_forest;
  }

  function getPlacements() {
    return world().placements || [];
  }

  function slotFamily(analysis) {
    var family = analysis && analysis.dominantColorFamily || "other";
    if (family === "cyan") return "blue";
    if (family === "purple" || family === "brown" || family === "white") return "other";
    return SLOT_GROUPS[family] ? family : "other";
  }

  function isSlotUsed(x, y) {
    return getPlacements().some(function (placement) {
      return Math.abs(Number(placement.x) - x) < 8 && Math.abs(Number(placement.y) - y) < 8;
    });
  }

  function chooseSlot(artwork) {
    var family = slotFamily(artwork.analysis);
    var slots = SLOT_GROUPS[family] || SLOT_GROUPS.other;
    var seed = hashString(artwork.artworkId);
    for (var i = 0; i < slots.length; i += 1) {
      var candidate = slots[(seed + i) % slots.length];
      if (!isSlotUsed(candidate.x, candidate.y)) return candidate;
    }
    var base = slots[seed % slots.length];
    return {
      zone: base.zone,
      x: Math.max(10, Math.min(90, base.x + ((seed % 13) - 6))),
      y: Math.max(24, Math.min(86, base.y + ((seed % 11) - 5)))
    };
  }

  function animationFor(type) {
    if (type === "butterfly") return "flutter";
    if (type === "rabbit") return "hop";
    if (type === "flower") return "sway";
    if (type === "cat") return "sit";
    if (type === "dolphin") return "swim";
    if (type === "dinosaur") return "hop";
    if (type === "horse") return "trot";
    return "sway";
  }

  function addArtworkPlacement(artwork) {
    var existing = getPlacements().filter(function (placement) {
      return placement.artworkId === artwork.artworkId;
    })[0];
    if (existing) return existing;
    var template = KA.coloring.getTemplate(artwork.templateId);
    var slot = chooseSlot(artwork);
    var ratio = artwork.analysis ? Number(artwork.analysis.completionRatio || 0.3) : 0.3;
    var placement = {
      placementId: "placement_" + artwork.artworkId,
      artworkId: artwork.artworkId,
      profileId: artwork.profileId,
      objectType: template ? template.worldObjectType : "artwork",
      layer: template && template.kind === "plant" ? "plants" : "creatures",
      zone: slot.zone,
      x: slot.x,
      y: slot.y,
      scale: Math.round((0.82 + Math.min(1, ratio) * 0.28) * 100) / 100,
      animation: animationFor(template ? template.worldObjectType : "artwork"),
      seed: artwork.artworkId,
      createdAt: KA.date.localIsoString()
    };
    getPlacements().push(placement);
    world().stats.totalArtworks = KA.state.getAppData().artworks.length;
    world().stats.totalLifetimeStarsAtLastUpdate = KA.state.getAppData().profile.starTotals.lifetimeStars;
    world().updatedAt = KA.date.localIsoString();
    return placement;
  }

  function placementForArtwork(artworkId) {
    return getPlacements().filter(function (placement) {
      return placement.artworkId === artworkId;
    })[0] || null;
  }

  KA.worlds = {
    world: world,
    getPlacements: getPlacements,
    addArtworkPlacement: addArtworkPlacement,
    placementForArtwork: placementForArtwork,
    hashString: hashString
  };
})(window);
