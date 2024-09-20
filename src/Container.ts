/**
 * The central DI container that manages component registration and retrieval.
 */
export class Container {
  /**
   * Map to store component constructors keyed by their names.
   */
  private static components = new Map<string, ComponentConstructor<unknown>>();
  /**
   * Map to store singleton instances of components.
   */
  private static instances = new Map<string, unknown>();

  /**
   * Registers a component with the container.
   * @param name - The name of the component.
   * @param constructor - The constructor function of the component.
   */
  static register<T>(name: string, constructor: ComponentConstructor<T>): void {
    if (this.components.has(name)) {
      throw new Error(`Component '${name}' is already registered.`);
    }
    this.components.set(name, constructor as ComponentConstructor<unknown>);
  }

  /**
   * Retrieves an instance of the requested component.
   * @param name - The name of the component.
   * @returns The instance of the component.
   */
  static get<T>(name: string): T {
    if (this.instances.has(name)) {
      return this.instances.get(name) as T;
    }

    const constructor = this.components.get(name) as ComponentConstructor<T>;
    if (!constructor) {
      throw new Error(`Component '${name}' not found.`);
    }

    const instance = new constructor();
    this.instances.set(name, instance);
    this.injectDependencies(instance as DependencyAware);
    return instance;
  }

  /**
   * Remove dependencies from the instance's properties.
   */
  static clear() {
    this.instances.clear();
  }

  /**
   * Injects dependencies into the instance's properties.
   * @param instance - The instance to inject dependencies into.
   */
  private static injectDependencies(instance: DependencyAware): void {
    const dependencies = instance.__dependencies__;
    if (dependencies) {
      for (const [contextName, dependencyName] of Object.entries(
        dependencies
      )) {
        /**
         * Lazy Initialization:
         * The actual dependency is not resolved until the property is accessed.
         * Once accessed, the property is redefined to cache the resolved dependency.
         */
        Object.defineProperty(instance, contextName, {
          configurable: true,
          enumerable: true,
          get: function () {
            const value = Container.get(dependencyName);
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
      }
    }
  }
}
