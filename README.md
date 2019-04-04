# Plan-Loader
A loader based on plans that chooses what, when, and in what order
to load. Allowing for **more flexibility** with a **standard design**.

## Use Cases
It can be difficult at times to know what to use a loader for. Here is a list of a few possible uses!

- **Web server** - Individual sections of the website could be bound to separately using sub-plans.
- **Task automation** - Tasks could be split into plans and executed in a customized order.
- **Chat bot** - You can split commands into their own files and have them execute when an event is emitted.

## Getting Started
The plan loader uses objects known as plans. A plan is a set of instructions on how to run the desired code.

In order for a plan to run code, all it needs is an `execute` method, which takes 0 or more arguments.
```js
import { execute } from 'plan-loader'

execute({
	execute: () => {
		console.log('Hello world!')
	}
})
```
```text
Hello world!
```

A plan can also point to other plans to cover an entire project's loading needs!
```js
import { execute } from 'plan-loader'

execute({
	execute: () => {
		console.log('Hello world!')
	},
	plans: [
		{
			execute: () => {
				console.log('Hello galaxy!')
			}
		},
		{
			execute: () => {
				console.log('Hello universe!')
			}
		}
	]
})
```
```text
Hello world!
Hello galaxy!
Hello universe!
```

**For more information, run `npm run docs`.**
