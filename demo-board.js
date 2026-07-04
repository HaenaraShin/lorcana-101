/* =============================================================
   Lorcana 101 — Board Demo v7
   ============================================================= */

const CARDS = window.LORCANA_CARDS || {};

/* ----- Global image fallback -----
   Some lorcana card images 404 or fail to load. Catch them in the capture
   phase (image error events don't bubble) and swap to the local card-back. */
document.addEventListener('error', (e) => {
  const img = e.target;
  if (img && img.tagName === 'IMG' && !img.dataset.fallbackApplied) {
    img.dataset.fallbackApplied = '1';
    img.src = 'card_back.jpeg';
  }
}, true);

/* ----- Image preload -----
   WebOS TV 등 저사양 장비에서 페이지 전환 중 네트워크 fetch + 디코딩으로
   버벅이는 현상이 있어, 페이지 로드 직후 모든 카드 이미지를 백그라운드로
   미리 받아 브라우저 캐시·디코더에 올려둔다. 약 40장(~6MB)이라 초기
   로드 영향은 작고, 이후 전환은 캐시 hit. */
const PRELOADED_IMAGES = [];
function preloadAllCardImages() {
  const urls = new Set();
  urls.add('card_back.jpeg');
  Object.values(CARDS).forEach(c => { if (c && c.image) urls.add(c.image); });
  urls.forEach(url => {
    const im = new Image();
    im.decoding = 'async';
    im.src = url;
    PRELOADED_IMAGES.push(im);
  });
}
preloadAllCardImages();

/* T0 — pre-mulligan opening hand. PlayerA went first.
   self.deck order matches the scripted draws documented in the scenario:
     T2 begin draw   → vanellope (used as T2 ink)
     T3 begin draw   → john smith (Mulan effect later discards it)
     T3 Mulan effect → robin_champion (used for T5 shift)
     T4 begin draw   → gadget (used as T4 ink)
     T5 begin draw   → moana_curious (used as T5 ink, duplicate of starting hand) */
/* 초기 7장 핸드. 게임 시작(p-game-start-action) 페이지에서 stagger 드로우로 채움.
   STATE 시작 시점에는 비어 있어야 그 페이지 진입 전까지 핸드가 보이지 않음. */
const INITIAL_HAND_KEYS = [
  'song_newworld',
  'song_newworld',
  'song_letitgo',
  'character_merida_archer',
  'character_cinderella_dream',
  'song_spooky',
  'character_pete_ghost',
];

const STATE = {
  self: {
    lore: 0,
    hand: [],
    inkwell: [],
    play: [],
    discard: [],
    /* self.deck holds only cards that Player A draws.
       T2 / T4 begin draws belong to Player B and use drawCardOpp (filler).
       Vanellope / Gadget are Player B's ink cards — passed directly by key
       to playInkAdd('opp', ...), so they never enter this deck. */
    deck: [
      'character_johnsmith_protector', // T3 begin draw
      'sim_mulan',                     // T3 Develop Your Brain look — 핸드로 선택
      'character_scar_king',           // T3 Develop Your Brain look — 덱 바닥으로
      'sim_robin_champion',            // T3 Mulan effect draw
      'character_moana_curious',       // T5 begin draw
      'character_jasmine_strategist',  // T7 begin draw
    ],
  },
  opp: {
    lore: 0,
    hand: [],
    inkwell: [],
    play: [],
    discard: [],
  },
};

/* ----- Dialog bubble plan -----
   cardKey-based identification: dialogs follow the card by key (survives
   play-slot reordering, auto-skipped after banish). Populated dynamically
   as the scenario progresses; starts empty in T0. */
const DIALOGS = [];

function makeCard(card, opts = {}) {
  const el = document.createElement('div');
  el.className = 'card' + (opts.exerted ? ' exerted' : '');
  /* Shift base — render the underlying card slightly offset behind the top card. */
  if (opts.shiftedFrom && CARDS[opts.shiftedFrom]) {
    el.classList.add('shifted');
    const base = CARDS[opts.shiftedFrom];
    const baseImg = document.createElement('img');
    baseImg.className = 'shift-base-img';
    baseImg.decoding = 'async';
    baseImg.src = base.image;
    baseImg.alt = base.fullName;
    el.appendChild(baseImg);
  }
  const img = document.createElement('img');
  img.decoding = 'async';
  img.src = card.image;
  img.alt = card.fullName;
  el.appendChild(img);
  if (opts.damage && opts.damage > 0) {
    const dmg = document.createElement('div');
    dmg.className = 'dmg-counter';
    dmg.textContent = opts.damage;
    el.appendChild(dmg);
  }
  return el;
}

function makeInkCard(exerted) {
  const el = document.createElement('div');
  el.className = 'ink-card' + (exerted ? ' exerted' : '');
  return el;
}

function renderPlay(sideKey, containerId) {
  const root = document.getElementById(containerId);
  root.innerHTML = '';
  STATE[sideKey].play.forEach((slot, idx) => {
    const card = CARDS[slot.card];
    if (!card) return;
    const el = makeCard(card, { exerted: slot.exerted, damage: slot.damage, shiftedFrom: slot.shiftedFrom });
    el.dataset.side = sideKey;
    el.dataset.idx = idx;
    root.appendChild(el);
  });
}

function renderInkwell(sideKey, containerId) {
  const root = document.getElementById(containerId);
  root.innerHTML = '';
  STATE[sideKey].inkwell.forEach(ink => {
    root.appendChild(makeInkCard(ink.exerted));
  });
}

function renderDiscard(sideKey, containerId) {
  const root = document.getElementById(containerId);
  root.innerHTML = '';
  const pile = STATE[sideKey].discard;
  if (pile.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-discard';
    root.appendChild(empty);
    return;
  }
  const stack = document.createElement('div');
  stack.className = 'card-stack';
  pile.forEach(key => {
    const card = CARDS[key];
    if (card) stack.appendChild(makeCard(card, {}));
  });
  root.appendChild(stack);
}

function renderSelfHand() {
  const root = document.getElementById('self-hand');
  root.innerHTML = '';
  const hand = STATE.self.hand;
  const n = hand.length;
  hand.forEach((key, idx) => {
    const el = document.createElement('div');
    el.className = 'hand-card';
    const centeredIdx = idx - (n - 1) / 2;
    el.style.setProperty('--i', centeredIdx);
    el.style.setProperty('--i-abs', Math.abs(centeredIdx));
    el.dataset.i = centeredIdx;

    if (key === '_filler') {
      el.classList.add('back');
    } else {
      const card = CARDS[key];
      if (card) {
        const img = document.createElement('img');
        img.decoding = 'async';
        img.src = card.image;
        img.alt = card.fullName;
        el.appendChild(img);
      } else {
        el.classList.add('back');
      }
    }
    root.appendChild(el);
  });
}

function renderSide(sideKey) {
  if (sideKey === 'opp') {
    renderInkwell('opp', 'opp-inkwell');
    renderPlay('opp', 'opp-play');
    renderDiscard('opp', 'opp-discard');
    document.getElementById('opp-lore-num').textContent = STATE.opp.lore;
  } else {
    renderInkwell('self', 'self-inkwell');
    renderPlay('self', 'self-play');
    renderDiscard('self', 'self-discard');
    document.getElementById('self-lore-num').textContent = STATE.self.lore;
  }
}

/* ----- Dialog bubble rendering ----- */
function renderDialogs(visible) {
  // Remove existing bubbles
  document.querySelectorAll('.dialog-bubble').forEach(b => b.remove());
  if (!visible) return;

  DIALOGS.forEach(d => {
    /* Anchor 결정: zoneSelector 우선(영역 기반), 없으면 cardKey(play 카드) 기반. */
    let rect;
    if (d.zoneSelector) {
      const el = document.querySelector(d.zoneSelector);
      if (!el) return;
      rect = el.getBoundingClientRect();
    } else {
      const idx = STATE[d.side].play.findIndex(p => p.card === d.cardKey);
      if (idx < 0) return;
      const playRoot = document.getElementById(d.side === 'opp' ? 'opp-play' : 'self-play');
      const targetCard = playRoot.querySelectorAll('.card')[idx];
      if (!targetCard) return;
      rect = targetCard.getBoundingClientRect();
    }
    const bubble = document.createElement('div');
    bubble.className = 'dialog-bubble ' + d.tail;
    bubble.innerHTML = d.text;
    bubble.style.position = 'fixed';
    bubble.dataset.side    = d.side;
    if (d.cardKey) bubble.dataset.cardKey = d.cardKey;
    const off = d.offset || { x: 0, y: 0 };
    if (d.placement === 'below') {
      bubble.style.left = (rect.left + off.x) + 'px';
      bubble.style.top  = (rect.bottom + 12) + 'px';
    } else if (d.placement === 'left-of') {
      /* 말풍선 본체가 anchor 왼쪽, 꼬리(tail-right)는 anchor 가리킴. */
      const bubbleW = d.bubbleWidth || 210;
      bubble.style.left = (rect.left - bubbleW - 22 + off.x) + 'px';
      bubble.style.top  = (rect.top + rect.height / 2 - 22 + off.y) + 'px';
      bubble.style.maxWidth = bubbleW + 'px';
    } else {
      bubble.style.left = (rect.left + off.x) + 'px';
      bubble.style.top  = (rect.top + off.y) + 'px';
    }
    document.body.appendChild(bubble);
  });
}

/* ----- Subtitle / Dialog toggles -----
   Two independent checkboxes in the page-controls panel. */
function applyToggles() {
  const showSub = document.getElementById('toggle-subtitle')?.checked ?? true;
  const showDlg = document.getElementById('toggle-dialog')?.checked ?? true;
  document.getElementById('subtitle-box')?.classList.toggle('hidden', !showSub);
  renderDialogs(showDlg);
}
document.getElementById('toggle-subtitle')?.addEventListener('change', applyToggles);
document.getElementById('toggle-dialog')?.addEventListener('change', applyToggles);

/* ----- User font-size adjust (for PPT/projector legibility) -----
   Changes <body> font-size. All em-sized text (subtitle, dialog bubbles,
   callouts, intro paragraphs) scales together. The page-controls panel sets
   its own font-size in CSS so it stays the same size. */
const FS_MIN = 12, FS_MAX = 28, FS_STEP = 2;
let userFs = 16;
function applyFs() {
  document.body.style.fontSize = userFs + 'px';
  const disp = document.getElementById('fs-display');
  if (disp) disp.textContent = userFs;
  /* Re-position any open dialog bubbles since their anchor cards may shift. */
  if (document.getElementById('toggle-dialog')?.checked) renderDialogs(true);
}
function adjustFs(delta) {
  userFs = Math.max(FS_MIN, Math.min(FS_MAX, userFs + delta));
  applyFs();
}
document.getElementById('fs-dec')?.addEventListener('click', () => adjustFs(-FS_STEP));
document.getElementById('fs-inc')?.addEventListener('click', () => adjustFs( FS_STEP));
applyFs();

/* ============================================================
   BEGIN PHASE — READY → SET → DRAW animation sequence
   ============================================================ */
/* FAST_MODE: 챕터 점프 중에는 sleep을 즉시 resolve 해서 sim 함수들을 빠르게
   replay 한다. CSS transition도 body.fast-mode 클래스로 무력화. */
let FAST_MODE = false;
const sleep = ms => FAST_MODE ? Promise.resolve() : new Promise(r => setTimeout(r, ms));

/* PlayerA went first (T1, T3, T5, ...). Odd turns = self's turn, even = opp. */
let currentTurn = 0; /* T0 / pre-mulligan at startup; first turn is T1 */

function showBadge(text) {
  const el = document.getElementById('phase-badge');
  el.textContent = text;
  el.classList.add('show');
}
function hideBadge() {
  document.getElementById('phase-badge').classList.remove('show');
}
function setSubtitle(step, html) {
  const stepEl = document.querySelector('.subtitle-step');
  const textEl = document.querySelector('.subtitle-text');
  if (stepEl) stepEl.textContent = step;
  if (textEl) textEl.innerHTML = html;
}

/* Staggered ink exert — kick each card off ~140ms apart so they all
   rotate concurrently but visibly cascade left → right. Resolves once
   the last card's rotate transition has finished.
   FAST_MODE (챕터 점프 중) 에서는 setTimeout 콜백이 발화될 시간이 없어 STATE 변경이
   누락된다 — 동기적으로 즉시 처리. */
async function exertReadyInk(sideKey, count) {
  const inkRoot = document.getElementById(sideKey === 'opp' ? 'opp-inkwell' : 'self-inkwell');
  if (!inkRoot) return;

  const targets = [];
  for (let i = 0; i < STATE[sideKey].inkwell.length && targets.length < count; i++) {
    if (!STATE[sideKey].inkwell[i].exerted) targets.push(i);
  }
  if (targets.length === 0) return;

  if (FAST_MODE) {
    targets.forEach(idx => {
      STATE[sideKey].inkwell[idx].exerted = true;
      const el = inkRoot.children[idx];
      if (el) el.classList.add('exerted');
    });
    return;
  }

  const STAGGER = 140;
  const INK_TRANSITION_MS = 550; /* must match .ink-card transition duration */

  targets.forEach((idx, j) => {
    setTimeout(() => {
      STATE[sideKey].inkwell[idx].exerted = true;
      const el = inkRoot.children[idx];
      if (el) el.classList.add('exerted');
    }, j * STAGGER);
  });

  await sleep((targets.length - 1) * STAGGER + INK_TRANSITION_MS);
}

async function readyAll(sideKey) {
  const playId = sideKey === 'opp' ? 'opp-play'    : 'self-play';
  const inkId  = sideKey === 'opp' ? 'opp-inkwell' : 'self-inkwell';
  document.querySelectorAll(`#${playId} .card.exerted`).forEach(el => el.classList.remove('exerted'));
  document.querySelectorAll(`#${inkId} .ink-card.exerted`).forEach(el => el.classList.remove('exerted'));
  STATE[sideKey].play.forEach(p => p.exerted = false);
  STATE[sideKey].inkwell.forEach(i => i.exerted = false);
  /* Beginning of your turn: ink dries on all your characters.
     Drop any "ink not dry yet" speech bubbles on your side. */
  for (let i = DIALOGS.length - 1; i >= 0; i--) {
    if (DIALOGS[i].side === sideKey && DIALOGS[i].tag === 'ink-not-dry') {
      DIALOGS.splice(i, 1);
    }
  }
  applyToggles();
  await sleep(700);
}

async function drawCardSelf() {
  const deckEl = document.querySelector('.self-lr .deck-zone');
  const handEl = document.getElementById('self-hand');
  if (!deckEl || !handEl) return;

  /* 1) Push the new card into state and re-render the fan FIRST.
        Draw the top of self.deck (scenario-scripted); fall back to face-down
        filler if the deck is empty. */
  const drawnKey = STATE.self.deck.shift() || '_filler';
  STATE.self.hand.push(drawnKey);
  renderSelfHand();
  const incomingCard = handEl.lastElementChild;
  incomingCard.classList.add('incoming');

  /* 2) Yield one frame so layout is committed and we can read final positions. */
  await new Promise(r => requestAnimationFrame(r));

  /* 3) Compute deck's location in the hand-fan's coordinate frame.
        The fan has its own transform (translateX(-50%)), so absolute children
        inside it use that transformed reference as their origin. We can subtract
        the fan's bounding rect from the deck's bounding rect to convert. */
  const dRect = deckEl.getBoundingClientRect();
  const fRect = handEl.getBoundingClientRect();
  const startLeft = dRect.left - fRect.left;
  const startTop  = dRect.top  - fRect.top;
  const startW    = dRect.width;
  const startH    = dRect.height;

  /* 4) Final state == exact slot of the incoming card:
        - left/top: offsetLeft/offsetTop (relative to the fan, the offsetParent)
        - width/height: offsetWidth/offsetHeight (pre-transform box)
        - transform: same computed transform (fan rotate + translateY)
        Because the flyer shares transform-origin: 50% 100% with hand-card,
        the rotation produces an identical visual. */
  const endLeft = incomingCard.offsetLeft;
  const endTop  = incomingCard.offsetTop;
  const endW    = incomingCard.offsetWidth;
  const endH    = incomingCard.offsetHeight;
  const endTransform = getComputedStyle(incomingCard).transform;

  /* 5) Build flyer at the deck's slot. Face image == the drawn card's face,
        so when the flyer ends at rotateY(180deg) it shows the same face that
        the incoming hand-card displays — invisible swap. */
  const drawnCard = CARDS[drawnKey];
  const faceUrl = drawnCard?.image || '';

  const flyer = document.createElement('div');
  flyer.className = 'draw-flyer';
  flyer.style.left   = startLeft + 'px';
  flyer.style.top    = startTop  + 'px';
  flyer.style.width  = startW    + 'px';
  flyer.style.height = startH    + 'px';
  flyer.style.transform = 'rotate(0deg)';
  flyer.innerHTML = `
    <div class="flyer-inner">
      <div class="flyer-back"></div>
      <div class="flyer-front">
        <div class="flyer-face" style="background: url('${faceUrl}') center/cover no-repeat;"></div>
      </div>
    </div>`;
  handEl.appendChild(flyer);

  /* 6) Next frame: commit the end state. CSS transition (0.95s) animates left/top/width/
        height/transform together; the .peeking keyframe handles the rotateY peek-flip. */
  requestAnimationFrame(() => {
    flyer.style.left   = endLeft + 'px';
    flyer.style.top    = endTop  + 'px';
    flyer.style.width  = endW    + 'px';
    flyer.style.height = endH    + 'px';
    flyer.style.transform = endTransform;
    flyer.querySelector('.flyer-inner').classList.add('peeking');
  });

  /* 7) Wait for the transition to finish, then swap atomically:
        reveal the incoming card and remove the flyer on the SAME frame so
        nothing flashes — both occupy identical position/size/rotation. */
  await sleep(1000);
  incomingCard.classList.remove('incoming');
  flyer.remove();
}

/* Opponent draw — face-down card slides off the top of the screen.
   No flip (hand is hidden), no hand UI update beyond a STATE push. */
async function drawCardOpp() {
  const deckEl = document.querySelector('.opp-lr .deck-zone');
  if (!deckEl) return;

  STATE.opp.hand.push('_filler');

  const dRect = deckEl.getBoundingClientRect();
  const flyer = document.createElement('div');
  flyer.className = 'draw-flyer opp-draw';
  flyer.style.left   = dRect.left + 'px';
  flyer.style.top    = dRect.top  + 'px';
  flyer.style.width  = dRect.width  + 'px';
  flyer.style.height = dRect.height + 'px';
  flyer.innerHTML = `
    <div class="flyer-inner">
      <div class="flyer-back"></div>
    </div>`;
  document.body.appendChild(flyer);

  /* Force a reflow so the initial inline left/top is committed as the
     transition's "from" value. Without this the very first opp-draw can
     skip the transition entirely (start == end in the same batch). */
  void flyer.offsetHeight;

  requestAnimationFrame(() => {
    /* Mirror of self's hand position: horizontally centered, top just off-screen. */
    flyer.style.left = `${window.innerWidth / 2 - dRect.width / 2}px`;
    flyer.style.top  = `${-(dRect.height + 80)}px`;
  });

  await sleep(900);
  flyer.remove();
}

async function playBeginPhase() {
  // Advance turn counter. PlayerA went first, so odd turns belong to self.
  currentTurn++;
  const activeSide = (currentTurn % 2 === 1) ? 'self' : 'opp';
  const activeName = activeSide === 'self' ? 'Player A' : 'Player B';

  /* End-of-turn cleanup: any dialog tagged as "lives only one turn" is dropped
     at the start of the next begin phase, so it never reappears later. */
  const TURN_BOUND = ['bodyguard-exerted', 'ink-not-dry', 'champ-bonus'];
  for (let i = DIALOGS.length - 1; i >= 0; i--) {
    if (TURN_BOUND.includes(DIALOGS[i].tag)) DIALOGS.splice(i, 1);
  }
  applyToggles();

  // Turn transition — active player swap.
  document.querySelectorAll('.player-side').forEach(el => el.classList.remove('active'));
  const activeEl = document.querySelector(
    activeSide === 'opp' ? '.player-side.opponent' : '.player-side.self'
  );
  activeEl?.classList.add('active');
  await sleep(600); /* let the user register the active-player change */

  // T1 — first player skips begin phase entirely (Lorcana rule: no draw on T1).
  if (currentTurn === 1) {
    setSubtitle(
      t('subtitle.turnStartT1.step', { name: activeName }),
      t('subtitle.turnStartT1.body')
    );
    return;
  }

  setSubtitle(t('subtitle.beginPhase.step', { turn: currentTurn, name: activeName }), t('subtitle.beginPhase.body'));

  // READY
  showBadge('READY');
  await sleep(450);
  await readyAll(activeSide);

  /* Robin Beloved "잉크 마름" 안내는 T3 begin(첫 정상 ready)에서만 1회 표시.
     이후 T5 등 자기 턴 begin마다 다시 띄우면 중복 설명이라 안 함. */
  if (currentTurn === 3 && activeSide === 'self'
      && STATE.self.play.some(p => p.card === 'sim_robin_beloved')) {
    DIALOGS.push({
      side: 'self', cardKey: 'sim_robin_beloved', tag: 'ink-dried',
      text: t('dialog.inkDried'),
      tail: 'tail-up',
      offset: { x: -10, y: 240 },
      placement: 'below',
    });
    applyToggles();
  }

  hideBadge();
  await sleep(150);

  // SET (visual placeholder — no on-board changes in this scenario)
  showBadge('SET');
  await sleep(700);
  hideBadge();
  await sleep(150);

  // DRAW
  showBadge('DRAW');
  await sleep(350);
  if (activeSide === 'self') await drawCardSelf();
  else                       await drawCardOpp();
  await sleep(200);
  hideBadge();
}

/* ============================================================
   PHASE QUEUE — single button advances through a scripted sequence;
   after the queue is exhausted it falls back to T(n+1) begin phases.
   ============================================================ */
/* ============================================================
   PAGES — full presentation flow.
   - intro pages: show an overlay (title / world / card anatomy)
   - sim pages: hide overlay, run the scripted action
   ============================================================ */
const PAGES = [
  /* ----- INTRO ----- */
  { id: 'p1-title',         type: 'intro', kind: 'title',         label: '타이틀' },
  { id: 'p2-world',         type: 'intro', kind: 'world',         label: '세계관' },
  { id: 'p3-ink-colors',    type: 'intro', kind: 'ink-colors',    label: '잉크 컬러' },
  { id: 'p4-anatomy',       type: 'intro', kind: 'card-anatomy',  label: '카드 한 장 들여다보기', cardKey: 'character_mickey_true_friend' },
  /* 카드 종류 — 캐릭터(위 p4-anatomy)에 이어 액션·아이템·로케이션을 연이어 설명 */
  { id: 'p-action-brief-t3',type: 'intro', kind: 'action-brief',   label: '액션' },
  { id: 'p-item-brief',     type: 'intro', kind: 'item-brief',     label: '아이템' },
  { id: 'p-location-brief', type: 'intro', kind: 'location-brief', label: '로케이션' },
  { id: 'p5-board-intro',   type: 'sim',   label: '🗺 보드 소개',                                fn: () => playBoardIntro() },
  { id: 'p6-transition',    type: 'intro', kind: 'transition',    label: '전환' },
  { id: 'p7-game-start',    type: 'intro', kind: 'transition',    label: '게임 시작' },
  { id: 'sim-game-start',   type: 'sim',   label: '🎲 게임 시작 (주사위 + 7장 드로우)', fn: () => playGameStart() },
  { id: 'p8-mulligan-brief',type: 'intro', kind: 'transition',    label: '멀리건 안내' },
  /* ----- SIM ----- */
  { id: 'sim-mulligan',               type: 'sim', label: '🤝 멀리건',                          fn: () => playMulligan() },
  { id: 'sim-t1-begin',               type: 'sim', label: '▶ T1 비기닝 페이즈',
    fn: async () => {
      await playBeginPhase();
      /* 선공 T1: 비기닝 페이즈 자체를 스킵(드로우 없음) — 덱 옆에 룰 안내 말풍선.
         p12(p-ink-rules) 진입 시점(= sim-t1-aurora-ink 시작) 에 제거. */
      if (!DIALOGS.some(d => d.tag === 'first-turn-no-draw')) {
        DIALOGS.push({
          side: 'self', tag: 'first-turn-no-draw',
          zoneSelector: '.self-lr .deck-zone',
          text: t('dialog.firstTurnNoDraw'),
          tail: 'tail-right',
          placement: 'left-of',
        });
        applyToggles();
      }
    } },
  { id: 'p-ink-rules',                type: 'intro', kind: 'ink-rules', label: '잉크 추가 규칙' },
  { id: 'sim-t1-aurora-ink',          type: 'sim', label: '💧 T1 잉크 추가 (Aurora)',
    fn: async () => {
      for (let i = DIALOGS.length - 1; i >= 0; i--) {
        if (DIALOGS[i].tag === 'first-turn-no-draw') DIALOGS.splice(i, 1);
      }
      applyToggles();
      await playInkAdd('self', 'character_aurora_dream');
    } },
  { id: 'p-ready-exert-brief', type: 'intro', kind: 'ready-exert', label: 'Ready / Exert 설명' },
  { id: 'p-cost-exert-brief',  type: 'intro', kind: 'cost-exert',  label: '잉크 비용 지불 설명' },
  { id: 'sim-t1-robin-play',          type: 'sim', label: '🦊 T1 Robin Beloved 플레이',         fn: () => playCard('self', 'sim_robin_beloved') },
  { id: 'sim-t2-begin',               type: 'sim', label: '▶ T2 비기닝 페이즈',                 fn: playBeginPhase },
  { id: 'sim-t2-vanellope-ink',       type: 'sim', label: '💧 T2 잉크 추가 (Vanellope, 상대)',  fn: () => playInkAdd('opp', 'character_vanellope_sugar') },
  { id: 'sim-t2-pluto-play',          type: 'sim', label: '🐶 T2 Pluto 플레이 (상대)',          fn: () => playCard('opp', 'sim_pluto') },
  { id: 'p-begin-brief',              type: 'intro', kind: 'begin-brief', label: '비기닝 페이즈 설명' },
  { id: 'sim-t3-begin',               type: 'sim', label: '▶ T3 비기닝 페이즈',                 fn: async () => {
      await playBeginPhase();
      /* Pluto 가 Ready 상태가 되어 챌린지 대상이 될 수 없음을 안내.
         p-quest-brief(25p) 진입 시점(= sim-t3-mulan-effect 종료) 에 제거. */
      if (!DIALOGS.some(d => d.cardKey === 'sim_pluto' && d.tag === 'ready-untargetable')) {
        DIALOGS.push({
          side: 'opp', cardKey: 'sim_pluto', tag: 'ready-untargetable',
          text: t('dialog.readyUntargetable'),
          tail: 'tail-down',
          offset: { x: -10, y: -55 },
        });
        applyToggles();
      }
    } },
  { id: 'sim-t3-develop',             type: 'sim', label: '✨ T3 Develop Your Brain 발동',     fn: () => playDevelopYourBrain() },
  { id: 'sim-t3-pete-ink',            type: 'sim', label: '💧 T3 잉크 추가 (Pete)',
    fn: async () => {
      /* Develop Your Brain 후 떴던 'action-to-discard' 말풍선 정리. */
      for (let i = DIALOGS.length - 1; i >= 0; i--) {
        if (DIALOGS[i].tag === 'action-to-discard') DIALOGS.splice(i, 1);
      }
      applyToggles();
      await playInkAdd('self', 'character_pete_ghost');
    } },
  { id: 'sim-t3-mulan-play',          type: 'sim', label: '🥷 T3 Mulan 플레이',                 fn: () => playCard('self', 'sim_mulan') },
  { id: 'sim-t3-mulan-effect',        type: 'sim', label: '✨ T3 Mulan 효과 (draw + discard)',  fn: async () => {
      await playMulanEffect();
      /* 다음 페이지가 p-quest-brief — Pluto ready-untargetable 말풍선을 닫음. */
      for (let i = DIALOGS.length - 1; i >= 0; i--) {
        if (DIALOGS[i].tag === 'ready-untargetable') DIALOGS.splice(i, 1);
      }
      applyToggles();
    } },
  { id: 'p-quest-brief',              type: 'intro', kind: 'quest-brief', label: '퀘스트 설명' },
  { id: 'sim-t3-quest',               type: 'sim', label: '🌳 T3 Robin Beloved 퀘스트',         fn: () => playQuest('self', 'sim_robin_beloved') },
  { id: 'sim-t4-begin',               type: 'sim', label: '▶ T4 비기닝 페이즈',                 fn: playBeginPhase },
  { id: 'sim-t4-gadget-ink',          type: 'sim', label: '💧 T4 잉크 추가 (Gadget, 상대)',     fn: () => playInkAdd('opp', 'character_gadget_scientist') },
  { id: 'sim-t4-pluto-effect',        type: 'sim', label: '✨ T4 Pluto 효과 (−1 잉크)',         fn: () => playPlutoEffect() },
  { id: 'sim-t4-rajah-play',          type: 'sim', label: '🐯 T4 Rajah 플레이 (Exerted)',       fn: () => playCard('opp', 'sim_rajah', { exerted: true, costOverride: 2 }) },
  { id: 'sim-t5-begin',               type: 'sim', label: '▶ T5 비기닝 페이즈',                 fn: playBeginPhase },
  { id: 'sim-t5-moana-ink',           type: 'sim', label: '💧 T5 잉크 추가 (Moana)',            fn: () => playInkAdd('self', 'character_moana_curious') },
  { id: 'p-shift-brief',              type: 'intro', kind: 'shift-brief', label: '시프트 설명' },
  { id: 'sim-t5-shift',               type: 'sim', label: '↑ T5 Robin Champion 시프트',         fn: () => playShiftRobin() },
  { id: 'p-challenge-brief',          type: 'intro', kind: 'challenge-brief', label: '챌린지 설명' },
  { id: 'sim-t5-robin-pluto-blocked', type: 'sim', label: '❌ T5 Robin → Pluto 시도 (차단)',
    fn: () => playChallengeBlocked('self', 'sim_robin_champion', 'opp', 'sim_pluto', 'sim_rajah') },
  { id: 'sim-t5-mulan-rajah',         type: 'sim', label: '¤ T5 Mulan → Rajah 챌린지',          fn: () => playChallenge('self', 'sim_mulan', 'opp', 'sim_rajah') },
  { id: 'sim-t5-robin-rajah',         type: 'sim', label: '¤ T5 Robin → Rajah 챌린지',          fn: () => playChallenge('self', 'sim_robin_champion', 'opp', 'sim_rajah') },
  /* ----- T6 (Player B) ----- */
  { id: 'sim-t6-begin',               type: 'sim', label: '▶ T6 비기닝 페이즈',                 fn: playBeginPhase },
  { id: 'sim-t6-stitch-ink',          type: 'sim', label: '💧 T6 잉크 추가 (Stitch, 상대)',     fn: () => playInkAdd('opp', 'character_stitch_rockstar') },
  { id: 'sim-t6-mickey-play',         type: 'sim', label: '🐭 T6 Mickey 플레이 (상대, 비용 3)', fn: () => playCard('opp', 'character_mickey_pilot') },
  /* ----- T7 (Player A) ----- */
  { id: 'sim-t7-begin',               type: 'sim', label: '▶ T7 비기닝 페이즈',                 fn: playBeginPhase },
  { id: 'sim-t7-moana-ink',           type: 'sim', label: '💧 T7 잉크 추가 (Moana)',            fn: () => playInkAdd('self', 'character_moana_curious') },
  { id: 'p-sing-brief',               type: 'intro', kind: 'sing-brief', label: 'Sing(노래) 설명' },
  { id: 'sim-t7-letitgo',             type: 'sim', label: '🎵 T7 Let It Go (Sing)',             fn: () => playLetItGo() },
  { id: 'sim-t7-jasmine-play',        type: 'sim', label: '👸 T7 Jasmine 플레이 (비용 4)',      fn: () => playCard('self', 'character_jasmine_strategist') },
  /* 카드 종류(액션·아이템·로케이션) 설명은 도입부 p4-anatomy 뒤로 이동함. */
  /* ----- FINALE — last-turn jump → victory condition → win ----- */
  { id: 'p-finale-excuse', type: 'intro', kind: 'finale-excuse', label: '마지막 턴 안내' },
  { id: 'sim-finale-jump', type: 'sim',   label: '⏱ 마지막 턴으로 점프',   fn: () => playFinaleJump() },
  { id: 'p-victory-rule',  type: 'intro', kind: 'victory-rule',  label: '승리 조건' },
  { id: 'sim-finale-win',  type: 'sim',   label: '🏆 마지막 턴 — 승리',     fn: () => playFinaleVictory() },
  { id: 'p-deck-brief',    type: 'intro', kind: 'deck-brief',   label: '덱 구성' },
  { id: 'p-thanks',        type: 'intro', kind: 'thanks',       label: '감사합니다' },
];

/* 챕터 분기점 — 우측 컬럼 상단의 챕터 레일에서 즉시 점프 가능한 지점. */
const CHAPTERS = [
  { id: 'p1-title',           label: '표지' },
  { id: 'p2-world',           label: '세계관' },
  { id: 'p3-ink-colors',      label: '잉크 컬러' },
  { id: 'p4-anatomy',         label: '카드' },
  { id: 'p5-board-intro',     label: '보드' },
  { id: 'p8-mulligan-brief',  label: '멀리건' },
  { id: 'sim-t1-begin',       label: 'T1' },
  { id: 'sim-t2-begin',       label: 'T2' },
  { id: 'sim-t3-begin',       label: 'T3' },
  { id: 'sim-t4-begin',       label: 'T4' },
  { id: 'sim-t5-begin',       label: 'T5' },
  { id: 'sim-t6-begin',       label: 'T6' },
  { id: 'sim-t7-begin',       label: 'T7' },
  { id: 'p-finale-excuse',    label: '마지막 턴' },
  { id: 'p-deck-brief',       label: '마무리' },
].map(c => ({ ...c, pageIndex: PAGES.findIndex(p => p.id === c.id) }))
 .filter(c => c.pageIndex >= 0);

let currentPage = 0;
let busy = false;

/* ----- Undo stack (one snapshot per sim page entered) ----- */
const HISTORY = [];

function snapshot() {
  HISTORY.push({
    STATE:    JSON.parse(JSON.stringify(STATE)),
    DIALOGS:  JSON.parse(JSON.stringify(DIALOGS)),
    currentTurn,
    subtitleStep: document.querySelector('.subtitle-step')?.textContent || '',
    subtitleText: document.querySelector('.subtitle-text')?.innerHTML || '',
  });
}

/* 페이지 0 진입 직전(STATE 변경 전)의 초기 스냅샷.
   ⚠ gotoChapter 에서 사용할 때는 반드시 deep copy 후 restore — restoreFromSnapshot 이
   reference 할당이라 원본이 오염되면 다음 점프 시 누적 버그가 발생. */
const INITIAL_SNAPSHOT = {
  STATE:    JSON.parse(JSON.stringify(STATE)),
  DIALOGS:  [],
  currentTurn: 0,
  subtitleStep: '',
  subtitleText: '',
};

function applyActiveSide() {
  document.querySelectorAll('.player-side').forEach(el => el.classList.remove('active'));
  if (currentTurn === 0) {
    document.querySelector('.player-side.opponent')?.classList.add('active');
  } else {
    const side = (currentTurn % 2 === 1) ? 'self' : 'opp';
    document.querySelector(side === 'opp' ? '.player-side.opponent' : '.player-side.self')?.classList.add('active');
  }
}

function clearTransientOverlays() {
  document.querySelectorAll('.draw-flyer, .play-flyer, .ink-add-flyer, .challenge-arrow, .dialog-bubble, .board-intro-demo, .game-start-dice-wrap, .game-start-bubble, .finale-clock-wrap, .victory-badge')
    .forEach(el => el.remove());
  /* 승리 모드 해제 — 페이지 떠나면 카드 인터랙션 복귀. */
  document.body.classList.remove('victory-mode');
  hideBadge();
  /* Restore visibilities possibly tweaked by sim pages (e.g., board-intro). */
  const hand = document.getElementById('self-hand');
  if (hand) hand.style.opacity = '';
}

function restoreFromSnapshot(snap) {
  STATE.self = snap.STATE.self;
  STATE.opp  = snap.STATE.opp;
  DIALOGS.length = 0;
  DIALOGS.push(...snap.DIALOGS);
  currentTurn = snap.currentTurn;
  if (snap.subtitleStep !== undefined) setSubtitle(snap.subtitleStep, snap.subtitleText);
  clearTransientOverlays();
  /* 승리 연출 잔존 클래스 정리 — finale 페이지 backward 시 카드/카운터에 글로우 남는 것 방지. */
  document.querySelectorAll('.victory-card-glow').forEach(el => el.classList.remove('victory-card-glow'));
  document.getElementById('self-lore-num')?.classList.remove('lore-victory-pulse');
  renderSide('self');
  renderSide('opp');
  renderSelfHand();
  applyActiveSide();
  applyToggles(); /* re-render bubbles per current toggle state */
}

/* ----- Overlay / intro page rendering ----- */
async function showOverlay(page) {
  const el = document.getElementById('overlay');
  const inner = document.getElementById('overlay-content');
  if (!el || !inner) return;
  if (el.classList.contains('show')) {
    /* Already visible — fade content out, swap, fade back in. */
    inner.classList.add('fading');
    await sleep(320);
    inner.innerHTML = renderIntroHTML(page);
    inner.classList.remove('fading');
  } else {
    inner.innerHTML = renderIntroHTML(page);
    el.classList.add('show');
  }
}
function hideOverlay() {
  document.getElementById('overlay')?.classList.remove('show');
}
function renderIntroHTML(page) {
  if (page.kind === 'title') {
    return `
      <div class="overlay-title-block">
        <img class="overlay-banner" src="res/title.png" alt="Disney Lorcana">
        <h1 class="overlay-title">Disney Lorcana Guide</h1>
        <p class="overlay-subtitle">How to play</p>
        <p class="overlay-description">${t('intro.title.desc')}</p>
        <div class="lang-select">
          <button class="lang-btn${I18N.lang === 'ko' ? ' active' : ''}" data-lang="ko">한국어</button>
          <button class="lang-btn${I18N.lang === 'en' ? ' active' : ''}" data-lang="en">English</button>
          <button class="lang-btn" disabled title="준비중 / Coming soon">日本語</button>
        </div>
        <p class="overlay-hint">
          <kbd>Space</kbd> / <kbd>→</kbd> ${t('intro.title.next')} ·
          <kbd>Backspace</kbd> / <kbd>←</kbd> ${t('intro.title.prev')}
        </p>
      </div>`;
  }
  if (page.kind === 'world') {
    return `
      <div class="overlay-world">
        <img class="overlay-world-img" src="res/illumineer.webp" alt="Illumineer">
        <div class="overlay-world-text">
          <h2 class="overlay-section-title">${t('intro.world.title')}</h2>
          <p>${t('intro.world.p1')}</p>
          <p>${t('intro.world.p2')}</p>
          <p>${t('intro.world.p3')}</p>
        </div>
      </div>`;
  }
  if (page.kind === 'ink-colors') {
    return `
      <div class="overlay-ink-section">
        <h2 class="overlay-section-title">${t('intro.ink-colors.title')}</h2>
        <div class="ink-hex">
          <div class="ink-slot ink-amber">
            <img src="res/dlc_ink_amber.png" alt="Amber">
            <div class="ink-bubble"><strong>Amber</strong><br>${t('intro.ink-colors.amber')}</div>
          </div>
          <div class="ink-slot ink-amethyst">
            <img src="res/dlc_ink_amethyst.png" alt="Amethyst">
            <div class="ink-bubble"><strong>Amethyst</strong><br>${t('intro.ink-colors.amethyst')}</div>
          </div>
          <div class="ink-slot ink-emerald">
            <img src="res/dlc_ink_emerald.png" alt="Emerald">
            <div class="ink-bubble"><strong>Emerald</strong><br>${t('intro.ink-colors.emerald')}</div>
          </div>
          <div class="ink-slot ink-ruby">
            <img src="res/dlc_ink_ruby.png" alt="Ruby">
            <div class="ink-bubble"><strong>Ruby</strong><br>${t('intro.ink-colors.ruby')}</div>
          </div>
          <div class="ink-slot ink-sapphire">
            <img src="res/dlc_ink_sapphire.png" alt="Sapphire">
            <div class="ink-bubble"><strong>Sapphire</strong><br>${t('intro.ink-colors.sapphire')}</div>
          </div>
          <div class="ink-slot ink-steel">
            <img src="res/dlc_ink_steel.png" alt="Steel">
            <div class="ink-bubble"><strong>Steel</strong><br>${t('intro.ink-colors.steel')}</div>
          </div>
          <p class="overlay-tagline">${t('intro.ink-colors.tagline')}</p>
        </div>
      </div>`;
  }
  if (page.kind === 'card-anatomy') {
    const card = CARDS[page.cardKey];
    if (!card) return `<div class="overlay-section"><p>${t('intro.card-anatomy.notFound')}</p></div>`;
    return `
      <div class="card-anatomy">
        <img class="card-anatomy-img" decoding="async" src="${card.image}" alt="${card.fullName}">
        <div class="callout c-cost">${t('intro.card-anatomy.cost', { cost: card.cost })}</div>
        <div class="callout c-name-version">${t('intro.card-anatomy.nameVersion', { name: card.name, version: card.version })}</div>
        <div class="callout c-stats">${t('intro.card-anatomy.stats', { strength: card.strength, willpower: card.willpower })}</div>
        <div class="callout c-lore">${t('intro.card-anatomy.lore', { lore: card.lore })}</div>
      </div>`;
  }
  if (page.kind === 'ink-rules') {
    return `
      <div class="overlay-section ink-rules">
        <h2 class="overlay-section-title">${t('intro.ink-rules.title')}</h2>
        <div class="ink-rules-pair">
          <div class="ink-rule">
            <img src="res/inkable.png" alt="${t('intro.ink-rules.inkable')}">
            <div class="ink-rule-label">${t('intro.ink-rules.inkable')}</div>
          </div>
          <div class="ink-rule">
            <img src="res/uninkable.png" alt="${t('intro.ink-rules.uninkable')}">
            <div class="ink-rule-label">${t('intro.ink-rules.uninkable')}</div>
          </div>
        </div>
        <p>${t('intro.ink-rules.p1')}</p>
        <p>${t('intro.ink-rules.p2')}</p>
        <p>${t('intro.ink-rules.p3')}</p>
      </div>`;
  }
  if (page.kind === 'transition') {
    const desc = t('page.' + page.id + '.description');
    return `
      <div class="overlay-title-block">
        <h1 class="overlay-title">${t('page.' + page.id + '.title')}</h1>
        ${desc ? `<p class="overlay-description">${desc}</p>` : ''}
      </div>`;
  }
  if (page.kind === 'challenge-brief') {
    const attacker = CARDS['sim_mulan'];
    const defender = CARDS['sim_rajah'];
    return `
      <div class="overlay-section challenge-brief">
        <h2 class="overlay-section-title">${t('intro.challenge-brief.title')}</h2>
        <div class="challenge-demo">
          <div class="ch-side ch-attacker">
            <img class="ch-card" src="${attacker.image}" alt="${attacker.fullName}">
            <div class="ch-flash"></div>
            <div class="ch-dmg">${defender.strength}</div>
            <div class="ch-label">${t('intro.challenge-brief.attackerLabel')}</div>
          </div>
          <div class="ch-arrow"></div>
          <div class="ch-side ch-defender">
            <img class="ch-card ch-card-static" src="${defender.image}" alt="${defender.fullName}">
            <div class="ch-flash"></div>
            <div class="ch-dmg">${attacker.strength}</div>
            <div class="ch-label">${t('intro.challenge-brief.defenderLabel')}</div>
          </div>
        </div>
        <p class="challenge-desc">${t('intro.challenge-brief.desc')}</p>
      </div>`;
  }
  if (page.kind === 'action-brief') {
    const a = CARDS['action_dragonfire'];
    const s = CARDS['song_letitgo'];
    return `
      <div class="overlay-section closing-brief">
        <h2 class="overlay-section-title">${t('intro.action-brief.title')}</h2>
        <div class="closing-card-row two">
          <img class="closing-card-img" src="${a.image}" alt="${a.fullName}">
          <img class="closing-card-img" src="${s.image}" alt="${s.fullName}">
        </div>
        <p class="closing-desc">${t('intro.action-brief.desc')}</p>
      </div>`;
  }
  if (page.kind === 'item-brief') {
    const it = CARDS['item_lantern'];
    return `
      <div class="overlay-section closing-brief">
        <h2 class="overlay-section-title">${t('intro.item-brief.title')}</h2>
        <div class="closing-card-row one">
          <img class="closing-card-img" src="${it.image}" alt="${it.fullName}">
        </div>
        <p class="closing-desc">${t('intro.item-brief.desc')}</p>
      </div>`;
  }
  if (page.kind === 'location-brief') {
    const loc = CARDS['location_abandoned_lab'];
    return `
      <div class="overlay-section closing-brief">
        <h2 class="overlay-section-title">${t('intro.location-brief.title')}</h2>
        <div class="closing-card-row one">
          <div class="loc-frame">
            <img class="closing-card-img location-card" src="${loc.image}" alt="${loc.fullName}">
          </div>
        </div>
        <p class="closing-desc">${t('intro.location-brief.desc')}</p>
      </div>`;
  }
  if (page.kind === 'finale-excuse') {
    return `
      <div class="overlay-title-block finale-excuse-block">
        <h1 class="overlay-title finale-excuse-title">${t('intro.finale-excuse.title')}</h1>
        <p class="overlay-subtitle finale-excuse-sub">${t('intro.finale-excuse.sub')}</p>
      </div>`;
  }
  if (page.kind === 'victory-rule') {
    const sample = CARDS['sim_robin_beloved'];
    const sampleImg = sample?.image || 'card_back.jpeg';
    return `
      <div class="overlay-section closing-brief victory-rule">
        <h2 class="overlay-section-title">${t('intro.victory-rule.title')}</h2>
        <div class="vr-anim">
          <div class="vr-card-wrap">
            <img class="vr-card" src="${sampleImg}" alt="quest demo">
            <div class="vr-lore-pop">◆+1</div>
          </div>
          <div class="vr-arrow">→</div>
          <div class="vr-counter">
            <div class="vr-counter-track">
              <span class="vr-c-before">19</span>
              <span class="vr-c-after">20</span>
            </div>
            <span class="vr-c-of">/ 20</span>
          </div>
          <div class="vr-crown">👑</div>
        </div>
        <p class="closing-desc victory-rule-headline">${t('intro.victory-rule.headline')}</p>
        <ul class="closing-bullets">
          <li>${t('intro.victory-rule.bullet1')}</li>
          <li>${t('intro.victory-rule.bullet2')}</li>
          <li>${t('intro.victory-rule.bullet3')}</li>
        </ul>
      </div>`;
  }
  if (page.kind === 'deck-brief') {
    return `
      <div class="overlay-section closing-brief">
        <h2 class="overlay-section-title">${t('intro.deck-brief.title')}</h2>
        <ul class="closing-bullets">
          <li>${t('intro.deck-brief.bullet1')}</li>
          <li>${t('intro.deck-brief.bullet2')}</li>
          <li>${t('intro.deck-brief.bullet3')}</li>
        </ul>
        <p class="closing-desc">${t('intro.deck-brief.desc')}</p>
      </div>`;
  }
  if (page.kind === 'thanks') {
    return `
      <div class="overlay-title-block">
        <h1 class="overlay-title">${t('intro.thanks.title')}</h1>
        <p class="overlay-subtitle">${t('intro.thanks.sub')}</p>
      </div>`;
  }
  if (page.kind === 'sing-brief') {
    const song = CARDS['song_letitgo'];
    const robin = CARDS['sim_robin_champion'];
    const ink = n => Array.from({ length: n }, () => '<div class="cost-ink-card"></div>').join('');
    return `
      <div class="overlay-section sing-brief">
        <h2 class="overlay-section-title">${t('intro.sing-brief.title')}</h2>
        <div class="sing-pair">
          <div class="sing-item">
            <img class="cost-exert-card" src="${song.image}" alt="${song.fullName}">
            <div class="cost-exert-label">${t('intro.sing-brief.normalLabel', { cost: song.cost })}</div>
            <div class="cost-inkwell shift-cost-5">${ink(5)}</div>
          </div>
          <div class="shift-vs">VS</div>
          <div class="sing-item">
            <div class="sing-stack">
              <img class="cost-exert-card sing-singer" src="${robin.image}" alt="${robin.fullName}">
              <img class="cost-exert-card sing-song" src="${song.image}" alt="${song.fullName}">
            </div>
            <div class="cost-exert-label">${t('intro.sing-brief.singLabel')}</div>
            <div class="cost-exert-label sing-sub">${t('intro.sing-brief.singSub')}</div>
          </div>
        </div>
        <p class="sing-desc">${t('intro.sing-brief.desc')}</p>
      </div>`;
  }
  if (page.kind === 'shift-brief') {
    const beloved = CARDS['sim_robin_beloved'];
    const champion = CARDS['sim_robin_champion'];
    const ink = n => Array.from({ length: n }, () => '<div class="cost-ink-card"></div>').join('');
    return `
      <div class="overlay-section shift-brief">
        <h2 class="overlay-section-title">${t('intro.shift-brief.title')}</h2>
        <div class="shift-pair">
          <div class="shift-item">
            <div class="shift-card-zone single">
              <img class="cost-exert-card" src="${champion.image}" alt="${champion.fullName}">
            </div>
            <div class="cost-exert-label">${t('intro.shift-brief.normalLabel')}</div>
            <div class="cost-inkwell shift-cost-5">${ink(5)}</div>
          </div>
          <div class="shift-vs">VS</div>
          <div class="shift-item">
            <div class="shift-card-zone stacked">
              <img class="cost-exert-card shift-base" src="${beloved.image}" alt="${beloved.fullName}">
              <img class="cost-exert-card shift-top"  src="${champion.image}" alt="${champion.fullName}">
            </div>
            <div class="cost-exert-label">${t('intro.shift-brief.shiftLabel')}</div>
            <div class="cost-inkwell">${ink(3)}</div>
          </div>
        </div>
        <p class="shift-desc">${t('intro.shift-brief.desc')}</p>
      </div>`;
  }
  if (page.kind === 'quest-brief') {
    const robin = CARDS['sim_robin_beloved'];
    return `
      <div class="overlay-section quest-brief">
        <h2 class="overlay-section-title">${t('intro.quest-brief.title')}</h2>
        <div class="quest-demo">
          <div class="quest-demo-card-zone">
            <img class="quest-demo-card" src="${robin.image}" alt="${robin.fullName}">
            <div class="quest-demo-pop"><span class="lore-pop-diamond">◆</span>+1</div>
          </div>
          <div class="quest-demo-arrow"></div>
          <div class="quest-demo-diamond">
            <span class="quest-num quest-num-0">0</span>
            <span class="quest-num quest-num-1">1</span>
          </div>
        </div>
        <p class="quest-desc">${t('intro.quest-brief.desc')}</p>
      </div>`;
  }
  if (page.kind === 'cost-exert') {
    const c1 = CARDS['sim_robin_beloved'];
    const c2 = CARDS['character_vanellope_sugar'];
    const inksFor = n => Array.from({ length: n }, () => '<div class="cost-ink-card"></div>').join('');
    return `
      <div class="overlay-section cost-exert">
        <h2 class="overlay-section-title">${t('intro.cost-exert.title')}</h2>
        <p class="cost-exert-desc">${t('intro.cost-exert.desc')}</p>
        <div class="cost-exert-grid">
          <div class="cost-exert-item">
            <img class="cost-exert-card" src="${c1.image}" alt="${c1.fullName}">
            <div class="cost-exert-label">${t('intro.cost-exert.costLabel', { cost: c1.cost })}</div>
            <div class="cost-inkwell">${inksFor(c1.cost)}</div>
          </div>
          <div class="cost-exert-item">
            <img class="cost-exert-card" src="${c2.image}" alt="${c2.fullName}">
            <div class="cost-exert-label">${t('intro.cost-exert.costLabel', { cost: c2.cost })}</div>
            <div class="cost-inkwell">${inksFor(c2.cost)}</div>
          </div>
        </div>
      </div>`;
  }
  if (page.kind === 'begin-brief') {
    const jj = CARDS['character_jackjack_potential'];
    const jjImg = jj?.image || 'card_back.jpeg';
    const robin = CARDS['sim_robin_beloved'];
    const robinImg = robin?.image || 'card_back.jpeg';
    return `
      <div class="overlay-section begin-brief">
        <h2 class="overlay-section-title">${t('intro.begin-brief.title')}</h2>
        <p class="overlay-section-sub">${t('intro.begin-brief.sub')}</p>
        <div class="begin-phases">
          <div class="begin-phase phase-ready">
            <div class="phase-step">1</div>
            <h3>READY</h3>
            <p>${t('intro.begin-brief.readyText')}</p>
            <div class="begin-ready-demo">
              <div class="ready-demo-item">
                <div class="ready-demo-char" style="background-image: url('${robinImg}');"></div>
                <div class="ready-demo-tag">${t('intro.begin-brief.readyTagChar')}</div>
              </div>
              <div class="ready-demo-item">
                <div class="ready-demo-ink"></div>
                <div class="ready-demo-tag">${t('intro.begin-brief.readyTagInk')}</div>
              </div>
            </div>
            <p class="begin-card-caption begin-ready-note">${t('intro.begin-brief.readyNote')}</p>
          </div>
          <div class="begin-phase phase-set">
            <div class="phase-step">2</div>
            <h3>SET</h3>
            <p>${t('intro.begin-brief.setText')}</p>
            <img src="${jjImg}" alt="Jack-Jack Parr - Incredible Potential" class="begin-card-example begin-card-glow" decoding="async">
            <p class="begin-card-caption">${t('intro.begin-brief.setCaption')}</p>
          </div>
          <div class="begin-phase phase-draw">
            <div class="phase-step">3</div>
            <h3>DRAW</h3>
            <p>${t('intro.begin-brief.drawText')}</p>
            <div class="begin-draw-demo">
              <div class="begin-deck"><div class="card-back deck-back"></div></div>
              <div class="begin-draw-card"><div class="card-back deck-back"></div></div>
            </div>
            <p class="begin-card-caption begin-draw-note">${t('intro.begin-brief.drawNote')}</p>
          </div>
        </div>
      </div>`;
  }
  if (page.kind === 'ready-exert') {
    const card = CARDS['sim_robin_beloved'];
    return `
      <div class="overlay-section ready-exert">
        <h2 class="overlay-section-title">Ready &amp; Exert</h2>
        <div class="ready-exert-pair">
          <div class="re-state">
            <img src="${card.image}" alt="Ready" class="re-card">
            <div class="re-label">${t('intro.ready-exert.readyLabel')}</div>
          </div>
          <div class="re-state">
            <img src="${card.image}" alt="Exerted" class="re-card re-exerted">
            <div class="re-label">${t('intro.ready-exert.exertedLabel')}</div>
          </div>
        </div>
        <p class="ready-exert-desc">${t('intro.ready-exert.desc')}</p>
      </div>`;
  }
  return '';
}

/* Board introduction — fade overlay out, hide hand, add demo cards in
   inkwell/play, point bubbles at each zone. */
async function playBoardIntro() {
  setSubtitle(
    t('subtitle.boardIntro.step'),
    t('subtitle.boardIntro.body')
  );
  /* hand는 멀리건 직전이라 STATE에는 있지만, 아직 시연 시점이 아님 — 잠시 숨김. */
  const hand = document.getElementById('self-hand');
  if (hand) hand.style.opacity = '0';

  /* Demo cards in inkwell + play area so each zone is visually distinguishable.
     STATE는 건드리지 않고 DOM에만 추가 → .board-intro-demo 클래스로 표시,
     페이지 떠날 때 clearTransientOverlays 가 일괄 제거. */
  const demoInkSelf = document.getElementById('self-inkwell');
  if (demoInkSelf) {
    for (let i = 0; i < 3; i++) {
      const ink = document.createElement('div');
      ink.className = 'ink-card board-intro-demo';
      demoInkSelf.appendChild(ink);
    }
  }
  const demoInkOpp = document.getElementById('opp-inkwell');
  if (demoInkOpp) {
    for (let i = 0; i < 2; i++) {
      const ink = document.createElement('div');
      ink.className = 'ink-card board-intro-demo';
      demoInkOpp.appendChild(ink);
    }
  }
  const demoPlaySelf = document.getElementById('self-play');
  if (demoPlaySelf && CARDS['sim_robin_beloved']) {
    const card = CARDS['sim_robin_beloved'];
    const el = document.createElement('div');
    el.className = 'card board-intro-demo';
    el.innerHTML = `<img src="${card.image}" alt="${card.fullName}">`;
    demoPlaySelf.appendChild(el);
  }
  const demoPlayOpp = document.getElementById('opp-play');
  if (demoPlayOpp && CARDS['sim_pluto']) {
    const card = CARDS['sim_pluto'];
    const el = document.createElement('div');
    el.className = 'card board-intro-demo';
    el.innerHTML = `<img src="${card.image}" alt="${card.fullName}">`;
    demoPlayOpp.appendChild(el);
  }

  await sleep(450); /* overlay fade-out 끝나기 대기 + 데모 카드 layout */

  /* 4개 영역 말풍선. data-* 부여해서 prev/clear 시 일괄 제거 가능. */
  const zones = [
    /* Deck/Discard는 화면 우측 — 말풍선이 카드의 왼쪽에 위치하고 꼬리는 오른쪽(카드 방향) */
    { sel: '.self-lr .deck-zone',     text: t('dialog.zoneDeck'),      placement: 'left-of' },
    { sel: '.self-lr .discard-zone',  text: t('dialog.zoneDiscard'),   placement: 'left-of' },
    /* Play / Inkwell은 위쪽에 말풍선 + 꼬리 아래 */
    { sel: '#self-play',              text: t('dialog.zonePlay'),      placement: 'above' },
    { sel: '#self-inkwell',           text: t('dialog.zoneInkwell'),   placement: 'above' },
  ];
  for (const z of zones) {
    const target = document.querySelector(z.sel);
    if (!target) continue;
    const r = target.getBoundingClientRect();
    const b = document.createElement('div');
    b.dataset.boardIntro = '1';
    b.innerHTML = z.text;
    b.style.position = 'fixed';
    if (z.placement === 'left-of') {
      b.className = 'dialog-bubble tail-right board-intro-bubble';
      const bubbleW = 200;
      b.style.left = (r.left - bubbleW - 22) + 'px';
      b.style.top  = (r.top + r.height / 2 - 22) + 'px';
      b.style.maxWidth = bubbleW + 'px';
    } else {
      b.className = 'dialog-bubble tail-down board-intro-bubble';
      b.style.left = (r.left + r.width / 2 - 100) + 'px';
      b.style.top  = (r.top - 80) + 'px';
    }
    document.body.appendChild(b);
  }
}

/* ----- Page navigation ----- */
function setBusy(b) {
  busy = b;
  const prev = document.getElementById('btn-prev-page');
  const next = document.getElementById('btn-next-page');
  if (prev) prev.disabled = b || currentPage === 0;
  if (next) next.disabled = b || currentPage >= PAGES.length - 1;
}

function updatePageUI() {
  const slider  = document.getElementById('page-slider');
  const cur     = document.getElementById('page-current');
  const tot     = document.getElementById('page-total');
  const label   = document.getElementById('page-label');
  const prev    = document.getElementById('btn-prev-page');
  const next    = document.getElementById('btn-next-page');

  if (slider) {
    slider.max = PAGES.length - 1;
    slider.value = currentPage;
  }
  if (cur) cur.textContent = currentPage + 1;
  if (tot) tot.textContent = PAGES.length;
  if (label) label.textContent = t('pageLabel.' + (PAGES[currentPage]?.id || ''), null, PAGES[currentPage]?.label || '');
  if (prev) prev.disabled = busy || currentPage === 0;
  if (next) next.disabled = busy || currentPage >= PAGES.length - 1;
  renderChapterRail();
}

async function nextPage() {
  if (busy || currentPage >= PAGES.length - 1) return;
  setBusy(true);

  /* Clear leftover transient overlays from the previous page (board-intro
     bubbles, lingering dialogs, etc.). */
  clearTransientOverlays();

  currentPage++;
  const page = PAGES[currentPage];
  if (page.type === 'sim') {
    hideOverlay();
    snapshot();
    if (page.fn) await page.fn();
  } else {
    await showOverlay(page);
  }
  setBusy(false);
  updatePageUI();
}

async function prevPage() {
  if (busy || currentPage <= 0) return;
  setBusy(true);
  const cur = PAGES[currentPage];
  if (cur.type === 'sim') {
    /* Roll back the action of this sim page. */
    const snap = HISTORY.pop();
    if (snap) restoreFromSnapshot(snap);
  } else {
    /* Intro pages: just clear any leftover board-intro decoration. */
    clearTransientOverlays();
  }
  currentPage--;
  const prev = PAGES[currentPage];
  if (prev.type === 'intro') await showOverlay(prev);
  else hideOverlay();
  setBusy(false);
  updatePageUI();
}

document.getElementById('btn-next-page')?.addEventListener('click', nextPage);
document.getElementById('btn-prev-page')?.addEventListener('click', prevPage);

/* ----- Chapter jump (fast-replay) -----
   특정 챕터의 시작 페이지로 즉시 이동. STATE 일관성을 위해 0번부터 목표
   페이지까지 sim 함수를 FAST_MODE 로 빠르게 replay 한다 (sleep 0, CSS
   transition 0). 14개 챕터 모두 1초 이내 도달.

   ⚠ INITIAL_SNAPSHOT 은 반드시 deep copy 해서 사용. restoreFromSnapshot 의
   reference 할당 + 이후 sim 함수의 STATE.self.*.push() 가 원본 스냅샷을
   오염시키면 다음 점프 시 카드가 누적되는 버그가 발생한다. */
async function gotoChapter(targetIdx) {
  if (busy || targetIdx < 0 || targetIdx >= PAGES.length) return;
  if (targetIdx === currentPage) return;
  setBusy(true);
  FAST_MODE = true;
  document.body.classList.add('fast-mode');
  try {
    /* 초기 상태로 리셋 — deep copy 필수 */
    restoreFromSnapshot(JSON.parse(JSON.stringify(INITIAL_SNAPSHOT)));
    HISTORY.length = 0;
    hideOverlay();
    clearTransientOverlays();
    currentPage = 0;

    /* 0번 페이지 처리 */
    const first = PAGES[0];
    if (first.type === 'intro') await showOverlay(first);

    /* 0 → target 까지 순차 진행 */
    for (let i = 1; i <= targetIdx; i++) {
      currentPage = i;
      const page = PAGES[i];
      clearTransientOverlays();
      if (page.type === 'sim') {
        hideOverlay();
        snapshot();
        if (page.fn) await page.fn();
      } else {
        await showOverlay(page);
      }
    }
  } finally {
    FAST_MODE = false;
    document.body.classList.remove('fast-mode');
    setBusy(false);
    updatePageUI();
  }
}

/* 현재 페이지가 어느 챕터 구간에 속하는지 (해당 챕터.pageIndex 이하인 마지막 것) */
function currentChapterIndex() {
  let last = 0;
  for (let i = 0; i < CHAPTERS.length; i++) {
    if (CHAPTERS[i].pageIndex <= currentPage) last = i;
    else break;
  }
  return last;
}

/* ----- Chapter rail — 세로 트랙 + step dot + 드래그 popup -----
   처음 호출 시 한 번 구조를 만들고 핸들러 부착. 이후 호출은 active 표시 + thumb 위치만 갱신. */
function pctOfChapter(idx) {
  return (idx / (CHAPTERS.length - 1)) * 100;
}

function ensureChapterRail() {
  const root = document.getElementById('chapter-rail');
  if (!root || root.dataset.built === '1') return;
  root.dataset.built = '1';

  const track = document.createElement('div');
  track.className = 'chapter-track';
  track.innerHTML = '<div class="chapter-track-line"></div>';
  CHAPTERS.forEach((ch, idx) => {
    const dot = document.createElement('div');
    dot.className = 'chapter-dot';
    dot.dataset.idx = idx;
    dot.style.top = `calc(${pctOfChapter(idx)}% - 3px)`;
    dot.title = t('chapter.' + ch.id, null, ch.label);
    track.appendChild(dot);
  });
  const thumb = document.createElement('div');
  thumb.className = 'chapter-thumb';
  track.appendChild(thumb);
  const popup = document.createElement('div');
  popup.className = 'chapter-popup';
  track.appendChild(popup);
  root.appendChild(track);

  /* ----- Pointer 드래그/클릭 ----- */
  let drag = null;
  const idxFromY = (clientY) => {
    const rect = track.getBoundingClientRect();
    const inner = rect.height - 12; /* track-line top:6 bottom:6 */
    const rel = (clientY - rect.top - 6) / inner;
    const i = Math.round(rel * (CHAPTERS.length - 1));
    return Math.max(0, Math.min(CHAPTERS.length - 1, i));
  };
  const showPreview = (idx) => {
    const pct = pctOfChapter(idx);
    thumb.style.top = `calc(${pct}% - 5px)`;
    popup.style.top = `calc(${pct}% + 1px)`;
    popup.textContent = t('chapter.' + CHAPTERS[idx].id, null, CHAPTERS[idx].label);
    popup.classList.add('visible');
  };
  const hidePreview = () => popup.classList.remove('visible');

  track.addEventListener('pointerdown', (e) => {
    if (busy) return;
    e.preventDefault();
    try { track.setPointerCapture(e.pointerId); } catch {}
    root.classList.add('dragging');
    drag = { pointerId: e.pointerId };
    drag.idx = idxFromY(e.clientY);
    showPreview(drag.idx);
  });
  track.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    drag.idx = idxFromY(e.clientY);
    showPreview(drag.idx);
  });
  const endDrag = (commit, e) => {
    if (!drag || (e && e.pointerId !== drag.pointerId)) return;
    const targetIdx = drag.idx;
    root.classList.remove('dragging');
    hidePreview();
    drag = null;
    if (commit && targetIdx != null) gotoChapter(CHAPTERS[targetIdx].pageIndex);
  };
  track.addEventListener('pointerup',     (e) => endDrag(true,  e));
  track.addEventListener('pointercancel', (e) => endDrag(false, e));
}

function renderChapterRail() {
  ensureChapterRail();
  const root = document.getElementById('chapter-rail');
  if (!root) return;
  const activeIdx = currentChapterIndex();
  const thumb = root.querySelector('.chapter-thumb');
  if (thumb) thumb.style.top = `calc(${pctOfChapter(activeIdx)}% - 5px)`;
  root.querySelectorAll('.chapter-dot').forEach((d, i) => {
    d.classList.toggle('active', i === activeIdx);
  });
}

/* ============================================================
   CARD MODAL — click any board/hand card to inspect it large.
   Cards inside .scenario-overlay (intro pages) are excluded.
   ============================================================ */
function closeAllCardModals() {
  document.querySelectorAll('.card-modal').forEach(m => m.remove());
}
function showCardModal(src, alt) {
  if (!src) return;
  closeAllCardModals();
  const m = document.createElement('div');
  m.className = 'card-modal';
  m.innerHTML = `
    <div class="card-modal-backdrop"></div>
    <div class="card-modal-content">
      <img src="${src}" alt="${alt || ''}">
      <button class="card-modal-close">${t('ui.modalClose')}</button>
    </div>`;
  document.body.appendChild(m);
  m.querySelector('.card-modal-close').addEventListener('click', closeAllCardModals);
  m.querySelector('.card-modal-backdrop').addEventListener('click', closeAllCardModals);
}

document.addEventListener('click', (e) => {
  if (e.target.closest('.scenario-overlay')) return;
  if (e.target.closest('.card-modal')) return;
  const el = e.target.closest('.board .card, .self-hand-fan .hand-card');
  if (!el) return;
  /* For shifted stacks, prefer the TOP card (Champion) — the base (.shift-base-img)
     is just decorative behind it. */
  const img = el.querySelector('img:not(.shift-base-img)') || el.querySelector('img');
  if (!img || !img.src || img.src.endsWith('card_back.jpeg')) return;
  showCardModal(img.src, img.alt);
});

/* Keyboard shortcuts:
   Space / → → next, Backspace / ← → prev. Esc → close modal. Ignored in inputs. */
document.addEventListener('keydown', (e) => {
  const t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
  if (e.key === 'Escape') {
    if (document.querySelector('.card-modal')) {
      e.preventDefault();
      closeAllCardModals();
      return;
    }
  }
  /* If a modal is open, swallow nav keys (don't change pages while reading a card). */
  if (document.querySelector('.card-modal')) return;
  if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
    e.preventDefault();
    nextPage();
  } else if (e.key === 'Backspace' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
    e.preventDefault();
    prevPage();
  }
});

/* ============================================================
   EDGE PULL GESTURE — 화면 좌/우 가장자리에서 시작해 임계값 이상
   드래그 후 놓으면 페이지 전환. 화면 자체는 움직이지 않음 (트래킹만).
   ============================================================ */
const EDGE_HIT_PX    = 70;   /* 좌/우 가장자리 hit zone 폭 */
const PULL_THRESHOLD = 150;  /* 페이지 전환 임계값 (드래그 거리) */

let pullState = null;

function endPull(commit) {
  if (!pullState) return;
  const side = pullState.side;
  document.body.classList.remove('edge-pulling');
  pullState = null;
  if (commit) {
    if (side === 'L') prevPage();
    else nextPage();
  }
}

document.addEventListener('pointerdown', (e) => {
  if (pullState || busy) return;
  if (document.querySelector('.card-modal')) return;
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  /* 컨트롤 위에서는 무시 — 슬라이더/버튼/체크박스 등 */
  if (e.target.closest('.page-controls, button, input, select, .card-modal')) return;

  const x = e.clientX;
  const w = window.innerWidth;
  let side = null;
  if (x < EDGE_HIT_PX) side = 'L';
  else if (x > w - EDGE_HIT_PX) side = 'R';
  if (!side) return;
  /* 좌측 풀(prev)인데 첫 페이지거나 우측 풀(next)인데 마지막 페이지면 비활성 */
  if (side === 'L' && currentPage === 0) return;
  if (side === 'R' && currentPage >= PAGES.length - 1) return;

  pullState = { side, startX: x, pointerId: e.pointerId };
  document.body.classList.add('edge-pulling');
});

document.addEventListener('pointerup', (e) => {
  if (!pullState || e.pointerId !== pullState.pointerId) return;
  const dx = e.clientX - pullState.startX;
  let commit = false;
  if (pullState.side === 'L' && dx > PULL_THRESHOLD) commit = true;
  else if (pullState.side === 'R' && dx < -PULL_THRESHOLD) commit = true;
  endPull(commit);
});

document.addEventListener('pointercancel', (e) => {
  if (!pullState || e.pointerId !== pullState.pointerId) return;
  endPull(false);
});

/* Slider is view-only (visual indicator); clicking it snaps to the chosen
   page only for intro pages (no STATE change). Jumping into sim pages is
   complex (would need to replay actions), so we disable that for now. */
document.getElementById('page-slider')?.addEventListener('input', (e) => {
  const target = parseInt(e.target.value, 10);
  if (Number.isNaN(target)) return;
  /* Allow jumping only between intro pages or back to current. */
  const within = (idx) => idx >= 0 && idx < PAGES.length && PAGES[idx].type === 'intro';
  if (within(target) && PAGES[currentPage].type === 'intro') {
    currentPage = target;
    showOverlay(PAGES[currentPage]);
    updatePageUI();
  } else {
    /* snap back */
    e.target.value = currentPage;
  }
});

/* ============================================================
   MULLIGAN — return 4 cards to the deck, then draw 4 new ones.
   Scripted to the user's scenario:
     return: Merida-Formidable Archer, Spooky Sight, A Whole New World ×2
     draw:   Robin Hood-Beloved Outlaw, Mulan-Disguised Soldier,
             Moana-Curious Explorer, Aurora-Dreaming Guardian
   ============================================================ */
const MULLIGAN_RETURN_KEYS = [
  'character_merida_archer',
  'song_spooky',
  'song_newworld',
  'song_newworld',
];
const MULLIGAN_DRAW_KEYS = [
  'sim_robin_beloved',
  'action_develop_your_brain', /* Mulan 대신 — T3 에 발동해 Mulan 을 덱에서 찾음 */
  'character_moana_curious',
  'character_aurora_dream',
];

/* ============================================================
   Staggered self-draw — N장을 잉크 exert 동시 캐스케이드 스타일로 드로우.
   모든 키를 한 번에 STATE.self.hand 에 push 하고 renderSelfHand 1회만 호출 →
   마지막 N개 카드에 .incoming 으로 숨김 → 각 카드 끝 위치를 미리 측정 →
   각 flyer 를 STAGGER ms 간격으로 발화. 마지막 flyer 가 도착하면 모두 reveal.
   FAST_MODE 에서는 STATE 만 갱신.
   ============================================================ */
async function drawCardsStaggerSelf(keys, opts = {}) {
  const STAGGER   = opts.stagger ?? 140;
  const FLIGHT_MS = opts.flightMs ?? 1000;

  const handEl = document.getElementById('self-hand');
  const deckEl = document.querySelector('.self-lr .deck-zone');
  if (!handEl || !deckEl || keys.length === 0) return;

  if (FAST_MODE) {
    keys.forEach(k => STATE.self.hand.push(k));
    renderSelfHand();
    return;
  }

  /* 1) STATE 일괄 push + renderSelfHand 1회 → fan 위치 확정. */
  const startIdx = STATE.self.hand.length;
  keys.forEach(k => STATE.self.hand.push(k));
  renderSelfHand();

  /* 2) 마지막 N개에 .incoming 적용 (도착 전까지 잠시 숨김). */
  const incomingCards = [];
  for (let j = 0; j < keys.length; j++) {
    const card = handEl.children[startIdx + j];
    if (card) {
      card.classList.add('incoming');
      incomingCards.push(card);
    }
  }

  await new Promise(r => requestAnimationFrame(r));

  /* 3) 덱 시작 위치 (fan 좌표계 기준) — 모든 flyer가 공유. */
  const dRect = deckEl.getBoundingClientRect();
  const fRect = handEl.getBoundingClientRect();
  const startLeft = dRect.left - fRect.left;
  const startTop  = dRect.top  - fRect.top;
  const startW    = dRect.width;
  const startH    = dRect.height;

  /* 4) 각 카드별 끝 위치 측정. */
  const targets = incomingCards.map((card, j) => ({
    el: card,
    endLeft: card.offsetLeft,
    endTop:  card.offsetTop,
    endW:    card.offsetWidth,
    endH:    card.offsetHeight,
    endTransform: getComputedStyle(card).transform,
    key: keys[j],
  }));

  /* 5) Flyer 들을 STAGGER 간격으로 발화. */
  const flyerPromises = targets.map((t, j) => new Promise(async (resolve) => {
    await sleep(j * STAGGER);

    const drawnCard = CARDS[t.key];
    const faceUrl = drawnCard?.image || '';

    const flyer = document.createElement('div');
    flyer.className = 'draw-flyer';
    flyer.style.left   = startLeft + 'px';
    flyer.style.top    = startTop  + 'px';
    flyer.style.width  = startW    + 'px';
    flyer.style.height = startH    + 'px';
    flyer.style.transform = 'rotate(0deg)';
    flyer.innerHTML = `
      <div class="flyer-inner">
        <div class="flyer-back"></div>
        <div class="flyer-front">
          <div class="flyer-face" style="background: url('${faceUrl}') center/cover no-repeat;"></div>
        </div>
      </div>`;
    handEl.appendChild(flyer);

    /* Forced reflow — 시작 위치(start)를 paint commit 후 rAF 에서 끝 위치로 전환.
       이 단계가 없으면 첫 호출 시 브라우저가 start/end 를 같은 batch 로 합쳐
       transition 이 발화하지 않고 카드가 끝 위치로 즉시 점프하는 버그가 발생. */
    void flyer.offsetHeight;

    requestAnimationFrame(() => {
      flyer.style.left      = t.endLeft + 'px';
      flyer.style.top       = t.endTop  + 'px';
      flyer.style.width     = t.endW    + 'px';
      flyer.style.height    = t.endH    + 'px';
      flyer.style.transform = t.endTransform;
      flyer.querySelector('.flyer-inner').classList.add('peeking');
    });

    await sleep(FLIGHT_MS);
    t.el.classList.remove('incoming');
    flyer.remove();
    resolve();
  }));

  await Promise.all(flyerPromises);
}

/* ============================================================
   GAME START — 주사위로 선/후공 결정 → A 말풍선 → 양쪽 7장 stagger 드로우.
   ============================================================ */
async function playGameStart() {
  setSubtitle(
    t('subtitle.gameStart.step'),
    t('subtitle.gameStart.body')
  );

  if (FAST_MODE) {
    INITIAL_HAND_KEYS.forEach(k => STATE.self.hand.push(k));
    for (let i = 0; i < 7; i++) STATE.opp.hand.push('_filler');
    renderSelfHand();
    return;
  }

  /* 1) 주사위 박스 두 개 — Player B(opp) 위쪽 보드, Player A(self) 아래쪽 보드. */
  const wrap = document.createElement('div');
  wrap.className = 'game-start-dice-wrap';
  wrap.innerHTML = `
    <div class="dice-col opp">
      <div class="dice-label">Player B</div>
      <div class="dice-box" data-side="b">?</div>
    </div>
    <div class="dice-col self">
      <div class="dice-label">Player A</div>
      <div class="dice-box" data-side="a">?</div>
    </div>`;
  document.body.appendChild(wrap);

  await sleep(500);

  /* 2) 결과: A 는 매번 무작위(2~6), B 는 A 보다 작게(1~A-1) → A 가 항상 승. */
  const aVal = 2 + Math.floor(Math.random() * 5);    // 2..6
  const bVal = 1 + Math.floor(Math.random() * (aVal - 1)); // 1..(aVal-1)

  const diceA = wrap.querySelector('.dice-box[data-side="a"]');
  const diceB = wrap.querySelector('.dice-box[data-side="b"]');
  const ROLL_MS = 1200;
  const TICK = 70;
  const startT = Date.now();
  await new Promise(resolve => {
    const id = setInterval(() => {
      diceA.textContent = String(Math.floor(Math.random() * 6) + 1);
      diceB.textContent = String(Math.floor(Math.random() * 6) + 1);
      if (Date.now() - startT >= ROLL_MS) {
        clearInterval(id);
        diceA.textContent = String(aVal);
        diceB.textContent = String(bVal);
        diceA.classList.add('settled', 'winner');
        diceB.classList.add('settled');
        resolve();
      }
    }, TICK);
  });

  await sleep(700);

  /* 3) Player A 말풍선: "먼저 시작하겠습니다!". A 주사위 박스 위에 정렬. */
  const bubble = document.createElement('div');
  bubble.className = 'dialog-bubble tail-down game-start-bubble';
  bubble.innerHTML = t('dialog.gameStartBubble');
  document.body.appendChild(bubble);
  const aRect = diceA.getBoundingClientRect();
  bubble.style.position = 'fixed';
  bubble.style.left = (aRect.left + aRect.width / 2 - 110) + 'px';
  bubble.style.top  = (aRect.top - 78) + 'px';
  bubble.style.zIndex = '9100';

  await sleep(1400);

  /* 4) 주사위 + 말풍선 페이드아웃. */
  wrap.classList.add('fade-out');
  bubble.classList.add('fade-out');
  await sleep(450);
  wrap.remove();
  bubble.remove();

  /* 5) 양쪽 7장 stagger 드로우 — 잉크 exert 캐스케이드 스타일. */
  const HAND_STAGGER = 110;
  const oppPromise = (async () => {
    for (let i = 0; i < 7; i++) {
      drawCardOpp(); /* 비동기 시작 (sleep 내장) — await 하지 않고 stagger */
      await sleep(HAND_STAGGER);
    }
  })();
  const selfPromise = drawCardsStaggerSelf(INITIAL_HAND_KEYS, { stagger: HAND_STAGGER });
  await Promise.all([selfPromise, oppPromise]);
}

async function playMulligan() {
  const handEl = document.getElementById('self-hand');
  const deckEl = document.querySelector('.self-lr .deck-zone');
  if (!handEl || !deckEl) return;

  setSubtitle(
    t('subtitle.mulligan.step'),
    t('subtitle.mulligan.body')
  );

  /* 1) Identify the 4 return cards in hand. Match by key; handle dupes. */
  const claimed = new Set();
  const returnInfo = [];
  MULLIGAN_RETURN_KEYS.forEach(key => {
    const idx = STATE.self.hand.findIndex((k, i) => k === key && !claimed.has(i));
    if (idx < 0) return;
    claimed.add(idx);
    const el = handEl.children[idx];
    returnInfo.push({
      idx, key, el,
      rect: el.getBoundingClientRect(),
      transform: getComputedStyle(el).transform,
    });
  });

  /* 2) Deck target rect. */
  const dRect = deckEl.getBoundingClientRect();

  /* 3) Stagger: each return card flies from its hand slot to the deck. */
  const STAGGER = 160;
  const FLIGHT  = 850;

  const flightPromises = returnInfo.map((info, j) => new Promise(async (resolve) => {
    await sleep(j * STAGGER);

    /* Hide the source hand card (DOM stays so other cards don't reflow yet). */
    info.el.style.opacity = '0';

    /* Build flyer at hand-card's slot, with the card's fan rotation preserved. */
    const card = CARDS[info.key];
    const flyer = document.createElement('div');
    flyer.className = 'play-flyer mulligan-flyer';
    flyer.style.left   = info.rect.left + 'px';
    flyer.style.top    = info.rect.top  + 'px';
    flyer.style.width  = info.rect.width  + 'px';
    flyer.style.height = info.rect.height + 'px';
    flyer.style.transform       = info.transform;
    flyer.style.transformOrigin = '50% 100%';
    flyer.innerHTML = `<img src="${card.image}" alt="${card.fullName}">`;
    document.body.appendChild(flyer);

    void flyer.offsetHeight;

    requestAnimationFrame(() => {
      flyer.style.left      = dRect.left + 'px';
      flyer.style.top       = dRect.top  + 'px';
      flyer.style.width     = dRect.width  + 'px';
      flyer.style.height    = dRect.height + 'px';
      flyer.style.transform = 'rotate(0deg)';
    });

    await sleep(FLIGHT);
    flyer.remove();
    resolve();
  }));

  await Promise.all(flightPromises);

  /* 4) Commit STATE — remove return cards from hand (descending indices to
        preserve positions), append them to the bottom of the deck. */
  const returnedCards = [];
  [...returnInfo].sort((a, b) => b.idx - a.idx).forEach(info => {
    const [removed] = STATE.self.hand.splice(info.idx, 1);
    returnedCards.unshift(removed);
  });
  STATE.self.deck.push(...returnedCards);
  renderSelfHand();

  /* 5) Brief pause. */
  await sleep(400);

  /* 6) Draw 4 replacements — 잉크 exert 동시 캐스케이드 스타일.
        모든 카드를 한번에 STATE 에 push 후 4개의 flyer 가 STAGGER 간격으로 발화. */
  await drawCardsStaggerSelf(MULLIGAN_DRAW_KEYS, { stagger: 140 });
}

/* ============================================================
   INK ADD — both players use the same reveal → flip → slot flow.
   Player A: source = hand-card (the card the user is inking).
   Player B: source = above-viewport (their hand is hidden, but the card
            must still be revealed face-up so the audience confirms it's
            ink-eligible — per Lorcana rules).
   ============================================================ */
async function playInkAdd(sideKey = 'self', cardKey = null) {
  const isOpp = sideKey === 'opp';
  const inkEl = document.getElementById(isOpp ? 'opp-inkwell' : 'self-inkwell');
  if (!inkEl) return;

  /* Resolve source card / element. */
  let card, sourceEl = null, sourceRect = null, resolvedHandIdx = -1;
  if (isOpp) {
    if (!cardKey) return;
    card = CARDS[cardKey];
    if (!card) return;
  } else {
    const handEl = document.getElementById('self-hand');
    if (!handEl || STATE.self.hand.length === 0) return;
    if (cardKey) {
      resolvedHandIdx = STATE.self.hand.indexOf(cardKey);
      if (resolvedHandIdx < 0) return;
    } else {
      resolvedHandIdx = STATE.self.hand.findIndex(k => k !== 'sim_robin_champion');
      if (resolvedHandIdx < 0) resolvedHandIdx = 0;
    }
    cardKey = STATE.self.hand[resolvedHandIdx];
    card = CARDS[cardKey];
    sourceEl = handEl.children[resolvedHandIdx];
    if (!card || !sourceEl) return;
    sourceRect = sourceEl.getBoundingClientRect();
  }

  setSubtitle(
    t('subtitle.inkAdd.step', { turn: currentTurn, player: isOpp ? 'Player B' : 'Player A' }),
    `<strong>${card.fullName}</strong>${isOpp ? t('subtitle.inkAdd.bodyOpp') : t('subtitle.inkAdd.bodySelf')}`
  );

  /* Aspect ratio — use whichever image we can get a natural size from. */
  let aspect = 0.715;
  if (sourceEl) {
    const img = sourceEl.querySelector('img');
    if (img && img.naturalWidth && img.naturalHeight) {
      aspect = img.naturalWidth / img.naturalHeight;
    }
  } else {
    const tmp = new Image();
    tmp.src = card.image;
    await new Promise(r => {
      if (tmp.complete && tmp.naturalWidth) r();
      else { tmp.onload = r; tmp.onerror = r; }
    });
    if (tmp.naturalWidth && tmp.naturalHeight) {
      aspect = tmp.naturalWidth / tmp.naturalHeight;
    }
  }

  const boxFromHeight = (cx, cy, h) => {
    const w = h * aspect;
    return { left: cx - w / 2, top: cy - h / 2, width: w, height: h };
  };

  /* Source position. */
  const baseH = sourceRect ? sourceRect.height : 200; /* hand-card height */
  const start = sourceRect
    ? boxFromHeight(sourceRect.left + sourceRect.width / 2, sourceRect.top + sourceRect.height / 2, sourceRect.height)
    : boxFromHeight(window.innerWidth / 2, -(baseH + 40), baseH);

  /* Reveal: viewport horizontal center, 1.5x larger.
     Player A reveals at vertical center; Player B stays a bit higher so the
     card doesn't drop all the way down toward the player A area. */
  const revealY = isOpp ? window.innerHeight * 0.36 : window.innerHeight / 2;
  const reveal = boxFromHeight(window.innerWidth / 2, revealY, baseH * 1.5);

  /* Build flyer with both faces. */
  const flyer = document.createElement('div');
  flyer.className = 'ink-add-flyer';
  flyer.style.left   = start.left   + 'px';
  flyer.style.top    = start.top    + 'px';
  flyer.style.width  = start.width  + 'px';
  flyer.style.height = start.height + 'px';
  flyer.innerHTML = `
    <div class="ink-flip-inner">
      <img class="ink-flip-front" src="${card.image}" alt="${card.fullName}">
      <div class="ink-flip-back"></div>
    </div>`;
  document.body.appendChild(flyer);

  if (sourceEl) sourceEl.style.opacity = '0';
  void flyer.offsetHeight;

  /* (1) Move to center + scale up — reveal face-up. */
  requestAnimationFrame(() => {
    flyer.style.left   = reveal.left   + 'px';
    flyer.style.top    = reveal.top    + 'px';
    flyer.style.width  = reveal.width  + 'px';
    flyer.style.height = reveal.height + 'px';
  });
  await sleep(850);

  /* (2) Hold 0.5s so the audience reads the card. */
  await sleep(500);

  /* (3) Commit state shift: remove from hand (self), append to inkwell. */
  if (isOpp) {
    STATE.opp.inkwell.push({ exerted: false });
    renderInkwell('opp', 'opp-inkwell');
  } else {
    if (resolvedHandIdx >= 0) STATE.self.hand.splice(resolvedHandIdx, 1);
    STATE.self.inkwell.push({ exerted: false });
    renderSelfHand();
    renderInkwell('self', 'self-inkwell');
  }

  const newInkEl = inkEl.lastElementChild;
  if (!newInkEl) { flyer.remove(); return; }
  newInkEl.style.opacity = '0';

  await new Promise(r => requestAnimationFrame(r));
  const tRect = newInkEl.getBoundingClientRect();
  const end = boxFromHeight(
    tRect.left + tRect.width  / 2,
    tRect.top  + tRect.height / 2,
    tRect.height
  );

  /* (4) Flip + slide into the inkwell slot. */
  flyer.querySelector('.ink-flip-inner').classList.add('flipped');
  requestAnimationFrame(() => {
    flyer.style.left   = end.left   + 'px';
    flyer.style.top    = end.top    + 'px';
    flyer.style.width  = end.width  + 'px';
    flyer.style.height = end.height + 'px';
  });
  await sleep(900);

  newInkEl.style.opacity = '1';
  flyer.remove();
}

/* ============================================================
   CHALLENGE — Mulan attacks Rajah.
   1) Mulan exerts.
   2) Red arrow Mulan → Rajah, held ~0.7s.
   3) Both cards shake + red overlay simultaneously.
   4) Damage counters appear at card center (Mulan +rajah.str, Rajah +mulan.str).
   5) If Mulan's damage ≥ willpower, Mulan is banished to discard.
   ============================================================ */
function drawChallengeArrow(srcRect, dstRect) {
  const sx = srcRect.left + srcRect.width  / 2;
  const sy = srcRect.top  + srcRect.height / 2;
  const dx = dstRect.left + dstRect.width  / 2;
  const dy = dstRect.top  + dstRect.height / 2;
  const len   = Math.hypot(dx - sx, dy - sy);
  const angle = Math.atan2(dy - sy, dx - sx);

  const arrow = document.createElement('div');
  arrow.className = 'challenge-arrow';
  arrow.style.left  = sx + 'px';
  arrow.style.top   = sy + 'px';
  arrow.style.width = len + 'px';
  arrow.style.transform = `rotate(${angle}rad)`;
  document.body.appendChild(arrow);
  return arrow;
}

async function playChallenge(attackerSide, attackerKey, defenderSide, defenderKey) {
  const attackerCard = CARDS[attackerKey];
  const defenderCard = CARDS[defenderKey];
  if (!attackerCard || !defenderCard) return;

  const aPlayElId = attackerSide === 'opp' ? 'opp-play' : 'self-play';
  const dPlayElId = defenderSide === 'opp' ? 'opp-play' : 'self-play';
  const aPlayEl = document.getElementById(aPlayElId);
  const dPlayEl = document.getElementById(dPlayElId);
  if (!aPlayEl || !dPlayEl) return;

  const attackerIdx = STATE[attackerSide].play.findIndex(p => p.card === attackerKey);
  const defenderIdx = STATE[defenderSide].play.findIndex(p => p.card === defenderKey);
  if (attackerIdx < 0 || defenderIdx < 0) return;

  const attackerEl = aPlayEl.children[attackerIdx];
  const defenderEl = dPlayEl.children[defenderIdx];
  if (!attackerEl || !defenderEl) return;

  setSubtitle(
    t('subtitle.challenge.step', { turn: currentTurn }),
    `<strong>${attackerCard.fullName}</strong> ⚔ <strong>${defenderCard.fullName}</strong>`
  );

  /* (1) Attacker exerts. */
  STATE[attackerSide].play[attackerIdx].exerted = true;
  attackerEl.classList.add('exerted');
  await sleep(600); /* let the exert rotate finish */

  /* (2) Red arrow Mulan → Rajah. */
  const aRect = attackerEl.getBoundingClientRect();
  const dRect = defenderEl.getBoundingClientRect();
  const arrow = drawChallengeArrow(aRect, dRect);
  await sleep(700);

  /* Fade the arrow out as the collision happens. */
  arrow.classList.add('fade-out');
  setTimeout(() => arrow.remove(), 400);

  /* (3) Both cards shake + red flash, simultaneously. */
  attackerEl.classList.add('hit');
  defenderEl.classList.add('hit');
  await sleep(520);
  attackerEl.classList.remove('hit');
  defenderEl.classList.remove('hit');

  /* (4) Apply damage + re-render. The new .dmg-counter elements run the
        counter-drop animation as soon as they mount (CSS handles it). */
  STATE[attackerSide].play[attackerIdx].damage += defenderCard.strength;
  STATE[defenderSide].play[defenderIdx].damage += attackerCard.strength;
  renderPlay(attackerSide, aPlayElId);
  renderPlay(defenderSide, dPlayElId);

  /* Wait for the drop-in animation to finish. */
  await sleep(500);

  /* (5) Pause 0.7s so the user reads the counters before any banish. */
  await sleep(700);

  /* (6) Banish if damage ≥ willpower. */
  if (STATE[attackerSide].play[attackerIdx]?.damage >= attackerCard.willpower) {
    const el = document.getElementById(aPlayElId).children[attackerIdx];
    await animateBanish(el, attackerSide, attackerKey, attackerIdx);
  }
  const defenderBanished = STATE[defenderSide].play[defenderIdx]?.damage >= defenderCard.willpower;
  if (defenderBanished) {
    const el = document.getElementById(dPlayElId).children[defenderIdx];
    await animateBanish(el, defenderSide, defenderKey, defenderIdx);
  }

  /* (7) Card-specific challenge triggers — Robin Hood (Champion of Sherwood):
        "Whenever this character challenges another character, gain 2 lore." */
  if (attackerKey === 'sim_robin_champion'
      && STATE[attackerSide].play.some(p => p.card === 'sim_robin_champion')) {
    await sleep(300);

    const champIdx = STATE[attackerSide].play.findIndex(p => p.card === 'sim_robin_champion');
    const champEl = document.getElementById(aPlayElId).children[champIdx];
    const loreDiamondEl = document.querySelector(
      attackerSide === 'opp' ? '.opp-lore-block .lore-diamond' : '.self-lore-block .lore-diamond'
    );
    if (champEl && loreDiamondEl) {
      const r = champEl.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top  + r.height / 2;
      const pop = document.createElement('div');
      pop.className = 'lore-pop';
      pop.innerHTML = `<span class="lore-pop-diamond">◆</span><span class="lore-pop-text">+2</span>`;
      pop.style.left = cx + 'px';
      pop.style.top  = cy + 'px';
      document.body.appendChild(pop);
      setTimeout(() => pop.remove(), 1900);

      const lr = loreDiamondEl.getBoundingClientRect();
      const arrow = drawLoreArrow(cx, cy, lr.left + lr.width / 2, lr.top + lr.height / 2);
      setTimeout(() => arrow.remove(), 1900);
    }

    STATE[attackerSide].lore += 2;
    const loreNumEl = document.getElementById(attackerSide === 'opp' ? 'opp-lore-num' : 'self-lore-num');
    if (loreNumEl) {
      loreNumEl.textContent = STATE[attackerSide].lore;
      loreNumEl.classList.add('lore-bump');
      setTimeout(() => loreNumEl.classList.remove('lore-bump'), 600);
    }

    /* Speech bubble next to the champion explaining the trigger. */
    if (!DIALOGS.some(d => d.cardKey === 'sim_robin_champion' && d.tag === 'champ-bonus')) {
      DIALOGS.push({
        side: attackerSide, cardKey: 'sim_robin_champion', tag: 'champ-bonus',
        text: t('dialog.robinHood'),
        tail: 'tail-up',
        offset: { x: -10, y: 240 },
        placement: 'below',
      });
      applyToggles();
    }
    await sleep(800);
  }
}

/* ============================================================
   MULAN EFFECT — Mulan triggered ability per scenario:
   draw the top of deck (Robin Hood — Champion of Sherwood),
   then discard a chosen hand card (John Smith — Undaunted Protector).
   ============================================================ */
async function playMulanEffect() {
  setSubtitle(
    t('subtitle.mulanEffect.step', { turn: currentTurn }),
    t('subtitle.mulanEffect.body')
  );

  /* 뮬란 카드 위에 효과 설명 말풍선 — 효과 종료 후 자동 제거 (mulan-effect-explain tag). */
  if (!DIALOGS.some(d => d.cardKey === 'sim_mulan' && d.tag === 'mulan-effect-explain')) {
    DIALOGS.push({
      side: 'self', cardKey: 'sim_mulan', tag: 'mulan-effect-explain',
      text: t('dialog.mulanEntrance'),
      tail: 'tail-down',
      offset: { x: 0, y: -55 },
    });
    applyToggles();
  }
  await sleep(800);

  /* (1) Draw the scripted card off the top of self.deck. */
  await drawCardSelf();
  await sleep(400);

  /* (2) Discard John Smith from hand. */
  const handEl = document.getElementById('self-hand');
  if (!handEl) return;
  const discardKey = 'character_johnsmith_protector';
  const idx = STATE.self.hand.indexOf(discardKey);
  if (idx < 0) return;
  const handCardEl = handEl.children[idx];
  if (!handCardEl) return;

  const card = CARDS[discardKey];
  const sRect = handCardEl.getBoundingClientRect();
  const tx    = getComputedStyle(handCardEl).transform;

  const discardEl = document.querySelector('.self-lr .discard-zone');
  if (!discardEl) return;
  const dRect = discardEl.getBoundingClientRect();

  const flyer = document.createElement('div');
  flyer.className = 'play-flyer banish-flyer';
  flyer.style.left   = sRect.left + 'px';
  flyer.style.top    = sRect.top  + 'px';
  flyer.style.width  = sRect.width  + 'px';
  flyer.style.height = sRect.height + 'px';
  flyer.style.transform       = tx;
  flyer.style.transformOrigin = '50% 100%';
  flyer.innerHTML = `<img src="${card.image}" alt="${card.fullName}">`;
  document.body.appendChild(flyer);

  handCardEl.style.opacity = '0';
  void flyer.offsetHeight;

  requestAnimationFrame(() => {
    flyer.style.left      = dRect.left + 'px';
    flyer.style.top       = dRect.top  + 'px';
    flyer.style.width     = dRect.width  + 'px';
    flyer.style.height    = dRect.height + 'px';
    flyer.style.transform = 'rotate(0deg)';
  });

  await sleep(870);

  STATE.self.hand.splice(idx, 1);
  STATE.self.discard.push(discardKey);
  renderSelfHand();
  renderDiscard('self', 'self-discard');
  flyer.remove();

  /* 효과 종료 — 설명 말풍선 제거 */
  for (let i = DIALOGS.length - 1; i >= 0; i--) {
    if (DIALOGS[i].tag === 'mulan-effect-explain') DIALOGS.splice(i, 1);
  }
  applyToggles();
}

/* ============================================================
   DEVELOP YOUR BRAIN — 1코 액션. 덱 top 2장 face-up 펼침 → Mulan 선택해 핸드,
   Scar 는 덱 바닥으로. 액션 카드 자체는 사용 후 discard.
   ============================================================ */
async function playDevelopYourBrain() {
  const ACTION_KEY = 'action_develop_your_brain';
  const PICK_KEY   = 'sim_mulan';
  const BOTTOM_KEY = 'character_scar_king';
  const card = CARDS[ACTION_KEY];
  if (!card) return;

  setSubtitle(
    `T${currentTurn} / Develop Your Brain`,
    t('subtitle.develop.body')
  );

  const handEl = document.getElementById('self-hand');
  const deckEl = document.querySelector('.self-lr .deck-zone');
  const handIdx = STATE.self.hand.indexOf(ACTION_KEY);
  if (!handEl || !deckEl || handIdx < 0) return;

  /* (1) 비용 1잉크 exert. */
  await exertReadyInk('self', 1);
  await sleep(150);

  /* (2) 액션 카드를 핸드에서 화면 중앙 약간 위로 reveal flyer. */
  const handCardEl = handEl.children[handIdx];
  const sRect = handCardEl.getBoundingClientRect();
  const actionFlyer = document.createElement('div');
  actionFlyer.className = 'play-flyer develop-action-flyer';
  actionFlyer.style.left   = sRect.left + 'px';
  actionFlyer.style.top    = sRect.top + 'px';
  actionFlyer.style.width  = sRect.width + 'px';
  actionFlyer.style.height = sRect.height + 'px';
  actionFlyer.innerHTML = `<img src="${card.image}" alt="${card.fullName}">`;
  document.body.appendChild(actionFlyer);
  handCardEl.style.opacity = '0';

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight * 0.32;
  void actionFlyer.offsetHeight;
  requestAnimationFrame(() => {
    actionFlyer.style.left = (centerX - sRect.width * 0.5) + 'px';
    actionFlyer.style.top  = (centerY - sRect.height * 0.5) + 'px';
    actionFlyer.style.transform = 'scale(1.15)';
  });
  await sleep(800);

  /* (3) 액션 카드를 위쪽으로 살짝 더 밀고, 그 아래 face-down 2장 펼침. */
  requestAnimationFrame(() => {
    actionFlyer.style.top  = (centerY - sRect.height * 1.15) + 'px';
    actionFlyer.style.transform = 'scale(0.9)';
  });
  await sleep(450);

  const dRect = deckEl.getBoundingClientRect();
  const lookW = sRect.width * 1.2;
  const lookH = sRect.height * 1.2;
  const spread = lookW * 0.65;
  const lookY = centerY + lookH * 0.05;

  function makeLookFlyer() {
    const f = document.createElement('div');
    f.className = 'play-flyer develop-look-flyer';
    f.style.left   = dRect.left + 'px';
    f.style.top    = dRect.top + 'px';
    f.style.width  = dRect.width + 'px';
    f.style.height = dRect.height + 'px';
    f.innerHTML = `<div class="develop-look-inner"><div class="develop-look-back card-back"></div><div class="develop-look-front"></div></div>`;
    document.body.appendChild(f);
    return f;
  }
  const lookL = makeLookFlyer();
  const lookR = makeLookFlyer();

  void lookL.offsetHeight; void lookR.offsetHeight;

  /* deck → 가운데 좌·우로 펼침. */
  requestAnimationFrame(() => {
    lookL.style.left   = (centerX - spread - lookW * 0.5) + 'px';
    lookL.style.top    = lookY + 'px';
    lookL.style.width  = lookW + 'px';
    lookL.style.height = lookH + 'px';

    lookR.style.left   = (centerX + spread - lookW * 0.5) + 'px';
    lookR.style.top    = lookY + 'px';
    lookR.style.width  = lookW + 'px';
    lookR.style.height = lookH + 'px';
  });
  await sleep(850);

  /* (4) 두 장 face-up flip (Mulan 좌, Scar 우). */
  const pickCard   = CARDS[PICK_KEY];
  const bottomCard = CARDS[BOTTOM_KEY];
  lookL.querySelector('.develop-look-front').style.backgroundImage = `url('${pickCard.image}')`;
  lookR.querySelector('.develop-look-front').style.backgroundImage = `url('${bottomCard.image}')`;
  lookL.querySelector('.develop-look-inner').classList.add('flipped');
  lookR.querySelector('.develop-look-inner').classList.add('flipped');
  await sleep(950);

  /* (5) Mulan 강조 (선택). */
  lookL.classList.add('develop-look-pick');
  await sleep(900);

  /* (6) STATE 갱신: 액션 카드 hand → discard, 덱 top 2장 제거,
        Mulan 핸드 append, Scar 덱 바닥에 push. */
  STATE.self.hand.splice(handIdx, 1);
  STATE.self.discard.push(ACTION_KEY);
  STATE.self.deck.shift(); /* PICK_KEY 위치 — 핸드로 갈 카드 */
  STATE.self.deck.shift(); /* BOTTOM_KEY 위치 — 바닥으로 갈 카드 */
  STATE.self.hand.push(PICK_KEY);
  STATE.self.deck.push(BOTTOM_KEY);

  renderSelfHand();
  renderDiscard('self', 'self-discard');

  /* 새로 추가된 Mulan 의 hand-card 자리 측정 → 그 위치로 lookL 비행. */
  const newMulanEl = handEl.lastElementChild;
  newMulanEl.classList.add('incoming');
  await new Promise(r => requestAnimationFrame(r));
  const targetRect = newMulanEl.getBoundingClientRect();

  requestAnimationFrame(() => {
    lookL.classList.remove('develop-look-pick');
    lookL.style.left   = targetRect.left + 'px';
    lookL.style.top    = targetRect.top + 'px';
    lookL.style.width  = targetRect.width + 'px';
    lookL.style.height = targetRect.height + 'px';
    lookL.style.transform = getComputedStyle(newMulanEl).transform;
    /* face-up 유지 (이미 flipped) */
  });

  /* Scar 는 face-down 으로 돌린 뒤 "덱 맨 아래" 로 들어가는 시각.
     덱 top 과 동일한 card-back(deckCover)을 Scar flyer 보다 위(z 261)에 덮어,
     Scar(z 260)가 그 뒤로 미끄러져 들어가도록 한다 → 맨 위가 아니라 '밑으로' tuck.
     (1) 덱 바로 위에 살짝 떠서 또렷이 보임 → (2) 덱 뒤로 내려가며 가려지고 fade. */
  lookR.querySelector('.develop-look-inner').classList.remove('flipped');

  /* (1) 덱 위로 glide — 윗부분이 덱 위로 삐져나온 채 떠 있음 (face-down). */
  requestAnimationFrame(() => {
    lookR.style.left    = dRect.left + 'px';
    lookR.style.top     = (dRect.top - dRect.height * 0.45) + 'px';
    lookR.style.width   = dRect.width + 'px';
    lookR.style.height  = dRect.height + 'px';
    lookR.style.opacity = '1';
  });

  /* 액션 카드 자체는 discard 로 fade-out. */
  actionFlyer.classList.add('develop-action-fade');

  await sleep(650);

  /* (2) 덱 top card-back 을 Scar 위에 덮어씌운다 (동일 아트라 seam 없음). */
  const deckCover = document.createElement('div');
  deckCover.className = 'card-back develop-deck-cover';
  deckCover.style.left   = dRect.left + 'px';
  deckCover.style.top    = dRect.top + 'px';
  deckCover.style.width  = dRect.width + 'px';
  deckCover.style.height = dRect.height + 'px';
  document.body.appendChild(deckCover);

  /* Scar 를 덱 위치로 내려 cover 뒤로 사라지게 + fade → '덱 맨 아래로'. */
  requestAnimationFrame(() => {
    lookR.style.top     = dRect.top + 'px';
    lookR.style.opacity = '0';
  });

  await sleep(600);
  newMulanEl.classList.remove('incoming');
  lookL.remove();
  lookR.remove();
  deckCover.remove();
  actionFlyer.remove();

  /* 액션 카드가 discard 로 간 시점 — discard 영역에 룰 안내 말풍선.
     다음 페이지 sim-t3-pete-ink 시작 시 제거. */
  if (!DIALOGS.some(d => d.tag === 'action-to-discard')) {
    DIALOGS.push({
      side: 'self', tag: 'action-to-discard',
      zoneSelector: '.self-lr .discard-zone',
      text: t('dialog.actionDiscard'),
      tail: 'tail-right',
      placement: 'left-of',
    });
    applyToggles();
  }
}

/* ============================================================
   PLUTO ABILITY — exert Pluto to discount the next character by 1 ink.
   Visualizes with a short speech bubble while Pluto rotates exerted.
   ============================================================ */
async function playPlutoEffect() {
  const playIdx = STATE.opp.play.findIndex(p => p.card === 'sim_pluto');
  if (playIdx < 0) return;
  const playEl = document.getElementById('opp-play');
  const cardEl = playEl?.children[playIdx];

  setSubtitle(
    t('subtitle.pluto.step', { turn: currentTurn }),
    t('subtitle.pluto.body')
  );

  /* Exert Pluto (Player B's own character — paying its own ability cost). */
  STATE.opp.play[playIdx].exerted = true;
  if (cardEl) cardEl.classList.add('exerted');
  await sleep(600); /* let the rotate finish */

  /* Brief speech bubble for clarity. */
  if (cardEl) {
    const rect = cardEl.getBoundingClientRect();
    const bubble = document.createElement('div');
    bubble.className = 'dialog-bubble tail-up';
    bubble.innerHTML = t('dialog.plutoBubble');
    bubble.style.position = 'fixed';
    bubble.style.left = (rect.left + rect.width / 2 - 80) + 'px';
    bubble.style.top  = (rect.bottom + 14) + 'px';
    bubble.dataset.side    = 'opp';
    bubble.dataset.cardKey = 'sim_pluto-effect'; /* unique so it doesn't collide */
    document.body.appendChild(bubble);

    await sleep(900);
    bubble.remove();
  }
}

/* ============================================================
   QUEST — exert a character, gain that character's lore.
   ============================================================ */
async function playQuest(sideKey, cardKey) {
  const card = CARDS[cardKey];
  if (!card) return;

  /* Drop "ink-dried" reminder on this card — it's now questing. */
  for (let i = DIALOGS.length - 1; i >= 0; i--) {
    if (DIALOGS[i].tag === 'ink-dried' && DIALOGS[i].cardKey === cardKey) {
      DIALOGS.splice(i, 1);
    }
  }
  applyToggles();

  const playArr = STATE[sideKey].play;
  const idx = playArr.findIndex(p => p.card === cardKey);
  if (idx < 0) return;

  const playEl = document.getElementById(sideKey === 'opp' ? 'opp-play' : 'self-play');
  const cardEl = playEl?.children[idx];
  const loreGain = card.lore || 1;
  const playerLabel = sideKey === 'self' ? 'Player A' : 'Player B';

  setSubtitle(
    t('subtitle.quest.step', { turn: currentTurn, player: playerLabel }),
    t('subtitle.quest.body', { cardName: card.fullName, lore: loreGain })
  );

  /* (1) Exert character. */
  STATE[sideKey].play[idx].exerted = true;
  if (cardEl) cardEl.classList.add('exerted');
  await sleep(550);

  /* (2) Lore VFX: ◆+N pop above card + white arrow to the lore diamond. */
  const loreDiamondEl = document.querySelector(
    sideKey === 'opp' ? '.opp-lore-block .lore-diamond' : '.self-lore-block .lore-diamond'
  );
  if (cardEl && loreDiamondEl) {
    const r = cardEl.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top  + r.height / 2;

    const pop = document.createElement('div');
    pop.className = 'lore-pop';
    pop.innerHTML = `<span class="lore-pop-diamond">◆</span><span class="lore-pop-text">+${loreGain}</span>`;
    pop.style.left = cx + 'px';
    pop.style.top  = cy + 'px';
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 1900);

    const lr = loreDiamondEl.getBoundingClientRect();
    const arrow = drawLoreArrow(cx, cy, lr.left + lr.width / 2, lr.top + lr.height / 2);
    setTimeout(() => arrow.remove(), 1900);
  }
  await sleep(450);

  /* (3) Lore counter bump. */
  STATE[sideKey].lore += loreGain;
  const loreEl = document.getElementById(sideKey === 'opp' ? 'opp-lore-num' : 'self-lore-num');
  if (loreEl) {
    loreEl.textContent = STATE[sideKey].lore;
    loreEl.classList.add('lore-bump');
    setTimeout(() => loreEl.classList.remove('lore-bump'), 600);
  }
  await sleep(700);
}

function drawLoreArrow(sx, sy, dx, dy) {
  const len = Math.hypot(dx - sx, dy - sy);
  const angle = Math.atan2(dy - sy, dx - sx);
  const arrow = document.createElement('div');
  arrow.className = 'lore-arrow';
  arrow.style.left = sx + 'px';
  arrow.style.top  = sy + 'px';
  arrow.style.width = len + 'px';
  arrow.style.transform = `rotate(${angle}rad)`;
  document.body.appendChild(arrow);
  return arrow;
}

/* ============================================================
   FINALE — last-turn jump (clock SVG → STATE swap) → quest victory.
   PlayerA 가 14 → 16 → 18 → 20 으로 quest 3번에 도달, 게임 종료.
   ============================================================ */
function setupFinalBoardState() {
  STATE.self.lore = 14;
  STATE.self.hand = ['character_jasmine_resourceful', 'song_spooky'];
  STATE.self.inkwell = Array.from({ length: 8 }, () => ({ exerted: false }));
  STATE.self.play = [
    { card: 'character_aurora_dream',  exerted: true,  damage: 2 },
    { card: 'character_moana_curious', exerted: true,  damage: 1 },
    { card: 'character_merida_archer', exerted: false, damage: 0 },
  ];
  STATE.self.discard = ['action_three_arrows'];
  STATE.self.deck = ['character_mulan_diplomat'];

  STATE.opp.lore = 19;
  STATE.opp.hand = [];
  STATE.opp.inkwell = Array.from({ length: 7 }, () => ({ exerted: false }));
  STATE.opp.play = [
    { card: 'character_stitch_rockstar',  exerted: true, damage: 0 },
    { card: 'character_rex_dinosaur',     exerted: true, damage: 0 },
    { card: 'character_stitch_trickster', exerted: true, damage: 0 },
  ];
  STATE.opp.discard = ['character_vanellope_sugar'];
  STATE.opp.deck = [];

  /* 이전 안내 dialog 들은 마지막 턴 시점에는 모두 무효. 일괄 정리. */
  DIALOGS.length = 0;

  /* currentTurn = 14: 다음 playBeginPhase 호출 시 15 (홀수=self) 가 되어 PlayerA 턴 시작. */
  currentTurn = 14;

  renderSide('self');
  renderSide('opp');
  renderSelfHand();
  applyToggles();
}

async function playFinaleJump() {
  setSubtitle(
    t('subtitle.finaleJump.step'),
    t('subtitle.finaleJump.body')
  );

  if (FAST_MODE) {
    setupFinalBoardState();
    return;
  }

  /* 검은 fade overlay + 회전 시계 SVG. */
  const wrap = document.createElement('div');
  wrap.className = 'finale-clock-wrap';
  /* 12개 tick line 동적 생성. */
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = i * 30 * Math.PI / 180;
    const x1 = 100 + Math.sin(a) * 78;
    const y1 = 100 - Math.cos(a) * 78;
    const x2 = 100 + Math.sin(a) * 88;
    const y2 = 100 - Math.cos(a) * 88;
    return `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}"/>`;
  }).join('');
  wrap.innerHTML = `
    <svg class="finale-clock-svg" viewBox="0 0 200 200" aria-hidden="true">
      <circle class="cl-face" cx="100" cy="100" r="92"/>
      <g class="cl-ticks">${ticks}</g>
      <line class="cl-hand cl-hour" x1="100" y1="100" x2="100" y2="55"/>
      <line class="cl-hand cl-min"  x1="100" y1="100" x2="100" y2="35"/>
      <circle class="cl-center" cx="100" cy="100" r="6"/>
    </svg>
    <div class="finale-clock-caption">${t('ui.finaleCaption')}</div>
  `;
  document.body.appendChild(wrap);

  await sleep(450); /* fade-in 끝나기 대기 */

  /* 시계 회전 중간에 STATE 갱신 — 사용자가 시계만 보고 있을 때 보드는 이미 바뀜. */
  await sleep(900);
  setupFinalBoardState();

  await sleep(900); /* 시계 회전 마저 끝낼 시간 */

  wrap.classList.add('fade-out');
  await sleep(450);
  wrap.remove();
}

async function playFinaleVictory() {
  /* 이전 진입 잔존 클래스 정리 (backward → forward 재진입 시 깨끗). */
  document.querySelectorAll('.victory-card-glow').forEach(el => el.classList.remove('victory-card-glow'));
  document.getElementById('self-lore-num')?.classList.remove('lore-victory-pulse');

  /* T15 시작 — Begin phase: READY → SET → DRAW (Mulan Considerate). */
  await playBeginPhase();
  await sleep(400);

  /* Quest 3연발 — 14 → 16 → 18 → 20. */
  await playQuest('self', 'character_aurora_dream');
  await sleep(450);
  await playQuest('self', 'character_moana_curious');
  await sleep(450);
  await playQuest('self', 'character_merida_archer');

  /* 승리 연출. */
  await playVictorySequence();
}

async function playVictorySequence() {
  if (FAST_MODE) return; /* 점프 모드에선 연출 생략 */

  /* 카드 인터랙션 차단 — 승리 연출 중에는 카드 hover/zoom/click 비활성화. */
  document.body.classList.add('victory-mode');

  /* (1) Lore 카운터 황금 펄스 — 20점 임팩트. */
  const loreEl = document.getElementById('self-lore-num');
  if (loreEl) loreEl.classList.add('lore-victory-pulse');

  /* (2) 마지막 quester (Merida) 황금 외곽 글로우. */
  const playEl = document.getElementById('self-play');
  const meridaIdx = STATE.self.play.findIndex(p => p.card === 'character_merida_archer');
  const meridaEl = meridaIdx >= 0 ? playEl?.children[meridaIdx] : null;
  if (meridaEl) meridaEl.classList.add('victory-card-glow');

  await sleep(700);

  /* (3) 풀스크린 VICTORY 배지. */
  const badge = document.createElement('div');
  badge.className = 'victory-badge';
  badge.innerHTML = `
    <div class="victory-icon">🏆</div>
    <div class="victory-text">VICTORY</div>
    <div class="victory-sub">Player A wins</div>
  `;
  document.body.appendChild(badge);

  setSubtitle(t('subtitle.victory.step'), t('subtitle.victory.body'));

  await sleep(2200);
}

/* ============================================================
   CHALLENGE BLOCKED — attacker declares a challenge but the declared target
   is shielded by a Bodyguard. Show the attempted arrow + BLOCKED badge,
   then fade out. Attacker does NOT exert (the challenge was illegal).
   ============================================================ */
async function playChallengeBlocked(attackerSide, attackerKey, targetSide, targetKey, blockerKey) {
  const attackerCard = CARDS[attackerKey];
  const targetCard   = CARDS[targetKey];
  const blockerCard  = blockerKey ? CARDS[blockerKey] : null;
  if (!attackerCard || !targetCard) return;

  const aPlayElId = attackerSide === 'opp' ? 'opp-play' : 'self-play';
  const tPlayElId = targetSide   === 'opp' ? 'opp-play' : 'self-play';

  const attackerIdx = STATE[attackerSide].play.findIndex(p => p.card === attackerKey);
  const targetIdx   = STATE[targetSide].play.findIndex(p => p.card === targetKey);
  if (attackerIdx < 0 || targetIdx < 0) return;

  const aEl = document.getElementById(aPlayElId).children[attackerIdx];
  const tEl = document.getElementById(tPlayElId).children[targetIdx];
  if (!aEl || !tEl) return;

  setSubtitle(
    t('subtitle.challengeBlocked.step', { turn: currentTurn }),
    `<strong>${attackerCard.fullName}</strong> → <strong>${targetCard.fullName}</strong>` +
    (blockerCard
      ? t('subtitle.challengeBlocked.blockedBy', { blocker: blockerCard.fullName })
      : t('subtitle.challengeBlocked.blockedGeneric'))
  );

  /* Attempt arrow attacker → declared target. */
  const arrow = drawChallengeArrow(aEl.getBoundingClientRect(), tEl.getBoundingClientRect());
  await sleep(450);

  /* BLOCKED badge. */
  showBadge('❌ BLOCKED');
  await sleep(1400);

  /* Fade arrow and badge out. */
  arrow.classList.add('fade-out');
  setTimeout(() => arrow.remove(), 400);
  hideBadge();
  await sleep(450);

  /* Speech bubble on the declared target — Bodyguard guarding it. */
  const tRect2 = tEl.getBoundingClientRect();
  const bubble = document.createElement('div');
  bubble.className = 'dialog-bubble tail-down';
  const blockerName = blockerCard?.name || t('dialog.blockerFallback');
  bubble.innerHTML = t('dialog.bodyguardBlock', { name: blockerName });
  bubble.style.position = 'fixed';
  bubble.style.left = (tRect2.left + tRect2.width / 2 - 100) + 'px';
  bubble.style.top  = (tRect2.top - 90) + 'px';
  bubble.dataset.side    = targetSide;
  bubble.dataset.cardKey = targetKey + '-block';
  document.body.appendChild(bubble);
}

/* ============================================================
   LET IT GO (Sing) — Robin Champion exerts to sing for free.
   Effect: put chosen character (Mickey - Steamboat Pilot) into their
   player's inkwell facedown and exerted. Let It Go → self discard.
   ============================================================ */
async function playLetItGo() {
  const singerKey = 'sim_robin_champion';
  const songKey   = 'song_letitgo';
  const targetKey = 'character_mickey_pilot';
  const songCard  = CARDS[songKey];

  setSubtitle(
    `T${currentTurn} / Let It Go (Sing)`,
    t('subtitle.letItGo.body', { singer: CARDS[singerKey].name, song: songCard.fullName })
  );

  /* (1) Exert the singer. */
  const singerIdx = STATE.self.play.findIndex(p => p.card === singerKey);
  if (singerIdx < 0) return;
  const singerEl = document.getElementById('self-play').children[singerIdx];
  STATE.self.play[singerIdx].exerted = true;
  if (singerEl) singerEl.classList.add('exerted');
  await sleep(600);

  /* (2) Find Let It Go in hand and "play" it to center. */
  const handEl = document.getElementById('self-hand');
  const songHandIdx = STATE.self.hand.indexOf(songKey);
  if (songHandIdx < 0) return;
  const songHandEl = handEl.children[songHandIdx];
  const sRect = songHandEl.getBoundingClientRect();

  const handImg = songHandEl.querySelector('img');
  const aspect = (handImg && handImg.naturalWidth) ? handImg.naturalWidth / handImg.naturalHeight : 0.715;
  const baseH = sRect.height;
  const boxFromH = (cx, cy, h) => ({ left: cx - (h*aspect)/2, top: cy - h/2, width: h*aspect, height: h });
  const start  = boxFromH(sRect.left + sRect.width/2, sRect.top + sRect.height/2, baseH);
  const reveal = boxFromH(window.innerWidth / 2, window.innerHeight / 2, baseH * 1.5);

  const flyer = document.createElement('div');
  flyer.className = 'ink-add-flyer';
  flyer.style.left = start.left + 'px';
  flyer.style.top = start.top + 'px';
  flyer.style.width = start.width + 'px';
  flyer.style.height = start.height + 'px';
  flyer.innerHTML = `<div class="ink-flip-inner"><img class="ink-flip-front" src="${songCard.image}" alt="${songCard.fullName}"><div class="ink-flip-back"></div></div>`;
  document.body.appendChild(flyer);
  songHandEl.style.opacity = '0';
  void flyer.offsetHeight;

  requestAnimationFrame(() => {
    flyer.style.left = reveal.left + 'px';
    flyer.style.top = reveal.top + 'px';
    flyer.style.width = reveal.width + 'px';
    flyer.style.height = reveal.height + 'px';
  });
  await sleep(700);
  /* Hold the song at center briefly so the audience reads it. */
  await sleep(400);

  /* (3) Red arrow from the song to its target (Mickey). */
  const targetIdx = STATE.opp.play.findIndex(p => p.card === targetKey);
  if (targetIdx < 0) return;
  const targetEl = document.getElementById('opp-play').children[targetIdx];
  const tRect = targetEl.getBoundingClientRect();
  const arrow = drawChallengeArrow(
    { left: reveal.left + reveal.width/2, top: reveal.top + reveal.height/2, width: 0, height: 0 },
    tRect
  );
  await sleep(700);
  arrow.classList.add('fade-out');
  setTimeout(() => arrow.remove(), 400);

  /* (4) Target (Mickey) flies to opp inkwell. */
  const oppInkEl = document.getElementById('opp-inkwell');
  STATE.opp.inkwell.push({ exerted: true });
  STATE.opp.play.splice(targetIdx, 1);
  renderInkwell('opp', 'opp-inkwell');
  renderPlay('opp', 'opp-play');

  /* Spawn a quick flyer from where Mickey was → newly added ink slot. */
  const newInkEl = oppInkEl.lastElementChild;
  if (newInkEl) {
    newInkEl.style.opacity = '0';
    await new Promise(r => requestAnimationFrame(r));
    const inkRect = newInkEl.getBoundingClientRect();
    const mflyer = document.createElement('div');
    mflyer.className = 'play-flyer';
    mflyer.style.left = tRect.left + 'px';
    mflyer.style.top = tRect.top + 'px';
    mflyer.style.width = tRect.width + 'px';
    mflyer.style.height = tRect.height + 'px';
    mflyer.innerHTML = `<img src="${CARDS[targetKey].image}" alt="${CARDS[targetKey].fullName}">`;
    document.body.appendChild(mflyer);
    void mflyer.offsetHeight;
    requestAnimationFrame(() => {
      mflyer.style.left = inkRect.left + 'px';
      mflyer.style.top = inkRect.top + 'px';
      mflyer.style.width = inkRect.width + 'px';
      mflyer.style.height = inkRect.height + 'px';
    });
    await sleep(800);
    newInkEl.style.opacity = '1';
    mflyer.remove();
  }

  /* (5) Let It Go → self discard. Move the centered flyer there. */
  const discardEl = document.querySelector('.self-lr .discard-zone');
  if (discardEl) {
    const dRect = discardEl.getBoundingClientRect();
    requestAnimationFrame(() => {
      flyer.style.left = dRect.left + 'px';
      flyer.style.top = dRect.top + 'px';
      flyer.style.width = dRect.width + 'px';
      flyer.style.height = dRect.height + 'px';
    });
    await sleep(800);
  }
  STATE.self.hand.splice(songHandIdx, 1);
  STATE.self.discard.push(songKey);
  renderSelfHand();
  renderDiscard('self', 'self-discard');
  flyer.remove();
}

/* Banish — fly the card from its play slot into the discard pile. */
async function animateBanish(cardEl, sideKey, cardKey, playIdx) {
  if (!cardEl) return;
  const card = CARDS[cardKey];
  if (!card) return;

  /* Drop any dialog bubble that was pointing at this card — the card is leaving play. */
  document.querySelectorAll(
    `.dialog-bubble[data-side="${sideKey}"][data-card-key="${cardKey}"]`
  ).forEach(b => b.remove());

  const discardEl = document.querySelector(
    sideKey === 'opp' ? '.opp-lr .discard-zone' : '.self-lr .discard-zone'
  );
  if (!discardEl) return;

  /* Source: card's visual center + its original (pre-transform) box size, so
     applying the card's own transform reproduces its visual placement exactly. */
  const cRect = cardEl.getBoundingClientRect();
  const cxBox = cRect.left + cRect.width  / 2;
  const cyBox = cRect.top  + cRect.height / 2;
  const W = cardEl.offsetWidth  || cRect.width;
  const H = cardEl.offsetHeight || cRect.height;
  const tx = getComputedStyle(cardEl).transform;

  const dRect = discardEl.getBoundingClientRect();

  const flyer = document.createElement('div');
  flyer.className = 'play-flyer banish-flyer';
  flyer.style.left   = (cxBox - W / 2) + 'px';
  flyer.style.top    = (cyBox - H / 2) + 'px';
  flyer.style.width  = W + 'px';
  flyer.style.height = H + 'px';
  flyer.style.transform = tx;
  flyer.innerHTML = `<img src="${card.image}" alt="${card.fullName}">`;
  document.body.appendChild(flyer);

  /* Hide source card while flyer is mid-flight. */
  cardEl.style.opacity = '0';

  void flyer.offsetHeight;

  /* Slide + un-rotate into the discard slot. */
  requestAnimationFrame(() => {
    flyer.style.left      = dRect.left + 'px';
    flyer.style.top       = dRect.top  + 'px';
    flyer.style.width     = dRect.width  + 'px';
    flyer.style.height    = dRect.height + 'px';
    flyer.style.transform = 'rotate(0deg)';
  });

  await sleep(870);

  /* Commit state + render the discard, then drop the flyer. */
  STATE[sideKey].discard.push(cardKey);
  STATE[sideKey].play.splice(playIdx, 1);
  renderPlay(sideKey, sideKey === 'opp' ? 'opp-play' : 'self-play');
  renderDiscard(sideKey, sideKey === 'opp' ? 'opp-discard' : 'self-discard');

  flyer.remove();
}

/* ============================================================
   PLAY CARD — Send a card from hand to a play slot, paying ink cost.
   - sideKey: 'self' (source = hand-card) | 'opp' (source = above viewport)
   - cardKey: which card to play
   - options.exerted: enter exerted (e.g., Rajah played via Pluto's ability)
   - options.costOverride: ink to exert (e.g., Pluto effect reduces by 1)
   ============================================================ */
async function playCard(sideKey, cardKey, options = {}) {
  const card = CARDS[cardKey];
  if (!card) return;

  const cost = options.costOverride !== undefined ? options.costOverride : (card.cost || 0);
  const startExerted = !!options.exerted;
  const playerLabel  = sideKey === 'self' ? 'Player A' : 'Player B';

  setSubtitle(
    t('subtitle.cardPlay.step', { turn: currentTurn, player: playerLabel }),
    t('subtitle.cardPlay.bodyEnter', { cardName: card.fullName })
      + (startExerted ? ' (Exerted)' : '')
      + (cost > 0 ? t('subtitle.cardPlay.costPart', { cost }) : t('subtitle.cardPlay.dot'))
  );

  /* 1) Pay ink cost (stagger exert). */
  if (cost > 0) {
    await exertReadyInk(sideKey, cost);
    await sleep(350);
  }

  const playElId = sideKey === 'opp' ? 'opp-play' : 'self-play';
  const playEl   = document.getElementById(playElId);
  if (!playEl) return;

  /* 2) Source rect (hand-card for self, off-screen top center for opp). */
  let sRect;
  let sourceEl = null;
  if (sideKey === 'self') {
    const handEl = document.getElementById('self-hand');
    if (!handEl) return;
    const handIdx = STATE.self.hand.indexOf(cardKey);
    if (handIdx < 0) return;
    sourceEl = handEl.children[handIdx];
    if (!sourceEl) return;
    sRect = sourceEl.getBoundingClientRect();
  } else {
    const root = getComputedStyle(document.documentElement);
    const playCardW = parseFloat(root.getPropertyValue('--card-w')) || 182;
    const playCardH = parseFloat(root.getPropertyValue('--card-h')) || 253;
    sRect = {
      left:   window.innerWidth / 2 - playCardW / 2,
      top:    -(playCardH + 40),
      width:  playCardW,
      height: playCardH,
    };
  }

  /* 3) Push to STATE.play + render so the target slot exists (hidden). */
  STATE[sideKey].play.push({ card: cardKey, exerted: startExerted, damage: 0 });
  renderPlay(sideKey, playElId);
  const incomingEl = playEl.lastElementChild;
  if (!incomingEl) return;
  incomingEl.style.opacity = '0';

  await new Promise(r => requestAnimationFrame(r));
  const tRect = incomingEl.getBoundingClientRect();
  const W = incomingEl.offsetWidth  || tRect.width;
  const H = incomingEl.offsetHeight || tRect.height;

  /* 4) Hide source hand card if self. */
  if (sourceEl) sourceEl.style.opacity = '0';

  /* 5) Build flyer; transition to target slot center.
        startExerted 시 처음부터 90도 회전 상태로 fly (Rajah Bodyguard 같은 케이스). */
  const flyer = document.createElement('div');
  flyer.className = 'play-flyer';
  flyer.style.left   = sRect.left + 'px';
  flyer.style.top    = sRect.top  + 'px';
  flyer.style.width  = sRect.width  + 'px';
  flyer.style.height = sRect.height + 'px';
  if (startExerted) flyer.style.transform = 'rotate(90deg)';
  flyer.innerHTML = `<img src="${card.image}" alt="${card.fullName}">`;
  document.body.appendChild(flyer);

  void flyer.offsetHeight;

  requestAnimationFrame(() => {
    const cx = tRect.left + tRect.width  / 2;
    const cy = tRect.top  + tRect.height / 2;
    flyer.style.left   = (cx - W / 2) + 'px';
    flyer.style.top    = (cy - H / 2) + 'px';
    flyer.style.width  = W + 'px';
    flyer.style.height = H + 'px';
    /* startExerted 시 transform 유지 (회전 풀리지 않도록 명시 설정) */
    if (startExerted) flyer.style.transform = 'rotate(90deg)';
  });

  await sleep(870);

  /* 6) Self removes the card from hand. */
  if (sideKey === 'self') {
    const handIdx = STATE.self.hand.indexOf(cardKey);
    if (handIdx >= 0) STATE.self.hand.splice(handIdx, 1);
    renderSelfHand();
  }

  /* 7) Reveal target + remove flyer. */
  incomingEl.style.opacity = '1';
  flyer.remove();

  /* Scenario hook: when Robin Beloved enters for the first time on T1,
     leave an "ink not dry yet" speech bubble until your next begin phase. */
  if (sideKey === 'self' && cardKey === 'sim_robin_beloved'
      && !DIALOGS.some(d => d.cardKey === 'sim_robin_beloved' && d.tag === 'ink-not-dry')) {
    DIALOGS.push({
      side: 'self', cardKey: 'sim_robin_beloved', tag: 'ink-not-dry',
      text: t('dialog.inkNotDry'),
      tail: 'tail-up',
      offset: { x: -10, y: 240 },
      placement: 'below',
    });
    applyToggles();
  }
  /* Scenario hook: Rajah entered exerted via Bodyguard. */
  if (sideKey === 'opp' && cardKey === 'sim_rajah' && startExerted
      && !DIALOGS.some(d => d.cardKey === 'sim_rajah' && d.tag === 'bodyguard-exerted')) {
    DIALOGS.push({
      side: 'opp', cardKey: 'sim_rajah', tag: 'bodyguard-exerted',
      text: t('dialog.bodyguardExerted'),
      tail: 'tail-down',
      offset: { x: -10, y: -55 },
    });
    applyToggles();
  }
}

/* ============================================================
   SHIFT PLAY — Robin Hood (Beloved Outlaw) → Robin Hood (Champion of Sherwood)
   Pays 3 ink (Champion's shift cost), stacks on the existing Beloved Outlaw.
   Sequence: (1) stagger-exert 3 ink → (2) 500ms breath → (3) fly hand→play.
   ============================================================ */
async function playShiftRobin() {
  const handEl = document.getElementById('self-hand');
  const playEl = document.getElementById('self-play');
  if (!handEl || !playEl) return;

  /* Source: first 'sim_robin_champion' in hand. */
  const handIdx = STATE.self.hand.indexOf('sim_robin_champion');
  if (handIdx < 0) return;
  const handCardEl = handEl.children[handIdx];
  if (!handCardEl) return;

  /* Target: 'sim_robin_beloved' currently in play. */
  const playIdx = STATE.self.play.findIndex(p => p.card === 'sim_robin_beloved');
  if (playIdx < 0) return;
  const targetCardEl = playEl.children[playIdx];
  if (!targetCardEl) return;

  /* Cost check: 3 ready ink. */
  const readyInkCount = STATE.self.inkwell.filter(i => !i.exerted).length;
  if (readyInkCount < 3) return;

  /* Capture positions BEFORE anything moves (ink rotate doesn't shift layout, but be safe). */
  const sRect = handCardEl.getBoundingClientRect();
  const tRect = targetCardEl.getBoundingClientRect();

  /* (1) Stagger-exert 3 ink, left → right cascade. */
  await exertReadyInk('self', 3);

  /* (2) Brief pause so the eye registers the payment before the play. */
  await sleep(500);

  /* (3) Build flyer at the hand-card's slot and launch it toward the play slot. */
  const card = CARDS['sim_robin_champion'];
  const flyer = document.createElement('div');
  flyer.className = 'play-flyer';
  flyer.style.left   = sRect.left + 'px';
  flyer.style.top    = sRect.top  + 'px';
  flyer.style.width  = sRect.width  + 'px';
  flyer.style.height = sRect.height + 'px';
  flyer.innerHTML = `<img src="${card.image}" alt="${card.fullName}">`;
  document.body.appendChild(flyer);

  /* Hide the source hand-card while flyer is in flight. */
  handCardEl.style.opacity = '0';

  /* Force reflow so initial position locks in before transition. */
  void flyer.offsetHeight;

  requestAnimationFrame(() => {
    flyer.style.left   = tRect.left + 'px';
    flyer.style.top    = tRect.top  + 'px';
    flyer.style.width  = tRect.width  + 'px';
    flyer.style.height = tRect.height + 'px';
  });

  await sleep(870);

  /* Commit STATE: remove from hand, replace play slot with shifted entry. */
  STATE.self.hand.splice(handIdx, 1);
  STATE.self.play[playIdx] = {
    card: 'sim_robin_champion',
    exerted: false,
    damage: 0,
    shiftedFrom: 'sim_robin_beloved',
  };

  /* Re-render hand and play (NOT inkwell — its DOM already carries .exerted). */
  renderSelfHand();
  renderPlay('self', 'self-play');

  flyer.remove();
}

/* ----- Init ----- */
renderSide('opp');
renderSide('self');
renderSelfHand();

/* Apply initial subtitle/dialog visibility (subtitle on by default). */
setTimeout(applyToggles, 50);

/* Re-render bubbles on resize so they track moved cards. */
window.addEventListener('resize', () => {
  if (document.getElementById('toggle-dialog')?.checked) renderDialogs(true);
  /* Also rebuild the intro page in case its layout depends on viewport. */
  if (PAGES[currentPage]?.type === 'intro') showOverlay(PAGES[currentPage]);
});

/* Enter page 1 (title overlay). */
(async () => { await showOverlay(PAGES[currentPage]); updatePageUI(); })();

console.log('%cLorcana 101 — presentation deck loaded', 'color: #f5c84b; font-weight: bold;');
