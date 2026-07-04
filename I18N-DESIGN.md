# lorcana-101 다국어(i18n) 작업계획 겸 설계서 (임시)

> 상태: **설계 단계 — 사용자 답변(§8.1) 반영·재검토 완료(2026-07-05). 아직 구현 없음.**
> 작성일: 2026-07-04
> 범위: 이번 작업은 **영어(EN) 추가**까지. 일본어(JA)는 구조만 대비하고 실제 작업은 차후.

---

## 1. 목표 / 제약

- 현재 한국어(KO) 단일 → **KO / EN / JA 3개국어** 지원. **이번엔 EN까지만.**
- 첫 페이지에서 사용자가 **언어 선택** 가능.
- **핵심 제약 — 영작이 아니라 "원문 역추적"**: Lorcana의 모든 카드·리소스는 원래 영어다. 현재 한국어는 그 영어를 번역한 것이므로, 한국어를 그대로 영작하면 **공식 원문과 다른 틀린 표현**이 된다. 따라서 각 문자열은 "번역"이 아니라 **번역되기 전 공식 영어 원문/용어를 찾아 복원**해야 한다.
  - 1차 참고: 카드 이름·효과 → `cards.js`(이미 영어), `card-db/cards.sqlite`(영어 정본 DB: `fullName`/`fullText`/`abilities`).
  - 룰 표현·용어 → 공식 문서 3종:
    - `doc/CRUpdate_2.1.0-EN.pdf` (종합 규정, 최우선 권위)
    - `doc/s1-playersguide-en.pdf` (플레이어 가이드, 서술형 표현)
    - `doc/Whispers-in-the-Well_StarterDeckA_RULES_A.pdf` (스타터 룰)

---

## 2. 현재 코드 실태 (조사 결과 요약)

- **활성 파일 3개**: `index.html` → `cards.js` + `demo-board.js` 로드, `demo-board.css` 스타일.
- **번역 대상은 사실상 2파일**: `demo-board.js`(한글 ~4,350자) + `index.html`(~160자).
  - `cards.js`: 카드 데이터 **전부 영어** — 번역 대상 아님. 보간 토큰의 영어 소스.
  - `demo-board.css`/`styles.css`: 번역 문자열 0 (한글은 전부 주석). 무시.
  - `index-legacy.html`/`app.js`: **미사용 레거시** — 제외.
- **번역 문자열 ≈ 200–260개**, 분포:
  | 표면 | 위치 | 개수 |
  |---|---|---|
  | overlay 렌더 (`renderIntroHTML`, 22개 `kind`) | demo-board.js 795–1222 | ~90–110 |
  | PAGES `label` | 567–687 | 40 |
  | PAGES `title`/`description` (transition 3개) | 577–587 | ~3블록 |
  | CHAPTERS `label` | 691–706 | 15 |
  | 자막 `setSubtitle` 호출부 | ~15개소 | ~30 |
  | 말풍선 `DIALOGS[].text` | 여러 fn 산재 | 16 |
  | index.html UI/tooltip/title/alt | index.html | ~15 |

- **렌더 구조**:
  - **intro 페이지**: `showOverlay(page)`(777) → `renderIntroHTML(page)`(795)는 `page`+`CARDS`의 **순수 함수**. 네비마다 재호출 → **언어 전환 시 재렌더 용이.**
  - **sim 페이지**: `page.fn()`이 **명령형**으로 `setSubtitle()`·`DIALOGS.push()`를 실행해 DOM에 텍스트를 굽는다. 게다가 `snapshot()`(716)이 렌더된 **HTML을 그대로 저장**하고 `restoreFromSnapshot`(758)이 복원 → prevPage·챕터점프는 **저장된 한국어 HTML을 재생**한다. ⇒ 키 기반으로 바꾸지 않으면 언어 전환이 sim 페이지에서 깨진다.

- **난점 3가지**:
  1. **인라인 HTML 마크업**이 ~70% 문자열에 존재(`<strong>`,`<br>`,`<em>`,`class="hl"`). 카탈로그가 HTML을 품어야 함.
  2. **보간 템플릿 ~20개**: 카드명·비용·카운트·상태를 `${}`로 삽입.
  3. **한국어 조사 로직**: `을(를)`, `으로/로` 같은 문법 접착이 런타임 삼항으로 들어가 있음(예: 1988). 언어별로 무너짐.

---

## 3. 설계 원칙

1. **의존성 0 유지** — 프로젝트가 무빌드 vanilla JS다. i18n 라이브러리 도입 금지. 전역 객체 + `t()` 함수로 구현.
2. **언어별 "완성문" 저장** — 문자열을 언어 간 공유하지 않는다. 각 언어가 마크업 포함 **완결된 문장**을 갖는다. 데이터 토큰(카드명·숫자)만 placeholder로 치환. ⇒ **조사/문법 문제 원천 제거**(공유 런타임 문법 없음).
3. **키 기반 카탈로그** — 모든 표면이 표시 시점에 `t(key, params)`로 텍스트를 얻는다. (§8.1 답변으로 세션 중 언어가 불변이므로, snapshot·DIALOGS의 **저장 포맷은 기존 그대로**(렌더된 HTML) 유지 — 재해석 로직 불필요.)
4. **동작 보존 우선** — KO 추출 후 화면이 **이전과 100% 동일**해야 함(가시적 변화 0). 이게 리팩터의 성공 기준.
5. **카드 데이터 계층 분리** — 카드 텍스트·이미지는 언어별로 다를 수 있음(JA 대비). EN은 base(cards.js)와 **동일**(같은 영어 이름·같은 이미지 URL). JA는 별도 db+이미지 필요. 지금은 조회 함수(`getCardImage`/`getCardText`)를 두어 훗날 언어별 override가 가능하도록만 준비.

---

## 4. 아키텍처

### 4.1 파일 구조 (신규)

```
lorcana-101/
├─ i18n/
│  ├─ i18n.js      # 언어 상태, t(key,params), localStorage, 선택 UI 배선
│  ├─ ko.js        # window.MESSAGES.ko = { ... }  (기존 한국어 추출)
│  └─ en.js        # window.MESSAGES.en = { ... }  (역추적 영어)
```

`index.html`에서 `demo-board.js`보다 **먼저** 로드 (전역 `MESSAGES`·`t` 선주입). DM 네임스페이스 관용과 동일한 전역 스크립트 방식.

### 4.2 카탈로그 형태

```js
// ko.js (발췌)
window.MESSAGES = window.MESSAGES || {};
window.MESSAGES.ko = {
  ui: { prev: '← 이전', next: '→ 다음', subtitle: '자막', dialog: '말풍선', font: '글자', title: 'Disney Lorcana 입문 101 — 강습회' },
  page: {                       // PAGES 구조에서 분리한 라벨/타이틀
    'p4-anatomy':  { label: '카드 한 장 들여다보기' },
    'p6-transition': { label: '전환', title: '그럼 실제로 게임을<br>진행하면서 배워볼까요?' },
    // ...
  },
  chapter: { 'p4-anatomy': '카드', 'sim-t1-begin': 'T1', /* ... */ },
  intro: {                      // renderIntroHTML kind별 (마크업 포함, placeholder 사용)
    'card-anatomy': { costCallout: '잉크 비용 … 이 카드는 <strong>{cost}</strong>', /* ... */ },
    'cost-exert':   { title: '잉크 비용 지불', desc: '카드를 플레이하려면 …<br>… <strong>\'play\'</strong>한다고 표현합니다.' },
    // ...
  },
  subtitle: {                   // setSubtitle 호출부 → 키+params
    'ink-add': { step: '잉크 추가', body: '<strong>{cardName}</strong>{particle} 잉크로 사용합니다.' }, // ← KO만 particle 처리
    // ...
  },
  dialog: { 'first-turn-no-draw': '<strong>선공의 첫 턴</strong>은<br>드로우를 생략합니다', /* ... */ },
};
```

- **placeholder**: `{cost}`,`{cardName}`,`{turn}`,`{player}` 등. `t('intro.card-anatomy.costCallout', {cost: card.cost})`.
- **조사 문제**: KO는 `{particle}`를 params로 미리 계산해 넘기거나, 애초에 KO 문장을 조사 무관 어순으로 재작성. **EN/JA 카탈로그는 조사 개념이 없으므로 각자 자연스러운 완성문**을 쓴다(공유 안 함).

### 4.3 `t()` 함수

```js
function t(key, params) {
  const msg = resolve(MESSAGES[currentLang], key) ?? resolve(MESSAGES.ko, key) ?? key; // KO 폴백
  return params ? msg.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? '') : msg;
}
```

- 누락 키는 **KO로 폴백**(EN 미완성 구간에서도 화면 안 깨짐) + console.warn.

### 4.4 리팩터 seam (파일:라인 기준)

| 대상 | 현재 | 변경 |
|---|---|---|
| `renderIntroHTML`(795–1222) | kind별 한글 HTML 반환 | **구조(div/grid/img)는 JS에 유지**, 텍스트 잎만 `t('intro.'+kind+'.'+subkey, {…})`로 치환. 22개 kind 전부 |
| `PAGES`(565–688) | `label`/`title`/`description` 인라인 한글 | 텍스트 제거, `id`만 유지. 표시부는 `t('page.'+id+'.label')` 등 |
| `CHAPTERS`(691–706) | `label` 한글 | `t('chapter.'+id)` |
| `setSubtitle(step,html)`(306) | 렌더 HTML 인자 | **시그니처 유지.** 호출부(~15개소)가 `setSubtitle(t('subtitle.X.step'), t('subtitle.X.body', {…}))` 형태로 전달 |
| `DIALOGS.push({text})` | 렌더 text | **구조 유지.** push 시점에 `text: t('dialog.X', {…})` — 저장 포맷 불변 |
| `snapshot()`(716) | `subtitleText`=innerHTML 저장 | **변경 없음.** 세션 중 언어 불변(§8.1-③)이므로 저장된 HTML은 항상 현재 언어 |
| `index.html` 정적 텍스트 | 하드코딩 | 초기화 시 JS로 `t()` 주입(또는 `data-i18n` 속성) |

> §8.1 답변 반영으로 원안 대비 **크게 축소**: `setSubtitleKey` 신설·`DIALOGS` textKey 저장·snapshot 포맷 변경이 전부 불필요해짐. 기존 데이터 흐름 그대로, 문자열 생산 지점만 `t()`로 바뀐다.

### 4.5 언어 전환 동작 (§8.1 반영 — 대폭 단순화)

- **주 경로**: 첫 페이지(타이틀)에서 언어 선택 → 콘텐츠 시작 → 세션 내 언어 불변.
- **전환 방식**: `setLang(lang)` → `localStorage` 저장 → **`location.reload()`**. 재시작 무관(§8.1-②③)이므로 relocalize·재해석 로직 자체가 없다. 리로드 후 저장된 언어로 초기화 → 상태·snapshot·DIALOGS 전부 자연 초기화되어 이전 언어 흔적 원천 차단.
- sim 텍스트는 실행 시점에 `t()`로 생성되므로 진행 전 구간이 선택 언어로 일관.

### 4.6 언어 선택 UI

- **첫 페이지(p1-title) 전용**(§8.1-②): 타이틀 오버레이에 언어 버튼 KO / EN 배치 (JA는 회색 "준비중"). 상시 토글 없음.
- 기본값(§8.1-①): `localStorage` 저장값 → 없으면 **KO 고정**. 자동감지 없음.

### 4.7 카드 데이터 계층 (JA 대비, 이번엔 EN=identity)

- 조회 지점을 함수로: `getCardImage(cardKey)` / `getCardText(cardKey)`.
- **EN**: base cards.js 그대로(영어 이름·동일 이미지 URL). 추가 작업 없음.
- **JA(차후)**: `cards.ja` 오버레이 + JA 이미지 URL. **미출시 카드 → 이미지 부재**: JA 이미지 없으면 **EN 이미지로 폴백**(또는 placeholder + 워터마크), 이름은 JA 있으면 JA. 이 폴백 규칙은 JA 착수 시 확정.

---

## 5. 영어 콘텐츠 저작 워크플로 (역추적)

문자열 유형별로 소스가 다르다:

| 유형 | EN 소스 |
|---|---|
| 카드 이름·버전·효과 | `cards.js` / `card-db` (이미 영어, 그대로) |
| 룰 용어(키워드·페이즈·액션) | **§6 정본 용어집** (공식 문서 기반 고정) |
| 룰 서술문(설명 장표·자막) | CR 2.1.0 → 해당 규칙의 공식 표현을 찾아 재서술. 서술 톤은 players guide 참고 |
| 스타터/입문 표현 | starter deck rules, players guide |
| UI/버튼/툴팁 | 관용 영어(Prev/Next/Subtitles/Bubbles/Font) |

**절차**: KO 문자열 각각에 대해 ① 도메인 용어는 용어집으로 치환 ② 룰 문장은 CR에서 근거 규칙을 찾아 원문 표현으로 복원(단순 직역 금지) ③ 룰 밀도 높은 항목은 카탈로그 주석에 근거(CR 조항/페이지) 병기 ④ 저작 후 자체 검수.

---

## 6. 정본 용어집 (KO → 공식 EN)

`✎` = 코드에 이미 영어로 존재.

| KO | EN | KO | EN |
|---|---|---|---|
| 잉크 / 잉크웰 | Ink / Inkwell ✎ | 시프트 | Shift ✎ |
| 잉크 비용 | (ink) cost ✎ | 비기닝 페이즈 | Beginning Phase |
| 잉크 가능/불가능 | inkable / uninkable ✎ | 메인 페이즈 | Main Phase |
| 잉크 마름 | ink drying / dried | 멀리건 | Mulligan |
| 캐릭터 | Character ✎ | 셔플 | Shuffle |
| 액션 | Action ✎ | 드로우 | Draw ✎ |
| 노래 / 부르기 | Song / Sing ✎ | 디스카드 | Discard ✎ |
| 아이템 | Item ✎ | (—) | Banish ✎ |
| 로케이션 | Location ✎ | 준비 / 사용 후 | Ready / Exerted ✎ |
| 이동 비용 | Move Cost ✎ | 선공 / 후공 | going first / second |
| 힘 (¤) | Strength ✎ | 승리 | win / VICTORY ✎ |
| 의지력 (⛉) | Willpower ✎ | (—) | Bodyguard ✎ |
| 로어 (◆) | Lore ✎ | 이름 / 버전 | Name / Version ✎ |
| 퀘스트 | Quest ✎ | 효과 / 어빌리티 | effect / ability |
| 챌린지 | Challenge ✎ | | |

- 고유명(Robin Hood, Develop Your Brain, Let It Go, Jack-Jack)·Player A/B는 영어 유지.
- 이 표는 저작 중 확장·확정(CR 대조).

---

## 7. 단계별 계획 + 검증

| 단계 | 내용 | 검증(성공 기준) |
|---|---|---|
| **P0. 인프라 + KO 추출** | i18n.js/ko.js 신설, 문자열 생산 지점을 `t()`로 치환(스냅샷·DIALOGS 포맷 불변). EN 미도입 | **골든 렌더 diff = 0**(§7.1-①) + 정적 검사(§7.1-②) + 수동 전수(§7.1-③) |
| **P1a. EN 저작 + 검토 시트** | en.js 초안 + `EN-REVIEW.md` 대조표(근거 병기) 생성 | 근거 없는 룰 문장 0(직역 플래그로 표기), 용어집 위반 grep 0, 키·placeholder 패리티 통과 |
| **P1b. 사용자 검토 게이트** | EN-REVIEW.md 사용자 검토 → 수정 반영 | **사용자 승인 전 P2 진행 금지** |
| **P2. 선택 UI** | 타이틀 페이지 언어 버튼 + `localStorage`+`reload` 전환 | EN 선택 시 전 구간 영어, KO 복귀 정상. 타이틀 외 페이지엔 선택 UI 없음 |
| **P3. 검수** | 자체 검토 → 사용자 검토 | 레이아웃 오버플로 점검, 오역·직역 점검 |
| **(차후) JA** | ja.js + JA 카드 db + 이미지 폴백 | 별도 진행 |

**권장 순서 근거**: P0(동작 보존 추출)이 가장 위험. EN 저작 전에 KO로 리팩터 무결성을 먼저 못박는다.

### 7.1 테스트 전략 (의존성 0 유지)

프로젝트에 테스트 인프라 없음. `duel-monitor`의 관용(`node test_*.js`, 프레임워크 없음)을 그대로 가져온다.

**① 골든 렌더 테스트 — P0의 핵심 검증 (자동)**
`renderIntroHTML(page)`는 순수 함수다. 이를 이용:
- **리팩터 착수 전**, 브라우저 하네스(콘솔 스니펫 또는 `test_render.html`)로 22개 intro kind 전부의 출력 HTML을 덤프 → `test/golden/intro.ko.txt`로 저장 (골든).
- 리팩터 후 같은 덤프를 떠서 **바이트 단위 diff = 0** 요구. "KO 100% 동일"을 눈이 아니라 diff로 증명.
- sim 페이지의 자막·말풍선은 순수 함수가 아니므로 골든 자동화 대상에서 제외 → ③ 수동 전수로 커버.

**② 카탈로그 정적 검사 — `test_i18n.js` (node, 자동)**
- **키 패리티**: ko/en 카탈로그 키 집합 일치 (누락·잉여 키 0).
- **placeholder 패리티**: 같은 키의 ko/en 문자열이 동일한 `{...}` 집합을 가짐 (`{cardName}`이 EN에서 빠지는 사고 방지).
- **마크업 균형**: 각 문자열의 `<strong>`/`<em>` 여닫음 짝 검사.
- **추출 완전성**: `demo-board.js`·`index.html` 소스에서 주석 제외 한글 잔존 스캔 → 0이어야 함.
- **참조 무결성**: 코드의 `t('...')` 키를 정규식 수집 → ko 카탈로그에 전부 존재.

**③ 수동 전수 통과 (KO / EN 각 1회)**
- 56페이지 전부 next로 진행 + prev·챕터점프 무작위 확인. 기존 `.screenshots/` 대조.
- EN 통과 시 레이아웃 오버플로(말풍선·컬럼·뱃지) 중점 확인.

### 7.2 EN 사전 검증 워크플로 — "배선 전 검토 게이트"

번역문을 코드에 붙이기 전에 **번역만 따로 모아 먼저 검증**한다. P1을 둘로 쪼갬:

- **P1a. EN 저작 + 검토 시트 생성**: `en.js` 초안 작성과 동시에, ko.js/en.js에서 자동 생성한 대조표 `i18n/EN-REVIEW.md`를 산출:
  | 키 | KO 원문 | EN 초안 | 근거 (CR 조항 / 가이드 p. / card-db) | 비고(직역 주의 등) |
  - 룰 문장은 근거 없는 항목이 없도록 — 근거 못 찾은 항목은 "직역" 플래그를 명시해 검토자 주의 유도.
  - 자동 용어 검사: EN 초안에서 §6 용어집 위반(예: banish 대신 destroy/defeat, exert 대신 tap) grep → 플래그.
- **P1b. 사용자 검토 게이트**: EN-REVIEW.md를 사용자가 검토·수정 지시 → 반영 후에야 P2(배선) 진행. **미검토 번역이 화면에 붙는 일 없음.**

### 7.3 번역 후 품질 유지 정책

- **용어 단일 소스**: §6 용어집이 정본. 저작 중 확정된 용어는 §6에 즉시 반영(코드 주석 아님).
- **근거 주석**: 룰 밀도 높은 en.js 항목엔 근거를 주석 병기 (`// CR §4.3.4`) — 향후 CR 개정 시 추적 가능.
- **패리티 테스트 상시화**: 문자열 추가·수정 시 `node test_i18n.js` 통과가 관례 — ko만 추가하고 en을 잊는 사고를 기계적으로 차단(§4.3 KO 폴백 + console.warn이 런타임 2차 방어).
- **JA 확장 시 재사용**: 골든 덤프·패리티 검사·검토 시트 생성이 전부 언어 무관 → ja.js도 같은 파이프라인 통과.

---

## 8. 리스크 / 미결 결정

**리스크** (§8.1 반영 후 갱신)
- **동작 보존 추출**: ~260 문자열 치환은 여전히 광범위·실수 유발. 완화: P0에서 KO 동일성 먼저 검증. ~~snapshot 포맷 변경~~ → 답변 ③으로 **불필요해져 리스크 제거**.
- **레이아웃 확장**: EN이 KO보다 길어 말풍선·뱃지·컬럼 고정폭에서 오버플로 가능. CSS 점검 필요(P3).
- **역추적 정확도**: CR 표현 못 찾으면 직역 유혹. 근거 병기로 방지.
- (신규 확인) **타이틀 페이지 언어 버튼**: 타이틀 오버레이 내 클릭 요소 추가 — 오버레이 클릭/키보드 네비게이션과 충돌하지 않는지 P2에서 확인.

**미결 결정 (사용자 판단 필요)** → **§8.1에서 전건 확정됨**
1. **기본 언어**: KO 고정 vs `navigator.language` 자동감지(첫 방문). → **KO 고정**
2. **선택 UI 위치**: 첫 페이지 전용 vs 첫 페이지+상시 토글. → **첫 페이지 전용**
3. **게임 중 언어 전환** 지원 범위: 필수 vs 첫 페이지 선택만. → **불필요 (전환=재시작 무관)**
4. **카탈로그 파일 분리** vs demo-board.js 내 인라인. → **분리**


### 8.1 사용자 답변

**미결 결정에 대한 사용자의 답변**
1. 기본언어는 KO로 고정
2. 선택 UI는 첫페이지에서만. 중간에 페이지 바꿀 일 없음. 만약 언어를 바꾼다면 처음부터 다시 시작해도 무관함.
3. 게임중 중 언어 전환 고려하지 않아도 됨. 언어를 바꾼다면 처음부터 다시 시작해도 무관함.
4. 분리하십시오. 


---

## 9. 자체 검토 (self-review) — §8.1 반영 2차 검토

- **단순함 점검**: i18n 라이브러리·빌드 도입 안 함(프로젝트 관용 유지). 카탈로그는 평범한 전역 객체. ✅ 과설계 아님.
- **가장 큰 위험은 "번역"이 아니라 "추출 리팩터"** 임을 인지 — 그래서 P0을 KO 동일성 검증으로 분리함. ✅
- **조사 문제**를 런타임 문법이 아니라 "언어별 완성문"으로 우회 — 확장(JA)에도 안전. ✅
- **2차 검토에서 수정한 판단**:
  - (a) **키 세분도 — 1차 잠정안 폐기.** "kind당 완성 HTML 1키"는 div/grid/img 구조까지 언어 파일에 복제되어, 구조 수정 시 언어 수만큼 반복 수정(구조 드리프트) 위험. → **구조는 `renderIntroHTML`(JS)에 단일 유지, 텍스트 잎(문장/문단, 인라인 `<strong>`/`<br>` 포함)만 sub-key**로 확정. "언어별 완성문" 원칙은 문장 단위에서 그대로 유효.
  - (b) 게임 중 전환 — §8.1-③으로 **확정 제거.** 언어 전환 = `localStorage`+`reload`. 이로써 1차 설계의 최고 위험 요소였던 **snapshot 포맷 변경·relocalize·setSubtitleKey·DIALOGS textKey 저장이 모두 불필요**해짐. 리팩터 표면적이 크게 줄어 P0 위험 하향.
  - (c) 카드 데이터 계층 함수화는 EN에선 identity — **이번엔 최소 스텁만**(단순함 우선), JA 때 확장. 유지.
- **재검토 후 잔여 위험**: ① ~260 문자열 치환의 기계적 실수(P0 KO 대조로 방어) ② EN 텍스트 길이로 인한 레이아웃 오버플로(P3 점검) ③ CR 역추적 누락 시 직역(근거 병기로 방어) — 모두 국소적·검증 가능.
- **결론**: **미결 0건. 이대로 진행 가능.** 승인 시 P0부터 착수.

---

## 10. 다음 액션

- 미결 4건 §8.1에서 전건 확정, 설계 반영 완료(§3-3, §4.4, §4.5, §4.6, §7, §8, §9).
- 테스트·번역 품질 전략 추가(§7.1–7.3): 골든 렌더 diff·카탈로그 정적 검사·**EN 배선 전 사용자 검토 게이트(P1b)**.
- 2차 자체 검토 결론: **진행 가능** — 잔여 위험은 국소적이고 각 단계 검증으로 방어됨.
- **최종 진행 승인 대기.** 승인 시 P0(인프라 + KO 추출)부터 착수. 구현은 지시 전까지 보류.
- 착수 순서 요약: 골든 캡처(리팩터 전!) → P0 → P1a → **P1b 검토 게이트** → P2 → P3.
