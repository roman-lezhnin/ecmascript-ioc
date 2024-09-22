/**
 * Defines the possible scopes for a component:
 * Singleton - one instance for Container;
 * Prototype - one instance for access in dependency;
 */
type ComponentScope = "Singleton" | "Prototype";
/**
 * Represents a constructor for a component.
 */
type ComponentConstructor<T> = new () => T;

/**
 * Represents a settings for a component.
 */
type ComponentSettings = {
  lazy: boolean;
  scope: ComponentScope;
};
type RegisteredComponent = ComponentSettings & {
  constructor: ComponentConstructor<unknown>;
};

/**
 * Interface for objects that can have dependencies injected.
 */
interface DependencyAware {
  __dependencies__?: Record<string | symbol, string | symbol>;
  __postConstructMethods__?: string[];
  [key: string]: Function;
}
