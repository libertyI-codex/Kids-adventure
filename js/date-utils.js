(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function localDateKey(date) {
    var d = date || new Date();
    return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join("-");
  }

  function compactDateKey(dateKey) {
    return String(dateKey || localDateKey()).replace(/-/g, "");
  }

  function localIsoString(date) {
    var d = date || new Date();
    var offsetMinutes = -d.getTimezoneOffset();
    var sign = offsetMinutes >= 0 ? "+" : "-";
    var abs = Math.abs(offsetMinutes);
    return [
      d.getFullYear(), "-", pad(d.getMonth() + 1), "-", pad(d.getDate()),
      "T", pad(d.getHours()), ":", pad(d.getMinutes()), ":", pad(d.getSeconds()),
      sign, pad(Math.floor(abs / 60)), ":", pad(abs % 60)
    ].join("");
  }

  function weekdayKey(date) {
    return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][(date || new Date()).getDay()];
  }

  function formatDisplayDate(dateKey) {
    var parts = String(dateKey || localDateKey()).split("-");
    if (parts.length !== 3) return dateKey;
    return Number(parts[1]) + "月" + Number(parts[2]) + "日";
  }

  KA.date = {
    localDateKey: localDateKey,
    compactDateKey: compactDateKey,
    localIsoString: localIsoString,
    weekdayKey: weekdayKey,
    formatDisplayDate: formatDisplayDate
  };
})(window);
