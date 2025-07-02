import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import * as XLSX from "xlsx";

export default function DiagnosticoFallas() {
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
    <div className="max-w-4xl mx-auto mt-10 space-y-6">
      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-xl font-bold">Diagnóstico de Fallas</h2>

          <Input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="mb-4" />

          {fallas.length > 0 && (
            <>
              <Select onValueChange={setDispositivoSeleccionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un dispositivo" />
                </SelectTrigger>
                <SelectContent>
                  {dispositivos.map((d, index) => (
                    <SelectItem key={index} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {dispositivoSeleccionado && (
                <Select onValueChange={setFallaSeleccionada}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una falla" />
                  </SelectTrigger>
                  <SelectContent>
                    {fallasFiltradas.map((f, index) => (
                      <SelectItem key={index} value={f.falla}>{f.falla}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {resultado && (
                <div className="bg-gray-100 p-4 rounded-xl space-y-2">
                  <p><strong>Diagnóstico:</strong> {resultado.diagnostico}</p>
                  <p><strong>Solución:</strong> {resultado.solucion}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
