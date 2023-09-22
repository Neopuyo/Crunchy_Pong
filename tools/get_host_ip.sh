#!/bin/bash

# WSL 2 specific command
if [ "$USER" = "draker" ]; then
	IP=$(powershell.exe -Command "(Get-NetIPAddress -InterfaceAlias 'Wi-Fi' -AddressFamily IPv4).IPAddress")

# macOS specific command
elif [[ "$OSTYPE" == "darwin"* ]]; then
  IP=$(ipconfig getifaddr en0)

# ubuntu specific command
else
	INTERFACE=$(ip route | awk '/default/ { print $5; exit }')
	IP=$(ip addr show "$INTERFACE" | awk '$1 == "inet" {gsub(/\/.*$/, "", $2); print $2}')
fi

echo "$IP"
