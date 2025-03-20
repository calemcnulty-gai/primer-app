# Guide to Using the `--localhost` Flag with Expo

This guide explains how to work with Expo's `--localhost` flag when connecting your Android device to your development environment.

## What is the `--localhost` Flag?

When you use `--localhost` with `expo start`, Expo does something special:

1. It automatically replaces all 'localhost' URLs in your app with your computer's actual IP address
2. It serves the development build over your local network instead of just on the loopback interface
3. It allows physical devices on the same network to connect to your development server

## Requirements

For this to work properly:

1. Your Android device must be on the same network as your development computer
2. Your computer's firewall must allow incoming connections on the Expo port (19000), API port (3000), and PipeCat port (8000)
3. Your API server must be bound to `0.0.0.0` (all interfaces), not just `127.0.0.1` or `localhost`
4. If using the PipeCat chat, the PipeCat API server should also be bound to `0.0.0.0`

## API Server Configuration

The most common issue when using `--localhost` is that the API server is only bound to `localhost` or `127.0.0.1`, which means it's not accessible from other devices on the network.

To fix this:

1. Start your API server with the `--host 0.0.0.0` flag (or equivalent for your server)
2. We've created a script to help with this: `npm run api:start`

### PipeCat API Server

For the PipeCat chat feature to work properly:

1. Start the PipeCat API server bound to all interfaces (e.g., `--host 0.0.0.0`)
2. The app looks for the PipeCat API server at `http://localhost:8000`
3. Make sure your PipeCat API key is set in the app.config.js file or as an environment variable `PIPECAT_API_KEY`

## Available Commands

We've set up several helpful npm scripts to work with the `--localhost` flag:

```
npm run android          # Start the Android app with the --localhost flag
npm run android:clean    # Clear cache and start the Android app with --localhost
npm run api:start        # Start the API server bound to all interfaces (0.0.0.0)
npm run dev              # Start both the API server and the Android app in one command
```

## Troubleshooting

### 1. Network Request Failed

If you see "Network request failed" errors:

- Make sure your API server is running and bound to `0.0.0.0`
- Check that your computer's firewall allows incoming connections on port 3000
- Verify that both your device and computer are on the same network
- Try running `npm run dev` which starts both the API server and the app

For PipeCat-specific network errors:
- Ensure the PipeCat API server is running and bound to `0.0.0.0:8000`
- Verify your PipeCat API key is correctly set in the app.config.js file or as an environment variable
- Check the console logs for detailed error messages from the PipeCat client

### 2. Cannot Connect to Metro Server

If your device can't connect to the Metro bundler:

- Make sure your computer's firewall allows incoming connections on port 19000
- Verify that both your device and computer are on the same network
- Try scanning the QR code with Expo Go again

### 3. Finding Your Computer's IP Address

To manually check your computer's IP address:

**On macOS:**
```
ipconfig getifaddr en0  # For WiFi
```

**On Windows:**
```
ipconfig
```
Look for the "IPv4 Address" under your active network adapter.

**On Linux:**
```
ip addr show
```
Look for the inet value on your primary network interface.

## How Our Code Handles `--localhost`

In our app:

1. We set all API URLs to use `http://localhost:3000`
2. When running with `--localhost`, Expo automatically replaces this with your machine's actual IP
3. Our API service has special handling for Android to ensure it works with the `--localhost` flag

## Starting Everything Together

For the best experience, use:

```
npm run dev
```

This will:
1. Start your API server bound to all interfaces (`0.0.0.0:3000`)
2. Clear the Expo cache and start the Android app with the `--localhost` flag
3. Automatically terminate both processes when you press Ctrl+C 