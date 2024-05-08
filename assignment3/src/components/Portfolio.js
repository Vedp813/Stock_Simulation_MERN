import React, { useEffect, useState } from 'react';
import './Portfolio.css'
import { Card, CardFooter,Button,Modal } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';

function Portfolio() {
  
  const [portfolioData, setData] = useState(null);
  const [money, setMoney] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [portfolioUpdate, setportfolioUpdate] = useState(false);
  const [showBuyDiv, setShowBuyDiv] = useState(false);
  const [showSellDiv, setShowSellDiv] = useState(false);
  const [ticker, setTicker] = useState(null);

  // Modal
  const [showBuy, setShowBuy] = useState(false);
  const [showSell, setShowSell] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const handleCloseBuy = () => {setShowBuy(false); setModalData(null);setErrorMessage(true);}; 
  const handleCloseSell = () => {setShowSell(false); setModalData(null); setErrorMessage(true);};
  const handleShowBuy = () => setShowBuy(true);
  const handleShowSell = () => setShowSell(true);
  const [modalData, setModalData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(true);



  const handleSellStock = async () => {
    try {
    const response = await fetch(`https://assignment3-webtech-csci571.wl.r.appspot.com/portfolio/sell`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ticker: modalData['ticker'], name: modalData['name'], quantity, price: modalData['quote']['c'] })
    });
    if (response.ok) {
        const data = await response.json();
        console.log('Stock sold');
        handleCloseSell();
        fetchMoney();
        setportfolioUpdate(!portfolioUpdate);
        setShowSellDiv(true);
        setTicker(modalData['ticker']);
        setModalData(null);
        setErrorMessage(true);
        setTimeout(() => {
          setShowSellDiv(false);
      }, 4000);
        
      }
    else {
        throw new Error('Failed to sell stock');
    }
    } catch (error) {
    console.error(error);
    }
} 

const handleBuyStock = async () => {
if (quantity > 0 && (quantity * modalData['quote']['c']) <= money) {
    try {
        const response = await fetch(`https://assignment3-webtech-csci571.wl.r.appspot.com/portfolio/buy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ticker: modalData['ticker'], name: modalData['name'], quantity, price: modalData['quote']['c'] })
        });
        if (response.ok) {
            console.log('Stock bought');
            handleCloseBuy();
            fetchMoney();
            setportfolioUpdate(!portfolioUpdate);
            setShowBuyDiv(true);
            setTicker(modalData['ticker']);
            setModalData(null);
            setErrorMessage(true);
            setTimeout(() => {
              setShowBuyDiv(false);
          }, 4000);
        } else {
            throw new Error('Failed to buy stock');
        }
    } catch (error) {
        console.error(error);
    }
}
};

  const fetchMoney = async () => {
    const response = await fetch('https://assignment3-webtech-csci571.wl.r.appspot.com/money');
    const data = await response.json();
    setMoney(data['0']['money']);
    console.log(data);
  };

  const fetchPortfolio = async () => { 
    const response = await fetch('https://assignment3-webtech-csci571.wl.r.appspot.com/portfolio/get');
    const data = await response.json();
    setData(data);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchMoney();
      await fetchPortfolio();
      setLoading(false);
    };

    fetchData();
  }, [portfolioUpdate]);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleQuantityChange = (dbquantity) => {

      if (quantity > dbquantity) {
          setErrorMessage(false);
      } else {
          setErrorMessage(true);
      }
  };

  const handleBuy = (money,price) => {
    if (quantity * price <= money) {
        setErrorMessage(true);
    } else {
        setErrorMessage(false);
    }

  }


  return (
      isLoading ? (
        <div className='spinner-container-portfolio'>
          <Spinner animation='border' role='status'>
            <span className='sr-only'></span>
          </Spinner>
        </div>
      ) : (
        <div className='portfolio' style={{marginBottom: '40px'}}>
          <div className='port'>
             { showBuyDiv ? <div className='stock-bought' style={{width:'100%'}}> {ticker} bought successfully.<span className="close-icon-port" onClick={() => setShowBuyDiv(false)}>&times;</span> </div>:null}
              { showSellDiv ? <div className='stock-sold' style={{width:'100%'}}> {ticker} sold successfully.<span className="close-icon-port" onClick={() => setShowSellDiv(false)}>&times;</span> </div>:null}             
            <h2>My Portfolio</h2>
            <p>Money in Wallet: {money.toFixed(2)}</p>
            {portfolioData && portfolioData.length > 0 ? (
              portfolioData.map((data, index) => (
                <Card key={index} style={{ width: '85%', marginBottom: '10px' }}>
                  <Card.Header style={{ fontWeight: '500', fontSize: '15px',color:'#707476' }}><span style={{ fontWeight: '600', fontSize: '20px',color:'black' }}>{data['ticker']}</span> {data['name']}</Card.Header>
                  <Card.Body className='d-flex flex-column flex-sm-row justify-content-between'>
                    <div className='d-flex' style={{width: windowWidth < 768 ? '100%' : '50%'}}>
                    <div className='first-col-port'style={{marginRight:'30%'}} >
                      <p style={{ fontWeight: '600', fontSize: '16px' }}>Quantity:</p>
                      <p style={{ fontWeight: '600', fontSize: '16px' }}>Avg. Cost / Share:</p>
                      <p style={{ fontWeight: '600', fontSize: '16px' }}>Total Cost:</p>
                    </div>
                    <div className='second-col-port'>
                      <p style={{ fontWeight: '600', fontSize: '16px' }}>{data['quantity']}</p>
                      <p style={{ fontWeight: '600', fontSize: '16px', marginTop:windowWidth<768?'25px':'0px' }}>{(data['totalCost']/data['quantity']).toFixed(2)}</p>
                      <p style={{ fontWeight: '600', fontSize: '16px',marginTop:windowWidth<768?'33px':'0px'  }}>{(data['totalCost']).toFixed(2)}</p>
                    </div>
                    </div>
                    <div className='d-flex' style={{width: windowWidth < 768 ? '100%' : '50%'}}>
                    <div className='third-col-port' style={{marginRight:'40%'}}>
                      <p style={{ fontWeight: '600', fontSize: '16px' }}>Change:</p>
                      <p style={{ fontWeight: '600', fontSize: '16px' }}>Current Price:</p>
                      <p style={{ fontWeight: '600', fontSize: '16px' }}>Market Value:</p>
                    </div>
                    <div className='fourth-col-port'>
                      <p style={{ fontWeight: '600', fontSize: '16px',}}>{(data['totalCost']/data['quantity']-data['quote']['c']).toFixed(2)}</p>
                      <p style={{ fontWeight: '600', fontSize: '16px',marginTop:windowWidth<768?'25px':'0px'  }}>{data['quote']['c']}</p>
                      <p style={{ fontWeight: '600', fontSize: '16px',marginTop:windowWidth<768?'40px':'0px'  }}>{(data['quote']['c']*data['quantity']).toFixed(2)}</p>
                    </div>
                    </div>
                  </Card.Body>
                  <CardFooter>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button style={{ backgroundColor: 'green', borderColor: 'green',fontSize:'14px' }} onClick={()=>{handleShowBuy(); setModalData(data)}}>Buy</Button>
                      <Button style={{ backgroundColor: 'red', borderColor: 'red', fontSize:'14px' }} onClick={ ()=>{handleShowSell(); setModalData(data)}}>Sell</Button>
                    </div>
                            {
                            showBuy && money &&
                            (<Modal show={showBuy} onHide={handleCloseBuy}>
                            <Modal.Header closeButton>
                                <Modal.Title>{modalData['ticker']}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <p>Current Price: {modalData['quote']['c']}</p>
                                <p>Money in Wallet: {(money).toFixed(2)}</p>
                                <p>Quantity: <input type="number" placeholder="0" value={quantity} onChange= {(e) => {setQuantity(e.target.value) ; handleBuy(money,modalData['quote']['c'])}}/></p>
                                {quantity*modalData['quote']['c'] > money && <p style={{color:'red'}}>Not enough money in the wallet!</p>}
                            </Modal.Body>
                            <Modal.Footer className="d-flex justify-content-between">
                                <p>Total: {(modalData['quote']['c'] * quantity).toFixed(2)}</p>
                                <Button style={{backgroundColor: 'green', borderColor: 'green'}} onClick={() => {handleBuyStock()}} disabled={!errorMessage}>
                                    Buy
                                </Button>
                            </Modal.Footer>
                        </Modal>
                        )
                            }
                            {
                            showSell && money && 
                            (<Modal show={showSell} onHide={handleCloseSell}>
                            <Modal.Header closeButton>
                                <Modal.Title>{modalData['ticker']}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <p>Current Price: {modalData['quote']['c']}</p>
                                <p>Money in Wallet: {(money).toFixed(2)}</p>
                                <p>Quantity: <input type="number" placeholder="0" value={quantity} onChange= {(e) => {setQuantity(e.target.value); handleQuantityChange(modalData['quantity'])}}/></p>
                                {quantity > data['quantity'] &&
                                 <p style={{color:'red'}}>You cannot sell the stock as you don't have!</p>}
                            </Modal.Body>
                            <Modal.Footer className="d-flex justify-content-between">
                                <p>Total: {(modalData['quote']['c'] * quantity).toFixed(2)}</p>
                                <Button style={{backgroundColor: 'red', borderColor: 'red'}} onClick={() => {handleSellStock(); setModalData(data)}} disabled={!errorMessage}>
                                    Sell
                                </Button>
                            </Modal.Footer>
                        </Modal>
                        )
                            }
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className='NoData-portfolio'>Currently you don't have any stock</div>
            )}
          </div>
        </div>
      )
  );
}

export default Portfolio