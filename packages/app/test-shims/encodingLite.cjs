function getBOMEncoding() {
  return null;
}

function labelToName(label) {
  if (!label) {
    return null;
  }
  const normalized = String(label).toLowerCase().replace(/[_-]/g, '');
  if (normalized === 'utf8') {
    return 'UTF-8';
  }
  return String(label);
}

module.exports = {
  getBOMEncoding,
  labelToName,
};
