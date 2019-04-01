# Plan-Loader
A loader based on plans that chooses what, when, and in what order
to load.

## Getting Started
The plan loader uses objects known as plans. A plan is a set of instructions on how to run the desired code.

In order for a plan to run code, all it needs is an `execute` method, which takes 0 or more arguments.
```js
import { execute } from "plan-loader"

execute({
	execute: () => {
		console.log("Hello world!")
	}
})
```
```text
Hello World!
```

A plan can also point to other plans to cover an entire project's loading needs!
```js
import { execute } from "plan-loader"

execute({
	execute: () => {
		console.log("Hello world!")
	},
	plans: [
		{
			execute: () => {
				console.log("Hello galaxy!")
			}
		},
		{
			execute: () => {
				console.log("Hello universe!")
			}
		}
	]
})
```
```text
Hello World!
```

**For more information, run `npm run docs`.**
