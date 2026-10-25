"""Idempotent homepage changes shared by preview and production staging."""
import html
import re
import ui_refinements

e=lambda s:html.escape(str(s),quote=True)

def blog_title(record):
    return record['title']+' — що варто знати перед візитом'

def card(record,group,root='ua/blog/'):
    return f'<a class="blog-card" href="{root}{e(record["slug"])}/" data-blog-group="{e(group)}" data-blog-search="{e(record["name"]+" "+record["title"])}"><span class="blog-card-category">{e(group)}</span><h3>{e(blog_title(record))}</h3><p>{e(record["intro"])}</p><span class="blog-read">Читати статтю <span aria-hidden="true">↗</span></span></a>'

def enhance_home(home,records,catalog):
    start='<!-- blog-preview:start -->';end='<!-- blog-preview:end -->'
    chosen=['uzd','nevrolohiia','check-up']
    cards=''
    for slug in chosen:
        record=next(r for r in records if r['slug']==slug)
        group=next(g for g,names in catalog['groups'].items() if record['name'] in names)
        cards+=card(record,group)
    block=start+'<section class="blog-preview section" id="blog" aria-labelledby="blog-title"><div class="blog-preview-heading"><div><h2 id="blog-title">Блог клініки</h2><p>Про консультації, обстеження та підготовку до візиту.</p></div><a class="text-link" href="ua/blog/">Усі статті ↗</a></div><div class="blog-preview-grid">'+cards+'</div></section>'+end
    if start in home:home=home[:home.index(start)]+block+home[home.index(end)+len(end):]
    else:home=home.replace('<section class="reviews section"',block+'\n  <section class="reviews section"',1)
    # Keep all anchors and route slugs intact.
    nav=re.search(r'<nav aria-label="Головна навігація"[\s\S]*?</nav>',home)
    if nav and 'ua/blog/' not in nav.group():
        home=home[:nav.start()]+nav.group().replace('</nav>','<a href="ua/blog/">Блог</a></nav>')+home[nav.end():]
    if '<a href="ua/blog/">Блог</a>' not in home[home.index('<footer'):]:
        home=home.replace('<h3>Клініка</h3>','<h3>Клініка</h3><a href="ua/blog/">Блог</a>',1)
    for file in ['blog.css','mobile-experience.css']:
        if file not in home:home=home.replace('</head>',f'<link rel="stylesheet" href="{file}?v=1">\n</head>')
    if 'mobile-experience.js' not in home:home=home.replace('</body>','<script src="mobile-experience.js?v=1" defer></script>\n</body>')
    home=re.sub(r'app.js\?v=[^" ]+', 'app.js?v=mobile-7',home)
    home=re.sub(r'i18n.js\?v=[^" ]+', 'i18n.js?v=mobile-blog-1',home)
    return ui_refinements.home('\n'.join(line.rstrip() for line in home.split('\n')))
