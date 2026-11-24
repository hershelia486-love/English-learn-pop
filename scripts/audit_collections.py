"""Check new public master quotes against both published collections."""
import json
import re
import unicodedata
from difflib import SequenceMatcher

from audit_quotes import ROOT


def tokens(text):
    normalized = unicodedata.normalize("NFKC", text).casefold()
    return re.findall(r"[^\W_]+", normalized, re.UNICODE)


def overlap(left, right):
    if left == right:
        return "원문 일치"
    x, y = f" {' '.join(left)} ", f" {' '.join(right)} "
    if x in y or y in x:
        return "포함 인용"
    if min(len(left), len(right)) / max(len(left), len(right)) >= 0.74:
        score = SequenceMatcher(None, left, right).ratio()
        if score >= 0.85:
            return f"유사 문장 ({score:.0%})"
    return None


def main():
    heart = json.loads((ROOT / "quotes.json").read_text(encoding="utf-8"))
    directory = ROOT / "collections/masters"
    filenames = json.loads((directory / "manifest.json").read_text(encoding="utf-8"))
    if not isinstance(filenames, list) or not filenames or any(
        not isinstance(name, str) or not re.fullmatch(r"(quotes|batch-\d{3})\.json", name)
        for name in filenames
    ) or len(set(filenames)) != len(filenames):
        raise ValueError("거장의 문장 manifest.json 파일 목록을 확인하세요.")
    masters = []
    for name in filenames:
        rows = json.loads((directory / name).read_text(encoding="utf-8"))
        if not isinstance(rows, list):
            raise ValueError(f"{name}: 문장 배열이 필요합니다.")
        masters.extend(rows)
    seen = [(row["id"], tokens(row["quote_en"])) for row in heart]
    ids = set()
    errors = []
    findings = []
    fields = ("quote_en", "quote_ko", "pronunciation_ko", "author", "source", "source_url", "keyword")
    for row in masters:
        quote_id = row.get("id")
        if not isinstance(quote_id, str) or not re.fullmatch(r"[AHQ]-\d{4}", quote_id) or quote_id in ids:
            errors.append(f"{quote_id}: 서로 다른 A-, H-, Q- 형식 번호를 쓰세요.")
            continue
        ids.add(quote_id)
        if any(not isinstance(row.get(field), str) or not row[field].strip() for field in fields):
            errors.append(f"{quote_id}: 원문·번역·발음·저자·출처·주제를 확인하세요.")
            continue
        if not row["source_url"].startswith("https://") or row.get("source_text_checked") is not True:
            errors.append(f"{quote_id}: 원문을 대조한 뒤 출처 링크를 넣으세요.")
        tags = row.get("tags")
        if not isinstance(tags, list) or not tags or not all(isinstance(x, str) and x.strip() for x in tags):
            errors.append(f"{quote_id}: 주제를 하나 이상 넣으세요.")
        words = tokens(row["quote_en"])
        if not words:
            errors.append(f"{quote_id}: 원문에 단어가 없습니다.")
            continue
        for other_id, other_words in seen:
            match = overlap(other_words, words)
            if match:
                findings.append(f"{quote_id} / {other_id}: {match}")
        seen.append((quote_id, words))

    print(f"마음의 문장 {len(heart):,}개, 거장의 문장 {len(masters):,}개")
    print(f"거장의 문장과 겹치는 인용 후보 {len(findings)}쌍, 필드 오류 {len(errors)}건")
    for message in findings + errors:
        print(message)
    return int(bool(findings or errors))


if __name__ == "__main__":
    raise SystemExit(main())
