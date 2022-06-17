mapboxgl.accessToken = 'pk.eyJ1IjoibWF0aGlhc2g5OCIsImEiOiJja3c1ZGx6bmcwZmQyMm5sajJrZGQwdDF5In0.Vw5JcsEGSmSzYTVGzhHPNQ';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [5.315, 60.3966],
    pitch: 45,
    bearing: -45,
    zoom: 15
});

map.on('load', async () => {

    const course = await getCourse(2022);

    map.loadImage('./img/right-arrow.png', (error, img) => {
        if (error) throw error;
        map.addImage('right-arrow', img);
    });

    map.addSource('course', {
        'type': 'geojson',
        'data': course
    });
    map.addLayer({
        'id': 'course-hitbox',
        'type': 'line',
        'source': 'course',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#fff',
            'line-opacity': 0.001,
            'line-width': 12,
        }
    });
    map.addLayer({
        'id': 'course',
        'type': 'line',
        'source': 'course',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': ['get', 'stroke'],
            'line-width': 4,
            // 'line-offset': {
            //     'property': 'type',
            //     'type': 'categorical',
            //     'stops': [['bike', -3], ['run', 2]]
            // }
        }
    });
    map.addLayer({
        'id': 'course-points',
        'type': 'circle',
        'source': 'course',
        'paint': {
            'circle-radius': 2,
            'circle-color': "#fff",
            'circle-stroke-color': "#aaa",
            'circle-stroke-width': 1,
        }
    });
    map.addLayer({
        'id': 'course-arrows',
        'type': 'symbol',
        'source': 'course',
        'layout': {
            'symbol-placement': 'line',
            'symbol-spacing': 100,
            'icon-allow-overlap': false,
            // 'icon-ignore-placement': true,
            'icon-image': 'right-arrow',
            'icon-size': 0.5,
            'visibility': 'visible'
        }
    });

    map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'tiles': ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
        'encoding': 'terrarium',
        'tileSize': 256,
        'maxzoom': 14,
        'minzoom': 4,
    });
    map.setTerrain({
        'source': 'mapbox-dem',
        'exaggeration': 1.5
    });

    // add a sky layer that will show when the map is highly pitched
    map.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 15
        }
    });

    const layers = map.getStyle().layers;
    const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout['text-field']
    ).id;
    map.addLayer({
            'id': 'add-3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
                'fill-extrusion-color': '#aaa',

                // Use an 'interpolate' expression to
                // add a smooth transition effect to
                // the buildings as the user zooms in.
                'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'height']
                ],
                'fill-extrusion-base': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.3
            }
        },
        labelLayerId
    );



    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('mouseenter', 'course-hitbox', (e) => {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        const text = e.features[0].properties.name;

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(e.lngLat).setHTML(text).addTo(map);
    });

    map.on('mouseleave', 'course', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });
});

/**
 * @return {Promise<CourseGeoJson>}
 */
async function getCourse(year = 2022) {
    const resp = await fetch(`./data/Bergen-triathlon-course-${year}.geojson`);

    if (resp.ok) {
        return resp.json();
    }
}

/**
 * @typedef {object} CourseGeoJson
 * @property {object[]} features
 * @property {object} features.geometry
 * @property {[number, number][]} features.geometry.coordinates
 * @property {"LineString" | "Point"} features.geometry.type
 * @property {object} features.properties
 * @property {string} features.properties.name
 * @property {"turn" | "swim" | "run" | "bike" } features.properties.type
 * @property {string} features.properties.stroke
 * @property {"Feature"} features.type
 * @property {"FeatureCollection"} type
 */

5.32487690181, 60.39622125674
5.3425188716983225, 60.42757096622884