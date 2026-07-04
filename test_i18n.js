/* i18n 정적 검사 — 무빌드, 의존성 0.
 *   node test_i18n.js
 * 검사:
 *  1) 한글 잔존: demo-board.js·index.html 의 비주석·비-label 코드에 한글이 남으면 실패.
 *     (PAGES/CHAPTERS 의 label 은 KO 를 소스로 두고 t(...,fallback) 로 소비 — 허용.)
 *  2) 참조 무결성: demo-board.js 의 리터럴 t('...') 키가 ko 카탈로그에 존재.
 *  3) ko↔en 패리티(정보): 키 집합·placeholder 일치. en 미완성 구간은 경고로 리포트.
 */
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const han = /[가-힣]/;
let failed = 0;
const fail = m => { console.error('FAIL: ' + m); failed++; };

/* ---- 카탈로그 로드 ---- */
function loadCatalog(file) {
  const win = {};
  new Function('window', fs.readFileSync(path.join(dir, file), 'utf8'))(win);
  return win.MESSAGES;
}
const M = { ...loadCatalog('i18n/ko.js'), ...loadCatalog('i18n/en.js') };
const ko = M.ko, en = M.en;

/* 중첩 객체 → 평탄화 키 집합 + placeholder 집합 */
function flatten(obj, prefix, out) {
  for (const k of Object.keys(obj)) {
    const v = obj[k], key = prefix ? prefix + '.' + k : k;
    if (v && typeof v === 'object') flatten(v, key, out);
    else out[key] = String(v);
  }
  return out;
}
const koFlat = flatten(ko, '', {});
const enFlat = flatten(en, '', {});
const placeholders = s => (s.match(/\{(\w+)\}/g) || []).sort().join(',');

/* ---- 1) 한글 잔존 ---- */
function scanJs(file) {
  const L = fs.readFileSync(path.join(dir, file), 'utf8').split('\n');
  let inBlock = false;
  L.forEach((ln, i) => {
    let s = ln;
    if (inBlock) { const e = s.indexOf('*/'); if (e >= 0) { s = s.slice(e + 2); inBlock = false; } else return; }
    let code = s.replace(/\/\*.*?\*\//g, '');
    const bo = code.indexOf('/*'); if (bo >= 0) { code = code.slice(0, bo); inBlock = true; }
    code = code.replace(/\/\/.*$/, '');
    /* PAGES/CHAPTERS 의 label: '...' 값은 허용 → 제거 후 검사 */
    code = code.replace(/label:\s*'[^']*'/g, '').replace(/label:\s*"[^"]*"/g, '');
    if (han.test(code)) fail(`${file}:${i + 1} 한글 잔존 → ${ln.trim().slice(0, 80)}`);
  });
}
function scanHtml(file) {
  const src = fs.readFileSync(path.join(dir, file), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  src.split('\n').forEach((ln, i) => { if (han.test(ln)) fail(`${file}:${i + 1} 한글 잔존 → ${ln.trim().slice(0, 80)}`); });
}
scanJs('demo-board.js');
scanHtml('index.html');

/* ---- 2) 참조 무결성: 리터럴 t('...') 키가 ko 에 존재 ---- */
const src = fs.readFileSync(path.join(dir, 'demo-board.js'), 'utf8');
const litKeys = new Set();
/* '.' 로 끝나는 것은 동적 키 prefix(t('page.' + id ...)) → 리터럴 아님, 제외 */
for (const m of src.matchAll(/\bt\(\s*'([^']+)'/g)) if (!m[1].endsWith('.')) litKeys.add(m[1]);
for (const key of litKeys) {
  if (koFlat[key] === undefined) fail(`t('${key}') 키가 ko 카탈로그에 없음`);
}
/* 동적 키(page.<id>.*, chapter.<id>, pageLabel.<id>)는 prefix 로 대표 검증 */
const dyn = [...src.matchAll(/\bt\(\s*'([^']+\.)'\s*\+/g)].map(m => m[1]);
console.log(`참조: 리터럴 키 ${litKeys.size}개 검사, 동적 prefix ${[...new Set(dyn)].join(', ') || '없음'}`);

/* ---- 3) ko↔en 패리티 ---- */
const koKeys = Object.keys(koFlat), enKeys = Object.keys(enFlat);
/* pageLabel/chapter 는 ko 가 비어있고 en override → 패리티 대상에서 제외 */
const parityKey = k => !k.startsWith('pageLabel.') && !k.startsWith('chapter.');
const koSet = new Set(koKeys.filter(parityKey));
const missingEn = [...koSet].filter(k => enFlat[k] === undefined);
const extraEn = enKeys.filter(k => parityKey(k) && koFlat[k] === undefined);
extraEn.forEach(k => fail(`en 에만 있는 키(오타?): ${k}`));
/* placeholder 불일치(양쪽에 있는 키만) */
for (const k of koSet) if (enFlat[k] !== undefined && placeholders(koFlat[k]) !== placeholders(enFlat[k]))
  fail(`placeholder 불일치 @${k}: ko{${placeholders(koFlat[k])}} vs en{${placeholders(enFlat[k])}}`);

if (missingEn.length) console.warn(`\n[P1 TODO] en 미번역 키 ${missingEn.length}/${koSet.size}개 (ko 폴백 중). 예: ${missingEn.slice(0, 5).join(', ')}${missingEn.length > 5 ? ' …' : ''}`);

/* ---- 결과 ---- */
if (failed) { console.error(`\n✗ ${failed} 건 실패`); process.exit(1); }
console.log(`\n✓ 정적 검사 통과 (ko 키 ${koKeys.length}개, en 번역 ${koSet.size - missingEn.length}/${koSet.size})`);
