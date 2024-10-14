import logo from './logo.svg';
import './App.css';
import "ol";
import { Map as OlMap, View } from 'ol';
import { fromLonLat } from 'ol/proj';
import Tile from 'ol/layer';
import TileLayer from 'ol/layer/Tile';
import { OSM, XYZ } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { defaults } from 'ol/control/defaults';
import { LineString, Point } from 'ol/geom';
import { Style, Circle as CircleStyle, Fill, Stroke, } from 'ol/style';
import { Text } from 'ol/style';
import { Feature } from 'ol';
import { useState, useEffect, useRef } from 'react';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import 'react-notifications/lib/notifications.css';

function StatusWindow({stations}){
  const lineCounts = {"1호선": 0, "2호선": 0, "3호선": 0, "4호선": 0, "동해선": 0, "부산김해경전철": 0};
  const totalStations = {"1호선": 40, "2호선": 43, "3호선": 17, "4호선": 14, "동해선": 23, "부산김해경전철": 21};

  stations.forEach(station => {
    if (station.found){
      lineCounts[station.line] += 1;
    }
  })
  return(
    <div className = "statusBox">
      <div className = "myProgress">
        <h3>발견된 역 현황</h3>
        {Object.entries(lineCounts).map(([line, count]) => (
          <div key = {line}>
            {line}: {count} / {totalStations[line]} {(count/totalStations[line]*100).toFixed(2)}% 
          </div>
        ))}
      </div>
    </div>
  )
}


function App() {
  const mapRef = useRef(null);
  const inputRef = useRef(null) 
  const [stations, setStations] = useState([])
  const [combinedSource, setCombinedSource] = useState(new VectorSource());
  
  const lineInfo = [
    {name: "1호선", code: "line1", color: [240, 106, 0]},
    {name: "2호선", code: "line2", color: [34, 139, 34]},
    {name: "3호선", code: "line3", color: [184, 134, 11]},
    {name: "4호선", code: "line4", color: [30, 144, 255]},
    {name: "동해선", code: "donghae", color: [0, 84, 166]},
    {name: "부산김해경전철", code: "bgl", color: [153, 50, 204]},
  ];



  const showLabel = (station) => {
    console.log(station);
    combinedSource.forEachFeature((feature) => {
      if (feature.get('name') === station.name && feature.get('line') === station.line) {
        const color = lineInfo.filter(line=> (line.name === station.line))[0].color;
        console.log(color)
        const newStyle = new Style({
          image: new CircleStyle({
            radius: 3.5,
            fill: new Fill({ color}),
            stroke: new Stroke({
              color: color, 
              width: 2,
            }),
          }),
          text: new Text({
            font: '12px Calibri,sans-serif',
            fill: new Fill({ color: 'black' }),
            stroke: new Stroke({
              color: 'white',
              width: 2,
            }),
            offsetY: -15,
            text: station.name,
          })
        })
        feature.setStyle(newStyle);
      }
    })
  }

  const compareStationName = (reference, query) => {
    const reference_dropped = reference.replace(/[^\uAC00-\uD7A3]/g, '');
    const query_dropped = query.replace(/[^\uAC00-\uD7A3]/g, '');
    if(reference_dropped === query_dropped) return true;
    if(reference_dropped === query_dropped.slice(0, query_dropped.length - 1)) return true;
    return false;
  }

  const buttonPushed = () => {
    const answer = inputRef.current.value;
    inputRef.current.value = null;
    const stationsSameName = stations.filter(st => compareStationName(st.name, answer)); 
    if(stationsSameName.length === 0){  // wrong station name
      NotificationManager.warning('그런 역은 없답니다?', '오답');
      return;
    }
    if(stationsSameName[0].found){      // already found
      NotificationManager.info(`${stationsSameName[0].name}역은 이미 찾은 역입니다`);
      return;
    }
    // correct answer
    const lines = stationsSameName.map(st => st.line).sort().join(", ");
    NotificationManager.success(lines, stationsSameName[0].name.concat("역"));
    for(const s of stationsSameName)
      showLabel(s);


    const updatedStations = stations.map(station => {
      return {...station, found: compareStationName(station.name, answer)};
    });
    setStations(updatedStations);
  }

  const keyboardEnter = (e) => {
    if(e.key === "Enter") {
      buttonPushed();
    }
  }

  const loadData = function(){
    let newStations = [];
    for(let i = 0; i < lineInfo.length; i++){
      fetch(`./data/${lineInfo[i].code}.csv`)
        .then( response => response.text() )
        .then( responseText => {
          let parsedText = responseText.split("\n").map(e => e.split(","));
          newStations = newStations.concat(parsedText.map(e => ({ name: e[2].split('(')[0], lon: parseFloat(e[3]), lat: parseFloat(e[4]), line: e[1], found: false })));
          setStations(newStations);
        });
    }          
  };

  const drawStations = () => {
    stations.map(station => {
      const pointFeature = new Feature({
        geometry: new Point(fromLonLat([station.lon, station.lat])), 
        name: station.name,
        line: station.line,
      });
      let color;
      try{
        color = lineInfo.filter(line => (line.name==station.line))[0].color;
      } catch {
        color = 'black';
      }
      pointFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 3,
            fill: new Fill({ color: 'white' }),
            stroke: new Stroke({
              color: color,
              width: 2,
            }),
          }),
          text: new Text({
            font: '12px Calibri,sans-serif',
            fill: new Fill({ color: 'rgba(0, 0, 0, 0)' }),
            stroke: new Stroke({
              color: 'rgba(0, 0, 0, 0)',
              width: 2,
            }),
            offsetY: -15,
            text: station.name,
          })
        })
      );
      combinedSource.addFeature(pointFeature);
    });
    setCombinedSource(combinedSource);
  }

  const drawLines = () => {
    for(let i = 0; i < lineInfo.length; i++){
      const stationsInLine = stations.filter(station => (station.line === lineInfo[i].name));
      for(let j = 0; j < stationsInLine.length-1; j++){
        const point1 = fromLonLat([stationsInLine[j].lon, stationsInLine[j].lat]);
        const point2 = fromLonLat([stationsInLine[j+1].lon, stationsInLine[j+1].lat]);
        const lineString = new LineString([point1, point2]);
        const lineFeature = new Feature({
          geometry: lineString, 
        });
        lineFeature.setStyle(new Style({
          stroke: new Stroke({
            color: lineInfo[i].color,
            width: 1.5
          })
        }));
        combinedSource.addFeature(lineFeature);
        setCombinedSource(combinedSource);
      }
    }  
  }

  useEffect(() => {

    const tilelayer = new TileLayer({
        source: new XYZ({
            url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            maxZoom: 13
        }),
        opacity: 1
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
        zoom: 12,
        maxZoom: 15,
      }),
    });
    map.setTarget(mapRef.current || '');
    loadData();
  }, []);

  useEffect(() => {
    drawStations();
    drawLines();
  }, [stations]);

  return (
    <><div className="App">
      <div className="map" ref={mapRef}>
        <div id = "inputBox">
          <input id = "inputWindow" onKeyDown={(e) => keyboardEnter(e)} ref={inputRef}/>
          <button id = "enter" onClick={buttonPushed}>enter</button>
        </div>
        <div id = "result"></div>
        <StatusWindow stations = {stations} />
        <NotificationContainer />
      </div>
    </div>
    </>
  );
}

export default App;
