// Create a "context" - Webpack will preload ALL files from bot_icons and zone_icons
const botIconsContext = require.context(
	'./images/bot_icons',
	false, // Do not search in subfolders
	/\.(png|jpg|jpeg|webp|gif|svg)$/ // We are looking for only these extensions
);

const zoneIconsContext = require.context(
	'./images/zone_icons',
	false,
	/\.(png|jpg|jpeg|webp|gif|svg)$/
);

// Icon caching (will speed up rendering)
const iconCache = new Map();

// Icon search function with caching
function tryLoadIconFromContext(context, name) {
	console.log(`[Cache] ${iconCache.has(name) ? 'HIT' : 'MISS'} for:`, name);
	if (iconCache.has(name)) {
		return iconCache.get(name);
	}

	// We get a list of all files in the context (with paths, for example: "./riveler.png")
	const files = context.keys();

	// We go through all the files - we look for a match by name (regardless of case and extension)
	for (let file of files) {
		// Remove "./" and the extension from file
		const fileName = file.replace('./', '').replace(/\.[^/.]+$/, '');

		// Compare with name without regard to case
		if (fileName.toLowerCase() === name.toLowerCase()) {
			try {
				const iconModule = context(file);
				// We cache the result
				iconCache.set(name, iconModule);
				return iconModule;
			} catch (err) {
				console.warn(`Failed to load icon: ${file}`, err);
				continue;
			}
		}
	}
	// If we didn't find it, we cache null so we don't have to search again.
	iconCache.set(name, null);
	return null;
}

export default function resolveIcon(robotName) {
	// Protection: if robotName is not a string, return an empty string (or fallback)
	if (typeof robotName !== 'string' || robotName.trim() === '') {
		console.warn(`Invalid robot name:`, robotName);
		robotName = "unknown_bot"; // Fallback
	}

	const parsedIconName = robotName
		.toLowerCase()
		.replace(/\s+/g, '_')        // Replace one or more spaces with _
		.replace(/[^\w\-_]/g, '');   // We also leave only letters, numbers, _ and -

	const icon = tryLoadIconFromContext(botIconsContext, parsedIconName);
	if (!icon) {
		console.warn(`No icon found for robot: "${robotName}" - "${parsedIconName}"`);
		return require("./images/bot_icons/unknown_bot.png"); // Fallback
	}
	return icon;

};

export function resolveZoneIcon(zoneName) {
	// Similar to robotName protection for zones
	if (typeof zoneName !== 'string' || zoneName.trim() === '') {
		console.warn(`Invalid zone name:`, zoneName);
		zoneName = "unknown_zone"; // Fallback
	}

	const parsedIconName = zoneName
		.toLowerCase()
		.replace(/\s+/g, '_')        // Replace one or more spaces with _
		.replace(/[^\w\-_]/g, '');   // We also leave only letters, numbers, _ and -

	const icon = tryLoadIconFromContext(zoneIconsContext, parsedIconName);
	if (!icon) {
		console.warn(`No icon found for zone: "${zoneName}" - "${parsedIconName}"`);
		return require("./images/zone_icons/unknown_zone.png"); // Fallback
	}
	return icon;
};