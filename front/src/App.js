import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const queryUrl = "http://127.0.0.1:50050/query"; //後でfast apiのurl


  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');

  const handleQuerySubmit = async () => {
    try {
      const response = await axios.post(queryUrl, {
          text: query,
      });
      setDraft(response.data.output);
    } catch (error) {
      console.error("Error:", error);
    }
  };


  return (
    <div className="App">
      <header className="App-header">
        <h1>App</h1>
        <div>
          <textarea
            rows="4"
            cols="100"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div>
          <button onClick={handleQuerySubmit}>草稿を作成する</button>
        </div>

        <h2>草稿の出力結果</h2>
        <div
          style={{
            border: '1px solid #ccc',
            padding: '10px',
            width: '1000px',
            lineHeight: '1.5',
          }}
        >
          <p>
            {draft}
          </p>
        </div>
      </header>
    </div>
  );
}

export default App;