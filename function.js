/**
 * Glide Plugin Function for Simple Icons
 * Renders Simple Icons with customizable color and size
 * Based on Loqode icons plugin pattern
 */

console.log('Simple Icons function.js loaded');

// Test that code is executing
try {
	console.log('Code execution test - defining functions...');
} catch (e) {
	console.error('Error in function.js:', e);
}

// Convert title to slug (matching simple-icons naming convention)
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

// Render Simple Icon - returns data URL for Glide
// According to README: cdn.simpleicons.org returns complete SVG images
async function renderSimpleIcon(iconName, color = '#000000', size = 24) {
	if (!iconName) {
		return "";
	}
	
	const sizeNum = typeof size === 'string' ? parseInt(size, 10) || 24 : size || 24;
	const slug = titleToSlug(iconName);
	
	try {
		// Use Simple Icons CDN - it returns complete SVG images
		// Format: https://cdn.simpleicons.org/[SLUG]/[COLOR]
		const colorCode = color.replace('#', '');
		const cdnUrl = `https://cdn.simpleicons.org/${slug}/${colorCode}`;
		
		// Fetch the SVG from CDN
		let response = await fetch(cdnUrl);
		
		// Fallback to jsDelivr if CDN fails
		if (!response.ok) {
			const jsDelivrUrl = `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`;
			response = await fetch(jsDelivrUrl);
			if (!response.ok) {
				throw new Error(`Icon not found: ${iconName} (slug: ${slug})`);
			}
		}
		
		let svgContent = await response.text();
		
		// Validate we got a complete SVG
		if (!svgContent || !svgContent.trim()) {
			throw new Error('Empty SVG content');
		}
		
		if (!svgContent.includes('</svg>')) {
			throw new Error('SVG missing closing tag');
		}
		
		// If from jsDelivr (not CDN), apply color manually
		if (!cdnUrl.includes('cdn.simpleicons.org') || !response.ok) {
			svgContent = svgContent.replace(/fill="[^"]*"/g, `fill="${color}"`);
		}
		
		// Add width and height attributes
		// Remove existing width/height first
		svgContent = svgContent.replace(/\s*width\s*=\s*"[^"]*"/gi, '');
		svgContent = svgContent.replace(/\s*height\s*=\s*"[^"]*"/gi, '');
		
		// Add new width and height
		svgContent = svgContent.replace(
			/<svg([^>]*?)>/,
			`<svg$1 width="${sizeNum}" height="${sizeNum}">`
		);
		
		// Convert to base64 data URL (Glide needs data URL, not regular URL)
		const base64 = btoa(unescape(encodeURIComponent(svgContent)));
		return `data:image/svg+xml;base64,${base64}`;
		
	} catch (error) {
		console.error('Error rendering icon:', error);
		return "";
	}
}

// Main function for Glide
console.log('About to define window.function...');
window.function = async function(iconName, color, size) {
	console.log('=== window.function called by Glide ===');
	console.log('Raw params:', { iconName, color, size });
	
	// Handle column references from Glide
	iconName = iconName?.value ?? iconName ?? "";
	color = color?.value ?? color ?? "#000000";
	size = size?.value ?? size ?? "24";
	
	iconName = String(iconName).trim();
	color = String(color).trim() || "#000000";
	size = String(size).trim() || "24";
	
	console.log('Parsed params:', { iconName, color, size });
	
	if (!iconName) {
		console.warn('No icon name provided');
		return "";
	}
	
	const result = await renderSimpleIcon(iconName, color, size);
	console.log('Returning result, length:', result ? result.length : 0);
	return result;
}

// Export for testing
window.renderSimpleIcon = renderSimpleIcon;

// Log that everything is set up
console.log('window.function defined:', typeof window.function);
console.log('window.renderSimpleIcon defined:', typeof window.renderSimpleIcon);
