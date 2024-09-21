import { Container, autowired, service, repository } from "..";

describe("Container base tests", () => {
  @repository("UserRepository")
  class UserRepository {
    get(): string {
      return "username";
    }

    save(username: string): void {
      console.log(`Persist user: ${username}.`);
    }
  }

  @service("UserService")
  class UserService {
    @autowired("UserRepository")
    repository!: UserRepository;

    getUser(): string {
      return this.repository.get();
    }

    createUser(username: string): void {
      this.repository.save(username);
    }
  }

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
    expect(userService.repository).toBeInstanceOf(UserRepository);
  });
});
