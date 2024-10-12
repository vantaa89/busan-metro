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
import { LineString, Point } from 'ol/geom';
import { Style, Circle as CircleStyle, Fill, Stroke, } from 'ol/style';
import { Text } from 'ol/style';
import { Feature } from 'ol';
import { useState, useEffect, useRef } from 'react';
import { parse } from 'ol/expr/expression';

function App() {
  const mapRef = useRef(null);
  const inputRef = useRef(null) 
  const [stations, setStations] = useState([])
  const [combinedSource, setCombinedSource] = useState(new VectorSource());
  const [answer, setAnswer] = useState("");
  
  const lineInfo = [
    {name: "1호선", code: "line1", color: [240, 106, 0]},
    {name: "2호선", code: "line2", color: [34, 139, 34]},
    {name: "3호선", code: "line3", color: [184, 134, 11]},
    {name: "4호선", code: "line4", color: [30, 144, 255]},
    {name: "동해", code: "donghae", color: [0, 84, 166]},
    {name: "부산김해경전철", code: "bgl", color: [153, 50, 204]},
  ];

  const correctAnswer = (station) => {
    station.found = true;
    showLabel(station);
  }

  const alreadyFound = (station) => {
    console.log("already found");
  }

  const wrongAnswer =() => {
    console.log("wrong answer");
  }

  const showLabel = (station) => {
    combinedSource.forEachFeature((feature) => {
      if (feature.get('name') === station.name) {
        const newStyle = new Style({
          image: new CircleStyle({
            radius: 3,
            fill: new Fill({ color: 'white' }),
            stroke: new Stroke({
              color: lineInfo.filter(line => (line.name==station.line))[0].color,
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

  const buttonPushed = () => {
    inputRef.current.value = null 
    for(const station of stations){
      if (station.name === answer && station.found === false){
        correctAnswer(station);
        return;
      }
      else if (station.name === answer && station.found === true){
        alreadyFound(station)
        return;
      }
    }
    wrongAnswer()
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
          newStations = newStations.concat(parsedText.map(e => ({ name: e[2], lon: parseFloat(e[3]), lat: parseFloat(e[4]), line: e[1], found: false })));
          setStations(newStations);
        });
    }          
  };

  const drawStations = () => {
    stations.map(station => {
      const pointFeature = new Feature({
        geometry: new Point(fromLonLat([station.lon, station.lat])), 
        name: station.name,
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
    loadData();
  }, []);

  useEffect(() => {
    drawStations();
    drawLines();
  }, [stations]);

  return (
    <><div className="App">
      <div className="map" ref={mapRef}>
        <div className = "inputbox">
          <input onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => keyboardEnter(e)} ref={inputRef}/>
          <button onClick={buttonPushed}>enter</button>
        </div>
      </div>
    </div>
    </>
  );
}

export default App;
