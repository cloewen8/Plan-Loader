import jasmine from './jasmine.mjs';

import { gather as gatherExamples, define as defineDocs } from './examplesSpec.mjs';
Promise.all([
	gatherExamples(`${process.cwd()}/`),
	gatherExamples(`${process.cwd()}/tutorials/`),
	import('./utilsSpec.mjs'),
	import('./errorHandlingSpec.mjs'),
	import('./resolveSpec.mjs'),
	import('./executeSpec.mjs'),
	import('./staticResourcesSpec.mjs'),
	import('./dynamicResourcesSpec.mjs'),
	import('./eventsSpec.mjs')
]).then(() => {
	defineDocs();

	jasmine.execute();
});
