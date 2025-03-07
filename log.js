console.log("Start");

process.nextTick(() => {
  console.log("next");
});

setImmediate(() => {
  console.log("imdm");
});

setTimeout(() => {
  console.log("set Time");
}, 0);

console.log("End");
