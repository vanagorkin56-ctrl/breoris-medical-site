"""Build the clinic's service pages from reviewed, editable content records."""
import html
import sys
sys.dont_write_bytecode = True
import importlib.util
import json
import re
import service_discovery as discovery
import mobile_layout
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
spec=importlib.util.spec_from_file_location('doctor_builder',ROOT/'scripts/build-doctors.py')
base=importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)
records=json.loads((ROOT/'data/services.json').read_text())
# Reuse the actual homepage roster, including doctors without a separate profile.
import subprocess
catalog=json.loads(subprocess.check_output(['node','-e','console.log(JSON.stringify(require("./dist/data.js")))'],cwd=ROOT))
routes=json.loads((DIST/'doctor-routes.js').read_text().split(' = ',1)[1].strip().rstrip(';'))
e=lambda s:html.escape(str(s),quote=True)
ORIGIN=base.ORIGIN
price_data=discovery.prices(ROOT)
by_name={x['name']:x for x in records}
assert set(by_name)=={name for names in catalog['groups'].values() for name in names}
service_routes={x['name']:f"ua/services/{x['slug']}/" for x in records}

def render(content,title,description,path):
    url=ORIGIN+'/'+path
    schema={'@context':'https://schema.org','@graph':[{'@type':'WebPage','@id':url,'url':url,'name':title,'description':description,'inLanguage':'uk','about':{'@type':'MedicalClinic','name':'Breoris Medical','url':ORIGIN+'/'}},{'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Головна','item':ORIGIN+'/'},{'@type':'ListItem','position':2,'name':'Послуги','item':ORIGIN+'/ua/services/'}]+([{'@type':'ListItem','position':3,'name':title,'item':url}] if path!='ua/services/' else [])}]}
    root='../../../' if path!='ua/services/' else '../../'
    page=base.shell(root,title,description,url,ORIGIN+'/assets/breoris-medical.jpg',content,schema)
    page=page.replace('</head>',f'<link rel="stylesheet" href="{root}service-pages.css?v=1"><link rel="stylesheet" href="{root}service-explorer.css?v=2"><link rel="stylesheet" href="{root}blog.css?v=1"></head>')
    target=DIST/path/'index.html';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(page)

hub='<nav class="doctor-breadcrumbs" aria-label="Навігаційний ланцюжок"><a href="../../index.html">Головна</a><span>›</span><span aria-current="page">Послуги</span></nav><section class="service-intro"><p class="doctor-eyebrow">BREORIS MEDICAL · Дніпро</p><h1>Напрями та послуги клініки</h1><p>Дізнайтеся, як проходить консультація або обстеження, що взяти із собою та як погодити візит. Оберіть потрібний напрям.</p></section>'
hub+=discovery.homepage(records,catalog,price_data).replace('href="ua/services/', 'href="').replace('class="services service-explorer section"', 'class="services service-explorer section" data-show-all="true"')
hub+='<script src="../../service-explorer.js?v=1" defer></script>'
render(hub,'Медичні послуги у Дніпрі — Breoris Medical','Консультації лікарів, УЗД, аналізи, check-up і відновлення у Breoris Medical у Дніпрі: опис напрямів, підготовка та запис.','ua/services/')
for r in records:
    name=r['name'];path=service_routes[name];group=next(g for g,n in catalog['groups'].items() if name in n)
    related=[by_name[n] for n in catalog['groups'][group] if n!=name]
    doctor_cards=[]
    for d in catalog['doctors']:
        if name not in d['services']:continue
        profile=routes.get(d['id'])
        heading=f'<a href="../../../{e(profile)}">{e(d["name"])}</a>' if profile else e(d['name'])
        doctor_cards.append(f'<article class="service-doctor"><h3>{heading}</h3><p>{e(d["role"])}</p><button class="button outline" type="button" data-doctor="{e(d["id"])}">Записатися до лікаря</button></article>')
    doctors=('<section><h2>Лікарі цього напряму</h2><div class="service-directory-grid">'+''.join(doctor_cards)+'</div></section>') if doctor_cards else ''
    source={'uzd':('Ультразвукова діагностика: інформація для пацієнтів NHS','https://www.nhs.uk/tests-and-treatments/ultrasound-scan/'),'eeh':('ЕЕГ: інформація для пацієнтів NHS','https://www.nhs.uk/tests-and-treatments/electroencephalogram/')}.get(r['slug'])
    source_html=f'<p class="service-source">Додаткова інформація: <a href="{source[1]}" target="_blank" rel="noopener noreferrer">{source[0]} ↗</a></p>' if source else ''
    content=f'''<nav class="doctor-breadcrumbs" aria-label="Навігаційний ланцюжок"><a href="../../../index.html">Головна</a><span>›</span><a href="../">Послуги</a><span>›</span><span aria-current="page">{e(name)}</span></nav>
<article class="service-article"><header class="service-intro"><p class="doctor-eyebrow">BREORIS MEDICAL · {e(group)}</p><h1>{e(r['title'])} у Дніпрі</h1><p>{e(r['intro'])}</p><div class="service-actions"><button class="button primary" type="button" data-service="{e(name)}">Записатися</button><a class="text-link" href="tel:+380975323664">+380 97 532 36 64</a></div><p class="service-location">Дніпро, вул. Української Добровольчої армії, 2-Б</p></header>
<div class="service-body"><section><h2>З якими питаннями допоможемо</h2><ul>{''.join('<li>'+e(s)+'</li>' for s in r['scope'])}</ul></section><section class="service-blog-link"><h2>Про візит і підготовку</h2><p>Як проходить візит, що взяти із собою та що уточнити перед прийомом — у матеріалі нашого блогу.</p><a href="../../blog/{e(r['slug'])}/">{e(mobile_layout.blog_title(r))} ↗</a></section>{doctors}<section><h2>Вартість і запис</h2>{discovery.price_section(name,price_data)}<p>Для лікарів із розкладом Health24 сайт показує доступні дати й час. Для інших спеціалістів можна обрати бажане вікно та залишити заявку: прийом підтвердить адміністратор. Якщо потрібної послуги або часу немає у формі, зателефонуйте до клініки.</p></section><section><h2>Поширене запитання</h2><details class="service-faq"><summary>{e(r['faq']['question'])}</summary><p>{e(r['faq']['answer'])}</p></details></section>{source_html}<section><h2>Інші послуги цього напряму</h2><div class="service-related">{''.join(f'<a href="../{e(x["slug"])}/">{e(x["name"])}</a>' for x in related)}</div><a class="text-link" href="../">Усі напрями клініки ↗</a></section></div></article>'''
    description=f"{r['title']} у Breoris Medical у Дніпрі. Дізнайтеся про формат візиту, підготовку, лікарів та умови запису до клініки."
    render(content,r['title']+' у Дніпрі — Breoris Medical',description,path)
(DIST/'service-routes.js').write_text('/* Generated by scripts/build-services.py. */\nwindow.BreorisServiceRoutes = '+json.dumps(service_routes,ensure_ascii=False,indent=2)+';\n')
# Persist links in homepage HTML: the directory remains discoverable without JS.
home=(DIST/'index.html').read_text()
start='<!-- service-directory:start -->';end='<!-- service-directory:end -->'
block=discovery.homepage(records,catalog,price_data)
# Remove the previous tabbed list and its duplicate directory, then put the
# complete linked catalogue immediately after the preserved hero film.
home=re.sub(r'<section class="services section" id="poslugi">[\s\S]*?</section>', '', home)
if start in home:home=home[:home.index(start)]+home[home.index(end)+len(end):]
hero_end=home.index('</section>',home.index('<section class="hero"'))+len('</section>')
home=home[:hero_end]+'\n  '+block+home[hero_end:]
# Put the existing roster beside service discovery; preserve IDs and all booking hooks.
match=re.search(r'<section class="doctors section"[\s\S]*?</section>',home)
if match:
    doctors_section=match.group()
    home=home[:match.start()]+home[match.end():]
    position=home.index(end)+len(end)
    home=home[:position]+'\n  '+doctors_section+home[position:]
if 'service-explorer.css' not in home:home=home.replace('</head>','<link rel="stylesheet" href="service-explorer.css?v=2">\n</head>')
if 'service-explorer.js' not in home:home=home.replace('<script src="app.js', '<script src="service-explorer.js?v=1" defer></script>\n<script src="app.js')
home=home.replace('app.js?v=5','app.js?v=6')
home=mobile_layout.enhance_home(home,records,catalog)
(DIST/'index.html').write_text(home)
# Preserve all existing doctor URLs when adding the service URLs.
import xml.etree.ElementTree as ET
sitemap=DIST/'sitemap.xml';ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls=[el.text for el in ET.fromstring(sitemap.read_text()).findall('s:url/s:loc',ns)]
urls=list(dict.fromkeys(urls+[ORIGIN+'/ua/services/']+[ORIGIN+'/'+p for p in service_routes.values()]))
sitemap.write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'  <url><loc>{e(u)}</loc></url>\n' for u in urls)+'</urlset>\n')
print(f'Generated {len(records)} service pages, directory, homepage links and sitemap.')
