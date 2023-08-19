import React, { useState, useLayoutEffect, useRef } from 'react';
import axios from 'axios';
import {
  AppBar,
  Box,
  Button,
  Container,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';


import { alpha, styled, ThemeProvider, createTheme } from '@mui/material/styles'

const QueryTextField = styled((props) => (
  <TextField InputProps={{ disableUnderline: true }} {...props} />
))(({ theme }) => ({
  '& .MuiFilledInput-root': {
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: theme.palette.mode === 'light' ? '#F3F6F9' : '#1A2027',
    border: '1px solid',
    borderColor: theme.palette.mode === 'light' ? '#E0E3E7' : '#2D3843',
    transition: theme.transitions.create([
      'border-color',
      'background-color',
      'box-shadow',
    ]),
    '&:hover': {
      backgroundColor: 'transparent',
    },
    '&.Mui-focused': {
      backgroundColor: 'transparent',
      boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 2px`,
      borderColor: theme.palette.primary.main,
    },
  },
}));


const CodeBlock = ({ code }) => {
  return (
    <Paper variant="outlined" sx={{backgroundColor: '#f0f0f0', overflowX: 'auto', m: 2, p: 2}}>
      <Typography variant="body2" component="pre">
        {code}
      </Typography>
    </Paper>
  );
};

function App() {
  // For global theme
  const theme = createTheme({
    palette: {
      primary: {
        light: '#757ce8',
        main: '#3f50b5',
        dark: '#002884',
        contrastText: '#fff',
      },
      secondary: {
        light: '#ff7961',
        main: '#f44336',
        dark: '#ba000d',
        contrastText: '#000',
      },
    },
  });
  
  const queryUrl = "http://127.0.0.1:50050/query"; //TODO: .envから取得
  const suggestUrl = "http://127.0.0.1:50050/suggest"; //TODO: .envから取得

  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [suggests, setSuggests] = useState([]);
  const [selectedSuggest, setSelectedSuggest] = useState('');
  const [historyList, setHistoryList] = useState([]);
  const [historyListJson, setHistoryListJson] = useState(JSON.stringify([], null, 2));

  // For menu
  const [selectionEnd, setSelectionEnd] = useState(0);
  const textareaRef = useRef();
  const [contextMenu, setContextMenu] = useState(null);

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


  const handleContextMenu = async (event) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX,
            mouseY: event.clientY + 10
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null
    );
    const selectionStart = textareaRef.current.selectionStart;
    const selectionEnd = textareaRef.current.selectionEnd;
    const text = draft.slice(selectionStart, selectionEnd);
    if (text.length > 0){
      const maskedDraft = `${draft.substring(
        0,
        selectionStart
      )}__${draft.substring(selectionEnd, draft.length)}`;

      try {
        const response = await axios.post(suggestUrl, {
          selected_text: text,
          draft: maskedDraft,
          n: 10
        });
        setSelectedText(text);
        setSuggests(response.data.suggest);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleClose = () => {
    setContextMenu(null);
  };


  useLayoutEffect(() => {
    //Sets the cursor at the end of inserted text
    textareaRef.current.selectionEnd = selectionEnd;
  }, [selectionEnd]);


  const handleButtonClick = (string) => {
    const selectionStart = textareaRef.current.selectionStart;
    const selectionEnd = textareaRef.current.selectionEnd;

    const newDraft = `${draft.substring(
      0,
      selectionStart
    )}${string}${draft.substring(selectionEnd, draft.length)}`;

    setSelectedSuggest(string);
    setDraft(newDraft);
    const history = {
      "before" : selectedText,
      "after" : string,
      "suggests" : suggests
    };
    const historyListTmp = historyList;
    historyListTmp.push(history);
    console.log(historyListTmp);
    setHistoryList(historyListTmp);
    setHistoryListJson(JSON.stringify(historyListTmp, null, 2));
    handleClose();
  };


  return (
    <>
      <ThemeProvider theme={theme}>
        <AppBar position="relative">
          <Toolbar>
            <Typography variant="h6" color="inherit" noWrap>
              サービス名
            </Typography>
          </Toolbar>
        </AppBar>
        <main>
          <Box
            sx={{
              bgcolor: 'background.paper',
              pt: 4,
              pb: 4,
            }}
          >
            <Paper
              // variant="outlined"
              sx={{
                mx:30,
                px:2,
                py:2
            }}>
              <Container maxWidth="md">
                <Typography variant="h6" color="inherit" noWrap>
                  質問文
                </Typography>
                <QueryTextField
                  fullWidth
                  variant="filled"
                  label="ここに入力してください"
                  InputLabelProps={{ shrink: true }}
                  multiline
                  rows={4}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  sx={{mt:2}}
                />
                <Button
                  variant="contained"
                  align="right"
                  sx={{my:1}}
                  onClick={handleQuerySubmit}
                >
                    質問文を送信
                </Button>
              </Container>
            </Paper>
          </Box>

          <Box
            sx={{
              bgcolor: 'background.paper',
              pt: 2,
            }}
          >
            <Paper
              // variant="outlined"
              sx={{
                mx:30,
                px:2,
                py:2
            }}>
              <Container maxWidth="md">
                <Typography variant="h6" color="inherit" noWrap>
                  出力結果
                </Typography>
                <Box onContextMenu={handleContextMenu}>
                  <TextField
                    label=""
                    variant="outlined"
                    color="grey"
                    value={draft}
                    fullWidth
                    multiline
                    minrows={10}
                    rows={10}
                    focused
                    inputRef={textareaRef}
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{mt:2, mb:2}}
                  />
                  <Menu
                    open={contextMenu !== null}
                    onClose={handleClose}
                    anchorReference="anchorPosition"
                    anchorPosition={
                      contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                    }
                  >
                    {suggests.map((string, index) => (
                      <MenuItem key={index} onClick={() => handleButtonClick(string)}>
                        {string}
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              </Container>
            </Paper>
          </Box>
          <Box
            sx={{
              bgcolor: 'background.paper',
              mt: 4,
            }}
          >
            <Paper
              // variant="outlined"
              sx={{
                mx:30,
                px:2,
                py:2
            }}>
              <Container maxWidth="md">
                <Typography variant="h6" color="inherit" noWrap>
                  変更履歴
                </Typography>
                <CodeBlock code={historyListJson} />
              </Container>
            </Paper>
          </Box>
        </main>
      </ThemeProvider>
    </>
  );
}

export default App;