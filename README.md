# owame_site — Sitio web (`owame.app`)

Repositorio de **código estático** (skin / marketing) del producto **Owame** en `https://owame.app/`.

| Alias multiverso | Ruta local |
|------------------|------------|
| **$OWAME** | `Plan_2026/site_owame` |

**Remoto:** `git@github.com:lmartinezcorral/owame_site.git` · rama de deploy **`main`**

**Documentación, planificación y comunicación de agentes:** repositorio hermano **$MULTI**
`../auditoria_trabajo/multiverso_cursor_comunicacionAgentes`
(runbook de alta: `docs/saas/04_operations/RUNBOOK_BP_OWAME_APP_DOMINIO.md`)

**Motor producto (API, Prisma, panel Owame / runtime `/app/`):** repositorio **$PAGINA**
`../pagina_mobility`

---

## Tres planos en `owame.app`

| Plano | URL | Fuente | Deploy V110 |
|-------|-----|--------|-------------|
| Skin (este repo) | `https://owame.app/` | `html/` | `dow` → `/var/www/html/owame.app/` |
| Runtime Owame | `https://owame.app/app/` | `$PAGINA` (lista blanca rsync) | `dor` → `/var/www/owame-runtime/html/` (Alias Apache) |
| API | `https://owame.app/api/` | `$PAGINA/backend` | `dapi` en ThinkCenter (ProxyPass) |

**Prohibido** copiar el panel staff (`dashboard.html`, `staff-app.html`, `assets/views/…`) a `html/`.
`deploy-owame.sh` aborta si encuentra `html/app/`, `dashboard.html` o `staff-app.html`.

---

## Deploy

```bash
# V110 (una vez)
sudo cp /var/www/repos/owame_site/scripts/deploy-owame.sh /usr/local/bin/deploy-owame.sh
sudo chmod 755 /usr/local/bin/deploy-owame.sh
echo "alias dow='sudo /usr/local/bin/deploy-owame.sh'" >> ~/.bashrc && source ~/.bashrc

# Cada publicación (tras push a origin/main con VoBo CEO)
dow --dry-run
dow
```

---

## Pre-lanzamiento

- `html/index.html` es un placeholder (`noindex`) para validar el cableado; la landing real sale de `OWAME_COPY_LANDING_V1.md` ($MULTI).
- `html/robots.txt` bloquea todo. Al lanzar: permitir `/` y mantener `Disallow: /app/`.
- `.app` está en la lista HSTS preload: solo HTTPS; probar siempre con `https://`.
