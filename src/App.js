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
import { parse } from 'ol/expr/expression';

function App() {
  const mapRef = useRef(null);
  const inputRef = useRef(null) 
  const [stations, setStations] = useState([])
  const [combinedSource, setCombinedSource] = useState(new VectorSource());
  const [answer, setAnswer] = useState("");
  const [openModal, setOpenModal] = useState(true);
  
  const lineInfo = [
    {name: "1호선", code: "line1", color: [240, 106, 0]},
    {name: "2호선", code: "line2", color: [34, 139, 34]},
    {name: "3호선", code: "line3", color: [184, 134, 11]},
    {name: "4호선", code: "line4", color: [30, 144, 255]},
    {name: "동해", code: "donghae", color: [0, 84, 166]},
    {name: "부산김해경전철", code: "bgl", color: [153, 50, 204]},
  ];

  const resultMessageInfo = [
    {msg: "참 잘했어요", textColor: "green", backgroundColor: "rgb(200, 255, 200)"},
    {msg: "이미 찾은 역입니다", textColor: "blue", backgroundColor: "rgb(200, 200, 255)"},
    {msg: "그런역은 없답니다?", textColor: "red", backgroundColor: "rgb(255, 200, 200)"},
  ]

  const correctAnswer = (station) => {
    station.found = true;
    showLabel(station);
    showResult(0);
  }

  const alreadyFound = (station) => {
    console.log("already found");
    showResult(1);
  }

  const wrongAnswer = () => {
    console.log("wrong answer");
    showResult(2);
  }

  const showResult = (i) => {
    const resultDiv = document.getElementById("result");
    const inputWindow = document.getElementById("inputWindow");
    resultDiv.innerHTML = resultMessageInfo[i].msg;
    resultDiv.style.color = resultMessageInfo[i].textColor;
    inputWindow.style.backgroundColor = resultMessageInfo[i].backgroundColor;
    setTimeout(() => {
      resultDiv.innerHTML = "";
      inputWindow.style.backgroundColor = "white";
    }, 1500);
  }

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
    wrongAnswer(answer);
    return;
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

  const Modal = ({ isOpen, onClose, children }) => {
    // 만약 isOpen이 false이면 null을 반환하여 모달을 렌더링하지 않음
    if (!isOpen) return null;
    
    return (
      <div onClick={(e) => e.stopPropagation()} className="modal">
          {children}
          <h1> 상태창 </h1>
      </div>
    );
  };

  return (
    <><div className="App">
      <div className="map" ref={mapRef}>
        <div id = "inputBox">
          <input id = "inputWindow" onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => keyboardEnter(e)} ref={inputRef}/>
          <button id = "enter" onClick={buttonPushed}>enter</button>
        </div>
        <div id = "result"></div>
        <button id = "modalOpen" onClick={() => setOpenModal(true)}>
          ㅅ
        </button>
      
        <Modal isOpen={openModal} onClose={() => setOpenModal(false)}>
          {/* children */}
          <div>
            <button id = "closeModal" onClick={() => setOpenModal(false)}>
              취소
            </button>
          </div>
        </Modal>

      </div>
    </div>
    </>
  );
}

export default App;
