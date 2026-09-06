const WebSocket = require('ws');
const net = require('net');

// 🔴 CONFIGURATION: PASTE YOUR FALIXNODES ENDPOINT DETAILS HERE
const FALIX_IP = '162.55.100.208:25536'; 
const FALIX_PORT = 25536;                  

const PORT = process.env.PORT || 8080;     

const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`🚀 Eaglercraft Web-Bridge deployed on port ${PORT}`);
    console.log(`🎯 Routing targeted traffic directly to: ${FALIX_IP}:${FALIX_PORT}`);
});

wss.on('connection', (ws) => {
    console.log('🔌 Inbound client connection established via Browser.');
    
    // Instantiate a direct raw TCP stream socket straight to FalixNodes
    const tcpClient = new net.Socket();
    
    tcpClient.connect(FALIX_PORT, FALIX_IP, () => {
        console.log('✅ Connection established with FalixNodes. Initializing data pipe.');
        
        // CRITICAL FOR EAGLERCRAFT: Bind WebSocket data incoming events to process buffer streams
        ws.on('message', (message, isBinary) => {
            if (tcpClient.writable) {
                // Ensure data payload preserves original Minecraft protocol framing format
                const packetData = isBinary ? message : Buffer.from(message);
                tcpClient.write(packetData);
            }
        });

        // Forward Minecraft Java binary streams back to browser frame allocations
        tcpClient.on('data', (data) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(data, { binary: true });
            }
        });
    });

    // Handle session teardowns cleanly to avoid orphaned ports
    ws.on('close', () => {
        console.log('❌ Browser client closed websocket session.');
        tcpClient.end();
    });
    
    tcpClient.on('close', () => {
        console.log('❌ FalixNodes backend server dropped packet transmission.');
        ws.close();
    });

    // Capture execution exceptions safely to maintain 24/7 web app uptime
    ws.on('error', (err) => {
        console.error('⚠️ WebSocket Client Exception:', err.message);
        tcpClient.end();
    });
    
    tcpClient.on('error', (err) => {
        console.error('⚠️ Falix Backend Infrastructure Network Exception:', err.message);
        ws.close();
    });
});
