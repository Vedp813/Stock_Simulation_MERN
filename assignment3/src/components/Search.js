import React from 'react';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import './Search.css';


function SearchResults({ ticker }) {
    const [searchData, setData] = useState(null);
    const [error, setError] = useState(null);
    const [datetrade, setDatetrade] = useState('');
    const [timetrade, setTimetrade] = useState('');
    
    useState(() => {
        const fetchData = async (ticker) => {
            console.log(ticker);
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

        fetchData(ticker);
    }, [ticker]);


    const [selectedId, setSelectedId] = useState(1);

    const handleNavClick = (id) => {
        setSelectedId(id);
    };

    return (
        searchData && (
            <div className='results-container'>
                <div className='above-info'>
                    <div className='first-col'>
                        <div className='fav-name'>
                            <p>{searchData[0]['ticker']}</p>
                            <FontAwesomeIcon icon={faStar} style={{ color: 'yellow' }} />
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
                            <p><span style={{ fontWeight:600 }}>High Price:</span> {searchData[1]['h'].toFixed(2)}</p>
                            <p><span style={{ fontWeight:600 }}>Low Price:</span> {searchData[1]['l'].toFixed(2)}</p>
                            <p><span style={{ fontWeight:600 }}>Open Price:</span> {searchData[1]['o'].toFixed(2)}</p>
                            <p><span style={{ fontWeight:600 }}>Prev. Close:</span> {searchData[1]['pc'].toFixed(2)}</p>
                        </div>
                        <div className='center-aligned-text'>
                            <p style={{ textDecoration: "underline" }}>About the company</p>
                            <p><span style={{ fontWeight:600 }}>IPO Start Date:</span> {searchData[0]['ipo']}</p>
                            <p><span style={{ fontWeight:600 }}>Industry:</span> {searchData[0]['finnhubIndustry']}</p>
                            <p><span style={{ fontWeight:600 }}>Webpage:</span> <a href={searchData[0]['weburl']} style={{ color: 'blue', textDecoration: 'underline' }}>{searchData[0]['weburl']}</a></p>
                            <p><span style={{ fontWeight:600 }}>Company peers:</span></p>                  
                            <div style={{ display: 'inline-block' }}>
                                {searchData[3].map((peer, index) => (
                                    <span key={index}>
                                        <a href={peer} style={{ color: 'blue', textDecoration: 'underline', fontSize: '14px' }}>
                                            {peer}
                                        </a>
                                        {index !== searchData[3].length - 1 && ', '}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className='content' id='charts' display="none">
                        
                    </div>
                </div>
            </div>
        )
    );
}

export default SearchResults;