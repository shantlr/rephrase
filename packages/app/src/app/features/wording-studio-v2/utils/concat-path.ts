export const concatPath = (basePath: string, subPath: string) => {
  if (!basePath) {
    return subPath;
  }
  if (!subPath) {
    return basePath;
  }
  return `${basePath}.${subPath}`;
};
