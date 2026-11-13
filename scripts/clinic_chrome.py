"""Shared contact strip and navigation assets for public clinic pages."""
import re
from pathlib import Path

VERSION = '20261113-responsive1'
ICONS = {
 'phone':'<path d="M5 3h4l2 5-3 2a13 13 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2C10 21 3 14 3 5a2 2 0 0 1 2-2Z"/>',
 'pin':'<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
 'clock':'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 'instagram':'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/>'
}
def icon(name):
 return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICONS[name]+'</svg>'

def strip(lang='uk'):
 en=lang=='en'
 address='Dnipro, 2-B Ukrainskoi Dobrovolchoi Armii St' if en else 'м. Дніпро, вул. Української Добровольчої армії, 2-Б'
 hours='Mon–Fri 08:00–18:00 · Sat 08:00–14:00' if en else 'Пн–Пт 08:00–18:00 · Сб 08:00–14:00'
 return '<!-- clinic-strip:start --><aside class="clinic-strip" aria-label="'+('Clinic contacts' if en else 'Контакти клініки')+'"><div class="clinic-strip-inner"><a class="strip-phone" href="tel:+380975323664">'+icon('phone')+'<span translate="no">+380 97 532 36 64</span></a><a class="strip-address" href="https://www.google.com/maps/search/?api=1&amp;query=Breoris+Medical+Dnipro" target="_blank" rel="noopener noreferrer">'+icon('pin')+'<span data-chrome-text="address">'+address+'</span></a><span class="strip-hours">'+icon('clock')+'<span data-chrome-text="hours">'+hours+'</span></span><a class="strip-social" href="https://www.instagram.com/breoris_medical" target="_blank" rel="noopener noreferrer" aria-label="Instagram">'+icon('instagram')+'</a></div></aside><!-- clinic-strip:end -->'

def enhance(page,root='',lang='uk'):
 if '<header class="header"' not in page:return page
 page=re.sub(r'(src="[^\"]*assets/logo.png)(?:\?[^\"]*)?"',r'\1?v=20261113-web"',page)
 page=re.sub(r'<!-- clinic-strip:start -->.*?<!-- clinic-strip:end -->', '', page, flags=re.S)
 page=page.replace('<header class="header"',strip(lang)+'<header class="header"',1)
 page=re.sub(r'<link[^>]+href="[^\"]*clinic-chrome.css[^\"]*"[^>]*>','',page)
 page=re.sub(r'<script[^>]+src="[^\"]*clinic-chrome.js[^\"]*"[^>]*></script>','',page)
 page=page.replace('</head>',f'<link rel="stylesheet" href="{root}clinic-chrome.css?v={VERSION}"></head>')
 page=page.replace('</body>',f'<script src="{root}clinic-chrome.js?v={VERSION}" defer></script></body>')
 return page

def hide_home_sections(page):
 for cls in ['trust','feature','additional','clinic-gallery']:
  page=re.sub(r'<section class="'+cls+r' section"(?! hidden)', '<section class="'+cls+' section" hidden',page)
 return page

if __name__=='__main__':
 dist=Path(__file__).resolve().parents[1]/'dist';count=0
 for file in dist.rglob('*.html'):
  page=file.read_text()
  if '<header class="header"' not in page:continue
  root='../'*len(file.relative_to(dist).parts[:-1]);lang='en' if re.search(r'<html[^>]+lang="en"',page) else 'uk'
  if file==dist/'index.html':page=hide_home_sections(page)
  file.write_text(enhance(page,root,lang));count+=1
 print(f'Updated shared contact strip on {count} pages')
