/* ============================================================
   Disney Lorcana 101 — Slide app
   - Reveal.js initialization
   - Card image injection
   - Anatomy hotspot interaction
   - Challenge simulator
   ============================================================ */

const CARDS = window.LORCANA_CARDS || {};

/* ---------- Reveal.js init ---------- */

Reveal.initialize({
  hash: false,
  controls: true,
  progress: true,
  slideNumber: 'c/t',
  transition: 'slide',
  transitionSpeed: 'fast',
  width: 1400,
  height: 900,
  margin: 0.04,
  minScale: 0.2,
  maxScale: 2.0,
  center: true,
});

/* ---------- Inject card images for [data-card-key] slots ---------- */

document.querySelectorAll('[data-card-key]').forEach(el => {
  const key = el.getAttribute('data-card-key');
  const card = CARDS[key];
  if (!card) {
    el.innerHTML = `<div style="color:#888;font-size:0.8em;text-align:center;padding:1em;">[card "${key}" not found]</div>`;
    return;
  }
  const img = document.createElement('img');
  img.src = card.image;
  img.alt = card.fullName;
  img.loading = 'lazy';
  el.innerHTML = '';
  el.appendChild(img);
});

/* ---------- Anatomy hotspots ----------
   Coordinates are percentages of the card image.
   Standard Lorcana card layout:
   - Cost hex at top-left, with optional inkwell frame
   - Name/version under the top art
   - Ink-type band right after name
   - Subtypes line above ability box
   - Ability box in lower-middle
   - Strength/Willpower at bottom-left
   - Lore at bottom-right
*/

// Coordinates calibrated against the standard Lorcana character card layout
// (Headless Horseman art on top half; name/stats/abilities on bottom half).
const ANATOMY_REGIONS = [
  {
    num: 1, name: 'Cost (잉크 비용)',
    rect: { top: 3, left: 4, width: 14, height: 10 },
    desc: '이 카드를 플레이하려면 잉크웰에서 <strong>이만큼의 잉크</strong>를 Exert해야 한다.'
  },
  {
    num: 2, name: 'Inkwell Icon (잉크화 가능 여부)',
    rect: { top: 1, left: 2, width: 18, height: 13 },
    desc: '코스트 둘레의 <strong>장식 테두리</strong>가 있으면 이 카드를 잉크로 만들 수 있다. 없으면 못 만든다.'
  },
  {
    num: 3, name: 'Name & Version (이름/버전명)',
    rect: { top: 52, left: 5, width: 60, height: 7 },
    desc: '같은 이름의 다른 버전은 각각 별개 카드로 취급한다. 덱 4장 제한도 이름+버전 단위.'
  },
  {
    num: 4, name: 'Ink Type (잉크 색)',
    rect: { top: 59, left: 5, width: 90, height: 3 },
    desc: '카드 이름 뒤의 색상 띠와 아이콘이 잉크 색을 나타낸다. 덱은 <strong>최대 2색</strong>까지.'
  },
  {
    num: 5, name: 'Classifications (분류)',
    rect: { top: 64, left: 15, width: 70, height: 4 },
    desc: 'Storyborn / Dreamborn / Floodborn 같은 분류. 일부 카드 효과가 분류를 참조한다.'
  },
  {
    num: 6, name: 'Abilities (능력 텍스트)',
    rect: { top: 69, left: 5, width: 80, height: 24 },
    desc: '카드의 특수 효과. <strong>키워드</strong>(굵게)와 스토리 능력이 있다. <em>카드 텍스트는 룰을 덮어쓴다.</em>'
  },
  {
    num: 7, name: 'Strength {S}',
    rect: { top: 56, left: 66, width: 12, height: 8 },
    desc: '챌린지 시 상대에게 입히는 데미지 양.'
  },
  {
    num: 8, name: 'Willpower {W}',
    rect: { top: 56, left: 79, width: 12, height: 8 },
    desc: '체력. 누적 데미지가 이 값에 도달하면 <strong>Banish</strong>(추방)되어 묘지로.'
  },
  {
    num: 9, name: 'Lore Value {L}',
    rect: { top: 86, left: 86, width: 11, height: 8 },
    desc: '캐릭터: 퀘스트 시 획득하는 로어. 장소: 매 턴 시작에 자동 획득.'
  },
];

function setupAnatomy() {
  const container = document.getElementById('anatomy-container');
  if (!container) return;
  const card = CARDS['challenge_horseman'] || CARDS['character_mickey'];
  if (!card) return;

  container.innerHTML = `
    <div class="anatomy-card">
      <img src="${card.image}" alt="${card.fullName}">
      ${ANATOMY_REGIONS.map(r => `
        <div class="anatomy-hotspot" data-num="${r.num}"
             title="${r.name}"
             style="top:${r.rect.top}%; left:${r.rect.left}%; width:${r.rect.width}%; height:${r.rect.height}%;"></div>
      `).join('')}
    </div>
    <div class="anatomy-info" id="anatomy-info">
      <p class="anatomy-default">→ 카드의 빛나는 영역에 마우스를 올리면<br>각 부분의 의미가 여기에 표시됩니다.</p>
    </div>
  `;

  const info = container.querySelector('#anatomy-info');
  const spots = container.querySelectorAll('.anatomy-hotspot');

  function show(spot) {
    spots.forEach(s => s.classList.remove('active'));
    spot.classList.add('active');
    const num = parseInt(spot.getAttribute('data-num'));
    const region = ANATOMY_REGIONS.find(r => r.num === num);
    info.innerHTML = `
      <h3><span class="anatomy-num">${region.num}</span>${region.name}</h3>
      <p>${region.desc}</p>
    `;
  }

  spots.forEach(spot => {
    spot.addEventListener('mouseenter', () => show(spot));
    spot.addEventListener('click', () => show(spot));
  });
}

setupAnatomy();

/* ---------- Challenge simulator ----------
   Uses Headless Horseman vs Rapunzel — the actual cards from
   the official starter-deck rulebook's challenge example.
*/

function setupChallengeSim() {
  const root = document.getElementById('challenge-sim');
  if (!root) return;

  const attacker = CARDS['challenge_horseman'];
  const defender = CARDS['challenge_rapunzel'];
  if (!attacker || !defender) {
    root.innerHTML = '<p style="color:#888">[챌린지 시뮬레이션 카드 데이터를 찾을 수 없습니다]</p>';
    return;
  }

  let state, logLines;
  function reset() {
    state = {
      attacker: { card: attacker, damage: 0, banished: false },
      defender: { card: defender, damage: 0, banished: false },
      step: 0,
    };
    logLines = [];
    render();
  }

  function statBlock(side) {
    const c = state[side].card;
    const d = state[side];
    return `
      <div class="combatant" data-side="${side}">
        <p class="caption"><strong>${c.name}</strong><br>${c.version}</p>
        <div class="mini-card ${d.banished ? 'banished' : ''}">
          <img src="${c.image}" alt="${c.fullName}">
          <div class="damage-overlay ${d.damage > 0 ? 'visible' : ''}">${d.damage}</div>
        </div>
        <div class="stats">
          <span class="stat">⚔ <strong>${c.strength}</strong></span>
          <span class="stat">❤ <strong>${c.willpower}</strong></span>
          <span class="stat">⭐ <strong>${c.lore}</strong></span>
        </div>
      </div>
    `;
  }

  function nextLabel() {
    if (state.step === 0) return '▶ 시작 — 챌린지 선언';
    if (state.step === 1) return '동시에 데미지 입힘';
    if (state.step === 2) return '결과 판정';
    return '✓ 종료';
  }

  function render() {
    root.innerHTML = `
      <div class="challenge-arena">
        ${statBlock('attacker')}
        <div class="vs">VS</div>
        ${statBlock('defender')}
      </div>
      <div class="challenge-controls">
        <button id="sim-step" ${state.step >= 3 ? 'disabled' : ''}>${nextLabel()}</button>
        <button id="sim-reset">↺ 리셋</button>
      </div>
      <div class="challenge-log" id="sim-log">${logLines.join('')}</div>
    `;
    root.querySelector('#sim-step').addEventListener('click', step);
    root.querySelector('#sim-reset').addEventListener('click', reset);
  }

  function pushLog(line, cls='') {
    logLines.push(`<div class="log-line ${cls}">${line}</div>`);
  }

  function step() {
    const A = state.attacker, D = state.defender;
    state.step++;
    if (state.step === 1) {
      pushLog(`🎯 <strong>${A.card.name}</strong>이(가) Exerted 상태인 <strong>${D.card.name}</strong>을(를) 챌린지!`);
    } else if (state.step === 2) {
      A.damage += D.card.strength;
      D.damage += A.card.strength;
      pushLog(`⚔️ 동시 데미지 — ${A.card.name}이(가) ${A.card.strength} 데미지를 ${D.card.name}에게, ${D.card.name}이(가) ${D.card.strength} 데미지를 ${A.card.name}에게.`, 'dmg');
    } else if (state.step === 3) {
      if (A.damage >= A.card.willpower) {
        A.banished = true;
        pushLog(`💀 <strong>${A.card.name}</strong>: 데미지 ${A.damage} ≥ Willpower ${A.card.willpower} → <strong>Banished</strong>!`, 'banish');
      } else {
        pushLog(`🩸 ${A.card.name}: 데미지 ${A.damage} / Willpower ${A.card.willpower} → 생존 (데미지 누적)`);
      }
      if (D.damage >= D.card.willpower) {
        D.banished = true;
        pushLog(`💀 <strong>${D.card.name}</strong>: 데미지 ${D.damage} ≥ Willpower ${D.card.willpower} → <strong>Banished</strong>!`, 'banish');
      } else {
        pushLog(`🩸 ${D.card.name}: 데미지 ${D.damage} / Willpower ${D.card.willpower} → 생존`);
      }
      if (A.banished && !D.banished) pushLog(`🏆 <strong>${D.card.name}</strong>이(가) 챌린지에서 살아남았다.`, 'win');
      else if (D.banished && !A.banished) pushLog(`🏆 <strong>${A.card.name}</strong>이(가) 챌린지에서 살아남았다.`, 'win');
      else if (A.banished && D.banished) pushLog(`💀💀 양측 모두 Banished — 함께 묘지로.`, 'banish');
    }
    render();
  }

  reset();
}

setupChallengeSim();

console.log('%cLorcana 101 슬라이드 로드 완료', 'color:#f5c84b;font-weight:bold;');
console.log('카드 데이터:', Object.keys(CARDS).length, '장');
