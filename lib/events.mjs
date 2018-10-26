import { res } from "./resources";
import { executePlans } from "./executor";

export function connectEvent(plan) {
	let action = executePlans.bind(null, plan.mode, plan.plans);
	let emitter = plan.emitter;
	if (typeof emitter === "string")
		emitter = res[emitter];
	if (plan.repeats)
		emitter.on(plan.event, action);
	else
		emitter.once(plan.event, action);
}
