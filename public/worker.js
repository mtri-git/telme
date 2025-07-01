// Simple Web Worker for handling non-blocking operations
self.onmessage = function(e) {
  const { type, data } = e.data;
  
  switch (type) {
    case 'PROCESS_MESSAGES':
      // Process message formatting or filtering without blocking main thread
      const processedMessages = data.messages.map(message => ({
        ...message,
        formatted: true,
        timestamp: new Date(message.created_at).toLocaleTimeString()
      }));
      
      self.postMessage({
        type: 'MESSAGES_PROCESSED',
        data: processedMessages
      });
      break;
      
    case 'PARSE_TIME_DIFF':
      // Handle time difference calculations
      const timeDiffs = data.timestamps.map(timestamp => {
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diff = now - messageTime;
        
        if (diff < 60000) return 'now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
        return `${Math.floor(diff / 86400000)}d`;
      });
      
      self.postMessage({
        type: 'TIME_DIFFS_CALCULATED',
        data: timeDiffs
      });
      break;
      
    default:
      self.postMessage({
        type: 'ERROR',
        data: 'Unknown task type'
      });
  }
};
