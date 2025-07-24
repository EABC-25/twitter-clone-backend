export const containsAnySpecialCharacter = (input: string): boolean => {
  const specialCharRegex = /[^a-zA-Z0-9]/;
  return specialCharRegex.test(input);
};

export const dateStringIsISO8601Valid = (input: string): boolean => {
  // Follows ISO 8601 format: yyyy-MM-dd
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  return dateRegex.test(input);
};

export const dateStringIsAValidPreviouslyPassedDate = (
  input: string
): boolean => {
  const dateStringArray = input.split("-");

  if (dateStringArray.length > 3) {
    return false;
  }

  const inputYear = Math.abs(parseInt(dateStringArray[0]));
  const inputMonth = Math.abs(parseInt(dateStringArray[1]));
  const inputDay = Math.abs(parseInt(dateStringArray[2]));
  const currYear = new Date().getFullYear();
  const currMonth = new Date().getMonth() + 1;
  const currDay = new Date().getDate();

  // check if date is valid by verifying if inputDay is within the number of days on the inputMonth (months with less than 31 days and during leap years)

  // APRIL, JUNE, SEPT, NOV
  const monthsNotThirtyOneDays = [4, 6, 9, 11];
  if (monthsNotThirtyOneDays.includes(inputMonth) && inputDay > 30) {
    return false;
  }

  if (inputMonth === 2) {
    // leap year if year is divisible by 4 but not 100 except if its 400 (because 400 is divisible by 4)
    const yearIsLeapYear =
      inputYear % 400 === 0 || (inputYear % 100 !== 0 && inputYear % 4 === 0);

    if (yearIsLeapYear && inputDay > 29) {
      return false;
    } else if (!yearIsLeapYear && inputDay > 28) {
      return false;
    }
  }

  // check if input date is greater than current date
  if (inputYear > currYear) {
    return false;
  }

  if (inputYear === currYear) {
    if (inputMonth > currMonth) {
      return false;
    }

    if (inputMonth === currMonth) {
      if (inputDay > currDay) {
        return false;
      }
    }
  }
  return true;
};
