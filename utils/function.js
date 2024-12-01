function generateColorFromName(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 70%)`; // Tạo màu HSL
    return color;
  }

function timeDiff(time) {
    if(!time) return "";
    
    const now = new Date();
    const diff = now - new Date(time);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days} days ago`;
    } else if (hours > 0) {
        return `${hours} hours ago`;
    } else if (minutes > 0) {
        return `${minutes} minutes ago`;
    } else {
        if (seconds < 10) {
            return `Just now`;
        }
        return `${seconds} seconds ago`;
    }
}

function showContent(content) {
    if(!content) return "";

    if (content.length > 40) {
        return content.slice(0, 40) + "...";
    }
    return content;
}

export { generateColorFromName, timeDiff, showContent };