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

import { useEffect, useRef } from 'react';

function App() {
  const mapRef = useRef(null);
  useEffect(() => {
    const tilelayer = new TileLayer({
      source: new OSM({ attributions: '' })
    })
    const view = new View({
      center: fromLonLat([129.059556, 35.158282]), // 서면역
      zoom: 12
    });

    const map = new OlMap({
      controls: defaults({ zoom: false, rotate: false, attribution: false }),
      layers: [
          tilelayer
      ],
      view: view,
    });
    map.setTarget(mapRef.current || '');
  }, []);
  return (
    <div className="App">
      <div ref={mapRef} />
    </div>
  );
}

export default App;
