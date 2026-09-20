# Tareas de Desarrollo — Marcador de Pádel (TDD)

Guía operativa para implementar la especificación [`marcador-padel.md`](./marcador-padel.md).

**Regla de oro:** en cada tarea, primero el test (rojo) → mínimo código (verde) → refactor. No avances de tarea con tests en rojo.

**Stack del repo:** Vitest (`pnpm test:unit` / `pnpm test:watch`), Nuxt 4, TypeScript.

**Ubicaciones sugeridas:**

| Qué | Dónde |
|-----|--------|
| Lógica de negocio | `app/domain/PartidoPadel.ts` |
| Tests unitarios | `test/unit/partido-padel.test.ts` |
| Helpers de test (opcional) | `test/unit/helpers/partido.ts` |
| UI | `app/pages/index.vue` (o componente dedicado) |
| Tests de UI | `test/integration/marcador.test.ts` |

---

## Criterios de “hecho” por tarea

Una tarea está terminada solo si:

1. Los tests nuevos pasan.
2. Los tests anteriores siguen pasando.
3. No hay código de producción sin test que lo cubra (salvo maquetación pura en 3.2).
4. El marcador expuesto es legible (puntos, juegos, sets, estado tie-break, ganador).

---

## Fase 0 — Preparación

### Tarea 0.1 — Leer la espec y acordar el API público

**Qué hacer:**

1. Leer `specs/marcador-padel.md`.
2. Acordar un API mínimo antes de codear, por ejemplo:
   - `new PartidoPadel()`
   - `punto('J1' | 'J2')`
   - getters o `getMarcador()` con: puntos J1/J2, juegos, sets, `enTieBreak`, `ganador`
3. Anotar en este archivo o en un comentario del test el formato de puntos visibles: `'0' | '15' | '30' | '40' | 'Deuce' | 'Ventaja J1' | 'Ventaja J2'` (o equivalente).

**No hacer aún:** implementar la clase ni escribir lógica real.

**Hecho cuando:** tienes claro qué asertarán los tests (forma del marcador).

---

## Fase 1 — El juego individual (puntos y ventajas)

### Tarea 1.1 — Esqueleto de test + clase vacía

**Qué hacer:**

1. Crear `test/unit/partido-padel.test.ts` con un `describe('PartidoPadel')` vacío o con un `it.todo`.
2. Crear `app/domain/PartidoPadel.ts` exportando una clase/función vacía (sin lógica).
3. Importar la clase en el test para verificar que el módulo resuelve (alias `~` / `@`).
4. Correr `pnpm test:unit` y confirmar que el entorno sigue verde.

**No hacer:** lógica de puntuación.

**Hecho cuando:** el archivo de test existe, importa `PartidoPadel` y la suite unitaria corre sin errores.

---

### Tarea 1.2 — Puntuación básica (0 → 15 → 30 → 40)

**Qué hacer (ciclo TDD, un caso a la vez):**

1. **Test:** al crear el partido, puntos = `0-0`, juegos = `0-0`, sets = `0-0`.
2. Implementar solo lo necesario para ese test.
3. **Test:** `punto('J1')` → puntos `15-0`.
4. Implementar mapeo mínimo.
5. **Test:** segundo y tercer punto de J1 → `30-0`, luego `40-0`.
6. **Test (simétrico):** puntos de J2 (`0-15`, etc.) o un caso mixto (`15-15`).
7. Refactor: tabla/mapa de puntos (`0, 15, 30, 40`) si el código está duplicado.

**Sugerencia de aserciones:**

```ts
expect(partido.puntos).toEqual({ j1: '0', j2: '0' })
// tras punto J1
expect(partido.puntos).toEqual({ j1: '15', j2: '0' })
```

**No hacer aún:** Deuce, juegos ni sets.

**Hecho cuando:** inicia en `0-0` y avanza correctamente hasta `40` sin ganar el juego.

---

### Tarea 1.3 — Deuce y ventajas

**Qué hacer:**

1. **Helper opcional:** función de test `llevarA(partido, puntosJ1, puntosJ2)` o llamar `punto` N veces para llegar a `40-40` sin copiar 6 llamadas a mano.
2. **Test:** con `40-40`, el marcador muestra **Deuce** (ambos o etiqueta global, según el API acordado).
3. Implementar detección de empate a 40+.
4. **Test:** desde Deuce, `punto('J1')` → **Ventaja J1**.
5. **Test:** desde Ventaja J1, `punto('J2')` → vuelve a **Deuce**.
6. **Test simétrico:** Ventaja J2 y retorno a Deuce.
7. Refactor: estados claros (`normal` / `deuce` / `ventaja`) si los ifs crecen.

**No hacer aún:** cerrar el juego desde ventaja (eso es 1.4), salvo que un test intermedio lo pida sin sumar juego.

**Hecho cuando:** Deuce ↔ Ventaja funciona en ambos lados.

---

### Tarea 1.4 — Ganar un juego

**Qué hacer:**

1. **Test:** J1 en `40`, J2 en `30` o menos; `punto('J1')` → puntos `0-0` y juegos `1-0`.
2. Implementar victoria de juego “desde 40 con rival ≤ 30”.
3. **Test:** desde Ventaja J1, `punto('J1')` → juegos `1-0`, puntos `0-0`.
4. **Test:** desde Deuce, un solo punto **no** gana el juego (sigue en ventaja).
5. **Test simétrico** para J2.
6. Refactor: método interno `ganarJuego(jugador)` que resetee puntos.

**No hacer aún:** cerrar el set al llegar a 6 juegos (Fase 2). En esta tarea, llegar a 6 juegos solo incrementa el contador de juegos.

**Hecho cuando:** ganar juego resetea puntos y suma 1 juego al ganador.

---

## Fase 2 — El set (diferencia de 2 y tie-break)

### Tarea 2.0 — Helpers de test para no morir escribiendo puntos

**Qué hacer:**

1. Crear en `test/unit/helpers/partido.ts` (o dentro del test):
   - `ganarJuego(partido, 'J1' | 'J2')` — anota 4 puntos seguidos (o la secuencia mínima válida).
   - Opcional: `ganarJuegos(partido, j1, j2)` para dejar el marcador en `N-M`.
2. Cubrir el helper con un test mínimo o usarlo solo en tests de set (si falla, se nota en cascada).

**Hecho cuando:** puedes poner juegos en `5-5` o `6-6` en pocas líneas.

---

### Tarea 2.1 — Set estándar (6 juegos con diferencia ≥ 2)

**Qué hacer:**

1. **Test:** J1 gana 6 juegos seguidos desde `0-0`.
2. Esperar: sets `1-0`, juegos reseteados a `0-0`, puntos `0-0`.
3. Implementar: si juegos ≥ 6 y diferencia ≥ 2 → ganar set.
4. **Test:** un `6-4` también cierra (J1 6 juegos, J2 4).
5. **Test:** `6-3`, `6-2`, `6-1`, `6-0` no son obligatorios todos; al menos uno además del 6-0.

**No hacer aún:** lógica de `5-5` / `6-5` / tie-break.

**Hecho cuando:** 6 juegos con diferencia de 2 suman un set y resetean juegos.

---

### Tarea 2.2 — Diferencia de 2 juegos (5-5 → 6-5 → 7-5)

**Qué hacer:**

1. Con helper, dejar juegos en `5-5`.
2. **Test:** J1 gana un juego → `6-5`, **el set no termina** (sets siguen `0-0`).
3. **Test:** J1 gana otro juego → `7-5`, set para J1 (sets `1-0`, juegos `0-0`).
4. **Test simétrico:** `5-6` no cierra; `5-7` sí.
5. Implementar: con 6 juegos, si el rival tiene 5, el set continúa; se gana al llegar a 7 con diferencia 2.

**No hacer aún:** activar tie-break en `6-6`.

**Hecho cuando:** `6-5` no cierra y `7-5` sí.

---

### Tarea 2.3 — Activación del tie-break

**Qué hacer:**

1. Dejar juegos en `5-5`, luego un juego cada uno → `6-6`.
2. **Test:** `enTieBreak === true` (o estado equivalente).
3. **Test:** el set **aún no** se ha ganado.
4. Implementar flag/estado de tie-break al detectar `6-6`.

**No hacer aún:** contar puntos del tie-break ni cerrar el set desde él.

**Hecho cuando:** en `6-6` el sistema entra en modo tie-break y el set sigue abierto.

---

### Tarea 2.4 — Lógica del tie-break

**Qué hacer:**

1. Entrar en tie-break (`6-6`).
2. **Test:** `punto('J1')` muestra puntos correlativos `1-0` (no `15-0`).
3. **Test:** seguir anotando → `2-0`, `3-0`, …
4. **Test:** llegar a `7-5` (o `7-0`…`7-5`) gana el set: juegos finales del set `7-6` (o sets `1-0` y juegos reseteados; documenta qué expone el API).
5. **Test:** `7-6` **no** cierra; hace falta diferencia de 2 (ej. `8-6`).
6. **Test:** tras ganar el tie-break, `enTieBreak === false`, juegos `0-0`, puntos normales otra vez.
7. Refactor: rama de puntuación distinta cuando `enTieBreak`.

**Hecho cuando:** tie-break a 7 con diferencia 2 cierra el set y limpia el estado.

---

## Fase 3 — Partido completo y UI

### Tarea 3.1 — Ganar el partido (mejor de 3)

**Qué hacer:**

1. Helper opcional: `ganarSet(partido, jugador)` (6 juegos o set+tie-break según convenga).
2. **Test:** tras 2 sets para J1 → `ganador === 'J1'` (o similar).
3. **Test:** con 1-1 en sets, el partido continúa.
4. **Test:** con partido terminado, `punto('J2')` **no cambia** el marcador (marcador bloqueado).
5. Implementar: mejor de 3; bloqueo cuando haya ganador.

**Hecho cuando:** 2 sets ganan el partido y no se aceptan más puntos.

---

### Tarea 3.2 — Maquetación de la interfaz (sin lógica nueva)

**Qué hacer:**

1. Diseñar en `app/pages/index.vue` (o `app/components/MarcadorPadel.vue`) una pantalla móvil-first:
   - Botones grandes: **Punto J1** y **Punto J2**.
   - Panel de puntos actuales.
   - Panel de juegos del set actual.
   - Panel de sets (actuales / anteriores si aplica).
2. Usar datos **hardcodeados o estáticos** primero (placeholders), solo para validar layout.
3. No reimplementar reglas en el template.

**Hecho cuando:** la UI se ve usable en móvil/desktop con los bloques pedidores en la espec.

---

### Tarea 3.3 — Conectar UI ↔ `PartidoPadel`

**Qué hacer:**

1. Instanciar `PartidoPadel` en el setup del componente (`ref` / `reactive` / composable `useMarcador`).
2. Cada botón llama `punto('J1')` o `punto('J2')` y el template lee el marcador reactivo.
3. Mostrar ganador y deshabilitar botones si el partido terminó.
4. **Test de integración (recomendado):** en `test/integration/marcador.test.ts`, montar el componente, click en Punto J1, esperar texto `15` / `15-0`.
5. Correr `pnpm test:unit` y `pnpm test:integration`.

**Hecho cuando:** la UI solo orquesta la clase ya testeada; un click refleja la lógica real.

---

## Orden de ejecución (checklist)

Copia y marca conforme avances:

- [ ] 0.1 API público acordado
- [ ] 1.1 Esqueleto test + clase
- [ ] 1.2 Puntuación básica
- [ ] 1.3 Deuce y ventajas
- [ ] 1.4 Ganar un juego
- [ ] 2.0 Helpers de test
- [ ] 2.1 Set a 6
- [ ] 2.2 Diferencia de 2 (7-5)
- [ ] 2.3 Activar tie-break
- [ ] 2.4 Lógica tie-break
- [ ] 3.1 Ganar partido + bloqueo
- [ ] 3.2 Maquetación UI
- [ ] 3.3 Conectar UI + test integración

---

## Comandos útiles

```bash
pnpm test:unit          # solo lógica
pnpm test:watch         # TDD en bucle
pnpm test:integration   # UI / Nuxt
pnpm test               # todo
```

---

## Notas TDD para no atascarse

- Un test nuevo debe fallar por **una** razón clara.
- Si un test de set es ilegible, vuelve a la tarea 2.0 (helpers).
- No mezcles UI (3.2–3.3) con bugs de dominio: si el click falla, primero mira `pnpm test:unit`.
- Preferir asertar el **marcador visible**, no contadores internos privados.
