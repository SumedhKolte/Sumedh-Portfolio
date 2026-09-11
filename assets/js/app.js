/* ------------------------------------------------------------------
   Sumedh Kolte — portfolio. IDE shell behaviour.

   No framework, no build step. State lives in one object; each piece
   of UI has a render function that reads it. Anything the user typed
   goes in through textContent, never innerHTML.
------------------------------------------------------------------- */
(function () {
  'use strict';

  var THEMES = ['obsidian', 'paper', 'contrast'];
  var STORE_KEY = 'sk-portfolio-theme';
  var NARROW = window.matchMedia('(max-width: 900px)');

  var state = {
    booting: true,
    theme: 'obsidian',
    tabs: ['about.md'],
    active: 'about.md',
    sideOpen: !NARROW.matches,
    sideView: 'files',
    zen: false,
    termOpen: true,
    chatOpen: false,
    paletteOpen: false,
    paletteSel: 0,
    paletteItems: [],
    copied: false,
    chatBusy: false,
    history: [],
    historyIdx: -1
  };

  /* --- element handles --------------------------------------------- */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var el = {};

  function cacheEls() {
    el.shell = $('#shell');
    el.boot = $('#boot');
    el.bootLines = $('#boot-lines');
    el.titlePath = $('#title-path');
    el.themeSwitch = $('#theme-switch');
    el.rail = $('#rail');
    el.explorer = $('#explorer');
    el.treeRoot = $('#tree-root');
    el.treeProj = $('#tree-proj');
    el.heat = $('#heat-grid');
    el.heatNote = $('#heat-note');
    el.sideFiles = $('#side-files');
    el.sideSearch = $('#side-search');
    el.searchInput = $('#search-input');
    el.searchSummary = $('#search-summary');
    el.searchResults = $('#search-results');
    el.tabs = $('#tabs');
    el.crumbFile = $('#crumb-file');
    el.crumbMeta = $('#crumb-meta');
    el.pane = $('#pane');
    el.terminal = $('#terminal');
    el.termLog = $('#term-log');
    el.termInput = $('#term-input');
    el.chat = $('#chat');
    el.chatLog = $('#chat-log');
    el.chatInput = $('#chat-input');
    el.statusFile = $('#status-file');
    el.btnCopy = $('#btn-copy');
    el.palette = $('#palette');
    el.paletteInput = $('#palette-input');
    el.paletteList = $('#palette-list');
    el.resumeLink = $('#resume-link');
  }

  function fileById(id) {
    for (var i = 0; i < FILES.length; i++) if (FILES[i].id === id) return FILES[i];
    return null;
  }

  /* --- theme -------------------------------------------------------- */
  function loadTheme() {
    var saved = null;
    try { saved = window.localStorage.getItem(STORE_KEY); } catch (e) { /* private mode */ }
    return THEMES.indexOf(saved) > -1 ? saved : 'obsidian';
  }

  function setTheme(name) {
    if (THEMES.indexOf(name) === -1) return;
    state.theme = name;
    document.documentElement.setAttribute('data-theme', name);
    try { window.localStorage.setItem(STORE_KEY, name); } catch (e) { /* ignore */ }
    renderThemeSwitch();
    if (typeof Skyline !== 'undefined') Skyline.retheme();
  }

  function renderThemeSwitch() {
    var btns = el.themeSwitch.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute('aria-pressed', String(btns[i].dataset.theme === state.theme));
    }
  }

  /* --- boot sequence ------------------------------------------------ */
  function runBoot() {
    var n = 0;
    var timer = setInterval(function () {
      if (n >= BOOT.length) { clearInterval(timer); return; }
      var b = BOOT[n++];
      var row = document.createElement('div');
      row.className = 'boot__line';
      var tag = document.createElement('span');
      tag.className = 'boot__tag';
      tag.textContent = b.tag;
      var txt = document.createElement('span');
      txt.style.color = 'var(--' + b.tone + ')';
      txt.textContent = b.text;
      row.appendChild(tag);
      row.appendChild(txt);
      el.bootLines.appendChild(row);
    }, 300);

    setTimeout(function () {
      clearInterval(timer);
      state.booting = false;
      el.boot.hidden = true;
      if (state.termOpen && !NARROW.matches) el.termInput.focus();
    }, 2100);
  }

  /* --- typing headline ---------------------------------------------- */
  var typeState = { role: 0, char: 0, timer: null };

  function typeTick() {
    var target = $('[data-typed]', el.pane);
    if (!target) return;                       // about.md not open — idle
    var full = ROLES[typeState.role % ROLES.length];
    if (typeState.char <= full.length) {
      target.textContent = full.slice(0, typeState.char);
      typeState.char++;
    } else {
      clearInterval(typeState.timer);
      setTimeout(function () {
        typeState.role++;
        typeState.char = 0;
        typeState.timer = setInterval(typeTick, 55);
      }, 1600);
    }
  }

  /* --- files, tabs, panes ------------------------------------------- */
  function openFile(id, opts) {
    if (!fileById(id)) return;
    opts = opts || {};
    if (state.tabs.indexOf(id) === -1) state.tabs.push(id);
    state.active = id;
    closePalette();
    if (NARROW.matches) state.sideOpen = false;
    if (opts.silent !== true) {
      try { history.replaceState(null, '', '#' + id); } catch (e) { location.hash = id; }
    }
    render();
  }

  function closeTab(id) {
    var i = state.tabs.indexOf(id);
    if (i === -1) return;
    state.tabs.splice(i, 1);
    if (!state.tabs.length) state.tabs = ['about.md'];
    if (state.active === id) state.active = state.tabs[Math.min(i, state.tabs.length - 1)];
    render();
  }

  function renderTree() {
    function build(container, group, nested) {
      container.innerHTML = '';
      FILES.filter(function (f) { return f.group === group; }).forEach(function (f) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'tree__file' + (nested ? ' tree__file--nested' : '');
        b.dataset.file = f.id;
        b.setAttribute('aria-current', String(state.active === f.id));
        var ic = document.createElement('span');
        ic.className = 'tree__icon';
        ic.style.color = 'var(--' + f.color + ')';
        ic.textContent = f.icon;
        var nm = document.createElement('span');
        nm.textContent = f.id;
        b.appendChild(ic);
        b.appendChild(nm);
        container.appendChild(b);
      });
    }
    build(el.treeRoot, 'root', false);
    build(el.treeProj, 'proj', true);
  }

  function renderTabs() {
    el.tabs.innerHTML = '';
    state.tabs.forEach(function (id) {
      var f = fileById(id) || { icon: 'M', color: 'a3' };
      var tab = document.createElement('div');
      tab.className = 'tab';
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(state.active === id));
      tab.dataset.file = id;
      tab.tabIndex = 0;

      var ic = document.createElement('span');
      ic.className = 'tab__icon';
      ic.style.color = 'var(--' + f.color + ')';
      ic.textContent = f.icon;

      var nm = document.createElement('span');
      nm.textContent = id;

      var x = document.createElement('button');
      x.type = 'button';
      x.className = 'tab__close';
      x.dataset.close = id;
      x.setAttribute('aria-label', 'Close ' + id);
      x.textContent = '×';

      tab.appendChild(ic);
      tab.appendChild(nm);
      tab.appendChild(x);
      el.tabs.appendChild(tab);
    });
    var sel = el.tabs.querySelector('[aria-selected="true"]');
    if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  var lastPane = null;
  function renderPane() {
    if (lastPane === state.active) return;
    lastPane = state.active;
    if (typeof Skyline !== 'undefined') Skyline.unmount();   // stop the old rAF loop
    el.pane.innerHTML = PANES[state.active] || '<div class="pane">File not found.</div>';
    el.pane.scrollTop = 0;

    if (state.active === 'skyline.3d' && typeof Skyline !== 'undefined') Skyline.mount(el.pane);

    if (state.active === 'about.md') {
      clearInterval(typeState.timer);
      typeState.char = 0;
      typeState.timer = setInterval(typeTick, 55);
      typeTick();
    }
  }

  function renderChrome() {
    var f = fileById(state.active) || {};
    el.titlePath.textContent = 'sumedh-kolte / portfolio — ' + state.active;
    el.crumbFile.textContent = state.active;
    el.crumbMeta.textContent = f.meta || '';
    el.statusFile.textContent = state.active;
    document.title = state.active + ' — Sumedh Kolte';

    el.shell.classList.toggle('is-zen', state.zen);
    el.shell.classList.toggle('is-side-open', state.sideOpen && !state.zen);
    el.sideFiles.hidden = state.sideView !== 'files';
    el.sideSearch.hidden = state.sideView !== 'search';
    el.terminal.hidden = !state.termOpen || state.zen;
    el.chat.hidden = !state.chatOpen || state.zen;
    el.palette.hidden = !state.paletteOpen;

    var railBtns = el.rail.querySelectorAll('button');
    for (var i = 0; i < railBtns.length; i++) {
      var act = railBtns[i].dataset.act;
      var visible = state.sideOpen && !state.zen;
      var on =
        act === 'explorer' ? visible && state.sideView === 'files' :
        act === 'search' ? visible && state.sideView === 'search' :
        act === 'terminal' ? state.termOpen && !state.zen :
        act === 'chat' ? state.chatOpen && !state.zen :
        act === 'zen' ? state.zen : false;
      railBtns[i].setAttribute('aria-pressed', String(on));
    }

    el.btnCopy.textContent = state.copied ? '✓ email copied' : 'copy email';
    el.btnCopy.classList.toggle('is-copied', state.copied);
  }

  function render() {
    renderChrome();
    renderTree();
    renderTabs();
    renderPane();
  }

  /* --- commit heat grid ---------------------------------------------
     26 weeks × 7 days. Paints an illustrative pattern immediately, then
     swaps in real GitHub contributions if they arrive. A failed or slow
     fetch simply leaves the placeholder — the grid is never empty and
     the label always says which of the two you are looking at. */
  var HEAT_DAYS = 182;
  var HEAT_MIX = [
    'var(--bg3)',
    'color-mix(in oklch, var(--a1) 22%, var(--bg3))',
    'color-mix(in oklch, var(--a1) 45%, var(--bg3))',
    'color-mix(in oklch, var(--a1) 70%, var(--bg3))',
    'var(--a1)'
  ];

  function paintHeat(cells) {
    var frag = document.createDocumentFragment();
    cells.forEach(function (c) {
      var cell = document.createElement('i');
      cell.style.background = HEAT_MIX[c.level];
      if (c.title) cell.title = c.title;
      frag.appendChild(cell);
    });
    el.heat.innerHTML = '';
    el.heat.appendChild(frag);
  }

  function renderHeatPlaceholder() {
    var cells = [];
    for (var i = 0; i < HEAT_DAYS; i++) {
      var v = Math.sin(i * 1.7) + Math.sin(i * 0.31) + Math.cos(i * 0.07);
      cells.push({ level: v > 1.4 ? 4 : v > 0.7 ? 3 : v > 0 ? 2 : v > -0.9 ? 1 : 0 });
    }
    paintHeat(cells);
  }

  function loadContributions() {
    // top-level `const` lives in script scope, not on window — test the binding
    if (typeof GITHUB === 'undefined' || !GITHUB.live || !window.fetch) {
      el.heatNote.textContent = 'Illustrative pattern — set GITHUB.live to sync real contributions.';
      return;
    }
    var url = GITHUB.endpoint.replace('{user}', encodeURIComponent(GITHUB.user));
    var done = false;
    var giveUp = setTimeout(function () {
      if (!done) el.heatNote.textContent = 'Illustrative pattern — GitHub did not answer in time.';
    }, 6000);

    fetch(url, { mode: 'cors' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        var days = (data && data.contributions) || [];
        if (!days.length) throw new Error('no contribution data');
        var recent = days.slice(-HEAT_DAYS);
        var total = 0;
        var cells = recent.map(function (d) {
          total += d.count || 0;
          return {
            level: Math.max(0, Math.min(4, d.level || 0)),
            title: (d.count || 0) + (d.count === 1 ? ' contribution on ' : ' contributions on ') + d.date
          };
        });
        done = true;
        clearTimeout(giveUp);
        paintHeat(cells);
        el.heat.setAttribute('aria-hidden', 'false');
        el.heat.setAttribute('role', 'img');
        el.heat.setAttribute('aria-label',
          total + ' GitHub contributions over the last ' + Math.round(recent.length / 7) + ' weeks');
        el.heatNote.textContent =
          'Live from GitHub · ' + total + ' contributions in the last ' + Math.round(recent.length / 7) + ' weeks.';
      })
      .catch(function () {
        done = true;
        clearTimeout(giveUp);
        el.heatNote.textContent = 'Illustrative pattern — GitHub unreachable right now.';
      });
  }

  /* --- project-wide search -------------------------------------------
     The panes are the only source of truth for content, so the index is
     built from them at boot: render each pane offscreen, read it back as
     text, keep the lines. Add a file to PANES and it becomes searchable
     with no extra work. */
  var searchIndex = {};

  function buildSearchIndex() {
    var host = document.createElement('div');
    host.setAttribute('aria-hidden', 'true');
    host.style.cssText = 'position:absolute;left:-99999px;top:0;width:900px;';
    document.body.appendChild(host);

    Object.keys(PANES).forEach(function (id) {
      host.innerHTML = PANES[id];
      var gutters = host.querySelectorAll('.cl__n, .dl__n');   // line numbers aren't content
      for (var i = 0; i < gutters.length; i++) gutters[i].parentNode.removeChild(gutters[i]);
      var text = host.innerText || host.textContent || '';
      searchIndex[id] = text.split('\n')
        .map(function (l) { return l.replace(/\s+/g, ' ').trim(); })
        .filter(function (l) { return l.length > 2; });
    });

    host.parentNode.removeChild(host);
  }

  function countIn(haystack, needle) {
    var n = 0, at = -1;
    while ((at = haystack.indexOf(needle, at + 1)) > -1) n++;
    return n;
  }

  function searchAll(q) {
    var needle = q.trim().toLowerCase();
    if (needle.length < 2) return null;
    var groups = [];
    FILES.forEach(function (f) {
      var hits = [];
      var n = 0;
      (searchIndex[f.id] || []).forEach(function (line) {
        var c = countIn(line.toLowerCase(), needle);
        if (c) { n += c; hits.push(line); }
      });
      if (hits.length) groups.push({ file: f, hits: hits, n: n });
    });
    groups.sort(function (a, b) { return b.n - a.n; });
    return groups;
  }

  /* Highlight without innerHTML — the query is user input. */
  function snippet(line, needle) {
    var lower = line.toLowerCase();
    var at = lower.indexOf(needle);
    var start = Math.max(0, at - 30);
    var text = line.slice(start, start + 140);
    var frag = document.createDocumentFragment();
    if (start > 0) frag.appendChild(document.createTextNode('…'));
    var low = text.toLowerCase();
    var pos = 0, idx;
    while ((idx = low.indexOf(needle, pos)) > -1) {
      frag.appendChild(document.createTextNode(text.slice(pos, idx)));
      var mk = document.createElement('mark');
      mk.textContent = text.slice(idx, idx + needle.length);
      frag.appendChild(mk);
      pos = idx + needle.length;
    }
    frag.appendChild(document.createTextNode(text.slice(pos)));
    if (start + 140 < line.length) frag.appendChild(document.createTextNode('…'));
    return frag;
  }

  function renderSearch() {
    var q = el.searchInput.value;
    var groups = searchAll(q);
    el.searchResults.innerHTML = '';

    if (groups === null) {
      el.searchSummary.textContent = q.trim()
        ? 'Type at least 2 characters.'
        : 'Search every file — try “postgres”, “latency” or “agile”.';
      return;
    }
    if (!groups.length) {
      el.searchSummary.textContent = 'No matches for “' + q.trim() + '”.';
      return;
    }

    var total = groups.reduce(function (n, g) { return n + g.n; }, 0);
    el.searchSummary.textContent =
      total + (total === 1 ? ' match in ' : ' matches in ') +
      groups.length + (groups.length === 1 ? ' file' : ' files');

    var needle = q.trim().toLowerCase();
    groups.forEach(function (g) {
      var head = document.createElement('div');
      head.className = 'search__file';
      var ic = document.createElement('span');
      ic.className = 'tree__icon';
      ic.style.color = 'var(--' + g.file.color + ')';
      ic.textContent = g.file.icon;
      var nm = document.createElement('span');
      nm.textContent = g.file.id;
      var ct = document.createElement('em');
      ct.textContent = g.n;
      head.appendChild(ic); head.appendChild(nm); head.appendChild(ct);
      el.searchResults.appendChild(head);

      g.hits.slice(0, 4).forEach(function (line) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'search__hit';
        b.dataset.file = g.file.id;
        b.appendChild(snippet(line, needle));
        el.searchResults.appendChild(b);
      });

      if (g.hits.length > 4) {
        var more = document.createElement('div');
        more.className = 'search__more';
        more.textContent = '+' + (g.hits.length - 4) + ' more in this file';
        el.searchResults.appendChild(more);
      }
    });
  }

  function openSearch(prefill) {
    state.sideView = 'search';
    state.sideOpen = true;
    state.zen = false;
    if (typeof prefill === 'string') el.searchInput.value = prefill;
    renderChrome();
    renderSearch();
    el.searchInput.focus();
    el.searchInput.select();
  }

  /* --- terminal ------------------------------------------------------ */
  function termPrint(lines) {
    var frag = document.createDocumentFragment();
    lines.forEach(function (l) {
      var d = document.createElement('div');
      d.className = 'term__line';
      d.style.color = 'var(--' + (l.tone || 'fg2') + ')';
      d.textContent = l.text;
      frag.appendChild(d);
    });
    el.termLog.insertBefore(frag, el.termLog.lastElementChild);
    el.termLog.scrollTop = el.termLog.scrollHeight;
  }

  function runCommand(raw) {
    var cmd = (raw || '').trim();
    if (!cmd) return;

    state.history.push(cmd);
    state.historyIdx = state.history.length;

    var out = [{ text: 'sumedh@portfolio ~ $ ' + cmd, tone: 'fg' }];
    var parts = cmd.toLowerCase().split(/\s+/);
    var c = parts[0];
    var arg = parts.slice(1).join(' ');

    if (c === 'clear') { el.termLog.innerHTML = ''; el.termLog.appendChild(el.termRow); return; }

    if (c === 'help') {
      out.push(
        { text: 'help          this list' },
        { text: 'whoami        the short version' },
        { text: 'ls            list files' },
        { text: 'open <file>   open a file in the editor' },
        { text: 'grep <term>   search across every file' },
        { text: 'skyline       3D city of every GitHub repo' },
        { text: 'projects      the three shipped builds' },
        { text: 'skills        stack summary' },
        { text: 'stats         numbers worth knowing' },
        { text: 'gh            github + leetcode links' },
        { text: 'resume        download the PDF' },
        { text: 'theme <obsidian|paper|contrast>' },
        { text: 'ask <question>  route to the portfolio assistant' },
        { text: 'hire          how to reach him' },
        { text: 'clear         wipe the terminal' }
      );
    } else if (c === 'whoami') {
      out.push(
        { text: 'Sumedh Kolte — Full Stack Developer (MERN) & AI application builder', tone: 'a1' },
        { text: 'Founder & Team Lead, HarmoCare (SAKEC Incubation Centre)' },
        { text: 'Mumbai, India · open to relocation & remote · available now' }
      );
    } else if (c === 'ls') {
      out.push({ text: FILES.map(function (f) { return f.id; }).join('   ') });
    } else if (c === 'open' || c === 'cat') {
      var hit = null;
      if (arg) {
        hit = FILES.filter(function (f) { return f.id.toLowerCase().indexOf(arg) === 0; })[0] ||
              FILES.filter(function (f) { return f.id.toLowerCase().indexOf(arg) > -1; })[0];
      }
      if (hit) { openFile(hit.id); out.push({ text: 'opened ' + hit.id, tone: 'a1' }); }
      else out.push({ text: 'no such file: ' + (arg || '(none)') + ' — try `ls`', tone: 'a2' });
    } else if (c === 'skyline' || c === '3d') {
      openFile('skyline.3d');
      out.push({ text: 'rendering repository skyline — drag to orbit', tone: 'a1' });
    } else if (c === 'grep' || c === 'search' || c === 'find') {
      if (!arg) out.push({ text: 'usage: grep <term>   — searches every file', tone: 'a2' });
      else {
        var groups = searchAll(arg);
        if (!groups) out.push({ text: 'grep: need at least 2 characters', tone: 'a2' });
        else if (!groups.length) out.push({ text: 'grep: no match for ' + arg, tone: 'a2' });
        else {
          var sum = groups.reduce(function (n, g) { return n + g.n; }, 0);
          groups.forEach(function (g) {
            out.push({ text: g.file.id.padEnd(22) + g.n + (g.n === 1 ? ' match' : ' matches'), tone: 'a1' });
          });
          out.push({ text: sum + ' total across ' + groups.length + ' files — opening the search panel' });
          openSearch(arg);
        }
      }
    } else if (c === 'projects') {
      out.push(
        { text: 'Aegis           AI escrow arbitrator · live voice · integer-cents ledger', tone: 'a1' },
        { text: 'FlowForge       AI agent workflow engine · resumable approval gates', tone: 'a1' },
        { text: 'TrueCandidate   real-time fraud detection · Groq verdicts < 450ms', tone: 'a1' },
        { text: 'Synapse CRM     AI-first CRM · LangGraph · read-only form', tone: 'a1' },
        { text: 'Catalog Engine  keyset pagination · stable over 200k+ rows', tone: 'a1' },
        { text: 'Zapfix          AI home repair marketplace · shipped iOS + Android', tone: 'a1' },
        { text: 'Daysly          offline-first compliance engine · 192 tests', tone: 'a1' },
        { text: '1Fi EMI Store   integer-paise fintech storefront', tone: 'a1' },
        { text: 'Onyx            real-time chat · 27-check smoke suite', tone: 'a1' },
        { text: 'run `open aegis` to read one, or `skyline` to see them all in 3D' }
      );
    } else if (c === 'skills') {
      out.push(
        { text: 'lang     JavaScript, TypeScript, Python, SQL, C' },
        { text: 'front    React, React Native, Zustand, React Query' },
        { text: 'back     Node, Express, FastAPI, microservices, WebSockets' },
        { text: 'data     PostgreSQL, PostGIS, Supabase, MongoDB' },
        { text: 'ai       RAG, vector search, Gemini 2.5 Flash, Groq Llama 3/4' },
        { text: 'ops      Docker, CI/CD, AWS EC2/S3' }
      );
    } else if (c === 'stats') {
      out.push(
        { text: '8 engineers led · 5 services · 10+ REST APIs · 100% milestones on time', tone: 'a1' },
        { text: '450ms LLM verdict · 192 tests · 135+ DSA problems · CGPA 7.92', tone: 'a1' }
      );
    } else if (c === 'gh') {
      out.push(
        { text: 'github.com/sumedhkolte', tone: 'a1' },
        { text: 'leetcode.com/u/igdarksy', tone: 'a1' },
        { text: 'linkedin.com/in/sumedh-kolte', tone: 'a1' }
      );
    } else if (c === 'resume') {
      openResume();
      out.push({ text: 'opening ' + CONTACT.resume, tone: 'a1' });
    } else if (c === 'theme') {
      if (THEMES.indexOf(arg) > -1) { setTheme(arg); out.push({ text: 'theme → ' + arg, tone: 'a1' }); }
      else out.push({ text: 'themes: obsidian, paper, contrast', tone: 'a2' });
    } else if (c === 'ask') {
      var q = cmd.slice(c.length).trim();
      if (!q) out.push({ text: 'usage: ask <question>', tone: 'a2' });
      else {
        state.chatOpen = true;
        state.zen = false;
        renderChrome();
        ask(q);
        out.push({ text: 'routed to assistant →', tone: 'a3' });
      }
    } else if (c === 'hire' || c === 'contact') {
      openFile('contact.tsx');
      out.push(
        { text: CONTACT.email + '  (phone ' + CONTACT.phoneNote + ')', tone: 'a1' },
        { text: 'graduated June 2026 · available immediately — contact.tsx opened' }
      );
    } else if (c === 'sudo') {
      out.push({ text: 'nice try. `hire` works without root.', tone: 'a2' });
    } else {
      out.push({ text: 'command not found: ' + c + ' — try `help`', tone: 'a2' });
    }

    termPrint(out);
  }

  /* --- assistant ----------------------------------------------------- */
  function chatPush(role, text) {
    var d = document.createElement('div');
    d.className = 'chat__msg' + (role === 'u' ? ' chat__msg--u' : '');
    d.textContent = text;
    el.chatLog.appendChild(d);
    el.chatLog.scrollTop = el.chatLog.scrollHeight;
    return d;
  }

  /* Longest matching token wins, so "tell me about zapfix" lands on Zapfix
     rather than on whichever entry happens to list a common word. Short
     tokens must match whole ("ai", not "airplane"); longer ones may match a
     prefix so "skill" still catches "skills". */
  function matches(text, key) {
    var at = text.indexOf(' ' + key);
    if (at === -1) return false;
    if (key.length >= 4) return true;
    return /[^a-z0-9]/.test(text.charAt(at + key.length + 1));
  }

  function bestAnswer(q) {
    var t = ' ' + q.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ') + ' ';
    var best = null;
    var top = 0;
    KB.forEach(function (entry) {
      var score = 0;
      entry.k.forEach(function (key) { if (matches(t, key)) score += key.length; });
      if (score > top) { top = score; best = entry; }
    });
    return best
      ? best.a
      : 'That is not in his résumé. Ask about Aegis, FlowForge, TrueCandidate, Synapse CRM, the Catalog Engine, Zapfix, Daysly, HarmoCare, his stack, or availability — or email ' + CONTACT.email + '.';
  }

  function ask(q) {
    q = (q || '').trim();
    if (!q || state.chatBusy) return;
    state.chatBusy = true;
    chatPush('u', q);
    var pending = chatPush('a', '…');
    el.chatInput.value = '';

    // Short beat so the answer reads as a reply, not a lookup table.
    setTimeout(function () {
      pending.textContent = bestAnswer(q);
      el.chatLog.scrollTop = el.chatLog.scrollHeight;
      state.chatBusy = false;
    }, 320);
  }

  /* --- command palette ----------------------------------------------- */
  function paletteActions() {
    return [
      { label: 'Toggle terminal', kind: '⌃`', icon: '>', color: 'a1', run: function () { toggleTerminal(); } },
      { label: 'Search across all files', kind: '⇧⌘F', icon: '⌕', color: 'a1', run: function () { openSearch(); } },
      { label: 'Ask the portfolio assistant', kind: 'chat', icon: '?', color: 'a3', run: function () { openChat(); } },
      { label: 'Download résumé (PDF)', kind: 'file', icon: '↓', color: 'a2', run: openResume },
      { label: 'Email Sumedh', kind: 'link', icon: '@', color: 'a2', run: function () { window.location.href = 'mailto:' + CONTACT.email; } },
      { label: 'Copy email address', kind: 'action', icon: '⎘', color: 'a2', run: copyEmail },
      { label: 'Toggle zen mode', kind: '⌥Z', icon: '⤢', color: 'fg2', run: toggleZen },
      { label: 'Theme: obsidian', kind: 'theme', icon: '◐', color: 'fg2', run: function () { setTheme('obsidian'); } },
      { label: 'Theme: paper', kind: 'theme', icon: '◑', color: 'fg2', run: function () { setTheme('paper'); } },
      { label: 'Theme: high contrast', kind: 'theme', icon: '◉', color: 'fg2', run: function () { setTheme('contrast'); } },
      { label: 'GitHub', kind: 'link', icon: '↗', color: 'fg2', run: function () { window.open(CONTACT.github, '_blank', 'noopener'); } },
      { label: 'LinkedIn', kind: 'link', icon: '↗', color: 'fg2', run: function () { window.open(CONTACT.linkedin, '_blank', 'noopener'); } },
      { label: 'LeetCode', kind: 'link', icon: '↗', color: 'fg2', run: function () { window.open(CONTACT.leetcode, '_blank', 'noopener'); } }
    ];
  }

  function renderPalette() {
    var q = el.paletteInput.value.trim().toLowerCase();
    var files = FILES.map(function (f) {
      return {
        label: f.id, kind: f.meta, icon: f.icon, color: f.color,
        run: (function (id) { return function () { openFile(id); }; })(f.id)
      };
    });
    var items = files.concat(paletteActions()).filter(function (i) {
      return !q || (i.label + ' ' + i.kind).toLowerCase().indexOf(q) > -1;
    });

    state.paletteItems = items;
    if (state.paletteSel >= items.length) state.paletteSel = Math.max(0, items.length - 1);

    el.paletteList.innerHTML = '';
    if (!items.length) {
      var empty = document.createElement('div');
      empty.className = 'palette__empty';
      empty.textContent = 'No match. Try a file name, "theme", or "resume".';
      el.paletteList.appendChild(empty);
      return;
    }

    items.forEach(function (item, n) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'palette__item' + (n === state.paletteSel ? ' is-sel' : '');
      b.dataset.idx = String(n);
      var ic = document.createElement('span');
      ic.className = 'palette__icon';
      ic.style.color = 'var(--' + item.color + ')';
      ic.textContent = item.icon;
      var lab = document.createElement('span');
      lab.textContent = item.label;
      var kind = document.createElement('span');
      kind.className = 'palette__kind';
      kind.textContent = item.kind;
      b.appendChild(ic); b.appendChild(lab); b.appendChild(kind);
      el.paletteList.appendChild(b);
    });

    var sel = el.paletteList.querySelector('.is-sel');
    if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest' });
  }

  function openPalette() {
    state.paletteOpen = true;
    state.paletteSel = 0;
    el.paletteInput.value = '';
    renderChrome();
    renderPalette();
    el.paletteInput.focus();
  }

  function closePalette() {
    if (!state.paletteOpen) return;
    state.paletteOpen = false;
    el.palette.hidden = true;
  }

  function runPaletteSel() {
    var item = state.paletteItems[state.paletteSel];
    if (!item) return;
    closePalette();
    renderChrome();
    item.run();
  }

  /* --- misc actions --------------------------------------------------- */
  function openResume() { el.resumeLink.click(); }

  function toggleTerminal() {
    state.termOpen = !state.termOpen;
    if (state.termOpen) state.zen = false;
    renderChrome();
    if (state.termOpen) el.termInput.focus();
  }

  function openChat() {
    state.chatOpen = true;
    state.zen = false;
    renderChrome();
    el.chatInput.focus();
  }

  function toggleZen() {
    state.zen = !state.zen;
    renderChrome();
  }

  function copyEmail() {
    var flash = function () {
      state.copied = true;
      renderChrome();
      setTimeout(function () { state.copied = false; renderChrome(); }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(CONTACT.email).then(flash, function () { legacyCopy(); flash(); });
    } else {
      legacyCopy();
      flash();
    }
  }

  function legacyCopy() {
    try {
      var ta = document.createElement('textarea');
      ta.value = CONTACT.email;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-1000px;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e) { /* clipboard unavailable — the address is on screen anyway */ }
  }

  /* --- events --------------------------------------------------------- */
  function wire() {
    /* delegated clicks across the whole shell */
    document.addEventListener('click', function (e) {
      var closeBtn = e.target.closest('[data-close]');
      if (closeBtn) { e.stopPropagation(); closeTab(closeBtn.dataset.close); return; }

      var fileBtn = e.target.closest('[data-file]');
      if (fileBtn) { openFile(fileBtn.dataset.file); return; }

      // scoped to the switch: <html> also carries data-theme
      var themeBtn = e.target.closest('#theme-switch button');
      if (themeBtn) { setTheme(themeBtn.dataset.theme); return; }

      var pItem = e.target.closest('.palette__item');
      if (pItem) { state.paletteSel = Number(pItem.dataset.idx); runPaletteSel(); return; }

      var act = e.target.closest('[data-act]');
      if (!act) return;
      switch (act.dataset.act) {
        case 'explorer':
          state.sideOpen = !(state.sideOpen && state.sideView === 'files');
          state.sideView = 'files';
          if (state.sideOpen) state.zen = false;
          renderChrome();
          break;
        case 'search':
          if (state.sideOpen && state.sideView === 'search') { state.sideOpen = false; renderChrome(); }
          else openSearch();
          break;
        case 'palette': openPalette(); break;
        case 'terminal': toggleTerminal(); break;
        case 'open-terminal': state.termOpen = true; state.zen = false; renderChrome(); el.termInput.focus(); break;
        case 'close-terminal': state.termOpen = false; renderChrome(); break;
        case 'chat': state.chatOpen = !state.chatOpen; if (state.chatOpen) state.zen = false; renderChrome(); if (state.chatOpen) el.chatInput.focus(); break;
        case 'open-chat': openChat(); break;
        case 'close-chat': state.chatOpen = false; renderChrome(); break;
        case 'zen': toggleZen(); break;
        case 'diff': openFile('impact.diff'); break;
        case 'resume': openResume(); break;
        case 'copy-email': copyEmail(); break;
        case 'chat-chip': ask(act.dataset.q); break;
        case 'close-palette': closePalette(); renderChrome(); break;
      }
    });

    /* tabs are focusable — Enter/Space activates, like a real tab strip */
    el.tabs.addEventListener('keydown', function (e) {
      var tab = e.target.closest('.tab');
      if (!tab) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFile(tab.dataset.file); }
    });

    /* search */
    el.searchInput.addEventListener('input', renderSearch);
    el.searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var first = el.searchResults.querySelector('.search__hit');
        if (first) openFile(first.dataset.file);
      } else if (e.key === 'Escape') {
        el.searchInput.value = '';
        renderSearch();
      }
    });

    /* terminal */
    el.termInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        runCommand(el.termInput.value);
        el.termInput.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (state.historyIdx > 0) { state.historyIdx--; el.termInput.value = state.history[state.historyIdx]; }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (state.historyIdx < state.history.length - 1) {
          state.historyIdx++;
          el.termInput.value = state.history[state.historyIdx];
        } else { state.historyIdx = state.history.length; el.termInput.value = ''; }
      }
    });
    el.termLog.addEventListener('click', function (e) {
      if (window.getSelection().toString()) return;   // don't steal a copy gesture
      if (!e.target.closest('a')) el.termInput.focus();
    });

    /* assistant */
    el.chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); ask(el.chatInput.value); }
    });
    $('#chat-send').addEventListener('click', function () { ask(el.chatInput.value); });

    /* palette */
    el.paletteInput.addEventListener('input', function () { state.paletteSel = 0; renderPalette(); });
    el.paletteInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        state.paletteSel = Math.min(state.paletteSel + 1, state.paletteItems.length - 1);
        renderPalette();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        state.paletteSel = Math.max(state.paletteSel - 1, 0);
        renderPalette();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        runPaletteSel();
      }
    });
    el.palette.addEventListener('mousedown', function (e) {
      if (e.target === el.palette) { closePalette(); renderChrome(); }
    });

    /* contact form → mail client */
    el.pane.addEventListener('submit', function (e) {
      var form = e.target.closest('[data-contact-form]');
      if (!form) return;
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var org = form.elements.org.value.trim();
      var msg = form.elements.msg.value.trim();
      var subject = 'Portfolio enquiry — ' + (org || name || 'hello');
      var body = msg + '\n\n— ' + name + (org ? ', ' + org : '');
      window.location.href = 'mailto:' + CONTACT.email +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    });

    /* global shortcuts */
    window.addEventListener('keydown', function (e) {
      var k = e.key ? e.key.toLowerCase() : '';
      var typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && k === 'f') {
        e.preventDefault();
        openSearch();
      } else if ((e.metaKey || e.ctrlKey) && k === 'k') {
        e.preventDefault();
        if (state.paletteOpen) { closePalette(); renderChrome(); } else openPalette();
      } else if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        toggleTerminal();
      } else if (e.altKey && k === 'z') {
        e.preventDefault();
        toggleZen();
      } else if (e.altKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        if (state.tabs.length > 1) {
          var i = state.tabs.indexOf(state.active);
          var step = e.key === 'ArrowRight' ? 1 : -1;
          openFile(state.tabs[(i + step + state.tabs.length) % state.tabs.length]);
        }
      } else if (e.key === 'Escape') {
        if (state.paletteOpen) { closePalette(); renderChrome(); }
        else if (NARROW.matches && state.sideOpen) { state.sideOpen = false; renderChrome(); }
        else if (typing) document.activeElement.blur();
      }
    });

    /* keep the explorer sane across the mobile breakpoint */
    var onBreak = function (e) { state.sideOpen = !e.matches; renderChrome(); };
    if (NARROW.addEventListener) NARROW.addEventListener('change', onBreak);
    else if (NARROW.addListener) NARROW.addListener(onBreak);

    /* deep links: #contact.tsx opens that file */
    window.addEventListener('hashchange', function () {
      var id = decodeURIComponent(location.hash.slice(1));
      if (id && fileById(id) && id !== state.active) openFile(id, { silent: true });
    });
  }

  /* --- start ---------------------------------------------------------- */
  function init() {
    cacheEls();
    el.termRow = $('#term-row');
    setTheme(loadTheme());

    var hashed = decodeURIComponent(location.hash.slice(1));
    if (hashed && fileById(hashed)) { state.tabs = ['about.md']; state.active = hashed; if (hashed !== 'about.md') state.tabs.push(hashed); }

    renderHeatPlaceholder();
    buildSearchIndex();
    render();
    wire();
    runBoot();
    loadContributions();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
