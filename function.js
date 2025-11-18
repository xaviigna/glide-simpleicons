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

// Render Simple Icon - returns data URL for Glide
async function renderSimpleIcon(iconName, color = '#000000', size = 24) {
	if (!iconName) {
		return "";
	}
	
	const sizeNum = typeof size === 'string' ? parseInt(size, 10) || 24 : size || 24;
	const slug = titleToSlug(iconName);
	
	try {
		// Use Simple Icons CDN with color
		const colorCode = color.replace('#', '');
		const cdnUrl = `https://cdn.simpleicons.org/${slug}/${colorCode}`;
		
		let response = await fetch(cdnUrl);
		let fromCDN = response.ok;
		
		// Fallback to jsDelivr if CDN fails
		if (!response.ok) {
			const jsDelivrUrl = `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`;
			response = await fetch(jsDelivrUrl);
			if (!response.ok) {
				throw new Error(`Icon not found: ${iconName}`);
			}
		}
		
		let svgContent = await response.text();
		
		// If from jsDelivr (not CDN), apply color manually
		if (!fromCDN) {
			svgContent = svgContent.replace(/fill="[^"]*"/g, `fill="${color}"`);
		}
		
		// Validate SVG is complete before modifying
		if (!svgContent || !svgContent.trim()) {
			throw new Error('Empty SVG content');
		}
		
		if (!svgContent.includes('</svg>')) {
			throw new Error('SVG missing closing tag');
		}
		
		// Add/modify width and height - simple approach like Loqode
		// Remove existing width/height first to avoid duplicates
		svgContent = svgContent.replace(/\s*width\s*=\s*"[^"]*"/gi, '');
		svgContent = svgContent.replace(/\s*height\s*=\s*"[^"]*"/gi, '');
		
		// Add width and height to the opening svg tag
		svgContent = svgContent.replace(
			/<svg([^>]*?)>/,
			`<svg$1 width="${sizeNum}" height="${sizeNum}">`
		);
		
		// Log for debugging
		console.log('SVG length:', svgContent.length);
		console.log('SVG starts with:', svgContent.substring(0, 100));
		console.log('SVG ends with:', svgContent.substring(svgContent.length - 50));
		
		// Convert to base64 data URL (same as Loqode)
		const base64 = btoa(unescape(encodeURIComponent(svgContent)));
		const dataUrl = `data:image/svg+xml;base64,${base64}`;
		
		console.log('Data URL length:', dataUrl.length);
		console.log('Data URL preview:', dataUrl.substring(0, 150));
		
		return dataUrl;
		
	} catch (error) {
		console.error('Error rendering icon:', error);
		return "";
	}
}

// Main function for Glide
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
