/**
 * Represents a constructor for a component.
 */
type ComponentConstructor<T> = new () => T;

/**
 * Interface for objects that can have dependencies injected.
 */
interface DependencyAware {
  __dependencies__?: Record<string | symbol, string>;
}
