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

function BuyMeCoffee() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 모달 열기
  const openModal = () => {
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 모달 외부를 클릭했을 때 닫기
  const handleOutsideClick = (e) => {
    if (e.target.className === 'modal-background') {
      closeModal();
    }
  };

  return (
    <div>
      <button id = "buyCoffee" onClick={openModal}>
        <img src="icons/coffee.png" className="buttonimg"></img>
      </button>

      {isModalOpen && (
        <div className="modal-background" onClick={handleOutsideClick}>
          <div id="coffeemodal-content">
            <img src="icons/coffeetime.jpeg" id="coffeetime"></img>
            <button className="close" onClick={closeModal}>
              <img src="icons/close.png" id="closeIcon"></img>
            </button>
            <p style={{ width: '100%', textAlign: 'center', fontSize: '23px' }}>Enjoying the game?</p>
            <p style={{ width: '100%', textAlign: 'center', fontSize: '13px' }}>Support us with a cup of coffee!</p>
            <img src="icons/coffeeqr.jpg" id="coffeeQR"></img>
          </div>
        </div>
      )}
    </div>
  );
}

function DeveloperInfo() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 모달 열기
  const openModal = () => {
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 모달 외부를 클릭했을 때 닫기
  const handleOutsideClick = (e) => {
    if (e.target.className === 'modal-background') {
      closeModal();
    }
  };

  return (
    <div>
      <button id = "developerInfo" onClick={openModal}>
        <img src="icons/info.png" className="buttonimg"></img>
      </button>

      {isModalOpen && (
        <div className="modal-background" onClick={handleOutsideClick}>
          <div id="infomodal-content">
            <button className="close" onClick={closeModal}>
              <img src="icons/close.png" id="closeIcon"></img>
            </button>
            <div id="infogrid">
              <p style={{ width: '100%', textAlign: 'center', fontSize: '23px', gridColumn: 'span 2' }}>About Us</p>
              <p style={{ textAlign: 'center', fontSize: '15px'}}>Wonchan Shin</p>
              <p style={{ textAlign: 'center', fontSize: '15px'}}>Seojune Lee</p>
              <img src="icons/wonchan.jpg" className="developerimg"></img>
              <img src="icons/seojune.jpg" className="developerimg"></img>
              <p style={{textAlign: 'left', fontSize: '12px'}}>-SNU ECE 21</p>
              <p style={{textAlign: 'left', fontSize: '12px'}}>-내용을 입력하세요</p>
              <p style={{textAlign: 'left', fontSize: '12px'}}>-Korea Science Academy of KAIST</p>
              <p style={{textAlign: 'left', fontSize: '12px'}}>-내용을 입력하시든지</p>
              <p style={{textAlign: 'left', fontSize: '12px'}}>-Son of Busan Metropolitan City</p>
              <p style={{textAlign: 'left', fontSize: '12px'}}>-말든지</p>
              <p style={{textAlign: 'left', fontSize: '12px'}}>-shin5475612@gmail.com</p>
              <p style={{textAlign: 'left', fontSize: '12px'}}>-몰루?</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Success({ correctCount, totalCount}) {
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 모달 열기
  const openModal = (correctCount, totalCount) => {
    if(correctCount == totalCount){
      setIsModalOpen(true);
    }
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 모달 외부를 클릭했을 때 닫기
  const handleOutsideClick = (e) => {
    if (e.target.className === 'modal-background') {
      closeModal();
    }
  };

  return(
    <div>
      {isModalOpen && (
        <div className="modal-background" onClick={handleOutsideClick}>
          <div id="infomodal-content">
            <button className="close" onClick={closeModal}>
              <img src="icons/close.png" id="closeIcon"></img>
            </button>
          </div>
        </div>
      )}
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
  const transferStations = [
    { name: "동래", lines: ["1호선", "4호선"] },
    { name: "미남", lines: ["3호선", "4호선"] },
    { name: "거제", lines: ["3호선", "동해선"] },
    { name: "연산", lines: ["1호선", "3호선"] },
    { name: "대저", lines: ["3호선", "부산김해경전철"] },
    { name: "수영", lines: ["2호선", "3호선"] },
    { name: "덕천", lines: ["2호선", "3호선"] },
    { name: "벡스코", lines: ["2호선", "동해선"] },
    { name: "교대", lines: ["1호선", "동해선"] },
    { name: "사상", lines: ["2호선", "김해선"] },
    { name: "서면", lines: ["1호선", "2호선"] },
  ]

  const isTransferStation = (station) => {
    return transferStations.some(
      (st) =>
        st.name === station.name && st.lines.includes(station.line)
    );
  }

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
      minZoom: 11,
    }),
  }));

  useEffect(() => {
    if(currentStation !== null && map){
      const center = fromLonLat([currentStation.lon, currentStation.lat]);
      map.getView().animate({ center, duration: 300, ease: 'easeOut', zoom: 13.5 });
    }
  }, [currentStation]);

  const showLabel = (station) => {
    combinedSource.forEachFeature((feature) => {
      if (
        feature.get("name") === station.name &&
        feature.get("line") === station.line
      ) {
        const color = lineInfo.filter((line) => line.name === station.line)[0].color;
        
        if (isTransferStation(station)){
          const newStyle = new Style({
            image: new Icon({
              anchor: [0.5,0.5],
              src: 'icons/transfer.svg',
              scale: 0.02
            }),
            text: new Text({
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

        else{
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
      NotificationManager.warning("존재하지 않는 역입니다", "오답");
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
    for (const s of stationsSameName) showLabel(s);
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
      if (isTransferStation(station)){
        pointFeature.setStyle(
          new Style({
            image: new Icon({
            anchor: [0.5,0.5],
            src: 'icons/transfer.svg',
            scale: 0.02
            }),
            zIndex: 3,
          })
        )
      }
      else{
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
      }
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
    const handleKeyPress = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'M') {
        setCorrectCount(totalCount); // 모든 문제를 맞춘 상태로 변경
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [totalCount]);

  useEffect(() => {
    map.setTarget(mapRef.current || "");
    loadData();

  }, []);

  useEffect(() => {
    drawStations();
    drawLines();
  }, [stations]);

    //개발자용 치트
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'M') {
        setCorrectCount(totalCount); // 모든 문제를 맞춘 상태로 변경
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [totalCount]);

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
          <BuyMeCoffee />
          <DeveloperInfo />
        </div>
      </div>
    </>
  );
}

export default App;
