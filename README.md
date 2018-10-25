# Dynamic Loader
An experimental loader for the [Bro Time Server](https://github.com/Bro-Time/Bro-Time-Server). Based on the original [Dynamic Loader issue](https://github.com/Bro-Time/Bro-Time-Server/issues/562).

## Requirements

### Standard loaders

- [x] Serial plans must execute in order (never at the same time).
- [x] Parellel plans must execute in parellel.
- [x] External plans must be imported (default export) and executed.
- [x] Plan actions must be executed.
- [x] Plan actions that require static resources (resources that are defined only once) must be supplied.

### Context loaders

- [x] Contextual plans must be able to expose associated plans.
- [ ] Plans that depend on an event should execute when the event is emitted.
- [ ] Plans must be able to provide a custom context loader.
- [ ] Plans provided to a contextual plan must be able to provide multiple tags without needing to fully load the associated plan.
- [x] Contextual plans must be able to provide associated resources (alongside static resources).

### Testing

- [x] Test cases are to be written to confirm that all used plans are valid.
- [x] The execution of a plan must be made available externally. - *Plans already expose their associated plans through an iterable. The plan resolver has been exported to go deeper into associated plans.*

### Other

- [x] This repository should be a valid npm package.
- [x] Any module should be able to start executing an initial plan.
- [x] A tutorial should be written on how to write a basic plan.
- [ ] A tutorial should be written on how to write a contextual plan for an event.
- [ ] Documentation is to be written describing how to structure plans.
- [ ] Documentation is to be written for major features.
- [ ] Documentation for plan properties is to be written.

## Out of scope

- Features from the server that are not required in the loader will not be reimplemented.
- Integration with existing dependencies will not be tested.
