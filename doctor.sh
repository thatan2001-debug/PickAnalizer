#!/usr/bin/env bash
set -euo pipefail

echo "[PickAnalizer Doctor]"
echo "Directorio actual: $(pwd)"

if [[ -f package.json ]]; then
  echo "✅ package.json encontrado en la raíz actual."
else
  echo "❌ No existe package.json en este directorio."
  echo ""
  echo "Pasos recomendados:"
  echo "1) Asegúrate de estar en la carpeta correcta del proyecto."
  echo "2) Ejecuta: git pull"
  echo "3) Verifica de nuevo con: ls"
  echo ""
  echo "Si el proyecto está en subcarpeta reconstruida:"
  echo "  cd PicksAnalyzer_Reconstructed"
  echo "  npm install"
  echo "  npm run dev"
fi
