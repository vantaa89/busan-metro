import logo from "./logo.svg";
import "./App.css";
import "ol";
import { Map as OlMap, View } from "ol";
import { fromLonLat } from "ol/proj";
import Tile from "ol/layer";
import TileLayer from "ol/layer/Tile";
import { OSM, XYZ } from "ol/source";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { defaults } from "ol/control/defaults";
import { LineString, Point } from "ol/geom";
import { Style, Circle as CircleStyle, Fill, Stroke } from "ol/style";
import Icon from 'ol/style/Icon';
import { Text } from "ol/style";
import { Feature } from "ol";
import { useState, useEffect, useRef } from "react";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";

function StatusWindow({ stations, correctCount, totalCount, lineInfo }) {
  return (
    <div className="statusBox">
      <div className="progressBars">
        <div id="progressTitle">
          <p style={{fontSize: '20px'}}>Total</p>
          <p style={{fontSize: '20px', textAlign: 'right'}}>{(
            (correctCount.reduce((a, b) => a + b, 0) /
              totalCount.reduce((a, b) => a + b, 0)) *
            100
          ).toFixed(2)}{" "}
          %{" "}</p>
        </div>

        <div id="totalProgressBar">
          <div 
            id="totalProgress"
            style={{
              width: (correctCount.reduce((a, b) => a + b, 0) /
                      totalCount.reduce((a, b) => a + b, 0)) *
                      100 + "%"
            }}
            >
          </div>
        </div>

        {Array.isArray(lineInfo) &&
          lineInfo.map((item, i) => (
            <>
              <div className="lineIndex">
                <img
                  src={"icons/" + item.code + ".svg"}
                  className="lineIcon"
                ></img>
                <p>
                  {item.name}
                </p>
                <p style={{textAlign: 'right', color:'gray'}}>
                  {correctCount[i]} / {totalCount[i]}
                </p>
              </div>
              <div className="progressBar">
                <div
                  className="progress"
                  id={item.code + "Progress"}
                  style={{
                    width: (correctCount[i] / totalCount[i]) * 100 + "%",
                    backgroundColor:
                      "rgb(" +
                      lineInfo[i].color[0] +
                      "," +
                      lineInfo[i].color[1] +
                      "," +
                      lineInfo[i].color[2] +
                      ")",
                  }}
                ></div>
              </div>
            </>
          ))}
      </div>
    </div>
  );
}

function App() {
  const mapRef = useRef(null);
  const inputRef = useRef(null);
  const [stations, setStations] = useState([]);
  const [combinedSource, setCombinedSource] = useState(new VectorSource());
  
  const [correctCount, setCorrectCount] = useState([0, 0, 0, 0, 0, 0]);
  const [totalCount, setTotalCount] = useState([0, 0, 0, 0, 0, 0]);
  const [currentStation, setCurrentStation] = useState(null);
  const lineInfo = [
    { name: "1호선", code: "line1", color: [240, 106, 0] },
    { name: "2호선", code: "line2", color: [34, 139, 34] },
    { name: "3호선", code: "line3", color: [184, 134, 11] },
    { name: "4호선", code: "line4", color: [30, 144, 255] },
    { name: "동해선", code: "donghae", color: [0, 84, 166] },
    { name: "부산김해경전철", code: "bgl", color: [153, 50, 204] },
  ];


  const tilelayer = new TileLayer({
    source: new XYZ({
      url: "https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      maxZoom: 13,
    }),
    opacity: 1,
  });

  const vectorLayer = new VectorLayer({
    source: combinedSource,
  });

  const [map] = useState(new OlMap({
    controls: defaults({ zoom: false, rotate: false, attribution: false }),
    layers: [tilelayer, vectorLayer],
    view: new View({
      center: fromLonLat([129.059556, 35.158282]), // 서면역
      zoom: 12,
      maxZoom: 15,
    }),
  }));

  useEffect(() => {
    if(currentStation !== null && map){
      const center = fromLonLat([currentStation.lon, currentStation.lat]);
      map.getView().animate({ center, duration: 300, ease: 'easeOut', zoom: 13.5 });
    }
  }, [currentStation]);

  const showLabel = (station, n) => {
    console.log(station);
    combinedSource.forEachFeature((feature) => {
      if (
        feature.get("name") === station.name &&
        feature.get("line") === station.line
      ) {
        const color = lineInfo.filter((line) => line.name === station.line)[0]
          .color;
        if (n == 1){
          const newStyle = new Style({
            image: new CircleStyle({
              radius: 3,
              fill: new Fill({ color: color }),
              stroke: new Stroke({
                color: color,
                width: 3,
              }),
            }),
            text: new Text({
              font: "12px Spoqa Han Sans Neo",
              fill: new Fill({ color: "black" }),
              stroke: new Stroke({
                color: "white",
                width: 2,
              }),
              offsetY: -15,
              text: station.name,
            }),
          });
          feature.setStyle(newStyle);
        }
        else {
          const newStyle = new Style({
            image: new Icon({
              anchor: [0.5,0.5],
              src: 'icons/transfer.svg',
              scale: 0.03
            }),
            text: new Text({
              font: "12px Spoqa Han Sans Neo",
              fill: new Fill({ color: "black" }),
              stroke: new Stroke({
                color: "white",
                width: 2,
              }),
              offsetY: -15,
              text: station.name,
            }),
            zIndex: 3
          });
          feature.setStyle(newStyle);
        }
        
      }
    });
  };

  const compareStationName = (reference, query) => {
    const reference_dropped = reference.replace(/[^\uAC00-\uD7A3]/g, "");
    const query_dropped = query.replace(/[^\uAC00-\uD7A3]/g, "");
    if (reference_dropped === query_dropped) return true;
    if (
      query_dropped[query_dropped.length - 1] === "역" &&
      reference_dropped === query_dropped.slice(0, query_dropped.length - 1)
    )
      return true;
    return false;
  };

  const buttonPushed = () => {
    const answer = inputRef.current.value;
    inputRef.current.value = null;
    const stationsSameName = stations.filter((st) =>
      compareStationName(st.name, answer)
    );
    if (stationsSameName.length === 0) {
      // wrong station name
      NotificationManager.warning("그런 역은 없답니다?", "오답");
      return;
    }
    if (stationsSameName[0].found) {
      // already found
      NotificationManager.info(
        `${stationsSameName[0].name}역은 이미 찾은 역입니다`
      );
      return;
    }
    // correct answer
    const lines = stationsSameName
      .map((st) => st.line)
      .sort()
      .join(", ");

    NotificationManager.success(lines, stationsSameName[0].name.concat("역"));
    for (const s of stationsSameName) showLabel(s, stationsSameName.length);
    setCurrentStation(stationsSameName[0]);
    const updatedStations = stations.map((station) => {
      return {
        ...station,
        found: station.found || compareStationName(station.name, answer),
      };
    });

    const newCorrectCount = correctCount;
    for (let i = 0; i < lineInfo.length; i++) {
      if (lines.includes(lineInfo[i].name)) {
        newCorrectCount[i] += 1;
      }
    }
    setCorrectCount(newCorrectCount);

    setStations(updatedStations);
  };

  const keyboardEnter = (e) => {
    if (e.key === "Enter") {
      buttonPushed();
    }
  };

  const loadData = function () {
    let newStations = [];
    let totalcnt = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < lineInfo.length; i++) {
      fetch(`./data/${lineInfo[i].code}.csv`)
        .then((response) => response.text())
        .then((responseText) => {
          let parsedText = responseText.split("\n").map((e) => e.split(","));
          let a = newStations.length;
          newStations = newStations.concat(
            parsedText.map((e) => ({
              name: e[2].split("(")[0],
              lon: parseFloat(e[3]),
              lat: parseFloat(e[4]),
              line: e[1],
              found: false,
            }))
          );
          let b = newStations.length;
          totalcnt[i] = b - a;
          setStations(newStations);
        });
    }
    setTotalCount(totalcnt);
  };

  const drawStations = () => {
    stations.map((station) => {
      const pointFeature = new Feature({
        geometry: new Point(fromLonLat([station.lon, station.lat])),
        name: station.name,
        line: station.line,
      });
      let color;
      try {
        color = lineInfo.filter((line) => line.name == station.line)[0].color;
      } catch {
        color = "black";
      }
      pointFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 3,
            fill: new Fill({ color: "white" }),
            stroke: new Stroke({
              color: color,
              width: 2,
            }),
          })
        })
      );
      combinedSource.addFeature(pointFeature);
    });
    setCombinedSource(combinedSource);
  };

  const drawLines = () => {
    for (let i = 0; i < lineInfo.length; i++) {
      const stationsInLine = stations.filter(
        (station) => station.line === lineInfo[i].name
      );
      for (let j = 0; j < stationsInLine.length - 1; j++) {
        const point1 = fromLonLat([
          stationsInLine[j].lon,
          stationsInLine[j].lat,
        ]);
        const point2 = fromLonLat([
          stationsInLine[j + 1].lon,
          stationsInLine[j + 1].lat,
        ]);
        const lineString = new LineString([point1, point2]);
        const lineFeature = new Feature({
          geometry: lineString,
        });
        lineFeature.setStyle(
          new Style({
            stroke: new Stroke({
              color: lineInfo[i].color,
              width: 1.5,
            }),
          })
        );
        combinedSource.addFeature(lineFeature);
        setCombinedSource(combinedSource);
      }
    }
  };



  useEffect(() => {
    map.setTarget(mapRef.current || "");
    loadData();

  }, []);

  useEffect(() => {
    drawStations();
    drawLines();
  }, [stations]);

  return (
    <>
      <div className="App">
        <div className="map" ref={mapRef}>
          <div id="inputBox">
            <input
              id="inputWindow"
              onKeyDown={(e) => keyboardEnter(e)}
              ref={inputRef}
            />
          </div>
          <div id="result"></div>
          <StatusWindow
            stations={stations}
            lineInfo={lineInfo}
            correctCount={correctCount}
            totalCount={totalCount}
          />
          <NotificationContainer />
        </div>
      </div>
    </>
  );
}

export default App;
