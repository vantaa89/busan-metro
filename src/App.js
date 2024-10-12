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
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import Feature from 'ol/Feature';

import { useState, useEffect, useRef } from 'react';

function App() {
  const mapRef = useRef(null);
  const [stations, setStations] = useState([])
  const [vectorSource, setVectorSource] = useState(new VectorSource());
  const [answer, setAnswer] = useState("")

  const loadData = function(){
    fetch( './data/line1.csv' )
        .then( response => response.text() )
        .then( responseText => {
          let parsedText = responseText.split("\n").map(e => e.split(","));
          setStations(stations.concat(parsedText.map(e => ({ name: e[2], lon: e[3], lat: e[4], line: e[1] }))));
        })
    fetch( './data/line2.csv' )
        .then( response => response.text() )
        .then( responseText => {
          let parsedText = responseText.split("\n").map(e => e.split(","));
          setStations(stations.concat(parsedText.map(e => ({ name: e[2], lon: e[3], lat: e[4], line: e[1] }))));
        })
    fetch( './data/line3.csv' )
        .then( response => response.text() )
        .then( responseText => {
          let parsedText = responseText.split("\n").map(e => e.split(","));
          setStations(stations.concat(parsedText.map(e => ({ name: e[2], lon: e[3], lat: e[4], line: e[1] }))));
        })
    fetch( './data/line4.csv' )
        .then( response => response.text() )
        .then( responseText => {
          let parsedText = responseText.split("\n").map(e => e.split(","));
          setStations(stations.concat(parsedText.map(e => ({ name: e[2], lon: e[3], lat: e[4], line: e[1] }))));
        })
    fetch( './data/lineD.csv' )
        .then( response => response.text() )
        .then( responseText => {
          let parsedText = responseText.split("\n").map(e => e.split(","));
          setStations(stations.concat(parsedText.map(e => ({ name: e[2], lon: e[3], lat: e[4], line: e[1] }))));
        })
  };

  useEffect(() => {
    loadData();
    const tilelayer = new TileLayer({
      source: new OSM({ attributions: '' })
    });


    const vectorlayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new CircleStyle({
          radius: 3,
          fill: new Fill({ color: 'white' }),
          stroke: new Stroke({
            color: [240, 106, 0], 
            width: 2,
          }),
        }),
      }),
    });

    const view = new View({
      center: fromLonLat([129.059556, 35.158282]), // 서면역
      zoom: 12
    });

    const map = new OlMap({
      controls: defaults({ zoom: false, rotate: false, attribution: false }),
      layers: [
          tilelayer,
          vectorlayer
      ],
      view: view,
    });
    map.setTarget(mapRef.current || '');
  }, []);

  useEffect(() => {
    stations.map(station => {
      const pointFeature = new Feature({
        geometry: new Point(fromLonLat([station.lon, station.lat])), 
      });
      console.log(`Added ${station.name}, ${station.lon}, ${station.lat}`);
      let newVectorSource = vectorSource;
      newVectorSource.addFeature(pointFeature);
      setVectorSource(newVectorSource);
    });
  }, [stations])
  return (
    <><div className="App">
      {/* <div>{stations.map(station => {
      return <p>{station.name}, {station.lat}, {station.lon}</p>
    })}</div> */}
      <div class="map" ref={mapRef} />
    </div>
    <div>
    <input 
      value = {answer}
      onChange={(e)=>{setAnswer(e.target.value)}}
      /> 
    </div></>
  );
}

export default App;
