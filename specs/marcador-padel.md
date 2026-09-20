# Especificación General: App de Marcador de Pádel (Lógica Completa)

## 1. Visión General del Producto

Una aplicación web móvil/desktop para llevar la puntuación en vivo de partidos de pádel. El sistema debe gestionar de forma automática:

- los puntos de un juego
- la suma de juegos
- la resolución de los sets

Incluyendo la lógica de **ventajas**, **diferencia de dos juegos**, el **tie-break** y la opción de **empezar un partido nuevo**.

---

## 2. Reglas de Negocio a Implementar (El Algoritmo)

### Puntos

- Secuencia: `0`, `15`, `30`, `40`.
- Si hay empate a 40, entra en **Deuce**.
- Se gestionan **Ventajas** hasta que un jugador gane el juego (ventaja + punto).
- Se asume **ventaja tradicional** (no punto de oro).

### Juegos

- El primero en llegar a **6 juegos** gana el set, siempre que tenga **diferencia de 2** (ej: `6-4`).
- Si llegan a `5-5`, se juega a 7 (ej: `7-5`).

### Tie-break

- Si el set llega a `6-6`, se juega un juego especial a **7 puntos correlativos** (`1`, `2`, `3`...).
- Debe haber **diferencia de 2** para definir el ganador del set (ej: `7-6`).

### Sets

- El partido se juega al **mejor de 3 sets**.
- El primero que gane **2 sets** gana el partido.
- Con ganador, el marcador **se bloquea**: no se aceptan más puntos.

### Nuevo partido

- En cualquier momento (incluido con partido terminado) se puede **resetear** el marcador.
- El partido vuelve al estado inicial: puntos `0-0`, juegos `0-0`, sets `0-0`, sin tie-break, sin ganador y sin sets anteriores.
- Tras el reset, se vuelven a aceptar puntos.

---

## 3. Desglose de Tareas (Plan de Desarrollo con TDD)

Para hacer TDD real, **no se programa nada de la app hasta tener la prueba escrita**. El desarrollo se separa en tres fases lógicas incrementales.

### Fase 1: El Juego Individual (Puntos y Ventajas)

#### Tarea 1.1 — Configurar el entorno de pruebas

**Descripción:** Crear un archivo de pruebas (ej. usando Jest, Vitest, o un script nativo) y el archivo de la clase `PartidoPadel`.

#### Tarea 1.2 — TDD para Puntuación Básica

- **Prueba:** Verificar que el marcador inicia en `0-0` y sube a `15-0`, `30-0`, `40-0` al anotar.
- **Código:** Implementar el mapeo de puntos.

#### Tarea 1.3 — TDD para Deuce y Ventajas

- **Prueba:** Forzar un empate a 3 puntos (`40-40`) y verificar que muestra Deuce.
- Comprobar que anotar da Ventaja y que el rival puede empatar de nuevo a Deuce.

#### Tarea 1.4 — TDD para Ganar un Juego

- **Prueba:** Verificar que al ganar un punto desde la ventaja (o desde el 40 si el rival tiene 30 o menos), los puntos se resetean a `0-0` y se suma 1 juego al marcador.

---

### Fase 2: El Set (Juegos, Diferencia de 2 y Tie-break)

#### Tarea 2.1 — TDD para Set Estándar (6 juegos)

- **Prueba:** Simular que un jugador gana 6 juegos seguidos.
- Verificar que el marcador de juegos se resetea y el jugador suma 1 Set.

#### Tarea 2.2 — TDD para Diferencia de 2 Juegos

- **Prueba:** Simular un marcador de juegos de `5-5`.
- Verificar que llegar a `6-5` no cierra el set, pero llegar a `7-5` sí lo gana.

#### Tarea 2.3 — TDD para Activación del Tie-break

- **Prueba:** Simular un empate a juegos `6-6`.
- Verificar que el sistema activa el estado de Tie-break.

#### Tarea 2.4 — TDD para Lógica del Tie-break

- **Prueba:** Durante el Tie-break, verificar que los puntos se cuentan de 1 en 1 (`1-0`, `2-0`...) y que el primero en llegar a 7 con diferencia de 2 gana el juego, el set y resetea los juegos.

---

### Fase 3: El Partido Completo y la Interfaz (UI)

#### Tarea 3.1 — TDD para Ganar el Partido

- **Prueba:** Verificar que el primero que sume 2 sets es declarado ganador del partido y el marcador se bloquea.

#### Tarea 3.2 — Maquetación de la Interfaz Web

**Descripción:** Diseñar una pantalla limpia (ideal para móviles) con:

- dos botones gigantes (`Punto J1`, `Punto J2`)
- un botón `Nuevo partido` para resetear el marcador
- paneles para mostrar el Set Actual, los Sets Anteriores y los Puntos actuales

#### Tarea 3.3 — Conectar la UI con la lógica de negocio

**Descripción:** Hacer que los botones disparen los métodos de la clase `PartidoPadel` (probada en las fases anteriores) y actualicen el texto de la pantalla.

#### Tarea 3.4 — TDD para Nuevo partido

- **Prueba:** Tras un partido en curso o ya ganado, `resetear()` deja el marcador en `0-0` (puntos, juegos y sets), limpia ganador y sets anteriores, y vuelve a aceptar puntos.
- **UI:** el botón `Nuevo partido` llama a `resetear()` y refresca el marcador.
