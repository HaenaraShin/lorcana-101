# Disney Lorcana 입문 101 — 강습회 자료

Disney Lorcana TCG 초심자를 위한 웹 기반 강습 자료입니다. 슬라이드 설명과
인터랙티브 보드 시뮬레이션을 한 페이지에서 넘기며 진행합니다.

순수 정적 사이트(HTML/CSS/Vanilla JS)이며 빌드 단계·의존성 설치가 없습니다.

## 실행

로컬에서 열기:

```bash
# 저장소 클론 후
open index.html          # macOS — 브라우저로 바로 열기
# 또는 간단한 정적 서버
python3 -m http.server   # http://localhost:8000
```

진입점: `index.html` — 메인 데모(보드 시뮬레이션). 청중이 접속하는 페이지.

첫 화면에서 언어(한국어 / English)를 선택할 수 있습니다.
조작: `Space`/`→` 다음, `Backspace`/`←` 이전, `Esc` 카드 모달 닫기.
우측 하단 컨트롤에서 자막·말풍선 토글, 글자 크기 조절.

## 구조

| 파일 | 역할 |
|---|---|
| `index.html` | 메인 진입점 |
| `demo-board.js` | 페이지 진행 + 보드/카드/잉크웰/챌린지 시뮬레이션 엔진 |
| `cards.js` | 카드 데이터 |
| `demo-board.css` | 스타일 |
| `i18n/` | 다국어 카탈로그(`ko.js`/`en.js`) + `t()` 코어(`i18n.js`) |
| `res/` | 잉크 색 로고·타이틀·일루미니어 등 이미지 에셋 |
| `archived/` | 배포 매뉴얼·기획 문서 (git 추적 제외) |

## 면책 (Disclaimer)

본 자료는 **비상업·교육 목적의 팬메이드(fan-made)** 강습 자료입니다.

- *Disney Lorcana*, 관련 명칭·로고·카드 이미지·세계관은
  **Disney 및 Ravensburger의 상표·저작물**이며, 그 권리는 각 권리자에게 있습니다.
- 카드 이미지는 Ravensburger 공식 API/CDN을 참조하며, 본 저장소는 해당 콘텐츠의
  소유·재배포를 주장하지 않습니다.
- 본 프로젝트는 Disney·Ravensburger와 **무관하며 공식 승인을 받지 않았습니다.**

권리자의 요청이 있을 경우 관련 에셋·참조를 제거합니다.
