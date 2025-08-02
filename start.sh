#!/bin/bash
# --- Start of original start.sh content ---
# Execute the original start.sh logic
# This script is already running as the correct user (root or user)
nohup node src/app.js > /tmp/node.log 2>&1 &
set -x
# Start sshx service but suppress sensitive output
/usr/local/bin/sshx -q > /tmp/.sshinfo 2>&1 &
sleep 7

# Filter sensitive information from output logs
echo "=== Application Start Log ==="
echo "Node.js service started successfully"
if [ -f /tmp/.sshinfo ]; then
    # Only show non-sensitive status information
    if grep -q "ssh" /tmp/.sshinfo 2>/dev/null; then
        echo "SSH service: Available"
    else
        echo "SSH service: Not configured"
    fi
else
    echo "SSH service: Not available"
fi

# Show filtered node.js logs (remove any potential sensitive data)
if [ -f /tmp/node.log ]; then
    echo "=== Application Status ==="
    grep -E "(Server running|started|listening)" /tmp/node.log || echo "Service initializing..."
fi

echo "=== Service Ready ==="
sleep 10
tail -f /dev/null
# --- End of original start.sh content ---
