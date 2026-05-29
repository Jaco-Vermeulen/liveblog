'use strict';

var theme = require('./theme');

document.addEventListener('DOMContentLoaded', () => {
  theme.init();
});
if (/complete|loaded|interactive/.test(document.readyState)){
  theme.init();
}

window.LiveBlog = {
  init: theme.init,
  loadEmbeds: theme.loadEmbeds
};

function exposeLoadEmbeds() {
  if (window.LB) {
    window.LB.loadEmbeds = theme.loadEmbeds;
  }
}

exposeLoadEmbeds();
document.addEventListener('DOMContentLoaded', exposeLoadEmbeds);

module.exports = {};
