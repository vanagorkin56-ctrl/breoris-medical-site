"""Generate static, file-preview-compatible Ukrainian doctor pages from JSON."""
import html
import json
import re
from pathlib import Path
from string import Template

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
DATA = json.loads((ROOT / 'data/doctors.json').read_text(encoding='utf-8'))
DOCTORS = DATA['doctors']
CLINIC = DATA['clinic']
ORIGIN = CLINIC['url'].rstrip('/')
HOME = (DIST / 'index.html').read_text(encoding='utf-8')
HEADER = re.search(r'<header class="header">[\s\S]*?</header>', HOME).group()
FOOTER = re.search(r'<footer class="footer section">[\s\S]*?</footer>', HOME).group()
e = lambda value: html.escape(str(value), quote=True)

def years(n):
    return f'{n} ' + ('років' if 11 <= n % 100 <= 14 else 'рік' if n % 10 == 1 else 'роки' if n % 10 in (2, 3, 4) else 'років')

def template(filename, **values):
    return Template((ROOT / 'templates' / filename).read_text(encoding='utf-8')).substitute(values)

def shared(fragment, root):
    fragment = fragment.replace('src="assets/', f'src="{root}assets/')
    fragment = re.sub(r'href="#([^"]*)"', lambda m: f'href="{root}index.html#{m[1]}"', fragment)
    fragment = fragment.replace(f'href="{root}index.html#likari"', f'href="{root}ua/doctors/index.html"')
    fragment = re.sub(r'(<select class="language-select"[^>]*>)[\s\S]*?</select>', r'\1<option value="uk">UA</option></select>', fragment)
    for text in ('Записатися на консультацію', 'Записатися на прийом', 'Записатися до лікаря'):
        fragment = fragment.replace(text, 'Записатися')
    return fragment.replace('data-book>Запис <', 'data-book>Записатися <')

def rating(d):
    r = d.get('rating')
    if not r:
        return ''
    value = f"{r['value']:.1f}".replace('.', ',')
    count = r.get('reviewCount')
    if count is None:
        label = f'{value} · Рейтинг на DOC.UA'
    else:
        word = 'відгуків' if 11 <= count % 100 <= 14 else 'відгук' if count % 10 == 1 else 'відгуки' if count % 10 in (2, 3, 4) else 'відгуків'
        label = f'{value} · {count} {word} на DOC.UA'
    return f'<a class="physician-rating" href="{e(d["sourceUrl"])}" target="_blank" rel="noopener noreferrer">{label} ↗</a>'

def facts(d):
    rows = []
    if 'experienceYears' in d:
        rows.append(('Досвід роботи', years(d['experienceYears'])))
    rows.append(('Спеціальність', ', '.join(d['specialties']) + ('. ' + d['category'] if d.get('category') else '')))
    rows.append(('Спеціалізація', ', '.join(d['specialties'])))
    if 'experienceYears' in d:
        rows.append(('Стаж', years(d['experienceYears'])))
    for key, label in [('education', 'Освіта'), ('degree', 'Науковий ступінь'), ('patientGroups', 'Приймає')]:
        value = d.get(key)
        if value:
            rows.append((label, '; '.join(value) if isinstance(value, list) else value))
    return ''.join(f'<div><dt>{e(label)}</dt><dd>{e(value)}</dd></div>' for label, value in rows)

def sections(d, root):
    result = ''
    for key, label in [('achievements', 'Наукова діяльність'), ('workDirections', 'Напрямки роботи'), ('methods', 'Володіє методиками'), ('memberships', 'Професійні спільноти'), ('courses', 'Курси та підвищення кваліфікації')]:
        if d.get(key):
            result += f'<section><h2>{label}</h2><ul>' + ''.join(f'<li>{e(v)}</li>' for v in d[key]) + '</ul></section>'
    if d.get('treatments'):
        items = []
        for treatment in d['treatments']:
            url = treatment.get('localPage') if isinstance(treatment, dict) else None
            name = treatment['name'] if isinstance(treatment, dict) else treatment
            # Only link a service if its real HTML file exists within dist.
            path = (DIST / url).resolve() if url else None
            valid = path and path.is_relative_to(DIST.resolve()) and path.is_file()
            items.append(f'<li><a href="{e(root + url)}">{e(name)}</a></li>' if valid else f'<li>{e(name)}</li>')
        result += '<section><h2>Напрямки лікування</h2><ul>' + ''.join(items) + '</ul></section>'
    if d.get('services'):
        items = []
        for service in d['services']:
            price = service.get('price')
            text = ('від ' if service.get('qualifier') == 'from' else '') + f'{price:,} грн'.replace(',', ' ') if price is not None else ''
            items.append(f'<li><span>{e(service["name"])}</span><strong>{e(text)}</strong></li>')
        result += '<section><h2>Послуги та вартість</h2><ul class="physician-prices">' + ''.join(items) + '</ul><p class="physician-source">За даними DOC.UA від 06.10.2026. Вартість візиту підтвердить адміністратор.</p></section>'
    return result

def forms(page_doctor):
    options = ''.join(f'<option value="{e(d["id"])}">{e(d["name"])}</option>' for d in DOCTORS)
    stars = ''.join(f'<label><input type="radio" name="rating" value="{n}" required aria-label="{n} із 5"><span aria-hidden="true">{n} ★</span></label>' for n in range(1, 6))
    return template('doctor-forms.html', doctor_options=options, rating_options=stars, page_doctor=e(page_doctor))

def shell(root, title, description, canonical, image, content, schema, page_doctor=''):
    head = f'''<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>{e(title)}</title><meta name="description" content="{e(description)}"><link rel="canonical" href="{e(canonical)}"><meta property="og:type" content="website"><meta property="og:locale" content="uk_UA"><meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(description)}"><meta property="og:url" content="{e(canonical)}"><meta property="og:image" content="{e(image)}"><meta name="theme-color" content="#235b92"><link rel="icon" href="{root}assets/favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap"><link rel="stylesheet" href="{root}styles.css"><link rel="stylesheet" href="{root}refresh.css?v=1"><link rel="stylesheet" href="{root}doctor-pages.css?v=1"><link rel="stylesheet" href="{root}health24-booking.css?v=2"></head>'''
    structured = json.dumps(schema, ensure_ascii=False).replace('<', '\\u003c')
    return head + f'<body class="doctor-page" data-page-doctor="{e(page_doctor)}"><a class="skip" href="#main">Перейти до змісту</a>' + shared(HEADER, root) + '<main id="main" class="doctor-main">' + content + '</main>' + shared(FOOTER, root) + forms(page_doctor) + '<div class="mobile-booking"><a href="tel:+380975323664">+380 97 532 36 64</a><button class="button primary" type="button" data-book>Записатися</button></div>' + f'<script type="application/ld+json">{structured}</script><script src="{root}health24-booking.js?v=3" defer></script><script src="{root}doctor-pages-config.js" defer></script><script src="{root}doctor-pages.js" defer></script></body></html>\n'

def build():
    # Consultation minima use the same source as individual physician pages.
    specialty_services = {'Терапевт': 'Терапія', 'Невролог': 'Неврологія', 'Кардіолог': 'Кардіологія', 'Кардіоревматолог': 'Ревматологія', 'Ендокринолог': 'Ендокринологія', 'Гастроентеролог': 'Гастроентерологія', 'Ортопед-травматолог': 'Ортопедія та травматологія', 'Акушер-гінеколог': 'Гінекологія', 'Дерматолог': 'Дерматологія'}
    consultation_minima = {}
    for doctor in DOCTORS:
        prices = [s['price'] for s in doctor.get('services', []) if s['name'] in ('Консультація', 'Консультативний прийом') and s.get('price') is not None]
        for specialty in doctor['specialties']:
            service = specialty_services.get(specialty)
            if service and prices:
                consultation_minima[service] = min(consultation_minima.get(service, min(prices)), min(prices))
    (DIST / 'consultation-prices.js').write_text('/* Generated from data/doctors.json by build-doctors.py. */\nwindow.BreorisConsultationPrices = ' + json.dumps(consultation_minima, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
    routes = {}
    cards = []
    urls = [ORIGIN + '/', ORIGIN + '/ua/doctors/']
    clinic = {'@type': 'MedicalClinic', '@id': ORIGIN + '/#clinic', 'name': CLINIC['name'], 'url': ORIGIN + '/', 'telephone': CLINIC['phone'], 'address': {'@type': 'PostalAddress', 'streetAddress': CLINIC['address'], 'addressLocality': CLINIC['city'], 'addressCountry': 'UA'}}
    seen = set()
    for d in DOCTORS:
        assert re.fullmatch(r'[a-z0-9-]+', d['slug']) and d['slug'] not in seen, 'Invalid or duplicate slug'
        seen.add(d['slug'])
        assert (DIST / d['image']['src']).is_file(), f'Missing portrait: {d["name"]}'
        relative = f'ua/doctors/{d["slug"]}/index.html'
        root = '../../../'
        canonical = ORIGIN + f'/ua/doctors/{d["slug"]}/'
        urls.append(canonical)
        routes[d['id']] = relative
        specialty = ', '.join(d['specialties'])
        experience = f' з досвідом {years(d["experienceYears"])}' if 'experienceYears' in d else ''
        title = f'{d["name"]} — {specialty}{experience}'
        description = f'{d["name"]} — {specialty.lower()}{experience}. BREORIS MEDICAL, Дніпро. Запишіться онлайн на консультацію або зателефонуйте до клініки.'
        badge = f'<p class="physician-experience">Досвід роботи: {years(d["experienceYears"])}</p>' if 'experienceYears' in d else ''
        content = template('doctor.html', root=root, name=e(d['name']), id=e(d['id']), photo=e(root + d['image']['src']), photo_width=d['image']['width'], photo_height=d['image']['height'], specialties=e(specialty), experience_badge=badge, facts=facts(d), sections=sections(d, root), rating=rating(d), source_url=e(d['sourceUrl']))
        if d['id'] == 'tomakh':
            content = content.replace('За даними DOC.UA від 06.10.2026. Вартість візиту підтвердить адміністратор.', 'Вартість консультації уточнено 06.10.2026. Вартість інших послуг підтвердить адміністратор.')
        consultation = next((service for service in d.get('services', []) if service['name'] in ('Консультація', 'Консультативний прийом') and service.get('price') is not None), None)
        if consultation:
            amount = f"{consultation['price']:,}".replace(',', ' ')
            prefix = 'від ' if consultation.get('qualifier') == 'from' else ''
            price_badge = f'<p class="physician-summary-price"><span>Консультація</span><strong>{e(prefix + amount)} грн</strong></p>'
            content = content.replace('<div class="physician-actions">', price_badge + '<div class="physician-actions">', 1)
        start = content.index('<div class="physician-details">')
        end = content.index('<section class="physician-reviews"', start)
        panels = content[start:end]
        panels = re.sub(
            r'<section[^>]*><h2[^>]*>(.*?)</h2>(.*?)</section>',
            lambda m: '<details class="physician-accordion"><summary><h2>' + m[1]
            + '</h2><span class="accordion-symbol" aria-hidden="true"></span></summary>'
            + '<div class="accordion-content">' + m[2] + '</div></details>',
            panels, flags=re.S)
        content = content[:start] + panels + content[end:]
        person = {'@type': 'Person', '@id': canonical + '#doctor', 'name': d['name'], 'url': canonical, 'image': ORIGIN + '/' + d['image']['src'], 'jobTitle': specialty, 'worksFor': {'@id': clinic['@id']}, 'sameAs': d['sourceUrl']}
        schema = {'@context': 'https://schema.org', '@graph': [person, clinic, {'@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'name': 'Головна', 'item': ORIGIN + '/'}, {'@type': 'ListItem', 'position': 2, 'name': 'Лікарі', 'item': ORIGIN + '/ua/doctors/'}, {'@type': 'ListItem', 'position': 3, 'name': d['name'], 'item': canonical}]}]}
        output = DIST / relative
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(shell(root, title, description, canonical, person['image'], content, schema, d['id']), encoding='utf-8')
        exp = f'<p>Стаж: {years(d["experienceYears"])}</p>' if 'experienceYears' in d else ''
        cards.append(f'<article class="physician-directory-card"><a href="{e(d["slug"])}/index.html"><img src="../../{e(d["image"]["src"])}" width="{d["image"]["width"]}" height="{d["image"]["height"]}" alt="Фотографія {e(d["name"])}" title="{e(d["name"])}" loading="lazy"><h2>{e(d["name"])}</h2></a><div class="card-details"><p>{e(specialty)}</p>{exp}</div><button class="button primary" type="button" data-book data-physician="{e(d["id"])}">Записатися</button></article>')
    content = template('doctors.html', root='../../', cards=''.join(cards))
    listing_schema = {'@context': 'https://schema.org', '@type': 'ItemList', 'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': d['name'], 'url': ORIGIN + f'/ua/doctors/{d["slug"]}/'} for i, d in enumerate(DOCTORS)]}
    (DIST / 'ua/doctors/index.html').write_text(shell('../../', 'Лікарі BREORIS MEDICAL — консультації у Дніпрі', 'Лікарі BREORIS MEDICAL у Дніпрі: спеціальності, професійні профілі та запис на консультацію. Оберіть лікаря й залиште заявку онлайн.', ORIGIN + '/ua/doctors/', ORIGIN + '/assets/logo.png', content, listing_schema), encoding='utf-8')
    (DIST / 'doctor-routes.js').write_text('/* Generated by scripts/build-doctors.py. */\nwindow.BreorisDoctorRoutes = ' + json.dumps(routes, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
    (DIST / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'  <url><loc>{e(url)}</loc></url>\n' for url in urls) + '</urlset>\n', encoding='utf-8')
    print(f'Generated {len(DOCTORS)} profiles, directory, routes and sitemap.')

if __name__ == '__main__':
    build()
