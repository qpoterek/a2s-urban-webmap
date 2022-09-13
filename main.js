// import './style.css';
// import {Map, View} from 'ol';
// import TileLayer from 'ol/layer/Tile';
// import OSM from 'ol/source/OSM';

// const map = new Map({
//   target: 'map',
//   layers: [
//     new TileLayer({
//       source: new OSM()
//     })
//   ],
//   view: new View({
//     center: [0, 0],
//     zoom: 2
//   })
// });

import "./style.css"
import { Map, View } from "ol"
import { ScaleLine, defaults } from "ol/control"
import { TopoJSON } from "ol/format"
import { Tile, Vector as VectorLayer } from "ol/layer"
import { fromLonLat } from 'ol/proj'
import { Vector as VectorSource, XYZ } from "ol/source"
import { Fill, Stroke, Style } from "ol/style"

const DATA_DIRECTORY = "data/"
const DATA_PREFIX = "layer_"
const YEARS = [1992, 1996, 1998, 1999, 2000, 2001, 2004, 2010, 2011]
const COLORMAP = [
  [255,255,204], // 1992
  [255,237,160], // 1996
  [254,217,118], // 1998
  [254,178,76],  // 1999
  [253,141,60],  // 2000
  [252,78,42],   // 2001
  [227,26,28],   // 2004
  [189,0,38],    // 2010
  [128,0,38],    // 2011
]
const OPACITY = 0.75

const MAPBOX_URL = "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoid29vdGFuNjciLCJhIjoiY2lxeG1id2J4MDA0amh0bmo2b3ZrM284cyJ9.dZofdSG7bDjCRNKQQrYrPg"
const MAP_COORDINATES = [7.74114365799,48.5975129521]
const ZOOM_LEVEL = 11
const SOURCE_EPSG = "EPSG:4326"
const TARGET_EPSG = "EPSG:3857"

// Create map and controls
var map = new Map({
  target: "map",
  layers: [
    new Tile({
      source: new XYZ({
        url: MAPBOX_URL,
      })
    })
  ],
  view: new View({
    projection: TARGET_EPSG,
    center: fromLonLat(MAP_COORDINATES),
    zoom: ZOOM_LEVEL,
  }),
  controls: defaults().extend([
    new ScaleLine(),
  ])
})

// Create styled vector layers based on TopoJSON files 
const data = {}

YEARS.forEach((year, index) => {
  const layerName = `${DATA_PREFIX}${year}`

  data[layerName] = new VectorLayer({
    source: new VectorSource({
      url: `${DATA_DIRECTORY}${DATA_PREFIX}${year}.json`,
      format: new TopoJSON({
        dataProjection: SOURCE_EPSG,
      })
    }),
    title: layerName,
    style: new Style({
      fill: new Fill({
        color: `rgba(${COLORMAP[index].join(",")},${OPACITY})`,
      }),
    }),
    zIndex: index + 1
  })
})

const strasbourg = new VectorLayer({
  source: new VectorSource({
    url: `${DATA_DIRECTORY}strasbg.json`,
    format: new TopoJSON({
      dataProjection: SOURCE_EPSG,
    }),
  }),
  title: "Strasbourg",
  style: new Style({
    stroke: new Stroke({
      color: "rgba(255, 255, 255, 1)",
      width: 1,
    }),
    fill: new Fill({
      color: "rgba(255, 255, 255, 0)",
    }),
  }),
})

// Add event listeners and classes to DOM elements
const $checkboxes = document.querySelectorAll(".checkbox input")

$checkboxes.forEach(checkbox => {
  checkbox.addEventListener("change", () => {
    const layer = data[checkbox.id]

    if (checkbox.checked) {
      map.addLayer(layer)
    } else {
      map.removeLayer(layer)
    }
  })
})

const $information = document.getElementById("information")
const $tooltip = document.getElementById("tooltip")

$information.addEventListener("pointerup", () => {
  $tooltip.classList.toggle("hidden")
})

const $olZoomButtons = document.querySelectorAll(".ol-zoom button")
$olZoomButtons.forEach(button => button.classList.add("dark-glass", "interactable"))

// Setup base view
map.addLayer(strasbourg)
map.addLayer(data[[...$checkboxes].pop().id])
$checkboxes[$checkboxes.length - 1].checked = true
