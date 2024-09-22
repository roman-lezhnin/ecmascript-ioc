import { Container, autowired, service, repository } from "..";

describe("Container base tests", () => {
  const IoC = {
    repository: Symbol.for("UserRepository"),
    service: Symbol.for("UserService"),
  };

  @repository(IoC.repository)
  class UserRepository {
    get(): string {
      return "username";
    }

    save(username: string): void {
      console.log(`Persist user: ${username}.`);
    }
  }

  @service(IoC.service)
  class UserService {
    @autowired(IoC.repository)
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

  it("should correctly inject dependencies", () => {
    const userService = Container.get<UserService>(IoC.service);
    expect(userService).toBeInstanceOf(UserService);
    expect(userService.repository).toBeInstanceOf(UserRepository);
  });

  it("should throw an error when registering a component that is already registered", () => {
    expect(() => {
      Container.register(IoC.service, UserService, {
        lazy: false,
        scope: "Singleton",
      });
    }).toThrow(`Component '${IoC.service.toString()}' is already registered.`);
  });

  it("should throw an error if a component is not registered", () => {
    expect(() => Container.get("NonExistentComponent")).toThrow(
      "Component 'NonExistentComponent' not found."
    );
  });
});
