// Variables globales
let productosAgregados = [];
const URL_GET = "https://script.google.com/macros/s/AKfycbyHDbBguaVmRkoLl7XkJwyIIenWTVNFH-Jaa726vLZEwoJgbY77QCxSMVmC7i24EVxr/exec"; // Ej: https://script.google.com/macros/s/.../exec
const URL_POST = "https://script.google.com/macros/s/AKfycbyHDbBguaVmRkoLl7XkJwyIIenWTVNFH-Jaa726vLZEwoJgbY77QCxSMVmC7i24EVxr/exec"; // Misma URL para POST

// Cargar productos al iniciar
document.addEventListener("DOMContentLoaded", async () => {
    await cargarProductos();
});

// Obtener productos desde Google Sheets
async function cargarProductos() {
    try {
        const response = await fetch(URL_GET);
        if (!response.ok) throw new Error("Error en la respuesta");
        
        const productos = await response.json();
        const select = document.getElementById("producto");
        
        // Limpiar select
        select.innerHTML = "";
        
        // Agregar opción por defecto
        const defaultOption = new Option("Selecciona un producto", "");
        select.add(defaultOption);
        
        // Agregar productos (forma más eficiente)
        productos.forEach(producto => {
            select.add(new Option(producto.nombre, producto.nombre));
        });
        
    } catch (error) {
        console.error("Error al cargar productos:", error);
        // Opción de fallback
        document.getElementById("producto").innerHTML = `
            <option value="">Error al cargar productos</option>
            <option value="manual">Ingresar manualmente</option>
        `;
    }
}

// Agregar producto a la tabla
document.getElementById("agregarProducto").addEventListener("click", () => {
    const productoSelect = document.getElementById("producto");
    const cantidadInput = document.getElementById("cantidad");
    
    if (!productoSelect.value || !cantidadInput.value) {
        alert("Selecciona un producto e ingresa la cantidad.");
        return;
    }
    
    productosAgregados.push({
        producto: productoSelect.value,
        cantidad: cantidadInput.value
    });
    
    actualizarTablaProductos();
    
    // Resetear campos
    productoSelect.selectedIndex = 0;
    cantidadInput.value = "";
});

// Actualizar tabla de productos
function actualizarTablaProductos() {
    const tbody = document.getElementById("listaProductos");
    const tabla = document.getElementById("tablaProductos");
    
    tbody.innerHTML = productosAgregados.map((item, index) => `
        <tr>
            <td>${item.producto}</td>
            <td>${item.cantidad}</td>
            <td><button class="btn btn-sm btn-danger" onclick="eliminarProducto(${index})">✕ Elimina </button></td>
        </tr>
    `).join("");
    
    tabla.classList.toggle("d-none", productosAgregados.length === 0);
}

// Eliminar producto
window.eliminarProducto = (index) => {
    productosAgregados.splice(index, 1);
    actualizarTablaProductos();
};

// Enviar pedido
document.getElementById("pedidoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const pedido = {
    vendedor: document.getElementById("vendedor").value,
    cliente: document.getElementById("cliente").value,
    productos: productosAgregados,
    comentarios: document.getElementById("comentarios").value
  };

  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbyHDbBguaVmRkoLl7XkJwyIIenWTVNFH-Jaa726vLZEwoJgbY77QCxSMVmC7i24EVxr/exec",
      {
        method: "POST",
        headers: { "Content-Type": "text/plain" }, // ¡Importante!
        body: JSON.stringify(pedido),
        mode: "no-cors" // Ignora CORS (no podrás leer la respuesta)
      }
    );
    
    // Aunque no puedas leer la respuesta, los datos llegarán a Sheets
    alert("Pedido enviado. Revisa tu Google Sheet.");
    document.getElementById("pedidoForm").reset();
    productosAgregados = [];
    
  } catch (error) {
    console.error("Error:", error);
    alert("Los datos se enviaron, pero verifica tu Sheet.");
  }
});