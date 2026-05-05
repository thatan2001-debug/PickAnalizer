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

## Paso a paso para subirlo a GitHub

1. Crear repositorio vacío en GitHub (sin README inicial).
2. En local, configurar remoto:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   ```
3. Subir rama actual:
   ```bash
   git push -u origin work
   ```
4. (Opcional) Renombrar a `main` y subir:
   ```bash
   git branch -M main
   git push -u origin main
   ```
5. Abrir Pull Request en GitHub si trabajas con rama `work`.

## Roadmap producto (solicitado)
- Pestañas separadas: En vivo, Programados (calendario), Terminados y Consejos IA.
- Priorización de ligas top: Premier, Serie A, La Liga, Ligue 1 y Colombia.
- Consejos de apuesta por cuota mínima, número de partidos, riesgo y ligas seleccionadas.
- Base para monetización: preparar registro free/pago y panel admin.

## Publicación y cobro de suscripción (resumen)
1. Publicar frontend en Vercel o Netlify.
2. Backend (API propia) en Render/Railway para ocultar API keys.
3. Auth (free/pago): Clerk/Auth0/Supabase Auth.
4. Cobro: Stripe (suscripciones mensuales/anuales).
5. Roles: `free` (apuesta del día), `pro` (análisis completo).
