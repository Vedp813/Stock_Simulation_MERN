import React from 'react';
import { useState, useEffect } from 'react';
import './Search.css';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import { Navigate, useParams } from 'react-router-dom';


function SearchResults({ ticker }) {
    const [searchData, setData] = useState(null);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(1);

    const [peer, setPeer] = useState('');
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [datetrade, setDatetrade] = useState('');
    const [timetrade, setTimetrade] = useState('');
    const [formattedDate, setFormattedDate] = useState('');
    const [watchlist,setWatchlist] = useState(null);



    console.log(ticker);
    const { sendtic } = useParams();
    // First Fetch 
    const fetchData = async (ticker) => {
        // if (sendtic !== ticker) {
        //     ticker = sendtic;
        // }
        if (ticker !== '') {
            try {
                const response = await fetch(`http://localhost:8000/search/${ticker}`);
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

    // // Peers Click
    // const handlePeerClick = (peer) => {
    //     setPeer(peer);
    // };

    // useEffect(() => {
    //     if (peer !== '') {
    //         fetchData(peer);
    //     }
    // }, [peer]);

    // Navbar
    const handleNavClick = (id) => {
        setSelectedId(id);
    };

    // News
    const handleNewsClick = (article) => {
        setSelectedArticle(article);
    };

    const handleClosePopup = () => {
        setSelectedArticle(null);
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

    //watchlist
    const addWatchlist = async () => {
        try {
            const response = await fetch(`http://localhost:8000/watchlist/post`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ticker })
            });
            if (response.ok) {
                console.log('Ticker added to watchlist');
            } else {
                throw new Error('Failed to add ticker to watchlist');
            }
        } catch (error) {
            console.error(error);
        }
    };

    // const Watchlist = async (ticker) => {  
    //     try {
    //         const response = await fetch('http://localhost:8000/watchlist/get');
    //         const data = await response.json();
    //         setData(data);
    //         data.map((data, index) => {
    //             if(data['profile']['ticker'] === ticker){
    //                 return setWatchlist(true);
    //             }
    //             else{
    //                 return setWatchlist(false);
    //             }
    //         });
    //     } catch (error) {
    //         console.log(error);
    //     }
    // };

    useState(() => {
        fetchData(ticker);
        // Watchlist(ticker);
    }, [ticker]);

    useEffect(() => {
        fetchData(ticker);
        // Watchlist(ticker);
        addWatchlist();
    }, [ticker]);
    return (
        searchData && (
                <div className='results-container'>
                    <div className='above-info'>
                        <div className='first-col'>
                            <div className='fav-name'>
                                <p>{searchData[0]['ticker']}</p>
                                <FontAwesomeIcon icon={faStar} onClick={() =>addWatchlist()} style={{ color: watchlist ? 'yellow' : '#ccc' }} />
                            </div>
                            <div className='name'>
                                <p>{searchData[0]['name']}</p>
                            </div>
                            <div className='exchange'>
                                <p>{searchData[0]['exchange']}</p>
                            </div>
                            <button className='buy-button'>Buy</button>
                        </div>
                        <div className='second-col'>
                            <div className="logo">
                                <img src={searchData[0]['logo']} alt='' />
                            </div>
                            <p>Market is Open</p>
                            <p>Market is Closed on </p>
                        </div>
                        <div className='third-col'>
                            <p style={{ color: searchData[1]['d'] > 0 ? 'green' : 'red' }}>${searchData[1]['c'].toFixed(2)}</p>
                            <p style={{ color: searchData[1]['d'] > 0 ? 'green' : 'red' }}>{searchData[1]['d'].toFixed(2)} ({searchData[1]['dp'].toFixed(2)}%)</p>
                            <p>{datetrade} {timetrade}</p>
                        </div>
                    </div>
                    <nav className="navbar-search">
                        <ul className="nav-list-search">
                            <li><a href="#" id={selectedId === 1 ? 'nav-list-selected' : ''} onClick={() => handleNavClick(1)}>Summary</a></li>
                            <li><a href="#" id={selectedId === 2 ? 'nav-list-selected' : ''} onClick={() => handleNavClick(2)}>Top News</a></li>
                            <li><a href="#" id={selectedId === 3 ? 'nav-list-selected' : ''} onClick={() => handleNavClick(3)}>Charts</a></li>
                            <li><a href="#" id={selectedId === 4 ? 'nav-list-selected' : ''} onClick={() => handleNavClick(4)}>Insights</a></li>
                        </ul>
                    </nav>
                    <div className='content' id='summary' style={{ display: selectedId === 1 ? 'block' : 'none' }}>
                        <div className='summary-first-col'>
                            <div className='left-aligned-text'>
                                <p><span style={{ fontWeight: 600 }}>High Price:</span> {searchData[1]['h'].toFixed(2)}</p>
                                <p><span style={{ fontWeight: 600 }}>Low Price:</span> {searchData[1]['l'].toFixed(2)}</p>
                                <p><span style={{ fontWeight: 600 }}>Open Price:</span> {searchData[1]['o'].toFixed(2)}</p>
                                <p><span style={{ fontWeight: 600 }}>Prev. Close:</span> {searchData[1]['pc'].toFixed(2)}</p>
                            </div>
                            <div className='center-aligned-text'>
                                <p style={{ textDecoration: "underline" }}>About the company</p>
                                <p><span style={{ fontWeight: 600 }}>IPO Start Date:</span> {searchData[0]['ipo']}</p>
                                <p><span style={{ fontWeight: 600 }}>Industry:</span> {searchData[0]['finnhubIndustry']}</p>
                                <p><span style={{ fontWeight: 600 }}>Webpage:</span> <a href={searchData[0]['weburl']} style={{ color: 'blue', textDecoration: 'underline' }}>{searchData[0]['weburl']}</a></p>
                                <p><span style={{ fontWeight: 600 }}>Company peers:</span></p>
                                <div style={{ display: 'inline-block' }}>
                                    {searchData[2].map((peer, index) => (
                                        <span key={index}>
                                            <a href='#'
                                                // onClick={handlePeerClick(peer)} 
                                                style={{ color: 'blue', textDecoration: 'underline', fontSize: '14px' }}>
                                                {peer}
                                            </a>
                                            {index !== searchData[2].length - 1 && ', '}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className='content' id='charts' display="none">

                        </div>
                    </div>
                    <div className='content' id='top-news' style={{ display: selectedId === 2 ? 'block' : 'none' }}>
                        <div className='news-container'>
                            {searchData[3].map((article, index) => (
                                <div className="news-article" key={index} onClick={() => handleNewsClick(article)}>
                                    <img src={article.image} alt="" />
                                    <div className="news-text">
                                        <p className="news-heading">{article.headline}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {selectedArticle && (
                        <div className='popup-full'>
                            <div className="overlay" onClick={handleClosePopup}></div>
                            <div className="popup">
                                <div className="popup-content">
                                    <div className="popup-top">
                                        <div className='first-col-pop'>
                                            <h3>{selectedArticle.source}</h3>
                                            <p>{formattedDate}</p>
                                        </div>
                                        <span className="close-icon" onClick={handleClosePopup}>&times;</span>
                                    </div>
                                    <div className="popup-divider"></div>
                                    <div className="popup-bottom">
                                        <p style={{ fontWeight: '600' }}>{selectedArticle.headline}</p>
                                        <p style={{ fontSize: '14px' }}>{selectedArticle.summary}</p>
                                        <p style={{ fontSize: '12px', color: '#7a7e82' }}>For more details click <a href={selectedArticle.url} target="_blank" style={{ color: 'blue', textDecoration: 'underline' }}>here</a></p>
                                    </div>
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
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )
    );
}

export default SearchResults;