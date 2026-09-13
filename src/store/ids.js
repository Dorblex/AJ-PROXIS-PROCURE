/* Mutable in-memory ID counters. `uidState` is exported as an object (not a bare number)
   so App.jsx can read/restore its `.current` value on hydration from persisted storage,
   the same way it does for reducer.js's `seq` counters. */
export const uidState = { current: 1000 };
export const uid = () => uidState.current++;
