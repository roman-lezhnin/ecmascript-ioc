/**
 * Marks a method to be called after the instance is constructed and dependencies are injected.
 */
export function postConstruct<This, Args extends any[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This) => void>
): void {
  context.addInitializer(function (this: This) {
    if (!(this as DependencyAware).__postConstructMethods__) {
      (this as DependencyAware).__postConstructMethods__ = [];
    }
    (this as DependencyAware).__postConstructMethods__!.push(
      context.name.toString()
    );
  });
}
