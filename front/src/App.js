import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const queryUrl = "http://127.0.0.1:50050/query"; //後でfast apiのurl


  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [maskedDraft, setMaskedDraft] = useState('');

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

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString()
    setSelectedText(text);

    if (text.length > 0) {
      const selectionStart = selection.anchorOffset;
      const selectionEnd = selection.focusOffset;
      const beforeSelection = draft.slice(0, selectionStart);
      const afterSelection = draft.slice(selectionEnd);

      setMaskedDraft(beforeSelection + "__" + afterSelection);
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
          onMouseUp={handleTextSelection}
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
        <p>
          選択しているテキスト: <strong>{selectedText}</strong>
        </p>
        <p>
          マスク: <strong>{maskedDraft}</strong>
        </p>


      </header>
    </div>
  );
}

export default App;