/**
 * Represents a constructor for a component.
 */
type ComponentConstructor<T> = new () => T;

/**
 * Represents a settings for a component.
 */
type ComponentSettings = {
  lazy: boolean;
};
type RegisteredComponent = ComponentSettings & {
  constructor: ComponentConstructor<unknown>;
};

/**
 * Interface for objects that can have dependencies injected.
 */
interface DependencyAware {
  __dependencies__?: Record<string | symbol, string>;
}
