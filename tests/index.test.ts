test('should return a correct trend line', () => {
  const data = [
    { y: 2, x: 1 },
    { y: 4, x: 2 },
    { y: 5, x: 3 },
    { y: 4, x: 4 },
    { y: 5, x: 5 },
  ];

  expect(true).toMatchObject({ slope: 0.6, yStart: 2.2 });
});
