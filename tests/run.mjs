import jasmine from './jasmine';

import { setup as setupTutorials, define as defineTutorials } from './tutorialsSpec';
Promise.all([
	setupTutorials(),
	import('./utilsSpec'),
	import('./errorHandlingSpec'),
	import('./resolveSpec'),
	import('./executeSpec'),
	import('./staticResourcesSpec'),
	import('./dynamicResourcesSpec'),
	import('./eventsSpec')
]).then(() => {
	defineTutorials();

	jasmine.execute();
});
