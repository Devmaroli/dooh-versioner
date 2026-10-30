import re,json,math,sys
SRC='/workspace/uskills/layout-basic-rules.md'
md=open(SRC).read().split('\n');P=json.load(open('/tmp/presets.json'))
pre={}; [pre.setdefault(p['name'],p) for p in P]
R=lambda s:[int(v) for v in re.findall(r'\d+',s)]
secs=[];cur=None;group=''
for i,l in enumerate(md):
  if l.startswith('## ') and not l.startswith('## Index'): group=l[3:].strip()
  m=re.match(r'### (.+?) — (\d+)×(\d+)\s*$',l)
  if m: cur={'name':m[1],'w':int(m[2]),'h':int(m[3]),'group':group,'line':i,'zones':[],'cls':None,'margin':None,'same':None};secs.append(cur);continue
  if not cur: continue
  m=re.match(r'\*\*(\w+)\*\* · ([\d.:]+) · (?:margin (\d+) px|Same size as \*\*(.+?) \((.+?)\)\*\*)',l)
  if m: cur['cls']=m[1];cur['margin']=int(m[3]) if m[3] else None;cur['same']=(m[4],m[5]) if m[4] else None
  m=re.match(r'\| ([^|]+?) \| (x [\d–]+ · y [\d–]+|[\d]+–[\d]+) \| (x [\d–]+ · y [\d–]+|[\d]+–[\d]+) \|',l)
  if m:
    en,ar=R(m[2]),R(m[3]);rib=len(en)==2
    cur['zones'].append({'zone':m[1],'en':en,'ar':ar,'rib':rib,'line':i})
issues=[];edits={}  # line-> new text
def iss(s,kind,msg): issues.append((s['group'],s['name'],kind,msg))
def fmt(z):
  if z['rib']: return f"| {z['zone']} | {z['en'][0]}–{z['en'][1]} | {z['ar'][0]}–{z['ar'][1]} |"
  e,a=z['en'],z['ar'];return f"| {z['zone']} | x {e[0]}–{e[1]} · y {e[2]}–{e[3]} | x {a[0]}–{a[1]} · y {a[2]}–{a[3]} |"
changes=[]
for s in secs:
  W,H=s['w'],s['h'];p=pre.get(s['name'])
  if not p:
    cand=[q['name'] for q in P if q['w']==W and q['h']==H]
    iss(s,'name',f"not an exact preset name (same size presets: {', '.join(cand[:4]) or 'none'})")
  elif (p['w'],p['h'])!=(W,H): iss(s,'size',f"preset is {p['w']}×{p['h']}")
  if s['same'] or not s['zones']: continue
  short=min(W,H);m=s['margin'];u=short*0.01;gap=math.ceil(2*u)
  rib=s['zones'][0]['rib']
  def rect(z,k):
    v=z[k]; return (v[0],0,v[1],H) if z['rib'] else (v[0],v[2],v[1],v[3])
  for z in s['zones']:
    before=fmt(z)
    # canvas / margins
    x0,y0,x1,y1=rect(z,'en')
    if x1>W or y1>H: iss(s,'canvas',f"{z['zone']} EN x{x0}–{x1} outside {W}×{H}")
    if m and (x0<m-1 or x1>W-m+1 or (not rib and (y0<m-1 or y1>H-m+1))): iss(s,'margin',f"{z['zone']} EN outside {m}px margin")
    # mirror
    e=z['en'];a=z['ar'];full=(e[0]<=m+1 and e[1]>=W-m-1) if m else False
    exp=[W-e[1],W-e[0]]
    if [a[0],a[1]]!=exp and not (full and [a[0],a[1]]==[e[0],e[1]]):
      iss(s,'mirror',f"{z['zone']} AR x{a[0]}–{a[1]} ≠ W−x {exp[0]}–{exp[1]}");a[0],a[1]=exp
    if not z['rib'] and a[2:]!=e[2:]: iss(s,'mirror',f"{z['zone']} AR y differs from EN");a[2],a[3]=e[2],e[3]
    z['_b']=before
  # pairwise overlap / gap (EN)
  Z=s['zones']
  for i in range(len(Z)):
    for j in range(i+1,len(Z)):
      A,B=rect(Z[i],'en'),rect(Z[j],'en')
      ox=min(A[2],B[2])-max(A[0],B[0]);oy=min(A[3],B[3])-max(A[1],B[1])
      if ox>0 and oy>0: kind='overlap'
      elif ox>-gap and oy>0 and not rib and oy>0 and ox>-gap and (ox>0 or True) and min(A[2],B[2])>=max(A[0],B[0])-gap and ox<=0 and ox>-gap: kind='gapx'
      elif oy>-gap and oy<=0 and ox>0: kind='gapy'
      elif rib and ox>-gap: kind='gapx'
      else: continue
      d=(oy if kind=='gapy' else ox)
      if kind=='overlap':
        # resolve along the axis with smaller overlap
        kind='gapy' if (not rib and oy<ox) else 'gapx'; d=oy if kind=='gapy' else ox
      iss(s,'gap',f"{Z[i]['zone']} ↔ {Z[j]['zone']}: {'overlap' if d>0 else 'gap'} {abs(d) if d>0 else -d}px {'' if d>0 else ''}(need ≥{gap}px = 2u)")
      need=gap+max(d,0) if d>0 else gap+d
      need=gap+d  # total shift required
      h1=math.ceil(need/2);h2=need-h1
      if kind=='gapy':
        (first,second)=(Z[i],Z[j]) if A[1]<=B[1] else (Z[j],Z[i])
        for zz,k,dv in ((first,3,-h1),(second,2,h2)):
          zz['en'][k]+=dv;zz['ar'][k]+=dv
      else:
        (first,second)=(Z[i],Z[j]) if A[0]<=B[0] else (Z[j],Z[i])
        first['en'][1]-=h1;second['en'][0]+=h2
        for zz in (first,second):
          if not (zz['en'][0]<=(m or 0)+1 and zz['en'][1]>=W-(m or 0)-1) or zz['rib']: zz['ar'][0],zz['ar'][1]=W-zz['en'][1],W-zz['en'][0]
  for z in Z:
    if fmt(z)!=z['_b']: edits[z['line']]=fmt(z);changes.append(f"{s['name']} ({W}×{H}) · {z['zone']}: `{z['_b']}` → `{fmt(z)}`")
# library JSON for engine
lib=[]
for s in secs:
  src=s
  if s['same']:
    src=next((t for t in secs if t['name']==s['same'][0] and t['zones']),None)
  if not src or not src['zones']: continue
  W,H=src['w'],src['h']
  def key(n):
    n=n.lower()
    for k,r in [('logo','logo'),('teaser','teaser'),('headline','headline'),('hero','product'),('support','offer'),('cta','cta'),('legal','legal')]:
      if k in n: return r
    return n
  zs={}
  for z in src['zones']:
    e=z['en'];zs[key(z['zone'])]=[e[0]/W,0.0,e[1]/W,1.0] if z['rib'] else [e[0]/W,e[2]/H,e[1]/W,e[3]/H]
  lib.append({'name':s['name'],'group':s['group'],'w':s['w'],'h':s['h'],'cls':src['cls'],'marginPx':src['margin'],'ribbon':src['zones'][0]['rib'],'zones':zs,'sameAs':s['same'][0] if s['same'] else None})
json.dump(lib,open('layouts/library.json','w'),indent=1)
out=md[:]
for ln,t in edits.items(): out[ln]=t
from collections import Counter
C=Counter(k for _,_,k,_ in issues)
log=['','---','','## Changelog (validated '+__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M')+' Asia/Riyadh)','',
 'Automatic check against the real M2R presets. Rules: AR x = W − x (full-width zones stay the same); zones inside the stated margin; no overlapping zones; gap between adjacent zones ≥ 2u (u = 1% of the short side). Fixes are the smallest edits: each touching pair is split evenly around the gap, and the AR column is recomputed from EN.','',
 f'Issues found: {dict(C)}. Lines changed: {len(edits)}.','']+[f'- {c}' for c in changes]+['','### Not auto-fixed (needs your call)','']+[f'- {g} · {n}: {k} — {msg}' for g,n,k,msg in issues if k in('name','size','canvas','margin')]
open('/workspace/uskills/layout-basic-rules.fixed.md','w').write('\n'.join(out+log)+'\n')
rep=['# Validation report — dooh-all-screens-layouts','',f'Sections: {len(secs)} · with zones: {sum(1 for s in secs if s["zones"])} · same-size refs: {sum(1 for s in secs if s["same"])} · presets known: {len(pre)}','',f'Issue counts: {dict(C)}','','| Group | Screen | Check | Detail |','|---|---|---|---|']+[f'| {g} | {n} | {k} | {msg} |' for g,n,k,msg in issues]
missing=[q['name'] for q in P if q['name'] not in {s['name'] for s in secs}]
rep+=['',f'Presets with no layout section ({len(missing)}): '+', '.join(missing)]
open('/workspace/uskills/layout-validation-report.md','w').write('\n'.join(rep)+'\n')
print(dict(C),len(edits),len(lib),'missing',len(missing))
