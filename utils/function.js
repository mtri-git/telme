function generateColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Mid lightness keeps white initials readable on top of the color
  const color = `hsl(${Math.abs(hash) % 360}, 55%, 45%)`;
  return color;
}

function timeDiff(time) {
  if (!time) return "";

  const now = new Date();
  const diff = now - new Date(time);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 6) {
    return new Date(time).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } else if (days > 0) {
    return days === 1 ? "Yesterday" : `${days} days ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  }
  return "Just now";
}

function showContent(content) {
  if (!content) return "";

  if (content.length > 40) {
    return content.slice(0, 40) + "...";
  }
  return content;
}

function getHelloString() {
  // check if now is morning or afternoon
  const now = new Date();
  const hours = now.getHours();
  if (hours < 12) {
    return "Good morning";
  } else if (hours < 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) || "";
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase() || "?";
}

export { getInitials, generateColorFromName, timeDiff, showContent, getHelloString };
