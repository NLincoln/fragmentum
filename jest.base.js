module.exports = fileName => ({
  verbose: true,
  moduleNameMapper: {
    fragmentum: fileName
  },
  coveragePathIgnorePatterns: ["<rootDir>/tests/*"],
  coverageReporters: ["text-summary", "lcov"]
});
