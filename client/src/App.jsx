import { useState } from 'react';
import './App.css';

function App() {
  const [keywords, setKeywords] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!keywords.trim()) {
      setError('Please enter at least one keyword.');
      return;
    }

    setIsLoading(true);
    setStatus('Initiating search...');
    setError('');

    try {
      const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);

      setStatus('Searching and extracting emails (this may take a while)...');

      const response = await fetch('http://localhost:3830/api/extract-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywords: keywordList }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Extraction failed');
      }

      setStatus('Generating Excel file...');

      // Check if response is JSON (potentially an error even if status is 200, though unlikely)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonData = await response.json();
        throw new Error(jsonData.message || jsonData.error || 'Server returned JSON instead of Excel file');
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extracted_emails.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatus('Download started!');
    } catch (err) {
      setError(err.message);
      setStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="glass-card">
        <h1 className="title">
          <span className="gradient-text">Email Extractor</span>
        </h1>
        <p className="subtitle">
          Enter keywords to discover leads. We'll search the web, extract emails, and give you an Excel file.
        </p>

        <div className="input-group">
          <label>Keywords (comma separated)</label>
          <textarea
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. interior design, construction company, marketing agency"
            rows="4"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        {status && <div className="status-message">{status}</div>}

        <button
          className={`search-btn ${isLoading ? 'loading' : ''}`}
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="spinner"></span>
          ) : (
            'Search & Extract'
          )}
        </button>
      </div>
    </div>
  );
}

export default App;
