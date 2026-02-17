# Casa Fallas (Web App)

App de diagnóstico técnico con carga automática de archivo Excel (`fallas.xlsx`), interfaz agradable y capacidad de instalación como app (PWA).

## Ejecutar en local

```bash
npm install
npm run dev
```

## Desplegar en Vercel

1. Sube este repositorio a GitHub.
2. Conéctalo desde [https://vercel.com](https://vercel.com).
3. ¡Listo!

---

## Formato del archivo Excel (`fallas.xlsx`)

El archivo Excel debe estar ubicado en la carpeta `public/` y debe tener las siguientes columnas:

### Columnas requeridas

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| **DISPOSITIVO** (o DSIPOSITIVO) | Nombre del dispositivo | `MONITOR`, `IMPRESORA`, `ROUTER` |
| **FALLA** | Descripción de la falla | `Pantalla negra`, `No imprime`, `Sin conexión` |
| **DIAGNOSTICO** | Diagnóstico del problema | `Cable HDMI desconectado`, `Cartucho de tinta vacío` |
| **SOLUCION** | Solución al problema | `Verificar conexión HDMI`, `Reemplazar cartucho` |

### Columnas opcionales (nuevas)

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| **IMAGEN** | Ruta o URL de imagen de referencia | `/imagenes/pantalla_negra.jpg` o `https://ejemplo.com/imagen.jpg` |
| **VIDEO** | URL de video tutorial (YouTube, etc.) | `https://www.youtube.com/watch?v=XXXXX` |

### Ejemplo de estructura del Excel

```
| DISPOSITIVO | FALLA           | DIAGNOSTICO                    | SOLUCION                    | IMAGEN                          | VIDEO                                    |
|-------------|-----------------|--------------------------------|-----------------------------|---------------------------------|------------------------------------------|
| MONITOR     | Pantalla negra  | Sin señal de video             | Revisar cable HDMI          | /imagenes/pantalla_negra.jpg    | https://youtube.com/watch?v=abc123       |
| IMPRESORA   | No imprime      | Cartucho de tinta vacío        | Reemplazar cartucho         | /imagenes/cartucho_vacio.jpg    |                                          |
| ROUTER      | Sin conexión    | Router sin energía             | Verificar cable de alimentación |                                 | https://youtube.com/watch?v=def456      |
```

### Cómo agregar imágenes

1. **Coloca las imágenes** en la carpeta `public/imagenes/` (crea la carpeta si no existe).
2. **En la columna IMAGEN** del Excel, escribe la ruta relativa desde `public/`:
   - Ejemplo: Si la imagen está en `public/imagenes/pantalla.jpg`, escribe: `/imagenes/pantalla.jpg`
   - También puedes usar URLs completas: `https://ejemplo.com/imagen.jpg`

### Cómo agregar videos

1. **En la columna VIDEO** del Excel, escribe la URL completa del video:
   - YouTube: `https://www.youtube.com/watch?v=XXXXX` o `https://youtu.be/XXXXX`
   - Vimeo: `https://vimeo.com/XXXXX`
   - Los videos se mostrarán **embebidos directamente en la app** (no como links)
   - Si la URL no es de YouTube o Vimeo, se mostrará como link externo

### Notas importantes

- ✅ Las columnas pueden estar en **mayúsculas o minúsculas** (DISPOSITIVO/dispositivo, FALLA/falla, etc.)
- ✅ Las columnas **IMAGEN** y **VIDEO** son **opcionales** - puedes dejarlas vacías si no las necesitas
- ✅ Si una fila no tiene imagen o video, simplemente deja la celda vacía
- ✅ Las imágenes deben estar en formato web común: `.jpg`, `.jpeg`, `.png`, `.webp`
- ✅ Los videos deben ser URLs válidas y accesibles

---
