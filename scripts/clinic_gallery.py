"""Distinct, user-provided interior photographs for the homepage gallery."""
import html
import json
import re

PHOTOS = [
    ('day-hospital-room.jpg', 960, 1280, 'Палата денного стаціонару', 'Палата денного стаціонару Breoris Medical з функціональним ліжком', 'Day hospital room', 'Breoris Medical day hospital room with an adjustable bed'),
    ('consultation-room.jpg', 1280, 960, 'Гінекологічний кабінет', 'Гінекологічний кабінет Breoris Medical з оглядовим кріслом', 'Gynaecology room', 'Breoris Medical gynaecology room with an examination chair'),
    ('treatment-room.jpg', 960, 1280, 'Процедурний кабінет', 'Процедурний кабінет Breoris Medical з кушеткою та робочою зоною', 'Treatment room', 'Breoris Medical treatment room with an examination couch and work area'),
    ('massage-room.jpg', 1052, 1280, 'Масажний кабінет', 'Масажний кабінет Breoris Medical з масажним столом', 'Massage room', 'Breoris Medical massage room with a massage table'),
]

def update_home(source):
    figures=''.join(f'<figure><img src="assets/clinic/interiors/{name}" width="{width}" height="{height}" loading="lazy" decoding="async" alt="{html.escape(alt,quote=True)}"><figcaption>{html.escape(caption)}</figcaption></figure>' for name,width,height,caption,alt,*_ in PHOTOS)
    pattern=r'(<section class="clinic-gallery\b[^>]*>.*?<div class="clinic-gallery-grid">).*?(</div></section>)'
    source,count=re.subn(pattern,lambda m:m[1]+figures+m[2],source,count=1,flags=re.S)
    assert count==1,'Expected homepage clinic gallery'
    return re.sub(r'i18n.js\?v=[^" ]+','i18n.js?v=gallery-20261025',source)

def update_locale(source):
    mapping={}
    for _,_,_,caption,alt,en_caption,en_alt in PHOTOS:
        mapping[caption]=en_caption;mapping[alt]=en_alt
    block='  // clinic-gallery:translations\n  Object.assign(dictionaries.en, '+json.dumps(mapping,ensure_ascii=False)+');\n'
    if '// clinic-gallery:translations' not in source:
        source=source.replace('  const original = new WeakMap();',block+'  const original = new WeakMap();',1)
    return source
