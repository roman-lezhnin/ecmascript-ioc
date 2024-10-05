export class SingletonScopeHandler implements DependencyScopeHandler {
  private readonly instances = new Map<
    DependencyConstructor<unknown>,
    unknown
  >();

  create<T>(constructor: DependencyConstructor<T>): T {
    if (!this.instances.has(constructor)) {
      const instance = new constructor();
      this.instances.set(constructor, instance);
      return instance;
    }
    return this.instances.get(constructor) as T;
  }
}

export class PrototypeScopeHandler implements DependencyScopeHandler {
  create<T>(constructor: DependencyConstructor<T>): T {
    return new constructor();
  }
}
