import './Body.css';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import SearchResults from './Search';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

function Body() {
    
    const { sendtick } = useParams();
    const [ticker, setTicker] = useState(sendtick ||'');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [options, setOptions] = useState([]);
    const [sendticker, sendTicker] = useState(sendtick ||'');
    const navigate = useNavigate();
    const [errormessage, setErrorMessage] = useState(false);
    const [noDataError, setNoDataError] = useState(false);
    // const [selectedOption, setSelectedOption] = useState(null);

    

    useEffect(() => {
        const fetchOptions = async (ticker) => {
            try {
                if (ticker !== '') {
                    const response = await fetch(`https://assignment3-webtech-csci571.wl.r.appspot.com/api/${ticker}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch stock names.');
                    }
                    const jsonData = await response.json();
                    setOptions(jsonData.map(item => ({
                        value: `${item.symbol.toString()} | ${item.description.toString()}`
                    })));
                } else {
                    setOptions([]);
                }
            } catch (error) {
                setNoDataError(true);
                console.error('Error fetching stock names:', error);
            }
        };
        fetchOptions(ticker);
        localStorage.setItem('ticker', sendticker);
    }, [ticker]);


    const handleTickerSelection = (selected) => {
        const symbol = selected[0].value.split(' ')[0];
        sendTicker(symbol);
        // setSelectedOption(selected[0]);
        navigate(`/search/${ticker.toUpperCase()}`);
    };

    const handleSubmit = async (event) =>{
        event.preventDefault();
        if (ticker.trim() === '') {
            console.log('Ticker is empty set Error');
            setErrorMessage(true);
            console.log('this is error message',errormessage);
            setTimeout(() => {
                setErrorMessage(false);
            }, 4000);
            return;
        }
        sendTicker(ticker);
        console.log('this is on submit check this');
        navigate(`/search/${ticker.toUpperCase()}`);
    };

    const [checkClear,setCheckClear] = useState(true);

    // const clearIcon = () => {
    //     setTicker('');
    //     setError(null);
    //     setData(null);
    //     sendTicker('');
    //     setOptions([]);
    //     navigate(`/search/home`);
    // }

    useEffect(() => {
        sendTicker(sendtick);
    }, [sendtick,errormessage]);
    
    console.log('this is changed ticker',sendticker);

    return (
        <div className="body-container">
            <div className="text-and-search">
                <p>Stock Search</p>
                <div className="search-container">
                    <form onSubmit={handleSubmit} className="form-submit">
                        <Typeahead
                            id="search"
                            type="text"
                            placeholder="Enter stock ticker symbol"
                            labelKey="value"
                            onInputChange={setTicker}
                            onChange={ (selected) => handleTickerSelection(selected)}
                            selected={sendticker ? [{ value: sendticker }] : []}
                            options={options}
                            className="typeahead"
                            emptyLabel={ticker ? (
                                <Spinner animation="border" role="status" className='spinner'>
                                    <span className="sr-only">Loading...</span>
                                </Spinner>
                            ) : null}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    handleSubmit(event);
                                }
                            }}
                        >
                        </Typeahead>

                        <button className="search-icon" type="submit">
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                        <button type="button" className="clear-icon" onClick={() => {
                        setCheckClear(false);
                        setTicker('');
                        setError(null);
                        setData(null);
                        sendTicker('');
                        setOptions([]);
                        sessionStorage.clear();
                        navigate(`/search/home`);
                        }}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </form>
                    
                </div>
            </div>
            {ticker && <div className="results" >
                { errormessage ? <div className='stock-sold' style={{width:'850px'}}>Please enter a valid ticker.<span className="close-icon-port" onClick={() => setErrorMessage(false)}>&times;</span> </div>:null}
                { noDataError ? <div className='stock-sold' style={{width:'850px'}}>No data found. Please enter a valid Ticker<span className="close-icon-port" onClick={() => setNoDataError(false)}>&times;</span> </div>:null}
                {sendticker && checkClear && (
                    <SearchResults ticker={sendticker}/>
                )}
            </div>}
        </div>
    );
}

export default Body;
