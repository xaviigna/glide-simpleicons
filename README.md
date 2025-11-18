# Simple Icons - Glide Plugin

A Glide plugin that allows you to use icons from [Simple Icons](https://simpleicons.org/) - a free collection of brand icons. Customize the icon name, color, and size directly in Glide.

Created by [@xaviigna](https://github.com/xaviigna)

## Features

- 🎨 **3000+ Brand Icons** - Access all icons from the Simple Icons collection
- 🎨 **Customizable Color** - Set any color using hex codes or color names
- 📏 **Adjustable Size** - Control the icon size from 8px to 512px
- 🔍 **Easy Search** - Autocomplete helps you find the right icon
- ⚡ **Fast Loading** - Icons are loaded from CDN with caching

## Files

- `glide.json` - Plugin configuration for Glide
- `driver.js` - UI driver that creates the plugin interface
- `function.js` - Core function that renders the icons
- `index.html` - Preview page to test the plugin locally
- `assets/simple` - Local copy of the Simple Icons SVGs used when hosting the assets yourself

## Usage in Glide

1. **Install the Plugin**
   - Upload the plugin files to your Glide app
   - Configure the plugin in Glide's plugin settings

2. **Use the Function**
   - Call `renderIcon(iconName, color, size)`
   - Parameters:
     - `iconName` (required): The name of the icon (e.g., "Google", "GitHub", "React")
     - `color` (optional): Hex color code or color name (default: "#000000")
     - `size` (optional): Size in pixels (default: 24)

3. **Examples**
   ```javascript
   // Basic usage
   renderIcon("Google")
   
   // With color
   renderIcon("GitHub", "#181717")
   
   // With color and size
   renderIcon("React", "#61DAFB", 48)
   ```

## Local Preview

Open `index.html` in a browser to preview and test the plugin locally.

## Icon Names

Icons are identified by their brand name. Some examples:
- Google
- GitHub
- React
- Apple
- Microsoft
- Facebook
- Twitter
- Instagram
- And 3000+ more!

You can find all available icons at [simpleicons.org](https://simpleicons.org/).

## Technical Details

- Icons are bundled from the official [`simple-icons`](https://github.com/simple-icons/simple-icons) repo (see `assets/simple`)
- By default the plugin fetches icons from `https://xaviigna.github.io/glide-simpleicons/assets/simple`
- Set `window.SIMPLE_ICONS_BASE_URL` before loading `function.js` if you host the assets elsewhere
- SVGs are recolored, resized, and returned as base64 data URLs so Glide columns resolve instantly
- A tiny in-memory cache prevents repeat network calls inside the Experimental Code runtime

## License

This plugin uses Simple Icons, which are licensed under CC0-1.0 (Public Domain).
