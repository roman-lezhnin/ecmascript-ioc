import { Container, autowired, component, postConstruct } from "..";

describe("Container @postConstruct tests", () => {
  beforeEach(() => {
    Container.clear();
  });

  it("should call @postConstruct methods after dependencies are injected", () => {
    @component("TestComponent")
    class TestComponent {
      initialized = false;

      @autowired("DependencyComponent")
      dependency!: DependencyComponent;

      @postConstruct
      private init() {
        this.initialized = true;
      }
    }

    @component("DependencyComponent")
    class DependencyComponent {
      value = 42;
    }

    const testInstance = Container.get<TestComponent>("TestComponent");

    // Verify that the postConstruct method was called
    expect(testInstance.initialized).toBe(true);

    // Verify that dependencies are injected before postConstruct is called
    expect(testInstance.dependency).toBeDefined();
    expect(testInstance.dependency.value).toBe(42);
  });

  it("should handle multiple @postConstruct methods", () => {
    @component("MultiPostConstructComponent")
    class MultiPostConstructComponent {
      initializedSteps: string[] = [];

      @postConstruct
      firstInit() {
        this.initializedSteps.push("first");
      }

      @postConstruct
      secondInit() {
        this.initializedSteps.push("second");
      }
    }

    const instance = Container.get<MultiPostConstructComponent>(
      "MultiPostConstructComponent"
    );

    expect(instance.initializedSteps).toEqual(["first", "second"]);
  });

  it("@postConstruct should work with lazy-initialized components", () => {
    @component("LazyComponent", { lazy: true })
    class LazyComponent {
      initialized = false;

      @postConstruct
      init() {
        this.initialized = true;
      }
    }

    // LazyComponent should not be instantiated until accessed
    expect(Container["singletons"].has("LazyComponent")).toBe(false);

    const instance = Container.get<LazyComponent>("LazyComponent");
    expect(instance.initialized).toBe(true);
  });

  it("@postConstruct methods should not be called before dependencies are injected", () => {
    @component("DependentComponent2")
    class DependentComponent2 {
      dependencyValue = 0;

      @autowired("DependencyComponent2")
      dependency!: DependencyComponent2;

      @postConstruct
      init() {
        this.dependencyValue = this.dependency.value;
      }
    }

    @component("DependencyComponent2")
    class DependencyComponent2 {
      value = 100;
    }

    const instance = Container.get<DependentComponent2>("DependentComponent2");
    expect(instance.dependencyValue).toBe(100);
  });

  it("should handle circular dependencies with @postConstruct methods", () => {
    @component("Circular3")
    class Circular3 {
      initialized = false;

      @autowired("Circular4")
      circular4!: Circular4;

      @postConstruct
      init() {
        this.initialized = true;
      }
    }

    @component("Circular4")
    class Circular4 {
      initialized = false;

      @autowired("Circular3")
      circular1!: Circular3;

      @postConstruct
      init() {
        this.initialized = true;
      }
    }

    const circular3 = Container.get<Circular3>("Circular3");
    expect(circular3.initialized).toBe(true);
    expect(circular3.circular4.initialized).toBe(true);
    expect(circular3.circular4.circular1).toBe(circular3);
  });
});
