import React from 'react';
import { useState, useEffect, useRef } from 'react';
import './Search.css';
import { faStar as faStarSolid, faChevronLeft, faChevronRight, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import Spinner from 'react-bootstrap/Spinner';
import { Modal, Button, Card } from 'react-bootstrap';
import * as Highcharts from "highcharts/highstock";
import IndicatorsCore from 'highcharts/indicators/indicators';
import VBP from 'highcharts/indicators/volume-by-price';
import { useNavigate } from 'react-router-dom';
import HCMA from 'highcharts/highcharts-more';
import HSIndicators from "highcharts/indicators/indicators";
import StockChartComponent from './StockChartComponent';
import SummaryChart from './SummaryChart';
import StrongBuySellChart from './StrongBuySellChart';
import EPSChart from './EPSChart';
HCMA(Highcharts); 

HSIndicators(Highcharts);

VBP(Highcharts);
IndicatorsCore(Highcharts);


function SearchResults({ ticker }) {

    const navigate = useNavigate();

    console.log('Ticker:', ticker);

    // setting window width
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

    // Loading
    const [isLoading, setIsLoading] = useState(true);

    // Data for the whole page 
    const [searchData, setData] = useState(null);
    const [error, setError] = useState(null);
    const [datetrade, setDatetrade] = useState('');
    const [timetrade, setTimetrade] = useState('');
    const [formattedDate, setFormattedDate] = useState('');

    //insider
    let totalChange = 0;
    let totalMspr = 0;
    let positiveMSPR = 0;
    let negativeMSPR = 0;
    let positiveChange = 0;
    let negativeChange = 0;

    // Peers
    const [peer, setPeer] = useState('');

    //Buy and Sell button
    const [showBuy, setShowBuy] = useState(false);
    const [showSell, setShowSell] = useState(false);
    const [quantity, setQuantity] = useState(0);
    const handleCloseBuy = () => setShowBuy(false);
    const handleCloseSell = () => setShowSell(false);
    const handleShowBuy = () => setShowBuy(true);
    const handleShowSell = () => setShowSell(true);
    const [checkbool, checkBool] = useState(false);
    const [portfolio, setPortfolio] = useState(false);
    const [showBuyDiv, setShowBuyDiv] = useState(false);
    const [showSellDiv, setShowSellDiv] = useState(false);
    const [quantityInPortfolio, setquantityInPortfolio] = useState(false);

    const handleSellStock = async () => {
        try {
            if (quantity <= 0) {
                throw new Error('Please enter a valid quantity');
            }
            else{
            const response = await fetch(`https://assignment3-webtech-csci571.wl.r.appspot.com/portfolio/sell`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ticker: searchData[0]['ticker'], name: searchData[0]['name'], quantity, price: searchData[1]['c'] })
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Stock sold');
                handleCloseSell();
                fetchMoney();
                setShowSellDiv(true);
                setTimeout(() => {
                    setShowSellDiv(false);
                }, 4000);
            } else {
                throw new Error('Failed to sell stock');
            }
        }
     } catch (error) {
            console.error(error);
        }
    };

    const handleBuyStock = async () => {
        if (quantity > 0 && (quantity * searchData[1]['c']) <= money[0]['money']) {
            try {
                const response = await fetch(`https://assignment3-webtech-csci571.wl.r.appspot.com/portfolio/buy`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ticker: searchData[0]['ticker'], name: searchData[0]['name'], quantity, price: searchData[1]['c'] })
                });
                if (response.ok) {
                    console.log('Stock bought');
                    handleCloseBuy();
                    setPortfolio(true);
                    setShowBuyDiv(true);
                    fetchMoney();
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

    const fetchPortfolio = async () => { 
        const storedDataPortfolio = sessionStorage.getItem('portfolio');
        if (storedDataPortfolio) {
            const jsonData = JSON.parse(storedDataPortfolio);
            setPortfolio(jsonData);
            return;
        }
        const response = await fetch('https://assignment3-webtech-csci571.wl.r.appspot.com/portfolio/get');
        const data = await response.json();
        const tickerInPortfolio = data.find((item) => item.ticker === ticker);
        const quantityInPortfolio = tickerInPortfolio ? tickerInPortfolio.quantity : 0;
        console.log('Quantity in Portfolio:', quantityInPortfolio);
        console.log('Portfolio:', data);
        setquantityInPortfolio(quantityInPortfolio);
        sessionStorage.setItem('portfolio', JSON.stringify(data));
      };

    //Money
    const [money, setMoney] = useState(null);

    //Watchlist bool 
    const [watch, setWatch] = useState(false);

    // First Fetch 
    const fetchData = async (ticker) => {
        if (ticker !== '') {
            try {
                const storedDataSearch = sessionStorage.getItem('searchData');
                if (storedDataSearch) {
                    const jsonData = JSON.parse(storedDataSearch);
                    setData(jsonData);
                    const datetrade = new Date(jsonData[1]['t'] * 1000).toISOString().split('T')[0];
                    const timetrade = new Date(jsonData[1]['t'] * 1000).toLocaleTimeString([], { hour12: false });
                    setDatetrade(datetrade);
                    setTimetrade(timetrade);
                    return;
                }
                const response = await fetch(`https://assignment3-webtech-csci571.wl.r.appspot.com/search/${ticker}`);
                if (!response.ok) {
                    throw new Error('Ticker not found.');
                }
                const jsonData = await response.json();
                setData(jsonData);
                setError(null);
                const datetrade = new Date(jsonData[1]['t'] * 1000).toISOString().split('T')[0];
                const timetrade = new Date(jsonData[1]['t'] * 1000).toLocaleTimeString([], { hour12: false });
                setDatetrade(datetrade);
                setTimetrade(timetrade);
                console.log('Date:', datetrade);
                sessionStorage.setItem('searchData', JSON.stringify(jsonData));
            } catch (error) {
                console.error('Error fetching ticker details:', error);
                setError('Ticker not found');
                setData(null);
            }
        } else {
            setError(null);
            setData(null);
        }
    };

    // Check if market is open
    const isMarketOpen = () => {
        if (!searchData) {
            return false; // Return false if searchData is not loaded yet
        }

        const lastUpdateTime = new Date(searchData[1]['t'] * 1000); // Convert to milliseconds
        const currentTime = new Date();
        const differenceInMinutes = (currentTime - lastUpdateTime) / (1000 * 60); // Convert difference from milliseconds to minutes

        return differenceInMinutes <= 5;
    };

    

    // News
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [showNews, setShowNews] = useState(false);
    const handleNewsClick = (article) => {
        setSelectedArticle(article);
        setShowNews(true);
    };
    const handleClosePopup = () => {
        setSelectedArticle(null);
        setShowNews(false);
    };
    useEffect(() => {
        if (selectedArticle) {
            document.body.style.overflow = 'hidden';
            const date = new Date(selectedArticle.datetime * 1000);
            setFormattedDate(date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [selectedArticle]);

    //watchlist for adding 
    const [showAddWatch, setShowAddWatch] = useState(false);
    const [showRemoveWatch, setShowRemoveWatch] = useState(false);

    const addWatchlist = async (ticker) => {
        if (searchData['watch'] === true) {
            console.log('Ticker already in watchlist');
            fetch(`https://assignment3-webtech-csci571.wl.r.appspot.com/watchlist/remove/${ticker}`)
                .then(response => response.text())
                .then(() => {
                    console.log('Ticker removed from watchlist');
                    setShowRemoveWatch(true);
                    setTimeout(() => {
                        setShowRemoveWatch(false);
                    }, 4000);
                })
                .catch(error => console.log(error));
        }
        else {
            try {
                const response = await fetch(`https://assignment3-webtech-csci571.wl.r.appspot.com/watchlist/post`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ticker })
                });
                if (response.ok) {
                    console.log('Ticker added to watchlist');
                    setShowAddWatch(true);
                    setTimeout(() => {
                        setShowAddWatch(false);
                    }, 4000);
                } else {
                    throw new Error('Failed to add ticker to watchlist');
                }
            } catch (error) {
                console.error(error);
            }
        };
    };

    // Navbar
    const [selectedId, setSelectedId] = useState(1);
    const handleNavClick = (id) => {
        setSelectedId(id);
    };

    // Error In Buy and Sell
    const [errorMessageBS, setErrorMessageBS] = useState(true);
    const handleQuantityChange = (dbquantity) => {
        if (quantity > dbquantity) {
            setErrorMessageBS(false);
        } else {
            setErrorMessageBS(true);
        }
    };
  
    const handleBuy = (money,price) => {
      if (quantity * price <= money) {
          setErrorMessageBS(true);
      } else {
          setErrorMessageBS(false);
      }
  
    };

    //Checking for data and changes     
    useEffect(() => {
        fetchPortfolio();
        if (isMarketOpen()) {
            fetchData(ticker);
            console.log('Market is open');
            const intervalId = setInterval(() => fetchData(ticker), 15000);
            return () => clearInterval(intervalId);
        } else {
            fetchData(ticker);
            fetchMoney();
            setIsLoading(false);
        }
    }, [watch, isMarketOpen(),errorMessageBS,ticker]);

    const fetchMoney = async () => {
        const storedDataMoney = sessionStorage.getItem('money');
        if (storedDataMoney) {
            const jsonData = JSON.parse(storedDataMoney);
            setMoney(jsonData);
            return;
        }
        const response = await fetch('https://assignment3-webtech-csci571.wl.r.appspot.com/money');
        const data = await response.json();
        setMoney(data);
        sessionStorage.setItem('money', JSON.stringify(data));
    };

    useEffect(() => {
        fetchData(ticker);
        fetchMoney();
        fetchPortfolio();
    }, [ticker]);

    //Nav Scrolling
    const navRef = useRef(null);

    const scrollLeft = () => {
        navRef.current.scrollLeft -= 100;
    }
    
    const scrollRight = () => {
        navRef.current.scrollLeft += 100;
    }
    
    // charts summary
    const [chartData, setChartData] = useState(null);
    const [errorChart, setErrorChart] = useState(null);
 
    const chartFunction = async (ticker) => {
        try {
            const storedDataChart = sessionStorage.getItem('chartData');
            if (storedDataChart !== null) {
                const jsonData = JSON.parse(storedDataChart);
                setChartData(jsonData);
                return;
            }
            const response = await fetch(`https://assignment3-webtech-csci571.wl.r.appspot.com/charts/summary/${ticker}`);
            if (!response.ok) {
                throw new Error('Ticker not found.');
            }
            const jsonData = await response.json();
            setChartData(jsonData);
            setErrorChart(null);
            sessionStorage.setItem('chartData', JSON.stringify(jsonData));
        } catch (error) {
            console.error('Error fetching ticker details:', error);
            setErrorChart('Ticker not found');
            setChartData(null);
        }
    };

    useEffect(() => {
        chartFunction(ticker);
    },[ticker]);

    //main chart
    const [chartDataMain, setChartDataMain] = useState(null);
    const [errorChartMain, setErrorChartMain] = useState(null);
    const chartFunctionMain = async (ticker) => {
        try {
            const storedDataChartMain = sessionStorage.getItem('chartDataMain');
            if (storedDataChartMain) {
                const jsonData = JSON.parse(storedDataChartMain);
                setChartDataMain(jsonData);
                return;
            }
            const response = await fetch(`https://assignment3-webtech-csci571.wl.r.appspot.com/charts/${ticker}`);
            if (!response.ok) {
                throw new Error('Ticker not found.');
            }
            const jsonData = await response.json();
            setChartDataMain(jsonData);
            setErrorChartMain(null);
            sessionStorage.setItem('chartDataMain', JSON.stringify(jsonData));
        } catch (error) {
            console.error('Error fetching ticker details:', error);
            setErrorChartMain('Ticker not found');
            setChartDataMain(null);
        }
    };

    useEffect(() => {
        chartFunctionMain(ticker);
    },[ticker]);

    if (isLoading) {
        return <div className='spinner-container-search'>
            <Spinner animation='border' role='status'>
                <span className='sr-only'></span>
            </Spinner>
        </div>;
    }

    return (
        searchData &&(
            <div className={windowWidth < 768 ? 'phone-results-container' : 'results-container'}>
                {showBuyDiv ? <div className='stock-bought-search' > {ticker} bought successfully.<span className="close-icon-port" onClick={() => setShowBuyDiv(false)}>&times;</span> </div> : null}
                {showSellDiv ? <div className='stock-sold-search'> {ticker} sold successfully.<span className="close-icon-port" onClick={() => setShowSellDiv(false)}>&times;</span> </div> : null}
                {showAddWatch ? <div className='stock-bought-search' > {ticker} added to Watchlist.<span className="close-icon-port" onClick={() => setShowBuyDiv(false)}>&times;</span> </div> : null}
                {showRemoveWatch ? <div className='stock-sold-search'> {ticker} removed from Watchlist.<span className="close-icon-port" onClick={() => setShowSellDiv(false)}>&times;</span> </div> : null}
                <div className={windowWidth < 768 ? 'phone-above-info' : 'above-info'}>
                    <div className={windowWidth<768?'phone-first-col':'first-col'}>
                        <div className='fav-name' style={{ display: 'flex', alignItems: 'center', fontWeight:600 }}>
                            <p style={{fontSize:'1.5em', marginRight:'0.2em'}}>{searchData[0]['ticker']}</p>
                            {searchData['watch'] ? <FontAwesomeIcon icon={faStarSolid} size="1x" onClick={() => { addWatchlist(searchData[0]['ticker']); setWatch(!watch) }} style={{ color: 'yellow'}} />:
                            <FontAwesomeIcon icon={faStarRegular} size="1x" onClick={() => { addWatchlist(searchData[0]['ticker']); setWatch(!watch) }} style={{ color: '#ccc'}} />}
                        </div>
                        <div className='name'>
                            <p style={{fontWeight:600,color:'#616165'}}>{searchData[0]['name']}</p>
                        </div>
                        <div className='exchange' style={{textAlign:'center'}}>
                            <p style={{fontSize:'0.7em',color:'#616165',fontWeight:500,}}>{searchData[0]['exchange']}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px',margin:'4px' }}>
                            <Button style={{ backgroundColor: 'green', borderColor: 'green', fontSize: '14px' }} onClick={handleShowBuy} disabled={!errorMessageBS}>Buy</Button>
                            {searchData['portfolio'] || portfolio ? <Button style={{ backgroundColor: 'red', borderColor: 'red', fontSize: '14px' }} onClick={handleShowSell}>Sell</Button> : null}
                        </div>
                        {
                            showBuy && searchData && money &&
                            (<Modal show={showBuy} onHide={handleCloseBuy}>
                                <Modal.Header closeButton>
                                    <Modal.Title>{ticker}</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <p>Current Price: {searchData[1]['c']}</p>
                                    <p>Money in Wallet: {(money[0]['money']).toFixed(2)}</p>
                                    <p>Quantity: <input type="number" placeholder="0" value={quantity} onChange={(e) => {setQuantity(e.target.value) ; handleBuy(money[0]['money'],searchData[1]['c'])}} /></p>
                                    {quantity*searchData[1]['c'] > money[0]['money'] && <p style={{color:'red'}}>Not enough money in the wallet!</p>}
                                </Modal.Body>
                                <Modal.Footer className="d-flex justify-content-between">
                                    <p>Total: {(searchData[1]['c'] * quantity).toFixed(2)}</p>
                                    <Button style={{ backgroundColor: 'green', borderColor: 'green' }} onClick={() => {handleBuyStock()}} disabled={!errorMessageBS}>
                                        Buy
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                            )
                        }
                        {
                            showSell && searchData && money &&
                            (<Modal show={showSell} onHide={handleCloseSell}>
                                <Modal.Header closeButton>
                                    <Modal.Title>{ticker}</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <p>Current Price: {searchData[1]['c']}</p>
                                    <p>Money in Wallet: {(money[0]['money']).toFixed(2)}</p>
                                    <p>Quantity: <input type="number" placeholder="0" value={quantity} onChange={(e) => {setQuantity(e.target.value); handleQuantityChange(quantityInPortfolio)}} /></p>
                                    {quantity > quantityInPortfolio && <p style={{color:'red'}}>You cannot sell the stock as you don't have!</p>}
                                </Modal.Body>
                                <Modal.Footer className="d-flex justify-content-between">
                                    <p>Total: {(searchData[1]['c'] * quantity).toFixed(2)}</p>
                                    <Button style={{ backgroundColor: 'red', borderColor: 'red' }} onClick={() => {handleSellStock();}} disabled={!errorMessageBS}>
                                        Sell
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                            )
                        }
                    </div>
                    <div className={windowWidth<768? 'phone-second-col':'second-col'}>
                        <div className="logo">
                            <img src={searchData[0]['logo']} alt='' />
                        </div>
                    </div>
                    <div className={windowWidth<768?'phone-third-col':'third-col'}>
                        <p style={{ color: searchData[1]['d'] > 0 ? 'green' : 'red', fontSize:'1.5em',fontWeight:600 }}>{searchData[1]['c'].toFixed(2)}</p>
                        <p style={{ color: searchData[1]['d'] > 0 ? 'green' : 'red',fontWeight:600 }}><span><FontAwesomeIcon icon={searchData[1]['d'] > 0 ? faCaretUp : faCaretDown} /></span>{(searchData[1]['d']).toFixed(2)} ({(searchData[1]['dp']).toFixed(2)}%)</p>
                        <p style={{fontSize:'0.7em'}}>{datetrade} {timetrade}</p>
                    </div>
                </div>
                {isMarketOpen() ? <p style={{color:'green',fontWeight:600,fontSize:'0.8em', textAlign:'center'}}>Market is Open</p> : <p style={{ color: 'red',fontWeight:600,fontSize:'0.8em',textAlign:'center' }}>Market is Closed on {datetrade} {timetrade}</p>}
                {/* NAVBAR */}
                <nav className={`navbar-search ${windowWidth < 768 ? 'phone-view' : 'normal-view'}`}>
                    {windowWidth < 768 ? (
                        <button className="arrow arrow-left"><FontAwesomeIcon icon={faChevronLeft} onClick={scrollLeft}/></button>
                    ) : null}
                    <ul className="nav-list-search d-flex flex-nowrap" ref={navRef}>
                        <li className="nav-item"><a href="#" id={selectedId === 1 ? 'nav-list-selected' : ''} onClick={() => handleNavClick(1)}>Summary</a></li>
                        <li className="nav-item"><a href="#" id={selectedId === 2 ? 'nav-list-selected' : ''} onClick={() => handleNavClick(2)}>Top News</a></li>
                        <li className="nav-item"><a href="#" id={selectedId === 3 ? 'nav-list-selected' : ''} onClick={() => handleNavClick(3)}>Charts</a></li>
                        <li className="nav-item"><a href="#" id={selectedId === 4 ? 'nav-list-selected' : ''} onClick={() => handleNavClick(4)}>Insights</a></li>
                    </ul>
                    {windowWidth < 768 ? (
                        <button className="arrow arrow-right"><FontAwesomeIcon icon={faChevronRight} onClick={scrollRight}/></button>
                    ) : null}
                </nav>
                {/* SUMMARY */}
                {
                    (selectedId === 1) && (
                        <div className={windowWidth<768? 'phone-summary':'summary'} id='summary'>
                            <div className={windowWidth<768?'phone-first-col-summary':'summary-first-col'}>
                                <div className={windowWidth<768?'phone-text':'left-aligned-text'}>
                                    <p><span style={{ fontWeight: 600 }}>High Price:</span> {searchData[1]['h'].toFixed(2)}</p>
                                    <p><span style={{ fontWeight: 600 }}>Low Price:</span> {searchData[1]['l'].toFixed(2)}</p>
                                    <p><span style={{ fontWeight: 600 }}>Open Price:</span> {searchData[1]['o'].toFixed(2)}</p>
                                    <p><span style={{ fontWeight: 600 }}>Prev. Close:</span> {searchData[1]['pc'].toFixed(2)}</p>
                                </div>
                                <div className={windowWidth<768?'phone-about':'center-aligned-text'}>
                                    <p style={{ textDecoration: "underline" }}>About the company</p>
                                    <p><span style={{ fontWeight: 600 }}>IPO Start Date:</span> {searchData[0]['ipo']}</p>
                                    <p><span style={{ fontWeight: 600 }}>Industry:</span> {searchData[0]['finnhubIndustry']}</p>
                                    <p><span style={{ fontWeight: 600 }}>Webpage:</span> <a href={searchData[0]['weburl']} style={{ color: 'blue', textDecoration: 'underline' }}>{searchData[0]['weburl']}</a></p>
                                    <p><span style={{ fontWeight: 600 }}>Company peers:</span></p>
                                    <div style={{ display: 'inline-block',textAlign:'center' }}>
                                        {searchData[2].map((peer, index) => (
                                            <span key={index}>
                                                <a href='#'
                                                    onClick={(event) => {
                                                        event.preventDefault();
                                                        navigate(`/search/${peer}`);
                                                    }}
                                                    style={{ color: 'blue', textDecoration: 'underline', fontSize: '14px' }}>
                                                    {peer}
                                                </a>
                                                {index !== searchData[2].length - 1 && ', '}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className={windowWidth<768?'phone-second-col-summary':'summary-second-col'}>
                            <SummaryChart ticker={searchData['0']['ticker']} trend={searchData[1]['d']} chartData={chartData}/>
                            </div>
                        </div>
                    )}
                {/* TOP NEWS */}
                {
                    (selectedId === 2) && (
                        <div className='content' id='top-news'>
                            <div className='news-container'>
                                {searchData[3].map((article, index) => (
                                    <div className={windowWidth < 768 ? "col-12 mb-3" : "col-lg-6 col-md-12 mb-3"}>
                                        <Card className={windowWidth<768?"d-flex align-items-center p-2 border rounded h-100 mx-2":"d-flex flex-row align-items-center p-2 border rounded h-100 mx-2"} key={index} onClick={() => { handleNewsClick(article); }}>
                                            <img className={windowWidth<768?'phone-news-article-img':'news-article-img '} src={article.image} />
                                            <p className={windowWidth<768?'phone-news-text':"news-text"}>{article.headline}</p>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                {selectedArticle && (
                    <Modal show={true} onHide={handleClosePopup}>
                        <Modal.Header closeButton className='d-flex align-items-center justify-content-between'>
                            <div>
                                <h3>{selectedArticle.source}</h3>
                                <p>{formattedDate}</p>
                            </div>
                        </Modal.Header>
                        <Modal.Body>
                            <p style={{ fontWeight: '600' }}>{selectedArticle.headline}</p>
                            <p style={{ fontSize: '14px' }}>{selectedArticle.summary}</p>
                            <p style={{ fontSize: '12px', color: '#7a7e82' }}>For more details click <a href={selectedArticle.url} target="_blank" style={{ color: 'blue', textDecoration: 'underline' }}>here</a></p>
                        </Modal.Body>
                        <div className="popup-share">
                            <p style={{ fontSize: '14px', color: '#6e7374', marginBottom: '8px' }}>Share</p>
                            <div className="social-icons">
                                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(selectedArticle.headline)}&url=${encodeURIComponent(selectedArticle.url)}`} target="_blank" rel="noopener noreferrer">
                                    <FontAwesomeIcon icon={faXTwitter} style={{ fontSize: '25px', marginRight: '8px', color: 'black' }} />
                                </a>
                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(selectedArticle.url)}`} target="_blank" rel="noopener noreferrer">
                                    <FontAwesomeIcon icon={faFacebookSquare} style={{ fontSize: '25px', color: '#1408fc' }} />
                                </a>
                            </div>
                        </div>
                    </Modal>
                )}
                {
                (selectedId === 3) && (
                        <StockChartComponent ticker={searchData['0']['ticker']} chartData={chartDataMain}/>
                )}
                {searchData["5"]["data"].forEach(item => {
                    totalChange += item.change;
                    totalMspr += item.mspr;
                })}
                {searchData["5"]["data"].forEach(item => {
                    if (item.change > 0) {
                        positiveChange += item.change;
                        positiveMSPR += item.mspr;
                    } else {
                        negativeChange += item.change;
                        negativeMSPR += item.mspr;
                    }
                })}
                {
                    (selectedId === 4) && (
                        <div className={windowWidth<768?'phone-insights':'insights'}>
                            <h3>Insider Sentiments</h3>
                            <table className="centered-table">
                                <thead>
                                    <tr>
                                        <th>{searchData['0']['name']}</th>
                                        <th>MSPR</th>
                                        <th>Change</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th>Total</th>
                                        <td>{totalMspr}</td>
                                        <td>{totalChange}</td>
                                    </tr>
                                    <tr>
                                        <th>Positive</th>
                                        <td>{positiveMSPR}</td>
                                        <td>{positiveChange}</td>
                                    </tr>
                                    <tr>
                                        <th>Negative</th>
                                        <td>{negativeMSPR}</td>
                                        <td>{negativeChange}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className={windowWidth<768?'phone-insights-charts':'insights-charts d-flex'} >
                            <div style={windowWidth<768?{maxWidth:'350px'}:{ maxWidth: '410px' }}>
                                <StrongBuySellChart data={searchData[4]}/>
                                </div>
                                <div style={windowWidth<768?{maxWidth:'350px',marginTop:'15px'}:{ maxWidth: '410px' }}>
                                <EPSChart data={searchData[6]}/>
                                </div>
                            </div>
                        </div>
                    )}
            </div>
        )
    );
}

export default SearchResults;