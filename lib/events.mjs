import { res } from './resources.mjs';
import { executePlans } from './executor.mjs';
import { handleError } from './util.mjs';

/**
 * Connects to a plan's event for execution.
 *
 * @param {Plan} plan The plan to connect.
 * @package
 * @ignore
 */
export function connectEvent(plan) {
	let action = (...dres) => {
		return executePlans(plan.mode, plan.plans, ...dres).catch((err) => {
			handleError(plan, err);
		});
	};
	let emitter = plan.emitter;
	if (typeof emitter === 'string')
		emitter = res[emitter];
	if (plan.repeats)
		emitter.on(plan.event, action);
	else
		emitter.once(plan.event, action);
}
