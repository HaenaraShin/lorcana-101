/* 골든 렌더 캡처 — i18n 리팩터의 "KO 100% 동일" 검증용.
 *
 * renderIntroHTML(page) 는 (CARDS, page) 의 순수 함수다. demo-board.js 전체를
 * 브라우저 없이 실행할 수 없으므로, 필요한 조각(renderIntroHTML, PAGES)만 소스에서
 * 잘라 격리 스코프(new Function)에서 실행해 모든 intro 페이지 출력을 덤프한다.
 *
 *   node test_render_golden.js          # test/golden/intro.ko.txt 생성/갱신
 *   node test_render_golden.js --check   # 골든과 현재 출력 비교(diff=0 이어야 통과)
 */
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const src = fs.readFileSync(path.join(dir, 'demo-board.js'), 'utf8');
const cardsSrc = fs.readFileSync(path.join(dir, 'cards.js'), 'utf8');
/* i18n 배선 후에는 renderIntroHTML 이 t()/MESSAGES 에 의존한다. 없으면(리팩터 전) 빈 문자열. */
const read = f => { try { return fs.readFileSync(path.join(dir, f), 'utf8'); } catch (e) { return ''; } };
const i18nSrc = read(path.join('i18n', 'i18n.js'));
const koSrc = read(path.join('i18n', 'ko.js'));

/* demo-board.js 에서 renderIntroHTML 함수 전체와 PAGES 배열 리터럴만 슬라이스 */
const renderStart = src.indexOf('function renderIntroHTML(page) {');
const renderEnd = src.indexOf('\n/* Board introduction', renderStart);
const renderSrc = src.slice(renderStart, renderEnd);

const pagesStart = src.indexOf('const PAGES = [');
const pagesEnd = src.indexOf('\n];', pagesStart) + 3;
const pagesSrc = src.slice(pagesStart, pagesEnd);

if (renderStart < 0 || renderEnd < 0 || pagesStart < 0) {
  console.error('FAIL: renderIntroHTML / PAGES 슬라이스를 찾지 못함 (소스 구조 변경?)');
  process.exit(2);
}

/* 격리 스코프에서 실행: window(카드데이터) 주입, PAGES 의 bare `fn: playBeginPhase` 스텁 */
const win = {};
const factory = new Function('window', `
  ${koSrc}
  ${i18nSrc}
  const t = window.t || ((k) => k);
  const I18N = window.I18N || { lang: 'ko' };
  ${cardsSrc}
  const CARDS = window.LORCANA_CARDS || {};
  const playBeginPhase = () => {};
  ${renderSrc}
  ${pagesSrc}
  return { renderIntroHTML, PAGES };
`);
const { renderIntroHTML, PAGES } = factory(win);

const intro = PAGES.filter(p => p.type === 'intro');
const dump = intro.map(p => `=== ${p.id} (${p.kind}) ===\n${renderIntroHTML(p)}`).join('\n\n') + '\n';

const goldPath = path.join(dir, 'test', 'golden', 'intro.ko.txt');

if (process.argv.includes('--check')) {
  if (!fs.existsSync(goldPath)) { console.error('FAIL: 골든 파일 없음. 먼저 캡처하세요.'); process.exit(2); }
  const gold = fs.readFileSync(goldPath, 'utf8');
  if (gold === dump) { console.log(`PASS: 골든 일치 (intro ${intro.length}개)`); process.exit(0); }
  /* 첫 불일치 지점 리포트 */
  const a = gold.split('\n'), b = dump.split('\n');
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) {
    console.error(`FAIL: 골든 불일치 @line ${i + 1}\n  gold: ${JSON.stringify(a[i])}\n  now : ${JSON.stringify(b[i])}`);
    break;
  }
  process.exit(1);
} else {
  fs.mkdirSync(path.dirname(goldPath), { recursive: true });
  fs.writeFileSync(goldPath, dump);
  console.log(`골든 캡처 완료: intro ${intro.length}개 → ${path.relative(dir, goldPath)}`);
}
