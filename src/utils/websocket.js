// src/utils/websocket.js
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

/**
 * Create and configure a STOMP client over SockJS
 * @param {string} serverUrl - WebSocket server URL
 * @param {object} options - Configuration options
 * @returns {Client} Configured STOMP client
 */
export const createStompClient = (serverUrl, options = {}) => {
  const client = new Client({
    webSocketFactory: () => new SockJS(serverUrl),
    debug: (str) => {
      if (options.debug) {
        console.log('STOMP:', str);
      }
    },
    reconnectDelay: options.reconnectDelay || 5000,
    heartbeatIncoming: options.heartbeatIncoming || 4000,
    heartbeatOutgoing: options.heartbeatOutgoing || 4000
  });

  return client;
};

/**
 * Subscribe to a topic with error handling
 * @param {Client} client - STOMP client
 * @param {string} topic - Topic to subscribe to
 * @param {function} callback - Message handler
 * @param {function} onError - Error handler
 * @returns {object} Subscription
 */
export const safeSubscribe = (client, topic, callback, onError) => {
  try {
    if (client.connected) {
      return client.subscribe(topic, callback, { id: `sub-${Math.random().toString(36).substring(2, 9)}` });
    } else {
      console.warn('Attempted to subscribe while disconnected:', topic);
      return null;
    }
  } catch (error) {
    console.error(`Error subscribing to ${topic}:`, error);
    if (onError) onError(error);
    return null;
  }
};

/**
 * Send a message with error handling
 * @param {Client} client - STOMP client
 * @param {string} destination - Destination endpoint
 * @param {object} body - Message body
 * @param {object} headers - Message headers
 * @returns {boolean} Success status
 */
export const safeSend = (client, destination, body, headers = {}) => {
  try {
    if (client.connected) {
      client.publish({
        destination,
        body: JSON.stringify(body),
        headers
      });
      return true;
    } else {
      console.warn('Attempted to send message while disconnected:', destination);
      return false;
    }
  } catch (error) {
    console.error(`Error sending to ${destination}:`, error);
    return false;
  }
};