# PickAnalizer

Analista deportivo IA orientado a evaluar partidos y sugerir picks con una métrica de riesgo.

## Si te sale `ENOENT ... package.json`
No lo estás haciendo mal: ese error aparece cuando estás en una carpeta sin `package.json`.

Ejecuta diagnóstico rápido:

```bash
./doctor.sh
```

## Activación rápida (npm)

### Opción A (raíz del repo)
```bash
npm install
npm run dev
```

### Opción B (subcarpeta reconstruida)
```bash
cd PicksAnalyzer_Reconstructed
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

> Nota: Es una herramienta educativa; no constituye asesoría financiera.
