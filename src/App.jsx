import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "./App.css";

export default function App() {
  const [fallas, setFallas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState(localStorage.getItem("dispositivo") || "");
  const [fallaSeleccionada, setFallaSeleccionada] = useState(localStorage.getItem("falla") || "");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const cargarExcel = async () => {
      try {
        const response = await fetch("/fallas.xlsx");
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("ARCHIVO_NO_ENCONTRADO");
          }
          throw new Error("Error de red al cargar el archivo.");
        }
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsed = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        const normalizado = parsed.map((f) => {
          // Buscar video en diferentes variaciones de mayúsculas/minúsculas
          const videoValue = f.VIDEO ?? f.video ?? f.Video ?? f.VIDEO ?? "";
          const videoStr = videoValue ? videoValue.toString().trim() : "";
          
          return {
            dispositivo: (f.DISPOSITIVO ?? f.DSIPOSITIVO ?? f.dispositivo)?.toString().trim() || "",
            falla: (f.FALLA ?? f.falla)?.toString().trim() || "",
            diagnostico: (f.DIAGNOSTICO ?? f.diagnostico)?.toString().trim() || "",
            solucion: (f.SOLUCION ?? f.solucion)?.toString().trim() || "",
            imagen: (f.IMAGEN ?? f.imagen)?.toString().trim() || "",
            video: videoStr,
          };
        });
        
        // Debug temporal: verificar URLs de video cargadas
        const conVideos = normalizado.filter(f => f.video && f.video.trim());
        console.log('=== DEBUG VIDEOS ===');
        console.log('Total de fallas cargadas:', normalizado.length);
        console.log('Fallas con video encontradas:', conVideos.length);
        if (conVideos.length > 0) {
          console.log('Ejemplos de URLs:', conVideos.slice(0, 3).map(f => ({ falla: f.falla, video: f.video })));
        } else {
          console.log('⚠️ No se encontraron videos. Verifica que la columna VIDEO tenga datos en el Excel.');
          // Mostrar todas las columnas disponibles para debug
          if (parsed.length > 0) {
            console.log('Columnas disponibles en Excel:', Object.keys(parsed[0]));
          }
        }

        const conDatos = normalizado.filter((f) => f.falla || f.diagnostico);
        if (!conDatos.length) {
          throw new Error("COLUMNAS_INVALIDAS");
        }
        const primera = conDatos.find((f) => f.falla && f.diagnostico);
        if (!primera) {
          throw new Error("COLUMNAS_INVALIDAS");
        }

        setFallas(normalizado);
      } catch (e) {
        if (e.message === "ARCHIVO_NO_ENCONTRADO") {
          setError("No se encontró el archivo fallas.xlsx. Asegúrate de que exista en la carpeta public/.");
        } else if (e.message === "COLUMNAS_INVALIDAS") {
          setError("El Excel no tiene el formato esperado. Debe incluir columnas: DISPOSITIVO (o DSIPOSITIVO), FALLA, DIAGNOSTICO y SOLUCION.");
        } else {
          setError(e.message || "Error al cargar el archivo. Comprueba que fallas.xlsx esté en public/ y tenga las columnas correctas.");
        }
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

  const termino = busqueda.trim().toLowerCase();
  const coincide = (f) =>
    !termino ||
    [f.dispositivo, f.falla, f.diagnostico, f.solucion].some(
      (v) => v && String(v).toLowerCase().includes(termino)
    );

  const convertirUrlVideo = (url) => {
    if (!url || typeof url !== 'string') return null;
    
    const urlTrimmed = url.trim();
    if (!urlTrimmed) return null;
    
    // YouTube: https://www.youtube.com/watch?v=XXXXX o https://youtube.com/watch?v=XXXXX
    let match = urlTrimmed.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/i);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    
    // YouTube: https://youtu.be/XXXXX
    match = urlTrimmed.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    
    // YouTube: https://www.youtube.com/embed/XXXXX (ya está en formato embed)
    if (urlTrimmed.match(/youtube\.com\/embed\/[a-zA-Z0-9_-]+/i)) {
      return urlTrimmed;
    }
    
    // Vimeo: https://vimeo.com/XXXXX
    match = urlTrimmed.match(/vimeo\.com\/(\d+)/i);
    if (match && match[1]) {
      return `https://player.vimeo.com/video/${match[1]}`;
    }
    
    // Vimeo: https://player.vimeo.com/video/XXXXX (ya está en formato embed)
    if (urlTrimmed.match(/player\.vimeo\.com\/video\/\d+/i)) {
      return urlTrimmed;
    }
    
    // Si no coincide con ningún formato conocido, devolver null
    return null;
  };

  const RenderVideo = ({ videoUrl, titulo, classNameContainer = "item-video-container", classNameWrapper = "item-video-wrapper", classNameIframe = "item-video-iframe" }) => {
    // Debug: verificar que la URL existe
    if (!videoUrl || (typeof videoUrl === 'string' && !videoUrl.trim())) {
      console.log('RenderVideo - URL vacía o inválida:', videoUrl);
      return null;
    }
    
    // Debug temporal: mostrar URL en consola
    console.log('RenderVideo - URL recibida:', videoUrl);
    
    const embedUrl = convertirUrlVideo(videoUrl);
    console.log('RenderVideo - URL convertida a embed:', embedUrl);
    
    if (embedUrl) {
      return (
        <div className={classNameContainer}>
          <strong>Video:</strong>
          <div className={classNameWrapper}>
            <iframe
              src={embedUrl}
              title={titulo || "Video de referencia"}
              className={classNameIframe}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      );
    }
    
    // Si no se puede convertir a embed, mostrar como link
    console.log('RenderVideo - No se pudo convertir a embed, mostrando como link');
    return (
      <div className={classNameContainer}>
        <p className="item-video">
          <strong>Video:</strong>{" "}
          <a href={videoUrl} target="_blank" rel="noreferrer">
            Ver video de referencia
          </a>
          <br />
          <small style={{ color: '#666', fontSize: '0.9em' }}>URL: {videoUrl}</small>
        </p>
      </div>
    );
  };

  const dispositivos = [...new Set(fallas.map((f) => f.dispositivo).filter(Boolean))];
  const fallasFiltradas = fallas
    .filter((f) => f.dispositivo === dispositivoSeleccionado)
    .filter(coincide);
  const resultado = fallas.find((f) =>
    f.dispositivo === dispositivoSeleccionado && f.falla === fallaSeleccionada
  );
  const resultadosBusqueda = termino ? fallas.filter(coincide) : [];

  return (
    <div className="container">
      <header className="header">
        <h1>Caza Fallas</h1>
        <p className="subtitle">
          Asistente de diagnóstico técnico: busca por palabras clave o elige un dispositivo para obtener
          un diagnóstico y una solución sugerida.
        </p>
      </header>

      {loading && <p className="spinner">Cargando archivo...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="layout">
          <section className="panel panel--left">
            <div className="form-group form-group--busqueda">
              <div className="label-row">
                <label htmlFor="busqueda">Buscar por falla, diagnóstico o solución:</label>
                {termino && (
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => setBusqueda("")}
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
              <input
                id="busqueda"
                type="search"
                placeholder="Ej: error 404, pantalla negra..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input-busqueda"
                autoComplete="off"
              />
              <p className="help-text">
                Puedes escribir síntomas, mensajes de error o palabras clave. Si lo prefieres, deja la búsqueda
                vacía y usa los filtros por dispositivo y falla.
              </p>
            </div>

            {!termino && (
              <>
                <div className="form-group">
                  <label htmlFor="dispositivo">Dispositivo:</label>
                  <select
                    id="dispositivo"
                    value={dispositivoSeleccionado}
                    onChange={(e) => setDispositivoSeleccionado(e.target.value)}
                  >
                    <option value="">Seleccione</option>
                    {dispositivos.map((d, i) => (
                      <option key={i} value={d}>{d}</option>
                    ))}
                  </select>
                  {!dispositivoSeleccionado && (
                    <p className="help-text">
                      Elige un dispositivo para ver las fallas registradas para ese equipo.
                    </p>
                  )}
                </div>

                {dispositivoSeleccionado && (
                  <div className="form-group">
                    <label htmlFor="falla">Falla:</label>
                    <select
                      id="falla"
                      value={fallaSeleccionada}
                      onChange={(e) => setFallaSeleccionada(e.target.value)}
                    >
                      <option value="">Seleccione</option>
                      {fallasFiltradas.map((f, i) => (
                        <option key={i} value={f.falla}>{f.falla}</option>
                      ))}
                    </select>
                    {dispositivoSeleccionado && !fallaSeleccionada && (
                      <p className="help-text">
                        Ahora selecciona una falla para ver el diagnóstico y la solución sugerida.
                      </p>
                    )}
                  </div>
                )}

                {(dispositivoSeleccionado || fallaSeleccionada) && (
                  <div className="acciones-filtros">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setDispositivoSeleccionado("");
                        setFallaSeleccionada("");
                      }}
                    >
                      Limpiar selección
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          <section className="panel panel--right">
            {termino ? (
              <div className="resultados-busqueda">
                {resultadosBusqueda.length > 0 ? (
                  <>
                    <h2>Resultados ({resultadosBusqueda.length})</h2>
                    <p className="help-text help-text--compact">
                      Listado de coincidencias con tu búsqueda en dispositivo, falla, diagnóstico o solución.
                    </p>
                    <ul className="lista-resultados">
                      {resultadosBusqueda.map((f, i) => (
                        <li key={i} className="item-resultado">
                          {f.dispositivo && <span className="item-dispositivo">{f.dispositivo}</span>}
                          {f.falla && <span className="item-falla">{f.falla}</span>}
                          <p className="item-diagnostico">
                            <strong>Diagnóstico:</strong> {f.diagnostico}
                          </p>
                          <p className="item-solucion">
                            <strong>Solución:</strong> {f.solucion}
                          </p>
                          {f.imagen && (
                            <div className="item-media">
                              <img
                                src={f.imagen}
                                alt={`Referencia de ${f.falla || "falla"}`}
                                className="item-imagen"
                                loading="lazy"
                              />
                            </div>
                          )}
                          {f.video && f.video.trim() && (
                            <RenderVideo
                              videoUrl={f.video}
                              titulo={`Video de referencia: ${f.falla || "falla"}`}
                            />
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="sin-resultados">No se encontraron resultados para &quot;{busqueda.trim()}&quot;.</p>
                )}
              </div>
            ) : resultado ? (
              <div className="resultado">
                <div className="resultado-header">
                  {resultado.dispositivo && (
                    <span className="chip chip--dispositivo">{resultado.dispositivo}</span>
                  )}
                  {resultado.falla && (
                    <span className="chip chip--falla">{resultado.falla}</span>
                  )}
                </div>
                <p>
                  <strong>Diagnóstico:</strong> {resultado.diagnostico}
                </p>
                <p>
                  <strong>Solución:</strong> {resultado.solucion}
                </p>
                {resultado.imagen && (
                  <div className="resultado-media">
                    <img
                      src={resultado.imagen}
                      alt={`Referencia de ${resultado.falla}`}
                      className="resultado-imagen"
                      loading="lazy"
                    />
                  </div>
                )}
                {resultado.video && resultado.video.trim() && (
                  <RenderVideo
                    videoUrl={resultado.video}
                    titulo={`Video de referencia: ${resultado.falla}`}
                    classNameContainer="resultado-video-container"
                    classNameWrapper="resultado-video-wrapper"
                    classNameIframe="resultado-video-iframe"
                  />
                )}
              </div>
            ) : (
              <p className="placeholder">
                Usa el buscador de la izquierda o selecciona un dispositivo y una falla para ver aquí el
                diagnóstico y la solución sugerida.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
