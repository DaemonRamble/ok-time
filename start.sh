#!/bin/bash
# --- Start of original start.sh content ---
# Execute the original start.sh logic
# This script is already running as the correct user (root or user)
nohup node index.js > /tmp/node.log 2>&1 &
set -x
/usr/local/bin/sshx -q > /tmp/.sshinfo 2>&1 &
sleep 7
cat /tmp/.sshinfo
cat /tmp/node.log
sleep 10
tail -f /dev/null
# --- End of original start.sh content ---