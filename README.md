# 마음에 남는 영어 한 문장

팝송 학습 앱을 주제별 영어 문장 학습 앱으로 교체했습니다. ‘마음의 문장’ 1,111개와 ‘거장의 문장’을 골라 볼 수 있습니다. 각 모음은 영어, 한국어 뜻, 한글 근사 발음, 저자와 출처를 담습니다. 목록·주제 선택·한 장씩 위아래 넘기기·영어 듣기·기기 내 즐겨찾기를 지원합니다.

## 실행

저장소 루트를 정적 서버로 제공합니다. 예: `python -m http.server 8000`. 브라우저에서 localhost:8000을 엽니다. 별도 빌드나 API 키가 필요하지 않습니다. Vercel에서는 루트를 정적 사이트로 배포합니다. 영어 듣기는 기기의 브라우저 음성을 사용합니다.

## 수정과 검수

- 거장의 문장 추가·검수: [collections/masters](collections/masters/).
- 마음의 문장 기준 데이터: data/quotes.master.json.
- 문장 추가·수정 후 `python scripts/complete_quotes.py`를 실행하면 quotes.json에 복사하고 검사합니다.
- `python scripts/audit_quotes.py`로 1,111개·번호·필수 항목·정확 중복·포함 인용·유사 문구를 검사합니다.
- 구체적인 오류 수정, 출처, 확인 한계: AUDIT.md. 전후 기록: data/review-changes.json. 검사 결과: data/review-validation.json.
- 디자인 기준: DESIGN.md. 화면과 동작은 index.html에 있습니다. 예전 팝송 가사 data.js를 불러오지 않습니다.
- 발음 초안 도구: scripts/pronunciation.py와 data/pronunciation-overrides.json. 이를 사용할 때만 requirements.txt의 cmudict가 필요합니다. 초안을 만든 뒤 문맥을 확인해야 합니다.

## 내용의 한계

한글 읽기는 강세·연음을 재현하지 않는 근사 표기입니다. 1,111개 모두의 원저작·최초 발화자·번역·음성 감수를 확정한 자료가 아닙니다. 옛 철자, 문학 발췌, 당시 관점은 문맥에 맞춰 읽습니다. 출처 확인 여부와 풀이를 항목에 표시합니다. 일부 단어 설명은 해당 데이터가 있는 문장에만 나옵니다. 전체 자료의 재배포·상업 이용 권리를 일괄 보증하지 않습니다.

## 출처와 복원

교체 속담은 Walter K. Kelly 편, Proverbs of All Nations (1859)의 보관 본문에서 대조했습니다. https://www.gutenberg.org/ebooks/63190 . 발음 사전의 라이선스는 data/sources에 있습니다.

기존 팝송 버전은 archive/pop-before-quotes-20261117 브랜치와 기존 Git 기록에 보관했습니다. 저장소 이름과 공개 범위는 유지했습니다. 기존 팝송 학습 기록은 다른 형식이므로 새 명언 즐겨찾기로 자동 변환하지 않습니다. 새 앱은 seon_quote_favorites_v1 키로 이 기기에만 즐겨찾기를 저장합니다. 기존 명언 앱에서 저장한 ID 중 교체한 27개는 새 문장을 가리킵니다.
