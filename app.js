/* ==========================================================================
   NEXATECH SOLUTIONS - LÓGICA PRINCIPAL (DOM, FETCH Y MODAL DIALOG)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  inicializarPanelAdmin();
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

/* =========================================================
   MÓDULO ADMINISTRADOR (CRUD EN MEMORIA + FETCH JSON)
   ========================================================= */
async function inicializarPanelAdmin() {
  const tbody = document.getElementById("tabla-admin-servicios");
  if (!tbody) return;

  let serviciosAdmin = [];
  const buscador = document.getElementById("buscador-admin");
  const filtroCategoria = document.getElementById("filtro-categoria-admin");
  const modalAdmin = document.getElementById("modal-admin-servicio");
  const formAdmin = document.getElementById("form-admin-servicio");
  const tituloModal = document.getElementById("titulo-modal-admin");

  try {
    const respuesta = await fetch("servicios.json");
    if (!respuesta.ok) throw new Error("No se pudo cargar servicios.json");
    serviciosAdmin = await respuesta.json();
    console.log("Panel Admin inicializado con servicios:", serviciosAdmin);
    renderizarTablaAdmin(serviciosAdmin);
  } catch (error) {
    console.error("Error en Panel Admin:", error);
  }

  function actualizarKPIs(lista) {
    const kpiTotal = document.getElementById("kpi-total-servicios");
    const kpiCategorias = document.getElementById("kpi-total-categorias");
    if (kpiTotal) kpiTotal.textContent = lista.length;
    if (kpiCategorias) {
      const unicas = new Set(lista.map((s) => s.categoria));
      kpiCategorias.textContent = unicas.size;
    }
  }

  function filtrarYRenderizar() {
    const texto = buscador.value.toLowerCase().trim();
    const cat = filtroCategoria.value;

    const filtrados = serviciosAdmin.filter((s) => {
      const coincideTexto =
        s.titulo.toLowerCase().includes(texto) ||
        s.descripcion.toLowerCase().includes(texto);
      const coincideCategoria = cat === "todas" || s.categoria === cat;
      return coincideTexto && coincideCategoria;
    });

    renderizarTablaAdmin(filtrados);
  }

  function renderizarTablaAdmin(lista) {
    tbody.innerHTML = "";
    actualizarKPIs(serviciosAdmin);

    if (lista.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No se encontraron servicios con ese filtro.</td></tr>`;
      return;
    }

    lista.forEach((servicio) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>#${servicio.id}</td>
        <td><strong>${servicio.titulo}</strong></td>
        <td>${servicio.categoria}</td>
        <td>${servicio.precioReferencial}</td>
        <td>${servicio.tiempoEntrega}</td>
        <td><span class="badge-activo">Activo</span></td>
        <td class="celda-acciones">
          <button type="button" class="btn-editar" data-id="${servicio.id}" title="Editar">
            <i class="fa-solid fa-pen-to-square"></i> Editar
          </button>
          <button type="button" class="btn-eliminar" data-id="${servicio.id}" title="Eliminar">
            <i class="fa-solid fa-trash"></i> Eliminar
          </button>
        </td>
      `;
      tbody.appendChild(fila);
    });

    tbody.querySelectorAll(".btn-editar").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        const item = serviciosAdmin.find((s) => s.id === id);
        if (!item) return;

        tituloModal.textContent = "Editar Servicio";
        document.getElementById("admin-servicio-id").value = item.id;
        document.getElementById("admin-titulo").value = item.titulo;
        document.getElementById("admin-categoria").value = item.categoria;
        document.getElementById("admin-precio").value = item.precioReferencial;
        document.getElementById("admin-tiempo").value = item.tiempoEntrega;
        document.getElementById("admin-incluye").value = item.incluye;
        document.getElementById("admin-descripcion").value = item.descripcion;
        modalAdmin.showModal();
      });
    });

    tbody.querySelectorAll(".btn-eliminar").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        if (
          confirm("¿Deseas eliminar este servicio del catálogo administrativo?")
        ) {
          serviciosAdmin = serviciosAdmin.filter((s) => s.id !== id);
          console.log(
            `Servicio #${id} eliminado. Total actual:`,
            serviciosAdmin.length,
          );
          filtrarYRenderizar();
        }
      });
    });
  }

  buscador.addEventListener("input", filtrarYRenderizar);
  filtroCategoria.addEventListener("change", filtrarYRenderizar);

  document
    .getElementById("btn-nuevo-servicio")
    .addEventListener("click", () => {
      formAdmin.reset();
      document.getElementById("admin-servicio-id").value = "";
      tituloModal.textContent = "Nuevo Servicio";
      modalAdmin.showModal();
    });

  document
    .getElementById("btn-cerrar-modal-admin")
    .addEventListener("click", () => modalAdmin.close());
  document
    .getElementById("btn-cancelar-admin")
    .addEventListener("click", () => modalAdmin.close());

  formAdmin.addEventListener("submit", (e) => {
    e.preventDefault();
    const idExistente = document.getElementById("admin-servicio-id").value;

    const datosServicio = {
      id: idExistente
        ? Number(idExistente)
        : Math.max(0, ...serviciosAdmin.map((s) => s.id)) + 1,
      titulo: document.getElementById("admin-titulo").value.trim(),
      categoria: document.getElementById("admin-categoria").value,
      precioReferencial: document.getElementById("admin-precio").value.trim(),
      tiempoEntrega: document.getElementById("admin-tiempo").value.trim(),
      incluye: document.getElementById("admin-incluye").value.trim(),
      descripcion: document.getElementById("admin-descripcion").value.trim(),
      icono: "fa-solid fa-code",
    };

    if (idExistente) {
      const indice = serviciosAdmin.findIndex(
        (s) => s.id === Number(idExistente),
      );
      if (indice !== -1)
        serviciosAdmin[indice] = {
          ...serviciosAdmin[indice],
          ...datosServicio,
        };
      console.log("Servicio actualizado:", datosServicio);
    } else {
      serviciosAdmin.push(datosServicio);
      console.log("Nuevo servicio agregado:", datosServicio);
    }

    modalAdmin.close();
    filtrarYRenderizar();
  });
}
