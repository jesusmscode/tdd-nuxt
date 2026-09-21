# Especificación General: App de Marcador de Pádel (Lógica Completa)

## 1. Visión General del Producto

Una aplicación web móvil/desktop para llevar la puntuación en vivo de partidos de pádel. El sistema debe gestionar de forma automática:

- los puntos de un juego
- la suma de juegos
- la resolución de los sets

Incluyendo la lógica de **ventajas** o **bola de oro** (configurable), **duración del partido** (60 o 90 min) con **cronómetro**, **nombres y saque**, **deshacer último punto**, **aviso de cambio de lado**, **diferencia de dos juegos**, el **tie-break** a 7, el **super tie-break a 10** en el tercer set y la opción de **empezar un partido nuevo**.

---

## 2. Reglas de Negocio a Implementar (El Algoritmo)

### Puntos

- Secuencia: `0`, `15`, `30`, `40`.
- Si hay empate a 40:
  - **Ventaja tradicional** (por defecto): entra en **Deuce** y se juegan ventajas hasta que un jugador gane el juego (ventaja + punto). El rival puede devolver a Deuce.
  - **Bola de oro**: el marcador permanece en **40-40** y **el siguiente punto gana el juego**. No hay ventajas.
- El modo se elige **antes de empezar** el partido. Tras pulsar **Empezar partido** o anotar el primer punto **no se puede cambiar** entre ventaja tradicional y bola de oro.
- Para elegir otro modo hay que pulsar **Nuevo partido** (el marcador vuelve a 0 y el selector se desbloquea).

### Duración

- El partido tiene una **duración prevista** de **60 o 90 minutos** (por defecto **90**).
- Se elige **antes de empezar**, con el mismo bloqueo que el modo: tras **Empezar partido** o el primer punto no se puede cambiar.
- Para elegir otra duración hay que pulsar **Nuevo partido**.
- Cualquier valor distinto de 60 se trata como 90.

### Cronómetro

- Hay un **cronómetro de cuenta atrás** según la duración elegida (`90:00` o `60:00`).
- El botón **Empezar partido** inicia la cuenta atrás, bloquea modo y duración, y habilita anotar puntos.
- Al llegar a `00:00` se muestra **Tiempo agotado**. El marcador no se bloquea por el tiempo (el partido puede seguir hasta que haya ganador por sets).
- **Nuevo partido** para el cronómetro y lo deja de nuevo en la duración elegida.

### Jugadores y saque

- Cada equipo tiene **2 jugadores**. Se pueden poner sus nombres.
- Se elige **quién saca** (uno de los cuatro) en los **4 primeros juegos**.
- Al terminar un juego (incluido el tie-break), queda registrado en el **historial de saques**. Mientras no hay 4 saques, el siguiente se sugiere en rotación T1A → T2A → T1B → T2B, y se puede cambiar a mano.
- Cuando se han completado **los 4 primeros saques**, ese orden **queda guardado** y se repite el resto del partido. Ya no se puede cambiar el sacador a mano.
- **Nuevo partido** limpia el historial (y el orden) y conserva los nombres.

### Juegos

- El primero en llegar a **6 juegos** gana el set, siempre que tenga **diferencia de 2** (ej: `6-4`).
- Si llegan a `5-5`, se juega a 7 (ej: `7-5`).

### Cambio de lado

- Al terminar un juego, si la **suma de juegos del set es impar** (1, 3, 5, 7…), se muestra **Cambio de lado**.
- En el **tie-break** y el **super tie-break**, se avisa cada **6 puntos**.
- El aviso se oculta al anotar el siguiente punto (o al deshacer).

### Tie-break

- Si el set llega a `6-6`, se juega un juego especial a **7 puntos correlativos** (`1`, `2`, `3`...).
- Debe haber **diferencia de 2** para definir el ganador del set (ej: `7-6`).

### Super tie-break (tercer set)

- Si el partido va **1-1**, el tercer set se juega como **super tie-break a 10 puntos correlativos** (`1`, `2`, `3`…), no como un set de juegos.
- Hace falta **diferencia de 2** (ej: `10-8`; `10-9` no cierra, sí `11-9`).
- Quien lo gana se lleva el set y el partido (2-1). El resultado del super tie-break queda en sets anteriores (ej: `10-8`).
- Si un equipo gana **2-0**, no hay super tie-break.

### Sets

- El partido se juega al **mejor de 3 sets**.
- El primero que gane **2 sets** gana el partido.
- Con ganador, el marcador **se bloquea**: no se aceptan más puntos.

### Deshacer

- En cualquier momento se puede **deshacer el último punto** anotado.
- Si ese punto cerró un **juego**, un **set** o el **partido**, también se deshace ese cierre: vuelven puntos, juegos, sets, ganador, tie-break, sacador e historial de saques al estado anterior.
- Se puede deshacer varias veces, un punto cada vez.
- Si no hay puntos que deshacer, no ocurre nada.
- **Nuevo partido** vacía el historial de deshacer.

### Nuevo partido

- En cualquier momento (incluido con partido terminado) se puede **resetear** el marcador.
- El partido vuelve al estado inicial: puntos `0-0`, juegos `0-0`, sets `0-0`, sin tie-break, sin ganador, sin sets anteriores y sin historial de saques.
- Al resetear se puede **elegir de nuevo** el modo y la duración. Si no se indica otro, se mantienen los valores actuales.
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

- dos botones gigantes (`Punto Team 1`, `Punto Team 2`)
- un botón `Nuevo partido` para resetear el marcador
- control para elegir **Ventaja tradicional** o **Bola de oro**
- paneles para mostrar el Set Actual, los Sets Anteriores y los Puntos actuales

#### Tarea 3.3 — Conectar la UI con la lógica de negocio

**Descripción:** Hacer que los botones disparen los métodos de la clase `PartidoPadel` (probada en las fases anteriores) y actualicen el texto de la pantalla.

#### Tarea 3.4 — TDD para Nuevo partido

- **Prueba:** Tras un partido en curso o ya ganado, `resetear()` deja el marcador en `0-0` (puntos, juegos y sets), limpia ganador y sets anteriores, y vuelve a aceptar puntos.
- **UI:** el botón `Nuevo partido` llama a `resetear()` y refresca el marcador.

#### Tarea 3.5 — TDD para Bola de oro vs ventaja tradicional

- **Prueba:** con ventaja tradicional, Deuce → ventaja → no cierra el juego con un solo punto (comportamiento actual).
- **Prueba:** con bola de oro, desde `40-40` el siguiente punto gana el juego y resetea puntos.
- **UI:** selector de modo al iniciar / al pulsar Nuevo partido.

#### Tarea 3.6 — TDD para Deshacer último punto

- **Prueba:** un punto a 15 se deshace a 0; un punto que cierra juego/set/partido restaura el marcador anterior.
- **UI:** botón `Deshacer último punto`.
