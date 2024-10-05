import { DiContainer, autowired, component } from "..";

describe("Container advanced tests", () => {
  beforeEach(() => {
    DiContainer.clear();
  });

  // it("should resolve circular dependencies", () => {
  //   @component("Circular1")
  //   class Circular1 {
  //     @autowired("Circular2")
  //     circular2!: Circular2;
  //   }

  //   @component("Circular2")
  //   class Circular2 {
  //     @autowired("Circular1")
  //     circular1!: Circular1;
  //   }

  //   const circular1 = Container.getDependency<Circular1>("Circular1");
  //   expect(circular1).toBeDefined();
  //   expect(circular1.circular2).toBeDefined();
  //   expect(circular1.circular2.circular1).toBeDefined();
  //   expect(circular1.circular2.circular1).toBe(circular1);
  // });

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

    const lazy1 = DiContainer.getDependency<Lazy1>("Lazy1");
    expect(Lazy1.count).toBe(1);
    expect(Lazy2.count).toBe(0);

    // Access the dependency to trigger lazy initialization
    const lazy2 = lazy1.lazy2;
    expect(Lazy2.count).toBe(1);
  });
});
