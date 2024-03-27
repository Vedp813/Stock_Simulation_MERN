import './App.css';
import { Component } from 'react';
import Footer from './components/Footer';
import Body from './components/Body';
import NavigationBar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Portfolio from './components/Portfolio';
import Watchlist from './components/Watchlist';
import { Navigate } from 'react-router-dom';

class App extends Component {
  
  render(){
  return (
    <>
    <Router>
            <NavigationBar />
            <Routes>
                <Route path="/" element={<Navigate to="/search/home" />} />
                <Route path="/search/home" element={<Body />} />
                <Route path='/search/:sendtick' element={<Body />}/>
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/portfolio" element={<Portfolio />} />
            </Routes>
            <Footer />
    </Router>
    </>
  );
  }
}

export default App;
