import { DiContainer, autowired, component } from "..";

describe("Container scope tests", () => {
  @component("SingletonService")
  class SingletonService {
    main() {
      console.log("SingletonService");
    }
  }

  @component("PrototypeService", { scope: "Prototype" })
  class PrototypeService {
    main() {
      console.log("PrototypeService");
    }
  }

  @component("DependentService")
  class DependentService {
    @autowired("SingletonService")
    singletonService!: SingletonService;

    @autowired("PrototypeService")
    prototypeService!: PrototypeService;
  }

  class InvalidScopeService {
    main() {
      console.log("InvalidScopeService");
    }
  }

  beforeEach(() => {
    DiContainer.clear();
  });

  it("should register a singleton component successfully", () => {
    const component =
      DiContainer.getDependency<SingletonService>("SingletonService");
    expect(component).toBeDefined();
    expect(component.constructor).toBe(SingletonService);
  });

  it("should register a prototype component successfully", () => {
    const component =
      DiContainer.getDependency<PrototypeService>("PrototypeService");
    expect(component).toBeDefined();
    expect(component.constructor).toBe(PrototypeService);
  });

  it("should inject singleton dependencies correctly", () => {
    const dependent =
      DiContainer.getDependency<DependentService>("DependentService");
    expect(dependent.singletonService).toBeInstanceOf(SingletonService);

    const singleton1 =
      DiContainer.getDependency<SingletonService>("SingletonService");
    const singleton2 = dependent.singletonService;
    expect(singleton1).toBe(singleton2);
  });

  it("should inject prototype dependencies correctly", () => {
    const dependent1 =
      DiContainer.getDependency<DependentService>("DependentService");
    const dependent2 =
      DiContainer.getDependency<DependentService>("DependentService");

    expect(dependent1.prototypeService).toBeInstanceOf(PrototypeService);
    expect(dependent2.prototypeService).toBeInstanceOf(PrototypeService);
    expect(dependent1.prototypeService).toBe(dependent2.prototypeService);
  });

  it("should return the same instance for singleton components", () => {
    const instance1 =
      DiContainer.getDependency<SingletonService>("SingletonService");
    const instance2 =
      DiContainer.getDependency<SingletonService>("SingletonService");
    expect(instance1).toBe(instance2);
  });

  it("should return different instances for prototype components", () => {
    const instance1 =
      DiContainer.getDependency<PrototypeService>("PrototypeService");
    const instance2 =
      DiContainer.getDependency<PrototypeService>("PrototypeService");
    expect(instance1).not.toBe(instance2);
  });

  it("should allow multiple instances of prototype dependencies", () => {
    @component("MultiPrototypeDependentService")
    class MultiPrototypeDependentService {
      @autowired("PrototypeService")
      dependency1!: PrototypeService;

      @autowired("PrototypeService")
      dependency2!: PrototypeService;
    }

    const instance = DiContainer.getDependency<MultiPrototypeDependentService>(
      "MultiPrototypeDependentService"
    );
    expect(instance.dependency1).toBeInstanceOf(PrototypeService);
    expect(instance.dependency2).toBeInstanceOf(PrototypeService);
    expect(instance.dependency1).not.toBe(instance.dependency2);
  });

  it("should throw an error when registering a component with an invalid scope", () => {
    expect(() => {
      DiContainer.registerDependency(
        "InvalidScopeService",
        InvalidScopeService,
        {
          lazy: false,
          scope: "Invalid",
        } as any
      );
    }).toThrow("Unknown scope 'Invalid' for dependency 'InvalidScopeService'.");
  });
});
