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
  const [stations, setStations] = useState([]) // 역의 목록. [{name: "서면역", lon: 127, lon: 34, line: "1호선"}, ... ] 과 같은 dictionary의 list
  const [vectorSource, setVectorSource] = useState(new VectorSource()); // 역을 지도에 그리는 layer

  const loadData = function(){
    fetch( './data/line1.csv' )
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
            color: [240, 106, 0], // 부산 1호선 고유색. 다른 호선 추가시 수정 필요
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
    let newVectorSource = vectorSource;

    stations.map(station => { // stations에 들어있는 각 dictionary(station)에 대해 이 함수를 적용
      const pointFeature = new Feature({
        geometry: new Point(fromLonLat([station.lon, station.lat])), 
      })
      console.log(`Added ${station.name}, ${station.lon}, ${station.lat}`);
      newVectorSource.addFeature(pointFeature); // 해당 point를 지도에 표시되는 layer에 추가
    });

    setVectorSource(newVectorSource);
  }, [stations])
  return (
    <div className="App">
      {/* <div>{stations.map(station => {
        return <p>{station.name}, {station.lat}, {station.lon}</p>
      })}</div> */}
      <div class="map" ref={mapRef} />
    </div>
  );
}

export default App;
