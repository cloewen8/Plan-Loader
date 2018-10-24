# Resources
Resources may be distributed to plans either statically, or dynamically.

## Static Resources
A static resource is any value that should exist for the entire duration of the application.

### Setting a Static Resource
A static resource may be set by calling the exported `setResource` function.

```js
import { setResource } from "dynamic-loader"

setResource("greeting", "Hello")
```

### Including Static Resources
To use a set static resource, include it's key in an `include` array:
```js
{
	include: ["greeting"],
	execute: (greeting) => {
		console.log(greeting)
	}
}
```
```text
Hello
```

## Dynamic Resources (*coming soon*)
Dynamic resources are included automatically by a contextual plan after static resources.
