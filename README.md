# PickAnalizer

Analista deportivo IA orientado a evaluar partidos y sugerir picks con una métrica de riesgo.

## Activación rápida (npm)

```bash
npm install
npm run dev
```

Luego abre `http://localhost:4173`.

## Scripts
- `npm run dev`: levanta servidor local del frontend reconstruido.
- `npm run start`: alias de producción local.
- `npm test`: ejecuta tests del motor heurístico.

## Proyecto funcional

La app funcional está en `PicksAnalyzer_Reconstructed/src`.

### Qué hace
- Recibe datos de forma, bajas y cuotas.
- Estima probabilidades con un modelo heurístico.
- Calcula cuotas justas y edge de valor.
- Recomienda pick (Local / Empate / Visitante) con riesgo Bajo/Medio/Alto.

> Nota: Es una herramienta educativa; no constituye asesoría financiera.
