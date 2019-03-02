Plans may be executed when an event is emitted.

## Using an Event
In order to connect to an event, a plan must have the `event` name and `emitter`.
```js
const emitter = new EventEmitter()

{
	execute: () => {
		console.log("connected")
	},
	event: "custom",
	emitter: emitter,
	plans: [
		{
			execute: (arg) => {
				console.log(`recieved ${arg}`);
			}
		}
	]
}
```
```text
connected
```
After the plan is executed
```js
emitter.emit("custom", 1)
```
```text
recieved 1
```

- Any object that contains a `once` function (or `on` if repeating is needed) qualifies as an emitter.
- Plans that connect to an event still execute.
- The plan's associated plans will not execute automatically.
- Emitted arguments are passed as dynamic resources (*see Resources*).
- By default, associated plans only execute once (*see Repeating Events*).

## Static Event Emitters
If the emitter is a key to a static resource, and the resource is a valid emitter, it will be connected to.
```js
const emitter = new EventEmitter()
setResource("staticEmitter", emitter)

{
	event: "custom",
	emitter: "staticEmitter",
	plans: [
		{
			execute: (arg) => {
				console.log(`recieved ${arg}`);
			}
		}
	]
}

emitter.emit("custom", 1)
```
```text
recieved 1
```

## Repeating Events
You may optionally set plans to `repeat` if an event may be emitted multiple times.
```js
const emitter = new EventEmitter()

{
	event: "custom",
	emitter: emitter,
	repeats: true,
	plans: [
		{
			execute: (arg) => {
				console.log(`recieved ${arg}`);
			}
		}
	]
}

emitter.emit("custom", 1)
emitter.emit("custom", 2)
```
```text
recieved 1
recieved 2
```
