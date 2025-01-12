const express = require('express'); 
const WebSocket = require('ws'); 
const { downloadContent } = require('./downloader'); 
const { keywords } = require('./config'); 
const path = require('path'); 

const app = express(); 
const PORT = 3000; 
const WS_PORT = 3001; 

app.use(express.static(path.join(__dirname, '../client'))); 
app.use(express.json()); 

app.get('/urls', (req, res) => { 
    const keyword = req.query.keyword; 
    if (!keyword || !keywords[keyword]) { 
        return res.status(404).json({ error: 'Keyword not found' });
    }
    res.json({ urls: keywords[keyword] }); 
});

app.listen(PORT, () => { 
    console.log(`HTTP server running on http://localhost:${PORT}`);
});

const wsServer = new WebSocket.Server({ port: WS_PORT }); 

wsServer.on('connection', (ws) => { 
    console.log('WebSocket connection established');

    ws.on('message', async (message) => { 
        try {
            const { keyword, selectedUrl } = JSON.parse(message); 
            if (!keywords[keyword] || !keywords[keyword].includes(selectedUrl)) { 
                return ws.send(JSON.stringify({ error: 'Invalid keyword or URL' }));
            }

            await downloadContent(selectedUrl, (status) => { 
                ws.send(JSON.stringify(status));
            });
        } catch (error) {
            ws.send(JSON.stringify({ error: 'Error processing request' })); 
        }
    });

    ws.on('close', () => { 
        console.log('WebSocket connection closed');
    });
});

console.log(`WebSocket server running on ws://localhost:${WS_PORT}`); 
