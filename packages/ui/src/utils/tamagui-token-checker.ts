export function tamaguiTokenChecker<
  T extends Record<string, any>,
  K extends string | number,
>(val: K, tokens: T, fallback: keyof T = '$2'): T[keyof T] {
  return String(val) in tokens ? tokens[String(val)] : tokens[fallback];
}
