# Getting Started

The dynamic loader includes 2 major facets:

- Performing actions in a predefined order.
- Performing actions in a predefined context (*coming soon*).

Both of these facets are achieved using plans. A plan is an object which defines the action.

To start executing a plan, call the exported `execute` function.
```js
import { execute } from "dynamic-loader"

execute({ execute: () => console.log("Hello world!") })
```

## Plan
The most basic plan contains an action to `execute`.

```js
{
	execute: () => {
		console.log("Hello world!")
	}
}
```
```text
Hello World!
```

A plan may also contain other `plans` to execute afterwards.

```js
{
	execute: () => {
		console.log("Hello world!")
	},
	plans: [
		{
			execute: () => {
				console.log("Hello!")
			}
		},
		{
			execute: () => {
				console.log("Hey!")
			}
		}
	]
}
```
```text
Hello World!
Hello!
Hey!
```

### Serial vs. Parallel
By default, plans execute in parallel. Meaning that if the first plan stops for any reason, the next plan will continue, and vise-versa. Meaning that the example above could have logged:
```text
Hello World!
Hey!
Hello!
```

If plans rely on eachother (such as to share an object), you can set the parent plan to run `serial`ly. Meaning each plan must finish before the next plan executes.
```js
{
	serial: true,
	execute: () => {
		console.log("Hello world!")
	},
	plans: [
		{
			execute: () => {
				console.log("Hello!")
			}
		},
		{
			execute: () => {
				console.log("Hey!")
			}
		}
	]
}
```
```text
Hello world!
Hello!
Hey!
```

If setting the parent plan to be serial is not an option (too inefficient), you may also create a serial plan inside a parallel plan.
```js
{
	execute: () => {
		console.log("Hello world!")
	},
	plans: [
		{
			serial: true,
			plans: [
				{
					execute: () => {
						console.log("Hello!")
					}
				},
				{
					execute: () => {
						console.log("Hey!")
					}
				}
			]
		}
	]
}
```
```text
Hello world!
Hello!
Hey!
```

### External plans
If a plan is a string, the plan resolver will automatically attempt to import the plan.
```js
{
	plans: [
		"greetings/hello",
		"greetings/hey"
	]
}
```
In `grttings/hello.mjs`:
```js
export default {
	execute: () => {
		console.log("Hello!")
	}
}
```
In `grttings/hey.mjs`:
```js
export default {
	execute: () => {
		console.log("Hey!")
	}
}
```
```text
Hello!
Hey!
```

The resolver will:
1. Add the `.mjs` extension to the path if an extension is not present.
2. Import the plan if it exists relative to the parent plan's file.
3. Attempt to import the plan directly.

The default export will be used.
