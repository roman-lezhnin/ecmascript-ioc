import { Container } from "../Container";
/**
 * Marks a class as a component and registers it with the DI container.
 * @param name - custom name for the dependency.
 * @param settings - The settings of the component: whether the component should be lazy-initialized.
 */
export function component<This, Args extends any[]>(
  name: string | symbol,
  settings: ComponentSettings = { lazy: false }
) {
  return function (
    target: new (...args: Args) => This,
    context: ClassDecoratorContext<new (...args: Args) => This>
  ): void {
    if (!name) {
      throw new Error(`Empty component name`);
    }
    Container.register(name, target as ComponentConstructor<unknown>, settings);
  };
}
