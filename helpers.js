//server-side validation for input fields
export const validateId = async (value, index) => {
    if (index == 1) {
      // Student ID
      if (typeof value !== 'string') {
        throw new Error("StudentID must be a string.");
      }
      const mregex = /^\d{7,}$/;
      if (!mregex.test(value.trim())) {
        throw new Error("StudentID is not valid. You must have at least a 7-digit numeric ID.");
      }
    } else if (index == 2) {
      // Age
      if (value < 0 || value > 120) {
        throw new Error("Age must be a valid number between 0 and 120.");
      }
  
    } else if (index == 3) {
      // Gender
      const options = ['Male', 'Female', 'Non-Binary', 'Other'];
      if (!options.includes(value)) {
        throw new Error("Gender must be one of: " + options.join(', '));
      }
  
    } else if (index == 4) {
      // Wake up time
      const timeRegex = /^\d{2}:\d{2}$/;
      if (!timeRegex.test(value)) {
        throw new Error("Wake-up time must be in HH:MM format.");
      }
  
    } else if (index == 5) {
      // Sleep time
      const timeRegex = /^\d{2}:\d{2}$/;
      if (!timeRegex.test(value)) {
        throw new Error("Sleep time must be in HH:MM format.");
      }
  
    } else if (index == 6) {
      // Cleanliness
      const options = ['Low', 'Moderate', 'High'];
      if (!options.includes(value)) {
        throw new Error("Cleanliness must be one of: " + options.join(', '));
      }
  
    } else if (index == 7) {
      // Guest policy
      const options = ['No guests', 'Only with notice', 'Open to guests'];
      if (!options.includes(value)) {
        throw new Error("Guest policy must be one of: " + options.join(', '));
      }
  
    } else if (index == 8) {
      // Noise tolerance
      const options = ['Low', 'Moderate', 'High'];
      if (!options.includes(value)) {
        throw new Error("Noise tolerance must be one of: " + options.join(', '));
      }
  
    } else if (index == 9) {
      if (!value) {
        throw new Error("Smoking/vaping preference must be a boolean.");
      }
  
    } else if (index == 10) {
      const options = ['None', 'Small animals', 'Any pets'];
      if (!options.includes(value)) {
        throw new Error("Pet tolerance must be one of: " + options.join(', '));
      }
  
    } else if (index == 11) {
      if (!value) {
        throw new Error("Shared room preference must be a boolean.");
      }
  
    } else if (index == 12) {
      if (value < 50 || value > 90) {
        throw new Error("Temperature must be a number between 50°F and 90°F.");
      }
  
    } else if (index == 13) {
      if (value < 1 || value > 10) {
        throw new Error("Social level must be a number between 1 and 10.");
      }
  
    } else if (index == 14) {
      if (value < 1 || value > 10) {
        throw new Error("Preferred roommate social level must be a number between 1 and 10.");
      }
  
    } else if (index == 15) {
      if (value < 0 || value > 120) {
        throw new Error("Preferred roommate age must be a valid number between 0 and 120.");
      }
  
    } else if (index == 16) {
      const options = ['Male', 'Female', 'Any'];
      if (!options.includes(value)) {
        throw new Error("Preferred roommate gender must be one of: " + options.join(', '));
      }
  
    } else if (index == 17) {
      const options = ['wakeUpTime', 'sleepTime', 'noiseTolerance', 'cleanliness', 'temperaturePreference', 'guestPolicy'];
      if (!Array.isArray(value) || value.length !== 2 || !value.every(v => options.includes(v))) {
        throw new Error("You must select exactly two valid most important preferences.");
      }
  
    } else if (index == 18) {
      const options = ['none', 'wakeUpTime', 'sleepTime', 'noiseTolerance', 'cleanliness', 'temperaturePreference', 'guestPolicy'];
      if (!options.includes(value)) {
        throw new Error("Least important preference must be one of: " + options.join(', '));
      }
  
    } else {
      throw new Error("Invalid field index.");
    }
  
    return true;
  };