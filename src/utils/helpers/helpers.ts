export const containsAnySpecialCharacter = (input: string): boolean => {
  const specialCharRegex = /[^a-zA-Z0-9]/;
  return specialCharRegex.test(input);
};
