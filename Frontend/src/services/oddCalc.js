const campea = (a) => {
  const j = parseFloat(a).toFixed(2)
  return j
}

const vice = (a) => {
  const j = parseFloat(a)
  let result = 0;

  if (j == 1.1) {
    result = j * 1.4
    return parseFloat(result).toFixed(2)
  } else if (j == 4.94) {
    result = j * 0.7
    return parseFloat(result).toFixed(2)
  } else if (j >= 3.02){
    result = j * 0.7
    return parseFloat(result).toFixed(2)
  } else if (j < 3.02){
    result = j * 0.8
    return parseFloat(result).toFixed(2)
  } else {
    return 3.02
  }
}

const penultimo = (a) => {
  const j = parseFloat(a)
  let result = 0;

    if (j == 1.1) {
    result = 4.94
    return parseFloat(result).toFixed(2)
  } else if (j == 4.94) {
    result = 1.1
    return parseFloat(result).toFixed(2)
  } else if (j >= 3.02) {
    result = j * Math.pow(0.85, 5)
    return parseFloat(result).toFixed(2)
  } else if (j < 3.02) {
    result = j * Math.pow(1.15, 5)
    return parseFloat(result).toFixed(2)
  }
}

const ultimo = (a) => {
  const j = parseFloat(a)
  let result = 0;

  if (j == 1.1) {
    result = 4.94
    return parseFloat(result).toFixed(2)
  } else if (j == 4.94) {
    result = 1.1
    return parseFloat(result).toFixed(2)
  } else if (j >= 3.02) {
    result = j * Math.pow(0.85, 7)
    return parseFloat(result).toFixed(2)
  } else if (j < 3.02) {
    result = j * Math.pow(1.15, 7)
    return parseFloat(result).toFixed(2)
  }
}

export default campea, vice, penultimo, ultimo;