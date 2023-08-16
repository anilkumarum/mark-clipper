export class EventEmitter {
	constructor() {}
	on(event, cb) {
		this[event] = { cb };
	}

	once(event, cb) {
		this[event] = { cb, once: true };
	}

	emit(event, ...args) {
		this[event].cb(...args);
		this[event].once && delete this[event];
	}
}
