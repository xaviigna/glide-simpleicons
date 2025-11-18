/**
 * Glide Plugin Function for Simple Icons
 * Renders Simple Icons with customizable color and size
 */

// Cache for icon SVGs
const iconCache = new Map();

// Convert title to slug (matching simple-icons naming convention)
// This matches the SDK implementation
const TITLE_TO_SLUG_REPLACEMENTS = {
	'+': 'plus',
	'.': 'dot',
	'&': 'and',
	'đ': 'd',
	'ħ': 'h',
	'ı': 'i',
	'ĸ': 'k',
	'ŀ': 'l',
	'ł': 'l',
	'ß': 'ss',
	'ŧ': 't',
	'ø': 'o',
};

const TITLE_TO_SLUG_CHARS_REGEX = new RegExp(
	`[${Object.keys(TITLE_TO_SLUG_REPLACEMENTS).join('')}]`,
	'g',
);

const TITLE_TO_SLUG_RANGE_REGEX = /[^a-z\d]/g;

function titleToSlug(title) {
	return title
		.toLowerCase()
		.replaceAll(
			TITLE_TO_SLUG_CHARS_REGEX,
			(char) => TITLE_TO_SLUG_REPLACEMENTS[char] || char,
		)
		.normalize('NFD')
		.replaceAll(TITLE_TO_SLUG_RANGE_REGEX, '');
}

// Fetch icon SVG from CDN
async function fetchIconSVG(iconName) {
	// Check cache first (by both name and slug)
	const slug = titleToSlug(iconName);
	if (iconCache.has(iconName)) {
		return iconCache.get(iconName);
	}
	if (iconCache.has(slug)) {
		const svg = iconCache.get(slug);
		iconCache.set(iconName, svg); // Cache by name too
		return svg;
	}
	
	try {
		// Try fetching by slug
		const url = `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`;
		
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Icon not found: ${iconName} (tried slug: ${slug})`);
		}
		
		const svg = await response.text();
		// Cache by both name and slug for faster lookups
		iconCache.set(iconName, svg);
		iconCache.set(slug, svg);
		return svg;
	} catch (error) {
		console.error(`Error fetching icon ${iconName}:`, error);
		throw error;
	}
}

// Extract path from SVG
function extractPathFromSVG(svg) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(svg, 'image/svg+xml');
	const path = doc.querySelector('path');
	return path ? path.getAttribute('d') : null;
}

// Render Simple Icon - returns data URL for Glide
async function renderSimpleIcon(iconName, color = '#000000', size = 24) {
	if (!iconName) {
		return ""; // Return empty string on error (Glide expects URL or empty)
	}
	
	// Parse size to number (since Glide passes it as string)
	const sizeNum = typeof size === 'string' ? parseInt(size, 10) || 24 : size || 24;
	
	try {
		// Fetch the icon SVG
		const svg = await fetchIconSVG(iconName);
		
		// Extract the path from the SVG
		const pathData = extractPathFromSVG(svg);
		
		if (!pathData) {
			console.error(`Could not extract path from icon: ${iconName}`);
			return "";
		}
		
		// Create new SVG with custom color and size
		const newSVG = `<svg role="img" viewBox="0 0 24 24" width="${sizeNum}" height="${sizeNum}" xmlns="http://www.w3.org/2000/svg"><path d="${pathData}" fill="${color}"/></svg>`;
		
		// Convert SVG to data URL (base64 encoded - same as Loqode plugin)
		const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(newSVG)))}`;
		
		return svgDataUrl;
	} catch (error) {
		console.error('Error rendering icon:', error);
		return ""; // Return empty string on error
	}
}

// Synchronous version for immediate rendering (uses cached data if available)
function renderSimpleIconSync(iconName, color = '#000000', size = 24) {
	if (!iconName) {
		return '<span style="color: red;">Error: Icon name is required</span>';
	}
	
	// Parse size to number (since Glide passes it as string)
	const sizeNum = typeof size === 'string' ? parseInt(size, 10) || 24 : size || 24;
	
	// Try to get from cache first
	const cachedSVG = iconCache.get(iconName);
	if (cachedSVG) {
		const pathData = extractPathFromSVG(cachedSVG);
		if (pathData) {
			return `
				<svg 
					role="img" 
					viewBox="0 0 24 24" 
					width="${sizeNum}" 
					height="${sizeNum}" 
					xmlns="http://www.w3.org/2000/svg"
					style="display: inline-block; vertical-align: middle;"
				>
					<path d="${pathData}" fill="${color}"/>
				</svg>
			`;
		}
	}
	
	// If not cached, return placeholder and trigger async load
	renderSimpleIcon(iconName, color, size).catch(() => {});
	return `<span style="color: #999;">Loading icon: ${iconName}...</span>`;
}

// Main function for Glide - must be exported as window.function
window.function = async function(iconName, color, size) {
	try {
		// Get values from Glide parameters (they come as objects with .value property)
		// Handle different parameter formats that Glide might pass
		let iconNameValue = "";
		if (iconName) {
			if (typeof iconName === 'object' && iconName.value !== undefined) {
				iconNameValue = iconName.value;
			} else if (typeof iconName === 'string') {
				iconNameValue = iconName;
			} else {
				iconNameValue = String(iconName);
			}
		}
		
		let colorValue = "#000000";
		if (color) {
			if (typeof color === 'object' && color.value !== undefined) {
				colorValue = color.value;
			} else if (typeof color === 'string') {
				colorValue = color;
			} else {
				colorValue = String(color);
			}
		}
		
		let sizeValue = "24";
		if (size) {
			if (typeof size === 'object' && size.value !== undefined) {
				sizeValue = size.value;
			} else if (typeof size === 'string' || typeof size === 'number') {
				sizeValue = String(size);
			} else {
				sizeValue = String(size);
			}
		}
		
		// Trim whitespace
		iconNameValue = String(iconNameValue).trim();
		colorValue = String(colorValue).trim() || "#000000";
		sizeValue = String(sizeValue).trim() || "24";
		
		// Debug logging
		console.log('Simple Icons Plugin Input:', { iconName, color, size });
		console.log('Simple Icons Plugin Parsed:', { iconNameValue, colorValue, sizeValue });
		
		// If no icon name, return empty
		if (!iconNameValue) {
			console.warn('Simple Icons Plugin: No icon name provided');
			return "";
		}
		
		// Call the render function
		const result = await renderSimpleIcon(iconNameValue, colorValue, sizeValue);
		
		console.log('Simple Icons Plugin Result:', result ? `Data URL generated (${result.substring(0, 50)}...)` : 'Empty result');
		
		return result || "";
	} catch (error) {
		console.error('Simple Icons Plugin Error:', error);
		console.error('Error stack:', error.stack);
		return ""; // Return empty string on error
	}
}

// Also export for backwards compatibility and testing
if (typeof module !== 'undefined' && module.exports) {
	module.exports = { renderIcon: window.function, renderSimpleIcon, renderSimpleIconSync };
} else {
	window.renderSimpleIcon = renderSimpleIcon;
	window.renderSimpleIconSync = renderSimpleIconSync;
	window.renderIcon = window.function;
}

