/**
 * Marks a property to be autowired by the DI container.
 * @param name - custom name of the dependency to inject.
 */
export function autowired(name: string) {
  return function decorator<This, Value>(
    target: undefined,
    context: ClassFieldDecoratorContext<This, Value>
  ): void {
    if (!name) {
      throw new Error(`Empty dependency name`);
    }
    context.addInitializer(function (this: This) {
      if (!(this as DependencyAware).__dependencies__) {
        (this as DependencyAware).__dependencies__ = {};
      }
      (this as DependencyAware).__dependencies__![context.name] = name;
    });
  };
}
