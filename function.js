// Convert title to slug (matching simple-icons naming convention)
const TITLE_TO_SLUG_REPLACEMENTS = {
	'+': 'plus', '.': 'dot', '&': 'and', 'đ': 'd', 'ħ': 'h', 'ı': 'i', 'ĸ': 'k',
	'ŀ': 'l', 'ł': 'l', 'ß': 'ss', 'ŧ': 't', 'ø': 'o',
  };
  
  const TITLE_TO_SLUG_CHARS_REGEX = new RegExp(
	`[${Object.keys(TITLE_TO_SLUG_REPLACEMENTS).join('')}]`, 'g'
  );
  const TITLE_TO_SLUG_RANGE_REGEX = /[^a-z\d]/g;
  
  function titleToSlug(title) {
	return title
	  .toLowerCase()
	  .replace(TITLE_TO_SLUG_CHARS_REGEX, (char) => TITLE_TO_SLUG_REPLACEMENTS[char] || char)
	  .normalize('NFD')
	  .replace(TITLE_TO_SLUG_RANGE_REGEX, '');
  }
  
  window.function = async function(iconName, color, size) {
	iconName = iconName?.value || iconName || "";
	color = color?.value || color || "#000000";
	size = size?.value || size || "24";
  
	if (!iconName) {
	  return "Error: Icon name is required";
	}
  
	const slug = titleToSlug(iconName);
	const svgUrl = `https://xaviigna.github.io/glide-simpleicons/assets/simple/${slug}.svg`;
  
	try {
	  const response = await fetch(svgUrl);
	  if (!response.ok) {
		return `Error: Failed to fetch icon (${response.status})`;
	  }
  
	  let svgContent = await response.text();
  
	  svgContent = svgContent.replace(/fill="[^"]*"/g, `fill="${color}"`);
  
	  const sizeNum = parseInt(size, 10) || 24;
	  svgContent = svgContent.replace(/\s*width\s*=\s*"[^"]*"/gi, '');
	  svgContent = svgContent.replace(/\s*height\s*=\s*"[^"]*"/gi, '');
	  svgContent = svgContent.replace(
		/<svg([^>]*?)>/,
		`<svg$1 width="${sizeNum}" height="${sizeNum}">`
	  );
  
	 const encoded = btoa(unescape(encodeURIComponent(svgContent)));
	  return `data:image/svg+xml;base64,${encoded}`;
	} catch (error) {
	  return "Error: Could not process SVG";
	}
  };
  

