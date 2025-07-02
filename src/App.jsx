import { useState } from "react";
import * as XLSX from "xlsx";

export default function App() {
  const [fallas, setFallas] = useState([]);
  const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState("");
  const [fallaSeleccionada, setFallaSeleccionada] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const normalizado = parsedData.map((f) => ({
        dispositivo: f.DSIPOSITIVO || f.dispositivo,
        falla: f.FALLA || f.falla,
        diagnostico: f.DIAGNOSTICO || f.diagnostico,
        solucion: f.SOLUCION || f.solucion,
      }));

      setFallas(normalizado);
    };
    reader.readAsArrayBuffer(file);
  };

  const dispositivos = [...new Set(fallas.map((f) => f.dispositivo))];
  const fallasFiltradas = fallas.filter((f) => f.dispositivo === dispositivoSeleccionado);
  const resultado = fallas.find(
    (f) => f.dispositivo === dispositivoSeleccionado && f.falla === fallaSeleccionada
  );

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Diagnóstico de Fallas</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} style={{ marginBottom: 20 }} />

      {fallas.length > 0 && (
        <>
          <div>
            <label>Dispositivo:</label>
            <select onChange={(e) => setDispositivoSeleccionado(e.target.value)}>
              <option value="">Selecciona</option>
              {dispositivos.map((d, i) => (
                <option key={i} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {dispositivoSeleccionado && (
            <div>
              <label>Falla:</label>
              <select onChange={(e) => setFallaSeleccionada(e.target.value)}>
                <option value="">Selecciona</option>
                {fallasFiltradas.map((f, i) => (
                  <option key={i} value={f.falla}>{f.falla}</option>
                ))}
              </select>
            </div>
          )}

          {resultado && (
            <div style={{ background: '#f0f0f0', padding: 20, marginTop: 20 }}>
              <p><strong>Diagnóstico:</strong> {resultado.diagnostico}</p>
              <p><strong>Solución:</strong> {resultado.solucion}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
