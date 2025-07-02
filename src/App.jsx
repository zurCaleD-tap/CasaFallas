import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

export default function App() {
  const [fallas, setFallas] = useState([]);
  const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState("");
  const [fallaSeleccionada, setFallaSeleccionada] = useState("");

  useEffect(() => {
    const cargarExcel = async () => {
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

      setFallas(normalizado);
    };
    cargarExcel();
  }, []);

  const dispositivos = [...new Set(fallas.map((f) => f.dispositivo))];
  const fallasFiltradas = fallas.filter((f) => f.dispositivo === dispositivoSeleccionado);
  const resultado = fallas.find(
    (f) => f.dispositivo === dispositivoSeleccionado && f.falla === fallaSeleccionada
  );

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Casa Fallas</h1>

      <div style={{ marginBottom: 20 }}>
        <label>Dispositivo:</label>
        <select onChange={(e) => setDispositivoSeleccionado(e.target.value)}>
          <option value="">Seleccione</option>
          {dispositivos.map((d, i) => (
            <option key={i} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {dispositivoSeleccionado && (
        <div style={{ marginBottom: 20 }}>
          <label>Falla:</label>
          <select onChange={(e) => setFallaSeleccionada(e.target.value)}>
            <option value="">Seleccione</option>
            {fallasFiltradas.map((f, i) => (
              <option key={i} value={f.falla}>{f.falla}</option>
            ))}
          </select>
        </div>
      )}

      {resultado && (
        <div style={{ background: '#f0f0f0', padding: 20 }}>
          <p><strong>Diagnóstico:</strong> {resultado.diagnostico}</p>
          <p><strong>Solución:</strong> {resultado.solucion}</p>
        </div>
      )}
    </div>
  );
}
