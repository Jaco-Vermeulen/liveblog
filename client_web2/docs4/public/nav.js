(function() {
  const THEME_KEY = 'liveblog-docs4-theme';
  const ADMIN_KEY = 'liveblog-docs4-admin';
  const DARK = 'dark';
  const LIGHT = 'light';

  /** Nav folder categories hidden in "human" (non-admin) mode. Task reports stay visible. */
  const ADMIN_NAV_CATEGORIES = new Set([
    'Wireframes', 'Commands', 'Reference', 'Documentation', 'Guides & procedures',
    'Planning & implementation', 'Planner reports', 'Reports'
  ]);

  function getStoredAdmin() {
    try {
      return localStorage.getItem(ADMIN_KEY) === 'true';
    } catch (_) {
      return false;
    }
  }

  function setStoredAdmin(value) {
    try {
      localStorage.setItem(ADMIN_KEY, value ? 'true' : 'false');
    } catch (_) {}
  }

  function applyAdminMode() {
    var isAdmin = getStoredAdmin();
    document.body.setAttribute('data-admin', isAdmin ? 'true' : 'false');
    var folders = document.querySelectorAll('.nav-folder[data-nav-category]');
    folders.forEach(function(folder) {
      var cat = folder.getAttribute('data-nav-category');
      folder.style.display = (cat && ADMIN_NAV_CATEGORIES.has(cat) && !isAdmin) ? 'none' : '';
    });
  }

  /** Wrap AI-directive sections (e.g. "For AI Agents") in .admin-only so they hide when not admin. */
  function markAiDirectiveSections() {
    var body = document.querySelector('.markdown-body');
    if (!body || body.getAttribute('data-ai-marked')) return;
    var headings = Array.prototype.slice.call(body.querySelectorAll('h2, h3'));
    for (var i = 0; i < headings.length; i++) {
      var h = headings[i];
      var text = (h.textContent || '').trim();
      if (text.indexOf('For AI Agents') !== -1 || (text.indexOf('CRITICAL') !== -1 && text.indexOf('AI') !== -1)) {
        var nodes = [h];
        var n = h.nextElementSibling;
        while (n && n.tagName !== 'H2' && n.tagName !== 'H3') {
          nodes.push(n);
          n = n.nextElementSibling;
        }
        var wrap = document.createElement('div');
        wrap.className = 'admin-only ai-directive';
        var parent = h.parentNode;
        parent.insertBefore(wrap, h);
        for (var j = 0; j < nodes.length; j++) wrap.appendChild(nodes[j]);
      }
    }
    body.setAttribute('data-ai-marked', 'true');
  }

  function toggleAdminMode() {
    setStoredAdmin(!getStoredAdmin());
    applyAdminMode();
  }

  function initAdminToggle() {
    markAiDirectiveSections();
    applyAdminMode();

    var keyBuffer = '';
    var bufferMax = 6;
    document.addEventListener('keydown', function(e) {
      if (e.repeat) return;
      var key = e.key;
      if (!key || key.length !== 1) return;
      var tag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      keyBuffer = (keyBuffer + key).slice(-bufferMax);
      if (keyBuffer.toLowerCase() === 'admin') {
        toggleAdminMode();
        keyBuffer = '';
      }
    }, true);
  }

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || DARK;
    } catch (_) {
      return DARK;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (_) {}
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === DARK) {
      root.setAttribute('data-theme', DARK);
    } else {
      root.removeAttribute('data-theme');
    }
  }

  function updateToggleUI(theme) {
    var btn = document.getElementById('theme-toggle');
    var label = document.getElementById('theme-label');
    var sun = btn && btn.querySelector('.icon-sun');
    var moon = btn && btn.querySelector('.icon-moon');
    if (!btn || !label) return;
    if (theme === DARK) {
      label.textContent = 'Light';
      if (sun) sun.style.display = '';
      if (moon) moon.style.display = 'none';
    } else {
      label.textContent = 'Dark';
      if (sun) sun.style.display = 'none';
      if (moon) moon.style.display = '';
    }
  }

  function initTheme() {
    var theme = getStoredTheme();
    applyTheme(theme);
    updateToggleUI(theme);
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function() {
        theme = document.documentElement.getAttribute('data-theme') === DARK ? LIGHT : DARK;
        setStoredTheme(theme);
        applyTheme(theme);
        updateToggleUI(theme);
        try { document.documentElement.dispatchEvent(new CustomEvent('themechange')); } catch (_) {}
      });
    }
  }

  const NAV_STATE_KEY = 'liveblog-docs4-nav-open';

  function getNavState() {
    try {
      var raw = localStorage.getItem(NAV_STATE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function setNavState(state) {
    try {
      localStorage.setItem(NAV_STATE_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  function folderLabel(folder) {
    var cat = folder.getAttribute('data-nav-category');
    if (cat) return cat;
    var title = folder.querySelector('.nav-folder-title');
    if (title) return (title.textContent || '').trim();
    var rowLink = folder.querySelector('.nav-item-row .nav-link');
    if (rowLink) return (rowLink.textContent || '').trim();
    return '';
  }

  function assignFolderKeys() {
    function walk(ul, parentKey) {
      if (!ul) return;
      var folders = [];
      for (var i = 0; i < ul.children.length; i++) {
        var li = ul.children[i];
        if (li.classList && li.classList.contains('nav-folder')) folders.push(li);
      }
      folders.forEach(function(li) {
        if (li.classList.contains('nav-folder-open')) return;
        var cat = folderLabel(li);
        var key = parentKey ? parentKey + '|' + cat : cat;
        if (key) li.setAttribute('data-nav-key', key);
        var nested = li.querySelector('.nav-list.nested');
        walk(nested, key);
      });
    }
    var nav = document.querySelector('.nav-menu');
    if (nav) walk(nav, '');
  }

  function updateFolderButton(folder) {
    var btn = folder.querySelector('.nav-expand');
    if (!btn) return;
    var collapsed = folder.classList.contains('collapsed');
    btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    btn.setAttribute('title', collapsed ? 'Expand' : 'Collapse');
    btn.textContent = collapsed ? '\u25B6' : '\u25BC';
  }

  function expandFolder(folder) {
    if (!folder || folder.classList.contains('nav-folder-open')) return;
    folder.classList.remove('collapsed');
    updateFolderButton(folder);
  }

  function expandFolderAncestors(node) {
    var el = node && node.parentElement;
    while (el) {
      if (el.classList && el.classList.contains('nav-folder')) expandFolder(el);
      el = el.parentElement;
    }
  }

  function normalizeNavPath(path) {
    if (!path) return '/';
    try {
      var u = new URL(path, window.location.origin);
      path = u.pathname;
    } catch (_) {}
    path = path.replace(/\/index\.html$/i, '/').replace(/\/$/, '');
    return path || '/';
  }

  function restoreNavState() {
    var state = getNavState();
    document.querySelectorAll('.nav-folder[data-nav-key]').forEach(function(folder) {
      var key = folder.getAttribute('data-nav-key');
      if (key == null || !Object.prototype.hasOwnProperty.call(state, key)) return;
      if (state[key]) {
        expandFolder(folder);
      } else {
        folder.classList.add('collapsed');
        updateFolderButton(folder);
      }
    });
  }

  function saveNavState() {
    var state = {};
    document.querySelectorAll('.nav-folder[data-nav-key]').forEach(function(folder) {
      var key = folder.getAttribute('data-nav-key');
      if (key != null) state[key] = !folder.classList.contains('collapsed');
    });
    setNavState(state);
  }

  function initNav() {
    var navLinks = document.querySelectorAll('.nav-link');
    var currentPath = normalizeNavPath(window.location.pathname || '');

    navLinks.forEach(function(link) {
      var href = link.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#') return;
      var linkPath = normalizeNavPath(href);
      var isActive = currentPath === linkPath
        || (linkPath.length > 1 && currentPath.indexOf(linkPath + '/') === 0);
      if (isActive) {
        var item = link.closest('.nav-item');
        if (item) item.classList.add('active');
      }
    });

    assignFolderKeys();
    restoreNavState();

    document.querySelectorAll('.nav-item.active .nav-link').forEach(function(link) {
      expandFolderAncestors(link);
    });
    saveNavState();

    navLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        expandFolderAncestors(link);
        saveNavState();
      });
    });

    var folderTitles = document.querySelectorAll('.nav-folder-title');
    folderTitles.forEach(function(title) {
      title.addEventListener('click', function() {
        if (title.classList.contains('nav-folder-label')) return;
        var folder = this.closest('.nav-folder');
        if (folder && !folder.classList.contains('nav-folder-open')) {
          folder.classList.toggle('collapsed');
          updateFolderButton(folder);
          saveNavState();
        }
      });
    });

    var expandBtns = document.querySelectorAll('.nav-expand');
    expandBtns.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var folder = this.closest('.nav-folder');
        if (!folder) return;
        folder.classList.toggle('collapsed');
        updateFolderButton(folder);
        saveNavState();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initNav();
    initAdminToggle();
  });
})();
