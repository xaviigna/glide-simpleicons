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
		// Convert icon name to slug
		const slug = titleToSlug(iconName);
		
		// Use Simple Icons CDN service which handles colors (per their docs)
		// Format: https://cdn.simpleicons.org/[ICON SLUG]/[COLOR]
		// Remove # from color if present
		const colorCode = color.replace('#', '');
		const cdnUrl = `https://cdn.simpleicons.org/${slug}/${colorCode}`;
		
		console.log('Fetching from Simple Icons CDN:', cdnUrl);
		
		// Fetch the colored SVG from Simple Icons CDN
		const response = await fetch(cdnUrl);
		if (!response.ok) {
			throw new Error(`Icon not found: ${iconName} (tried slug: ${slug})`);
		}
		
		let svgContent = await response.text();
		
		// Modify SVG to add size (CDN doesn't support size parameter)
		// Replace viewBox and add width/height
		svgContent = svgContent.replace(
			/<svg([^>]*)>/,
			`<svg$1 width="${sizeNum}" height="${sizeNum}">`
		);
		
		// Convert SVG to data URL (base64 encoded - same as Loqode plugin)
		const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
		
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
// Following the same pattern as Loqode icons plugin
window.function = async function(iconName, color, size) {
	console.log('=== Simple Icons Plugin Called ===');
	console.log('Raw parameters:', { iconName, color, size });
	
	// Get values or set defaults (same pattern as Loqode)
	iconName = iconName?.value || iconName || "";
	color = color?.value || color || "#000000";
	size = size?.value || size || "24";
	
	console.log('Parsed parameters:', { iconName, color, size });
	
	// If no icon name, return empty
	if (!iconName) {
		console.warn('Simple Icons: No icon name provided');
		return "";
	}
	
	try {
		console.log('Fetching icon:', iconName);
		// Call the render function
		const result = await renderSimpleIcon(iconName, color, size);
		console.log('Icon result:', result ? `Success (${result.length} chars)` : 'Empty');
		return result || "";
	} catch (error) {
		console.error('=== Simple Icons Error ===');
		console.error('Failed to fetch or process the SVG:', error);
		console.error('Error details:', error.message, error.stack);
		return ""; // Return empty on error
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

