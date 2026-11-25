# 마음에 남는 영어 한 문장

‘마음의 문장’과 ‘거장의 문장’을 각 1,111개 읽고 듣는 영어 학습 앱입니다.

[공개 앱](https://english-learn-pop.vercel.app/) · [AI용 제작·인수인계서](docs/rebuild.md) · [기술·기능 용어와 수정 요청 예시](docs/terms.md)

## 실행

저장소를 내려받고 루트에서 실행하세요. 브라우저에서 [http://localhost:8000/](http://localhost:8000/)을 엽니다.

```sh
python3 -m http.server 8000
```

`index.html`과 문장 JSON을 그 위치 그대로 제공합니다. 빌드, API 키, 데이터베이스는 필요 없습니다. 파일을 더블클릭하면 브라우저가 JSON 읽기를 막을 수 있으므로 주소로 접속하세요. 영어 듣기는 브라우저에 있는 음성을 사용합니다.

## 자료 찾기

| 필요한 자료 | 위치 |
|---|---|
| 실행 화면, 스타일, 동작 | [index.html](index.html) |
| 재현 순서, 데이터 구조, 브라우저 검수 | [제작·인수인계서](docs/rebuild.md) |
| 실제 사용 기술과 수정 요청 문구 | [기술·기능 용어](docs/terms.md) |
| 색, 글자 크기, 모바일 배치 | [DESIGN.md](DESIGN.md) |
| 마음의 문장 편집 원본 | [data/quotes.master.json](data/quotes.master.json) |
| 거장의 문장 추가 절차 | [collections/masters/README.md](collections/masters/README.md) |
| 번역·중복 검수와 한계 | [AUDIT.md](AUDIT.md) |

## 내용 안내

한글 읽기는 근사 발음입니다. 출전 확인 범위와 번역 초안은 각 카드의 표시와 검수 기록에서 확인할 수 있습니다. 자료마다 출처와 이용 조건이 다릅니다. 발음 사전의 고지는 [data/sources](data/sources/), 화면에 적용한 Lucian 요소의 고지는 [LICENSE-LUCIAN.txt](LICENSE-LUCIAN.txt)에 있습니다.

기존 팝송 앱은 저장소의 `archive/pop-before-quotes-20261117` 브랜치와 Git 이력에 있습니다. 명언 즐겨찾기는 현재 브라우저의 `seon_quote_favorites_v1` 키에 저장합니다.
