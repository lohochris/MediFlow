// backend/utils/events.js
import EventEmitter from "events";

class AppEventEmitter extends EventEmitter {}
const appEvents = new AppEventEmitter();

export default appEvents;
