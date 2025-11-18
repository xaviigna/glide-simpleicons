/**
 * Glide Plugin Function for Simple Icons
 * Renders Simple Icons with customizable color and size
 * Based on Loqode icons plugin pattern
 */

console.log('Simple Icons function.js loaded');

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

// Main function for Glide - same pattern as Loqode
window.function = async function(iconName, color, size) {
	// Get values or set defaults (same pattern as Loqode)
	iconName = iconName?.value || iconName || "";
	color = color?.value || color || "#000000";
	size = size?.value || size || "24";
	
	if (!iconName) {
		return "";
	}
	
	// Convert icon name to slug
	const slug = titleToSlug(iconName);
	
	// Construct the URL to the SVG file (same approach as Loqode)
	const svgUrl = `https://xaviigna.github.io/glide-simpleicons/assets/simple/${slug}.svg`;
	
	try {
		// Fetch the SVG file from the URL (same as Loqode)
		const response = await fetch(svgUrl);
		let svgContent = await response.text();
		
		// Modify SVG content: set fill color (same approach as Loqode)
		svgContent = svgContent.replace(/fill="[^"]*"/g, `fill="${color}"`);
		
		// Remove existing width/height and add new size
		const sizeNum = typeof size === 'string' ? parseInt(size, 10) || 24 : size || 24;
		svgContent = svgContent.replace(/\s*width\s*=\s*"[^"]*"/gi, '');
		svgContent = svgContent.replace(/\s*height\s*=\s*"[^"]*"/gi, '');
		svgContent = svgContent.replace(
			/<svg([^>]*?)>/,
			`<svg$1 width="${sizeNum}" height="${sizeNum}">`
		);
		
		// Encode the modified SVG to a Data URL (same as Loqode)
		let svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
		return svgDataUrl;
	} catch (error) {
		console.error('Failed to fetch or process the SVG:', error);
		return ""; // Return empty on error (same as Loqode)
	}
}

