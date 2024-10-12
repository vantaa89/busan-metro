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
  const [vectorSource1, setVectorSource1] = useState(new VectorSource());
  const [vectorSource2, setVectorSource2] = useState(new VectorSource());
  const [vectorSource3, setVectorSource3] = useState(new VectorSource());
  const [vectorSource4, setVectorSource4] = useState(new VectorSource());
  const [vectorSourceD, setVectorSourceD] = useState(new VectorSource());
  const [vectorSourceG, setVectorSourceG] = useState(new VectorSource());
  const [answer, setAnswer] = useState("");

  const loadData = function(){
    fetch( './data/stations.csv' )
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


    const vectorlayer1 = new VectorLayer({
      source: vectorSource1,
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

    const vectorlayer2 = new VectorLayer({
      source: vectorSource2,
      style: new Style({
        image: new CircleStyle({
          radius: 3,
          fill: new Fill({ color: 'white' }),
          stroke: new Stroke({
            color: [34, 139, 34], 
            width: 2,
          }),
        }),
      }),
    });

    const vectorlayer3 = new VectorLayer({
      source: vectorSource3,
      style: new Style({
        image: new CircleStyle({
          radius: 3,
          fill: new Fill({ color: 'white' }),
          stroke: new Stroke({
            color: [184, 134, 11], 
            width: 2,
          }),
        }),
      }),
    });

    const vectorlayer4 = new VectorLayer({
      source: vectorSource4,
      style: new Style({
        image: new CircleStyle({
          radius: 3,
          fill: new Fill({ color: 'white' }),
          stroke: new Stroke({
            color: [30, 144, 255], 
            width: 2,
          }),
        }),
      }),
    });

    const vectorlayerD = new VectorLayer({
      source: vectorSourceD,
      style: new Style({
        image: new CircleStyle({
          radius: 3,
          fill: new Fill({ color: 'white' }),
          stroke: new Stroke({
            color: [0, 0, 139], 
            width: 2,
          }),
        }),
      }),
    });

    const vectorlayerG = new VectorLayer({
      source: vectorSourceG,
      style: new Style({
        image: new CircleStyle({
          radius: 3,
          fill: new Fill({ color: 'white' }),
          stroke: new Stroke({
            color: [153, 50, 204], 
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
          vectorlayer1,
          vectorlayer2,
          vectorlayer3,
          vectorlayer4,
          vectorlayerD,
          vectorlayerG
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
      /*console.log(`Added ${station.name}, ${station.lon}, ${station.lat}`);*/
      
      if(station.line == "1호선"){
        let newVectorSource = vectorSource1;
        newVectorSource.addFeature(pointFeature);
        setVectorSource1(newVectorSource);
      }
      if(station.line == "2호선"){
        let newVectorSource = vectorSource2;
        newVectorSource.addFeature(pointFeature);
        setVectorSource2(newVectorSource);
      }
      if(station.line == "3호선"){
        let newVectorSource = vectorSource3;
        newVectorSource.addFeature(pointFeature);
        setVectorSource3(newVectorSource);
      }
      if(station.line == "4호선"){
        let newVectorSource = vectorSource4;
        newVectorSource.addFeature(pointFeature);
        setVectorSource4(newVectorSource);
      }
      if(station.line == "동해"){
        let newVectorSource = vectorSourceD;
        newVectorSource.addFeature(pointFeature);
        setVectorSourceD(newVectorSource);
      }
      if(station.line == "부산김해경전철"){
        let newVectorSource = vectorSourceG;
        newVectorSource.addFeature(pointFeature);
        setVectorSourceG(newVectorSource);
      }
    });
  }, [stations])

  return (
    <><div className="App">
      {/* <div>{stations.map(station => {
      return <p>{station.name}, {station.lat}, {station.lon}</p>
    })}</div> */}
      <div className="map" ref={mapRef}>
        <div className = "inputbox">
          <input></input>
          <button></button>
        </div>
      </div>
    </div>
    </>
  );
}

export default App;
