import logo from './logo.svg';
import './App.css';
import "ol";
import { Map as OlMap, View } from 'ol';
import { fromLonLat } from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { defaults } from 'ol/control/defaults';
import { Point } from 'ol/geom';
import { Style, Circle as CircleStyle, Fill, Stroke} from 'ol/style';
import { Feature } from 'ol';
import { useState, useEffect, useRef } from 'react';

function App() {
  const mapRef = useRef(null);
  const inputRef = useRef(null) 
  const [stations, setStations] = useState([])
  const [combinedSource, setCombinedSource] = useState(new VectorSource());
  const [answer, setAnswer] = useState("");

  const lineColor = {"1호선": [240, 106, 0], "2호선": [34, 139, 34], "3호선": [184, 134, 11], "4호선": [30, 144, 255], "동해": [0, 84, 166], "부산김해경전철": [153, 50, 204]};

  const buttonPushed = () => {
    console.log(answer);
    inputRef.current.value = null 
  }

  const keyboardEnter = (e) => {
    if(e.key === "Enter") {
      buttonPushed();
    }
  }

  const loadData = function(){
    fetch( './data/stations.csv' )
        .then( response => response.text() )
        .then( responseText => {
          let parsedText = responseText.split("\n").map(e => e.split(","));
          setStations(stations.concat(parsedText.map(e => ({ name: e[2], lon: e[3], lat: e[4], line: e[1] }))));
        })
  };

  useEffect(() => {
    stations.map(station => {
      const pointFeature = new Feature({
        geometry: new Point(fromLonLat([station.lon, station.lat])), 
      });
      pointFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 3,
            fill: new Fill({ color: 'white' }),
            stroke: new Stroke({
              color: lineColor[station.line], 
              width: 2,
            }),
          }),
        })
      );

      combinedSource.addFeature(pointFeature);

    });
    console.log(combinedSource);
    setCombinedSource(combinedSource);
  }, [stations]);

  useEffect(() => {

    loadData();

    const tilelayer = new TileLayer({
      source: new OSM({ attributions: '' })
    });

    const vectorLayer = new VectorLayer({
      source: combinedSource,
    });
    const map = new OlMap({
      controls: defaults({ zoom: false, rotate: false, attribution: false }),
      layers: [
          tilelayer,
          vectorLayer,
      ],
      view: new View({
        center: fromLonLat([129.059556, 35.158282]), // 서면역
        zoom: 12
      }),
    });
    map.setTarget(mapRef.current || '');
  }, [])

  return (
    <><div className="App">
      {/* <div>{stations.map(station => {
      return <p>{station.name}, {station.lat}, {station.lon}</p>
    })}</div> */}
      <div className="map" ref={mapRef}>
        <div className = "inputbox">
          <input onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => keyboardEnter(e)} ref={inputRef}/>
          <button onClick={buttonPushed}>enter</button>
        </div>
      </div>
    </div>
    console.log(answer)
    </>
  );
}

export default App;
