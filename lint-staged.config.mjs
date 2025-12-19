export default {
	"apps/**/*.{ts,tsx,js,jsx}": ["biome format --write", "eslint --fix"],
	"packages/**/*.{ts,tsx,js,jsx}": ["biome format --write", "eslint --fix"],
	"*.{json,md,css,scss}": ["biome format --write"],
};
