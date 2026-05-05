# PickAnalyzer IA - Frontend

Interfaz funcional de analista deportivo IA sin backend.

## Archivos principales
- `index.html`: estructura de la app y formulario de análisis.
- `index.css`: estilos visuales de la interfaz.
- `main.js`: lógica del modelo heurístico y render de resultados.
- `utils/routes.ts`: utilidad reusable para crear rutas amigables.

## Modelo de análisis
El motor aplica una heurística simple:
1. Calcula fuerza local/visitante a partir de forma y bajas.
2. Deriva probabilidades estimadas para Local / Empate / Visitante.
3. Convierte probabilidades en cuotas justas.
4. Compara cuotas del usuario vs cuotas justas para detectar valor esperado (edge).
5. Clasifica riesgo del pick recomendado.

## Limitación
No usa datos en tiempo real ni modelo ML entrenado; es un analista IA heurístico para prototipado.
