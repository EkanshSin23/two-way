
import { Route, Routes } from 'react-router-dom';
import './App.css';
import MediaSoup from './Medisoup/MediaSoup';
import HomePage from './pages/HomePage.jsx';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route exact path='/' element={<HomePage />} />
        <Route exact path='/two-way/:roomName' element={<MediaSoup />} />
      </Routes>
      {/* <MediaSoup /> */}
    </div>
  );
}

export default App;
