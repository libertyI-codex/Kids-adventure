(function (global) {
  "use strict";

  var KA = global.KodomoAdventure = global.KodomoAdventure || {};
  var routes = {};
  var current = { name: "home", params: {} };

  function register(name, renderer) {
    routes[name] = renderer;
  }

  function navigate(name, params) {
    if (!routes[name]) name = "home";
    current = { name: name, params: params || {} };
    var ui = KA.state.getUiState();
    if (ui) {
      ui.lastRoute = name;
      KA.state.saveUiState();
    }
    render();
  }

  function render() {
    KA.state.ensureTodayRecord();
    var renderer = routes[current.name] || routes.home;
    renderer(current.params || {});
  }

  function getCurrent() {
    return current;
  }

  KA.router = {
    register: register,
    navigate: navigate,
    render: render,
    getCurrent: getCurrent
  };
})(window);
