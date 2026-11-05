# -*- coding: utf-8 -*-
"""Build approved November 2026 homepage campaign and direction pages."""
from pathlib import Path
import json,re,html
ROOT=Path(__file__).resolve().parents[1]; D=ROOT/'dist'
rows=json.loads((ROOT/'data/home-directions.json').read_text())
E=html.escape
translations={'Breoris Medical — медичний центр у Дніпрі':'Breoris Medical — medical centre in Dnipro','Напрями Breoris Medical':'Breoris Medical specialties','Дізнатися більше':'Learn more','Попередній слайд':'Previous slide','Наступний слайд':'Next slide','Пауза':'Pause','Відтворити':'Play','Про Breoris Medical':'About Breoris Medical','Медичний центр у Дніпрі':'Medical centre in Dnipro','BREORIS MEDICAL / ДНІПРО':'BREORIS MEDICAL / DNIPRO','Фото клініки Breoris Medical':'Breoris Medical clinic photograph','Breoris Medical — багатопрофільний медичний центр у Дніпрі. У клініці можна отримати консультацію лікаря, пройти УЗД, функціональну та лабораторну діагностику.':'Breoris Medical is a multidisciplinary medical centre in Dnipro, offering doctor consultations, ultrasound, functional diagnostics and laboratory tests.','Неврологія, жіноче та чоловіче здоров’я, профілактика й відновлення — допоможемо обрати спеціаліста та спланувати наступний крок.':'Neurology, women’s and men’s health, prevention and rehabilitation — we help you choose a specialist and plan your next step.','Переглянути послуги':'Explore services','Рекламна візуалізація на основі фотографій клініки':'Promotional visual based on clinic photographs'}
slides=[]
for i,r in enumerate(rows):
 u=r['uk']; translations.update({v:r['en'][k] for k,v in u.items() if isinstance(v,str)})
 logo = '<div class="campaign-logo"><img src="assets/logo.png" alt="Breoris Medical"></div>' if r['slug'] != 'public-health-programmes' else ''
 slides.append(f'''<article class="direction-slide" id="direction-{i}" {'hidden' if i else ''} aria-labelledby="direction-title-{i}"><div class="direction-copy"><p class="direction-eyebrow">BREORIS MEDICAL / ДНІПРО</p><h2 id="direction-title-{i}">{E(u['title'])}</h2><p class="direction-summary">{E(u['intro'])}</p><div class="direction-actions"><button type="button" class="button direction-book" data-book>Записатися <span aria-hidden="true">↗</span></button><a class="direction-more" data-direction-link="{r['slug']}" href="ua/directions/{r['slug']}/">Дізнатися більше</a></div></div><figure class="direction-photo"><img src="{r['image']}" alt="{E(u['alt'])}" width="1536" height="1024" {'fetchpriority="high"' if i==0 else ''}>{logo}<figcaption><span class="campaign-kicker">BREORIS MEDICAL</span><strong>{E(u['title'])}</strong><span class="campaign-caption">{E(u['caption'])}</span><small>BREORIS MEDICAL / ДНІПРО</small></figcaption></figure></article>''')
hero='''<!-- home-directions:start --><section class="direction-hero" id="top" aria-label="Напрями Breoris Medical" aria-roledescription="carousel"><h1 class="visually-hidden">Breoris Medical — медичний центр у Дніпрі</h1><div class="direction-slides">'''+''.join(slides)+'''</div><div class="direction-controls"><button type="button" data-direction-prev aria-label="Попередній слайд">←</button><div class="direction-dots">'''+''.join(f'<button type="button" data-direction-index="{i}" aria-label="{E(r["uk"]["title"])}" aria-controls="direction-{i}" aria-pressed="{str(i==0).lower()}"><span></span></button>' for i,r in enumerate(rows))+'''</div><span class="direction-count" aria-hidden="true">01 / 03</span><button type="button" data-direction-next aria-label="Наступний слайд">→</button></div></section><!-- home-directions:end -->
<!-- home-about:start --><section class="home-clinic section" id="pro-nas"><img src="assets/campaigns/reception.jpg" alt="Фото клініки Breoris Medical" width="960" height="1280" loading="lazy"><div><p class="direction-eyebrow">Про Breoris Medical</p><h2>Медичний центр у Дніпрі</h2><p>Breoris Medical — багатопрофільний медичний центр у Дніпрі. У клініці можна отримати консультацію лікаря, пройти УЗД, функціональну та лабораторну діагностику.</p><p>Неврологія, жіноче та чоловіче здоров’я, профілактика й відновлення — допоможемо обрати спеціаліста та спланувати наступний крок.</p><a class="text-link" href="#poslugi">Переглянути послуги</a></div></section><!-- home-about:end -->'''
s=(D/'index.html').read_text()
if '<!-- home-directions:start -->' in s:s=re.sub(r'<!-- home-directions:start -->.*?<!-- home-about:end -->',lambda _:hero,s,flags=re.S)
else:s=re.sub(r'<section class="hero".*?</section>',lambda _:hero,s,count=1,flags=re.S)
s=re.sub(r'<section class="intro section" id="pro-nas">.*?</section>','',s,flags=re.S)
s=re.sub(r'<section class="about-detail section">.*?</section>','',s,flags=re.S)
s=re.sub(r'<link[^>]+(?:hero-motion.css|assets/motion/breoris-opening-hold.webp)[^>]*>','',s)
s=re.sub(r'<script src="hero-motion.js[^>]*></script>','',s)
if 'home-directions.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="home-directions.css?v=20261106">\n</head>')
if 'home-directions.js' not in s:s=s.replace('</body>','<script src="home-directions.js?v=20261106-auto" defer></script>\n</body>')
s=re.sub(r'i18n.js\?[^" ]+', 'i18n.js?v=directions-20261106',s)
(D/'index.html').write_text(s)
i=(D/'i18n.js').read_text();i=re.sub(r'  // home-directions:translations\n.*?\n(?=  const original)', '',i,flags=re.S)
i=i.replace('  const original =', '  // home-directions:translations\n  Object.assign(dictionaries.en, '+json.dumps(translations,ensure_ascii=False)+');\n  const original =')
(D/'i18n.js').write_text(i)
for lang in ('uk','en'):
 folder='ua' if lang=='uk' else 'en'
 for r in rows:
  c=r[lang]; target=D/folder/'directions'/r['slug'];target.mkdir(parents=True,exist_ok=True)
  home='Головна' if lang=='uk' else 'Home';call='Записатися за телефоном' if lang=='uk' else 'Call to book';details='Обговоріть ваш запит з адміністратором' if lang=='uk' else 'Discuss your needs with our administrator'
  other='en' if lang=='uk' else 'ua'; label='EN' if lang=='uk' else 'UA'
  body=''.join(f'<p>{E(p)}</p>' for p in c['paragraphs'])
  note=('<small>'+E('Рекламна візуалізація на основі фотографій клініки' if lang=='uk' else 'Promotional visual based on clinic photographs')+'</small>') if r.get('image','').startswith('assets/campaigns/') else ''
  page=f'''<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>{E(c['title'])} | Breoris Medical</title><meta name="description" content="{E(c['intro'])}"><link rel="canonical" href="https://www.breoris-medical.com/{folder}/directions/{r['slug']}/"><link rel="stylesheet" href="../../../home-directions.css?v=20261106"></head><body class="direction-page"><header><a href="../../../?lang={lang}"><img src="../../../assets/logo.png" width="150" alt="Breoris Medical"></a><nav><a href="../../../?lang={lang}">{home}</a><a href="../../../{other}/directions/{r['slug']}/" lang="{'en' if lang=='uk' else 'uk'}">{label}</a></nav></header><main><a href="../../../?lang={lang}">← {home}</a><h1>{E(c['title'])}</h1><p class="direction-lead">{E(c['intro'])}</p><figure><img src="../../../{r['image']}" alt="{E(c['alt'])}" width="1536" height="1024">{note}</figure><div class="direction-prose">{body}<h2>{details}</h2><a class="direction-page-cta" href="tel:+380975323664">{call} ↗</a><p>+380 97 532 36 64</p></div></main></body></html>'''
  (target/'index.html').write_text(page)
print('Built homepage and 6 direction pages')
