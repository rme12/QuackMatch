
export const validateId = async (studentID) => {
    if (typeof studentID !== 'string') {
      throw new Error("StudentID must be a string.");
    }
  
    const mregex = /^\d{7,}$/;
  
    if (!mregex.test(studentID.trim())) {
      throw new Error("StudentID is not valid. You must have at least a 7-digit numeric ID.");
    }
  
    return true;
  };
