import React, { useState } from 'react';
import axios from 'axios';
import { Paper, Typography} from '@mui/material';
// import { styled } from '@mui/material/styles';


const CodeBlock = ({ code }) => {
  return (
    <Paper sx={{backgroundColor: '#f0f0f0', overflowX: 'auto', mx: 40, my: 5, p: 5}}>
      <Typography variant="body2" component="pre">
        {code}
      </Typography>
    </Paper>
  );
};

function App() {
  const queryUrl = "http://127.0.0.1:50050/query"; //TODO: .envから取得
  const suggestUrl = "http://127.0.0.1:50050/suggest"; //TODO: .envから取得

  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [beforeText, setBeforeText] = useState('');
  const [afterText, setAfterText] = useState('');
  const [maskedDraft, setMaskedDraft] = useState('');
  const [suggests, setSuggests] = useState([]);
  const [selectedSuggest, setSelectedSuggest] = useState('');
  const [historyList, setHistoryList] = useState([]);
  const [historyListJson, setHistoryListJson] = useState(JSON.stringify([], null, 2));

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

    if (text.length > 0) {
      const selectionStart = selection.anchorOffset;
      const selectionEnd = selection.focusOffset;
      const beforeTextTmp = draft.slice(0, selectionStart);
      const afterTextTmp = draft.slice(selectionEnd);

      setSelectedText(text);
      setBeforeText(beforeTextTmp);
      setAfterText(afterTextTmp);
      setMaskedDraft(beforeTextTmp + "__" + afterTextTmp);
    }
  };

  const handleSelectedTextSubmit = async () => {
    try {
      const response = await axios.post(suggestUrl, {
        selected_text: selectedText,
        draft: maskedDraft,
        n: 3
      });
      setSuggests(response.data.suggest);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleButtonClick = (string) => {
    setSelectedSuggest(string);
    setDraft(beforeText+string+afterText);
    const history = {
      "before" : selectedText,
      "after" : string,
      "suggests" : suggests
    };
    const historyListTmp = historyList;
    historyListTmp.push(history);
    console.log(historyListTmp);
    setHistoryList(historyListTmp);
    setHistoryListJson(JSON.stringify(historyListTmp, null, 2))
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
        <div>
          <button onClick={handleSelectedTextSubmit}>送信</button>
        </div>

        <h2>与えられた選択肢</h2>
        <div>
          {suggests.map((string, index) => (
            <button key={index} onClick={() => handleButtonClick(string)}>
              {string}
            </button>
          ))}
        </div>
        <div>
          <p>選択された文字列: {selectedSuggest}</p>
        </div>

        <h2>変更後の出力</h2>
        <p>{beforeText}<strong>{selectedSuggest}</strong>{afterText}</p>

        <div>
          <h2>JSON Code Block Example</h2>
          <CodeBlock code={historyListJson} />
        </div>
      </header>
    </div>
  );
}

export default App;