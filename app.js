/* ==========================================================================
   NEXATECH SOLUTIONS - LÓGICA PRINCIPAL (DOM, FETCH Y MODAL DIALOG)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  inicializarMenuMovil();
  cargarServiciosDesdeJSON();
  inicializarFormularioContacto();
});

/* 1. MENÚ RESPONSIVO PARA CELULARES */
function inicializarMenuMovil() {
  const btnMenu = document.getElementById("btn-menu");
  const navMenu = document.getElementById("menu-principal");

  if (btnMenu && navMenu) {
    btnMenu.addEventListener("click", () => {
      navMenu.classList.toggle("abierto");
    });
  }
}

/* 2. CONSUMO DE JSON CON FETCH() Y RENDERIZADO DINÁMICO EN SERVICIOS.HTML */
async function cargarServiciosDesdeJSON() {
  const contenedor = document.getElementById("lista-servicios");
  if (!contenedor) return; // Solo se ejecuta si estamos en Servicios.html

  try {
    const respuesta = await fetch("servicios.json");
    if (!respuesta.ok) {
      throw new Error("No se pudo obtener el archivo servicios.json");
    }

    const servicios = await respuesta.json();
    console.log("Servicios cargados desde JSON:", servicios);
    console.table(servicios, [
      "id",
      "titulo",
      "categoria",
      "precioReferencial",
    ]);
    contenedor.innerHTML = "";

    servicios.forEach((servicio) => {
      // Crear <article class="tarjeta-servicio">
      const tarjeta = document.createElement("article");
      tarjeta.className = "tarjeta-servicio";

      // Contenedor izquierdo de información
      const infoDiv = document.createElement("div");
      infoDiv.className = "info-servicio";

      const titulo = document.createElement("h3");
      titulo.textContent = servicio.titulo;

      const descripcion = document.createElement("p");
      descripcion.textContent = servicio.descripcion;

      // Botón que abre el modal <dialog> con el detalle del servicio
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "btn-servicio";
      boton.textContent = "Solicitar servicio";
      boton.addEventListener("click", () => abrirModalServicio(servicio));

      infoDiv.append(titulo, descripcion, boton);

      // Ícono derecho de Font Awesome
      const icono = document.createElement("i");
      icono.className = `${servicio.icono} icono-servicio`;
      icono.setAttribute("aria-hidden", "true");

      tarjeta.append(infoDiv, icono);
      contenedor.append(tarjeta);
    });
  } catch (error) {
    console.error("Error cargando servicios:", error);
    contenedor.innerHTML = `
      <article class="tarjeta-servicio">
        <div class="info-servicio">
          <h3>Error al cargar el catálogo</h3>
          <p>Abre el proyecto usando <strong>Live Server</strong> en VS Code para visualizar los servicios desde JSON.</p>
        </div>
      </article>
    `;
  }
}

/* 3. CONTROL DE VENTANA MODAL <dialog> */
function abrirModalServicio(servicio) {
  const modal = document.getElementById("modal-servicio");
  if (!modal) return;

  document.getElementById("modal-titulo").textContent = servicio.titulo;
  document.getElementById("modal-categoria").textContent = servicio.categoria;
  document.getElementById("modal-descripcion").textContent =
    servicio.descripcion;
  document.getElementById("modal-incluye").textContent = servicio.incluye;
  document.getElementById("modal-precio").textContent =
    servicio.precioReferencial;
  document.getElementById("modal-tiempo").textContent = servicio.tiempoEntrega;

  // Enlace directo a Contactos enviando el nombre del servicio por URL
  const btnCotizar = document.getElementById("modal-btn-cotizar");
  btnCotizar.href = `Contactos.html?servicio=${encodeURIComponent(servicio.titulo)}`;

  modal.showModal();
  console.log("Modal abierto para:", servicio.titulo);
}

/* 4. INTERACCIÓN EN FORMULARIO DE CONTACTOS.HTML */
function inicializarFormularioContacto() {
  const form = document.getElementById("form-contacto");
  if (!form) return;

  // Si el usuario viene desde el modal de un servicio, autocompletar el mensaje
  const params = new URLSearchParams(window.location.search);
  const servicioElegido = params.get("servicio");
  const campoMensaje = document.getElementById("mensaje");

  if (servicioElegido && campoMensaje) {
    campoMensaje.value = `Hola, me gustaría solicitar información y cotización sobre: ${servicioElegido}.`;
  }

  // Confirmación visual sin recargar la página
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value.trim();
    const alerta = document.getElementById("mensaje-confirmacion");

    if (alerta) {
      alerta.textContent = `¡Gracias, ${nombre}! Hemos recibido tu solicitud. Nos comunicaremos contigo a la brevedad.`;
      alerta.style.display = "block";
    }
    form.reset();
    console.log("Formulario validado correctamente");
  });
}
