"""Branded UA/EN direction pages using the clinic's shared booking flow."""
from pathlib import Path
import json,html
import xml.etree.ElementTree as ET
from clinic_chrome import enhance
from editorial_accents import marked,HERO_TERMS
from home_campaign import ARROW
ROOT=Path(__file__).resolve().parents[1]
E=lambda value:html.escape(str(value),quote=True)
GROUPS={
 'neurology-center':[(('Про центр','About the centre'),[0,1]),(('З чим звертаються','Conditions we see'),[2]),(('Команда та відновлення','Team and rehabilitation'),[3,4])],
 'women-men-health':[(('Комплексний підхід','A comprehensive approach'),[0]),(('Фахівці','Our specialists'),[1]),(('Профілактика та лікування','Prevention and treatment'),[2])],
 'public-health-programmes':[(('Програма медичних гарантій','Medical Guarantees Programme'),[0,4]),(('Первинна допомога та скринінг','Primary care and screening'),[1,2]),(('Умови участі','Eligibility and arrangements'),[3])],
 'ekopfo-preparation':[(('З чого почати','Getting started'),[0,1]),(('Обстеження та консультації','Examinations and consultations'),[2]),(('Повторна консультація','Follow-up consultation'),[3]),(('Документи та направлення','Documents and referral'),[4,7]),(('Вартість підготовки','Preparation fees'),[5,6])]
}
BODY_TERMS={
 'uk':['Наталії Валеріївни Томах','комплексній діагностиці','головним болем і мігренню','мультидисциплінарний підхід','індивідуального плану лікування та відновлення','здоров’я жінки та чоловіка комплексно','гінекологи, урологи, ендокринологи, кардіологи','профілактичних обстежень','Програми медичних гарантій','декларацію з терапевтом','первинну медичну допомогу','скринінгу здоров’я 40+','Послуги поза умовами програми можуть бути платними.'],
 'en':['Nataliia Tomakh','comprehensive diagnosis','headaches and migraine','multidisciplinary approach','individual treatment and rehabilitation plan','women’s and men’s health as a whole','Gynaecologists, urologists, endocrinologists, cardiologists','preventive examinations','Medical Guarantees Programme','declaration with a physician','primary care','health screening for people aged 40+','Services outside programme coverage may be chargeable.']
}

def build(slugs=None):
 rows=json.loads((ROOT/'data/home-directions.json').read_text())
 selected=[r for r in rows if slugs is None or r['slug'] in slugs]
 if slugs and {r['slug'] for r in selected}!=set(slugs):raise ValueError('Unknown direction slug')
 for lang in ('uk','en'):
  en=lang=='en';folder='en' if en else 'ua';root='../../../';book='Book an appointment' if en else 'Записатися';home='Home' if en else 'Головна'
  labels=['About the clinic','Services','Doctors','Contacts','Blog'] if en else ['Про клініку','Послуги','Лікарі','Контакти','Блог']
  urls=[f'{root}?lang={lang}#pro-nas',f'{root}?lang={lang}#poslugi',f'{root}?lang={lang}#likari',f'{root}?lang={lang}#map',f'{root}ua/blog/']
  nav=''.join(f'<a href="{url}">{label}</a>' for url,label in zip(urls,labels))
  for r in selected:
   c=r[lang];slug=r['slug'];other='ua' if en else 'en';locale_index=1 if en else 0
   options=''.join(f'<option value="{code}" {"selected" if code==lang else ""}>{label}</option>' for code,label in [('uk','UA'),('en','EN')])
   menu='Open menu' if en else 'Відкрити меню'
   header=f'<header class="header"><a class="brand" href="{root}?lang={lang}" aria-label="Breoris Medical — {home}"><img src="{root}assets/logo.png" width="184" height="86" alt="Breoris Medical"></a><nav id="navigation" aria-label="{"Main navigation" if en else "Головна навігація"}">{nav}</nav><div class="header-actions"><select class="language-select" aria-label="{"Language" if en else "Мова сайту"}">{options}</select><a class="header-phone" href="tel:+380975323664">{"Call the clinic" if en else "Зателефонувати"}</a><button class="button primary" type="button" data-book>{book}<span aria-hidden="true">↗</span></button><button class="menu-toggle" aria-label="{menu}" aria-controls="navigation" aria-expanded="false"><span></span><span></span></button></div></header>'
   sections=''.join('<section class="direction-text-section"><h2>'+E(label[locale_index])+'</h2><div>'+''.join('<p>'+marked(c['paragraphs'][i],BODY_TERMS[lang])+'</p>' for i in indexes)+'</div></section>' for label,indexes in GROUPS[slug])
   context=' data-service="'+E(r['bookingService'])+'"' if r.get('bookingService') else ' data-service="Неврологія"' if slug=='neurology-center' else ''
   note=c.get('imageNote') or ('Promotional visual based on clinic photographs' if en else 'Рекламна візуалізація на основі фотографій клініки')
   cta_title=c.get('ctaTitle') or ('Arrange your visit' if en else 'Заплануйте візит')
   cta_text=c.get('ctaText') or ('Choose a doctor and time in our booking form.' if en else 'Оберіть лікаря та час у формі запису.')
   if r.get('sources'):
    ministry_links=' · '.join('<a href="'+E(source['url'])+'" target="_blank" rel="noopener noreferrer">'+(('Ministry of Health: documents' if index==0 else 'Ministry of Health: patient pathway') if en else ('МОЗ: документи' if index==0 else 'МОЗ: маршрут пацієнта'))+'</a>' for index,source in enumerate(r['sources'][1:]))
    sections+='<section class="direction-text-section"><h2>'+('Sources' if en else 'Джерела')+'</h2><div><p>'+('Service stages and fees are based on materials supplied by Breoris Medical. Official information on the assessment process: ' if en else 'Етапи та вартість послуги — за матеріалами Breoris Medical. Офіційна інформація про порядок оцінювання: ')+ministry_links+'.</p></div></section>'
   more='Other specialties' if en else 'Інші напрями'
   related=''.join(f'<a href="../{x["slug"]}/"><span>{E(x[lang]["title"])}</span><span aria-hidden="true">↗</span></a>' for x in rows if x['slug']!=slug)
   main=f'''<main id="main" class="direction-detail-main"><div class="direction-detail-top"><nav class="direction-breadcrumbs" aria-label="{"Breadcrumbs" if en else "Навігаційний ланцюжок"}"><a href="{root}?lang={lang}">{home}</a><span aria-hidden="true">/</span><span aria-current="page">{E(c['title'])}</span></nav><section class="direction-detail-hero"><div class="direction-detail-copy"><p class="direction-detail-eyebrow">BREORIS MEDICAL · {"DNIPRO" if en else "ДНІПРО"}</p><h1 data-focus-shine="true">{marked(c['title'],HERO_TERMS[slug][locale_index])}</h1><p class="direction-detail-lead">{E(c['intro'])}</p><button class="button primary direction-detail-book" type="button" data-book{context}>{book}<span aria-hidden="true">↗</span></button></div><figure class="direction-detail-photo"><img src="{root}{r['image']}" alt="{E(c['alt'])}" width="1536" height="1024" fetchpriority="high"><figcaption>{note}</figcaption></figure></section></div><div class="direction-detail-story">{sections}</div><section class="direction-detail-cta"><div><h2>{cta_title}</h2><p>{cta_text}</p></div><button class="button primary" type="button" data-book{context}>{book}<span aria-hidden="true">↗</span></button></section><section class="direction-related"><h2>{more}</h2><div>{related}</div></section></main>'''
   footer=f'<footer class="direction-detail-footer"><a href="{root}?lang={lang}"><img src="{root}assets/logo.png" width="150" alt="Breoris Medical" loading="lazy"></a><a href="tel:+380975323664" translate="no">+380 97 532 36 64</a><span>© 2026 Breoris Medical</span></footer>'
   mobile=f'<div class="mobile-booking"><a href="tel:+380975323664" translate="no">+380 97 532 36 64</a><button class="button primary" type="button" data-book{context}>{book}</button></div>'
   page=f'''<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>{E(c['title'])} | Breoris Medical</title><meta name="description" content="{E(c['intro'])}"><link rel="canonical" href="https://www.breoris-medical.com/{folder}/directions/{slug}/"><link rel="icon" href="{root}assets/favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap"><link rel="stylesheet" href="{root}styles.css"><link rel="stylesheet" href="{root}health24-booking.css?v=quality-20261026"><link rel="stylesheet" href="{root}direction-details.css?v=20261113-ekopfo1"></head><body class="direction-detail" data-direction="{slug}"><a class="skip" href="#main">{"Skip to content" if en else "Перейти до змісту"}</a>{header}{main}{footer}{mobile}<script src="{root}health24-booking.js?v=3" defer></script></body></html>'''
   if slug=='ekopfo-preparation':page=page.replace('<span aria-hidden="true">↗</span>','<span aria-hidden="true">'+ARROW+'</span>')
   target=ROOT/'dist'/folder/'directions'/slug/'index.html';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(enhance(page,root,lang))
 sitemap=ROOT/'dist/sitemap.xml'
 urls=[node.text for node in ET.parse(sitemap).findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
 for r in selected:
  for folder in ('ua','en'):
   url=f'https://www.breoris-medical.com/{folder}/directions/{r["slug"]}/'
   if url not in urls:urls.append(url)
 sitemap.write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'  <url><loc>{E(url)}</loc></url>\n' for url in urls)+'</urlset>\n')
 print(f'Built {len(selected)*2} branded direction pages with shared booking')

if __name__=='__main__':build()
