import jasmine from './jasmine';

import { gather as gatherExamples, define as defineDocs } from './examplesSpec';
Promise.all([
	gatherExamples(`${process.cwd()}/`),
	gatherExamples(`${process.cwd()}/tutorials/`),
	import('./utilsSpec'),
	import('./errorHandlingSpec'),
	import('./resolveSpec'),
	import('./executeSpec'),
	import('./staticResourcesSpec'),
	import('./dynamicResourcesSpec'),
	import('./eventsSpec')
]).then(() => {
	defineDocs();

	jasmine.execute();
});
