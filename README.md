# Cotizo – Prototipo funcional

Cotizo es un cotizador en línea por suscripción para distribuidores de artículos promocionales. El cliente del distribuidor arma su pedido en el sitio web del distribuidor, ve el precio al momento y recibe una cotización formal; el distribuidor la recibe lista en su panel.

Este repositorio contiene el prototipo funcional de la **Fase III: Ejecución** del curso *Taller de Tecnologías de la Información* (Universidad Tecmilenio, Campus Zapopan).

**Prototipo en línea:** https://brunoivan04.github.io/cotizo-prototipo/

## Qué se puede probar

| Vista | Qué hace |
| --- | --- |
| Vista del cliente (`#cliente`) | Elegir producto, cantidad con precios por volumen, técnica de personalización, logotipo, tipo de entrega y datos de la empresa. Genera una cotización formal con folio, IVA y vigencia. |
| Panel del distribuidor (`#panel`) | Ver las cotizaciones recibidas y sus métricas del mes; editar la lista de precios, que cambia el cotizador al instante. |
| Planes (`#planes`) | Planes de suscripción propuestos: Emprendedor, Profesional y Empresa. |

Recorrido de dos minutos: genera una cotización en la Vista del cliente, presiona **Enviar al distribuidor** y abre el Panel; aparece arriba con estado *Nueva*.

Las cotizaciones y los precios editados se guardan en el navegador (`localStorage`). El botón **Restablecer datos de ejemplo** del panel los borra.

## Ejecutar en local

No necesita instalación ni dependencias. Abre `index.html` en el navegador, o sirve la carpeta:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Estructura

```
index.html      Vistas del prototipo
css/styles.css  Estilos (tema claro y oscuro)
js/app.js       Catálogo, cálculo de precios, cotización, panel y rutas
```

## De prototipo a producto

La versión final sería multiempresa sobre Next.js, Supabase (autenticación y base de datos por distribuidor) y Algolia (búsqueda del catálogo), con envío de cada cotización al CRM del distribuidor y aviso por WhatsApp.

## Aviso

Prototipo académico. La distribuidora *Promocionales Demo*, sus clientes y todos los precios son de ejemplo.

Autor: Bruno Ivan Santos Villarruel
