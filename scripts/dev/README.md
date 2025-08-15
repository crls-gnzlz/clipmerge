# ClipChain - Video Clip Management Platform

A modern, elegant platform for creating, managing, and sharing video clips from YouTube videos.

## 🎯 Features

- **Video Analysis**: Automatic YouTube video metadata extraction
- **Clip Creation**: Precise time-based video clipping with embedded player
- **Clip Management**: Organize and categorize your video clips
- **Embeddable Players**: Share clips on any website
- **Modern UI**: Clean, professional interface with consistent design

## 🎨 Design System

This project follows a comprehensive **Design System** to ensure visual consistency and design excellence across all components and pages.

### 📚 Design Documentation

- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - Complete design guidelines and standards
- **Component Library** - Reusable UI components with consistent styling
- **Color Palette** - Defined color scheme for primary, secondary, and semantic colors
- **Typography** - Font hierarchy and text styling standards

### 🚀 Key Design Principles

- **Consistency**: Unified visual language across all components
- **Accessibility**: WCAG compliant with proper contrast and keyboard navigation
- **Mobile-First**: Responsive design that works on all devices
- **Performance**: Smooth animations and efficient interactions

## 🛠️ Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS with custom design tokens
- **Backend**: Node.js + Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT-based auth system

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB 6+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/clipchain.git
   cd clipchain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:9000

## 📁 Project Structure

```
clipchain/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── SelectField.jsx  # Custom select component
│   │   └── ...
│   ├── pages/              # Application pages
│   │   ├── CreateClip.jsx  # Clip creation interface
│   │   └── ...
│   └── ...
├── server/                 # Backend API
├── DESIGN_SYSTEM.md        # Design guidelines
└── README.md              # This file
```

## 🎨 Design Implementation

### Before Creating New Components

1. **Consult the Design System**: Review [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
2. **Follow Established Patterns**: Use existing component styles as reference
3. **Maintain Consistency**: Apply the defined color palette and typography
4. **Consider Accessibility**: Implement proper focus states and ARIA labels

### Component Standards

- **Form Fields**: Consistent input styling with validation states
- **Buttons**: Primary, secondary, and action button variants
- **Cards**: Standardized container styling with proper spacing
- **Typography**: Hierarchical text system for clear information architecture

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

### Code Style

- **ESLint**: JavaScript/JSX linting
- **Prettier**: Code formatting
- **Tailwind CSS**: Utility-first CSS approach
- **React Hooks**: Modern React patterns

## 📱 Responsive Design

The application follows a **mobile-first approach**:

- **Mobile**: Optimized for touch interactions
- **Tablet**: Enhanced layouts for medium screens
- **Desktop**: Full-featured experience with advanced controls

## ♿ Accessibility

- **WCAG 2.1 AA** compliance
- **Keyboard navigation** support
- **Screen reader** compatibility
- **High contrast** ratios
- **Focus indicators** for all interactive elements

## 🎯 Contributing

### Design Contributions

1. **Follow the Design System**: All changes must adhere to established guidelines
2. **Maintain Consistency**: Ensure new components match existing patterns
3. **Test Accessibility**: Verify keyboard navigation and screen reader support
4. **Update Documentation**: Keep the Design System current with new patterns

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Follow the design guidelines
4. Test across different devices
5. Submit a pull request

## 📚 Documentation

- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - Complete design guidelines
- **[API Documentation](./server/README.md)** - Backend API reference
- **[Component Library](./src/components/)** - Reusable UI components

## 🤝 Support

- **Issues**: Report bugs and feature requests on GitHub
- **Discussions**: Join community discussions
- **Documentation**: Check the Design System for implementation guidance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎨 Design Philosophy

**"Design is not just what it looks like and feels like. Design is how it works."** - Steve Jobs

Our design system ensures that every component not only looks beautiful but also functions intuitively, providing users with a seamless and delightful experience across all devices and contexts.

---

*Built with ❤️ and a commitment to design excellence*
