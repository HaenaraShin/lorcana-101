/* 다국어 코어 — 의존성 0, 무빌드. demo-board.js 보다 먼저 로드된다.
 *
 * 문자열은 window.MESSAGES[lang] 에 언어별 "완성문"으로 저장(언어 간 공유 안 함).
 * 표시 지점은 t(key, params) 로 텍스트를 얻는다. 세션 중 언어는 불변(전환 = reload).
 */
(function () {
  const FALLBACK = 'ko';
  const KEY = 'lorcana101.lang';

  let lang = FALLBACK;
  try { const s = localStorage.getItem(KEY); if (s) lang = s; } catch (e) { /* node/no-storage */ }

  function resolve(obj, key) {
    if (obj == null) return undefined;
    return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }

  /* t('a.b.c', {name}, fallback) — 누락 키는 ko 폴백 → 그래도 없으면
   *   fallback(있으면) → 없으면 key 문자열 반환 + 경고.
   * fallback 은 PAGES/CHAPTERS 의 label 처럼 KO 를 소스로 두는 chrome 에 쓴다
   *   (ko 카탈로그엔 없고, 인자로 넘긴 KO 라벨이 기본값; en 카탈로그가 있으면 override).
   * 카탈로그에 빈 문자열('')로 저장된 값은 "의도된 없음"으로 그대로 반환(경고 없음). */
  window.t = function t(key, params, fallback) {
    const M = window.MESSAGES || {};
    let msg = resolve(M[lang], key);
    if (msg == null) {
      msg = resolve(M[FALLBACK], key);
      if (msg == null) {
        if (fallback != null) { msg = fallback; }
        else { console.warn('[i18n] missing key:', key); return key; }
      } else if (lang !== FALLBACK) { console.warn('[i18n] fallback→ko:', key); }
    }
    if (params) msg = String(msg).replace(/\{(\w+)\}/g, (_, k) => (params[k] != null ? params[k] : ''));
    return msg;
  };

  window.I18N = {
    get lang() { return lang; },
    available: ['ko', 'en'],           // ja 는 차후
    /* 언어 변경 후 새로고침 — 세션 상태·스냅샷을 자연 초기화해 이전 언어 잔재 차단 */
    set(l) {
      try { localStorage.setItem(KEY, l); } catch (e) { /* ignore */ }
      lang = l;
      if (typeof location !== 'undefined' && location.reload) location.reload();
    },
  };

  /* 언어 선택 버튼(타이틀 페이지, [data-lang]) — 위임 방식이라 오버레이가
     나중에 innerHTML 로 렌더돼도 동작. 같은 언어 클릭은 무시. */
  if (typeof document !== 'undefined') {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest && e.target.closest('[data-lang]');
      if (!btn || btn.disabled) return;
      const l = btn.getAttribute('data-lang');
      if (l && l !== lang) window.I18N.set(l);
    });
  }

  /* 정적 DOM 텍스트 주입 — index.html 의 [data-i18n](textContent) / [data-i18n-title](title).
     스크립트가 body 끝에서 로드되어 대상 요소는 이미 파싱됨. */
  if (typeof document !== 'undefined') {
    const applyStatic = () => {
      document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = window.t(el.getAttribute('data-i18n')); });
      document.querySelectorAll('[data-i18n-title]').forEach(el => { el.setAttribute('title', window.t(el.getAttribute('data-i18n-title'))); });
      const M = window.MESSAGES || {};
      const hasTitle = (M[lang] && M[lang].ui && M[lang].ui.title) || (M[FALLBACK] && M[FALLBACK].ui && M[FALLBACK].ui.title);
      if (hasTitle) document.title = window.t('ui.title');
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyStatic);
    else applyStatic();
  }
})();
