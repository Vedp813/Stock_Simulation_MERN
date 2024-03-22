import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import './Navbar.css'
import { useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';


function NavigationBar() {
  const [selectedId, setSelectedId] = useState(1);

  const handleNavClick = (id) => {
      setSelectedId(id);
  };

  return (
    <Navbar expand="lg" className='navbar p-2'>
        <Navbar.Brand href="#home">Stock Search</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="#home" id={selectedId === 1 ? 'nav-active' : ''} onClick={() => handleNavClick(1)}>Search</Nav.Link>
            <Nav.Link href="#watchlist" id={selectedId === 2 ? 'nav-active' : ''} onClick={() => handleNavClick(2)}>Watchlist</Nav.Link>
            <Nav.Link href="#portfolio" id={selectedId === 3 ? 'nav-active' : ''} onClick={() => handleNavClick(3)}>Portfolio</Nav.Link>
          </Nav>
        </Navbar.Collapse>
    </Navbar>
  );
}

export default NavigationBar;