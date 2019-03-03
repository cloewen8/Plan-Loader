import jasmine from './jasmine';

import { setup as setupTutorials, define as defineTutorials } from './tutorialsSpec';
setupTutorials().then(async () => {
	await import('./utilsSpec');
	await import('./errorHandlingSpec');
	await import('./resolveSpec');
	await import('./executeSpec');
	await import('./staticResourcesSpec');
	await import('./dynamicResourcesSpec');
	await import('./eventsSpec');
	defineTutorials();

	jasmine.execute();
});
