import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		name: 'world',
		authenticated: false,
	}
});

export default app;