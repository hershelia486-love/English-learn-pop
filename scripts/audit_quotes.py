"""Dataset quality gate. Run before publishing; no network required."""
import collections,difflib,hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
PATH=ROOT/'dist/quotes.json' if (ROOT/'dist/quotes.json').exists() else ROOT/'quotes.json'
def normalized(t):return ' '.join(re.findall(r'[a-z0-9]+',t.lower()))
def audit(rows):
 errors=[];groups=collections.defaultdict(list);overlaps=[];near=[]
 if len(rows)!=1111:errors.append('Expected 1111 records')
 if [x.get('id') for x in rows]!=list(range(1,1112)):errors.append('IDs must be unique 1..1111')
 for x in rows:
  for f in ['quote_en','quote_ko','pronunciation_ko','author','source','keyword']:
   if not isinstance(x.get(f),str) or not x[f].strip():errors.append(f"#{x.get('id')} missing {f}")
  if not isinstance(x.get('tags'),list) or not x['tags']:errors.append(f"#{x['id']} missing tags")
  if re.search(r'[A-Za-z{}]|준비 중|미정',x['pronunciation_ko']):errors.append(f"#{x['id']} unfinished pronunciation")
  if re.search(r'_[A-Za-z]+_',x['quote_en']):errors.append(f"#{x['id']} exposed formatting markup")
  if x.get('source_url') and not x['source_url'].startswith('https://'):errors.append(f"#{x['id']} unsafe source URL")
  groups[normalized(x['quote_en'])].append(x['id'])
 exact=[v for v in groups.values() if len(v)>1]
 if exact:errors.append('Exact duplicates: '+str(exact))
 for i,a in enumerate(rows):
  x=normalized(a['quote_en']);wx=x.split()
  for b in rows[i+1:]:
   y=normalized(b['quote_en']);wy=y.split()
   if f' {x} ' in f' {y} ' or f' {y} ' in f' {x} ':overlaps.append([a['id'],b['id']])
   # Skip impossible matches to keep large audits quick.
   if min(len(wx),len(wy))/max(len(wx),len(wy))<.74:continue
   score=difflib.SequenceMatcher(None,wx,wy).ratio()
   if score>=.85:near.append({'ids':[a['id'],b['id']],'score':round(score,4)})
 if overlaps:errors.append('Contained extracts: '+str(overlaps))
 approved={(982,1044):'excuse=변명, shift=임시 방편. 문장 틀은 비슷하지만 대상이 다르므로 유지.'}
 unresolved=[p for p in near if tuple(p['ids']) not in approved]
 if unresolved:errors.append('Unreviewed near duplicates: '+str(unresolved))
 return {'records':len(rows),'required_fields_complete':not any('missing' in e for e in errors),'exact_duplicates':exact,'contained_extracts':overlaps,'near_matches':near,'near_match_decisions':[{'ids':list(k),'reason':v} for k,v in approved.items()], 'sha256':hashlib.sha256(PATH.read_bytes()).hexdigest(),'errors':errors,'passed':not errors}
if __name__=='__main__':
 result=audit(json.loads(PATH.read_text()));print(json.dumps(result,ensure_ascii=False,indent=2))
 if not result['passed']:raise SystemExit(1)
