/// <reference types="vite/client" />

declare module 'virtual:fuentes' {}
declare module 'virtual:restaurant' {
  const data: import('./data/schema').Restaurant
  export default data
}
