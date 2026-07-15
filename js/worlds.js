(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};

  var WORLD_SLOT_GROUPS = {
    world_forest: {
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
    },
    world_sea: {
      blue: [
        { zone: "water_center", x: 48, y: 42 },
        { zone: "surface_light", x: 70, y: 30 },
        { zone: "coral_side", x: 30, y: 67 }
      ],
      green: [
        { zone: "seaweed_side", x: 22, y: 72 },
        { zone: "seaweed_side", x: 76, y: 73 },
        { zone: "water_center", x: 58, y: 52 }
      ],
      pink: [
        { zone: "coral_side", x: 30, y: 72 },
        { zone: "coral_side", x: 72, y: 74 },
        { zone: "sand_side", x: 54, y: 82 }
      ],
      red: [
        { zone: "coral_side", x: 72, y: 74 },
        { zone: "coral_side", x: 28, y: 76 },
        { zone: "water_center", x: 60, y: 50 }
      ],
      yellow: [
        { zone: "surface_light", x: 44, y: 31 },
        { zone: "sand_side", x: 50, y: 82 },
        { zone: "surface_light", x: 66, y: 38 }
      ],
      orange: [
        { zone: "coral_side", x: 74, y: 76 },
        { zone: "sand_side", x: 38, y: 83 },
        { zone: "water_center", x: 57, y: 56 }
      ],
      other: [
        { zone: "water_center", x: 50, y: 56 },
        { zone: "surface_light", x: 35, y: 35 },
        { zone: "sand_side", x: 62, y: 78 }
      ]
    },
    world_island: {
      blue: [
        { zone: "shore", x: 25, y: 70 },
        { zone: "sky_side", x: 74, y: 34 },
        { zone: "beach", x: 38, y: 76 }
      ],
      green: [
        { zone: "grass", x: 58, y: 67 },
        { zone: "palm_side", x: 78, y: 62 },
        { zone: "hill", x: 44, y: 57 }
      ],
      pink: [
        { zone: "flowers", x: 72, y: 75 },
        { zone: "flowers", x: 50, y: 74 },
        { zone: "grass", x: 62, y: 62 }
      ],
      red: [
        { zone: "flowers", x: 70, y: 74 },
        { zone: "path", x: 55, y: 78 },
        { zone: "grass", x: 36, y: 62 }
      ],
      yellow: [
        { zone: "beach", x: 34, y: 76 },
        { zone: "sunny_grass", x: 62, y: 55 },
        { zone: "path", x: 55, y: 80 }
      ],
      orange: [
        { zone: "beach", x: 42, y: 78 },
        { zone: "palm_side", x: 78, y: 65 },
        { zone: "flowers", x: 66, y: 73 }
      ],
      other: [
        { zone: "path", x: 52, y: 76 },
        { zone: "hill", x: 48, y: 58 },
        { zone: "grass", x: 70, y: 66 }
      ]
    },
    world_castle: {
      blue: [
        { zone: "fountain", x: 50, y: 70 },
        { zone: "sky_side", x: 72, y: 34 },
        { zone: "garden", x: 28, y: 72 }
      ],
      green: [
        { zone: "lawn", x: 36, y: 71 },
        { zone: "lawn", x: 66, y: 72 },
        { zone: "gate_side", x: 52, y: 56 }
      ],
      pink: [
        { zone: "flower_bed", x: 78, y: 77 },
        { zone: "flower_bed", x: 26, y: 78 },
        { zone: "lawn", x: 62, y: 68 }
      ],
      red: [
        { zone: "flag_side", x: 74, y: 39 },
        { zone: "flower_bed", x: 78, y: 78 },
        { zone: "lawn", x: 34, y: 67 }
      ],
      yellow: [
        { zone: "gate_side", x: 50, y: 57 },
        { zone: "sunny_lawn", x: 64, y: 66 },
        { zone: "path", x: 49, y: 81 }
      ],
      orange: [
        { zone: "path", x: 46, y: 80 },
        { zone: "flower_bed", x: 28, y: 77 },
        { zone: "sunny_lawn", x: 66, y: 65 }
      ],
      other: [
        { zone: "courtyard", x: 51, y: 66 },
        { zone: "lawn", x: 35, y: 70 },
        { zone: "gate_side", x: 67, y: 57 }
      ]
    },
    world_sky_island: {
      blue: [
        { zone: "sky_side", x: 68, y: 34 },
        { zone: "cloud_side", x: 30, y: 40 },
        { zone: "waterfall", x: 58, y: 69 }
      ],
      green: [
        { zone: "floating_grass", x: 50, y: 67 },
        { zone: "floating_grass", x: 70, y: 62 },
        { zone: "cloud_side", x: 34, y: 58 }
      ],
      pink: [
        { zone: "rainbow", x: 70, y: 42 },
        { zone: "flowers", x: 60, y: 70 },
        { zone: "cloud_side", x: 30, y: 63 }
      ],
      red: [
        { zone: "rainbow", x: 70, y: 43 },
        { zone: "flowers", x: 62, y: 72 },
        { zone: "floating_grass", x: 42, y: 66 }
      ],
      yellow: [
        { zone: "light_side", x: 46, y: 36 },
        { zone: "rainbow", x: 72, y: 44 },
        { zone: "floating_grass", x: 56, y: 66 }
      ],
      orange: [
        { zone: "rainbow", x: 74, y: 48 },
        { zone: "light_side", x: 42, y: 38 },
        { zone: "floating_grass", x: 60, y: 68 }
      ],
      other: [
        { zone: "floating_grass", x: 50, y: 66 },
        { zone: "cloud_side", x: 30, y: 58 },
        { zone: "sky_side", x: 72, y: 36 }
      ]
    },
    world_secret_base: {
      blue: [
        { zone: "window_light", x: 48, y: 48 },
        { zone: "table_side", x: 74, y: 63 },
        { zone: "rug_center", x: 52, y: 72 }
      ],
      green: [
        { zone: "plant_corner", x: 84, y: 72 },
        { zone: "rug_center", x: 46, y: 74 },
        { zone: "cushion_side", x: 36, y: 80 }
      ],
      pink: [
        { zone: "table_side", x: 72, y: 68 },
        { zone: "map_wall", x: 54, y: 50 },
        { zone: "cushion_side", x: 42, y: 82 }
      ],
      red: [
        { zone: "table_front", x: 68, y: 76 },
        { zone: "treasure_side", x: 30, y: 82 },
        { zone: "rug_center", x: 54, y: 70 }
      ],
      yellow: [
        { zone: "lamp_light", x: 62, y: 48 },
        { zone: "window_light", x: 46, y: 46 },
        { zone: "rug_center", x: 50, y: 76 }
      ],
      orange: [
        { zone: "kitchen_front", x: 32, y: 72 },
        { zone: "table_front", x: 73, y: 75 },
        { zone: "treasure_side", x: 28, y: 82 }
      ],
      other: [
        { zone: "rug_center", x: 52, y: 72 },
        { zone: "kitchen_front", x: 35, y: 70 },
        { zone: "table_side", x: 74, y: 68 }
      ]
    }
  };

  var FALLBACK_WORLD_ID = "world_forest";

  function hashString(value) {
    var hash = 0;
    var str = String(value || "");
    for (var i = 0; i < str.length; i += 1) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function worldDefinitions() {
    return (KA.constants.WORLD_DEFINITIONS || []).slice().sort(function (a, b) {
      return Number(a.displayOrder || 0) - Number(b.displayOrder || 0);
    });
  }

  function isValidWorldId(worldId) {
    return worldDefinitions().some(function (world) {
      return world.id === worldId;
    });
  }

  function safeWorldId(worldId) {
    return isValidWorldId(worldId) ? worldId : FALLBACK_WORLD_ID;
  }

  function selectedWorldId() {
    var ui = KA.state.getUiState();
    if (!ui) return FALLBACK_WORLD_ID;
    ui.selectedWorldId = safeWorldId(ui.selectedWorldId || FALLBACK_WORLD_ID);
    return ui.selectedWorldId;
  }

  function setSelectedWorldId(worldId) {
    var ui = KA.state.getUiState();
    var next = safeWorldId(worldId);
    if (ui) {
      ui.selectedWorldId = next;
      KA.state.saveUiState();
    }
    return next;
  }

  function world(worldId) {
    var data = KA.state.getAppData();
    var id = safeWorldId(worldId || selectedWorldId());
    data.worlds = data.worlds && typeof data.worlds === "object" && !Array.isArray(data.worlds) ? data.worlds : {};
    data.worlds[id] = data.worlds[id] || { worldId: id, id: id, placements: [] };
    if (typeof data.worlds[id] !== "object") {
      data.worlds[id] = { worldId: id, id: id, placements: [] };
    }
    data.worlds[id].placements = data.worlds[id].placements || [];
    return data.worlds[id];
  }

  function allWorlds() {
    var data = KA.state.getAppData();
    return worldDefinitions().map(function (definition) {
      return data.worlds[definition.id] || definition;
    });
  }

  function getWorld(worldId) {
    return world(safeWorldId(worldId));
  }

  function rawPlacements(worldId) {
    return world(worldId).placements;
  }

  function numeric(value, fallback) {
    var number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function roundPercent(value) {
    return Math.round(Number(value || 0) * 10) / 10;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function clampPlacementPercent(xPercent, yPercent) {
    return {
      xPercent: roundPercent(clamp(numeric(xPercent, 50), 6, 94)),
      yPercent: roundPercent(clamp(numeric(yPercent, 64), 12, 90))
    };
  }

  function slotFamily(analysis) {
    var family = analysis && analysis.dominantColorFamily || "other";
    if (family === "cyan") return "blue";
    if (family === "purple" || family === "brown" || family === "white" || family === "black") return "other";
    return (WORLD_SLOT_GROUPS.world_forest[family] ? family : "other");
  }

  function isUsedInList(list, x, y, ignorePlacementId) {
    return list.some(function (placement) {
      if (!placement || placement.placementId === ignorePlacementId) return false;
      var px = numeric(placement.xPercent, numeric(placement.x, 50));
      var py = numeric(placement.yPercent, numeric(placement.y, 64));
      return Math.abs(px - x) < 8 && Math.abs(py - y) < 8;
    });
  }

  function isSlotUsed(x, y, worldId) {
    return isUsedInList(rawPlacements(worldId), x, y, null);
  }

  function chooseSlotFromList(artwork, placements, ignorePlacementId, worldId) {
    var id = safeWorldId(worldId || FALLBACK_WORLD_ID);
    var family = slotFamily(artwork.analysis);
    var groups = WORLD_SLOT_GROUPS[id] || WORLD_SLOT_GROUPS.world_forest;
    var slots = groups[family] || groups.other;
    var seed = hashString(String(artwork.artworkId || "") + ":" + id);
    for (var i = 0; i < slots.length; i += 1) {
      var candidate = slots[(seed + i) % slots.length];
      if (!isUsedInList(placements, candidate.x, candidate.y, ignorePlacementId)) return candidate;
    }
    var base = slots[seed % slots.length];
    return {
      zone: base.zone,
      x: Math.max(10, Math.min(90, base.x + ((seed % 13) - 6))),
      y: Math.max(24, Math.min(86, base.y + ((seed % 11) - 5)))
    };
  }

  function chooseSlot(artwork, worldId) {
    var id = safeWorldId(worldId || selectedWorldId());
    return chooseSlotFromList(artwork, rawPlacements(id), null, id);
  }

  function animationFor(type) {
    if (type === "butterfly") return "flutter";
    if (type === "rabbit") return "hop";
    if (type === "flower") return "sway";
    if (type === "cat") return "sit";
    if (type === "dolphin") return "swim";
    if (type === "dinosaur") return "hop";
    if (type === "horse") return "trot";
    if (type === "lion") return "trot";
    if (type === "panda") return "sit";
    if (type === "grasshopper") return "hop";
    return "sway";
  }

  function recommendedWorldForTemplate(templateId) {
    if (templateId === "coloring_cat_001") return "world_castle";
    if (templateId === "coloring_dolphin_001") return "world_sea";
    if (templateId === "coloring_dinosaur_001") return "world_island";
    if (templateId === "coloring_horse_001") return "world_island";
    if (templateId === "coloring_lion") return "world_island";
    if (templateId === "coloring_panda") return "world_forest";
    if (templateId === "coloring_grasshopper") return "world_forest";
    return "world_forest";
  }

  function recommendedWorldIds(templateId) {
    if (templateId === "coloring_butterfly_001") return ["world_forest", "world_island", "world_sky_island"];
    if (templateId === "coloring_flower_001") return ["world_forest", "world_island", "world_castle"];
    if (templateId === "coloring_rabbit_001") return ["world_forest", "world_island"];
    if (templateId === "coloring_cat_001") return ["world_castle", "world_island"];
    if (templateId === "coloring_dolphin_001") return ["world_sea"];
    if (templateId === "coloring_dinosaur_001") return ["world_island"];
    if (templateId === "coloring_horse_001") return ["world_island", "world_castle"];
    if (templateId === "coloring_lion") return ["world_island", "world_castle"];
    if (templateId === "coloring_panda") return ["world_forest", "world_island"];
    if (templateId === "coloring_grasshopper") return ["world_forest", "world_island", "world_sky_island"];
    return ["world_forest"];
  }

  function ensurePlacementFields(placement, index, worldId) {
    if (!placement) return false;
    var before = JSON.stringify(placement);
    if (!placement.placementId && placement.artworkId) {
      placement.placementId = "placement_" + placement.artworkId;
    }
    placement.worldId = safeWorldId(placement.worldId || worldId || FALLBACK_WORLD_ID);
    var x = typeof placement.xPercent === "undefined" ? placement.x : placement.xPercent;
    var y = typeof placement.yPercent === "undefined" ? placement.y : placement.yPercent;
    var clamped = clampPlacementPercent(x, y);
    placement.xPercent = clamped.xPercent;
    placement.yPercent = clamped.yPercent;
    placement.x = placement.xPercent;
    placement.y = placement.yPercent;
    if (typeof placement.isManual === "undefined") placement.isManual = false;
    if (!placement.zIndex) placement.zIndex = index + 1;
    placement.zIndex = Math.max(1, Math.min(999, Math.round(numeric(placement.zIndex, index + 1))));
    placement.updatedAt = placement.updatedAt || placement.createdAt || KA.date.localIsoString();
    return before !== JSON.stringify(placement);
  }

  function getPlacements(worldId) {
    var id = safeWorldId(worldId || selectedWorldId());
    var list = rawPlacements(id);
    var changed = false;
    list.forEach(function (placement, index) {
      if (ensurePlacementFields(placement, index, id)) changed = true;
    });
    if (changed) {
      world(id).updatedAt = KA.date.localIsoString();
      KA.state.saveAppData();
    }
    return list;
  }

  function getAllPlacements() {
    var all = [];
    allWorlds().forEach(function (currentWorld) {
      all = all.concat(getPlacements(currentWorld.worldId || currentWorld.id));
    });
    return all;
  }

  function nextZIndex(worldId) {
    return getPlacements(worldId).reduce(function (max, placement) {
      return Math.max(max, numeric(placement.zIndex, 0));
    }, 0) + 1;
  }

  function normalizeZIndexes(worldId) {
    var id = safeWorldId(worldId || selectedWorldId());
    var list = getPlacements(id).slice().sort(function (a, b) {
      var diff = numeric(a.zIndex, 0) - numeric(b.zIndex, 0);
      if (diff) return diff;
      return String(a.createdAt || a.placementId).localeCompare(String(b.createdAt || b.placementId));
    });
    var changed = false;
    list.forEach(function (placement, index) {
      if (placement.zIndex !== index + 1) {
        placement.zIndex = index + 1;
        placement.updatedAt = KA.date.localIsoString();
        changed = true;
      }
    });
    if (changed) world(id).updatedAt = KA.date.localIsoString();
    return changed;
  }

  function findPlacement(artworkIdOrPlacementId) {
    var found = null;
    allWorlds().some(function (currentWorld) {
      var id = currentWorld.worldId || currentWorld.id;
      found = getPlacements(id).filter(function (placement) {
        return placement.artworkId === artworkIdOrPlacementId || placement.placementId === artworkIdOrPlacementId;
      })[0] || null;
      return Boolean(found);
    });
    return found;
  }

  function removePlacementFromWorld(placementId, worldId) {
    var list = rawPlacements(worldId);
    for (var i = list.length - 1; i >= 0; i -= 1) {
      if (list[i].placementId === placementId) list.splice(i, 1);
    }
  }

  function buildAutoPlacement(artwork, targetWorldId, existingPlacement) {
    var id = safeWorldId(targetWorldId);
    var template = KA.coloring.getTemplate(artwork.templateId);
    var temporary = getPlacements(id).filter(function (placement) {
      return !existingPlacement || placement.placementId !== existingPlacement.placementId;
    });
    var slot = chooseSlotFromList(artwork, temporary, existingPlacement && existingPlacement.placementId, id);
    var clamped = clampPlacementPercent(slot.x, slot.y);
    var ratio = artwork.analysis ? Number(artwork.analysis.completionRatio || 0.3) : 0.3;
    var now = KA.date.localIsoString();
    return {
      placementId: existingPlacement ? existingPlacement.placementId : "placement_" + artwork.artworkId,
      artworkId: artwork.artworkId,
      profileId: artwork.profileId,
      worldId: id,
      objectType: template ? template.worldObjectType : "artwork",
      layer: template && template.kind === "plant" ? "plants" : "creatures",
      zone: slot.zone,
      x: clamped.xPercent,
      y: clamped.yPercent,
      xPercent: clamped.xPercent,
      yPercent: clamped.yPercent,
      zIndex: nextZIndex(id),
      isManual: false,
      scale: Math.round((0.82 + Math.min(1, ratio) * 0.28) * 100) / 100,
      animation: animationFor(template ? template.worldObjectType : "artwork"),
      seed: artwork.artworkId,
      createdAt: existingPlacement ? existingPlacement.createdAt : now,
      updatedAt: now
    };
  }

  function addArtworkPlacement(artwork, worldId) {
    var existing = findPlacement(artwork.artworkId);
    if (existing) return existing;
    var id = safeWorldId(worldId || recommendedWorldForTemplate(artwork.templateId));
    var placement = buildAutoPlacement(artwork, id, null);
    getPlacements(id).push(placement);
    world(id).stats.totalArtworks = getPlacements(id).length;
    world(id).stats.totalLifetimeStarsAtLastUpdate = KA.state.getAppData().profile.starTotals.lifetimeStars;
    world(id).updatedAt = KA.date.localIsoString();
    return placement;
  }

  function placementForArtwork(artworkId) {
    return findPlacement(artworkId);
  }

  function worldForArtwork(artworkId) {
    var placement = placementForArtwork(artworkId);
    return placement ? getWorld(placement.worldId) : getWorld(FALLBACK_WORLD_ID);
  }

  function updatePlacementPosition(placementId, xPercent, yPercent, zIndex, isManual) {
    var placement = findPlacement(placementId);
    if (!placement) return null;
    var clamped = clampPlacementPercent(xPercent, yPercent);
    placement.xPercent = clamped.xPercent;
    placement.yPercent = clamped.yPercent;
    placement.x = clamped.xPercent;
    placement.y = clamped.yPercent;
    if (typeof zIndex !== "undefined" && zIndex !== null) placement.zIndex = Math.max(1, Math.min(999, Math.round(numeric(zIndex, nextZIndex(placement.worldId)))));
    if (typeof isManual !== "undefined") placement.isManual = Boolean(isManual);
    placement.updatedAt = KA.date.localIsoString();
    world(placement.worldId).updatedAt = placement.updatedAt;
    return placement;
  }

  function resetToAutoPlacements(worldId) {
    var id = safeWorldId(worldId || selectedWorldId());
    var list = getPlacements(id);
    var used = [];
    list.forEach(function (placement, index) {
      var artwork = KA.coloring.getArtwork(placement.artworkId);
      if (!artwork) return;
      var slot = chooseSlotFromList(artwork, used, placement.placementId, id);
      var clamped = clampPlacementPercent(slot.x, slot.y);
      placement.zone = slot.zone;
      placement.worldId = id;
      placement.xPercent = clamped.xPercent;
      placement.yPercent = clamped.yPercent;
      placement.x = clamped.xPercent;
      placement.y = clamped.yPercent;
      placement.zIndex = index + 1;
      placement.isManual = false;
      placement.updatedAt = KA.date.localIsoString();
      used.push(placement);
    });
    world(id).updatedAt = KA.date.localIsoString();
    return list;
  }

  function moveArtworkToWorld(artworkId, targetWorldId) {
    var artwork = KA.coloring.getArtwork(artworkId);
    if (!artwork) return { ok: false, reason: "artwork_not_found" };
    var id = safeWorldId(targetWorldId);
    var existing = placementForArtwork(artworkId);
    if (existing && existing.worldId === id) return { ok: true, placement: existing, alreadyThere: true };
    if (existing) removePlacementFromWorld(existing.placementId, existing.worldId);
    var placement = buildAutoPlacement(artwork, id, existing);
    getPlacements(id).push(placement);
    normalizeZIndexes(id);
    world(id).updatedAt = KA.date.localIsoString();
    return { ok: true, placement: placement };
  }

  function worldLabel(worldId) {
    return getWorld(worldId).name || "もり";
  }

  KA.worlds = {
    world: world,
    allWorlds: allWorlds,
    getWorld: getWorld,
    getPlacements: getPlacements,
    getAllPlacements: getAllPlacements,
    addArtworkPlacement: addArtworkPlacement,
    placementForArtwork: placementForArtwork,
    worldForArtwork: worldForArtwork,
    updatePlacementPosition: updatePlacementPosition,
    resetToAutoPlacements: resetToAutoPlacements,
    normalizeZIndexes: normalizeZIndexes,
    nextZIndex: nextZIndex,
    moveArtworkToWorld: moveArtworkToWorld,
    recommendedWorldForTemplate: recommendedWorldForTemplate,
    recommendedWorldIds: recommendedWorldIds,
    selectedWorldId: selectedWorldId,
    setSelectedWorldId: setSelectedWorldId,
    isValidWorldId: isValidWorldId,
    safeWorldId: safeWorldId,
    worldLabel: worldLabel,
    clampPlacementPercent: clampPlacementPercent,
    chooseSlot: chooseSlot,
    animationFor: animationFor,
    hashString: hashString,
    isSlotUsed: isSlotUsed
  };
})(window);
