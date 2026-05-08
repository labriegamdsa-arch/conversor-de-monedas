const montoInput = document.querySelector("#monto");
const monedaSelect = document.querySelector("#moneda");
const btnBuscar = document.querySelector("#btnBuscar");
const resultado = document.querySelector("#resultado");
const error = document.querySelector("#error");

let grafico = null;

async function obtenerDatosMoneda(moneda) {
  const endpoint = `https://mindicador.cl/api/${moneda}`;

  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error("No se pudo obtener la información de la moneda");
    }

    const data = await response.json();
    return data;

  } catch (e) {
    error.textContent = `Error: ${e.message}`;
    resultado.textContent = "...";
  }
}

function calcularConversion(montoCLP, valorMoneda) {
  return montoCLP / valorMoneda;
}

function crearGrafico(datos, moneda) {
  const ultimos10Dias = datos.serie.slice(0, 10).reverse();

  const labels = ultimos10Dias.map((dia) => {
    return new Date(dia.fecha).toLocaleDateString("es-CL");
  });

  const valores = ultimos10Dias.map((dia) => dia.valor);

  const ctx = document.querySelector("#myChart");

  if (grafico) {
    grafico.destroy();
  }

  grafico = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: `Valor ${moneda}`,
          data: valores,
          borderWidth: 2,
          tension: 0.2
        }
      ]
    }
  });
}
btnBuscar.addEventListener("click", async () => {
  error.textContent = "";
  resultado.textContent = "...";

  const monto = Number(montoInput.value);
  const moneda = monedaSelect.value;

  if (!monto || monto <= 0) {
    error.textContent = "Debe ingresar un monto válido en pesos chilenos.";
    return;
  }

  if (moneda === "") {
    error.textContent = "Debe seleccionar una moneda.";
    return;
  }

  const datos = await obtenerDatosMoneda(moneda);

  if (!datos) {
    return;
  }

  const valorMoneda = datos.serie[0].valor;
  const conversion = calcularConversion(monto, valorMoneda);

  resultado.textContent = `Resultado: $${conversion.toFixed(2)}`;

  crearGrafico(datos, moneda);
});