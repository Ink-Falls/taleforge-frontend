/**
 * WebSocket polyfills for browser compatibility
 * Addresses common issues with sockjs-client and @stomp/stompjs in browser environments
 */

// Fix for "global is not defined" error in sockjs-client
if (typeof global === 'undefined') {
  window.global = window;
}

// Fix for Buffer not being defined in the browser
if (typeof global.Buffer === 'undefined') {
  global.Buffer = {};
}

// Fix for process not being defined in the browser
if (typeof global.process === 'undefined') {
  global.process = {
    env: { DEBUG: undefined },
    nextTick: function(callback) {
      setTimeout(callback, 0);
    }
  };
}

// WebSocket compatibility
if (typeof window.WebSocket === 'undefined' && typeof global.WebSocket !== 'undefined') {
  window.WebSocket = global.WebSocket;
} else if (typeof global.WebSocket === 'undefined' && typeof window.WebSocket !== 'undefined') {
  global.WebSocket = window.WebSocket;
}

console.log('Socket polyfills loaded');
