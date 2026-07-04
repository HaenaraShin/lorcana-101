# EN 번역 검토 시트 (P1b 게이트)

> 상태: **사용자 검토 승인 완료(2026-07-05, D항목 포함 반영). P2 진행.**
> 검증: 키·placeholder 패리티 145/145, 마크업 태그 패리티 불일치 0, EN 렌더 한글 0·미치환 placeholder 0, KO 골든 불변.

## 자체 검토 결과 (2026-07-05) — 발견·수정 11건

**A. 마크업 불일치 (KO↔EN bold 어긋남) — 4건 수정**
| 키 | 문제 | 조치 |
|---|---|---|
| `intro.challenge-brief.desc` | EN에 `Exert` bold 누락 | `<strong>Exert</strong>` 추가 |
| `intro.sing-brief.singSub` | EN에 `Exert` bold 누락 | 동일 |
| `intro.quest-brief.desc` | EN에 `Exert` bold 누락 | 동일 |
| `subtitle.beginPhase.body` | KO에 없는 `<strong>`을 EN이 추가 | 제거 |

**B. 역추적 부정확 (카드/CR 원문 대조) — 5건 수정**
| 키 | 문제 | 근거 원문 | 조치 |
|---|---|---|---|
| `intro.victory-rule.headline` | "collect 20 Lore" | CR 용어집: "The first player to **reach** 20 lore wins the game." | reach로 교체 |
| `intro.victory-rule.bullet3` | "+2 when a Champion challenges" — **챌린지만으로 +2처럼 오독(룰 오류)** | 실카드: "whenever this character **banishes another character** in a challenge, gain 2 lore" | banish 조건 명시 |
| `dialog.robinHood` | "banishes a foe" 비정본 표현 | 위와 동일 | "banishes another character in a challenge"로 정렬 |
| `subtitle.develop.body` | "the rest on the bottom" | 실카드: "put one into your hand and **the other** on the bottom of the deck" | the other로 교체 |
| `subtitle.pluto.body` | "costs 1 less ink" | 실카드: "You **pay 1 ⬡ less** for the next character" | 카드 문구로 정렬 |

**C. 표현 개선 — 2건 수정**
- `subtitle.inkAdd.step`: "{player}'s ink" → "{player} adds ink" ('추가' 의미 복원)
- `subtitle.cardPlay.step`: "{player}'s play" → "{player} plays a card"

**D. KO 룰 정확화 — 1건 수정 완료 (사용자 승인, 2026-07-05)**
- `intro.card-anatomy.nameVersion`: KO "같은 이름은" → "같은 **이름+버전**은 한 덱에 4장까지" (CR: same full name ≤4). EN도 "same name + version". 골든 재캡처 완료.

## 원칙 (역추적)
- 단순 영작이 아니라 **공식 영어 원문 표현 복원**. 룰 문장은 Comprehensive Rules(CR) 2.1.0(`doc/CRUpdate_2.1.0-EN.pdf`), 카드 고유 효과는 `cards.js`/`card-db` 원문을 따름.
- 카드 이름·효과·고유명(Robin Hood, Develop Your Brain, Let It Go, Jack-Jack, Player A/B)은 영어 원문 유지.
- 기호(¤ ⛉ ◆ ⓘ)·마크업·구조는 KO와 동일, 텍스트만 EN.
- `⏎` = 실제 개행. `∅` = 미번역(현재 없음).

## 근거로 참고한 CR 조항 (주요)
- 승리: **CR §2.3.3.1** "A player who has 20 or more lore wins the game." / 용어집 "The first player to reach 20 lore wins the game."
- 잉크 추가: "Put any card from your hand into your inkwell **facedown**." (턴 1회)
- 비기닝(Start-of-Turn) 3단계: **§3.2.1 Ready / §3.2.2 Set / §3.2.3 Draw**
- 퀘스트: **§4.5** "the player gains lore equal to the ◊ of the questing character"
- 챌린지/퇴장: **§4.6**; damage ≥ willpower → **banished**
- Shift: **§8.10** "paying an alternate cost to play a character instead of paying the character's ink cost"
- Bodyguard: **§8.3** / Singer/Sing: **§8.11 / §8.12**
- 덱: "at least 60 cards, no more than two ink types, no more than 4 copies with the same full name"
- 이동/로케이션: **§4.7** move cost
- 카드 고유 효과 원문: Robin Hood — Champion "SKILLED COMBATANT", Mulan "WHERE DO I SIGN IN?", Develop Your Brain, Pluto "GOOD DOG" (cards.js 대조 완료)

## 검토 포인트 (사용자 확인 바라는 항목)
1. **flavor 문구**(world/ink-colors/thanks 등)는 CR 근거 없는 의역 — 톤 확인 요망.
2. **ink-colors 색 정체성**(예: Sapphire=Knowledge+Ramp, Ruby=Aggression+Removal) — 커뮤니티 통용 표현, 취향 영역.
3. **nav 라벨**(pageLabel/chapter): 이모지 유지, 한국어만 영어화. "Wrap-up"(마무리) 등 확인.
4. **D 항목**: KO nameVersion 문구도 "이름+버전"으로 고칠지 결정.

---

## 전체 대조표 (145키)

| key | KO | EN | source / basis |
|---|---|---|---|
| `intro.title.desc` | 디즈니 로카나 플레이방법을 배워봅시다! | Let's learn how to play Disney Lorcana! | UI |
| `intro.title.next` | 다음 | Next | UI |
| `intro.title.prev` | 이전 | Prev | UI |
| `intro.world.title` | 디즈니 로카나의 세계 | The World of Disney Lorcana | flavor |
| `intro.world.p1` | 디즈니 로카나는 <strong>마법의 잉크</strong>로 나만의 이야기를 완성해가는 전략 카드 게임입니다. | Disney Lorcana is a strategy card game where you tell your own story with <strong>magical ink</strong>. | flavor |
| `intro.world.p2` | 마법 잉크를 다루는 <strong>일루미니어</strong>가 되어 디즈니 세계의 영웅들과 함께 스릴 넘치는 도전과 모험을 경험하세요. | Become an <strong>Illumineer</strong> who wields magic ink, and take on thrilling challenges and adventures alongside the heroes of the Disney worlds. | flavor |
| `intro.world.p3` | 그리고 이야기 조각을 모아 <strong>승리</strong>하세요! | Gather the pieces of your story and claim <strong>victory</strong>! | flavor |
| `intro.ink-colors.title` | 6가지 잉크 컬러 | The 6 Ink Colors | flavor (ink identities) |
| `intro.ink-colors.amber` | 회복 + 노래 | Healing + Songs | flavor (ink identities) |
| `intro.ink-colors.amethyst` | 마법 + 조작 | Magic + Control | flavor (ink identities) |
| `intro.ink-colors.emerald` | 트릭 + 교란 | Tricks + Disruption | flavor (ink identities) |
| `intro.ink-colors.ruby` | 전투 + 제거 | Aggression + Removal | flavor (ink identities) |
| `intro.ink-colors.sapphire` | 지식 + 축적 | Knowledge + Ramp | flavor (ink identities) |
| `intro.ink-colors.steel` | 저항 + 공격 | Resilience + Damage | flavor (ink identities) |
| `intro.ink-colors.tagline` | 특성을 살리고 조합하여<br>나만의 덱을 구축하자! | Play to their strengths and combine them<br>to build a deck all your own! | flavor (ink identities) |
| `intro.card-anatomy.notFound` | 카드를 찾을 수 없습니다. | Card not found. | card stats — on-card fields |
| `intro.card-anatomy.cost` | <strong>잉크 비용</strong><br>이 카드를 플레이하는 데 필요한 잉크 수<br>— 이 카드는 <strong>{cost}</strong> | <strong>Ink Cost</strong><br>The ink needed to play this card<br>— this card costs <strong>{cost}</strong> | card stats — on-card fields |
| `intro.card-anatomy.nameVersion` | ⏎          <strong>이름 · <em>{name}</em></strong><br>⏎          <small>같은 이름+버전은 한 덱에 4장까지</small><br>⏎          <strong>버전 · <em>"{version}"</em></strong><br>⏎          <small>같은 캐릭터의 다른 모습/스탯</small>⏎         | ⏎          <strong>Name · <em>{name}</em></strong><br>⏎          <small>Up to 4 with the same name + version per deck</small><br>⏎          <strong>Version · <em>"{version}"</em></strong><br>⏎          <small>A different look/stats of the same character</small>⏎         | card stats — on-card fields |
| `intro.card-anatomy.stats` | ⏎          <strong>힘 ¤ {strength}</strong> <small>챌린지 시 주는 데미지</small><br>⏎          <strong>의지력 ⛉ {willpower}</strong> <small>받을 수 있는 데미지 한계 (초과 시 banish)</small>⏎         | ⏎          <strong>Strength ¤ {strength}</strong> <small>damage dealt when challenging</small><br>⏎          <strong>Willpower ⛉ {willpower}</strong> <small>damage it can take (banished if exceeded)</small>⏎         | card stats — on-card fields |
| `intro.card-anatomy.lore` | <strong>로어 ◆ {lore}</strong><br>이 캐릭터로 퀘스트할 때 얻는 Lore 점수 | <strong>Lore ◆ {lore}</strong><br>Lore gained when this character quests | card stats — on-card fields |
| `intro.ink-rules.title` | 잉크 추가 | Adding Ink | CR: inkwell action (facedown, once/turn) |
| `intro.ink-rules.inkable` | 잉크 가능 | Inkable | CR: inkwell action (facedown, once/turn) |
| `intro.ink-rules.uninkable` | 잉크 불가능 | Uninkable | CR: inkwell action (facedown, once/turn) |
| `intro.ink-rules.p1` | <strong class="hl">한 턴에 한 번</strong>, 잉크 가능한 카드를 뒷면으로 잉크웰에 놓을 수 있습니다. | <strong class="hl">Once per turn</strong>, you may put an inkable card facedown into your inkwell. | CR: inkwell action (facedown, once/turn) |
| `intro.ink-rules.p2` | 이때 상대에게 <strong>잉크 가능한 카드임을 확인</strong>시켜주어야 합니다. | When you do, you must <strong>show your opponent that the card is inkable</strong>. | CR: inkwell action (facedown, once/turn) |
| `intro.ink-rules.p3` | 자신의 턴 중이라면 <strong>언제든</strong> 넣을 수 있습니다. | You may add ink <strong>at any time</strong> during your turn. | CR: inkwell action (facedown, once/turn) |
| `intro.challenge-brief.title` | 챌린지 | Challenge | CR §4.6 Challenge; banish on dmg≥willpower |
| `intro.challenge-brief.attackerLabel` | 공격자 — Exert | Attacker — Exert | CR §4.6 Challenge; banish on dmg≥willpower |
| `intro.challenge-brief.defenderLabel` | 방어자 | Defender | CR §4.6 Challenge; banish on dmg≥willpower |
| `intro.challenge-brief.desc` | ⏎          자신의 <strong>Ready</strong> 상태인 캐릭터를 <strong>Exert</strong>하여 상대 캐릭터에게 챌린지를 선언합니다.<br>⏎          서로의 <strong>공격력(¤)</strong>만큼 데미지를 주고받고, 받은 데미지가 <strong>의지력(⛉)</strong> 이상이 되면 <strong class="hl">banish</strong>됩니다.<br>⏎          상대의 <strong>Ready</strong> 상태 캐릭터는 챌린지 대상이 될 수 없습니다.⏎         | ⏎          <strong>Exert</strong> one of your <strong>Ready</strong> characters to declare a challenge against an opposing character.<br>⏎          Both deal damage equal to their <strong>Strength (¤)</strong>, and a character is <strong class="hl">banished</strong> once its damage reaches its <strong>Willpower (⛉)</strong>.<br>⏎          An opponent's <strong>Ready</strong> characters can't be challenged.⏎         | CR §4.6 Challenge; banish on dmg≥willpower |
| `intro.action-brief.title` | 액션 (Action) | Action | CR §5.4 actions/songs |
| `intro.action-brief.desc` | ⏎          <strong>액션</strong> 카드는 잉크 비용을 지불해 즉발적인 효과를 발동시키고⏎          곧바로 <strong>discard</strong>로 들어가는 강력한 카드입니다.<br>⏎          <strong>Song(노래)</strong>은 액션의 한 종류이지만 캐릭터가 부르는 것으로⏎          <strong class="hl">잉크를 지불하지 않고</strong> 발동할 수 있습니다.⏎         | ⏎          An <strong>Action</strong> card pays an ink cost to trigger an immediate effect⏎          and then goes straight to the <strong>discard</strong>.<br>⏎          A <strong>Song</strong> is a kind of action, but a character can sing it⏎          <strong class="hl">without paying ink</strong>.⏎         | CR §5.4 actions/songs |
| `intro.item-brief.title` | 아이템 (Item) | Item | CR item timing |
| `intro.item-brief.desc` | ⏎          <strong>아이템</strong>은 Play Area에 남아 <strong>영속적인 효과나 어빌리티</strong>를 제공합니다.<br>⏎          캐릭터와 달리 <strong class="hl">잉크가 마르기를 기다릴 필요 없이</strong>,⏎          플레이한 턴부터 효과·어빌리티를 곧바로 사용할 수 있습니다.⏎         | ⏎          An <strong>Item</strong> stays in your Play Area and provides <strong>lasting effects or abilities</strong>.<br>⏎          Unlike characters, <strong class="hl">you don't have to wait for its ink to dry</strong> —⏎          you can use its effects and abilities the turn you play it.⏎         | CR item timing |
| `intro.location-brief.title` | 로케이션 (Location) | Location | CR §4.7 Move; §3.2.2 SET lore |
| `intro.location-brief.desc` | ⏎          <strong>로케이션</strong>은 잉크 비용을 지불해 플레이합니다.⏎          이후 캐릭터가 좌측의 <strong>이동 비용(Move Cost)</strong>을 지불하면⏎          그 로케이션으로 이동해 효과를 적용받습니다.<br>⏎          로케이션 자체도 <strong>챌린지의 대상</strong>이 될 수 있고,⏎          받은 데미지가 의지력(⛉)을 넘으면 <strong class="hl">banish</strong>됩니다.<br>⏎          자신의 비기닝 페이즈 <strong>SET</strong> 단계에 로케이션 위에 표시된⏎          <strong>로어(◆)</strong>만큼 자동으로 Lore를 얻습니다.⏎         | ⏎          A <strong>Location</strong> is played by paying its ink cost.⏎          A character can then pay the <strong>Move Cost</strong> shown on the left⏎          to move there and gain its effects.<br>⏎          A location can also be <strong>challenged</strong>, and is <strong class="hl">banished</strong>⏎          if the damage it takes exceeds its Willpower (⛉).<br>⏎          During the <strong>SET</strong> step of your beginning phase you gain Lore equal to⏎          the <strong>Lore (◆)</strong> shown on the location.⏎         | CR §4.7 Move; §3.2.2 SET lore |
| `intro.finale-excuse.title` | 여러 턴 뒤 — | Several turns later — | flavor |
| `intro.finale-excuse.sub` | Player A의 <strong>마지막 턴</strong>. | Player A's <strong>final turn</strong>. | flavor |
| `intro.victory-rule.title` | 승리 조건 | Winning the Game | CR §2.3.3.1 (20 lore wins); §4.5 quest |
| `intro.victory-rule.headline` | ⏎          먼저 <strong class="hl">Lore 20점</strong>을 모은 플레이어가 <strong>승리</strong>합니다.⏎         | ⏎          The first player to reach <strong class="hl">20 Lore</strong> <strong>wins</strong> the game.⏎         | CR §2.3.3.1 (20 lore wins); §4.5 quest |
| `intro.victory-rule.bullet1` | 캐릭터로 <strong>퀘스트</strong>하면 그 캐릭터의 <strong>◆</strong> 만큼 Lore 획득 | <strong>Quest</strong> with a character to gain Lore equal to its <strong>◆</strong> | CR §2.3.3.1 (20 lore wins); §4.5 quest |
| `intro.victory-rule.bullet2` | 자신의 비기닝 페이즈 SET 단계에 <strong>로케이션</strong>의 ◆ 만큼 자동 획득 | Automatically gain a <strong>Location</strong>'s ◆ during the SET step of your beginning phase | CR §2.3.3.1 (20 lore wins); §4.5 quest |
| `intro.victory-rule.bullet3` | 일부 카드 <strong>효과</strong>로 추가 Lore 획득 (예: Robin Hood — Champion 챌린지 +2) | Some card <strong>effects</strong> grant extra Lore (e.g. Robin Hood — Champion: +2 when he banishes a character in a challenge) | CR §2.3.3.1 (20 lore wins); §4.5 quest |
| `intro.deck-brief.title` | 덱 구성 | Deck Building | CR deck: ≥60, ≤2 inks, ≤4 copies |
| `intro.deck-brief.bullet1` | 덱은 <strong>최대 2개</strong>의 잉크 색을 조합해 짤 수 있습니다. | A deck can combine <strong>up to 2</strong> ink colors. | CR deck: ≥60, ≤2 inks, ≤4 copies |
| `intro.deck-brief.bullet2` | 덱은 <strong class="hl">최소 60장</strong>이어야 합니다. | A deck must have <strong class="hl">at least 60 cards</strong>. | CR deck: ≥60, ≤2 inks, ≤4 copies |
| `intro.deck-brief.bullet3` | 같은 <strong>이름 + 같은 버전</strong>의 카드는 한 덱에 <strong>최대 4장</strong>까지. | No more than <strong>4 copies</strong> of a card with the same <strong>name + version</strong> per deck. | CR deck: ≥60, ≤2 inks, ≤4 copies |
| `intro.deck-brief.desc` | ⏎          잉크 색의 성격을 살리고, 캐릭터·아이템·노래·로케이션을 균형 있게 섞어<br>⏎          <strong>나만의 덱</strong>을 만들어 보세요.⏎         | ⏎          Play to each ink's strengths and mix characters, items, songs, and locations in balance<br>⏎          to build <strong>a deck all your own</strong>.⏎         | CR deck: ≥60, ≤2 inks, ≤4 copies |
| `intro.thanks.title` | 감사합니다. | Thank you. | flavor |
| `intro.thanks.sub` | Disney Lorcana의 세계로 오신 걸 환영해요 | Welcome to the world of Disney Lorcana | flavor |
| `intro.sing-brief.title` | Sing (노래 부르기) | Sing | CR §8.11 Singer / sing a song |
| `intro.sing-brief.normalLabel` | 일반 플레이 — 비용 <strong>{cost}</strong> | Normal play — cost <strong>{cost}</strong> | CR §8.11 Singer / sing a song |
| `intro.sing-brief.singLabel` | <strong>Sing</strong> — 비용 ⓘ <strong>0</strong> 잉크 | <strong>Sing</strong> — cost ⓘ <strong>0</strong> ink | CR §8.11 Singer / sing a song |
| `intro.sing-brief.singSub` | 캐릭터를 <strong>Exert</strong>합니다. | <strong>Exert</strong> a character. | CR §8.11 Singer / sing a song |
| `intro.sing-brief.desc` | ⏎          <strong>Song(노래)</strong> 카드는 그 노래의 비용 이상의 캐릭터를 <strong>Exert</strong>하는 것으로<br>⏎          잉크를 지불하지 않고 <strong class="hl">"부를(Sing)"</strong> 수 있습니다.<br>⏎          노래는 효과가 발동된 뒤 <strong>discard</strong>로 이동합니다.⏎         | ⏎          A <strong>Song</strong> card can be sung by <strong>exerting</strong> a character whose cost is at least the song's cost,<br>⏎          <strong class="hl">without paying any ink</strong>.<br>⏎          After the song resolves, it goes to the <strong>discard</strong>.⏎         | CR §8.11 Singer / sing a song |
| `intro.shift-brief.title` | 시프트 | Shift | CR §8.10 Shift (alternate cost) |
| `intro.shift-brief.normalLabel` | 일반 플레이 — 비용 <strong>5</strong> | Normal play — cost <strong>5</strong> | CR §8.10 Shift (alternate cost) |
| `intro.shift-brief.shiftLabel` | <strong>Shift</strong> 플레이 — 비용 <strong>3</strong> | <strong>Shift</strong> play — cost <strong>3</strong> | CR §8.10 Shift (alternate cost) |
| `intro.shift-brief.desc` | ⏎          <strong>Shift</strong> 능력이 있다면 같은 이름의 캐릭터 위에 더 적은 잉크를 지불하고 낼 수도 있습니다.<br>⏎          시프트를 하면 캐릭터가 변화한 것으로 취급하여 원래 있던 <strong class="hl">캐릭터의 데미지, 잉크마름 상태까지도 전부 유지</strong>됩니다.⏎         | ⏎          With a <strong>Shift</strong> ability, you can play a character onto one with the same name for less ink.<br>⏎          The shifted character is treated as the same one, so it <strong class="hl">keeps all of the original character's damage and dried-ink status</strong>.⏎         | CR §8.10 Shift (alternate cost) |
| `intro.quest-brief.title` | 퀘스트 | Quest | CR §4.5 Quest → gains lore |
| `intro.quest-brief.desc` | ⏎          잉크가 마른 캐릭터를 <strong>Exert</strong>하는 것으로 <strong>퀘스트</strong>를 선언할 수 있습니다.<br>⏎          퀘스트를 하면 플레이어의 로어 카운트가 캐릭터의 로어 밸류만큼 오릅니다.<br><br>⏎          <strong class="hl">이 로어 카운트가 20이 되면 게임에서 승리합니다.</strong>⏎         | ⏎          <strong>Exert</strong> a character whose ink has dried to declare a <strong>quest</strong>.<br>⏎          Questing raises your lore count by the character's lore value.<br><br>⏎          <strong class="hl">When your lore count reaches 20, you win the game.</strong>⏎         | CR §4.5 Quest → gains lore |
| `intro.cost-exert.title` | 잉크 비용 지불 | Paying the Ink Cost | CR: pay ink cost by exerting |
| `intro.cost-exert.desc` | 카드를 플레이하려면, 그 카드의 <strong>잉크 비용</strong>만큼 자신의 잉크를 <strong>Exert</strong>합니다.<br>이렇게 잉크를 지불하고 카드를 보드에 내는 행위를 <strong>'play'</strong>한다고 표현합니다. | To play a card, <strong>exert</strong> ink equal to the card's <strong>ink cost</strong>.<br>Paying ink to put a card onto the board this way is called <strong>'play'</strong>ing it. | CR: pay ink cost by exerting |
| `intro.cost-exert.costLabel` | 비용 <strong>{cost}</strong> | Cost <strong>{cost}</strong> | CR: pay ink cost by exerting |
| `intro.begin-brief.title` | 비기닝 페이즈 | Beginning Phase | CR §3.2 Start-of-Turn: Ready/Set/Draw |
| `intro.begin-brief.sub` | 내 턴이 시작될 때 진행하는 <strong>READY → SET → DRAW</strong> 3단계 | The <strong>READY → SET → DRAW</strong> steps at the start of your turn | CR §3.2 Start-of-Turn: Ready/Set/Draw |
| `intro.begin-brief.readyText` | 내 모든 <strong>캐릭터와 잉크</strong>를<br>Ready(세로) 상태로 복귀 | Return all your <strong>characters and ink</strong><br>to Ready (upright) | CR §3.2 Start-of-Turn: Ready/Set/Draw |
| `intro.begin-brief.readyTagChar` | 캐릭터 | Character | CR §3.2 Start-of-Turn: Ready/Set/Draw |
| `intro.begin-brief.readyTagInk` | 잉크 | Ink | CR §3.2 Start-of-Turn: Ready/Set/Draw |
| `intro.begin-brief.readyNote` | ⏎              <strong>Exert(가로)</strong> 상태의 플레이 중인 카드와 잉크를<br>⏎              모두 <strong>Ready(세로)</strong> 상태로 되돌립니다⏎             | ⏎              Return all your played cards and ink from<br>⏎              <strong>Exerted (sideways)</strong> to <strong>Ready (upright)</strong>⏎             | CR §3.2 Start-of-Turn: Ready/Set/Draw |
| `intro.begin-brief.setText` | "<strong>턴이 시작될 때</strong>" 발동하는<br>효과들이 처리됩니다 | Effects that trigger<br>"<strong>at the start of your turn</strong>" resolve | CR §3.2 Start-of-Turn: Ready/Set/Draw |
| `intro.begin-brief.setCaption` | 예: <em>Jack-Jack Parr — Incredible Potential</em><br>"<strong>At the start of your turn,</strong> you may put the top card of your deck into your discard..." | e.g. <em>Jack-Jack Parr — Incredible Potential</em><br>"<strong>At the start of your turn,</strong> you may put the top card of your deck into your discard..." | CR §3.2 Start-of-Turn: Ready/Set/Draw |
| `intro.begin-brief.drawText` | 덱에서 카드 <strong>1장</strong>을<br>핸드로 드로우합니다 | Draw <strong>1 card</strong> from<br>your deck into your hand | CR §3.2 Start-of-Turn: Ready/Set/Draw |
| `intro.begin-brief.drawNote` | ⏎              단, <strong>선공의 첫 턴</strong>에는 드로우하지 않고<br>⏎              <strong>후공의 첫 턴부터</strong> 드로우를 진행합니다⏎             | ⏎              However, you <strong>don't draw on the first player's first turn</strong>;<br>⏎              drawing begins <strong>from the second player's first turn</strong>⏎             | CR §3.2 Start-of-Turn: Ready/Set/Draw |
| `intro.ready-exert.readyLabel` | <strong>Ready (준비)</strong><br>세로 — 행동 가능 | <strong>Ready</strong><br>Upright — able to act | CR Ready/Exerted states |
| `intro.ready-exert.exertedLabel` | <strong>Exerted (사용 후)</strong><br>가로 — 행동 완료 | <strong>Exerted</strong><br>Sideways — done acting | CR Ready/Exerted states |
| `intro.ready-exert.desc` | ⏎          잉크를 지불하거나, 퀘스트·챌린지·노래 등 행동을 하면 카드를 <strong>Exert</strong>(가로) 합니다.<br>⏎          자신의 비기닝 페이즈에 다시 <strong>Ready</strong>(세로) 상태로 돌아옵니다.⏎         | ⏎          Paying ink, or questing, challenging, singing, and so on, <strong>exerts</strong> the card (sideways).<br>⏎          It returns to <strong>Ready</strong> (upright) during your beginning phase.⏎         | CR Ready/Exerted states |
| `page.p6-transition.title` | 그럼 실제로 게임을<br>진행하면서 배워볼까요? | So, shall we learn by<br>actually playing a game? | transition flavor |
| `page.p6-transition.description` |  | ∅ | transition flavor |
| `page.p7-game-start.title` | 게임 시작! | Game Start! | transition flavor |
| `page.p7-game-start.description` | 이제 게임을 시작해볼까요?<br>가위바위보나 주사위를 던져 이긴 사람이 선/후공을 정합니다.<br><br>설명을 위해 <strong>나의 선공</strong>으로 게임을 시작해봅시다. | Shall we begin?<br>Roll a die or play rock-paper-scissors; the winner chooses who goes first.<br><br>For this walkthrough, let's start with <strong>me going first</strong>. | transition flavor |
| `page.p8-mulligan-brief.title` | 멀리건 | Mulligan | transition flavor |
| `page.p8-mulligan-brief.description` | 초기 핸드 7장을 받은 뒤, 게임 시작 전 <strong class="hl">단 1회</strong>에 한해 마음에 들지 않는 카드를 골라 <strong>덱 밑으로 되돌릴 수</strong> 있습니다.<br>⏎되돌린 만큼 다시 7장이 되도록 <strong>새 카드를 드로우</strong>합니다.<br>⏎이후 덱을 잘 <strong>셔플</strong>하여 게임을 시작합니다.<br><br>⏎초반 잉크 카드와 핵심 캐릭터의 균형을 잡는 중요한 결정입니다. | After drawing your opening hand of 7, and before the game begins, you may <strong class="hl">once</strong> choose cards you don't like and <strong>put them on the bottom of your deck</strong>.<br>⏎Draw <strong>that many new cards</strong> to get back to 7.<br>⏎Then <strong>shuffle</strong> your deck and start the game.<br><br>⏎An important decision that balances early ink cards against your key characters. | transition flavor |
| `subtitle.turnStartT1.step` | T1 / {name}의 턴 시작 | T1 / {name}'s turn begins | walkthrough narration |
| `subtitle.turnStartT1.body` | 선공은 첫 턴의 <strong>비기닝 페이즈를 건너뜁니다</strong> (드로우 없음). 곧바로 메인 페이즈로 진입합니다. | The first player <strong>skips the beginning phase</strong> on turn 1 (no draw) and goes straight to the main phase. | walkthrough narration |
| `subtitle.beginPhase.step` | T{turn} / {name}의 비기닝 페이즈 | T{turn} / {name}'s beginning phase | walkthrough narration |
| `subtitle.beginPhase.body` | READY → SET → DRAW 순으로 진행됩니다. | Proceeds in READY → SET → DRAW order. | walkthrough narration |
| `subtitle.boardIntro.step` | 보드 소개 | Board Overview | walkthrough narration |
| `subtitle.boardIntro.body` | 로카나에서는 영역이 정확히 나뉘거나 자리가 정해져 있지 않습니다. 각자 편한 대로 배치하셔도 됩니다. | In Lorcana the zones aren't strictly divided or fixed in place. Arrange them however is comfortable for you. | walkthrough narration |
| `subtitle.gameStart.step` | 게임 시작 | Game Start | walkthrough narration |
| `subtitle.gameStart.body` | 주사위로 선·후공을 정한 뒤 각자 <strong>7장</strong>의 초기 핸드를 받습니다. | After deciding turn order with a die, each player draws an opening hand of <strong>7</strong> cards. | walkthrough narration |
| `subtitle.mulligan.step` | 멀리건 | Mulligan | walkthrough narration |
| `subtitle.mulligan.body` | 맘에 들지 않는 카드 <strong>4장</strong>을 덱 밑으로 되돌리고, 같은 수만큼 새로 드로우합니다. | Put <strong>4</strong> unwanted cards on the bottom of your deck and draw that many new ones. | walkthrough narration |
| `subtitle.inkAdd.step` | T{turn} / {player}의 잉크 추가 | T{turn} / {player} adds ink | walkthrough narration |
| `subtitle.inkAdd.bodyOpp` |  — 잉크 가능 카드를 공개합니다. |  — revealing an inkable card. | walkthrough narration |
| `subtitle.inkAdd.bodySelf` | 을(를) 잉크로 사용합니다. |  is put into the inkwell. | walkthrough narration |
| `subtitle.challenge.step` | T{turn} / 챌린지 | T{turn} / Challenge | walkthrough narration |
| `subtitle.mulanEffect.step` | T{turn} / Mulan의 효과 | T{turn} / Mulan's ability | walkthrough narration |
| `subtitle.mulanEffect.body` | 덱에서 1장 드로우 → 핸드에서 1장 디스카드 | Draw 1 from your deck → discard 1 from your hand | walkthrough narration |
| `subtitle.develop.body` | 덱에서 카드 <strong>2장</strong>을 보고 <strong>1장</strong>은 핸드로, 나머지는 덱 바닥으로. | Look at the top <strong>2 cards</strong> of your deck; put <strong>one</strong> into your hand and the other on the bottom. | walkthrough narration |
| `subtitle.pluto.step` | T{turn} / Pluto의 능력 | T{turn} / Pluto's ability | walkthrough narration |
| `subtitle.pluto.body` | <strong>Pluto</strong>를 Exert → 다음 캐릭터의 잉크 비용 <strong>-1</strong>. | Exert <strong>Pluto</strong> → you pay <strong>1 ⬡ less</strong> for the next character. | walkthrough narration |
| `subtitle.quest.step` | T{turn} / {player}의 퀘스트 | T{turn} / {player}'s quest | walkthrough narration |
| `subtitle.quest.body` | <strong>{cardName}</strong> 퀘스트 → <strong>+{lore} Lore</strong> | <strong>{cardName}</strong> quests → <strong>+{lore} Lore</strong> | walkthrough narration |
| `subtitle.finaleJump.step` | 마지막 턴 | Final Turn | walkthrough narration |
| `subtitle.finaleJump.body` | 여러 턴이 지나 — Player A의 <strong>마지막 턴</strong>입니다. | Several turns have passed — Player A's <strong>final turn</strong>. | walkthrough narration |
| `subtitle.victory.step` | 승리! | Victory! | walkthrough narration |
| `subtitle.victory.body` | Player A 가 <strong>Lore 20</strong>에 도달해 게임을 승리했습니다. | Player A reached <strong>Lore 20</strong> and won the game. | walkthrough narration |
| `subtitle.challengeBlocked.step` | T{turn} / 챌린지 실패 | T{turn} / Challenge failed | walkthrough narration |
| `subtitle.challengeBlocked.blockedBy` |  &nbsp;&nbsp; ❌ <strong>{blocker}</strong>의 <em>Bodyguard</em>로 막혀 챌린지 대상이 될 수 없습니다. |  &nbsp;&nbsp; ❌ blocked by <strong>{blocker}</strong>'s <em>Bodyguard</em> — it can't be challenged. | walkthrough narration |
| `subtitle.challengeBlocked.blockedGeneric` |  &nbsp;&nbsp; ❌ 챌린지 대상이 될 수 없습니다. |  &nbsp;&nbsp; ❌ it can't be challenged. | walkthrough narration |
| `subtitle.letItGo.body` | <strong>{singer}</strong>을 <strong>Exert</strong>하여 <strong>{song}</strong>를 부릅니다. | <strong>{singer}</strong> <strong>exerts</strong> to sing <strong>{song}</strong>. | walkthrough narration |
| `subtitle.cardPlay.step` | T{turn} / {player}의 카드 플레이 | T{turn} / {player} plays a card | walkthrough narration |
| `subtitle.cardPlay.bodyEnter` | <strong>{cardName}</strong> 등장 | <strong>{cardName}</strong> enters | walkthrough narration |
| `subtitle.cardPlay.costPart` |  — 비용 {cost} 잉크. |  — cost {cost} ink. | walkthrough narration |
| `subtitle.cardPlay.dot` | . | . | walkthrough narration |
| `dialog.inkDried` | 한 턴이 지나 잉크가 말라서<br>이제 퀘스트할 수 있어요! | A turn has passed and the ink has dried,<br>so it can quest now! | walkthrough bubble |
| `dialog.firstTurnNoDraw` | <strong>선공의 첫 턴</strong>은<br>드로우를 생략합니다 | <strong>The first player's first turn</strong><br>skips the draw | walkthrough bubble |
| `dialog.readyUntargetable` | <strong>Ready</strong> 상태이므로<br>챌린지의 대상이 되지 않습니다 | It's <strong>Ready</strong>, so it<br>can't be challenged | walkthrough bubble |
| `dialog.zoneDeck` | <strong>Deck</strong> — 카드를 뽑는 곳 | <strong>Deck</strong> — where you draw cards | walkthrough bubble |
| `dialog.zoneDiscard` | <strong>Discard</strong> — 버린 카드 더미 | <strong>Discard</strong> — the pile of discarded cards | walkthrough bubble |
| `dialog.zonePlay` | <strong>Play Area</strong> — 플레이 중인 캐릭터·아이템·장소 | <strong>Play Area</strong> — characters, items, and locations in play | walkthrough bubble |
| `dialog.zoneInkwell` | <strong>Inkwell</strong> — 잉크로 사용 중인 카드 | <strong>Inkwell</strong> — cards being used as ink | walkthrough bubble |
| `dialog.gameStartBubble` | 먼저 시작하겠습니다! | I'll go first! | walkthrough bubble |
| `dialog.robinHood` | <strong>Robin Hood의 고유효과:</strong><br>챌린지로 적을 무너뜨릴 때마다<br><strong>+2 Lore</strong>를 얻어요! | <strong>Robin Hood's ability:</strong><br>Whenever he banishes another character<br>in a challenge, gain <strong>+2 Lore</strong>! | walkthrough bubble |
| `dialog.mulanEntrance` | 뮬란의 등장 효과 발동!<br>덱에서 <strong>1장 드로우</strong>한 뒤<br>핸드에서 <strong>1장을 버립니다</strong> | Mulan's entrance ability triggers!<br><strong>Draw 1 card</strong> from your deck,<br>then <strong>discard 1</strong> from your hand | walkthrough bubble |
| `dialog.actionDiscard` | <strong>Action</strong> 카드는 발동 후<br>바로 <strong>discard</strong> 로 갑니다 | An <strong>Action</strong> card goes<br>straight to the <strong>discard</strong> after it resolves | walkthrough bubble |
| `dialog.plutoBubble` | <strong>Pluto의 고유효과:</strong><br><strong>−1 잉크!</strong> 다음 캐릭터 | <strong>Pluto's ability:</strong><br><strong>−1 ink!</strong> for the next character | walkthrough bubble |
| `dialog.bodyguardBlock` | <strong>Bodyguard</strong>인<br>{name}이(가)<br>지켜주고 있어요. | <strong>Bodyguard</strong> —<br>{name} is<br>protecting it. | walkthrough bubble |
| `dialog.blockerFallback` | 캐릭터 | the character | walkthrough bubble |
| `dialog.inkNotDry` | 플레이한 턴엔 잉크가 안 말라서<br>퀘스트할 수 없어요! | The ink isn't dry the turn you play a card,<br>so it can't quest yet! | walkthrough bubble |
| `dialog.bodyguardExerted` | <strong>Bodyguard</strong>는<br>Exerted 상태로 플레이할 수 있어요 | <strong>Bodyguard</strong> can be<br>played Exerted | walkthrough bubble |
| `ui.title` | Disney Lorcana 입문 101 — 강습회 | Disney Lorcana 101 | idiomatic UI |
| `ui.prev` | ← 이전 | ← Prev | idiomatic UI |
| `ui.next` | → 다음 | Next → | idiomatic UI |
| `ui.prevTip` | 이전 (Backspace · ← · ↑ · PageUp) | Previous (Backspace · ← · ↑ · PageUp) | idiomatic UI |
| `ui.nextTip` | 다음 (Space · → · ↓ · PageDown) | Next (Space · → · ↓ · PageDown) | idiomatic UI |
| `ui.subtitle` | 자막 | Subtitles | idiomatic UI |
| `ui.dialog` | 말풍선 | Bubbles | idiomatic UI |
| `ui.font` | 글자 | Font | idiomatic UI |
| `ui.fontTip` | 설명/자막/말풍선 글자 크기 | Text size for descriptions / subtitles / bubbles | idiomatic UI |
| `ui.fontDecTip` | 작게 (−) | Smaller (−) | idiomatic UI |
| `ui.fontIncTip` | 크게 (+) | Larger (+) | idiomatic UI |
| `ui.modalClose` | 닫기 (Esc) | Close (Esc) | idiomatic UI |
| `ui.finaleCaption` | — 여러 턴 뒤 — | — Several turns later — | idiomatic UI |
