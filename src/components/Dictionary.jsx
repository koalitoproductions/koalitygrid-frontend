import { useState, useEffect } from 'react';
import api from '../config/axios';

const Dictionary = () => {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [foundTerm, setFoundTerm] = useState(null);
  const [selectedResult, setSelectedResult] = useState(0);
  const [termsList, setTermsList] = useState([]);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const fetchTermsList = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/terms/list/');
      const grouped = Object.entries(
        response.data.reduce((acc, term) => {
          const firstLetter = term.name[0]?.toUpperCase() || 'Övrigt';
          acc[firstLetter] = acc[firstLetter] || [];
          acc[firstLetter].push({name: term.name, id: term.id});
          return acc;
        }, {})
      )
        .map(([letter, terms]) => ({ letter, terms: terms.sort() })) // Sort terms within each group
        .sort((a, b) => a.letter.localeCompare(b.letter)); // Sort groups by letter
      setTermsList(grouped);
    } catch(error) {
      console.error('Error fetching terms list:', error);
    } finally {
      setLoading(false);
    }
  }

  const fetchSearchResults = async () => {
    try {
      const response = await api.get(`/api/terms/search/?q=${debouncedQuery}`);
      setResults(response.data);
      setSelectedResult(0);
    } catch (error) {
      console.error('Error fetching calc tools:', error);
    }
  };

  useEffect(() => {
    fetchTermsList();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery) {
      fetchSearchResults();
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openTermDefinition = async (id) => {
    setResults([]);
    try {
      const response = await api.get(`/api/terms/${id}/`);
      setFoundTerm({name: response.data.name, description: response.data.description});
      window.scrollTo({top: 0, behavior: 'smooth'});
    } catch(error) {
      console.error('There was a problem fetching the term definition:', error);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (results.length > 0) {
      openTermDefinition(results[selectedResult].id, results[selectedResult].description);
    } else {
      fetchSearchResults();
    }
  };

  const handleResultsNavigation = (event) => {
    if(results.length === 0) {
      return;
    }
    if(event.key === 'ArrowUp') {
      if(selectedResult > 0) {
        setSelectedResult(selectedResult - 1);
      } else {
        setSelectedResult(results.length - 1);
      }
    } else if(event.key === 'ArrowDown') {
      if(selectedResult < results.length - 1) {
        setSelectedResult(selectedResult + 1);
      } else {
        setSelectedResult(0);
      }
    } else if(event.key === 'Escape') {
      setResults([]);
    }
  };

  const scrollToLetter = (letter) => {
    const element = document.getElementById(`letter-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="justify-center">
      <h2 className="text-3xl font-semibold mb-6 text-white-200">Sök efter termer</h2>
      <form onSubmit={handleSubmit} onKeyDown={handleResultsNavigation}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
          placeholder="Sök efter termer..."
          className="w-full p-2 bg-white border border-gray-300 text-gray-900 focus:ring-[#fa7532] focus:border-[#fa7532] rounded-md"
        />
      </form>
      {results &&
      <ul className="mt-2 bg-white rounded-lg shadow-sm divide-y divide-gray-200 text-gray-900 border-[#fa7532] border-solid border-2">
        {results.map((term, index) => (
          <li 
            key={term.id} 
            onClick={() => openTermDefinition(term.id)}
            className={`p-2 cursor-pointer hover:bg-[#ffffee] ${index === selectedResult ? 'bg-blue-50' : ''}`}
          >
            {term.name}
          </li>
        ))}
      </ul>
      }
      {foundTerm &&
        <div className="mt-4 p-4 bg-[#383838] rounded-lg">
          <h2 className="text-3xl font-semibold mb-6 text-white-200">Term: {foundTerm.name}</h2>
          <p className="text-gray-200">{foundTerm.description}</p>
        </div>
      }
      <div className="mt-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {termsList.map(group => (
            <button
              key={group.letter}
              onClick={() => scrollToLetter(group.letter)}
              className="text-[#fa7532] hover:underline text-lg hover:cursor-pointer"
            >
              {group.letter}
            </button>
          ))}
        </div>
        {termsList.length ? (
        termsList.map(group => (
          <div key={group.letter} id={`letter-${group.letter}`} className="mb-2 mt-2">
            <h2 className="text-[#fa7532]">{group.letter}</h2>
            {group.terms.map(term => (
              <div className="hover:cursor-pointer">
                <p onClick={() => openTermDefinition(term.id)} className="underline">{term.name}</p>
              </div>
            ))}
          </div>
        ))
      ) : (
        <div>Inga termer hittade</div>
      )}
      </div>
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed md:bottom-4 bottom-20 left-1/2 flex items-center justify-center bg-orange-400 text-white text-2xl p-3 rounded-full shadow-lg hover:bg-orange-500 transition duration-300 ease-in-out hover:cursor-pointer w-12 h-12"
          title="Till toppen"
        >
          <i class="fa-solid fa-arrow-up"></i>
        </button>
      )}
    </div>
  );
};

export default Dictionary;