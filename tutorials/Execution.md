Occasionally it may be desirable to take control of the execution process of plans. You may do so by setting the `mode` to `Custom` and executing the plans in the `execute` function.
```js
import { execute, executePlans } from 'plan-loader'

execute({
	mode: 'Custom',
	execute: () => {
		executePlans('Parallel', this.plans)
	},
	plans: [
		{ execute: () => console.log('Hello world!') }
	]
})
```
```text
Hello world!
```

## Executing Plans
There are 2 ways to execute plans. By calling the exported `execute` function with a plan, or the `executePlans` function with a mode and iterable.
```js
import { execute, executePlans } from 'plan-loader'

execute({
	execute: () => {
		console.log('Hello world!')
	}
})

executePlans('Serial', [
	{
		execute: () => {
			console.log('Hello world!')
		}
	}
])
```
```text
Hello world!
Hello world!
```

Both of these functions can also accept dynamic resources.
```js
import { execute, executePlans } from 'plan-loader'

execute({
	execute: (name) => {
		console.log(`Hello ${name}`)
	}
}, 'Bob')

executePlans('Serial', [
	{
		execute: (name) => {
			console.log(`Hello ${name}`)
		}
	}
], 'Bob')
```
```text
Hello Bob
Hello Bob
```

## Using metadata
`Meta`data is a method of storing data in a parent plan about associated plans. Plans can be filtered by their metadata using the exported `filterPlans` function. The `filterPlans` function takes a plan and predicate function, and returns an iterable. The predicate function should return `true` if the plan should be included, and `false` otherwise.
```js
import { executePlans, filterPlans } from 'plan-loader'

const plan = {
	plans: [
		{ execute: () => console.log('strawberry') },
		{ execute: () => console.log('carrot') },
		{ execute: () => console.log('orange') }
	],
	meta: [
		{ isFruit: true },
		{ isFruit: false },
		{ isFruit: true }
	]
}

executePlans('Serial',
	filterPlans(plan, (candidate) => candidate.isFruit))
```
```text
strawberry
orange
```
