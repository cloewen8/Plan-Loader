The resolver is used to locate and validate a plan.

## When to Use it
The resolver is automatically called when:

- The execute function is called.
- The plans inside a plan are being executed.

Using the resolver manually should be used when:

- You need to test plans embedded in a plan.
- You need statistics based on plans.
- A function accepts a plan as an argument.

*You should not use the resolver manually if you plan to execute the plan.*

## How to Use it
The `resolve`r is a function that is exported. It can be called with a plan (string or object). If the plan is invalid or can not be resolved, an error is thrown.

```js
import { resolve, expandPath } from 'plan-loader'

async function log(plan, indent) {
	let resolved = await resolve(plan)
	console.log(indent + resolved.id)
	if (resolved.plans != null) {
		for (let subPlan of resolved.plans)
			await log(subPlan, indent + '.')
	}
}

log(expandPath(import.meta.url, 'examples/mainPlan.mjs'), '').catch((err) =>
	console.log('Error: ' + err.message))
```
```text
plan1
.plan2
..plan4
.plan3
Error: The plan's associated plans must be iterable.
```
In `examples/mainPlan.mjs` (*plans do not need to contain an id property*):
```js
export default {
	id: 'plan1',
	plans: [
		{
			id: 'plan2',
			plans: [
				{
					id: 'plan4'
				}
			]
		},
		{
			id: 'plan3'
		},
		{
			plans: true
		}
	]
}
```
