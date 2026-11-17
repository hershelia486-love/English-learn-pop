import re,json,cmudict
from pathlib import Path
lex=cmudict.dict();vowels={'AA':0,'AE':1,'AH':4,'AO':8,'AW':0,'AY':0,'EH':5,'ER':4,'EY':5,'IH':20,'IY':20,'OW':8,'OY':8,'UH':13,'UW':13}
onsets={'B':7,'CH':14,'D':3,'DH':3,'F':17,'G':0,'HH':18,'JH':12,'K':15,'L':5,'M':6,'N':2,'NG':11,'P':17,'R':5,'S':9,'SH':9,'T':16,'TH':9,'V':7,'Z':12,'ZH':12}
stand={'B':'브','CH':'치','D':'드','DH':'드','F':'프','G':'그','HH':'흐','JH':'지','K':'크','L':'르','M':'므','N':'느','NG':'응','P':'프','R':'르','S':'스','SH':'시','T':'트','TH':'스','V':'브','W':'우','Y':'이','Z':'즈','ZH':'지'}
finals={'N':4,'M':16,'NG':21,'L':8}
def phones_to_ko(ph):
 ph=[re.sub(r'\d','',x) for x in ph];out='';pending=[];last_v=None
 def coda(text,c):
  f={'N':4,'M':16,'NG':21,'L':8,'K':1,'P':17,'T':19}.get(c)
  if f and text and '\uac00'<=text[-1]<='\ud7a3' and (ord(text[-1])-0xac00)%28==0:return text[:-1]+chr(ord(text[-1])+f)
  return text+stand.get(c,'')
 for z in ph:
  if z not in vowels:pending.append(z);continue
  v=vowels[z];pre=pending;pending=[];glide=None
  if pre and pre[-1] in ['W','Y']:glide=pre.pop()
  c=pre.pop() if pre else None
  if c=='NG':
   out=coda(out,'NG');c=None
  if pre and out and pre[0] in finals:out=coda(out,pre.pop(0))
  if pre and pre[0]=='R':
   pre.pop(0)
   if last_v in ['IH','IY','EH','AE','AO']:out+='어'
  prefix=''.join(stand.get(t,'') for t in pre)
  if c=='L' and prefix:prefix=coda(prefix,'L')
  out+=prefix
  if glide=='W':v={0:9,1:10,4:14,5:15,20:16,8:14,13:13}.get(v,v)
  if glide=='Y':v={0:2,4:6,5:7,8:12,13:17}.get(v,v)
  if c in ['SH','ZH']:v={0:2,1:3,4:6,5:7,8:12,13:17}.get(v,v)
  o=onsets.get(c,11);out+=chr(0xac00+(o*21+v)*28)
  if z=='AW':out+='우'
  elif z in ['AY','EY','OY']:out+='이'
  last_v=z
 if pending:
  if pending[0]=='R':
   pending.pop(0)
   if last_v in ['IH','IY','EH','AE','AO']:out+='어'
  if pending and pending[0] in finals:out=coda(out,pending.pop(0))
  if pending and pending[0] in ['K','P','T'] and last_v in ['AE','EH','IH','AH','UH','AA']:
   out=coda(out,pending.pop(0))
  out+=''.join(stand.get(t,'') for t in pending)
 return out

lex=cmudict.dict()
manual=json.loads((Path(__file__).resolve().parents[1]/'data/pronunciation-overrides.json').read_text())
def word(w):
 w=w.lower().replace('’',"'")
 if w in manual:return manual[w]
 if w in lex:return phones_to_ko(lex[w][0])
 if w.startswith('un') and w[2:] in lex:return '언'+word(w[2:])
 if w.replace('ou','o') in lex:return word(w.replace('ou','o'))
 if w.endswith("'s"):return word(w[:-2])+'즈'
 if w.endswith("'d"):return word(w[:-2]+'ed')
 if w.startswith("o'er"):return '오어'+(word(w[4:]) if len(w)>4 else '')
 for suffix in ['eth','ness','ing','ly','s']:
  if w.endswith(suffix) and w[:-len(suffix)] in lex:return word(w[:-len(suffix)])+{'eth':'이스','ness':'니스','ing':'잉','ly':'리','s':'즈'}[suffix]
 raise ValueError('발음 사전에 없는 단어: '+w)
