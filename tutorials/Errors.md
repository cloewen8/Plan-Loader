Plans are able to throw and handle thrown errors using a `handleError` function.

## What is Captured
Only errors thrown while executing a plan are captured. Plan validation and internal errors are not captured.

## Handling Errors
In order to handle an error, the plan needs to implement a `handleError` function.
```js
import { execute } from 'plan-loader'

execute({
	execute: () => {
		throw new Error('Something bad!')
	},
	handleError: (err) => {
		console.log(err.message)
	}
})
```
```text
Something bad!
```

## Propagation
If an error is thrown from `handleError` or the function does not exist, it will be propagated to the parent plan. This allows for data to be attached to errors, multi-phase error handling, and worst-case-scenario error handling.
```js
import { execute } from 'plan-loader'

execute({
	plans: [
		{
			execute: () => { throw new Error('Oops!') },
			handleError: (err) => {
				err.message += 'Plans error: '
				throw err
			}
		}
	],
	handleError: (err) => {
		console.log(err.message)
	}
})
```
```text
Plans error: Oops!
```

## Event Plan Errors
Errors thrown from plans executed using an event do not currently propagate past the parent plan. This is due to how the associated plans execute on a different stack.
```js
import { execute } from 'plan-loader'
import { EventEmitter } from 'events'
const emitter = new EventEmitter()

execute({
	plans: [{
		event: 'event',
		emitter: emitter,
		plans: [
			{ execute: () => { throw new Error() } }
		],
		handleError: () => {
			console.log('depth 1')
		}
	}],
	handleError: () => {
		console.log('depth 2')
	}
}).then(() => emitter.emit('event'))
```
```text
depth 1
```
