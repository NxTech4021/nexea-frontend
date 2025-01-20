const testBind = (a) => {
  console.log(a);
};

const b = testBind.bind(this, 30);

const z = b.bind(this, 10);

z();
