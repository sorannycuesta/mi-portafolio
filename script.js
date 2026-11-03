document.documentElement.classList.add("js");

/* Menú: marca la sección que se está viendo (solo en index.html) */
const enlacesMenu = document.querySelectorAll('.menu a[href^="#"]');
const secciones = [...enlacesMenu]
  .map((enlace) => document.querySelector(enlace.getAttribute("href")))
  .filter(Boolean);

if (secciones.length && "IntersectionObserver" in window) {
  const observadorMenu = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        enlacesMenu.forEach((enlace) => {
          const activo = enlace.getAttribute("href") === `#${entrada.target.id}`;
          if (activo) {
            enlace.setAttribute("aria-current", "true");
          } else {
            enlace.removeAttribute("aria-current");
          }
        });
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  secciones.forEach((seccion) => observadorMenu.observe(seccion));
}

/* Cierra el menú móvil (Bootstrap) al elegir una sección */
const menuColapsable = document.querySelector("#menuPrincipal");
if (menuColapsable && window.bootstrap) {
  menuColapsable.querySelectorAll("a").forEach((enlace) => {
    enlace.addEventListener("click", () => {
      if (menuColapsable.classList.contains("show")) {
        window.bootstrap.Collapse.getOrCreateInstance(menuColapsable).hide();
      }
    });
  });
}

/* Aparición suave de los bloques al hacer scroll */
const bloques = document.querySelectorAll(".revelar");

if ("IntersectionObserver" in window) {
  const observadorBloques = new IntersectionObserver(
    (entradas, observador) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target);
      });
    },
    { threshold: 0.12 }
  );
  bloques.forEach((bloque) => observadorBloques.observe(bloque));
} else {
  bloques.forEach((bloque) => bloque.classList.add("visible"));
}

/* Maqueta interactiva de reservas (página de CanchaYa) */
const demo = document.querySelector("#demo-reservas");

if (demo) {
  const canchas = ["Cancha 1", "Cancha 2", "Cancha 3"];
  const horas = ["6 pm", "7 pm", "8 pm", "9 pm"];
  const ocupadasIniciales = ["0-1", "1-0", "1-2", "2-3"];

  const tabla = demo.querySelector(".demo__tabla");
  const mensaje = demo.querySelector(".demo__estado");
  const botonConfirmar = demo.querySelector('[data-accion="confirmar"]');
  const botonReiniciar = demo.querySelector('[data-accion="reiniciar"]');

  let ocupadas = new Set(ocupadasIniciales);
  let elegida = null;
  const casillas = new Map();

  tabla.style.setProperty("--columnas", horas.length);

  const esquina = document.createElement("span");
  esquina.className = "demo__cabecera";
  tabla.appendChild(esquina);

  horas.forEach((hora) => {
    const cabecera = document.createElement("span");
    cabecera.className = "demo__cabecera";
    cabecera.textContent = hora;
    tabla.appendChild(cabecera);
  });

  canchas.forEach((cancha, fila) => {
    const nombre = document.createElement("span");
    nombre.className = "demo__cancha";
    nombre.textContent = cancha;
    tabla.appendChild(nombre);

    horas.forEach((hora, columna) => {
      const id = `${fila}-${columna}`;
      const casilla = document.createElement("button");
      casilla.type = "button";
      casilla.className = "casilla";
      casilla.dataset.id = id;
      casilla.addEventListener("click", () => elegir(id, cancha, hora));
      tabla.appendChild(casilla);
      casillas.set(id, { elemento: casilla, cancha, hora });
    });
  });

  function pintar() {
    casillas.forEach(({ elemento, cancha, hora }, id) => {
      const ocupada = ocupadas.has(id);
      const esElegida = id === elegida;
      elemento.dataset.estado = ocupada ? "ocupada" : esElegida ? "elegida" : "libre";
      elemento.setAttribute("aria-pressed", String(esElegida));
      const estado = ocupada ? "ocupada" : esElegida ? "elegida" : "libre";
      elemento.setAttribute("aria-label", `${cancha}, ${hora}, ${estado}`);
      elemento.textContent = ocupada ? "Ocupada" : esElegida ? "Tuya" : "Libre";
    });
  }

  function elegir(id, cancha, hora) {
    if (ocupadas.has(id)) {
      mensaje.textContent = `${cancha} a las ${hora} ya está ocupada. En la maqueta una hora no se puede reservar dos veces.`;
      return;
    }
    elegida = id === elegida ? null : id;
    mensaje.textContent = elegida
      ? `Elegiste ${cancha} a las ${hora}. Confirma para reservar.`
      : "Elige una hora libre para empezar.";
    pintar();
  }

  botonConfirmar.addEventListener("click", () => {
    if (!elegida) {
      mensaje.textContent = "Primero elige una hora libre.";
      return;
    }
    const { cancha, hora } = casillas.get(elegida);
    ocupadas.add(elegida);
    elegida = null;
    mensaje.textContent = `Reserva confirmada: ${cancha} a las ${hora}.`;
    pintar();
  });

  botonReiniciar.addEventListener("click", () => {
    ocupadas = new Set(ocupadasIniciales);
    elegida = null;
    mensaje.textContent = "Elige una hora libre para empezar.";
    pintar();
  });

  pintar();
}