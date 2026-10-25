"""Two public locales and a shared, accessible clinic icon treatment."""
import re

def home(source):
    source=re.sub(r'^\s*<link rel="alternate" hreflang="ru"[^>]*>\n','',source,flags=re.M)
    source=source.replace('<option value="ru">RU</option>','')
    source=source.replace(', медицинская клиника Днепр','')
    source=source.replace('!1sru!2sua','!1suk!2sua')
    source=re.sub(r'i18n.js\?v=[^" ]+','i18n.js?v=uk-en-1',source)
    return stylesheet(source,'')

def stylesheet(source,root):
    if 'ui-refinements.css' not in source:
        source=source.replace('</head>',f'<link rel="stylesheet" href="{root}ui-refinements.css?v=1">\n</head>')
    return source

def locale(source):
    old="let language = new URLSearchParams(location.search).get('lang') || localStorage.getItem('breoris-language') || 'uk';\n  if (!['uk','ru','en'].includes(language)) language = 'uk';"
    new="""const localeParams = new URLSearchParams(location.search);
  const requestedLanguage = localeParams.get('lang') || localStorage.getItem('breoris-language') || 'uk';
  let language = requestedLanguage === 'en' ? 'en' : 'uk';
  const normalizeLegacyUrl = localeParams.has('lang') && !['uk','en'].includes(localeParams.get('lang'));"""
    if old in source:source=source.replace(old,new,1)
    source=source.replace("if (!['uk','ru','en'].includes(next)) return;", "if (!['uk','en'].includes(next)) next = 'uk';",1)
    source=source.replace('setLanguage(language, false);','setLanguage(language, normalizeLegacyUrl);')
    marker="document.querySelectorAll('.language-select').forEach(select => select.value = next);"
    map_locale="""
    const clinicMap = document.querySelector('.map-frame iframe');
    if (clinicMap) {
      const mapUrl = clinicMap.getAttribute('src').replace(/!1s(?:ru|uk|en)!2sua/g, '!1s' + next + '!2sua');
      if (mapUrl !== clinicMap.getAttribute('src')) clinicMap.setAttribute('src', mapUrl);
    }"""
    if 'const clinicMap =' not in source:source=source.replace(marker,marker+map_locale)
    return source
