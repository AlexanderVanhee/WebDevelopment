const setup = () => {
  document.getElementById("replaceButton").addEventListener("click", performReplace);
  performReplace();
};

const performReplace = () => {
  const inputText = document.getElementById("inputText").value;
  const searchString = document.getElementById("searchString").value;
  const replacementString = document.getElementById("replacementString").value;
  const respectCase = document.getElementById("respectCase").checked;
  const onlyWords = document.getElementById("onlyWords").checked;

  document.getElementById("text").textContent = inputText.customReplace(
    searchString,
    replacementString,
    respectCase,
    onlyWords
  );
};





// Extend the actual object like in Java
String.prototype.customReplace = function (criteria, replacement, respectCase = true, onlyWords = false) {
  if (!criteria || !replacement) {
    console.error("customReplace requires both 'criteria' and 'replacement'.");
    return this.toString();
  }

  let string = this.toString();
  let result = "";
  let i = 0;

  while (i < string.length) {
    const potentialMatch = string.slice(i, i + criteria.length);
    const isMatch = potentialMatch.toLowerCase() === criteria.toLowerCase();

    if (isMatch && (!onlyWords || isWholeWord(string, i, criteria.length))) {
      const replacementValue = getReplacementWithCase(potentialMatch, replacement, respectCase);
      result += replacementValue;
      i += criteria.length;
    } else {
      result += string[i];
      i++;
    }
  }

  return result;
};

const capitalizeFirstLetter = (val) => {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
};

const isWordBoundary = (char) => !char || char.match(/[\s.,!?;]/); // "." "," space or nothing


const isWholeWord = (string, startIndex, criteriaLength) => {
  const before = string[startIndex - 1];
  const after = string[startIndex + criteriaLength];
  return isWordBoundary(before) && isWordBoundary(after);
};

const getReplacementWithCase = (original, replacement, respectCase) => {
  if (respectCase && original[0] === original[0].toUpperCase()) {
    return capitalizeFirstLetter(replacement);
  }
  return replacement.toLowerCase();
};


window.addEventListener("load", setup);
