/* English catalog — reverse-sourced from official Disney Lorcana wording, not a
 * literal translation of the Korean. Rule phrasing follows the Comprehensive
 * Rules (CR) 2.1.0 (doc/CRUpdate_2.1.0-EN.pdf); see i18n/EN-REVIEW.md for the
 * per-string source table. Structure/whitespace mirrors ko.js so t() renders
 * identically-shaped HTML. Placeholders {x} are filled at render time. */
window.MESSAGES = window.MESSAGES || {};
window.MESSAGES.en = {

  intro: {
    title: {
      desc: "Let's learn how to play Disney Lorcana!",
      next: 'Next',
      prev: 'Prev',
    },
    world: {
      title: 'The World of Disney Lorcana',
      p1: 'Disney Lorcana is a strategy card game where you tell your own story with <strong>magical ink</strong>.',
      p2: 'Become an <strong>Illumineer</strong> who wields magic ink, and take on thrilling challenges and adventures alongside the heroes of the Disney worlds.',
      p3: 'Gather the pieces of your story and claim <strong>victory</strong>!',
    },
    'ink-colors': {
      title: 'The 6 Ink Colors',
      amber: 'Healing + Songs',
      amethyst: 'Magic + Control',
      emerald: 'Tricks + Disruption',
      ruby: 'Aggression + Removal',
      sapphire: 'Knowledge + Ramp',
      steel: 'Resilience + Damage',
      tagline: 'Play to their strengths and combine them<br>to build a deck all your own!',
    },
    'card-anatomy': {
      notFound: 'Card not found.',
      cost: '<strong>Ink Cost</strong><br>The ink needed to play this card<br>— this card costs <strong>{cost}</strong>',
      nameVersion:
        '\n          <strong>Name · <em>{name}</em></strong><br>\n' +
        '          <small>Up to 4 with the same name + version per deck</small><br>\n' +
        '          <strong>Version · <em>"{version}"</em></strong><br>\n' +
        '          <small>A different look/stats of the same character</small>\n        ',
      stats:
        '\n          <strong>Strength ¤ {strength}</strong> <small>damage dealt when challenging</small><br>\n' +
        '          <strong>Willpower ⛉ {willpower}</strong> <small>damage it can take (banished when reached)</small>\n        ',
      lore: '<strong>Lore ◆ {lore}</strong><br>Lore gained when this character quests',
    },
    'ink-rules': {
      title: 'Adding Ink',
      inkable: 'Inkable',
      uninkable: 'Uninkable',
      p1: '<strong class="hl">Once per turn</strong>, you may put an inkable card facedown into your inkwell.',
      p2: 'When you do, you must <strong>show your opponent that the card is inkable</strong>.',
      p3: 'You may add ink <strong>at any time</strong> during your turn.',
    },
    'challenge-brief': {
      title: 'Challenge',
      attackerLabel: 'Attacker — Exert',
      defenderLabel: 'Defender',
      desc:
        '\n          <strong>Exert</strong> one of your <strong>Ready</strong> characters to declare a challenge against an opposing character.<br>\n' +
        '          Both deal damage equal to their <strong>Strength (¤)</strong>, and a character is <strong class="hl">banished</strong> once its damage reaches its <strong>Willpower (⛉)</strong>.<br>\n' +
        "          An opponent's <strong>Ready</strong> characters can't be challenged.\n        ",
    },
    'action-brief': {
      title: 'Action',
      desc:
        '\n          An <strong>Action</strong> card pays an ink cost to trigger an immediate effect\n' +
        '          and then goes straight to the <strong>discard</strong>.<br>\n' +
        '          A <strong>Song</strong> is a kind of action, but a character can sing it\n' +
        '          <strong class="hl">without paying ink</strong>.\n        ',
    },
    'item-brief': {
      title: 'Item',
      desc:
        '\n          An <strong>Item</strong> stays in your Play Area and provides <strong>lasting effects or abilities</strong>.<br>\n' +
        "          Unlike characters, <strong class=\"hl\">you don't have to wait for its ink to dry</strong> —\n" +
        '          you can use its effects and abilities the turn you play it.\n        ',
    },
    'location-brief': {
      title: 'Location',
      desc:
        '\n          A <strong>Location</strong> is played by paying its ink cost.\n' +
        '          A character can then pay the <strong>Move Cost</strong> shown on the left\n' +
        '          to move there and gain its effects.<br>\n' +
        '          A location can also be <strong>challenged</strong>, and is <strong class="hl">banished</strong>\n' +
        '          if the damage it takes reaches its Willpower (⛉).<br>\n' +
        '          During the <strong>SET</strong> step of your beginning phase you gain Lore equal to\n' +
        '          the <strong>Lore (◆)</strong> shown on the location.\n        ',
    },
    'finale-excuse': {
      title: 'Several turns later —',
      sub: "Player A's <strong>final turn</strong>.",
    },
    'victory-rule': {
      title: 'Winning the Game',
      headline: '\n          The first player to reach <strong class="hl">20 Lore</strong> <strong>wins</strong> the game.\n        ',
      bullet1: '<strong>Quest</strong> with a character to gain Lore equal to its <strong>◆</strong>',
      bullet2: "Automatically gain a <strong>Location</strong>'s ◆ during the SET step of your beginning phase",
      bullet3: 'Some card <strong>effects</strong> grant extra Lore (e.g. Robin Hood — Champion: +2 when he banishes a character in a challenge)',
    },
    'deck-brief': {
      title: 'Deck Building',
      bullet1: 'A deck can combine <strong>up to 2</strong> ink colors.',
      bullet2: 'A deck must have <strong class="hl">at least 60 cards</strong>.',
      bullet3: 'No more than <strong>4 copies</strong> of a card with the same <strong>name + version</strong> per deck.',
      desc:
        "\n          Play to each ink's strengths and mix characters, items, songs, and locations in balance<br>\n" +
        '          to build <strong>a deck all your own</strong>.\n        ',
    },
    thanks: {
      title: 'Thank you.',
      sub: 'Welcome to the world of Disney Lorcana',
    },
    'sing-brief': {
      title: 'Sing',
      normalLabel: 'Normal play — cost <strong>{cost}</strong>',
      singLabel: '<strong>Sing</strong> — cost ⓘ <strong>0</strong> ink',
      singSub: '<strong>Exert</strong> a character.',
      desc:
        "\n          A <strong>Song</strong> card can be sung by <strong>exerting</strong> a character whose cost is at least the song's cost,<br>\n" +
        '          <strong class="hl">without paying any ink</strong>.<br>\n' +
        '          After the song resolves, it goes to the <strong>discard</strong>.\n        ',
    },
    'shift-brief': {
      title: 'Shift',
      normalLabel: 'Normal play — cost <strong>5</strong>',
      shiftLabel: '<strong>Shift</strong> play — cost <strong>3</strong>',
      desc:
        '\n          With a <strong>Shift</strong> ability, you can play a character onto one with the same name for less ink.<br>\n' +
        '          The shifted character is treated as the same one, so it <strong class="hl">keeps all of the original character\'s damage and dried-ink status</strong>.\n        ',
    },
    'quest-brief': {
      title: 'Quest',
      desc:
        '\n          <strong>Exert</strong> a character whose ink has dried to declare a <strong>quest</strong>.<br>\n' +
        "          Questing raises your lore count by the character's lore value.<br><br>\n" +
        '          <strong class="hl">When your lore count reaches 20, you win the game.</strong>\n        ',
    },
    'cost-exert': {
      title: 'Paying the Ink Cost',
      desc: "To play a card, <strong>exert</strong> ink equal to the card's <strong>ink cost</strong>.<br>Paying ink to put a card onto the board this way is called <strong>'play'</strong>ing it.",
      costLabel: 'Cost <strong>{cost}</strong>',
    },
    'begin-brief': {
      title: 'Beginning Phase',
      sub: 'The <strong>READY → SET → DRAW</strong> steps at the start of your turn',
      readyText: 'Return all your <strong>characters and ink</strong><br>to Ready (upright)',
      readyTagChar: 'Character',
      readyTagInk: 'Ink',
      readyNote:
        '\n              Return all your played cards and ink from<br>\n' +
        '              <strong>Exerted (sideways)</strong> to <strong>Ready (upright)</strong>\n            ',
      setText: 'Effects that trigger<br>"<strong>at the start of your turn</strong>" resolve',
      setCaption: 'e.g. <em>Jack-Jack Parr — Incredible Potential</em><br>"<strong>At the start of your turn,</strong> you may put the top card of your deck into your discard..."',
      drawText: 'Draw <strong>1 card</strong> from<br>your deck into your hand',
      drawNote:
        "\n              However, you <strong>don't draw on the first player's first turn</strong>;<br>\n" +
        "              drawing begins <strong>from the second player's first turn</strong>\n            ",
    },
    'ready-exert': {
      readyLabel: '<strong>Ready</strong><br>Upright — able to act',
      exertedLabel: '<strong>Exerted</strong><br>Sideways — done acting',
      desc:
        '\n          Paying ink, or questing, challenging, singing, and so on, <strong>exerts</strong> the card (sideways).<br>\n' +
        '          It returns to <strong>Ready</strong> (upright) during your beginning phase.\n        ',
    },
  },

  page: {
    'p6-transition': {
      title: 'So, shall we learn by<br>actually playing a game?',
      description: '',
    },
    'p7-game-start': {
      title: 'Game Start!',
      description: "Shall we begin?<br>Roll a die or play rock-paper-scissors; the winner chooses who goes first.<br><br>For this walkthrough, let's start with <strong>me going first</strong>.",
    },
    'p8-mulligan-brief': {
      title: 'Mulligan',
      description:
        'After drawing your opening hand of 7, and before the game begins, you may <strong class="hl">once</strong> choose cards you don\'t like and <strong>put them on the bottom of your deck</strong>.<br>\n' +
        'Draw <strong>that many new cards</strong> to get back to 7.<br>\n' +
        'Then <strong>shuffle</strong> your deck and start the game.<br><br>\n' +
        'An important decision that balances early ink cards against your key characters.',
    },
  },

  /* PAGES[].label — page-info bar */
  pageLabel: {
    'p1-title': 'Title',
    'p2-world': 'World',
    'p3-ink-colors': 'Ink Colors',
    'p4-anatomy': 'A Close Look at a Card',
    'p-action-brief-t3': 'Action',
    'p-item-brief': 'Item',
    'p-location-brief': 'Location',
    'p5-board-intro': '🗺 Board Overview',
    'p6-transition': 'Transition',
    'p7-game-start': 'Game Start',
    'sim-game-start': '🎲 Game Start (roll + draw 7)',
    'p8-mulligan-brief': 'Mulligan',
    'sim-mulligan': '🤝 Mulligan',
    'sim-t1-begin': '▶ T1 Beginning Phase',
    'p-ink-rules': 'Adding Ink',
    'sim-t1-aurora-ink': '💧 T1 Add Ink (Aurora)',
    'p-ready-exert-brief': 'Ready / Exert',
    'p-cost-exert-brief': 'Paying the Ink Cost',
    'sim-t1-robin-play': '🦊 T1 Play Robin Beloved',
    'sim-t2-begin': '▶ T2 Beginning Phase',
    'sim-t2-vanellope-ink': '💧 T2 Add Ink (Vanellope, opp)',
    'sim-t2-pluto-play': '🐶 T2 Play Pluto (opp)',
    'p-begin-brief': 'Beginning Phase',
    'sim-t3-begin': '▶ T3 Beginning Phase',
    'sim-t3-develop': '✨ T3 Develop Your Brain',
    'sim-t3-pete-ink': '💧 T3 Add Ink (Pete)',
    'sim-t3-mulan-play': '🥷 T3 Play Mulan',
    'sim-t3-mulan-effect': '✨ T3 Mulan Effect (draw + discard)',
    'p-quest-brief': 'Quest',
    'sim-t3-quest': '🌳 T3 Robin Beloved Quests',
    'sim-t4-begin': '▶ T4 Beginning Phase',
    'sim-t4-gadget-ink': '💧 T4 Add Ink (Gadget, opp)',
    'sim-t4-pluto-effect': '✨ T4 Pluto Effect (−1 ink)',
    'sim-t4-rajah-play': '🐯 T4 Play Rajah (Exerted)',
    'sim-t5-begin': '▶ T5 Beginning Phase',
    'sim-t5-moana-ink': '💧 T5 Add Ink (Moana)',
    'p-shift-brief': 'Shift',
    'sim-t5-shift': '↑ T5 Robin Champion Shift',
    'p-challenge-brief': 'Challenge',
    'sim-t5-robin-pluto-blocked': '❌ T5 Robin → Pluto (blocked)',
    'sim-t5-mulan-rajah': '¤ T5 Mulan → Rajah Challenge',
    'sim-t5-robin-rajah': '¤ T5 Robin → Rajah Challenge',
    'sim-t6-begin': '▶ T6 Beginning Phase',
    'sim-t6-stitch-ink': '💧 T6 Add Ink (Stitch, opp)',
    'sim-t6-mickey-play': '🐭 T6 Play Mickey (opp, cost 3)',
    'sim-t7-begin': '▶ T7 Beginning Phase',
    'sim-t7-moana-ink': '💧 T7 Add Ink (Moana)',
    'p-sing-brief': 'Sing (Song)',
    'sim-t7-letitgo': '🎵 T7 Let It Go (Sing)',
    'sim-t7-jasmine-play': '👸 T7 Play Jasmine (cost 4)',
    'p-finale-excuse': 'Final Turn',
    'sim-finale-jump': '⏱ Jump to the Final Turn',
    'p-victory-rule': 'Winning the Game',
    'sim-finale-win': '🏆 Final Turn — Victory',
    'p-deck-brief': 'Deck Building',
    'p-thanks': 'Thank You',
  },

  /* CHAPTERS[].label — chapter rail */
  chapter: {
    'p1-title': 'Cover',
    'p2-world': 'World',
    'p3-ink-colors': 'Ink Colors',
    'p4-anatomy': 'Card',
    'p5-board-intro': 'Board',
    'p8-mulligan-brief': 'Mulligan',
    'sim-t1-begin': 'T1',
    'sim-t2-begin': 'T2',
    'sim-t3-begin': 'T3',
    'sim-t4-begin': 'T4',
    'sim-t5-begin': 'T5',
    'sim-t6-begin': 'T6',
    'sim-t7-begin': 'T7',
    'p-finale-excuse': 'Final Turn',
    'p-deck-brief': 'Wrap-up',
  },

  subtitle: {
    turnStartT1: {
      step: "T1 / {name}'s turn begins",
      body: 'The first player <strong>skips the beginning phase</strong> on turn 1 (no draw) and goes straight to the main phase.',
    },
    beginPhase: {
      step: "T{turn} / {name}'s beginning phase",
      body: 'Proceeds in READY → SET → DRAW order.',
    },
    boardIntro: {
      step: 'Board Overview',
      body: "In Lorcana the zones aren't strictly divided or fixed in place. Arrange them however is comfortable for you.",
    },
    gameStart: {
      step: 'Game Start',
      body: 'After deciding turn order with a die, each player draws an opening hand of <strong>7</strong> cards.',
    },
    mulligan: {
      step: 'Mulligan',
      body: 'Put <strong>4</strong> unwanted cards on the bottom of your deck and draw that many new ones.',
    },
    inkAdd: {
      step: 'T{turn} / {player} adds ink',
      bodyOpp: ' — revealing an inkable card.',
      bodySelf: ' is put into the inkwell.',
    },
    challenge: {
      step: 'T{turn} / Challenge',
    },
    mulanEffect: {
      step: "T{turn} / Mulan's ability",
      body: 'Draw 1 from your deck → discard 1 from your hand',
    },
    develop: {
      body: 'Look at the top <strong>2 cards</strong> of your deck; put <strong>one</strong> into your hand and the other on the bottom.',
    },
    pluto: {
      step: "T{turn} / Pluto's ability",
      body: 'Exert <strong>Pluto</strong> → you pay <strong>1 ⬡ less</strong> for the next character.',
    },
    quest: {
      step: "T{turn} / {player}'s quest",
      body: '<strong>{cardName}</strong> quests → <strong>+{lore} Lore</strong>',
    },
    finaleJump: {
      step: 'Final Turn',
      body: "Several turns have passed — Player A's <strong>final turn</strong>.",
    },
    victory: {
      step: 'Victory!',
      body: 'Player A reached <strong>Lore 20</strong> and won the game.',
    },
    challengeBlocked: {
      step: 'T{turn} / Challenge failed',
      blockedBy: " &nbsp;&nbsp; ❌ blocked by <strong>{blocker}</strong>'s <em>Bodyguard</em> — it can't be challenged.",
      blockedGeneric: " &nbsp;&nbsp; ❌ it can't be challenged.",
    },
    letItGo: {
      body: '<strong>{singer}</strong> <strong>exerts</strong> to sing <strong>{song}</strong>.',
    },
    cardPlay: {
      step: 'T{turn} / {player} plays a card',
      bodyEnter: '<strong>{cardName}</strong> enters',
      costPart: ' — cost {cost} ink.',
      dot: '.',
    },
  },

  dialog: {
    inkDried: 'A turn has passed and the ink has dried,<br>so it can quest now!',
    firstTurnNoDraw: "<strong>The first player's first turn</strong><br>skips the draw",
    readyUntargetable: "It's <strong>Ready</strong>, so it<br>can't be challenged",
    zoneDeck: '<strong>Deck</strong> — where you draw cards',
    zoneDiscard: '<strong>Discard</strong> — the pile of discarded cards',
    zonePlay: '<strong>Play Area</strong> — characters, items, and locations in play',
    zoneInkwell: '<strong>Inkwell</strong> — cards being used as ink',
    gameStartBubble: "I'll go first!",
    robinHood: "<strong>Robin Hood's ability:</strong><br>Whenever he banishes another character<br>in a challenge, gain <strong>+2 Lore</strong>!",
    mulanEntrance: "Mulan's entrance ability triggers!<br><strong>Draw 1 card</strong> from your deck,<br>then <strong>discard 1</strong> from your hand",
    actionDiscard: 'An <strong>Action</strong> card goes<br>straight to the <strong>discard</strong> after it resolves',
    plutoBubble: "<strong>Pluto's ability:</strong><br><strong>−1 ink!</strong> for the next character",
    bodyguardBlock: '<strong>Bodyguard</strong> —<br>{name} is<br>protecting it.',
    blockerFallback: 'the character',
    inkNotDry: "The ink isn't dry the turn you play a card,<br>so it can't quest yet!",
    bodyguardExerted: '<strong>Bodyguard</strong> can be<br>played Exerted',
  },

  ui: {
    title: 'Disney Lorcana 101',
    prev: '← Prev',
    next: 'Next →',
    prevTip: 'Previous (Backspace · ← · ↑ · PageUp)',
    nextTip: 'Next (Space · → · ↓ · PageDown)',
    subtitle: 'Subtitles',
    dialog: 'Bubbles',
    font: 'Font',
    fontTip: 'Text size for descriptions / subtitles / bubbles',
    fontDecTip: 'Smaller (−)',
    fontIncTip: 'Larger (+)',
    modalClose: 'Close (Esc)',
    finaleCaption: '— Several turns later —',
  },
};
