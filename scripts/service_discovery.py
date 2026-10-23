"""Shared static service catalogue and prices, sourced from the existing clinic data."""
import html
import json
import subprocess

e = lambda value: html.escape(str(value), quote=True)
POPULAR = ['uzd', 'analizy', 'nevrolohiia', 'kardiolohiia', 'hinekolohiia', 'endokrynolohiia', 'hastroenterolohiia', 'check-up']
SHORT = {'uzd': 'УЗД', 'analizy': 'Аналізи', 'check-up': 'Check-up', 'eeh': 'ЕЕГ', 'masazh': 'Лікувальний масаж', 'vyizd-dodomu': 'Виїзд лікаря додому'}
ALIASES = {
    'uzd': 'узи ultrasound sonography щитовидка щитоподібна щитовидная серце сердце heart нирки почки kidney судини сосуды',
    'analizy': 'анализы analyses lab tests кров кровь blood сеча моча urine лабораторія лаборатория',
    'nevrolohiia': 'невролог neurologist neurologist headache головний біль голова спина мігрень мигрень',
    'kardiolohiia': 'кардиолог cardiologist heart серце сердце тиск давление',
    'hinekolohiia': 'гинеколог gynecology gynaecology жіноче женское',
    'endokrynolohiia': 'эндокринолог endocrinology thyroid щитовидка щитовидная щитоподібна гормони гормоны діабет диабет',
    'hastroenterolohiia': 'гастроэнтеролог gastroenterology шлунок желудок живіт живот травлення пищеварение',
    'dermatolohiia': 'дерматолог dermatology skin шкіра кожа',
    'ortopediia-travmatolohiia': 'ортопед травматолог orthopaedics trauma joints суглоби суставы',
    'terapiia': 'терапевт therapist primary care',
    'check-up': 'чек ап чекап checkup комплексне обследование обстеження',
}

def prices(root):
    program = '''const fs=require('fs'),vm=require('vm');global.window={};for(const p of ['consultation-prices.js','pricing.js'])vm.runInThisContext(fs.readFileSync('dist/'+p,'utf8'));const data=require('./dist/data.js');console.log(JSON.stringify({summaries:Object.fromEntries(Object.values(data.groups).flat().map(n=>[n,window.BreorisPricing.summary(n)])),details:window.BreorisPricing.details}));'''
    return json.loads(subprocess.check_output(['node', '-e', program], cwd=root))

def homepage(records, catalog, price_data):
    ordered = sorted(records, key=lambda r: POPULAR.index(r['slug']) if r['slug'] in POPULAR else len(POPULAR))
    groups = list(catalog['groups'])
    cards = []
    for r in ordered:
        group = next(g for g, names in catalog['groups'].items() if r['name'] in names)
        search = ' '.join([r['name'], r['title'], SHORT.get(r['slug'], ''), ALIASES.get(r['slug'], '')])
        cards.append(f'''<a class="service-card" href="ua/services/{e(r['slug'])}/" data-service-name="{e(r['name'])}" data-group="{groups.index(group)}" data-search="{e(search)}"><span class="service-card-group">{e(group)}</span><h3>{e(SHORT.get(r['slug'],r['name']))}</h3><span class="service-card-bottom"><span class="service-price">{e(price_data['summaries'][r['name']])}</span><span class="service-card-arrow" aria-hidden="true">↗</span></span></a>''')
    filters = '<button type="button" data-service-group="all" aria-pressed="true">Усі напрями</button>' + ''.join(f'<button type="button" data-service-group="{i}" aria-pressed="false">{e(g)}</button>' for i,g in enumerate(groups))
    return f'''<!-- service-directory:start -->
<section class="services service-explorer section" id="poslugi" aria-labelledby="services-title">
<div class="service-explorer-heading"><div><h2 id="services-title">Послуги клініки</h2><p>Оберіть напрям, дізнайтеся про прийом та знайдіть свого лікаря.</p></div><a class="text-link" href="ua/services/">Каталог усіх послуг ↗</a></div>
<div class="service-search" hidden><label for="service-search">Знайти послугу або напрям</label><div class="service-search-field"><input id="service-search" type="search" autocomplete="off" placeholder="Наприклад: УЗД, кардіолог, щитовидка" aria-controls="service-list"><button type="button" id="service-search-clear" hidden>Очистити пошук</button></div><p>Пошук допомагає знайти напрям. Обрати лікаря також допоможе адміністратор.</p></div>
<div class="service-filters" aria-label="Категорії послуг" hidden>{filters}</div>
<p class="service-result-count" id="service-results" role="status" aria-live="polite" aria-atomic="true" hidden></p>
<div id="service-list" class="service-card-grid">{''.join(cards)}</div>
<div id="service-empty" class="service-empty" hidden><h3>За цим запитом нічого не знайдено</h3><p>Спробуйте іншу назву або зверніться до адміністратора — допоможемо зорієнтуватися.</p><a class="text-link" href="tel:+380975323664">Зателефонувати</a></div>
<div class="service-explorer-bottom"><button type="button" class="button outline" id="service-show-all" aria-expanded="false" aria-controls="service-list" hidden>Показати всі послуги</button><p>Ціни орієнтовні. Склад послуги та остаточну суму уточніть до візиту.</p></div>
<aside class="service-help"><div><h3>Не знаєте, якого лікаря обрати?</h3><p>Адміністратор допоможе обрати напрям і погодити прийом.</p></div><div><a class="button primary" href="tel:+380975323664">Зателефонувати</a><a class="text-link" href="https://t.me/Breoris_Medical" target="_blank" rel="noopener noreferrer">Написати в Telegram ↗</a></div></aside>
</section><!-- service-directory:end -->'''

def price_section(name, price_data):
    summary = price_data['summaries'][name]
    rows = [r for r in price_data['details'].get(name, []) if r[0] != 'consult']
    table = ''
    if rows:
        lines = ''.join(f'<tr><th scope="row">{e(r[1])}</th><td>{"від " if len(r)>3 and r[3]=="from" else ""}{r[2]:,} грн{"<small>Без вартості препаратів</small>" if len(r)>3 and r[3]=="medicines" else ""}</td></tr>'.replace(',', ' ') for r in rows)
        table = f'<div class="service-price-table-wrap"><table class="service-price-table"><caption>Орієнтовні ціни окремих послуг</caption><tbody>{lines}</tbody></table></div>'
    return f'<p class="service-page-price"><span>Орієнтовна вартість</span><strong>{e(summary)}</strong></p>{table}<p>Ціна залежить від лікаря та обраної послуги. Позначка «від» означає мінімальну вартість. Уточніть склад прийому, необхідність додаткових досліджень та остаточну суму до візиту.</p>'
