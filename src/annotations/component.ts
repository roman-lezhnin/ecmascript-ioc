import { Container } from "../Container";
/**
 * Marks a class as a component and registers it with the DI container.
 * @param name - custom name for the dependency.
 * @param settings - The settings of the component:
 * whether the component should be lazy-initialized or in Singleton/Prototype scope.
 */
export function component<This, Args extends unknown[]>(
  name: string | symbol,
  settings?: Partial<ComponentSettings>
) {
  return function (target: new (...args: Args) => This): void {
    if (!name) {
      throw new Error(`Empty component name`);
    }
    const componentSettings: ComponentSettings = {
      lazy: false,
      scope: "Singleton",
    };
    if (typeof settings?.lazy === "boolean") {
      componentSettings.lazy = settings.lazy;
    }
    if (settings?.scope) {
      componentSettings.scope = settings.scope;
    }
    Container.register(
      name,
      target as ComponentConstructor<unknown>,
      Object.seal(componentSettings)
    );
  };
}
