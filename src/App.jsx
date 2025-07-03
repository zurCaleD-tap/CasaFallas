import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "./App.css";

export default function App() {
  const [fallas, setFallas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState(localStorage.getItem("dispositivo") || "");
  const [fallaSeleccionada, setFallaSeleccionada] = useState(localStorage.getItem("falla") || "");

  useEffect(() => {
    const cargarExcel = async () => {
      try {
        const response = await fetch("/fallas.xlsx");
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsed = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        const normalizado = parsed.map((f) => ({
          dispositivo: f.DSIPOSITIVO || f.dispositivo,
          falla: f.FALLA || f.falla,
          diagnostico: f.DIAGNOSTICO || f.diagnostico,
          solucion: f.SOLUCION || f.solucion,
        }));

        if (!normalizado.length || !normalizado[0].falla || !normalizado[0].diagnostico) {
          throw new Error("El archivo Excel no contiene los campos requeridos.");
        }

        setFallas(normalizado);
      } catch (e) {
        setError("Error al cargar el archivo Excel. Verifica que tenga las columnas FALLA, DIAGNOSTICO y SOLUCION.");
      } finally {
        setLoading(false);
      }
    };
    cargarExcel();
  }, []);

  useEffect(() => {
    localStorage.setItem("dispositivo", dispositivoSeleccionado);
    localStorage.setItem("falla", fallaSeleccionada);
  }, [dispositivoSeleccionado, fallaSeleccionada]);

  const dispositivos = [...new Set(fallas.map((f) => f.dispositivo))];
  const fallasFiltradas = fallas.filter((f) => f.dispositivo === dispositivoSeleccionado);
  const resultado = fallas.find((f) =>
    f.dispositivo === dispositivoSeleccionado && f.falla === fallaSeleccionada
  );

  return (
    <div className="container">
      <h1>Casa Fallas</h1>

      {loading && <p className="spinner">Cargando archivo...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="form-group">
            <label>Dispositivo:</label>
            <select value={dispositivoSeleccionado} onChange={(e) => setDispositivoSeleccionado(e.target.value)}>
              <option value="">Seleccione</option>
              {dispositivos.map((d, i) => (
                <option key={i} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {dispositivoSeleccionado && (
            <div className="form-group">
              <label>Falla:</label>
              <select value={fallaSeleccionada} onChange={(e) => setFallaSeleccionada(e.target.value)}>
                <option value="">Seleccione</option>
                {fallasFiltradas.map((f, i) => (
                  <option key={i} value={f.falla}>{f.falla}</option>
                ))}
              </select>
            </div>
          )}

          {resultado && (
            <div className="resultado">
              <p><strong>Diagnóstico:</strong> {resultado.diagnostico}</p>
              <p><strong>Solución:</strong> {resultado.solucion}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
