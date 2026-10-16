#!/bin/zsh
cd "${0:A:h}/.." || exit 1
health24_node="$(command -v node)"
if [[ -z "$health24_node" ]]; then
  health24_node="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
fi
if [[ ! -x "$health24_node" ]]; then
  print 'Не знайдено Node.js. Запустіть перевірку через Swagger або встановіть Node.js з nodejs.org.'
else
  "$health24_node" scripts/check-health24-local.js "$@"
fi
printf '\nНатисніть Enter, щоб закрити…'
read -r health24_done
