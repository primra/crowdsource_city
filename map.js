/* mapboxgl.accessToken = "pk.eyJ1IjoicHJpbXJhIiwiYSI6ImNsOGRmc2ZjYzA0OGozeGwzYWllaTNqOXQifQ.1LEJ5gTJ4gS5WYOmr92-Aw";
// CREATE A NEW OBJECT CALLED MAP
const map = new mapboxgl.Map({
    container: "map", // container ID for the map object (this points to the HTML element)
    style: "mapbox://styles/primra/cl9wul245000214n1ri7iz0y0", //YOUR STYLE URL
    center: [-75.1652, 39.9526], // starting position [lng, lat]
    zoom: 12, // starting zoom
    projection: "globe", // display the map as a 3D globe
  });
  
// ADD A GEOJSON SOURCE THAT POINTS TO YOUR LOCAL FILE
map.on("load", function () {
    map.addSource("heat", {
      type: "geojson",
      data: "./heatVulnerability.geojson",
    });
   
    // ADD A LAYER TO THE MAP
    map.addLayer({
      id: "heat",
      type: "fill",
      source: "heat",
      layout: {},
      paint: {
        "fill-color": [
        // first introduce conditional in-case of null values
        "case",
        ["==", ["get", "HSI_SCORE"], null], 
        "rgba(0,0,0,0)",
        [
          // then use a linear ramp to display number values. Adjust rgba color values.
          "interpolate",
          ["linear"],
          ["get", "HSI_SCORE"],
          0,
          "rgba(255,0,0,0)",
          1,
          "rgba(60,60,60,20)",
          2,
          "rgba(90,60,60,100)",
          3,
          "rgba(175,60,60,175)",
          4,
          "rgba(255,60,60,225)",
        ],
      ],
        "fill-opacity": 0.9,
      },
    });
  });
   */

  const heat = "./heatVulnerability.geojson";
  function map_range(value, low1, high1, low2, high2) {
    return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
  }
  
 
  function flyToClick(coords) {
    deckgl.setProps({
      initialViewState: {
        longitude: coords[0],
        latitude: coords[1],
        zoom: 15,
        transitionDuration: 500,
        transitionInterpolator: new deck.FlyToInterpolator(),
      },
    });
  }
   
  const panel = document.getElementById("panel");
  const panelChild = document.querySelector("#panel :nth-child(2)");


  const deckgl = new deck.DeckGL({
    container: "map",
    // Set your Mapbox access token here
    mapboxApiAccessToken:
  "pk.eyJ1IjoicHJpbXJhIiwiYSI6ImNsOGRmc2ZjYzA0OGozeGwzYWllaTNqOXQifQ.1LEJ5gTJ4gS5WYOmr92-Aw",
    // Set your Mapbox style here
    mapStyle: "mapbox://styles/primra/cl9wul245000214n1ri7iz0y0",
    initialViewState: {
      latitude: 39.9526,
      longitude: -75.1652,
      zoom: 12,
      bearing: 0,
      pitch: 0,
    },
    controller: true,

    layers: [
        new deck.GeoJsonLayer({
          id: "heat",
          data: heat,
          // Styles
          filled: true,
          stroke: false,
    // Function for fill color
          getFillColor: (d) => {
            const abs = Math.abs(d.properties.HSI_SCORE);
            const color = map_range(abs, 0, 3.5, 0, 255); //lazy remap values to 0-255
    //logic:
    //If HSI_SCORE isn’t null:
            //if less than 0, return something in a blue-hue, otherwise red hue
        //if HSI_Score is null, return color with 0 alpha (transparent)
            return d.properties.HSI_SCORE
              ? d.properties.HSI_SCORE < 0
                ? [60, 60, color, 0]
                : [color, 60, 72, color + 66]
              : [0, 0, 0, 0];
          },
          getStrokeColor: [0, 0, 0, 255],
          LineWidthUnits: "meters",
          getLineWidth: 35,
          // Interactive props
          pickable: true,
          autoHighlight: true,
          highlightColor: [255, 255, 255, 200],
          onClick: (info) => {
            flyToClick(info.coordinate);
     
            panelChild.innerHTML = `<strong>Census Tract #${
              info.object.properties.NAME10
            }</strong>
          <br></br>
          HSI SCORE: ${info.object.properties.HSI_SCORE.toFixed(
            2 || "N/A"
          )} <br></br>
          HEI SCORE: ${info.object.properties.HEI_SCORE.toFixed(2 || "N/A")}
          <br></br>
          HVI SCORE: ${info.object.properties.HVI_SCORE.toFixed(2 || "N/A")}
          <br></br>
          Coordinates:
          ${info.coordinate[0].toFixed(3)},
          ${info.coordinate[1].toFixed(3)}`;
            panel.style.opacity = 1;
          },    
        }),
    ],
    getTooltip: ({ object }) => {
        return (
          object &&
          `HSI Score: ${
            object.properties.HSI_SCORE
              ? object.properties.HSI_SCORE.toFixed(2)
              : "No Data"
          }`
        );
      },    
});
    
  