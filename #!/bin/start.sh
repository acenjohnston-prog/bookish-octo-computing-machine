#!/bin/bash

echo "⚙️ Initializing Eaglercraft Cloud Bridge boot sequence..."

# Verify node modules are correctly installed before spinning up the proxy loop
if [ ! -d "node_modules" ]; then
    echo "📦 Node modules directory not found. Executing dependency synchronization..."
    npm install
fi

echo "🟢 Boot sequence ready. Executing runtime process engine..."
# Execute the optimized binary socket stream server
exec node server.js
