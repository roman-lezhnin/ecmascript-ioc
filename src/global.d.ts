/**
 * Represents an ApplicationContext configuration properties.
 */
type ConfigurationProperties = Record<
  string,
  object | string | number | boolean
>;
/**
 * Defines the possible scopes for a dependency:
 * Singleton - one instance for Container;
 * Prototype - one instance for access in dependency;
 */
type DependencyScope = "Singleton" | "Prototype";
/**
 * Represents a settings for a dependency.
 */
type DependencySettings = {
  lazy: boolean;
  scope: DependencyScope;
};
/**
 * Represents a constructor for a dependency.
 */
type DependencyConstructor<T> = new () => T;
/**
 * Represents a dependency data in Container.
 */
type RegisteredDependency = DependencySettings & {
  constructor: DependencyConstructor<unknown>;
};
/**
 * Interface for objects that can have dependencies injected.
 */
interface DependencyAware {
  __dependencies__?: Record<string | symbol, string | symbol>;
  __postConstructMethods__?: string[];
  [key: string]: Function;
}

interface DependencyScopeHandler {
  create<T>(constructor: DependencyConstructor<T>): T;
}
