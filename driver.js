/**
 * Glide Plugin Driver for Simple Icons
 * Handles the UI and configuration for the Simple Icons plugin
 */

// Load icons data
let iconsData = [];
let iconsLoaded = false;

// Load icons data from simple-icons.json
async function loadIconsData() {
	if (iconsLoaded) return iconsData;
	
	try {
		// In Glide, we'll need to fetch from a CDN or include the data
		// For now, we'll use a fetch to get the icons list
		const response = await fetch('https://raw.githubusercontent.com/simple-icons/simple-icons/develop/data/simple-icons.json');
		const data = await response.json();
		iconsData = data;
		iconsLoaded = true;
		return data;
	} catch (error) {
		console.error('Error loading icons data:', error);
		// Fallback: return empty array
		return [];
	}
}

// Convert title to slug (matching simple-icons naming convention)
// Only declare if not already defined (function.js may have already declared it)
if (typeof TITLE_TO_SLUG_REPLACEMENTS === 'undefined') {
	var TITLE_TO_SLUG_REPLACEMENTS = {
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
}

if (typeof TITLE_TO_SLUG_CHARS_REGEX === 'undefined') {
	var TITLE_TO_SLUG_CHARS_REGEX = new RegExp(
		`[${Object.keys(TITLE_TO_SLUG_REPLACEMENTS).join('')}]`,
		'g',
	);
}

if (typeof TITLE_TO_SLUG_RANGE_REGEX === 'undefined') {
	var TITLE_TO_SLUG_RANGE_REGEX = /[^a-z\d]/g;
}

if (typeof titleToSlug === 'undefined') {
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
}

// Get icon by name (title or slug)
function getIconByName(name) {
	if (!iconsData.length) return null;
	
	// Try to find by title (case-insensitive)
	let icon = iconsData.find(i => 
		i.title.toLowerCase() === name.toLowerCase()
	);
	
	// If not found, try to find by slug
	if (!icon) {
		const searchSlug = titleToSlug(name);
		icon = iconsData.find(i => {
			const iconSlug = i.slug || titleToSlug(i.title);
			return iconSlug === searchSlug;
		});
	}
	
	// Also check aliases if available
	if (!icon) {
		icon = iconsData.find(i => {
			if (i.aliases && i.aliases.aka) {
				return i.aliases.aka.some(alias => 
					alias.toLowerCase() === name.toLowerCase()
				);
			}
			return false;
		});
	}
	
	return icon;
}

// Initialize the plugin
async function init() {
	await loadIconsData();
	
	// Create the UI
	const container = document.createElement('div');
	container.style.padding = '20px';
	container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
	
	// Icon name selector
	const iconNameLabel = document.createElement('label');
	iconNameLabel.textContent = 'Icon Name:';
	iconNameLabel.style.display = 'block';
	iconNameLabel.style.marginBottom = '8px';
	iconNameLabel.style.fontWeight = '600';
	
	const iconNameInput = document.createElement('input');
	iconNameInput.type = 'text';
	iconNameInput.placeholder = 'e.g., Google, GitHub, React';
	iconNameInput.style.width = '100%';
	iconNameInput.style.padding = '8px';
	iconNameInput.style.border = '1px solid #ddd';
	iconNameInput.style.borderRadius = '4px';
	iconNameInput.style.marginBottom = '16px';
	iconNameInput.id = 'iconName';
	
	// Icon preview/search dropdown
	const iconList = document.createElement('datalist');
	iconList.id = 'iconList';
	iconsData.forEach(icon => {
		const option = document.createElement('option');
		option.value = icon.title;
		iconList.appendChild(option);
	});
	
	iconNameInput.setAttribute('list', 'iconList');
	
	// Color picker
	const colorLabel = document.createElement('label');
	colorLabel.textContent = 'Color:';
	colorLabel.style.display = 'block';
	colorLabel.style.marginBottom = '8px';
	colorLabel.style.fontWeight = '600';
	
	const colorContainer = document.createElement('div');
	colorContainer.style.display = 'flex';
	colorContainer.style.gap = '8px';
	colorContainer.style.marginBottom = '16px';
	
	const colorInput = document.createElement('input');
	colorInput.type = 'color';
	colorInput.value = '#000000';
	colorInput.style.width = '60px';
	colorInput.style.height = '40px';
	colorInput.style.border = '1px solid #ddd';
	colorInput.style.borderRadius = '4px';
	colorInput.style.cursor = 'pointer';
	colorInput.id = 'iconColor';
	
	const colorTextInput = document.createElement('input');
	colorTextInput.type = 'text';
	colorTextInput.value = '#000000';
	colorTextInput.placeholder = '#000000 or color name';
	colorTextInput.style.flex = '1';
	colorTextInput.style.padding = '8px';
	colorTextInput.style.border = '1px solid #ddd';
	colorTextInput.style.borderRadius = '4px';
	colorTextInput.id = 'iconColorText';
	
	// Sync color inputs
	colorInput.addEventListener('input', (e) => {
		colorTextInput.value = e.target.value;
	});
	
	colorTextInput.addEventListener('input', (e) => {
		if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
			colorInput.value = e.target.value;
		}
	});
	
	colorContainer.appendChild(colorInput);
	colorContainer.appendChild(colorTextInput);
	
	// Size selector
	const sizeLabel = document.createElement('label');
	sizeLabel.textContent = 'Size (pixels):';
	sizeLabel.style.display = 'block';
	sizeLabel.style.marginBottom = '8px';
	sizeLabel.style.fontWeight = '600';
	
	const sizeInput = document.createElement('input');
	sizeInput.type = 'number';
	sizeInput.value = '24';
	sizeInput.min = '8';
	sizeInput.max = '512';
	sizeInput.style.width = '100%';
	sizeInput.style.padding = '8px';
	sizeInput.style.border = '1px solid #ddd';
	sizeInput.style.borderRadius = '4px';
	sizeInput.style.marginBottom = '16px';
	sizeInput.id = 'iconSize';
	
	// Preview
	const previewLabel = document.createElement('label');
	previewLabel.textContent = 'Preview:';
	previewLabel.style.display = 'block';
	previewLabel.style.marginBottom = '8px';
	previewLabel.style.fontWeight = '600';
	
	const previewContainer = document.createElement('div');
	previewContainer.id = 'iconPreview';
	previewContainer.style.width = '100%';
	previewContainer.style.minHeight = '100px';
	previewContainer.style.border = '1px solid #ddd';
	previewContainer.style.borderRadius = '4px';
	previewContainer.style.padding = '20px';
	previewContainer.style.display = 'flex';
	previewContainer.style.alignItems = 'center';
	previewContainer.style.justifyContent = 'center';
	previewContainer.style.backgroundColor = '#f9f9f9';
	
	// Update preview function
	function updatePreview() {
		const iconName = iconNameInput.value.trim();
		const color = colorTextInput.value || '#000000';
		const size = parseInt(sizeInput.value) || 24;
		
		if (!iconName) {
			previewContainer.innerHTML = '<p style="color: #999;">Enter an icon name to see preview</p>';
			return;
		}
		
		const icon = getIconByName(iconName);
		if (!icon) {
			previewContainer.innerHTML = `<p style="color: #d32f2f;">Icon "${iconName}" not found</p>`;
			return;
		}
		
		// Call the function to render
		if (window.renderSimpleIcon) {
			const svg = window.renderSimpleIcon(iconName, color, size);
			previewContainer.innerHTML = svg;
		} else {
			previewContainer.innerHTML = `<p style="color: #999;">Loading render function...</p>`;
		}
	}
	
	// Add event listeners
	iconNameInput.addEventListener('input', updatePreview);
	colorInput.addEventListener('input', updatePreview);
	colorTextInput.addEventListener('input', updatePreview);
	sizeInput.addEventListener('input', updatePreview);
	
	// Assemble the UI
	container.appendChild(iconNameLabel);
	container.appendChild(iconNameInput);
	container.appendChild(iconList);
	container.appendChild(colorLabel);
	container.appendChild(colorContainer);
	container.appendChild(sizeLabel);
	container.appendChild(sizeInput);
	container.appendChild(previewLabel);
	container.appendChild(previewContainer);
	
	// Return configuration object
	return {
		container,
		getConfig: () => ({
			iconName: iconNameInput.value.trim(),
			color: colorTextInput.value || '#000000',
			size: parseInt(sizeInput.value) || 24
		}),
		setConfig: (config) => {
			if (config.iconName) iconNameInput.value = config.iconName;
			if (config.color) {
				colorInput.value = config.color;
				colorTextInput.value = config.color;
			}
			if (config.size) sizeInput.value = config.size;
			updatePreview();
		}
	};
}

// Export for Glide
if (typeof module !== 'undefined' && module.exports) {
	module.exports = { init };
} else {
	window.SimpleIconsDriver = { init };
}

