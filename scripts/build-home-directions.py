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
if 'home-directions.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="home-directions.css?v=20261106-adaptive3">\n</head>')
if 'home-directions.js' not in s:s=s.replace('</body>','<script src="home-directions.js?v=20261106-auto5" defer></script>\n</body>')
s=re.sub(r'i18n.js\?[^" ]+', 'i18n.js?v=directions-20261106',s)
(D/'index.html').write_text(s)
i=(D/'i18n.js').read_text();i=re.sub(r'  // home-directions:translations\n.*?\n(?=  const original)', '',i,flags=re.S)
i=i.replace('  const original =', '  // home-directions:translations\n  Object.assign(dictionaries.en, '+json.dumps(translations,ensure_ascii=False)+');\n  const original =')
(D/'i18n.js').write_text(i)
from direction_pages import build as build_direction_pages
from clinic_chrome import enhance,hide_home_sections
home=(D/'index.html').read_text()
(D/'index.html').write_text(enhance(hide_home_sections(home)))
build_direction_pages()
print('Built homepage and 6 direction pages')
