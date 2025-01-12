const axios = require('axios'); 
const fs = require('fs'); 
const path = require('path'); 

async function downloadContent(url, onProgress) { 
    const response = await axios({ 
        url,
        method: 'GET',
        responseType: 'stream' 
    });

    const totalLength = response.headers['content-length']; 
    let downloaded = 0; 

    response.data.on('data', (chunk) => { 
        downloaded += chunk.length; 
        onProgress({ 
            url,
            progress: Math.round((downloaded / totalLength) * 100),
            downloaded,
            total: totalLength
        });
    });

    const fileName = path.basename(url); 
    const filePath = path.join(__dirname, '../downloads', fileName); 
    response.data.pipe(fs.createWriteStream(filePath)); 

    return new Promise((resolve) => { 
        response.data.on('end', () => resolve(filePath));
    });
}

module.exports = { downloadContent }; 

