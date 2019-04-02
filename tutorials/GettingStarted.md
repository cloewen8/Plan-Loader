The plan loader focuses on a single major concept, plans! A
plan is an object which defines behaviors. A plan can be
executed, list other plans to execute, accept resources,
and more.

## Plan
The most basic plan contains an action to `execute`.

```js
import { execute } from 'plan-loader'

execute({
	execute: () => {
		console.log('Hello world!')
	}
})
```
```text
Hello World!
```

A plan may also contain other `plans` to execute afterwards.

```js
import { execute } from 'plan-loader'

execute({
	execute: () => {
		console.log('Hello world!')
	},
	plans: [
		{
			execute: () => {
				console.log('Hello!')
			}
		},
		{
			execute: () => {
				console.log('Hey!')
			}
		}
	]
})
```
```text
Hello World!
Hello!
Hey!
```

### Serial vs. Parallel vs. Custom (`mode`)
By default, plans execute in parallel. Meaning that if the first plan stops for any reason, the next plan will continue, and vise-versa. Meaning that the example above could have logged:
```text
Hello World!
Hey!
Hello!
```

#### Serial Mode
If plans rely on each other (such as to share an object), you can set the parent plan to run `serial`ly. Meaning each plan must finish before the next plan executes.
```js
import { execute } from 'plan-loader'

execute({
	mode: 'Serial',
	execute: () => {
		console.log('Hello world!')
	},
	plans: [
		{
			execute: () => {
				console.log('Hello!')
			}
		},
		{
			execute: () => {
				console.log('Hey!')
			}
		}
	]
})
```
```text
Hello world!
Hello!
Hey!
```

If setting the parent plan to be serial is not an option (too inefficient), you may also create a serial plan inside a parallel plan.
```js
import { execute } from 'plan-loader'

execute({
	execute: () => {
		console.log('Hello world!')
	},
	plans: [
		{
			mode: 'Serial',
			plans: [
				{
					execute: () => {
						console.log('Hello!')
					}
				},
				{
					execute: () => {
						console.log('Hey!')
					}
				}
			]
		}
	]
})
```
```text
Hello world!
Hello!
Hey!
```

#### Custom Mode
You may also choose to execute associated plans yourself (or not at all).
```js
import { execute } from 'plan-loader'

execute({
	mode: 'Custom',
	execute: () => {
		console.log('Hello world!')
		execute(this.plans[0])
	},
	plans: [
		{
			execute: () => {
				console.log('Hello!')
			}
		},
		{
			execute: () => {
				console.log('Hey!')
			}
		}
	]
})
```
```text
Hello world!
Hello!
```

### External plans
If a plan is a string, the plan resolver will automatically attempt to import the plan.
```js
import { execute } from 'plan-loader'

execute({
	plans: [
		'greetings/hello',
		'greetings/hey'
	]
})
```
In `grttings/hello.mjs`:
```js
export default {
	execute: () => {
		console.log('Hello!')
	}
}
```
In `grttings/hey.mjs`:
```js
export default {
	execute: () => {
		console.log('Hey!')
	}
}
```
```text
Hello!
Hey!
```

The resolver will:
1. Add the `.mjs` extension to the path if an extension is not present.
2. Import the plan if it exists relative to the parent plan's file (*see Relative Path Bug*).
3. Attempt to import the plan directly.

The default export will be used.

#### Relative Path Bug
Due to missing functionality in Node.js, relative paths to plans can not be resolved. This limitation is known and will be fixed at a later date.

As a temporary fix, you can use the exported `expandPath` function with `import.meta.url`:
```js
import { execute, expandPath } from 'plan-loader'

execute({
	plans: [
		expandPath(import.meta.url, 'greetings/hello'),
		expandPath(import.meta.url, 'greetings/hey')
	]
})
```
