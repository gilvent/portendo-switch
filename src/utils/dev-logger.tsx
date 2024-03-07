export default function devLog(...args: any) {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
}
