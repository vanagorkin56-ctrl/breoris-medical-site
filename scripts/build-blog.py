"""Build researched patient articles from separately authored editorial content."""
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
    if article:schema['@graph'][0].update({'datePublished':'2026-10-24','dateModified':'2026-10-25','citation':[x['url'] for x in article['sources']],'author':{'@type':'Organization','name':'Breoris Medical'}})
    schema['@graph'].append({'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Головна','item':ORIGIN+'/'},{'@type':'ListItem','position':2,'name':'Блог','item':ORIGIN+'/ua/blog/'}]+([{'@type':'ListItem','position':3,'name':article['title'],'item':url}] if article else [])})
    page=base.shell(root,title,description,url,ORIGIN+'/assets/breoris-medical.jpg',content,schema)
    page=page.replace('</head>',f'<link rel="stylesheet" href="{root}blog.css?v=research-1"></head>')
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
    article=layout.ARTICLES[r['slug']]
    title=article['title']
    related=[next(x for x in records if x['slug']==slug) for slug in article['related']]
    toc=''.join(f'<a href="#section-{i}">{e(section["heading"])}</a>' for i,section in enumerate(article['sections'],1))
    body=''.join(f'<section id="section-{i}"><h2>{e(section["heading"])}</h2>'+''.join('<p>'+e(p)+'</p>' for p in section['paragraphs'])+'</section>' for i,section in enumerate(article['sections'],1))
    sources='<section class="blog-sources" id="sources"><h2>Джерела</h2><ul>'+''.join(f'<li><a href="{e(source["url"])}" target="_blank" rel="noopener noreferrer">{e(source["name"])}</a></li>' for source in article['sources'])+'</ul></section>'
    content=f'''<nav class="doctor-breadcrumbs" aria-label="Навігаційний ланцюжок"><a href="../../../index.html">Головна</a><span>›</span><a href="../">Блог</a><span>›</span><span aria-current="page">{e(r['name'])}</span></nav>
<article class="blog-article"><header class="blog-intro"><p class="doctor-eyebrow">Блог Breoris Medical · {e(group)}</p><h1>{e(title)}</h1><p>{e(article['description'])}</p><p class="blog-note">Оновлено <time datetime="2026-10-25">25 жовтня 2026</time></p></header><nav class="blog-toc" aria-label="Зміст статті"><strong>У цій статті</strong>{toc}<a href="#sources">Джерела</a></nav><div class="blog-article-body">{body}<p class="blog-note">Матеріал має інформаційний характер. Діагноз, необхідність обстежень і лікування визначає лікар під час консультації.</p>{sources}<aside class="blog-appointment"><h2>{e(r['name'])} у Breoris Medical</h2><p>Лікарі, орієнтовна вартість та умови запису в Дніпрі.</p><a class="button primary" href="../../services/{e(r['slug'])}/">Переглянути послугу ↗</a><a class="text-link" href="tel:+380975323664">Уточнити в адміністратора</a></aside></div></article><section class="blog-related"><h2>Читайте також</h2><div class="blog-library-grid">{''.join(layout.card(x,next(g for g,names in catalog['groups'].items() if x['name'] in names),root='../') for x in related)}</div><a class="text-link" href="../">Усі статті блогу ↗</a></section>'''
    render(content,title+' | Breoris Medical',article['description'],'ua/blog/'+r['slug']+'/',article)
# Add, rather than replace, existing canonical service and doctor URLs.
sitemap=DIST/'sitemap.xml';ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls=[el.text for el in ET.fromstring(sitemap.read_text()).findall('s:url/s:loc',ns)]
urls=list(dict.fromkeys(urls+[ORIGIN+'/ua/blog/']+[ORIGIN+'/ua/blog/'+r['slug']+'/' for r in records]))
sitemap.write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'  <url><loc>{e(u)}</loc></url>\n' for u in urls)+'</urlset>\n')
print(f'Published blog index and {len(records)} articles from researched editorial content.')
