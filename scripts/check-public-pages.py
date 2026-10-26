from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json
import xml.etree.ElementTree as ET
class Inspect(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.urls=[];self.h1=0;self.canonical=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if 'id' in d:self.ids.append(d['id'])
  if tag=='h1':self.h1+=1
  if tag=='link' and d.get('rel')=='canonical':self.canonical.append(d.get('href'))
  for key in ('src','href'):
   if key in d:self.urls.append(d[key])
paths=[Path('dist/index.html'),*Path('dist/ua/doctors').glob('*/index.html'),Path('dist/ua/doctors/index.html'),*Path('dist/ua/blog').glob('*/index.html'),Path('dist/ua/blog/index.html'),*Path('dist/ua/services').glob('*/index.html'),Path('dist/ua/services/index.html')]
errors=[]
for p in paths:
 a=Inspect();a.feed(p.read_text())
 if len(a.ids)!=len(set(a.ids)):errors.append(str(p)+': duplicate IDs')
 if a.h1!=1:errors.append(str(p)+': H1 count '+str(a.h1))
 if len(a.canonical)!=1:errors.append(str(p)+': canonical count')
 for url in a.urls:
  u=urlsplit(url)
  if u.scheme or u.netloc:continue
  target=Path('dist')/u.path.lstrip('/') if u.path.startswith('/') else p.parent/unquote(u.path)
  if not u.path:target=p
  if not target.exists():errors.append(str(p)+': '+url)
  if u.fragment and target==p and u.fragment not in a.ids:errors.append(str(p)+': missing anchor '+url)
assert not errors,errors
assert len(list(Path('dist/ua/blog').glob('*/index.html')))==26
urls=[x.text for x in ET.parse('dist/sitemap.xml').findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
assert len(urls)==len(set(urls))
print(f'{len(paths)} pages checked; links/assets, anchors, H1 and canonical OK. {len(urls)} unique sitemap URLs.')
