Resources may be distributed to plans either statically, or dynamically.

## Static Resources
A static resource is any value that should exist for the entire duration of the application.

### Setting a Static Resource
A static resource may be set by calling the exported `setResource` function.
```js
setResource('greeting', 'Hello');
```

### Including Static Resources
To use a set static resource, include it's key in an `include` array:
```js
// From earlier...
setResource('greeting', 'Hello');

execute({
	include: ['greeting'],
	execute: (greeting) => {
		console.log(greeting);
	}
});
```
```text
Hello
```

## Dynamic Resources
Dynamic resources are values passed to the executor. They are automatically passed to plans after static resources.
```js
execute({
	execute: (name) => {
		console.log(`Hello ${name}`);
	},
	plans: [
		{
			execute: (name) => {
				console.log(`Bye ${name}`);
			}
		}
	]
}, 'Bob');
```
```text
Hello Bob
Bye Bob
```
