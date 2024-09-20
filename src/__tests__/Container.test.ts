import { Container, autowired, component, service, repository } from "../";

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
    @component("Lazy1")
    class Lazy1 {
      static count = 0;

      @autowired("Lazy2")
      lazy2!: Lazy2;

      constructor() {
        Lazy1.count++;
      }
    }

    @component("Lazy2")
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
});
