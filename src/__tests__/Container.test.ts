import {
  Container,
  autowired,
  component,
  service,
  repository,
  postConstruct,
} from "../";

@repository("UserRepository")
class UserRepository {
  public get(): string {
    return "username";
  }

  public save(username: string): void {
    console.log(`Persist user: ${username}.`);
  }
}

@service("UserService")
class UserService {
  @autowired("UserRepository")
  private repository!: UserRepository;

  public getUser(): string {
    return this.repository.get();
  }

  public createUser(username: string): void {
    this.repository.save(username);
  }
}

describe("Container", () => {
  beforeEach(() => {
    Container.clear();
  });

  it("should throw an error if a component is not registered", () => {
    expect(() => Container.get("NonExistentComponent")).toThrow(
      "Component 'NonExistentComponent' not found."
    );
  });

  it("should return the same instance for singleton services", () => {
    const userService1 = Container.get<UserService>("UserService");
    const userService2 = Container.get<UserService>("UserService");
    expect(userService1).toBe(userService2);
  });

  it("should correctly inject dependencies", () => {
    const userService = Container.get<UserService>("UserService");
    expect(userService).toBeInstanceOf(UserService);
    expect((userService as any).repository).toBeInstanceOf(UserRepository);
  });

  it("should resolve circular dependencies", () => {
    @component("Circular1")
    class Circular1 {
      @autowired("Circular2")
      circular2!: Circular2;
    }

    @component("Circular2")
    class Circular2 {
      @autowired("Circular1")
      circular1!: Circular1;
    }

    const circular1 = Container.get<Circular1>("Circular1");
    expect(circular1).toBeDefined();
    expect(circular1.circular2).toBeDefined();
    expect(circular1.circular2.circular1).toBeDefined();
    expect(circular1.circular2.circular1).toBe(circular1);
  });

  it("should lazy-initialize dependencies", () => {
    @component("Lazy1", { lazy: true })
    class Lazy1 {
      static count = 0;

      @autowired("Lazy2")
      lazy2!: Lazy2;

      constructor() {
        Lazy1.count++;
      }
    }

    @component("Lazy2", { lazy: true })
    class Lazy2 {
      static count = 0;

      constructor() {
        Lazy2.count++;
      }
    }

    const lazy1 = Container.get<Lazy1>("Lazy1");
    expect(Lazy1.count).toBe(1);
    expect(Lazy2.count).toBe(0);

    // Access the dependency to trigger lazy initialization
    const lazy2 = lazy1.lazy2;
    expect(Lazy2.count).toBe(1);
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
    expect(Container["instances"].has("LazyComponent")).toBe(false);

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
