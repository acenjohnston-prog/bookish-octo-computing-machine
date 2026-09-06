const WebSocket = require('ws');
const net = require('net');

// 🔴 CHANGE THESE TO YOUR FALIXNODES SERVER DETAILS
const FALIX_IP = '162.55.100.208'; 
const FALIX_PORT = 25536;                  

// The cloud hosting platform will automatically inject the web port here
const PORT = process.env.PORT || 8080;     

const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`🚀 Eaglercraft Cloud Bridge running on web port ${PORT}`);
    console.log(`🔗 Target Minecraft Server: ${FALIX_IP}:${FALIX_PORT}`);
});

wss.on('connection', (ws) => {
    console.log('🔌 New player connecting from web client...');
    
    // Open a direct TCP pipe to your Falix server
    const tcpClient = new net.Socket();
    
    tcpClient.connect(FALIX_PORT, FALIX_IP, () => {
        console.log('✅ Connected to FalixNodes backend. Piping data stream...');
        
        // Pipe browser WebSocket data straight to Falix TCP
        ws.on('message', (message) => {
            if (tcpClient.writable) {
                tcpClient.write(message);
            }
        });

        // Pipe Falix TCP data straight back to browser WebSocket
        tcpClient.on('data', (data) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(data);
            }
        });
    });

    // Handle disconnections and stream cleanups
    ws.on('close', () => {
        console.log('❌ Web client disconnected.');
        tcpClient.end();
    });
    
    tcpClient.on('close', () => {
        console.log('❌ Falix server closed connection.');
        ws.close();
    });

    // Error handling to prevent the cloud server from crashing
    ws.on('error', (err) => {
        console.error('WebSocket Error:', err.message);
        tcpClient.end();
    });
    
    tcpClient.on('error', (err) => {
        console.error('Falix TCP Error:', err.message);
        ws.close();
    });
});
