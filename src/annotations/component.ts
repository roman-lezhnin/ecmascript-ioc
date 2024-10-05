import { DiContainer } from "../DiContainer";
/**
 * Marks a class as a component and registers it with the DI container.
 * @param name - custom name for the dependency.
 * @param settings - The settings of the component:
 * whether the component should be lazy-initialized or in Singleton/Prototype scope.
 */
export function component<This, Args extends unknown[]>(
  name: string | symbol,
  settings?: Partial<DependencySettings>
) {
  return function (target: new (...args: Args) => This): void {
    if (!name) {
      throw new Error(`Empty component name`);
    }
    const dependencySettings: DependencySettings = {
      lazy: false,
      scope: "Singleton",
    };
    if (typeof settings?.lazy === "boolean") {
      dependencySettings.lazy = settings.lazy;
    }
    if (settings?.scope) {
      dependencySettings.scope = settings.scope;
    }
    DiContainer.registerDependency(
      name,
      target as DependencyConstructor<unknown>,
      Object.freeze(dependencySettings)
    );
  };
}
