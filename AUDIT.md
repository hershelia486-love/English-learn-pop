# 문장 검수 기록 — 2026-11-17

총 1,111개를 유지했다. 기존의 포함 인용·유사 문구 27개를 다른 전승 속담으로 교체했다. 번호는 유지했으므로 해당 번호의 즐겨찾기는 교체한 문장을 가리킨다. `data/review-changes.json`에 전후 값을 보관했다.

## 실제 수정

- #452 sharpen his tools: “연장을 벌려야” → “연장을 갈아야”. mechanic의 옛 뜻은 장인.
- #481 mortified mine: 상처받은 사람은 남자가 아닌 화자. 번역의 주체를 고쳤다.
- #743 not without: 이중부정을 반대로 옮긴 번역을 수정하고, 뜻을 완성하는 but rather 절을 복원했다. [원문 On Freedom](https://gutenberg.net.au/ebooks02/0200061h.html).
- #704 fortnight: 보름(15일)이 아닌 2주(14일). [Boswell의 기록](https://www.gutenberg.org/cache/epub/9180/pg9180.html).
- #136 투기 문장: 빠진 뒤 절을 복원했다. [University of Virginia Mark Twain 자료](https://twain.lib.virginia.edu/wilson/pwequat.html).
- #32 any she는 사랑 일반이 아닌 여인. #281 sextillions를 수십억으로 옮긴 수량 오류도 바로잡았다.
- Boswell은 기록자, Johnson은 발화자라는 차이를 저자·출처에 반영했다. #155는 Johnson의 에세이로 출전을 분리했으나 정확한 판본 대조는 추가로 필요하다.
- 처음 발화자를 입증하지 못한 일부 속담의 Aesop·Franklin 등 단정적 귀속을 제거했다.
- #766, #771의 원문 강조용 밑줄과 #767의 따옴표 범위를 고쳤다.
- 발음 생성기의 W, R, NG 누락과 자음군 처리를 고치고 단어 예외 사전을 보완했다. wind(바람), wound(상처), bow(활), lives(삶들/산다), use(명사/동사)는 문맥도 확인했다. 한글 표기는 근사치이며 전문가 음성 감수 완료를 뜻하지 않는다.
- #17 i’=in, #721 옛 등장인물의 비표준 어법, #1073 Scots no=not는 원문을 보존하고 풀이를 달았다.

## 검사 범위와 결과

`python scripts/audit_quotes.py`는 필수 항목, 고유 번호, 남은 영어·임시 발음 표시, 강조 기호 노출, 정확 중복, 긴 문장에 포함된 짧은 인용, 단어 유사도 85% 이상을 검사한다. 결과는 `data/review-validation.json`에 있다. 정확 중복과 포함 인용은 0개. #982 변명(excuse)와 #1044 임시 방편(shift)은 문장 틀은 비슷하지만 대상이 달라 유지했다. 이 검사는 모든 의미상 중복을 찾아낸다는 보장이 아니다.

영어·한국어 뜻을 전체적으로 읽어 검토하고 의심 항목은 공개 원문과 비교했다. 1,111개 모두의 최초 출전·판본·발음·번역을 학술적으로 확정한 검수는 아니다. `verified:false`와 확인 한계를 유지한다. 긴 문학 발췌와 당시의 편견은 오늘의 행동 지침으로 읽지 않는다.

브라우저에서 문장 검색, 고친 번역과 한글 읽기, 긴 문장 카드, 접히는 출처와 풀이를 확인했다. 실제 휴대폰 터치와 기기별 음성 재생은 별도 확인이 필요하다.

## 재검수

`data/quotes.master.json`이 기준 파일이다. 편집 후 `python scripts/complete_quotes.py`로 제공 JSON을 갱신한다. 중복을 다시 넣던 예전 자동 선택 생성기는 사용하지 않는다. pronunciation.py와 예외 사전은 새 문장의 초안 발음을 만드는 보조 자료다. 생성 후 문맥을 검토한다.
