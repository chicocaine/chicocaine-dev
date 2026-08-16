// Wrangler/Cloudflare Workers bundles a `.wasm` import as a pre-compiled
// `WebAssembly.Module` (no runtime `WebAssembly.compile` / code generation).
// See https://developers.cloudflare.com/workers/runtime-apis/webassembly/javascript/
declare module "*.wasm" {
  const wasmModule: WebAssembly.Module;
  export default wasmModule;
}
