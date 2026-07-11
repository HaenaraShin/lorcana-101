/* 한국어 카탈로그 — 기존 하드코딩 문자열의 원본(정본). 언어 간 공유하지 않음.
 * 각 값은 마크업 포함 완성문. {x} 는 카드 데이터·수치 placeholder(t 에서 치환).
 * 구조(div/grid/img)는 demo-board.js 에 유지하고, 여기엔 텍스트 잎만 둔다. */
window.MESSAGES = window.MESSAGES || {};
window.MESSAGES.ko = {

  /* ── renderIntroHTML: kind 별 텍스트 잎 ── */
  intro: {
    title: {
      desc: '디즈니 로카나 플레이방법을 배워봅시다!',
      next: '다음',
      prev: '이전',
    },
    world: {
      title: '디즈니 로카나의 세계',
      p1: '디즈니 로카나는 <strong>마법의 잉크</strong>로 나만의 이야기를 완성해가는 전략 카드 게임입니다.',
      p2: '마법 잉크를 다루는 <strong>일루미니어</strong>가 되어 디즈니 세계의 영웅들과 함께 스릴 넘치는 도전과 모험을 경험하세요.',
      p3: '그리고 이야기 조각을 모아 <strong>승리</strong>하세요!',
    },
    'ink-colors': {
      title: '6가지 잉크 컬러',
      amber: '회복 + 노래',
      amethyst: '마법 + 조작',
      emerald: '트릭 + 교란',
      ruby: '전투 + 제거',
      sapphire: '지식 + 축적',
      steel: '저항 + 공격',
      tagline: '특성을 살리고 조합하여<br>나만의 덱을 구축하자!',
    },
    'card-anatomy': {
      notFound: '카드를 찾을 수 없습니다.',
      cost: '<strong>잉크 비용</strong><br>이 카드를 플레이하는 데 필요한 잉크 수<br>— 이 카드는 <strong>{cost}</strong>',
      nameVersion:
        '\n          <strong>이름 · <em>{name}</em></strong><br>\n' +
        '          <small>같은 이름+버전은 한 덱에 4장까지</small><br>\n' +
        '          <strong>버전 · <em>"{version}"</em></strong><br>\n' +
        '          <small>같은 캐릭터의 다른 모습/스탯</small>\n        ',
      stats:
        '\n          <strong>힘 ¤ {strength}</strong> <small>챌린지 시 주는 데미지</small><br>\n' +
        '          <strong>의지력 ⛉ {willpower}</strong> <small>받을 수 있는 데미지 한계 (이상이면 banish)</small>\n        ',
      lore: '<strong>로어 ◆ {lore}</strong><br>이 캐릭터로 퀘스트할 때 얻는 Lore 점수',
    },
    'ink-rules': {
      title: '잉크 추가',
      inkable: '잉크 가능',
      uninkable: '잉크 불가능',
      p1: '<strong class="hl">한 턴에 한 번</strong>, 잉크 가능한 카드를 뒷면으로 잉크웰에 놓을 수 있습니다.',
      p2: '이때 상대에게 <strong>잉크 가능한 카드임을 확인</strong>시켜주어야 합니다.',
      p3: '자신의 턴 중이라면 <strong>언제든</strong> 넣을 수 있습니다.',
    },
    'challenge-brief': {
      title: '챌린지',
      attackerLabel: '공격자 — Exert',
      defenderLabel: '방어자',
      desc:
        '\n          자신의 <strong>Ready</strong> 상태인 캐릭터를 <strong>Exert</strong>하여 상대 캐릭터에게 챌린지를 선언합니다.<br>\n' +
        '          서로의 <strong>공격력(¤)</strong>만큼 데미지를 주고받고, 받은 데미지가 <strong>의지력(⛉)</strong> 이상이 되면 <strong class="hl">banish</strong>됩니다.<br>\n' +
        '          상대의 <strong>Ready</strong> 상태 캐릭터는 챌린지 대상이 될 수 없습니다.\n        ',
    },
    'action-brief': {
      title: '액션 (Action)',
      desc:
        '\n          <strong>액션</strong> 카드는 잉크 비용을 지불해 즉발적인 효과를 발동시키고\n' +
        '          곧바로 <strong>discard</strong>로 들어가는 강력한 카드입니다.<br>\n' +
        '          <strong>Song(노래)</strong>은 액션의 한 종류이지만 캐릭터가 부르는 것으로\n' +
        '          <strong class="hl">잉크를 지불하지 않고</strong> 발동할 수 있습니다.\n        ',
    },
    'item-brief': {
      title: '아이템 (Item)',
      desc:
        '\n          <strong>아이템</strong>은 Play Area에 남아 <strong>영속적인 효과나 어빌리티</strong>를 제공합니다.<br>\n' +
        '          캐릭터와 달리 <strong class="hl">잉크가 마르기를 기다릴 필요 없이</strong>,\n' +
        '          플레이한 턴부터 효과·어빌리티를 곧바로 사용할 수 있습니다.\n        ',
    },
    'location-brief': {
      title: '로케이션 (Location)',
      desc:
        '\n          <strong>로케이션</strong>은 잉크 비용을 지불해 플레이합니다.\n' +
        '          이후 캐릭터가 좌측의 <strong>이동 비용(Move Cost)</strong>을 지불하면\n' +
        '          그 로케이션으로 이동해 효과를 적용받습니다.<br>\n' +
        '          로케이션 자체도 <strong>챌린지의 대상</strong>이 될 수 있고,\n' +
        '          받은 데미지가 의지력(⛉) 이상이면 <strong class="hl">banish</strong>됩니다.<br>\n' +
        '          자신의 비기닝 페이즈 <strong>SET</strong> 단계에 로케이션 위에 표시된\n' +
        '          <strong>로어(◆)</strong>만큼 자동으로 Lore를 얻습니다.\n        ',
    },
    'finale-excuse': {
      title: '여러 턴 뒤 —',
      sub: 'Player A의 <strong>마지막 턴</strong>.',
    },
    'victory-rule': {
      title: '승리 조건',
      headline: '\n          먼저 <strong class="hl">Lore 20점</strong>을 모은 플레이어가 <strong>승리</strong>합니다.\n        ',
      bullet1: '캐릭터로 <strong>퀘스트</strong>하면 그 캐릭터의 <strong>◆</strong> 만큼 Lore 획득',
      bullet2: '자신의 비기닝 페이즈 SET 단계에 <strong>로케이션</strong>의 ◆ 만큼 자동 획득',
      bullet3: '일부 카드 <strong>효과</strong>로 추가 Lore 획득 (예: Robin Hood — Champion 챌린지 +2)',
    },
    'deck-brief': {
      title: '덱 구성',
      bullet1: '덱은 <strong>최대 2개</strong>의 잉크 색을 조합해 짤 수 있습니다.',
      bullet2: '덱은 <strong class="hl">최소 60장</strong>이어야 합니다.',
      bullet3: '같은 <strong>이름 + 같은 버전</strong>의 카드는 한 덱에 <strong>최대 4장</strong>까지.',
      desc:
        '\n          잉크 색의 성격을 살리고, 캐릭터·아이템·노래·로케이션을 균형 있게 섞어<br>\n' +
        '          <strong>나만의 덱</strong>을 만들어 보세요.\n        ',
    },
    thanks: {
      title: '감사합니다.',
      sub: 'Disney Lorcana의 세계로 오신 걸 환영해요',
    },
    'sing-brief': {
      title: 'Sing (노래 부르기)',
      normalLabel: '일반 플레이 — 비용 <strong>{cost}</strong>',
      singLabel: '<strong>Sing</strong> — 비용 ⓘ <strong>0</strong> 잉크',
      singSub: '캐릭터를 <strong>Exert</strong>합니다.',
      desc:
        '\n          <strong>Song(노래)</strong> 카드는 그 노래의 비용 이상의 캐릭터를 <strong>Exert</strong>하는 것으로<br>\n' +
        '          잉크를 지불하지 않고 <strong class="hl">"부를(Sing)"</strong> 수 있습니다.<br>\n' +
        '          노래는 효과가 발동된 뒤 <strong>discard</strong>로 이동합니다.\n        ',
    },
    'shift-brief': {
      title: '시프트',
      normalLabel: '일반 플레이 — 비용 <strong>5</strong>',
      shiftLabel: '<strong>Shift</strong> 플레이 — 비용 <strong>3</strong>',
      desc:
        '\n          <strong>Shift</strong> 능력이 있다면 같은 이름의 캐릭터 위에 더 적은 잉크를 지불하고 낼 수도 있습니다.<br>\n' +
        '          시프트를 하면 캐릭터가 변화한 것으로 취급하여 원래 있던 <strong class="hl">캐릭터의 데미지, 잉크마름 상태까지도 전부 유지</strong>됩니다.\n        ',
    },
    'quest-brief': {
      title: '퀘스트',
      desc:
        '\n          잉크가 마른 캐릭터를 <strong>Exert</strong>하는 것으로 <strong>퀘스트</strong>를 선언할 수 있습니다.<br>\n' +
        '          퀘스트를 하면 플레이어의 로어 카운트가 캐릭터의 로어 밸류만큼 오릅니다.<br><br>\n' +
        '          <strong class="hl">이 로어 카운트가 20이 되면 게임에서 승리합니다.</strong>\n        ',
    },
    'cost-exert': {
      title: '잉크 비용 지불',
      desc: '카드를 플레이하려면, 그 카드의 <strong>잉크 비용</strong>만큼 자신의 잉크를 <strong>Exert</strong>합니다.<br>이렇게 잉크를 지불하고 카드를 보드에 내는 행위를 <strong>\'play\'</strong>한다고 표현합니다.',
      costLabel: '비용 <strong>{cost}</strong>',
    },
    'begin-brief': {
      title: '비기닝 페이즈',
      sub: '내 턴이 시작될 때 진행하는 <strong>READY → SET → DRAW</strong> 3단계',
      readyText: '내 모든 <strong>캐릭터와 잉크</strong>를<br>Ready(세로) 상태로 복귀',
      readyTagChar: '캐릭터',
      readyTagInk: '잉크',
      readyNote:
        '\n              <strong>Exert(가로)</strong> 상태의 플레이 중인 카드와 잉크를<br>\n' +
        '              모두 <strong>Ready(세로)</strong> 상태로 되돌립니다\n            ',
      setText: '"<strong>턴이 시작될 때</strong>" 발동하는<br>효과들이 처리됩니다',
      setCaption: '예: <em>Jack-Jack Parr — Incredible Potential</em><br>"<strong>At the start of your turn,</strong> you may put the top card of your deck into your discard..."',
      drawText: '덱에서 카드 <strong>1장</strong>을<br>핸드로 드로우합니다',
      drawNote:
        '\n              단, <strong>선공의 첫 턴</strong>에는 드로우하지 않고<br>\n' +
        '              <strong>후공의 첫 턴부터</strong> 드로우를 진행합니다\n            ',
    },
    'ready-exert': {
      readyLabel: '<strong>Ready (준비)</strong><br>세로 — 행동 가능',
      exertedLabel: '<strong>Exerted (사용 후)</strong><br>가로 — 행동 완료',
      desc:
        '\n          잉크를 지불하거나, 퀘스트·챌린지·노래 등 행동을 하면 카드를 <strong>Exert</strong>(가로) 합니다.<br>\n' +
        '          자신의 비기닝 페이즈에 다시 <strong>Ready</strong>(세로) 상태로 돌아옵니다.\n        ',
    },
  },

  /* ── PAGES 의 transition 타이틀/설명 (id 기준) ── */
  page: {
    'p6-transition': {
      title: '그럼 실제로 게임을<br>진행하면서 배워볼까요?',
      description: '',
    },
    'p7-game-start': {
      title: '게임 시작!',
      description: '이제 게임을 시작해볼까요?<br>가위바위보나 주사위를 던져 이긴 사람이 선/후공을 정합니다.<br><br>설명을 위해 <strong>나의 선공</strong>으로 게임을 시작해봅시다.',
    },
    'p8-mulligan-brief': {
      title: '멀리건',
      description:
        '초기 핸드 7장을 받은 뒤, 게임 시작 전 <strong class="hl">단 1회</strong>에 한해 마음에 들지 않는 카드를 골라 <strong>덱 밑으로 되돌릴 수</strong> 있습니다.<br>\n' +
        '되돌린 만큼 다시 7장이 되도록 <strong>새 카드를 드로우</strong>합니다.<br>\n' +
        '이후 덱을 잘 <strong>셔플</strong>하여 게임을 시작합니다.<br><br>\n' +
        '초반 잉크 카드와 핵심 캐릭터의 균형을 잡는 중요한 결정입니다.',
    },
  },

  /* PAGES[].label / CHAPTERS[].label 은 KO 를 소스로 그대로 두고 t(...,fallback) 로 소비.
   * → ko 에는 엔트리 없음(빈 객체). en.js 가 override. */
  pageLabel: {},
  chapter: {},

  /* setSubtitle 호출부 — step/body. {turn}{name}{player}{cardName}{lore}... placeholder */
  subtitle: {
    turnStartT1: {
      step: 'T1 / {name}의 턴 시작',
      body: '선공은 첫 턴의 <strong>비기닝 페이즈를 건너뜁니다</strong> (드로우 없음). 곧바로 메인 페이즈로 진입합니다.',
    },
    beginPhase: {
      step: 'T{turn} / {name}의 비기닝 페이즈',
      body: 'READY → SET → DRAW 순으로 진행됩니다.',
    },
    boardIntro: {
      step: '보드 소개',
      body: '로카나에서는 영역이 정확히 나뉘거나 자리가 정해져 있지 않습니다. 각자 편한 대로 배치하셔도 됩니다.',
    },
    gameStart: {
      step: '게임 시작',
      body: '주사위로 선·후공을 정한 뒤 각자 <strong>7장</strong>의 초기 핸드를 받습니다.',
    },
    mulligan: {
      step: '멀리건',
      body: '맘에 들지 않는 카드 <strong>4장</strong>을 덱 밑으로 되돌리고, 같은 수만큼 새로 드로우합니다.',
    },
    inkAdd: {
      step: 'T{turn} / {player}의 잉크 추가',
      bodyOpp: ' — 잉크 가능 카드를 공개합니다.',
      bodySelf: '을(를) 잉크로 사용합니다.',
    },
    challenge: {
      step: 'T{turn} / 챌린지',
    },
    mulanEffect: {
      step: 'T{turn} / Mulan의 효과',
      body: '덱에서 1장 드로우 → 핸드에서 1장 디스카드',
    },
    develop: {
      body: '덱에서 카드 <strong>2장</strong>을 보고 <strong>1장</strong>은 핸드로, 나머지는 덱 바닥으로.',
    },
    pluto: {
      step: 'T{turn} / Pluto의 능력',
      body: '<strong>Pluto</strong>를 Exert → 다음 캐릭터의 잉크 비용 <strong>-1</strong>.',
    },
    quest: {
      step: 'T{turn} / {player}의 퀘스트',
      body: '<strong>{cardName}</strong> 퀘스트 → <strong>+{lore} Lore</strong>',
    },
    finaleJump: {
      step: '마지막 턴',
      body: '여러 턴이 지나 — Player A의 <strong>마지막 턴</strong>입니다.',
    },
    victory: {
      step: '승리!',
      body: 'Player A 가 <strong>Lore 20</strong>에 도달해 게임을 승리했습니다.',
    },
    challengeBlocked: {
      step: 'T{turn} / 챌린지 실패',
      blockedBy: ' &nbsp;&nbsp; ❌ <strong>{blocker}</strong>의 <em>Bodyguard</em>로 막혀 챌린지 대상이 될 수 없습니다.',
      blockedGeneric: ' &nbsp;&nbsp; ❌ 챌린지 대상이 될 수 없습니다.',
    },
    letItGo: {
      body: '<strong>{singer}</strong>을 <strong>Exert</strong>하여 <strong>{song}</strong>를 부릅니다.',
    },
    cardPlay: {
      step: 'T{turn} / {player}의 카드 플레이',
      bodyEnter: '<strong>{cardName}</strong> 등장',
      costPart: ' — 비용 {cost} 잉크.',
      dot: '.',
    },
  },

  /* DIALOGS[].text / 직접 innerHTML 말풍선 */
  dialog: {
    inkDried: '한 턴이 지나 잉크가 말라서<br>이제 퀘스트할 수 있어요!',
    firstTurnNoDraw: '<strong>선공의 첫 턴</strong>은<br>드로우를 생략합니다',
    readyUntargetable: '<strong>Ready</strong> 상태이므로<br>챌린지의 대상이 되지 않습니다',
    zoneDeck: '<strong>Deck</strong> — 카드를 뽑는 곳',
    zoneDiscard: '<strong>Discard</strong> — 버린 카드 더미',
    zonePlay: '<strong>Play Area</strong> — 플레이 중인 캐릭터·아이템·장소',
    zoneInkwell: '<strong>Inkwell</strong> — 잉크로 사용 중인 카드',
    gameStartBubble: '먼저 시작하겠습니다!',
    robinHood: '<strong>Robin Hood의 고유효과:</strong><br>챌린지로 적을 무너뜨릴 때마다<br><strong>+2 Lore</strong>를 얻어요!',
    mulanEntrance: '뮬란의 등장 효과 발동!<br>덱에서 <strong>1장 드로우</strong>한 뒤<br>핸드에서 <strong>1장을 버립니다</strong>',
    actionDiscard: '<strong>Action</strong> 카드는 발동 후<br>바로 <strong>discard</strong> 로 갑니다',
    plutoBubble: '<strong>Pluto의 고유효과:</strong><br><strong>−1 잉크!</strong> 다음 캐릭터',
    bodyguardBlock: '<strong>Bodyguard</strong>인<br>{name}이(가)<br>지켜주고 있어요.',
    blockerFallback: '캐릭터',
    inkNotDry: '플레이한 턴엔 잉크가 안 말라서<br>퀘스트할 수 없어요!',
    bodyguardExerted: '<strong>Bodyguard</strong>는<br>Exerted 상태로 플레이할 수 있어요',
  },

  /* 정적 UI 텍스트 (index.html + demo-board.js 내 UI 문자열) */
  ui: {
    title: 'Disney Lorcana 입문 101 — 강습회',
    prev: '← 이전',
    next: '→ 다음',
    prevTip: '이전 (Backspace · ← · ↑ · PageUp)',
    nextTip: '다음 (Space · → · ↓ · PageDown)',
    subtitle: '자막',
    dialog: '말풍선',
    font: '글자',
    fontTip: '설명/자막/말풍선 글자 크기',
    fontDecTip: '작게 (−)',
    fontIncTip: '크게 (+)',
    modalClose: '닫기 (Esc)',
    finaleCaption: '— 여러 턴 뒤 —',
  },
};
