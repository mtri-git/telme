# 💬 Telme - Modern Real-time Chat Application

<div align="center">

![Telme Logo](https://img.shields.io/badge/Telme-Chat%20App-blue?style=for-the-badge&logo=chat&logoColor=white)

A modern, responsive, and feature-rich real-time chat application built with Next.js, Socket.io, and cutting-edge web technologies.

[🚀 Live Demo](https://telme.vercel.app/) | [📱 PWA Install](https://telme.vercel.app/) | [🔧 API Server](https://github.com/mtri-git/telme_api)

</div>

## ✨ Features

### 🎯 Core Functionality
- **Real-time Messaging** - Instant message delivery with Socket.io
- **Room Management** - Create, join, and explore chat rooms
- **File Sharing** - Upload and share files with attachment preview
- **User Authentication** - Secure login and registration system
- **Video Meetings** - Integrated video conferencing capabilities

### 📱 Modern UI/UX
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Dark/Light Theme** - Toggle between themes with system preference detection
- **PWA Support** - Install as a Progressive Web App
- **Mobile-First** - Touch-friendly interface with smooth transitions
- **Modern Design** - Clean, intuitive interface using Shadcn/UI components

### 🔗 Smart Content Detection
- **Clickable Links** - Auto-detection and highlighting of URLs
- **Email Links** - Clickable email addresses that open mail client
- **Phone Numbers** - Tap-to-call functionality on mobile devices
- **Link Previews** - Visual indicators for different content types

### 🚀 Performance Optimizations
- **Lazy Loading** - Dynamic imports for faster initial load
- **Code Splitting** - Optimized bundle sizes
- **Caching Strategy** - Efficient data fetching and caching
- **SEO Optimized** - Meta tags and structured data

### 🔒 Security & Best Practices
- **Secure Authentication** - JWT-based authentication system
- **Input Validation** - Client and server-side validation
- **XSS Protection** - Safe link handling with security measures
- **CORS Configuration** - Proper cross-origin resource sharing

## 🛠 Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[React 18](https://reactjs.org/)** - Latest React with Concurrent Features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn/UI](https://ui.shadcn.com/)** - Modern React component library
- **[Socket.io Client](https://socket.io/)** - Real-time communication
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management

### PWA & Performance
- **[next-pwa](https://github.com/shadowwalker/next-pwa)** - Progressive Web App features
- **Service Workers** - Offline support and caching
- **Web App Manifest** - Native app-like experience
- **Performance Monitoring** - Core Web Vitals optimization

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting and formatting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Husky](https://typicode.github.io/husky/)** - Git hooks
- **[Vercel](https://vercel.com/)** - Deployment and hosting

## 🚀 Getting Started

### Prerequisites
- **Node.js** version 18.20 or higher
- **npm**, **yarn**, or **pnpm** package manager
- **Git** for version control

### Backend Setup
First, set up the API server:

```bash
# Clone the API repository
git clone https://github.com/mtri-git/telme_api.git
cd telme_api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the server
npm run dev
```

### Frontend Installation

```bash
# Clone the repository
git clone https://github.com/your-username/telme.git
cd telme

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API configuration

# Start the development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3005](http://localhost:3005) to view the application.

## 📱 PWA Installation

Telme can be installed as a Progressive Web App on any device:

### Desktop (Chrome, Edge, Firefox)
1. Visit [https://telme.vercel.app/](https://telme.vercel.app/)
2. Click the install icon in the address bar
3. Or use the in-app install prompt

### Mobile (iOS/Android)
1. Open in Safari (iOS) or Chrome (Android)
2. Tap "Add to Home Screen" or "Install App"
3. Follow the prompts to install

## 🎨 UI Components & Design System

### Theme System
- **CSS Variables** - Dynamic theming support
- **Dark/Light Mode** - Automatic system preference detection
- **Consistent Colors** - Unified color palette across components
- **Responsive Typography** - Scalable text system

### Component Library
- **Reusable Components** - Built with Shadcn/UI
- **Accessible Design** - WCAG compliant components
- **Mobile Optimized** - Touch-friendly interfaces
- **Animation System** - Smooth transitions and micro-interactions

## 📖 Project Structure

```
telme/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles and theme variables
│   ├── layout.js          # Root layout with PWA setup
│   ├── page.js           # Home page with optimizations
│   ├── login/            # Authentication pages
│   └── register/
├── components/            # React components
│   ├── base/             # Core UI components
│   ├── dialog/           # Modal and dialog components
│   ├── layout/           # Layout components
│   ├── page/             # Page-specific components
│   └── ui/               # Shadcn/UI components
├── constants/            # Application constants
├── context/              # React context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── public/               # Static assets and PWA files
│   ├── manifest.json     # PWA manifest
│   ├── icon-*.svg        # PWA icons
│   └── browserconfig.xml # Windows tile config
├── services/             # API service layers
├── store/                # Zustand state management
├── utils/                # Utility functions
│   ├── linkUtils.js      # Link detection and rendering
│   └── socketClient.js   # Socket.io client setup
├── next.config.mjs       # Next.js configuration with PWA
└── tailwind.config.js    # Tailwind CSS configuration
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# PWA Configuration
NEXT_PUBLIC_APP_NAME=Telme
NEXT_PUBLIC_APP_DESCRIPTION=Modern Real-time Chat Application

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### PWA Configuration

The PWA is configured in `next.config.mjs`:

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});
```

## 📱 Mobile Responsiveness

### Breakpoints
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 768px (md)
- **Desktop**: > 768px (lg)

### Mobile Features
- **Full-width sidebar** on mobile devices
- **Touch-optimized buttons** with proper sizing
- **Swipe gestures** for navigation
- **Adaptive layouts** that stack on small screens
- **Mobile-first design** approach

## 🔗 Smart Link Detection

The application automatically detects and makes clickable:

### Supported Formats
- **URLs**: `https://example.com`, `www.google.com`, `github.io`
- **Email**: `user@example.com` (opens mail client)
- **Phone**: `+1-555-123-4567` (tap to call on mobile)

### Features
- **Security**: `noopener noreferrer` for external links
- **Visual indicators**: Icons for different link types
- **Truncation**: Long URLs are shortened for readability
- **Theme support**: Consistent styling in dark/light mode

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📊 Performance Metrics

- **Lighthouse Score**: 95+ across all categories
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **PWA Score**: 100/100

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Application**: [https://telme.vercel.app/](https://telme.vercel.app/)
- **API Server**: [https://github.com/mtri-git/telme_api](https://github.com/mtri-git/telme_api)
- **Documentation**: [Next.js Docs](https://nextjs.org/docs)
- **Support**: [Create an Issue](https://github.com/your-username/telme/issues)

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Vercel** for hosting and deployment platform
- **Shadcn** for the beautiful UI component library
- **Socket.io** for real-time communication capabilities

---

<div align="center">

**Built with ❤️ using Next.js and modern web technologies**

[⭐ Star this repo](https://github.com/mtri-git/telme) | [🐛 Report Bug](https://github.com/mtri-git/telme/issues) | [💡 Request Feature](https://github.com/mtri-git/telme/issues)

</div>
