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

- Icons are fetched from the Simple Icons CDN (jsDelivr)
- SVG paths are extracted and rendered with custom colors
- Icons maintain their 24x24 viewBox for proper scaling
- Caching is implemented for better performance

## License

This plugin uses Simple Icons, which are licensed under CC0-1.0 (Public Domain).
