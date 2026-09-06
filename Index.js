const WebSocket = require('ws');
const net = require('net');

const FALIX_IP = 'ifkfhy.falixsrv.me'; // Your Falix Server IP
const FALIX_PORT = 25536;                  // Your Falix Port
const PORT = process.env.PORT || 8080;     // Cloud provider's web port

const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (ws) => {
    // Open a direct TCP socket to your Falix server
    const tcpClient = new net.Socket();
    
    tcpClient.connect(FALIX_PORT, FALIX_IP, () => {
        // Direct stream piping
        ws.on('message', (message) => tcpClient.write(message));
        tcpClient.on('data', (data) => ws.send(data));
    });

    ws.on('close', () => tcpClient.end());
    tcpClient.on('close', () => ws.close());
    tcpClient.on('error', () => ws.close());
    ws.on('error', () => tcpClient.end());
});
