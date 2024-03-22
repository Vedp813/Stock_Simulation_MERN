import './Body.css';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes} from '@fortawesome/free-solid-svg-icons';
import SearchResults from './Search';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Spinner } from 'react-bootstrap';

function Body() {
    const [ticker, setTicker] = useState('');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [options, setOptions] = useState([]);
    const [sendticker, sendTicker] = useState('');
    const [loading, setLoading] = useState(true);


    const fetchData = async (ticker) => {
        if (ticker !== '') {
            try {
                const response = await fetch(`http://localhost:8000/api/${ticker}`);
                if (!response.ok) {
                    throw new Error('Ticker not found.');
                }
                const jsonData = await response.json();
                setData(jsonData);
                setError(null);
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

    
    useEffect(() => {
        console.log('running')
        const fetchOptions = async (ticker) => {
            try {
                if (ticker !== '') {
                    const response = await fetch(`http://localhost:8000/api/${ticker}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch stock names.');
                    }
                    const jsonData = await response.json();
                    setOptions(jsonData.result.map(item => ({
                        value: `${item.symbol.toString()} | ${item.description.toString()}`
                    })));
                    setLoading(false);
                } else {
                    setOptions([]);
                }
            } catch (error) {
                console.error('Error fetching stock names:', error);
            }
        };
        fetchOptions(ticker);
    }, [ticker]);
    
    const handleTickerSelection = (selected) => {
        const symbol = selected[0].value.split(' ')[0];
        sendTicker(symbol);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        fetchData(ticker);
        console.log('this is on submit check this')
    };

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
                            onChange={handleTickerSelection}
                            // options= {loading ? [<Spinner animation="border" role="status"><span className="sr-only">Loading...</span></Spinner>] : options}
                            options={options}
                            className="typeahead"
                        />
                        <button className="search-icon" type="submit"> 
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                        <button className="clear-icon" onClick={() => {
                            setTicker('');
                        }}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </form>
                </div>
            </div>
            <div className="results">
                {error && <p>{error}</p>}
                {data && (
                    <SearchResults ticker={sendticker} /> 
                )}
            </div>
        </div>
    );
}

export default Body;
