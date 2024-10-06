import { PrototypeScopeHandler, SingletonScopeHandler } from "./scope-handlers";
/**
 * The central DI container that manages dependency registration and retrieval.
 */
export class DiContainer {
  /**
   * Map to store dependencies constructors keyed by their names.
   */
  private readonly dependencies = new Map<
    string | symbol,
    RegisteredDependency
  >();
  /**
   * Map to store dependencies scope handlers.
   */
  private readonly scopeHandlers = new Map<
    DependencyScope,
    DependencyScopeHandler
  >([
    ["Singleton", new SingletonScopeHandler()],
    ["Prototype", new PrototypeScopeHandler()],
  ]);
  /**
   * Set to track currently resolving dependencies (for circular detection)
   */
  private readonly currentlyResolving = new Set<string | symbol>();

  /**
   * Registers a dependency with the container.
   * @param name - The name of the dependency.
   * @param constructor - The constructor function of the dependency.
   * @param settings - The settings of the dependency: scope and whether the dependency should be lazy-initialized.
   */
  registerDependency<T>(
    name: string | symbol,
    constructor: DependencyConstructor<T>,
    settings: DependencySettings
  ): void {
    DiContainer.validateSettings(name.toString(), settings);
    if (this.dependencies.has(name)) {
      throw new Error(`Dependency '${name.toString()}' is already registered.`);
    }
    this.dependencies.set(name, { ...settings, constructor });
  }

  /**
   * Override a dependency with the container.
   * Intended for use in tests, decorators are preferred in application code.
   * @param name - The name of the dependency.
   * @param constructor - The constructor function of the dependency.
   * @param settings - The settings of the dependency: scope and whether the dependency should be lazy-initialized.
   */
  overrideDependency<T>(
    name: string | symbol,
    constructor: DependencyConstructor<T>,
    settings: DependencySettings
  ): void {
    DiContainer.validateSettings(name.toString(), settings);
    this.dependencies.set(name, { ...settings, constructor });
  }

  /**
   * Retrieves an instance of the requested dependency based on its scope.
   * @param name - The name of the dependency.
   * @returns The instance of the dependency.
   */
  getDependency = <T>(name: string | symbol): T => {
    if (this.currentlyResolving.has(name)) {
      throw new Error(
        `Circular dependency detected for component '${name.toString()}'.`
      );
    }

    const dependency = this.dependencies.get(name);
    if (!dependency) {
      throw new Error(`Dependency '${name.toString()}' not found.`);
    }

    this.currentlyResolving.add(name);

    try {
      const handler = this.scopeHandlers.get(dependency.scope);
      if (!handler) {
        throw new Error(
          `Unknown scope '${
            dependency.scope
          }' for dependency '${name.toString()}'.`
        );
      }

      const instance = handler.create<T>(
        dependency.constructor as DependencyConstructor<T>
      );
      this.injectDependencies(instance as DependencyAware);
      DiContainer.callPostConstructMethods(instance as DependencyAware);

      return instance;
    } finally {
      this.currentlyResolving.delete(name);
    }
  };

  /**
   * Remove dependencies from the instance's properties.
   */
  clear() {
    this.scopeHandlers.set("Singleton", new SingletonScopeHandler());
  }

  /**
   * Injects dependencies into the instance's properties.
   * @param instance - The instance to inject dependencies into.
   */
  private injectDependencies(instance: DependencyAware): void {
    const { getDependency } = this;
    const dependencies = instance.__dependencies__;
    if (dependencies) {
      for (const [contextName, dependencyName] of Object.entries(
        dependencies
      )) {
        const dependency = this.dependencies.get(dependencyName);
        if (!dependency) {
          throw new Error(
            `Dependency '${dependencyName.toString()}' not found.`
          );
        }
        if (dependency.lazy) {
          /**
           * Lazy Initialization:
           * The actual dependency is not resolved until the property is accessed.
           * Once accessed, the property is redefined to cache the resolved dependency.
           */
          Object.defineProperty(instance, contextName, {
            configurable: true,
            enumerable: true,
            get: function () {
              const value = getDependency(dependencyName);
              // Cache the resolved dependency
              Object.defineProperty(this, contextName, {
                value,
                writable: true,
                configurable: true,
                enumerable: true,
              });
              return value;
            },
          });
        } else {
          // Eagerly Initialization:
          const value = getDependency(dependencyName);
          (instance as Record<string | symbol, unknown>)[contextName] = value;
        }
      }
    }
  }

  /**
   * Calls methods decorated with @postConstruct after dependencies are injected.
   * @param instance - The instance whose post-construct methods to call.
   */
  private static callPostConstructMethods(instance: DependencyAware): void {
    const methods = instance.__postConstructMethods__;
    if (Array.isArray(methods)) {
      for (const methodName of methods) {
        if (typeof instance[methodName] === "function") {
          instance[methodName].call(instance);
        }
      }
    }
  }

  /**
   * Validates the dependency settings.
   * @param name The name of the dependency.
   * @param settings The settings to validate.
   */
  private static validateSettings(
    name: string,
    { lazy, scope }: DependencySettings
  ): void {
    if (typeof lazy !== "boolean") {
      throw new Error(`Unknown lazy-init mode for dependency '${name}'.`);
    }
    if (scope !== "Singleton" && scope !== "Prototype") {
      throw new Error(`Unknown scope '${scope}' for dependency '${name}'.`);
    }
  }
}
