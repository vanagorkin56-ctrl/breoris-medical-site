"""Publish the existing patient information as a searchable blog, without new medical claims."""
import sys
sys.dont_write_bytecode=True
import importlib.util
import json
import subprocess
import html
from pathlib import Path
import xml.etree.ElementTree as ET
import mobile_layout as layout

ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist'
records=json.loads((ROOT/'data/services.json').read_text())
catalog=json.loads(subprocess.check_output(['node','-e','console.log(JSON.stringify(require("./dist/data.js")))'],cwd=ROOT))
(DIST/'index.html').write_text(layout.enhance_home((DIST/'index.html').read_text(),records,catalog))
spec=importlib.util.spec_from_file_location('doctor_builder',ROOT/'scripts/build-doctors.py');base=importlib.util.module_from_spec(spec);spec.loader.exec_module(base)
e=lambda s:html.escape(str(s),quote=True)
ORIGIN=base.ORIGIN

def render(content,title,description,path,article=None):
    root='../../../' if article else '../../'
    url=ORIGIN+'/'+path
    schema={'@context':'https://schema.org','@graph':[{'@type':'BlogPosting' if article else 'CollectionPage','@id':url,'url':url,'name':title,'headline':title,'description':description,'inLanguage':'uk','publisher':{'@type':'Organization','name':'Breoris Medical','url':ORIGIN+'/'}}]}
    if article:schema['@graph'][0].update({'datePublished':'2026-10-24','author':{'@type':'Organization','name':'Breoris Medical'}})
    schema['@graph'].append({'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Головна','item':ORIGIN+'/'},{'@type':'ListItem','position':2,'name':'Блог','item':ORIGIN+'/ua/blog/'}]+([{'@type':'ListItem','position':3,'name':article['title'],'item':url}] if article else [])})
    page=base.shell(root,title,description,url,ORIGIN+'/assets/breoris-medical.jpg',content,schema)
    page=page.replace('</head>',f'<link rel="stylesheet" href="{root}blog.css?v=1"></head>')
    if not article:page=page.replace('</body>',f'<script src="{root}blog.js?v=1" defer></script></body>')
    target=DIST/path/'index.html';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(page)

crumb='<nav class="doctor-breadcrumbs" aria-label="Навігаційний ланцюжок"><a href="../../index.html">Головна</a><span>›</span><span aria-current="page">Блог</span></nav>'
groups=list(catalog['groups'])
filters='<button type="button" data-blog-filter="all" aria-pressed="true">Усі теми</button>'+''.join(f'<button type="button" data-blog-filter="{e(g)}" aria-pressed="false">{e(g)}</button>' for g in groups)
cards=''.join(layout.card(r,next(g for g,names in catalog['groups'].items() if r['name'] in names),root='') for r in records)
hub=crumb+f'<section class="blog-intro"><p class="doctor-eyebrow">BREORIS MEDICAL · Дніпро</p><h1>Блог клініки</h1><p>Що варто знати про консультацію, обстеження та підготовку до візиту. Знайдіть матеріал за напрямом або назвою.</p></section><section class="blog-library" aria-label="Статті блогу"><div class="blog-search" hidden><label for="blog-search">Знайти статтю</label><input id="blog-search" type="search" placeholder="Наприклад: УЗД або невролог" aria-controls="blog-library-grid"><div class="blog-filters">{filters}</div><p class="blog-results" role="status" aria-live="polite"></p></div><div class="blog-library-grid" id="blog-library-grid">{cards}</div><p class="blog-no-results" hidden>Нічого не знайдено. Спробуйте іншу назву або іншу категорію.</p></section>'
render(hub,'Блог медичної клініки у Дніпрі — Breoris Medical','Статті Breoris Medical про консультації лікарів, обстеження та підготовку до візиту. Пошук матеріалів за напрямами.','ua/blog/')
for r in records:
    group=next(g for g,names in catalog['groups'].items() if r['name'] in names)
    title=layout.blog_title(r)
    related=[x for x in records if x!=r and x['name'] in catalog['groups'][group]][:3]
    source={'uzd':('Інформація NHS про УЗД','https://www.nhs.uk/tests-and-treatments/ultrasound-scan/'),'eeh':('Інформація NHS про ЕЕГ','https://www.nhs.uk/tests-and-treatments/electroencephalogram/')}.get(r['slug'])
    sources=f'<p class="blog-note">Додаткова інформація: <a href="{source[1]}" target="_blank" rel="noopener noreferrer">{source[0]} ↗</a></p>' if source else ''
    content=f'''<nav class="doctor-breadcrumbs" aria-label="Навігаційний ланцюжок"><a href="../../../index.html">Головна</a><span>›</span><a href="../">Блог</a><span>›</span><span aria-current="page">{e(r['title'])}</span></nav>
<article class="blog-article"><header class="blog-intro"><p class="doctor-eyebrow">Блог Breoris Medical · {e(group)}</p><h1>{e(title)}</h1><p>{e(r['intro'])}</p></header><nav class="blog-toc" aria-label="Зміст статті"><strong>У цій статті</strong><a href="#questions">З якими питаннями звертаються</a><a href="#visit">Як проходить візит</a><a href="#preparation">Підготовка</a><a href="#faq">Поширене запитання</a></nav><div class="blog-article-body"><section id="questions"><h2>З якими питаннями звертаються</h2><ul>{''.join('<li>'+e(x)+'</li>' for x in r['scope'])}</ul></section><section id="visit"><h2>Як проходить візит</h2><p>{e(r['visit'])}</p></section><section id="preparation"><h2>Як підготуватися</h2><p>{e(r['preparation'])}</p></section><section id="faq"><h2>{e(r['faq']['question'])}</h2><p>{e(r['faq']['answer'])}</p></section><p class="blog-note">Це загальна інформація для підготовки до візиту. Індивідуальні рекомендації та необхідність обстежень визначає лікар.</p>{sources}<aside class="blog-appointment"><h2>Плануєте візит?</h2><p>Перегляньте лікарів, орієнтовну вартість та умови запису за цим напрямом.</p><a class="button primary" href="../../services/{e(r['slug'])}/">Послуга, лікарі та ціни ↗</a><a class="text-link" href="tel:+380975323664">Уточнити в адміністратора</a></aside></div></article><section class="blog-related"><h2>Інші матеріали</h2><div class="blog-library-grid">{''.join(layout.card(x,group,root='../') for x in related)}</div><a class="text-link" href="../">Усі статті блогу ↗</a></section>'''
    render(content,title+' — Breoris Medical',r['intro'][:155],'ua/blog/'+r['slug']+'/',r)
# Add, rather than replace, existing canonical service and doctor URLs.
sitemap=DIST/'sitemap.xml';ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls=[el.text for el in ET.fromstring(sitemap.read_text()).findall('s:url/s:loc',ns)]
urls=list(dict.fromkeys(urls+[ORIGIN+'/ua/blog/']+[ORIGIN+'/ua/blog/'+r['slug']+'/' for r in records]))
sitemap.write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'  <url><loc>{e(u)}</loc></url>\n' for u in urls)+'</urlset>\n')
print(f'Published blog index and {len(records)} articles from existing clinic materials.')
