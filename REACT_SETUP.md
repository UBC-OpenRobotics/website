# React + TypeScript Setup for Jekyll

This Jekyll website now uses React with TypeScript for interactive components.

## Project Structure

```
web_opbot/
├── src/                          # React TypeScript source files
│   ├── components/               # React components
│   │   └── Navigation.tsx        # Navigation component
│   ├── App.tsx                   # Main React app
│   ├── main.tsx                  # React entry point
│   └── vite-env.d.ts            # TypeScript declarations
├── assets/js/dist/               # Built JavaScript bundle (generated)
│   └── bundle.js                 # Compiled React app
├── _layouts/                     # Jekyll layouts
│   └── default.html              # Uses React bundle
├── package.json                  # Node dependencies
├── tsconfig.json                 # TypeScript config
└── vite.config.ts               # Vite build config
```

## How It Works

1. React components are written in TypeScript in the `src/` directory
2. Vite builds them into a single bundle at `assets/js/dist/bundle.js`
3. Jekyll includes this bundle in the HTML templates
4. Data flows from Jekyll to React via `window.navigationData`

## Development Workflow

### Initial Setup

```bash
npm install
```

### Building React Components

```bash
# Build for production
npm run build

# Build with watch mode for development
npm run dev
```

### Running Jekyll

```bash
# Serve Jekyll site
npm run jekyll:serve

# Build Jekyll site
npm run jekyll:build

# Full build (React + Jekyll)
npm run full:build
```

## Creating New React Components

1. Create a new `.tsx` file in `src/components/`
2. Import and use it in `src/App.tsx`
3. Run `npm run build` to compile
4. Jekyll will automatically include the updated bundle

### Example Component

```typescript
// src/components/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
}

const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return <h1>{title}</h1>;
};

export default MyComponent;
```

## Passing Data from Jekyll to React

In your Jekyll layout, add a script tag before the React root:

```html
<div id="my-react-component"></div>
<script>
  window.myData = {
    {% for item in site.data.something %}
    // Your Jekyll data here
    {% endfor %}
  };
</script>
```

Then access it in your React component:

```typescript
const myData = (window as any).myData;
```

## Files Modified

- [_layouts/default.html](_layouts/default.html) - Added React bundle and root div
- [_config.yml](_config.yml) - Excluded Node.js files from Jekyll build
- [.gitignore](.gitignore) - Ignored node_modules and build artifacts

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS (via CDN)
- **Jekyll** - Static site generator
