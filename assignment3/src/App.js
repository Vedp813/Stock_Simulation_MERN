
import './App.css';
import { Component } from 'react';
import Footer from './components/Footer';
import Body from './components/Body';
import NavigationBar from './components/Navbar';

class App extends Component {
  render(){
  return (
    <>
    <NavigationBar />
    <Body/>
    <Footer />
    </>
  );
  }
}

export default App;
