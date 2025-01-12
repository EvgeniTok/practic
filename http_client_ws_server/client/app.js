const keywordInput = document.getElementById('keyword');
const fetchUrlsButton = document.getElementById('fetchUrls');
const urlListDiv = document.getElementById('urlList');
const statusDiv = document.getElementById('status');
const downloadsDiv = document.getElementById('downloads');

fetchUrlsButton.addEventListener('click', async () => {
    const keyword = keywordInput.value.trim();
    if (!keyword) return alert('Please enter a keyword');

    const response = await fetch(`/urls?keyword=${keyword}`);
    const data = await response.json();

    if (data.error) {
        return alert(data.error);
    }

    urlListDiv.innerHTML = data.urls.map((url) => 
        `<button onclick="download('${url}')">${url}</button>`
    ).join('<br>');
});

function download(url) {
    const ws = new WebSocket('ws://localhost:3001');
    
    ws.onopen = () => {
        ws.send(JSON.stringify({ keyword: keywordInput.value, selectedUrl: url }));
    };

    ws.onmessage = (event) => {
        const status = JSON.parse(event.data);
        if (status.error) {
            alert(status.error);
        } else {
            statusDiv.textContent = `Downloading: ${status.progress}% (${status.downloaded}/${status.total})`;
            if (status.progress === 100) {
                downloadsDiv.innerHTML += `<p>Downloaded: ${url}</p>`;
            }
        }
    };
}
